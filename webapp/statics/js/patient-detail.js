function getContext(data, formType){
    var context = {};
    $.extend(context, globalContext);
    $.each(patientDetailFieldMap[formType], function(index, value){
        dataValue = '-';
        if (value['type'] == 'string'){
            dataValue = getSentenceCase(data[formType][value['attribute']]);
        } else if (value['type'] == 'datetime'){
            dataValue = getReadableTime(data[formType][value['attribute']]);
        } else if (value['type'] == 'date'){
            dataValue = getReadableDate(data[formType][value['attribute']]);
        } else if(value['type'] == 'integer'){
            dataValue = getData(data[formType][value['attribute']]);
        } else if(value['type'] == 'boolean'){
            dataValue = data[formType][value['attribute']] ? 'Yes' : 'No';
        } else if(value['type'] == 'enum'){
            dataValue = data[formType][value['attribute']] ? value['mapping'][data[formType][value['attribute']]] : '-';
        }
        context[value['attribute']] = dataValue;
    });
    return context;
}

function setBasicInfo(data){

    source = $("#basic-detail-block").html();
    template = Handlebars.compile(source);
    html = template(getContext(data, 'basic_detail'));
    $('.basic_detail').html(html);

    source = $("#admission-note-block").html();
    template = Handlebars.compile(source);
    html = template(getContext(data, 'admission_note'));
    $('.admission_note').html(html);

    source = $("#treatment-detail-block").html();
    template = Handlebars.compile(source);
    html = template(getContext(data, 'treatment_detail'));
    $('.treatment_detail').html(html);

    source = $("#mother-child-notes-block").html();
    template = Handlebars.compile(source);
    html = template(getContext(data, 'mother_child_notes'));
    $('.mother_child_notes').html(html);

}


function setExaminationInfo(data){

    source = $("#investigation-block").html();
    template = Handlebars.compile(source);
    html = template(getContext(data, 'investigation'));
    $('.investigation').html(html);

    source = $("#covid-note-block").html();
    template = Handlebars.compile(source);
    html = template(getContext(data, 'covid_note'));
    $('.covid_note').html(html);

    source = $("#physical-examination-block").html();
    template = Handlebars.compile(source);
    html = template(getContext(data, 'physical_examination'));
    $('.physical_examination').html(html);

    source = $("#pa-pv-examination-block").html();
    template = Handlebars.compile(source);
    html = template(getContext(data, 'pa_pv_examination'));
    $('.pa_pv_examination').html(html);

}


function setHistory(data){

    var obstetric_history_context = {};
    obstetric_history_context['obstetric_history_details'] = []
    $.each(data['obstetric_histories'], function(index, value){
        var pregnancy = {
            'obstetric_histories': value
        };
        pregnancy['obstetric_histories']['pregnancy_no'] = (index+1).toString();
        var pregnancy_context = getContext(pregnancy, 'obstetric_histories')
        obstetric_history_context['obstetric_history_details'].push(pregnancy_context);
    });

    source = $("#obstetric-histories-block").html();
    template = Handlebars.compile(source);
    html = template(obstetric_history_context);
    $('.obstetric_histories').html(html);

    source = $("#medical-history-block").html();
    template = Handlebars.compile(source);
    html = template(getContext(data, 'medical_history'));
    $('.medical_history').html(html);

    source = $("#family-history-block").html();
    template = Handlebars.compile(source);
    html = template(getContext(data, 'family_history'));
    $('.family_history').html(html);

}

function setDeliveryInfo(data){
    
    delivery_context = getContext(data, 'delivery_detail');
    delivery_context['child_details'] = [];
    if (checkUndefined(data, 'delivery_detail.child_details') !== '-'){
        $.each(data['delivery_detail']['child_details'], function(index, value){
            var child = {
                'child_details': value
            };
            child['child_details']['child_no'] = (index+1).toString();
            var child_context = getContext(child, 'child_details')
            delivery_context['child_details'].push(child_context);
        });
    }

    source = $("#delivery-detail-block").html();
    template = Handlebars.compile(source);
    html = template(delivery_context);
    $('.delivery_detail').html(html);

    source = $("#pre-delivery-checklist-block").html();
    template = Handlebars.compile(source);
    html = template(getContext(data, 'pre_delivery_checklist'));
    $('.pre_delivery_checklist').html(html);

    source = $("#post-delivery-checklist-block").html();
    template = Handlebars.compile(source);
    html = template(delivery_context);
    $('.post_delivery_checklist').html(html);


}


