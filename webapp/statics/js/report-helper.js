var commonHeaders = [
    {
        "attribute": "facility_name",
        "type": "string",
        "display": "Facility Name"
    },
    {
        "attribute": "patient_name",
        "type": "string",
        "display": "Patient Name"
    },
    {
        "attribute": "patient_id",
        "type": "string",
        "display": "Patient ID"
    },
];

var reportFieldMap = {};
$.extend(true, reportFieldMap, patientDetailFieldMap);
omitFields();

function omitFields(){

    var omittedFields = {
        "basic_detail": ['name', 'id', 'place_id'],
        "place_details": [],
        "investigation": [],
        "physical_examination": [],
        "pa_pv_examination": [],
        "admission_note": [],
        "treatment_detail": [],
        "obstetric_histories": [],
        "medical_history": [],
        "family_history": [],
        "delivery_detail": [],
        "child_details": [],
        "alerts": [],
        "events": [],
        "pre_delivery_checklist": []
    };
    for(var key in omittedFields){
        reportFieldMap[key] = $.grep(reportFieldMap[key], function(e){
            if(omittedFields[key].indexOf(e['attribute']) != -1){
                return false;
            } else {
                return true;
            }
        });
    }
}

function downloadReport(response){
    var ep = new ExcelPlus();
    response = response['data']['response'];

    var sheets = {
        "basic_detail": "Patients",
        "investigation": "Investigations",
        "physical_examination": "Physical Examination",
        "pa_pv_examination": "PA PV Examination",
        "admission_note": "Admission Note",
        "treatment_detail": "Treatment Details",
        "obstetric_histories": "Obstetric History",
        "medical_history": "Medical History",
        "family_history": "Family History",
        "delivery_detail": "Delivery Details",
        "alerts": "Alerts",
        "events": "Events",
        "child_details": "Child Details",
        "pre_delivery_checklist": "Pre Delivery Checklist",
        "labor_data": "Labor Data",
        "mother_post_labor_data": "Mother Post Labor Data",
        "child_post_labor_data": "Child Post Labor Data",
        "analytics": "Analytics"
    };

    var i = 0;
    Object.keys(sheets).forEach(function(key) {
        var sheet = {'name': sheets[key], 'form_type': key};
        if (i == 0){
            ep.createFile(sheet['name']);
        } else {
            ep.createSheet(sheet['name']);
        }
        switch(key){
            case 'obstetric_histories':
                generateCustomSheet(ep, response, sheet, {'data': 'obstetric_histories', 'form': 'obstetric_histories'});
                break;
            case 'child_details':
                generateCustomSheet(ep, response, sheet, {'data': 'delivery_detail.child_details', 'form': 'child_details'});
                break;
            case 'labor_data':
                generateCustomSheet(ep, response, sheet, {'data': 'labor_data', 'form': 'labor_data'});
                break;
            case 'alerts':
                generateCustomSheet(ep, response, sheet, {'data': 'alerts', 'form': 'alerts'});
                break;
            case 'events':
                generateEventsSheet(ep, response, sheet, {'data': 'events', 'form': 'events'});
                break;
            case 'mother_post_labor_data':
                generateMotherPostLaborDataSheet(ep, response, sheet, {'data': 'post_partum_data.mother', 'form': 'mother_post_labor_data'});
                break;
            case 'child_post_labor_data':
                generateChildPostLaborDataSheet(ep, response, sheet, {'data': 'post_partum_data.child', 'form': 'child_post_labor_data'});
                break;
            case 'analytics':
                generateAnalyticsSheet(ep, response, sheet);
                break;
            default:
                generateDefaultSheet(ep, response, sheet);
                break;
        }
        i++;
    });
    ep.saveAs("demo.xlsx");
}


function getWarningTime(data_type, active_labor){
    return 0;
}


