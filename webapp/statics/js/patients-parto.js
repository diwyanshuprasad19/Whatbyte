function checkUndefined(object, value){
    if (_.get(object, value, false)){
        return _.get(object, value);
    } else {
        return valueNotAvailable;
    }
}

function getAge(age){
    if (age == 0 || typeof(age) === 'undefined'){
        return valueNotAvailable;
    } else {
        return age;
    }
}

function getData(param){
    if (typeof(param) === 'undefined' || param == ""){
        return valueNotAvailable;
    } else {
        return param;
    }
}

function getReadableDate(date_string){
    if(typeof(date_string) === 'undefined' || date_string == '' || parseInt(date_string) == maxTime || parseInt(date_string) == 0){
        return valueNotAvailable;
    } else {
        return moment(date_string*1000).format('DD MMM YYYY');
    }
}

function getReadableTime(date_string){
    if(typeof(date_string) === 'undefined' || date_string == '' || parseInt(date_string) == maxTime || parseInt(date_string) == 0){
        return valueNotAvailable;
    } else {
        return moment(date_string*1000).format('DD MMM YYYY hh:mm A');
    }
}

function getReadableEventTime(events, event){
    i = 0;
    while(i < events.length){
        if (event == events[i]['event']){
            var time = events[i]['event_time'];
            if(time == '' || parseInt(time) == 0 || parseInt(time) == maxTime){
                return valueNotAvailable;
            } else {
                return moment(time*1000).format('DD MMM YYYY hh:mm A');
            }
        }
        i++;
    }
    return valueNotAvailable;
}

function getReadableTimeOnly(date_string){
    if(date_string =='' || parseInt(date_string) == maxTime || parseInt(date_string) == 0){
        return valueNotAvailable;
    } else {
        return moment(date_string*1000).format('hh:mm A');
    }
}

function getReadableStatus(current_status){
    
    switch(current_status){
        
        case 'completed': 
            return 'Discharged';
        
        case 'intra_partum_process':
            return 'Intra Partum Process';
        
        case 'post_partum_process':
            return 'Post Delivery Process';

        default:
            return '-';

    }
}

function getImageUrl(path){
    // var splitter = path.split('/');
    // var file_name = splitter[splitter.length-1];
    // return window.location.origin + '/statics/uploads/' + file_name;
    return window.location.origin
}

function getReferralDetails(events, places){
    var refer_details = [];
    $.each(events, function(index, value){
        if(value['event'] == 'referred_before_delivery' || value['event'] == 'referred_after_delivery'){
            var data = {};
            var refer_message = '';
            $.each(value['refer_messages'], function(inner_index, message){
                refer_message += (inner_index+1) + ') ' + message['refer_message'] + '<br/>';
            });
            data['refer_messages'] = refer_message;
            data['event_id'] = value['id']; 
            data['referred_place_id'] = checkUndefined(value, 'refer_detail.referred_place_id');
            data['place_id'] = checkUndefined(value, 'place_id');
            data['referred_place_name'] = checkUndefined(places, checkUndefined(value, 'refer_detail.referred_place_id') + '.name');
            var referral_facility_other = _.get(value, 'refer_detail.referred_place_other');
            if (referral_facility_other != '' && data['referred_place_name'] == '-') {
                data['referred_place_name'] = referral_facility_other;
            }
            data['place_name'] = checkUndefined(places, data['place_id'].toString() + '.name');
            refer_details.push(data);
        }
    });
    return refer_details;
}

function showPlaceData(){
    var place_id = $('#place-selector').val();
    var patient_numbers = {
        'registered': 0,
        'completed': 0,
        'referred': 0,
        'in_process': 0
    };
    $('.patient-block').each(function(){
        if($(this).attr('place_id') != place_id && place_id != 'all'){
            $(this).hide();
        } else {
            patient_numbers['registered']++;
            patient_numbers[$(this).attr('status')]++;
        }
    });

    $('#patient_registered').html(patient_numbers['registered']);
    $('#patient_completed').html(patient_numbers['completed']);
    $('#patient_referred').html(patient_numbers['referred']);
    $('#patient_in_process').html(patient_numbers['in_process']);

}

function showSelectiveData(){

    $('#page-wrapper').mask('Loading...');

    var status = $('.panel-active').attr('status');
    
    
    $('.patient-block').hide();
    
    if(status == 'registered'){
        $('.patient-block').show();
    } else {
        $('.patient-block').each(function(){
            if($(this).attr('status') == status){
                $(this).show();
            }
        });
    }

    // showPlaceData();
    $('#page-wrapper').unmask();
}


