class NutriApp {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.downloadToken = null;
        this.init();
    }

    init() {
        document.getElementById('nextBtn').addEventListener('click', () => this.handleNext());
        document.getElementById('prevBtn').addEventListener('click', () => this.handlePrev());
        document.getElementById('nutrient-form').addEventListener('submit', (e) => this.handleFormSubmit(e));
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(link.dataset.section);
            });
        });

        document.querySelectorAll('.selection-card').forEach(card => {
            card.addEventListener('click', () => this.handleSelectionCard(card));
        });
        document.querySelectorAll('.tag').forEach(tag => {
            tag.addEventListener('click', () => this.handleAddTag(tag.textContent));
        });
        document.querySelector('#gender')?.addEventListener('change', () => this.togglePregnancyField());

        document.getElementById('compareForm').addEventListener('submit', e => this.handleCompare(e));

        document.getElementById('downloadBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleDownload();
        });

        this.loadThemePreference();
        new CustomDropdownHandler(); 
    }

    switchSection(sectionId) {
        document.querySelectorAll('.section.active').forEach(s => s.classList.remove('active'));
        document.getElementById(sectionId)?.classList.add('active');

        document.querySelectorAll('.nav-link.active').forEach(l => l.classList.remove('active'));
        document.querySelector(`.nav-link[data-section="${sectionId}"]`)?.classList.add('active');

        if (sectionId === 'results' || sectionId === 'compare') {
            window.scrollTo({ top: document.getElementById(sectionId).offsetTop - 80, behavior: 'smooth' });
        }
    }

    handleNext() {
        if (!this.validateStep(this.currentStep)) {
            this.showToast('Please fill out all required fields.', 'error');
            return;
        }
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateFormState();
        }
    }

    handlePrev() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateFormState();
        }
    }

    updateFormState() {
        document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
        document.querySelector(`.form-step[data-step="${this.currentStep}"]`).classList.add('active');

        const progress = ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
        document.getElementById('progressBar').style.width = `${progress}%`;

        document.getElementById('prevBtn').style.display = this.currentStep > 1 ? 'inline-flex' : 'none';
        document.getElementById('nextBtn').style.display = this.currentStep < this.totalSteps ? 'inline-flex' : 'none';
        document.getElementById('submitBtn').style.display = this.currentStep === this.totalSteps ? 'inline-flex' : 'none';
    }

    validateStep(step) {
        const currentStepEl = document.querySelector(`.form-step[data-step="${step}"]`);
        const inputs = currentStepEl.querySelectorAll('input[required]');
        for (let input of inputs) {
            if (!input.value.trim()) {
                input.focus();
                input.style.borderColor = 'var(--error-color)';
                return false;
            } else {
                input.style.borderColor = '';
            }
        }
        return true;
    }

    handleSelectionCard(card) {
        const parentGrid = card.closest('.selection-grid');
        const targetInputId = parentGrid.id.replace('-grid', '');
        const targetInput = document.getElementById(targetInputId);

        parentGrid.querySelectorAll('.selection-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        targetInput.value = card.dataset.value;
        targetInput.dispatchEvent(new Event('change'));
    }

    handleAddTag(tagText) {
        const textarea = document.getElementById('health_condition');
        if (textarea.value.toLowerCase().includes(tagText.toLowerCase())) return;
        textarea.value = textarea.value ? `${textarea.value}, ${tagText}` : tagText;
    }

    togglePregnancyField() {
        const gender = document.getElementById('gender').value;
        const pregnancyContainer = document.getElementById('pregnancyContainer');
        if (gender === 'Female') {
            pregnancyContainer.style.display = 'block';
        } else {
            pregnancyContainer.style.display = 'none';
            document.getElementById('pregnancy_or_lactation').value = "None";
            const trigger = pregnancyContainer.querySelector('.dropdown-trigger span');
            if (trigger) trigger.innerHTML = '<i class="fas fa-times-circle"></i> None';
        }
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        if (!this.validateStep(this.totalSteps)) {
            this.showToast('Please fill out all required fields.', 'error');
            return;
        }

        const formData = {
            age: document.getElementById('age').value,
            gender: document.getElementById('gender').value,
            height: document.getElementById('height').value,
            weight: document.getElementById('weight').value,
            activity_level: document.getElementById('activity_level').value,
            pregnancy_or_lactation: document.getElementById('pregnancy_or_lactation').value,
            health_condition: document.getElementById('health_condition').value,
            dietary_preferences: document.getElementById('dietary_preferences').value
        };

        this.switchSection('results');
        this.showLoading(true, 'results-content', 'Analyzing your profile & generating report...');

        try {
            const response = await axios.post('/get_nutrient_recommendations', formData);
            document.getElementById('results-content').innerHTML = response.data.recommendations;

            this.downloadToken = response.data.download_token;
            const downloadBtn = document.getElementById('downloadBtn');
            downloadBtn.style.display = 'inline-flex';

            this.showToast('Report generated successfully!', 'success');
        } catch (error) {
            console.error(error);
            const errorMessage = error.response?.data?.error || 'Failed to fetch recommendations.';
            document.getElementById('results-content').innerHTML = `<div class="no-data error"><i class="fas fa-exclamation-triangle"></i><h3>Error</h3><p>${errorMessage}</p></div>`;
            this.showToast('An error occurred.', 'error');
        }
    }

    async handleCompare(event) {
        event.preventDefault();
        const food1 = document.getElementById('food1').value.trim();
        const food2 = document.getElementById('food2').value.trim();

        if (!food1 || !food2) {
            this.showToast('Please enter two foods to compare.', 'error');
            return;
        }

        this.showLoading(true, 'comparison-results', 'Comparing foods...');

        try {
            const response = await axios.post('/compare_foods', { foods: [food1, food2] });
            document.getElementById('comparison-results').innerHTML = `<div class="table-responsive">${response.data.comparison}</div>`;
            this.showToast('Comparison successful!', 'success');
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to compare foods.';
            document.getElementById('comparison-results').innerHTML = `<div class="no-data error"><i class="fas fa-exclamation-triangle"></i><h3>Error</h3><p>${errorMessage}</p></div>`;
            this.showToast('Comparison failed.', 'error');
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        document.getElementById('themeToggle').className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    loadThemePreference() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.getElementById('themeToggle').className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    showLoading(isLoading, containerId, message = 'Loading...') {
        const container = document.getElementById(containerId);
        if (isLoading) {
            container.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>${message}</p>
                </div>`;
        }
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const iconEl = toast.querySelector('.toast-icon');
        const messageEl = toast.querySelector('.toast-message');
        const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };

        iconEl.className = `toast-icon fas ${icons[type]}`;
        messageEl.textContent = message;
        toast.className = `toast show ${type}`;
        setTimeout(() => toast.classList.remove('show'), 4000);
    }

    toggleCardBody(cardId) {
        const card = document.getElementById(cardId);
        card.classList.toggle('open');
    }

    handleDownload() {
        if (this.downloadToken) {
            window.location.href = `/download/${this.downloadToken}`;
        } else {
            this.showToast('No report available to download.', 'error');
        }
    }
}

class CustomDropdownHandler {
    constructor() { this.init(); }
    init() {
        document.querySelectorAll('.custom-dropdown').forEach(dd => this.setupDropdown(dd));
        document.addEventListener('click', () => this.closeAllDropdowns());
    }
    setupDropdown(dropdownElement) {
        const trigger = dropdownElement.querySelector('.dropdown-trigger');
        const menu = dropdownElement.querySelector('.dropdown-menu');
        const options = menu.querySelectorAll('li');
        const hiddenInput = document.getElementById(dropdownElement.dataset.targetInput);
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeAllDropdowns(dropdownElement);
            dropdownElement.classList.toggle('open');
        });
        options.forEach(option => {
            option.addEventListener('click', () => {
                hiddenInput.value = option.dataset.value;
                trigger.querySelector('span').innerHTML = option.innerHTML;
                menu.querySelector('.selected')?.classList.remove('selected');
                option.classList.add('selected');
                hiddenInput.dispatchEvent(new Event('change'));
            });
        });
    }
    closeAllDropdowns(exceptThisOne = null) {
        document.querySelectorAll('.custom-dropdown.open').forEach(dd => {
            if (dd !== exceptThisOne) dd.classList.remove('open');
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new NutriApp();
});