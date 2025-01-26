$(document).ready(function(){
    var patient_id = getParam('patient_id');
    var graph_type = getParam('graph_type');
    $('.hc-graph').hide();
    $('body').wait();
    $.ajax({
        type: "GET",
        url: window.location.origin + '/api/patient-data/?patient_id=' + patient_id,
        success: function(data) {
            response = $.parseJSON(data);
            var html = '';
            if(response.length > 0){
                $('.no-data').hide();
                drawGraphs(response, graph_type);
            } else {
                $('.hc-graph').hide();
                $('.no-data').show();
            }
            $('body').unwait();
        }
    });
});