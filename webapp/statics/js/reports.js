function getFilter(domElement){
    var value = $('#' + domElement).val();
    if (value == null) {
        return 'null';
    } else if (value.length == $('#' + domElement + ' option').length){
        return '';
    } else {
        return value.join();
    }
}


function getQueryString(){
    
    var queryString = '';

    var place_ids = $('#place-selector').val() ? $('#place-selector').val().join() : '';
    if (place_ids.length == 0) {
        alert('Please select at least one facility to view the reports.');
        return false;
    }
    
    queryString += 'events=' + getFilter('filter-patient-status') + '&';
    queryString += 'cervix_dilatations=' + getFilter('filter-cervix-dilatation') + '&';
    queryString += 'mother_statuses=' + getFilter('filter-mother-status') + '&';
    queryString += 'genders=' + getFilter('filter-gender') + '&';
    queryString += 'weights=' + getFilter('filter-child-weight') + '&';
    queryString += 'child_statuses=' + getFilter('filter-child-status') + '&';
    queryString += 'delivery_types=' + getFilter('filter-delivery-type') + '&';
    queryString += 'place_ids=' + $('#place-selector').val().join() + '&';
    queryString += 'keyar_data=' + getFilter('filter-keyar-data') + '&';

    queryString += 'from_time=' + $('#daterange').data('daterangepicker').startDate.format('X') + '&';
    queryString += 'to_time=' + $('#daterange').data('daterangepicker').endDate.format('X') + '&';

    return queryString;
}



$(document).ready(function(){
    
    function getReportData(start, count){
        var queryString = getQueryString();
        if(queryString) {
            queryString += '&start=' + start.toString() + '&count=' + count.toString();
            callAjax(window.location.origin + '/nurse/patients/?' + queryString, "GET", data={}, function(response){
                if(response['success']){
                    var append = false;
                    if(response['data']['response']['start'] != 0){
                        append = true;
                    }
                    setPatientData(response, append);
                }
            });
        }
    }

    $('#get_report').on('click', function(){
        getReportData(0, 50);
    });

    $('#reports_load_more').on('click', function(){
        var start = parseInt($(this).attr('offset'));
        getReportData(start, 50);
    });

    getAssociatedPlaces(function() {
        $('#get_report').click();
    });

    $('#download_report').on('click', function(){
        var queryString = getQueryString();
        callAjax(window.location.origin + '/nurse/patients/?' + queryString, "GET", data={}, function(response){
            if(response['success']){
                downloadReport(response);
            }
        });
    });
});