function getTimelineDOM(events, data){
    var timelineStatus = {
        'registered': 'Admitted', 
        'delivered': 'Delivered', 
        'referred_before_delivery': 'Referred', 
        'referred_after_delivery': 'Referred', 
        'referral_accepted': 'Received',
        'referral_cancelled': 'Cancelled', 
        'completed': 'Discharged'
    };
    var tooltipRequired = ['referred_before_delivery', 'referred_after_delivery'];
    var context = globalContext;
    var eventsHtml = '';

    var registered_time = 0;
    var delivered_time = 0;
    //Check if registration and delivery happened at the same time
    $.each(events, function(index, value){
        if (typeof(timelineStatus[value.event]) !== 'undefined' && value.event == 'registered'){ 
            registered_time = value.event_time;
        }
    });
    $.each(events, function(index, value){
        if (typeof(timelineStatus[value.event]) !== 'undefined' && value.event == 'delivered'){ 
            delivered_time = checkUndefined(data, 'delivery_detail.child_details.0.delivery_time');
            if (delivered_time == valueNotAvailable){
                value.event_time = 0;
                value.event = undefined;
            } else {
                value.event_time = delivered_time;
            }
        }
    });

    events.sort(function(a, b) {
        return a.event_time - b.event_time;
    });

    $.each(events, function(index, value){

        if (typeof(timelineStatus[value.event]) !== 'undefined'){
            context['status'] = timelineStatus[value.event];
            context['statusTime'] = getReadableTime(value.event_time);
            context['statusClass'] = value.event;
            context['tooltipTarget'] = value.id;
            if (tooltipRequired.indexOf(value.event) !== -1){

                var refer_message = '';
                $.each(value['refer_messages'], function(inner_index, message){
                    refer_message += (inner_index+1) + ') ' + message['refer_message'] + '<br/>';
                });
                var referred_place_name = checkUndefined(data.place_details, checkUndefined(value, 'refer_detail.referred_place_id') + '.name');
                var referral_facility_other = _.get(value, 'refer_detail.referred_place_other');
                if (referral_facility_other != '' && referred_place_name == '-') {
                    referred_place_name = referral_facility_other;
                }
                var tool_text = '<div class="janitri-tooltip-wrapper" id="event-'+ value.id.toString() + '">';
                tool_text +=    '<div class="janitri-tooltip-block" >' +
                                        '<div class="janitri-tooltip-heading">' + referred_place_name + '</div>' +
                                        '<div class="janitri-tooltip-body">' + refer_message + '</div>' + 
                                    '</div>';
                tool_text += '</div>';
                $('.custom-tooltips').append(tool_text);
            }
            var source = $("#timeline-event-template").html();
            var template = Handlebars.compile(source);
            eventsHtml += template(context);

        }
    });
    var html = '<div class="timeline">' + eventsHtml + '</div>';
    return html;
}

function setPatientDetailPopupData(clickedDOMElement){
    $('#loading').show();
    var url = 'patient_ids=' + clickedDOMElement.attr('patient_id');
    callAjax(window.location.origin + '/nurse/patients/?' + url, "GET", data={}, function(response){
        if(response['success']){
            var data = response['data']['response'][0];
            if(data['labor_data'].length > 0){
                setPartoContentinTab(data);
                $('.parto-content-block-' + data.id.toString() + ' .no-parto-data').hide();
                $('.parto-content-block-' + data.id.toString() + ' .hc-graph').show();
            } else {
                $('.parto-content-block-' + data.id.toString() + ' .hc-graph').hide();
                $('.parto-content-block-' + data.id.toString() + ' .no-parto-data').show();
            }
            $('#loading').hide();
        }
    });
}

var showOnlyPartograph = function(){
    $('.printable-detail-block').hide();
    $('.partograph-block').show();
    $('.minimal-detail-block').show();
    $('.simplified-partograph-heading').hide();
    $('.partograph-block').css({
        'page-break-inside': 'auto'
    });
};


function setPartoContentinTab(data){
    var labor_data = [];
    if(data['labor_data'].length > 0){
        $.extend(true, labor_data, data['labor_data']);
        drawGraphs(labor_data, 'all', false, data['labor_data'][0].patient_id, function(){});
    }
    $.extend(true, labor_data, data['labor_data']);
}


