
function setTabletData(callback) {
    var place_ids = $('#place-selector').val().join();
    var url = window.location.origin + '/tesla/tablet-vitals/?place_ids=' + place_ids;
    callAjax(url, "GET", {}, function(response){
        if(response['success']){
            setTabletVitalsInfo(response["data"]);
            $('#page-wrapper').unmask();
        } else {
            alert("Something went wrong.");
            $('#page-wrapper').unmask();
        }
        callback();
    });
}


function setTabletVitalsInfo(data) {
    $.each(data["response"], function(index, value) {
        value.last_data_received = getReadableTime(value.modified_at);
        value.alias = getData(value.alias);
    });
    var context = {
        'tablets': data["response"]
    };
    var source = $("#tablet-info-list").html();
    var template = Handlebars.compile(source);
    var html = template(context);
    $('#tabletVitalsList').html(html);
}

$(document).ready(function(){
    getAssociatedPlaces(function() {
        $('#fetch_data').click();
    });
    $('#fetch_data').click(function() {
        setTabletData(function(){

        });
    });
});