function setCaseTimeline(data){

    eventContext = [];

    var events = processEventsList(data['events'], data);
    $.each(events, function(index, value){
        if (typeof(timelineStatus[value.event]) !== 'undefined'){
            var context = getContext({"events": value}, 'events');
            if (value.event_name == 'delivered') {
                context['event_time'] = getReadableTime(value.delivery_time);
            } else {
                context['event_time'] = getReadableTime(value.event_time);
            }
            if(value.status == 'referred'){
                var message = '';
                $.each(data['refer_messages'], function(index, value){
                    message += value.refer_message + ', ';
                });
                context['meta_data'] = message.substring(0, message.length - 2);
            } else {
                context['meta_data'] = '-';
            }
            context['event'] = timelineStatus[value.event];
            eventContext.push(context);
        }
    });
    
    source = $("#patient-event-block").html();
    template = Handlebars.compile(source);
    html = template({"events": eventContext});
    $('.patient_event').html(html);

}


function getLaborDataValue(row){

    switch(row.data_type){     

        case 'bp':
            return row.param_1 + ' / ' + row.param_2;
        
        case 'contraction':
            durationStep = getContractionDurationStep(row.param_2);
            if(durationStep == 1) {
                duration = '<20 seconds';
            } else if(durationStep == 2) {
                duration = '20-40 seconds';
            } else {
                duration = '>40 seconds';
            }
            return row.param_1 + ' / ' + duration;

        case 'oxytocin':
            return row.param_1 + ' / ' + row.param_2;

        case 'drugs':
            return row.param_1 + ' / ' + row.param_2 + ' / ' + row.param_3;

        default:
            return row.param_1;

    }
}

function getDataEntries(labor_data){
    var context = {'labor_data': []};
    params_list = {
        "cervix_diameter": "Cervix Diameter (cm)", 
        "bp": "Blood Pressure (SBP/DBP mmHg)",
        "pulse": "Pulse (BPM)", 
        "fetal_heart_rate": "Fetal Heart Rate (BPM)", 
        "head_descent": "Head Descent", 
        "amniotic_fluid": "Amniotic Fluid", 
        "moulding": "Moulding", 
        "contraction": "Contractions (Count / Duration)", 
        "oxytocin": "Oxytocin (Conc. U/L / Drops/Min)", 
        "drugs": "Drugs", 
        "temperature": "Temperature (<sup>o</sup>F)"
    };

    $.each(labor_data, function(index, value){
        row = {
            "time": getReadableTime(value.data_time),
            "data_value": getLaborDataValue(value),
            "data_type": params_list[value.data_type]
        };
        context['labor_data'].push(row);
    });
    return context;
}


function setKeyarData(data) {
    var keyar_data = [];
    $.extend(true, keyar_data, data['keyar_data']);
    $('.fhr_mhr_uc_graph').html($("#fhr-mhr-uc-block").html());
    keyarGraphs(keyar_data, 'all', false, false, function(){});

}


function setIntraPartumData(data){
    
    var labor_data = [];

    if(data['labor_data'].length > 0){
        
        $.extend(true, labor_data, data['labor_data']);
        $('.partograph').html($("#partograph-block").html());
        drawGraphs(labor_data, 'all', false, false, function(){});
        
        // $.extend(true, labor_data, data['labor_data']);
        // $('.all_graph').html($("#all-graph-block").html());
        // drawAllValues(labor_data, 'all');
    }

    $.extend(true, labor_data, data['labor_data']);

    source = $("#data-entries-block").html();
    template = Handlebars.compile(source);   
    html = template(getDataEntries(labor_data));
    $('.data_entries').html(html);
}