function generateAnalyticsSheet(ep, response, sheet){

    var sheetName = sheet['name'];

    // Setting the sheet headers
    var sheetHeaders = ['Patient ID', 'Patient Name', 'Facility Name', 'Cervix Dilatation', 'Descent of Head', 'BP', 'Pulse', 'Fetal Heart Rate', 'Amniotic Fluid', 'Moulding', 'Contractions', 'Drugs', 'Oxytocin', 'Temperature'];

    var parameters = ['cervix_diameter', 'head_descent', 'bp', 'pulse', 'fetal_heart_rate', 'amniotic_fluid', 'moulding', 'contraction', 'drugs', 'oxytocin', 'temperature'];

    var column = 0;
    var row = 1;
    $.each(sheetHeaders, function(index, value){

        cellData = {
            "cell": getColumnName(column) + row.toString(),
            "content": value
        };
        ep.write(cellData);
        column++;
    });


    //Setting the sheet data
    row = 2;
    $.each(response, function(index, patient){
        column = 0;
        total_time_lag = {};
        counter = {};
        prev_time = {};

        var active_labor = false;

        //Getting each parameters data for the patient - total and count to set average
        $.each(patient.labor_data, function(index, datum){
            param_index = parameters.indexOf(datum['data_type']);
            if(param_index !== -1){
                if (typeof(total_time_lag[datum['data_type']]) === 'undefined'){
                    total_time_lag[datum['data_type']] = 0;
                    counter[datum['data_type']] = 0;
                } else {
                    time_diff = datum['data_time'] - prev_time[datum['data_type']] - getWarningTime(datum['data_type'], active_labor);
                    total_time_lag[datum['data_type']] = total_time_lag[datum['data_type']] + time_diff;
                    counter[datum['data_type']]++;
                }
                if(datum['data_type'] == 'cervix_diameter' && parseInt(datum['param_1']) >= 4){
                    active_labor = true;
                }
                prev_time[datum['data_type']] = datum['data_time'];
            }
        });

        patient_id = patient.basic_detail.id;
        cellData = {
            "cell": getColumnName(column) + row.toString(),
            "content": patient_id
        };
        ep.write(cellData);
        column++;

        patient_name = patient.basic_detail.name;
        cellData = {
            "cell": getColumnName(column) + row.toString(),
            "content": patient_name
        };
        ep.write(cellData);
        column++;

        facility_name = _.get(patient, 'place_details.' + patient.basic_detail.registration_place_id.toString() + '.name', ''); 
        cellData = {
            "cell": getColumnName(column) + row.toString(),
            "content": facility_name
        };
        ep.write(cellData);
        column++;
        
        $.each(parameters, function(index, value){
            if(typeof(total_time_lag[value]) !== 'undefined' && typeof(counter[value]) !== 'undefined' && counter[value] > 0 && total_time_lag[value] > 0){
                cellData = {
                    "cell": getColumnName(column) + row.toString(),
                    "content": Math.round(total_time_lag[value] / counter[value] * 100) / 100
                };

            } else {
                cellData = {
                    "cell": getColumnName(column) + row.toString(),
                    "content": "-"
                };
            }
            ep.write(cellData);
            column++;
        });
        row++;
    });
}


