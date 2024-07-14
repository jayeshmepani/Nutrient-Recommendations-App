$(document).ready(function () {
    $('#nutrient-form').submit(function (event) {
        event.preventDefault();

        // Gather form data
        var formData = {
            'age': $('#age').val(),
            'gender': $('#gender').val(),
            'height': $('#height').val(),
            'weight': $('#weight').val(),
            'activity_level': $('#activity_level').val(),
            'pregnancy_or_lactation': $('#pregnancy_or_lactation').val(),
            'health_condition': $('#health_condition').val(),
            'dietary_preferences': $('#dietary_preferences').val()
        };

        // Send AJAX POST request
        $.ajax({
            type: 'POST',
            url: '/get_nutrient_recommendations', 
            contentType: 'application/json',
            data: JSON.stringify(formData),
            beforeSend: function() {
                $('#recommendations').html('<p>Loading recommendations...</p>');
            },
            success: function (response) {
                $('#recommendations').html(response.recommendations);
            },
            error: function (error) {
                console.log(error);
            }
        });
    });
});