function setPatientData(response, append){
    if(response['success']){
        response = response['data']['response'];
        var html = '';
        if(response.patients && response.patients.length > 0){
        
            $('.title-number').html('(' + response.total.toString() + ')');
            $('.result-number').html(response.total.toString());

            var headerContext = [];
            var tabContext = [];
            $.each(response.patients, function(index, value){
                var patient = {
                    'name': value.basic_detail.name,
                    'patient_id': value.id
                };
                if(index == 0){
                    patient['first'] = 1;
                } else {
                    patient['others'] = 1;
                }
                headerContext.push(patient);
                tabContext.push(patient);
            });

            var source = $("#patient-name-tab-block").html();
            var template = Handlebars.compile(source);
            var tabHeader = template({'patient': headerContext});

            var source = $("#patient-name-tab-content").html();
            var template = Handlebars.compile(source);
            var tabContent = template({'patient': tabContext});

            $('.tab-vert').html(tabHeader + tabContent);

            tabModule.init();
            $('.tab-legend > li:first-child').click();

            
            if(append == true){
                $('.patients-list').append(html);
            } else {
                $('.patients-list').html(html);
            }

            $('.patients-list-wrapper').show();
            $('.load-more-wrapper').show();
            $('.no-more-wrapper').hide();
            $('.no-data').hide();
            $('.load-more-btn').attr('offset', parseInt(response.start) + 50);
        
        } else if (append != true){
        
            $('.title-number').html('(0)');
            $('.result-number').html('0');
            $('.patients-list-wrapper').hide();
            $('.no-data').show();
        
        } else {
            
            $('.load-more-wrapper').hide();
            $('.no-more-wrapper').show();
        
        }
        $('#page-wrapper').unmask();
    } else {
        alert('Something went wrong.');
        $('#page-wrapper').unmask();
    }
}


function getPatientData(start, count){
    var data = {
        'place_ids': $('#place-selector').val().join(),
        'start': start,
        'count': count
    };

    // Check for In Progress Tab to only show non-completed patients
    var pathName = window.location.pathname;
    if(pathName == "/website/patients/" || pathName == "/website/partos/"){
        data['current_status'] = 'in_process';
    }

    $('#page-wrapper').mask("Loading...");
    callAjax(window.location.origin + '/nurse/patients/', "GET", data, function(response){
        var append = false;
        if(response.start != 0){
            append = true;
        }
        setPatientData(response, append);
    });
}

function getParity(value){
    var params = ['gravida', 'para', 'abortion', 'living_children'];
    var html = '';
    if (typeof(value.gravida) === 'undefined'){
        return valueNotAvailable;
    }
    if (value['gravida'] != '' && value['para'] != '' && value['abortion'] != '' && value['living_children'] != ''){
        html += 'G' + '<sub>' + value['gravida'] + '</sub>';
        html += 'P' + '<sub>' + value['para'] + '</sub>';
        html += 'A' + '<sub>' + value['abortion'] + '</sub>';
        html += 'L' + '<sub>' + value['living_children'] + '</sub>';
    }
    if (html == ''){
        return valueNotAvailable;
    }
    return html;
}

function getLaborTableData(labor_data){

    var row_html = '';
    switch(labor_data.data_type){
        case 'cervix_diameter':
            row_html += labor_data.param_1;
            break;
            
        case 'bp':
            row_html += labor_data.param_1 + ' / ' + labor_data.param_2;
            break;
        
        case 'pulse':
            row_html += labor_data.param_1;
            break;
        
        case 'fetal_heart_rate':
            row_html += labor_data.param_1;
            break;
        
        case 'head_descent':
            row_html += labor_data.param_1;
            break;
        
        case 'amniotic_fluid':
            row_html += labor_data.param_1;
            break;
        
        case 'moulding':
            row_html += labor_data.param_1;
            break;

        case 'contraction':
            row_html += labor_data.param_1;
            if(labor_data.param_3 == 1){
                row_html += ' / Mild / ';
            } else if(labor_data.param_3 == 2){
                row_html += ' / Moderate / ';
            } else{
                row_html += ' / Strong / ';
            }

            if(labor_data.param_2 == 1){
                row_html += '<20 seconds';
            } else if(labor_data.param_2 == 2){
                row_html += '20-40 seconds';
            } else{
                row_html += '>40 seconds';
            }
            break;

        case 'oxytocin':
            row_html += labor_data.param_1 + ' / ' + labor_data.param_2;
            break;

        case 'drugs':
            row_html += labor_data.param_1 + ' / ' + labor_data.param_2 + ' / ' + labor_data.param_3;
            break;

        case 'temperature':
            row_html += labor_data.param_1;
            break;
    }

    return row_html;
}

function setDeliveryData(response){

    var html = '<table class="delivery-data-table">' +
                    '<tr>' + 
                        '<td>Delivery Type</td>' +
                        '<td>' + getSentenceCase(checkUndefined(response, 'delivery_detail.delivery_type')) + '</td>' +
                    '</tr>' +
                    '<tr>' + 
                        '<td>Mother Status</td>' +
                        '<td>' + getSentenceCase(checkUndefined(response, 'delivery_detail.mother_status')) + '</td>' +
                    '</tr>' +
                    '<tr>' +
                        '<td>No. of Children</td>' +
                        '<td>' + response.child_details.length + '</td>' +
                    '</tr>';

    $.each(response.child_details, function(index, value){
        html += '<tr>' +
                    '<td>Child ' + (index+1) + '</td>' + 
                    '<td>' + 
                        getSentenceCase(value.child_status) + ' - ' + 
                        getSentenceCase(value.gender) + ' (' + value.weight + ' Kg) at ' +
                        getReadableTime(value.delivery_time)
                    '</td>' +
                '</tr>';
    });
    
    html += '</table>';


    $('.delivery-data-body').html(html);
}