function generateChildPostLaborDataSheet(ep, response, sheet, customKey){
    var sheetName = sheet['name'];
    var formType = sheet['form_type'];

    var sheetHeaders = ['Patient ID', 'Patient Name', 'Facility Name', 'Child ID', 'Data Time', 'Alive', 'Death Time', 'Death Reason', 'Diarrhea', 'Activity', 'Jaundice', 'Breathing', 'Chest Indrawing', 'Sucking', 'Convulsions', 'Stool Passed', 'Skin Pustules', 'Urine Passed', 'Complications', 'Temperature', 'Vomiting', 'Umbilical Cord'];

    var parameters = ['child_alive', 'child_death_time', 'child_death_reason', 'child_diarrhea', 'child_activity', 'child_jaundice', 'child_breathing', 'child_chest_indrawing', 'child_sucking', 'child_convulsions', 'child_stool_passed', 'child_skin_pustules', 'child_urine_passed', 'child_complications', 'child_temperature', 'child_vomiting', 'child_umbilical_cord'];

    var column = 0;
    var row = 1;
    $.each(sheetHeaders, function(index, value){

        cellData = {
            "cell": getColumnName(column) + row.toString(),
            "content": value
        };
        ep.write(cellData);
        column++;
    });


    //Setting the sheet data
    row = 2;
    $.each(response, function(index, patient){
        
        for(var child_id in patient.post_partum_data.child){

            paramsByTime = {};

            //Getting each parameters data for the patient - total and count to set average
            $.each(patient.post_partum_data.child[child_id], function(index, datum){
                if(typeof(paramsByTime[datum['data_time']]) === 'undefined'){
                    paramsByTime[datum['data_time']] = {};
                }
                paramsByTime[datum['data_time']][datum['data_type']] = datum['param_1'];
            });

            for(var time in paramsByTime){

                column = 0;

                patient_id = patient.basic_detail.id;
                cellData = {
                    "cell": getColumnName(column) + row.toString(),
                    "content": patient_id
                };
                ep.write(cellData);
                column++;

                patient_name = patient.basic_detail.name;
                cellData = {
                    "cell": getColumnName(column) + row.toString(),
                    "content": patient_name
                };
                ep.write(cellData);
                column++;

                facility_name = _.get(patient, 'place_details.' + patient.basic_detail.registration_place_id.toString() + '.name', ''); 
                cellData = {
                    "cell": getColumnName(column) + row.toString(),
                    "content": facility_name
                };
                ep.write(cellData);
                column++;

                cellData = {
                    "cell": getColumnName(column) + row.toString(),
                    "content": child_id
                };
                ep.write(cellData);
                column++;

                cellData = {
                    "cell": getColumnName(column) + row.toString(),
                    "content": getReadableTime(time)
                };
                ep.write(cellData);
                column++;
                
                $.each(parameters, function(index, value){
                    if(typeof(paramsByTime[time][value]) !== 'undefined' && paramsByTime[time][value] != ''){
                        cellData = {
                            "cell": getColumnName(column) + row.toString(),
                            "content": paramsByTime[time][value]
                        };
                    } else {
                        cellData = {
                            "cell": getColumnName(column) + row.toString(),
                            "content": "-"
                        };
                    }
                    ep.write(cellData);
                    column++;
                });
                row++;
            }
        }
        
    });
}

function generateMotherPostLaborDataSheet(ep, response, sheet, customKey){
    var sheetName = sheet['name'];
    var formType = sheet['form_type'];

    var sheetHeaders = [];
    var parameters = [];

    var sheetHeaders = ['Patient ID', 'Patient Name', 'Facility Name', 'Data Time', 'Alive', 'Death Time', 'Death Reason', 'Uterus', 'Diet', 'Pulse', 'Episiotomy Tear', 'Nipples', 'Bleeding', 'Lochia', 'Complications', 'Urine Output', 'BP (Diastolic)', 'BP (Systolic)', 'Breastfeeding', 'Pallor', 'Temperature', 'Breast', 'Family Planning'];

    var parameters = ['mother_alive', 'mother_death_time', 'mother_death_reason', 'mother_uterus', 'mother_diet', 'mother_pulse', 'mother_episiotomy_tear', 'mother_nipples', 'mother_bleeding', 'mother_lochia', 'mother_complications', 'mother_urine_output', 'mother_blood_pressure_diastolic', 'mother_blood_pressure_systolic', 'mother_breast_feeding', 'mother_pallor', 'mother_temperature', 'mother_breast', 'mother_family_planning'];
   
    var column = 0;
    var row = 1;
    $.each(sheetHeaders, function(index, value){

        cellData = {
            "cell": getColumnName(column) + row.toString(),
            "content": value
        };
        ep.write(cellData);
        column++;
    });


    //Setting the sheet data
    row = 2;
    $.each(response, function(index, patient){
        
        paramsByTime = {};

        //Getting each parameters data for the patient - total and count to set average
        $.each(patient.post_partum_data.mother, function(index, datum){
            if(typeof(paramsByTime[datum['data_time']]) === 'undefined'){
                paramsByTime[datum['data_time']] = {};
            }
            paramsByTime[datum['data_time']][datum['data_type']] = datum['param_1'];
        });

        for(var time in paramsByTime){

            column = 0;

            patient_id = patient.basic_detail.id;
            cellData = {
                "cell": getColumnName(column) + row.toString(),
                "content": patient_id
            };
            ep.write(cellData);
            column++;

            patient_name = patient.basic_detail.name;
            cellData = {
                "cell": getColumnName(column) + row.toString(),
                "content": patient_name
            };
            ep.write(cellData);
            column++;

            facility_name = _.get(patient, 'place_details.' + patient.basic_detail.registration_place_id.toString() + '.name', ''); 
            cellData = {
                "cell": getColumnName(column) + row.toString(),
                "content": facility_name
            };
            ep.write(cellData);
            column++;

            cellData = {
                "cell": getColumnName(column) + row.toString(),
                "content": getReadableTime(time)
            };
            ep.write(cellData);
            column++;
            
            $.each(parameters, function(index, value){
                if(typeof(paramsByTime[time][value]) !== 'undefined' && paramsByTime[time][value] != ''){
                    cellData = {
                        "cell": getColumnName(column) + row.toString(),
                        "content": paramsByTime[time][value]
                    };
                } else {
                    cellData = {
                        "cell": getColumnName(column) + row.toString(),
                        "content": "-"
                    };
                }
                ep.write(cellData);
                column++;
            });
            row++;
        }
        
    });

}


