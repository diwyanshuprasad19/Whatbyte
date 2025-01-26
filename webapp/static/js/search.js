$(document).ready(function() {

    var patient_ids = getURLParam('patient_ids');

    $('#search-patient').val(patient_ids);
    $('.empty-message').show();
    if (patient_ids && patient_ids != ''){
        getPatientsByIds(patient_ids);
    }

    $('#fetch_data').click(function(){
        patient_ids = $('#search-patient').val().trim();
        $('.empty-message').show();
        if (patient_ids && patient_ids != '') {
            getPatientsByIds(patient_ids);
        } else {
            alert("Please enter atleast 1 Patient ID in the search box.");
        }
    });
    
});