function getMotherPostPartumData(mother_data){
    var response = {'data_times': [], 'data_values': []};
    var data_times = [];
    var data_values = [];

    var mother_params = {
        'mother_pulse': 'Pulse Rate (Per Minute)',
        'mother_bp': 'Blood Pressure (mm Hg)',
        'mother_temperature': 'Temperature (F)',
        'mother_pallor': 'Pallor',
        'mother_breast': 'Breasts',
        'mother_nipples': 'Nipples',
        'mother_uterus': 'Uterus Tenderness',
        'mother_bleeding': 'Bleeding P/V',
        'mother_lochia': 'Lochia',
        'mother_episiotomy_tear': 'Episiotomy/Tear',
        'mother_urine_output': 'Urine Output Normal',
        'mother_family_planning': 'Family Planning Counseling',
        'mother_breast_feeding': 'Breast Feeding Counseling',
        'mother_complications': 'Complications',
        'mother_diet': 'Diet'
    };

    var time_based_post_partum_data = {};
    $.each(mother_data, function(index, value){
        if(typeof(safeAccess(time_based_post_partum_data, value.data_type)) === 'undefined'){
            time_based_post_partum_data[value.data_type] = {};
        }
        time_based_post_partum_data[value.data_type][value.data_time] = value;
        if(data_times.indexOf(value.data_time) == -1){
            data_times.push(value.data_time);
        }
    });
    data_times.sort();

    for(var key in mother_params) {
        row = [];
        row.push(mother_params[key]);
        $.each(data_times, function(index, time) {
            if(key == 'mother_bp' && typeof(safeAccess(time_based_post_partum_data, 'mother_blood_pressure_systolic.' + time.toString())) !== 'undefined' && typeof(safeAccess(time_based_post_partum_data, 'mother_blood_pressure_diastolic.' + time.toString())) !== 'undefined'){
                row.push(time_based_post_partum_data['mother_blood_pressure_systolic'][time]['param_1'] + '/' + time_based_post_partum_data['mother_blood_pressure_diastolic'][time]['param_1']);
            } else if(typeof(safeAccess(time_based_post_partum_data, key + '.' + time.toString())) !== 'undefined'){
                row.push(getSentenceCase(time_based_post_partum_data[key][time]['param_1']));
            } else {
                row.push('-');
            }
        });
        data_values.push(row);
    }

    var readable_data_times = []
    $.each(data_times, function(index, value){
        readable_data_times.push(getReadableTime(value));
    });

    response['data_times'] = readable_data_times;
    response['data_values'] = data_values;
    response['data_exists'] = readable_data_times.length;
    return response;
}

function getChildPostPartumData(child_data){
    
    var response = {'data_times': [], 'data_values': []};
    var data_times = [];
    var data_values = [];

    var child_params = {
        'child_urine_passed': 'Urine Passed',
        'child_stool_passed': 'Stool Passed',
        'child_diarrhea': 'Diarrhea',
        'child_vomiting': 'Vomiting',
        'child_convulsions': 'Convulsions',
        'child_activity': 'Activity',
        'child_sucking': 'Sucking',
        // 'child_breathing': 'Breathing',
        'respiratory_rate': 'Respiratory Rate',
        'child_chest_indrawing': 'Chest Indrawing',
        'child_temperature': 'Temperature (F)',
        'child_jaundice': 'Jaundice',
        'child_umbilical_cord': 'Condition of Umbilical Stump',
        'child_skin_pustules': 'Skin Pustules',
        'child_complications': 'Any Complications'
    };

    var time_based_post_partum_data = {};
    $.each(child_data, function(index, value) {
        if(typeof(safeAccess(time_based_post_partum_data, value.data_type)) === 'undefined'){
            time_based_post_partum_data[value.data_type] = {};
        }
        time_based_post_partum_data[value.data_type][value.data_time] = value;
        if(data_times.indexOf(value.data_time) == -1){
            data_times.push(value.data_time);
        }
    });
    data_times.sort();

    for(var key in child_params) {
        row = [];
        row.push(child_params[key]);
        $.each(data_times, function(index, time) {
            if(typeof(safeAccess(time_based_post_partum_data, key + '.' + time.toString())) !== 'undefined'){
                row.push(getSentenceCase(time_based_post_partum_data[key][time]['param_1']));
            } else {
                row.push('-');
            }
        });
        data_values.push(row);
    }

    var readable_data_times = []
    $.each(data_times, function(index, value){
        readable_data_times.push(getReadableTime(value));
    });

    response['data_times'] = readable_data_times;
    response['data_values'] = data_values;
    response['data_exists'] = readable_data_times.length;
    return response;
}

function getPostPartumData(post_labor_data){
    var context = {};
    context['mother'] = getMotherPostPartumData(post_labor_data.mother);
    context['child'] = [];
    var i = 0;
    for(var child_id in post_labor_data.child){
        child_context = getChildPostPartumData(post_labor_data['child'][child_id]);
        child_context['child_no'] = (i+1).toString();
        context['child'].push(child_context);
        i = i + 1;
    }
    return context;
}