function generateCustomSheet(ep, response, sheet, customKey){

    var sheetName = sheet['name'];
    var formType = sheet['form_type'];

    var resp = setSheetHeaders(ep, sheetName, formType);

    var row = resp['row'];
    var column = 0;
    var context = {};
    var cellData = {};
    var dataExists = true;

    $.each(response, function(index, patient){        

        var requiredData = _.get(patient, customKey['data'], false);
        var isArray = Array.isArray(requiredData);

        if(requiredData && requiredData.length > 0 && isArray){
            $.each(requiredData, function(index, rowData){

                resp = setCommonColumns(ep, sheetName, patient, row);
                column = resp['column'];

                var contextData = {};
                contextData[customKey['form']] = rowData;
                context = getContext(contextData, formType);
                $.each(reportFieldMap[formType], function(index, value){
                    cellData = {
                        "cell": getColumnName(column) + row.toString(),
                        "content": context[value['attribute']]
                    };
                    ep.write(cellData);
                    column++;
                });
                row++;
            });
        } else if(!isArray && typeof(requiredData) === 'object'){
            Object.keys(requiredData).forEach(function(key) {
                $.each(requiredData[key], function(index, rowData){

                    resp = setCommonColumns(ep, sheetName, patient, row);
                    column = resp['column'];

                    var contextData = {};
                    contextData[customKey['form']] = rowData;
                    context = getContext(contextData, formType);
                    $.each(reportFieldMap[formType], function(index, value){
                        cellData = {
                            "cell": getColumnName(column) + row.toString(),
                            "content": context[value['attribute']]
                        };
                        ep.write(cellData);
                        column++;
                    });
                    row++;
                });
            });
        }
    });
}


