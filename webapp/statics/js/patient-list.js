var timelineStatus = {
    'registered': 'Admitted', 
    'delivered': 'Delivered', 
    'referred_before_delivery': 'Referred', 
    'referred_after_delivery': 'Referred', 
    'referral_accepted': 'Received',
    'referral_cancelled': 'Cancelled', 
    'completed': 'Discharged',
    'referred_in': 'Referred In'
};

function getAge(age){
    if (age == 0 || typeof(age) === 'undefined' || age == null) {
        return valueNotAvailable;
    } else {
        return age;
    }
}

function getReadableDate(date_string){
    if(typeof(date_string) === 'undefined' || date_string == '' || parseInt(date_string) == maxTime || parseInt(date_string) == 0 || date_string == null) {
        return valueNotAvailable;
    } else {
        return moment(date_string*1000).format('DD MMM YYYY');
    }
}

function getReadableEventTime(events, event){
    i = 0;
    while(i < events.length){
        if (event == events[i]['event']){
            var time = events[i]['event_time'];
            if(time == '' || parseInt(time) == 0 || parseInt(time) == maxTime || time == null) {
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
    if(date_string =='' || parseInt(date_string) == maxTime || parseInt(date_string) == 0 || date_string == null) {
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

function checkAlreadyDelivered(events) {
    var deliveredTime = 0;
    var registerTime = 0;
    $.each(events, function(index, value){
        if (value['event'] == 'registered') {
            registerTime = value.event_time;
        } else if (value['event'] == 'delivered') {
            deliveredTime = value.event_time;
        }
    });
    if (deliveredTime && registerTime && (deliveredTime - registerTime) < 2) {
        return true;
    } else {
        return false;
    }
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

function processEventsList(events, data) {
    var registered_time = 0;
    var delivered_time = 0;
    var referredIn = false;
    var registeredPlaceId = 0;
    $.each(events, function(index, value){
        if (typeof(timelineStatus[value.event]) !== 'undefined' && value.event == 'registered'){ 
            registered_time = value.event_time;
            registeredPlaceId = value.place_id;
        }
    });
    $.each(events, function(index, value){
        if (typeof(timelineStatus[value.event]) !== 'undefined') {
            if (value.event == 'delivered'){
                delivered_time = checkUndefined(data, 'delivery_detail.child_details.0.delivery_time');
                if (delivered_time == valueNotAvailable){
                    value.event_name = undefined;
                } else {
                    value.event_name = 'delivered';
                    value.delivery_time = delivered_time;
                }
            } else {
                value.event_name = value.event;
            }
            // Check if the case is referred in
            if((value.event == 'referred_after_delivery' || value.event == 'referred_before_delivery') && value.place_id == 0) {
                referredIn = true;
            }
        }
    });


    // If case is referred-in, change registered to referred in and do not show referral and accepted events.
    if (referredIn) {
        $.each(events, function(index, value){
            if (value.event == 'registered') {
                value.event_name = 'referred_in';
            }
            if ((value.event == 'referred_after_delivery' || value.event == 'referred_before_delivery') && value.place_id == 0) {
                value.event_time = 0;
                value.event_name = undefined;
            }
            if (value.event == 'referral_accepted' && value.place_id == registeredPlaceId) {
                value.event_time = 0;
                value.event_name = undefined;
            }
        });
    }

    events.sort(function(a, b) {
        return a.event_time - b.event_time;
    });

    return events;
}


function getTimelineDOM(events, data){
    var tooltipRequired = ['referred_before_delivery', 'referred_after_delivery'];
    var context = globalContext;
    var eventsHtml = '';

    events = processEventsList(events, data);

    $.each(events, function(index, value){

        if (typeof(timelineStatus[value.event_name]) !== 'undefined'){
            context['status'] = timelineStatus[value.event_name];
            if (value.event_name == 'delivered') {
                context['statusTime'] = getReadableTime(value.delivery_time);    
            } else {
                context['statusTime'] = getReadableTime(value.event_time);
            }
            context['statusClass'] = value.event_name;
            context['tooltipTarget'] = value.id;
            if (tooltipRequired.indexOf(value.event_name) !== -1){

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

function setPatientDetailPopupData(clickedDOMElement, callback){
    var url = 'patient_ids=' + clickedDOMElement.attr('patient_id');
    callAjax(window.location.origin + '/nurse/patients/?' + url, "GET", data={}, function(response){
        if(response['success']){
            var data = response['data']['response'][0];
            var context = globalContext;
            context['patient_name'] = data.basic_detail.name;
            context['patient_id'] = data.basic_detail.id;
            var source = $("#patient-detail-popup").html();
            var template = Handlebars.compile(source);
            var html = template(context);
            $('#patientDetailModal').html(html);
            $(".selectpicker").selectpicker('refresh');

            //Populate all data
            setAllData(data, function(){
                // Show first tab data by default
                $(".tabs").tabtab({
                    animateHeight: true, 
                    startSlide: 1, 
                    fixedHeight: false, 
                    autoCycle: false,
                });
                resetModalHeight();

                callback();

            });

        }
    });
}

var beforePatientModalOpen = function(clickedDOMElement){
    setPatientDetailPopupData(clickedDOMElement, function(){});
};

var showOnlyPartograph = function(){
    $('.printable-detail-block').hide();
    $('.partograph-block').show();
    $('.minimal-detail-block').show();
    $('.simplified-partograph-heading').hide();
    $('.partograph-block').css({
        'page-break-inside': 'auto'
    });
};

var printAction = function(clickedElement, onlyPartograph){
    setPatientDetailPopupData(clickedElement, function(){
        $('#printable').show();
        $('#loading').show();
        $('#printable').width('1000px');
        var graph_id_list = [];
        $('#print-partograph .hc-graph').each(function(){
            graph_id_list.push($(this).attr('id'));
        });
        $('#loading').show();
        reFlowCharts(graph_id_list);
        setTimeout(function(){
            $('#loading').hide();
            if(onlyPartograph){
                $('#printable .heading h2').html(getSentenceCase(clickedElement.attr('facility') + ' - Simplified Partograph'));
                showOnlyPartograph();
            } else {
                $('#printable .heading h2').html(getSentenceCase(clickedElement.attr('facility') + ' - Case Sheet'));
                $('.minimal-detail-block').hide();
            }
            window.print();
            $('#printable').hide();
        }, 3000);
    });
}

$('body').on('click', '.print-patient', function(){
    printAction($(this), false);
});

$('body').on('click', '.print-patient-parto', function(){
    printAction($(this), true);
});

var afterPatientModalClose = function(){
    
};

function setPatientData(response, append){
    if(response['success']){
        response = response['data']['response'];
        var html = '';
        if(response.patients && response.patients.length > 0){
        
            $('.title-number').html('(' + response.total.toString() + ')');
            $('.result-number').html(response.total.toString());
            $.each(response.patients, function(index, value){
                var guardian_relation = getSentenceCase(value.basic_detail.guardian_relation) == '-' ? 'Guardian' : getSentenceCase(value.basic_detail.guardian_relation);
                var registration_worker_id = value.basic_detail.registration_worker_id;
                var registration_doctor_id = value.basic_detail.registration_doctor_id;
                var registration_nurse_name = checkUndefined(value.user_details, registration_worker_id.toString() + '.first_name');
                var registration_doctor_name = checkUndefined(value.user_details, registration_doctor_id.toString() + '.first_name');
                html += '<div id="patient-block-' + value.id + '" class="patient-block" place_id="' + value.basic_detail.place_id + '" status="'+ value.basic_detail.current_status +'">' +
                            // '<div class="patient-image inline-div">' + 
                            //     '<img onError="this.onerror=null;this.src=\'' + window.location.origin + '/statics/images/no-image.png\';" src="' + getImageUrl(value.image) + '"/>' +
                            // '</div>' + 
                            '<div class="basic-details-header">' +
                                '<span class="patient-name">' + value.basic_detail.name + '</span>' + 
                                '<span class="last-updated-at"> Last Updated: ' + getReadableTime(value.basic_detail.last_update_time) + '</span>' + 
                                '<span class="last-updated-at"> ID: ' + getSentenceCase(value.basic_detail.id.toString()) + '&nbsp;&nbsp;|&nbsp;&nbsp;</span>' + 
                                '<span class="last-updated-at"> Nurse: ' + registration_nurse_name + '&nbsp;&nbsp;|&nbsp;&nbsp;</span>' + 
                                '<span class="last-updated-at"> Doctor: ' + registration_doctor_name + '&nbsp;&nbsp;|&nbsp;&nbsp;</span>' + 
                            '</div>' +
                            '<div class="timeline-wrapper">' +
                                getTimelineDOM(value.events, value) +
                            '</div>' +
                            '<div class="patient-detail-block">' + 
                                '<div class="basic-details inline-div">' +
                                    '<table class="detail-list">' +
                                        '<tr>' +
                                            '<td>' +
                                                '<span class="detail-label">Admitted Facility</span><br/>' +
                                                '<span class="detail-value facility-name">' + value['place_details'][value.basic_detail['registration_place_id']]['name'] + '</span>' +
                                            '</td>' +
                                            '<td>' +
                                                '<span class="detail-label">Haemoglobin (g/dl)</span><br/>' +
                                                '<span class="detail-value doctor-name">' + getAge(checkUndefined(value, 'investigation.haemoglobin')) + '</span>' +
                                            '</td>' +
                                            '<td>' +
                                                '<span class="detail-label">Phone</span><br/>' +
                                                '<span class="detail-value">' + value.basic_detail.phone + '</span>' +
                                            '</td>' +
                                        '</tr>' +
                                        '<tr>' +
                                            '<td>' +
                                                '<span class="detail-label">' + guardian_relation + '</span><br/>' +
                                                '<span class="detail-value">' + getSentenceCase(value.basic_detail.guardian_name) + '</span>' +
                                            '</td>' +
                                            '<td>' +
                                                '<span class="detail-label">Parity</span><br/>' +
                                                '<span class="detail-value">' + getParity(value.admission_note) + '</span>' +
                                            '</td>' +
                                            '<td>' +
                                                '<span class="detail-label">Age / Blood Group</span><br/>' +
                                                '<span class="detail-value">' + getAge(checkUndefined(value, 'basic_detail.age')) + ' / ' + getSentenceCase(checkUndefined(value, 'investigation.blood_group')) + '</span>' +
                                            '</td>' +
                                        '</tr>' +
                                        '<tr>' +
                                            '<td>' +
                                                '<span class="detail-label">Admission Time</span><br/>' +
                                                '<span class="detail-value">' + getReadableEventTime(value.events, "registered") + '</span>' +
                                            '</td>' +
                                            '<td>' +
                                                '<span class="detail-label">Membrane Rupture Time</span><br/>' +
                                                '<span class="detail-value">' + getReadableEventTime(value.events, "membrane_ruptured") + '</span>' +
                                            '</td>';

                    if(value.current_status == 'completed'){
                        html +=             '<td>' +
                                                '<span class="detail-label">Delivery Time</span><br/>' + 
                                                '<span class="detail-value">' + getReadableEventTime(value.events, "delivered") + '</span>' +
                                            '</td>';
                    } else if(value.current_status == 'referred'){
                        html +=             '<td>' +
                                                '<span class="detail-label">Referral Time</span><br/>' + 
                                                '<span class="detail-value">' + getReadableEventTime(value.events, "referred") + '</span>' +
                                            '</td>';
                    } else if(value.is_delivered == 1){
                        html +=             '<td>' +
                                                '<span class="detail-label">Delivery Time</span><br/>' + 
                                                '<span class="detail-value">' + getReadableEventTime(value.events, "delivered")+ '</span>' +
                                            '</td>';
                    } else {
                        html +=             '<td>' +
                                                '<span class="detail-label">Last Data Time</span><br/>' + 
                                                '<span class="detail-value">' + getReadableTime(value.basic_detail.last_update_time)+ '</span>' +
                                            '</td>';
                    }
                                             
                    html +=             '</tr>' +
                                    '</table>' +
                                '</div>' +
                                '<div class="action-list inline-div">' +
                                    '<div class="action-list-inner">' +
                                        '<div class="actions">';

                    if(value.alerts.length > 0){

                        var tool_text = '<div class="janitri-tooltip-wrapper" id="alert-'+ value.id.toString() + '">';
                        $.each(value.alerts, function(index, value){
                            tool_text += (index+1) + ') ' + value['alert_message'] + '<br/>';
                        });
                        tool_text += '</div>';
                        $('.custom-tooltips').append(tool_text);
                        html +=             '<div class="status-icons alert-btn">' +
                                                '<i class="alert-tooltip-btn popup-link fa fa-exclamation-circle fa-2x" data-tooltip-content="#alert-' + value.id.toString() + '"></i>' +
                                            '</div>';
                    }

                    // @DEPRECATED: As this value has stopped coming from the app.
                    // if(value.data_entry_warnings.length > 0 && value.basic_detail.current_status == 'intra_partum_process'){
                    //     tool_text = "";
                    //     $.each(value.data_entry_warnings, function(index, value){
                    //         tool_text += (index+1) + ') ' + value['warning_message'] + '<br>';
                    //     });

                    //     html +=             '<div class="status-icons warning-btn">' +
                    //                             '<i class="warning-tooltip-btn fa fa-exclamation-circle fa-2x" title="' + tool_text + '"></i>' +
                    //                         '</div>';
                    // }
                    var tool_text = '<div class="janitri-tooltip-wrapper" id="protocol-'+ value.id.toString() + '">';
                    if(value.labor_analytics.protocol_followed == null) {

                        tool_text += "The protocol is not applicable yet.";

                        html += '<div class="status-icons warning-btn">' +
                                    '<i class="protocol-tooltip-btn popup-link fa fa-exclamation-triangle fa-2x" data-tooltip-content="#protocol-' + value.id.toString() + '"></i>' +
                                '</div>';
                    } else if (value.labor_analytics.protocol_followed == false) {

                        tool_text += "The protocol has not been followed.";

                        html += '<div class="status-icons alert-btn">' +
                                    '<i class="protocol-tooltip-btn popup-link fa fa-exclamation-triangle fa-2x" data-tooltip-content="#protocol-' + value.id.toString() + '"></i>' +
                                '</div>';
                    } else {
                        tool_text += "The protocol has been followed.";

                        html += '<div class="status-icons success-btn">' +
                                    '<i class="protocol-tooltip-btn popup-link fa fa-check-square fa-2x" data-tooltip-content="#protocol-' + value.id.toString() + '"></i>' +
                                '</div>';
                    }
                    tool_text += '</div>';
                    $('.custom-tooltips').append(tool_text);


                    var alreadyDelivered = checkAlreadyDelivered(value.events);
                    if(alreadyDelivered) {
                        var tool_text = '<div class="janitri-tooltip-wrapper" id="delivered-'+ value.id.toString() + '">';
                        tool_text += "The patient reached the hospital after the delivery happened";
                        tool_text += '</div>';
                        html += '<div class="status-icons delivered-btn">' +
                                    '<i class="protocol-tooltip-btn popup-link fa fa-ambulance fa-2x" data-tooltip-content="#delivered-' + value.id.toString() + '"></i>' +
                                '</div>';
                        $('.custom-tooltips').append(tool_text);
                    }

                    var refer_detail = getReferralDetails(value.events, value.place_details);
                    if (refer_detail.length > 0){
                        var tool_text = '<div class="janitri-tooltip-wrapper" id="comment-'+ value.id.toString() + '">';
                        $.each(refer_detail, function(index, event){
                            tool_text +=    '<div class="janitri-tooltip-block" >' +
                                                '<div class="janitri-tooltip-heading">' + event.referred_place_name + '</div>' +
                                                '<div class="janitri-tooltip-body">' + event.refer_messages + '</div>' + 
                                            '</div>';
                        });
                        tool_text += '</div>';
                        $('.custom-tooltips').append(tool_text);

                        html +=             '<div class="status-icons comment-btn">' +
                                                '<i class="comment-tooltip-btn popup-link fa fa-comment-o fa-2x" data-tooltip-content="#comment-' + value.id.toString() + '" data-powertiptarget="comment-' + value.id.toString() + '"></i>' +
                                            '</div>';
                    } 

                    html +=                 '<div class="current-status ' + value.basic_detail.current_status + '">' +
                                                getReadableStatus(value.basic_detail.current_status) +
                                            '</div>';

                    html +=                 '<div class="view-graph patient-detail-btn">' +
                                                '<a href="#patientDetailModal" type="button" patient_id="' + value.id + '" class="btn btn-info btn-sm digiparto-table-btn view-patient-detail patient-list-btn">View Details</a>' +
                                            '</div>';

                    if(value.basic_detail.current_status == 'referred' || value.basic_detail.current_status == 'completed'){
                        html +=             '<div class="view-delivery-data patient-detail-btn">' +
                                                '<a type="button" patient_id="' + value.id + '" patient_name="' + value.basic_detail.name + '" facility="' + value['place_details'][value.basic_detail['registration_place_id']]['name'] + '" class="btn btn-info btn-sm digiparto-table-btn print-patient patient-list-btn">Print Case Sheet</a>' +
                                            '</div>';
                    }
                    if(value.basic_detail.current_status != 'intra_partum_process' && value.basic_detail.current_status != 'registered'){
                        html +=             '<div class="view-delivery-data patient-detail-btn">' +
                                                '<a type="button" patient_id="' + value.id + '" patient_name="' + value.basic_detail.name + '" facility="' + value['place_details'][value.basic_detail['registration_place_id']]['name'] + '" class="btn btn-info btn-sm digiparto-table-btn print-patient-parto patient-list-btn">Print Partograph</a>' +
                                            '</div>';
                    }
                    
                    html +=             '</div>' +
                                    '</div>' + 
                                '</div>' +
                            '</div>' +
                        '</div>';
            });
            
            if(append == true){
                $('.patients-list').append(html);
            } else {
                $('.patients-list').html(html);
            }

            $('.patients-list-wrapper').show();
            $('.no-data').hide();
            $('.load-more-btn').attr('offset', parseInt(response.start) + 50);

            if(response.total > response.start + response.count) {
                $('.load-more-wrapper').show();
                $('.no-more-wrapper').hide();
            }
        
        } else if (append != true) {
        
            $('.title-number').html('(0)');
            $('.result-number').html('0');
            $('.patients-list-wrapper').hide();
            $('.no-data').show();
        
        } else {
            
            $('.load-more-wrapper').hide();
            $('.no-more-wrapper').show();
        
        }

        $('#page-wrapper').unmask();
        
        $('.alert-tooltip-btn').tooltipster({
            theme: 'tooltipster-borderless',
            trigger: 'click'
        });

        $('.comment-tooltip-btn').tooltipster({
            theme: 'tooltipster-borderless',
            trigger: 'click'
        });

        $('.protocol-tooltip-btn').tooltipster({
            theme: 'tooltipster-borderless',
            trigger: 'click'
        });

        $('.timeline-tooltip-wrapper').tooltipster({
            theme: 'tooltipster-borderless',
            trigger: 'click',
            side: 'bottom'
        });
        
        $(".view-patient-detail").animatedModal(modalTarget=getModalOptions('patientDetailModal', beforePatientModalOpen, afterPatientModalClose));

    } else {
        alert('Something went wrong.');
        $('#page-wrapper').unmask();
    }
}

function beforeChangePasswordModalOpen(clickedDOMElement) {

}

function afterChangePasswordModalClose(clickedDOMElement) {
    
}

function getSelectedPlaces() {
    var place_ids = [];
    selectedPlaceList.forEach(function(place) {
        place_ids.push(place.id)
    });
    return place_ids.join();
}


function getPatientData(start, count){
    var place_ids = getSelectedPlaces();

    if (place_ids.length == 0) {
        alert('Please select at least one place to view the patients.');
        return false;
    }

    var data = {
        'place_ids': place_ids,
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
        if(response['success']){
            var append = false;
            if(response['data']['response']['start'] != 0){
                append = true;
            }
            setPatientData(response, append);
        }
    });
}

function getPatientsByIds(patient_ids){
    var data = {
        'patient_ids': patient_ids,
        'start': 0,
        'count': 50
    };

    $('#page-wrapper').mask("Loading...");
    callAjax(window.location.origin + '/nurse/patients/', "GET", data, function(response){
        if(response['success']){
            var append = false;
            if(response['data']['response']['start'] != 0){
                append = true;
            }
            setPatientData(response, append);
            $('.empty-message').hide();
        } else {
            var errMsg = 'Something went wrong.';
            if(response['data'] && response['data']['message']) {
                errMsg = response['data']['message'];
            }
            alert(errMsg);
            $('#page-wrapper').unmask();
        }
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
    if(typeof(txt) === 'undefined' || txt == '' || txt == null) {
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


$(document).ready(function() {

    $('.panel').click(function(){
        $('.panel').addClass('panel-inactive');
        $('.panel').removeClass('panel-active');
        $(this).removeClass('panel-inactive');
        $(this).addClass('panel-active');
        showSelectiveData();
    });

    $('body').on('click', '.refresh-btn-popup', function(){
        setPatientDetailPopupData($(this), function(){});
    });

    $(".change-password-link").animatedModal(modalTarget=getModalOptions('changePasswordModal', beforeChangePasswordModalOpen, afterChangePasswordModalClose));

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