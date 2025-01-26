$(document).ready(function() {

    getAssociatedPlaces(function() {
        $('#fetch_data').click();
    });

    $('#fetch_data').click(function(){
        getPatientData(0, 50);
    });

    $('#load_more').on('click', function(){
        var start = parseInt($(this).attr('offset'));
        getPatientData(start, 50);
    });
    
});