function generateEventsSheet(ep, response, sheet, customKey){

    var sheetName = sheet['name'];
    var formType = sheet['form_type'];

    var resp = setSheetHeaders(ep, sheetName, formType);

    var row = resp['row'];
    var column = 0;
    var context = {};
    var cellData = {};
    var dataExists = true;

    $.each(response, function(index, patient){

        var requiredData = _.get(patient, 'events', false);
        var isArray = Array.isArray(requiredData);

        if(requiredData && requiredData.length > 0 && isArray){
            $.each(requiredData, function(index, rowData){

                var referMessages = _.get(rowData, 'refer_messages', '');

                if(referMessages != ''){

                    $.each(referMessages, function(msgIndex, msgData){
                        resp = setCommonColumns(ep, sheetName, patient, row);
                        column = resp['column'];

                        var contextData = {};
                        contextData[customKey['form']] = rowData;
                        context = getContext(contextData, formType);
                        context['refer_message'] = _.get(msgData, 'refer_message', '-');
                        context['refer_type'] = _.get(msgData, 'refer_type', '-');

                        $.each(reportFieldMap[formType], function(index, value){
                            cellData = {
                                "cell": getColumnName(column) + row.toString(),
                                "content": context[value['attribute']]
                            };
                            ep.write(cellData);
                            column++;
                        });
                        row++;
                    });

                } else {

                    resp = setCommonColumns(ep, sheetName, patient, row);
                    column = resp['column'];

                    var contextData = {};
                    contextData[customKey['form']] = rowData;
                    context = getContext(contextData, formType);
                    $.each(reportFieldMap[formType], function(index, value){
                        if(value['attribute'])
                        cellData = {
                            "cell": getColumnName(column) + row.toString(),
                            "content": context[value['attribute']]
                        };
                        ep.write(cellData);
                        column++;
                    });
                    row++;

                }
            });
        }
    });
}


function generateDefaultSheet(ep, response, sheet){

    var sheetName = sheet['name'];
    var formType = sheet['form_type'];

    var resp = setSheetHeaders(ep, sheetName, formType);

    var row = resp['row'];
    var column = 0;
    var context = {};
    var cellData = {};

    $.each(response, function(index, patient){        
        
        resp = setCommonColumns(ep, sheetName, patient, row);
        column = resp['column'];

        context = getContext(patient, formType);
        $.each(reportFieldMap[formType], function(index, value){
            cellData = {
                "cell": getColumnName(column) + row.toString(),
                "content": context[value['attribute']]
            };
            ep.write(cellData);
            column++;
        });
        row++;
    });
}


function setCommonColumns(ep, sheetName, data, row){

    var column = 0;
    var commonData = [];

    facility_name = _.get(data, 'place_details.' + data.basic_detail.registration_place_id.toString() + '.name', '-');
    commonData.push(facility_name);

    context = getContext(data, 'basic_detail');
    commonData.push(context['name']);
    commonData.push(context['id']);

    $.each(commonData, function(index, value){
        cellData = {
            "cell": getColumnName(column) + row.toString(),
            "content": value
        };
        ep.write(cellData);
        column++;
    });

    return {'row': row, 'column': column};
}


function setCommonHeaders(ep, sheetName){
    ep.selectSheet(sheetName);
    var row = 1;
    var column = 0;
    var cellData = {};
    var content = "";
    $.each(commonHeaders, function(index, value){
        
        content = getHeaderText(value['attribute']);
        if(typeof(value['display']) !== 'undefined'){
            content = value['display'];
        }

        cellData = {
            "cell": getColumnName(column) + row.toString(),
            "content": content
        };
        ep.write(cellData);
        column++;
    });

    return {'row': row, 'column': column};
}

function setSheetHeaders(ep, sheetName, formType){
    ep.selectSheet(sheetName);
    
    var cellData = {};
    var content = "";

    var resp = setCommonHeaders(ep, sheetName)
    var row = resp['row'];
    var column = resp['column'];

    $.each(reportFieldMap[formType], function(index, value){

        content = getHeaderText(value['attribute']);
        if(typeof(value['display']) !== 'undefined'){
            content = value['display'];
        }

        cellData = {
            "cell": getColumnName(column) + row.toString(),
            "content": content
        };
        ep.write(cellData);
        column++;
    });

    row++;

    return {'row': row, 'column': column};
}

function getHeaderText(text){
    return getSentenceCase(text.replace(/_/g, " "));
}

function getColumnName(num) {
    var ordA = 'a'.charCodeAt(0);
    var ordZ = 'z'.charCodeAt(0);
    var len = ordZ - ordA + 1;
    var s = "";
    while(num >= 0) {
        s = String.fromCharCode(num % len + ordA) + s;
        num = Math.floor(num / len) - 1;
    }
    return s.toUpperCase();
}
