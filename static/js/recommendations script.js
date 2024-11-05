const recommendationsDiv = document.getElementById('recommendations');

function createItem(text, className = '') {
    const div = document.createElement('div');
    div.textContent = text;
    if (className) {
        div.classList.add(className);
    }
    return div;
}

function renderJson(obj, container, indentLevel = 0) {
    if (!container) {
        console.error('Container element is undefined or null.');
        return;
    }

    // Check if obj is empty or undefined
    if (!obj || Object.keys(obj).length === 0) {
        const emptyDiv = createItem('No data available', 'empty-message');
        container.appendChild(emptyDiv);
        return;
    }

    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            const categoryDiv = createItem(key, 'category');
            categoryDiv.style.marginLeft = `${indentLevel * 20}px`;
            container.appendChild(categoryDiv);
            renderJson(obj[key], container, indentLevel + 1); // Use the same container
        } else {
            const itemDiv = createItem(`${key}: ${obj[key]}`, 'item');
            itemDiv.style.marginLeft = `${indentLevel * 20}px`;
            container.appendChild(itemDiv);
        }
    }
}