function getSentenceCase(txt){
    if(typeof(txt) === 'undefined' || txt == ''){
        return "-";
    } else if(txt.toLowerCase() == "na"){
        return "NA";
    } 
    return txt.replace(/\w\S*/g, function(str){
        return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
    });
}

function getBPValue(systolic, diastolic){
    if(systolic.trim() != '' && diastolic.trim() != ''){
        return systolic + '/' + diastolic;
    } else {
        return '';
    }
}

function reFlowCharts(graph_id_list){
    for(var i = 0; i < graph_id_list.length; i++){
        if(typeof($('#' + graph_id_list[i]).highcharts()) !== 'undefined'){
            $('#' + graph_id_list[i]).highcharts().reflow();
        }
    }
}

function getPrintableData(patient_id, callback){
    callAjax(window.location.origin + '/nurse/patients/?patient_ids=' + patient_id, "GET", {}, function(resp){
        callback(resp);
    });
}

$(document).ready(function(){

    $('#daterange').val(moment().subtract(90, 'days').format('DD MMM YYYY') + ' - ' + moment().format('DD MMM YYYY'));
    $('#daterange').daterangepicker({
        timePicker: false,
        opens: 'left',
        maxDate: moment(),
        format: 'DD MMM YYYY',
        startDate: moment().subtract(90, 'days'),
        endDate: moment(),
        ranges: {
           'Today': [moment().startOf('day'), moment()],
           'Yesterday': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days')],
           'Last 7 Days': [moment().subtract(7, 'days'), moment()],
           'Last 30 Days': [moment().subtract(30, 'days'), moment()],
           'This Month': [moment().startOf('month'), moment().endOf('month')],
           'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    });

    $('.daterangepicker_start_input, .daterangepicker_end_input').hide();

    $('#fetch_data').click(function(){
        getPatientData(0, 50);
    });

    $('#load_more').on('click', function(){
        var start = parseInt($(this).attr('offset'));
        getPatientData(start, 50);
    });

    $('#fetch_data').click();

    $('.panel').click(function(){
        $('.panel').addClass('panel-inactive');
        $('.panel').removeClass('panel-active');
        $(this).removeClass('panel-inactive');
        $(this).addClass('panel-active');
        showSelectiveData();
    });

    $('body').on('click', '.delivery-data-btn', function(){
        var patient_id = $(this).attr('patient_id');
        $('.delivery-data-body').html('');
        $('.patients-table-wrapper').wait();
        $.ajax({
            type: "GET",
            url: window.location.origin + '/api/delivery-data/?patient_id=' + patient_id,
            success: function(data) {
                response = $.parseJSON(data);
                var html = '';
                $('#delivery-modal-header').html($('#patient-block-' + patient_id + ' .patient-name').text());
                if(JSON.stringify(response) !== '{}'){
                    $('.no-data-popup').hide();
                    setDeliveryData(response);
                } else{
                    $('.no-data-popup').show();
                }
                $('.patients-table-wrapper').unwait();
            }
        });
    });

    //Hide All Graphs till Modal Loaded
    $('#charts-modal').on('show.bs.modal', function() {
        $('.hc-graph').css('visibility', 'hidden');
    });
    //Show all graphs once the modal is loaded
    $('#charts-modal').on('shown.bs.modal', function() {
        $('.hc-graph').css('visibility', 'initial');
        var graph_id_list = [];
        $('#partograph .hc-graph').each(function(){
            graph_id_list.push($(this).attr('id'));
        });
        reFlowCharts(graph_id_list);
        // var graph_id_list = [
        //     'cervix-graph', 'descent-graph', 'amniotic-moulding-graph', 'contractions-graph',
        //     '#oxytocin-graph', '#drugs-graph', '#temperature-graph', '#pulse-graph', '#fetal-graph',
        //     '#bp-graph'
        // ]
    });

    $('.nav-tabs a').on('shown.bs.tab', function(event){
        if(event.target.hash == "#full-graph"){
            $('.hc-graph').css('visibility', 'initial');
            var graph_id_list = [];
            $('#full-graph .hc-graph').each(function(){
                graph_id_list.push($(this).attr('id'));
            });
            reFlowCharts(graph_id_list);
        }
        if(event.target.hash == "#partograph"){
            $('.hc-graph').css('visibility', 'initial');
            var graph_id_list = [];
            $('#partograph .hc-graph').each(function(){
                graph_id_list.push($(this).attr('id'));
            });
            reFlowCharts(graph_id_list);
        }
    });
    
});