function setPostPartumData(data){

    source = $("#post-partum-detail-block").html();
    template = Handlebars.compile(source);
    context = getPostPartumData(data['post_partum_data']);
    html = template(context);
    $('.post_partum_data').html(html);

}

function getDischargeSlipData(data){

    var place_id = _.get(data, 'basic_details.registration_place_id', 0);
    var events = _.get(data, 'events', []);
    var context = getContext(data, 'basic_detail');
    context['facility'] = _.get(data, 'place_details.' + place_id.toString() + '.name', '-');
    context['delivery_time'] = 0;
    context['discharge_time'] = getReadableEventTime(events, "completed");
    context['delivery_type'] = getSentenceCase(_.get(data, 'delivery_detail.delivery_type', '-'));

    context['child_details'] = [];
    if (checkUndefined(data, 'delivery_detail.child_details') !== '-'){
        $.each(data['delivery_detail']['child_details'], function(index, value){
            var child = {
                'child_details': value
            };
            child['child_details']['child_no'] = (index+1).toString();
            var child_context = getContext(child, 'child_details')
            context['child_details'].push(child_context);
            if (index == 0) {
                context['delivery_time'] = child_context['delivery_time'];
            }
        });
    }

    context['refer_details'] = [];

    $.each(events, function(index, value){
        if(value.event == 'referred_before_delivery' || value.event == 'referred_after_delivery'){
            var referred_place_id = _.get(value, 'refer_detail.referred_place_id');
            var referral_facility = '';
            var referral_facility_other = '';
            if (referred_place_id && referred_place_id != 0){
                referral_facility = _.get(data, 'place_details.' + referred_place_id.toString() + '.name', '-');
            }
            referral_facility_other = _.get(value, 'refer_detail.referred_place_other');

            var refer_messages = _.get(value, 'refer_messages');
            var child_reasons = [];
            var mother_reasons = [];
            $.each(refer_messages, function(index, value){
                if(value.refer_type.indexOf('CODE_MOTHER') >= 0){
                    mother_reasons.push(value.refer_message);
                }
                if(value.refer_type.indexOf('CODE_CHILD') >= 0){
                    child_reasons.push(value.refer_message);
                }
            });

            context['refer_details'].push({
                'referral_facility': referral_facility,
                'referral_facility_other': referral_facility_other,
                'mother_referral_reason': mother_reasons.join(", "),
                'child_referral_reason': child_reasons.join(", ")
            });
        }
    });

    return context;
}

function setOtherInfo(data){
    source = $("#discharge-slip-block").html();
    template = Handlebars.compile(source);
    context = getDischargeSlipData(data);
    html = template(context);
    $('.discharge_slip').html(html);
}


function getChildAPGARData(apgar_data){
    var apgar_params = {
        'time_interval': 'Time',
        'color': 'Color',
        'heart_rate': 'Heart Rate',
        'reflex_irritability': 'Reflex Irritability',
        'muscle_tone': 'Muscle Tone',
        'respiration': 'Respiration'
    };
    var data_times = [];
    var data_values = [];
    for(var key in apgar_params){
        if(key == 'time_interval'){
            $.each(apgar_data, function(index, value){
                data_times.push((value[key]).toString() + ' minute(s)');
            });
        } else {
            row = [apgar_params[key]];
            $.each(apgar_data, function(index, value){
                row.push(value[key].toString());
            });
            data_values.push(row);
        }
    }
    return {'data_times': data_times, 'data_values': data_values};
}


function getAPGARScoreData(apgar_score){
    var context = {};
    context['child'] = [];
    var i = 0;
    for(var child_id in apgar_score.child){
        child_context = getChildAPGARData(apgar_score['child'][child_id]);
        child_context['child_no'] = (i+1).toString();
        context['child'].push(child_context);
        i = i + 1;
    }
    return context;
}

function setAPGARScore(data){

    source = $("#apgar-score-detail-block").html();
    template = Handlebars.compile(source);
    context = getAPGARScoreData(data['apgar_score']);
    html = template(context);
    $('.apgar_score').html(html);

}

function setPrintableDOM(data, callback){

    context = {
        "pre_parto_blocks": [
            {'title': 'Basic Detail', 'class_name': 'basic_detail'},
            {'title': 'Admission Note', 'class_name': 'admission_note'},
            {'title': 'Medical History', 'class_name': 'medical_history'},
            {'title': 'Obstetric History', 'class_name': 'obstetric_histories'},
            {'title': 'Family History', 'class_name': 'family_history'},
            {'title': 'Investigation', 'class_name': 'investigation'},
            {'title': 'Physical Examination', 'class_name': 'physical_examination'},
            {'title': 'PA/PV Examination', 'class_name': 'pa_pv_examination'},
            {'title': 'Pre Delivery Checklist', 'class_name': 'pre_delivery_checklist'},
            {'title': 'Antenatal Treatment Detail', 'class_name': 'treatment_detail'},
            {'title': 'Data Entries', 'class_name': 'data_entries'},
        ],
        "post_parto_blocks": [
            {'title': 'Post Delivery Checklist', 'class_name': 'post_delivery_checklist'},
            {'title': 'Delivery Detail', 'class_name': 'delivery_detail'},
            {'title': 'Mother and Child Notes', 'class_name': 'mother_child_notes'},
            {'title': 'Post Partum Data', 'class_name': 'post_partum_data'},
            {'title': 'Case Timeline', 'class_name': 'patient_event'}
        ],
        "minimal_details": {
            "name": getSentenceCase(_.get(data, 'basic_detail.name', '-')),
            "parity": getParity(data.admission_note),
            "ipd_registration_number": getSentenceCase(_.get(data, 'basic_detail.ipd_registration_number', '-')),
            "opd_registration_number": getSentenceCase(_.get(data, 'basic_detail.opd_registration_number', '-')),
            "admission_time": getReadableEventTime(data.events, "registered"),
            "membrane_rupture_time": getReadableEventTime(data.events, "membrane_ruptured")
        },
        "final_blocks": [
            {'title': 'Discharge Slip', 'class_name': 'discharge_slip'}
        ]
    };

    source = $("#printable-block").html();
    template = Handlebars.compile(source);
    html = template(context);
    $('.printable-popup-data').html(html);

    var labor_data = [];
    $.extend(true, labor_data, data['labor_data']);
    drawGraphs(labor_data, 'all', true, false, function(){
        callback();
    });
}

function setAllData(data, callback){
    
    setPrintableDOM(data, function(){
        $('.popup-data-content').append($('#basic-info-block').html());
        setBasicInfo(data);
        
        $('.popup-data-content').append($('#keyar-data-block').html());
        setKeyarData(data);

        $('.popup-data-content').append($('#intra-partum-data-block').html());
        setIntraPartumData(data);

        $('.popup-data-content').append($('#examination-info-block').html());
        setExaminationInfo(data);

        $('.popup-data-content').append($('#history-block').html());
        setHistory(data);

        $('.popup-data-content').append($('#delivery-info-block').html());
        setDeliveryInfo(data);

        $('.popup-data-content').append($('#apgar-score-block').html());
        setAPGARScore(data);

        $('.popup-data-content').append($('#post-partum-data-block').html());
        setPostPartumData(data);

        $('.popup-data-content').append($('#case-timeline-block').html());
        setCaseTimeline(data);

        $('.popup-data-content').append($('#other-info-block').html());
        setOtherInfo(data);

        $('.detail-type-wrapper').hide();
        $('.basic-info').show();

        callback();
    });
}

$(document).ready(function(){

    $('body').on('change', '#patient-detail-type', function(){
        $('.detail-type-wrapper').hide();
        var type = $(this).val();
        switch(type){
            case 'basic-info':
                $('.basic-info').show();
                break;
            case 'examination-info':
                $('.examination-info').show();
                break;
            case 'history':
                $('.history').show();
                break;
            case 'delivery-info':
                $('.delivery-info').show();
                break;
            case 'apgar-score':
                $('.apgar-score').show();
                break;
            case 'post-partum-data':
                $('.post-partum-data').show();
                break;
            case 'keyar-data':
                $('.keyar-data').show();
                var graph_id_list = [];
                $('.hc-graph').each(function(){
                    graph_id_list.push($(this).attr('id'));
                });
                reFlowCharts(graph_id_list);
                break;
            case 'intra-partum-data':
                $('.intra-partum-data').show();
                var graph_id_list = [];
                $('.hc-graph').each(function(){
                    graph_id_list.push($(this).attr('id'));
                });
                reFlowCharts(graph_id_list);
                break;
            case 'case-timeline':
                $('.case-timeline').show();
                break;
            case 'other-info':
                $('.other-info').show();
                break;
            default:
                $('.basic-info').show();
                break;
        }
        resetModalHeight();
    });
});

