var chartMargin = 70;
var legendFont = 10;
var markerRadius = 8;
var lineWidth = 4;
var alertWidth = 2;
var itemMargin = 2;

function drawGraphs(response, graph_type, print, idIdentifier, callback){
    Highcharts.setOptions({
      global: {
        useUTC: false
      }
    });

    var print_id = '';
    if(print == true){
        print_id = 'print-';
    } else if(idIdentifier != false) {
        print_id = idIdentifier.toString() + '-';
    }

    var first_cervix_time = 0;
    var first_cervix_value = 0;

    // Converting all timestamps to 
    $.each(response, function(index, value){
        value.data_time = value.data_time * 1000;
    });

    response.sort((a, b) => (a.data_time > b.data_time) ? 1 : -1);


    $.each(response, function(index, value){
        if(value.data_type == 'cervix_diameter' && parseInt(value.param_1) >= 4 && first_cervix_time == 0){
            first_cervix_time = parseInt(moment(value.data_time).format('x'));
            first_cervix_value = value.param_1;
        }
    });

    if (first_cervix_time == 0) {
        $('#' + print_id + 'no-partograph').show();
        callback();
        return;
    } else {
        $('#' + print_id + 'no-partograph').hide();
    }

    var first_reading_time = 0;
    if(first_cervix_time == 0 && response.length > 0){
        first_reading_time = parseInt(moment(response[0]['data_time']).format('x'));
    } else {
        //If first value is 9, means that graph has to start 5 hours back coz 1cm = 1 hour and graph starts from 4.
        first_reading_time = first_cervix_time - ((parseInt(first_cervix_value) - 4) * 3600 * 1000);
    }

    resp = [];
    $.each(response, function(index, value){
        var data_time = parseInt(moment(value.data_time).format('x'))
        if(data_time >= first_reading_time) {
            resp.push(value);
        }
    });

    response = resp;

    var tickPositions = getTickPositions(first_reading_time);
    var hourTickPostions = getHourTickPositions(first_reading_time);
    var reading_time = '';

    var cervix = [];
    var descent = [];
    var systolic_bp = [];
    var diastolic_bp = [];
    var pulse = [];
    var fetal = [];
    var alert = [];
    var action = [];
    var amniotic = {};
    var moulding = {};
    var dummy = []; 
    var contractions = {};
    var drugs = {};
    var oxytocin = {};
    var temperature = [];
    var i = 0;
    $.each(response, function(index, value){
        switch(value.data_type){
            case 'cervix_diameter':
                // This is done to remove all values less than 4 from partograph
                if(parseInt(value.param_1) >= 4) {
                    cervix.push([parseInt(moment(value.data_time).format('x')), parseInt(value.param_1)]);
                }
                break;
            
            case 'bp':
                systolic_bp.push([parseInt(moment(value.data_time).format('x')), parseInt(value.param_1)]);
                diastolic_bp.push([parseInt(moment(value.data_time).format('x')), parseInt(value.param_2)]);
                break;
            
            case 'pulse':
                pulse.push([parseInt(moment(value.data_time).format('x')), parseInt(value.param_1)]);
                break;
            
            case 'fetal_heart_rate':
                fetal.push([parseInt(moment(value.data_time).format('x')), parseInt(value.param_1)]);
                break;
            
            case 'head_descent':
                descent.push([parseInt(moment(value.data_time).format('x')), parseInt(value.param_1)]);
                break;
            
            case 'amniotic_fluid':
                var timing = moment(value.data_time).format('x');
                for(var intervals = 1 ; intervals < tickPositions.length ; intervals++){
                    if(tickPositions[intervals-1] <= parseInt(timing) && parseInt(timing) < tickPositions[intervals]){
                        amniotic[tickPositions[intervals-1].toString()] = value.param_1;
                    }
                }
                break;
            
            case 'moulding':
                var timing = moment(value.data_time).format('x');
                for(var intervals = 1 ; intervals < tickPositions.length ; intervals++){
                    if(tickPositions[intervals-1] <= parseInt(timing) && parseInt(timing) < tickPositions[intervals]){
                        moulding[tickPositions[intervals-1].toString()] = value.param_1;
                    }
                }
                break;

            case 'contraction':
                var timing = moment(value.data_time).format('x');
                for(var intervals = 1 ; intervals < tickPositions.length ; intervals++){
                    if(tickPositions[intervals-1] <= parseInt(timing) && parseInt(timing) < tickPositions[intervals]){
                        contractions[tickPositions[intervals-1]] = {
                            'number' : parseInt(value.param_1),
                            'duration': getContractionDurationStep(parseInt(value.param_2)),
                            'intensity': 2, // 23 Oct 2018 - parseInt(value.param_3) -- Hardcoded for now. Not used anymore, seems to be outdated
                        };
                    }
                }
                break;

            case 'oxytocin':
                var timing = moment(value.data_time).format('x');
                for(var intervals = 1 ; intervals < tickPositions.length ; intervals++){
                    if(tickPositions[intervals-1] <= parseInt(timing) && parseInt(timing) < tickPositions[intervals]){
                        oxytocin[tickPositions[intervals-1]] = {'conc' : value.param_1, 'drops' : value.param_2};
                    }
                }
                break;

            case 'drugs':
                var timing = moment(value.data_time).format('x');
                for(var intervals = 2 ; intervals < tickPositions.length ; intervals+=2){
                    if(tickPositions[intervals-2] <= parseInt(timing) && parseInt(timing) < tickPositions[intervals]){
                        drugs[tickPositions[intervals-2]] = value.param_1 + '<br/>(' + value.param_2 + ')<br/>' + value.param_3;
                    }
                }
                break;

            case 'temperature':
                var timing = moment(value.data_time).format('x');
                for(var intervals = 2 ; intervals < tickPositions.length ; intervals+=2){
                    if(tickPositions[intervals-2] <= parseInt(timing) && parseInt(timing) < tickPositions[intervals]){
                        temperature[tickPositions[intervals-2]] = value.param_1;
                    }
                }
                temperature.push([parseInt(moment(value.data_time).format('x')), parseFloat(value.param_1)]);
                break;
                
        }
        i++;
    });
    
    // var first_cervix = cervix.length > 0 ? cervix[0][1] : 4;
    
    for(var j=0; j<16; j++){
        reading_time = first_reading_time + (1800*1000)*(j+0);
        alert.push([reading_time, (j*0.5) + 4 ]);
        reading_time = first_reading_time + (1800*1000)*(j+8);
        action.push([reading_time, (j*0.5)+ 4 ]);
    }

    var amniotic_moulding = [];
    var amniotic_data = [];
    var moulding_data = [];
    var oxytocin_data = [];
    var drugs_data = [];
    var temperature_data = [];
    var contraction_duration = {};
    var contractions_data = [
        { name : '< 20 seconds', data : [] },
        { name : '20-40 seconds', data : [] },
        { name : '> 40 seconds', data : [] },
    ];
    var contractions_intensity = {};
    // Not used anymore - Intensity is not to be looked for.
    // var intensity_labels = ['', 'Mild', 'Moderate', 'Strong'];
    var intensity_labels = [];
                

    for(var intervals = 1 ; intervals < tickPositions.length ; intervals++){
        var label_pos = parseInt((tickPositions[intervals-1] + tickPositions[intervals])/2);
        if(typeof(amniotic[tickPositions[intervals-1]]) === 'undefined'){
            amniotic[tickPositions[intervals-1]] = '';
        }
        if(typeof(moulding[tickPositions[intervals-1]]) === 'undefined'){
            moulding[tickPositions[intervals-1]] = '';
        }

        amniotic_moulding.push([label_pos, 0, amniotic[tickPositions[intervals-1]]]);
        // amniotic_moulding.push([label_pos, 0, moulding[tickPositions[intervals-1]]]);

        amniotic_data.push([label_pos, 0, amniotic[tickPositions[intervals-1]]]);
        moulding_data.push([label_pos, 0, moulding[tickPositions[intervals-1]]]);

        if(typeof(contractions[tickPositions[intervals-1]]) === 'undefined'){
            contractions_data[0]['data'].push([label_pos, 0]);
            contractions_data[1]['data'].push([label_pos, 0]);
            contractions_data[2]['data'].push([label_pos, 0]);
        } else {
            var curr_tick = tickPositions[intervals-1];
            var duration = contractions[curr_tick]['duration'];
            if (duration > 0){
                contractions_data[duration-1]['data'].push([label_pos, contractions[curr_tick]['number']]);
                contractions_data[duration%3]['data'].push([label_pos, 0]);
                contractions_data[(duration + 1)%3]['data'].push([label_pos, 0]);

                //Preparing data labels for mild, moderate and strong
                if(typeof(intensity_labels[contractions[curr_tick]['intensity']]) !== 'undefined'){
                    contractions_intensity[curr_tick] = intensity_labels[contractions[curr_tick]['intensity']];
                } else {
                    contractions_intensity[curr_tick] = '';
                }
                
            }
        }

        if(typeof(oxytocin[tickPositions[intervals-1]]) === 'undefined'){
            oxytocin[tickPositions[intervals-1]] = {'conc' : '',  'drops' : ''};
        }

        oxytocin_data.push([label_pos, 1, oxytocin[tickPositions[intervals-1]]['conc']]);
        oxytocin_data.push([label_pos, 0, oxytocin[tickPositions[intervals-1]]['drops']]);
    }

    for(var intervals = 2 ; intervals < tickPositions.length ; intervals+=2){
        var label_pos = parseInt((tickPositions[intervals-2] + tickPositions[intervals])/2);
        if(typeof(drugs[tickPositions[intervals-2]]) === 'undefined'){
            drugs[tickPositions[intervals-2]] = '';
        }
        drugs_data.push([label_pos, 0, drugs[tickPositions[intervals-2]]]);

        if(typeof(temperature[tickPositions[intervals-2]]) === 'undefined'){
            temperature[tickPositions[intervals-2]] = '';
        }
        temperature_data.push([label_pos, 0, temperature[tickPositions[intervals-2]]]);
    }

    switch(graph_type){
        case 'cervix_diameter':
            cervixGraph('#cervix-graph', cervix, alert, action, tickPositions);
            break;
        case 'head_descent':
            descentGraph('#descent-graph', descent, alert, action, tickPositions);
            break;    
        case 'blood_pressure':
            bpGraph('#bp-graph', systolic_bp, diastolic_bp, tickPositions);
            break;
        case 'pulse_rate':
            pulseGraph('#pulse-graph', pulse, tickPositions);
            break;
        case 'fetal_heart_rate':
            fetalGraph('#fetal-graph', fetal, tickPositions);
            break;
        case 'amniotic_fluid':
            amnioticGraph('#amniotic-graph', amniotic_data, tickPositions);
            break;

        case 'moulding':
            mouldingGraph('#moulding-graph', moulding_data, tickPositions);
            break;

        case 'contraction':
            contractionsGraph('#contractions-graph', contractions_data, contractions_intensity, tickPositions);
            break;
        case 'oxytocin':
            oxytocinGraph('#oxytocin-graph', oxytocin_data, tickPositions);
            break;
        case 'drugs':
            drugsGraph('#drugs-graph', drugs_data, tickPositions);
            break;
        case 'temperature':
            temperatureGraph('#temperature-graph', temperature, hourTickPostions);
            break;

        case 'all':
            checkScreen();
            $(window).resize(function(){
                checkScreen();
            });
            //Draw Parto Graph
            cervixGraph('#' + print_id + 'cervix-graph', cervix, alert, action, tickPositions);
            descentGraph('#' + print_id + 'descent-graph', descent, alert, action, tickPositions);
            //Draw BP Graph
            // bpGraph('#' + print_id + 'bp-graph', systolic_bp, diastolic_bp, tickPositions);
            bpPulseGraph('#' + print_id + 'bp-graph', systolic_bp, diastolic_bp, pulse, tickPositions);
            //Draw Pulse Graph
            // pulseGraph('#' + print_id + 'pulse-graph', pulse, tickPositions);
            //Draw Fetal Graph
            fetalGraph('#' + print_id + 'fetal-graph', fetal, tickPositions);
            //Draw Amniotic and Moulding Graph
            // amnioticMouldingGraph('#' + print_id + 'amniotic-moulding-graph', amniotic_moulding, tickPositions);
            amnioticGraph('#' + print_id + 'amniotic-moulding-graph', amniotic_moulding, tickPositions);
            contractionsGraph('#' + print_id + 'contractions-graph', contractions_data, contractions_intensity, tickPositions);
            oxytocinGraph('#' + print_id + 'oxytocin-graph', oxytocin_data, tickPositions);
            drugsGraph('#' + print_id + 'drugs-graph', drugs_data, tickPositions);
            oldTemperatureGraph('#' + print_id + 'temperature-graph', temperature_data, tickPositions);
            break;
    }

    callback();
}

function getTickPositions(data_time){
    var positions = [];
    for(var i = 0; i < 25; i++){
        positions.push(data_time + (i*1800*1000));
    }
    return positions;
}


function getHourTickPositions(data_time){
    var positions = [];
    for(var i = 0; i < 13; i++){
        positions.push(data_time + (i*3600*1000));
    }
    return positions;
}

function getStep(){
    var width = $(window).width();
    var step = 2 + parseInt((1280 - width)/150);
    if(step < 2){
        step = 2;
    }
    return step;
}

function checkScreen(){
    if($(window).width() < $(window).height()){
        $('.hc-graph').addClass('portrait');
        $('.hc-graph.small').addClass('small-portrait');
        legendFont = 7;
        markerRadius = 5;
        lineWidth = 3;
        alertWidth = 1;
        itemMargin = 2;
    } else {
        $('.hc-graph').removeClass('portrait');
        $('.hc-graph.small').removeClass('small-portrait');
        chartMargin = 70;
        legendFont = 10;
        markerRadius = 8;
        lineWidth = 4;
        alertWidth = 2;
        itemMargin = 1;
    }
}

function tooltipFormat(val){
    if (val.y == '') {
        return Highcharts.dateFormat('%d %b %Y %I:%M:%S %p', val.x) + '<br/>' +
                        '<b>' + val.series.name + '</b>';
    }
    return Highcharts.dateFormat('%d %b %Y %I:%M:%S %p', val.x) + '<br/>' +
                        '<b>' + val.series.name + ': ' + val.y + '</b>';
}

function heatMapTooltipFormat(val){
    return Highcharts.dateFormat('%d %b %Y %I:%M:%S %p', val.point.x) + '<br/>' +
                        '<b>' + val.series.name + ': ' + val.point.value + '</b>';
}

function amnioticGraph(graph_id, amniotic, tickPositions){
    $(graph_id).show();
    $(graph_id).highcharts({

        chart: {
            type: 'heatmap',
            marginLeft: chartMargin
        },
        title: {
            text: ''
        },

        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                millisecond: '%H:%M:%S.%L',
                second: '%H:%M:%S',
                minute: '%H:%M',
                hour: '%H:%M',
                day: '%e %b',
                week: '%e %b',
                month: '%b \'%y',
                year: '%Y'
            },
            min: tickPositions[0],
            max: tickPositions.slice(-1).pop(),
            tickPositions: tickPositions,
            labels: {
                formatter: function () {
                  return Highcharts.dateFormat('%I:%M %p', this.value);
                },
                step: getStep(),
            },
            title: {
                text: ''
            },
            gridLineColor: '#000000',
            gridLineWidth: 1,
        },

        yAxis: {
            categories: ['Amniotic<br/>Fluid'],
            title: null,
            gridLineColor: '#000000',
            gridLineWidth: 1,
        },
        tooltip:{
            formatter: function(){
                var val = this;
                return heatMapTooltipFormat(val);
            }
        },
        legend: {
            enabled:false
        },
        
        colorAxis: {
            stops: [
                [0,'green'],
                [0.5,'orange'],
                [0.9,'red']
            ],
            min: -20
        },



        series: [{
            borderWidth: 1,
            background: "#000000",
            shadow: false,
            borderColor: "#FFFFFF",
            data: amniotic,
            name: 'Amniotic Fluid',
            dataLabels: {
                enabled: true,
                color: '#000000',                
            }
        }]

    });
}

function mouldingGraph(graph_id, moulding, tickPositions){
    $(graph_id).show();
    $(graph_id).highcharts({

        chart: {
            type: 'heatmap',
            marginLeft: chartMargin
        },
        title: {
            text: ''
        },

        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                millisecond: '%H:%M:%S.%L',
                second: '%H:%M:%S',
                minute: '%H:%M',
                hour: '%H:%M',
                day: '%e %b',
                week: '%e %b',
                month: '%b \'%y',
                year: '%Y'
            },
            min: tickPositions[0],
            max: tickPositions.slice(-1).pop(),
            tickPositions: tickPositions,
            labels: {
                formatter: function () {
                  return Highcharts.dateFormat('%I:%M %p', this.value);
                },
                step: getStep(),
            },
            title: {
                text: ''
            },
            gridLineColor: '#000000',
            gridLineWidth: 1,
        },

        yAxis: {
            categories: ['Moulding'],
            title: null,
            gridLineColor: '#000000',
            gridLineWidth: 1,
        },

        tooltip:{
            formatter: function(){
                var val = this;
                return heatMapTooltipFormat(val);
            }
        },

        legend: {
            enabled:false
        },
        
        colorAxis: {
            stops: [
                [0,'green'],
                [0.5,'orange'],
                [0.9,'red']
            ],
            min: -20
        },

        series: [{
            borderWidth: 1,
            background: "#000000",
            shadow: false,
            borderColor: "#FFFFFF",
            data: moulding,
            name: 'Moulding',
            dataLabels: {
                enabled: true,
                color: '#000000',                
            }
        }]

    });
}

function amnioticMouldingGraph(graph_id, amniotic_moulding, tickPositions){
    $(graph_id).show();
    $(graph_id).highcharts({

        chart: {
            type: 'heatmap',
            marginLeft: chartMargin
        },
        title: {
            text: ''
        },

        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                millisecond: '%H:%M:%S.%L',
                second: '%H:%M:%S',
                minute: '%H:%M',
                hour: '%H:%M',
                day: '%e %b',
                week: '%e %b',
                month: '%b \'%y',
                year: '%Y'
            },
            min: tickPositions[0],
            max: tickPositions.slice(-1).pop(),
            tickPositions: tickPositions,
            labels: {
                formatter: function () {
                  return Highcharts.dateFormat('%I:%M %p', this.value);
                },
                step: getStep(),
            },
            title: {
                text: ''
            },
            gridLineColor: '#000000',
            gridLineWidth: 1,
        },

        yAxis: {
            categories: [
                // 'Moulding', 
                'Amniotic<br/>Fluid'],
            title: null,
            gridLineColor: '#000000',
            gridLineWidth: 1,
        },
        tooltip:{
            formatter: function(){
                var val = this;
                return heatMapTooltipFormat(val);
            }
        },

        legend: {
            enabled:false
        },
        
        colorAxis: {
            stops: [
                [0,'green'],
                [0.5,'orange'],
                [0.9,'red']
            ],
            min: -20
        },

        series: [{
            borderWidth: 1,
            background: "#000000",
            shadow: false,
            borderColor: "#FFFFFF",
            name: 'Amniotic Fluid & Moulding',
            data: amniotic_moulding,
            dataLabels: {
                enabled: true,
                color: '#000000',                
            }
        }]

    });
}

function oxytocinGraph(graph_id, oxytocin, tickPositions){
    $(graph_id).show();
    $(graph_id).highcharts({

        chart: {
            type: 'heatmap',
            marginLeft: chartMargin
        },
        title: {
            text: ''
        },

        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                millisecond: '%H:%M:%S.%L',
                second: '%H:%M:%S',
                minute: '%H:%M',
                hour: '%H:%M',
                day: '%e %b',
                week: '%e %b',
                month: '%b \'%y',
                year: '%Y'
            },
            min: tickPositions[0],
            max: tickPositions.slice(-1).pop(),
            tickPositions: tickPositions,
            labels: {
                formatter: function () {
                  return Highcharts.dateFormat('%I:%M %p', this.value);
                },
                step: getStep(),
            },
            title: {
                text: ''
            },
            gridLineColor: '#000000',
            gridLineWidth: 1,
        },

        yAxis: {
            categories: ['Drops<br/>(Per Min)', 'Oxytocin<br/>(U/L)'],
            title: null,
            gridLineColor: '#000000',
            gridLineWidth: 1,
        },
        tooltip: {
            formatter: function(){
                var val = this;
                return heatMapTooltipFormat(val);
            }
        },
        legend: {
            enabled:false
        },
        
        colorAxis: {
            stops: [
                [0,'green'],
                [0.5,'orange'],
                [0.9,'red']
            ],
            min: -20
        },

        series: [{
            borderWidth: 1,
            background: "#000000",
            shadow: false,
            borderColor: "#FFFFFF",
            data: oxytocin,
            name: 'Oxytocin',
            dataLabels: {
                enabled: true,
                color: '#000000'            
            }
        }]

    });
}

function drugsGraph(graph_id, drugs, tickPositions){
    $(graph_id).show();
    $(graph_id).highcharts({

        chart: {
            type: 'heatmap',
            marginLeft: chartMargin
        },
        title: {
            text: ''
        },

        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                millisecond: '%H:%M:%S.%L',
                second: '%H:%M:%S',
                minute: '%H:%M',
                hour: '%H:%M',
                day: '%e %b',
                week: '%e %b',
                month: '%b \'%y',
                year: '%Y'
            },
            min: tickPositions[0],
            max: tickPositions.slice(-1).pop(),
            tickPositions: tickPositions,
            labels: {
                formatter: function () {
                  return Highcharts.dateFormat('%I:%M %p', this.value);
                },
                step: getStep(),
            },
            title: {
                text: ''
            },
            gridLineColor: '#000000',
            gridLineWidth: 1,
        },

        yAxis: {
            categories: ['Drugs<br/>and IV<br/>Fluids'],
            title: null,
            gridLineColor: '#000000',
            gridLineWidth: 1,
        },
        tooltip:{
            formatter: function(){
                var val = this;
                return heatMapTooltipFormat(val);
            }
        },
        legend: {
            enabled:false
        },
        
        colorAxis: {
            stops: [
                [0,'green'],
                [0.5,'orange'],
                [0.9,'red']
            ],
            min: -20
        },

        plotOptions: {
            series: {
                borderWidth: 1,
                background: "#000000",
                shadow: false,
                borderColor: "#FFFFFF",
                dataLabels: {
                    enabled: true,
                    color: '#000000',
                    overflow: 'none',
                    verticalAlign: "middle",
                    align: "center"
                }
            }
        },
        series: [{
            name: 'Drugs',
            data: drugs
        }]

    });
}

function oldTemperatureGraph(graph_id, temperature, tickPositions){
    $(graph_id).show();
    $(graph_id).highcharts({

        chart: {
            type: 'heatmap',
            marginLeft: chartMargin
        },
        title: {
            text: ''
        },

        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                millisecond: '%H:%M:%S.%L',
                second: '%H:%M:%S',
                minute: '%H:%M',
                hour: '%H:%M',
                day: '%e %b',
                week: '%e %b',
                month: '%b \'%y',
                year: '%Y'
            },
            min: tickPositions[0],
            max: tickPositions.slice(-1).pop(),
            tickPositions: tickPositions,
            labels: {
                formatter: function () {
                  return Highcharts.dateFormat('%I:%M %p', this.value);
                },
                step: getStep(),
            },
            title: {
                text: ''
            },
            gridLineColor: '#000000',
            gridLineWidth: 1,
        },

        yAxis: {
            categories: ['Temp<br/>(F)'],
            title: null,
            gridLineColor: '#000000',
            gridLineWidth: 1,
        },
        tooltip:{
            formatter: function(){
                var val = this;
                return heatMapTooltipFormat(val);
            }
        },
        legend: {
            enabled:false
        },
        
        colorAxis: {
            stops: [
                [0,'green'],
                [0.5,'orange'],
                [0.9,'red']
            ],
            min: -20
        },

        plotOptions: {
            series: {
                borderWidth: 1,
                background: "#000000",
                shadow: false,
                borderColor: "#FFFFFF",
                dataLabels: {
                    enabled: true,
                    color: '#000000',
                    overflow: 'none',
                    verticalAlign: "middle",
                    align: "center"
                }
            }
        },
        series: [{
            name: 'Temperature',
            data: temperature
        }]

    });
}

function temperatureGraph(graph_id, temperature, tickPositions){
    $(graph_id).show();
    $(graph_id).highcharts({
        chart: {
            marginLeft: chartMargin
        },
        title: {
            text: '',
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                millisecond: '%H:%M:%S.%L',
                second: '%H:%M:%S',
                minute: '%H:%M',
                hour: '%H:%M',
                day: '%e %b',
                week: '%e %b',
                month: '%b \'%y',
                year: '%Y'
            },
            min: tickPositions[0],
            max: tickPositions.slice(-1).pop(),
            tickPositions: tickPositions,
            labels: {
                formatter: function () {
                  return Highcharts.dateFormat('%I:%M %p', this.value);
                },
                step: getStep(),
            },
            title: {
                text: ''
            },
            gridLineColor: '#000000',
            gridLineWidth: 1,
        },
        yAxis: {
            title: {
                text: 'Temperature (Fahrenheit)'
            },
            tickInterval: 1,
            gridLineColor: '#000000',
            gridLineWidth: 1,
            min: 94,
            max: 108,
            tickPositioner: function () {
                var positions = [],
                i = 94;
                while(i <= 108){
                    positions.push(i);
                    i+=2;
                }
                return positions;
            }
        },
        tooltip: {
            formatter: function(){
                var val = this;
                return tooltipFormat(val);
            }
        },
        legend: {
            align: 'right',
            verticalAlign: 'top',
            layout: 'vertical',
            y:0,

            itemMarginTop: itemMargin,
            itemMarginBottom: itemMargin,
            itemStyle: {
                lineHeight: legendFont.toString() + 'px',
                fontSize: legendFont.toString() + 'px'
            },
            borderWidth: 1,
            borderColor: '#000000',
            zIndex: 2,
            backgroundColor : '#FFFFFF',
            floating : true,

        },
        series: [
            {
                name: 'Temperature (Fahrenheit)',
                data: temperature,
                lineWidth: lineWidth,
                marker:{
                    radius : markerRadius,
                    symbol: "circle"
                },
                color: '#278DD1'
            }
        ]
    });
}

function contractionsGraph(graph_id, contractions, contractions_intensity, tickPositions){

    $(graph_id).show();
    $(graph_id).highcharts({
        chart: {
            type: 'column',
            marginLeft: chartMargin
        },
        title: {
            text: '',
        },
        legend: {
            align: 'right',
            verticalAlign: 'bottom',
            layout: 'horizontal',
            y:-20,

            itemMarginTop: itemMargin,
            itemMarginBottom: itemMargin,
            itemStyle: {
                lineHeight: legendFont.toString() + 'px',
                fontSize: legendFont.toString() + 'px'
            },
            borderWidth: 1,
            borderColor: '#000000',
            zIndex: 2,
            backgroundColor : '#FFFFFF',
            floating : true,

        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                millisecond: '%H:%M:%S.%L',
                second: '%H:%M:%S',
                minute: '%H:%M',
                hour: '%H:%M',
                day: '%e %b',
                week: '%e %b',
                month: '%b \'%y',
                year: '%Y'
            },
            min: tickPositions[0],
            max: tickPositions.slice(-1).pop(),
            tickPositions: tickPositions,
            labels: {
                formatter: function () {
                  return Highcharts.dateFormat('%I:%M %p', this.value);
                },
                step: getStep(),
            },
            title: {
                text: ''
            },
            gridLineColor: '#000000',
            gridLineWidth: 1,
        },
        yAxis: {
            min: 0,
            max: 5,
            tickPositions:[0,1,2,3,4,5],
            title: {
                text: 'Contractions (10 Min)'
            },
            gridLineColor: '#000000',
            gridLineWidth: 1,
        },
        tooltip:{
            formatter: function(){
                var val = this;
                return tooltipFormat(val);
            }
        },
        plotOptions: {
            series: {
                pointPadding: 0, // Defaults to 0.1
                groupPadding: 0 // Defaults to 0.2
            },
            column: {
                stacking:'normal',
                pointPadding: 0.1,
                borderWidth: 1,
                pointRange: 0,
                pointPlacement: 'between',
                dataLabels: {
                    enabled: true,
                    rotation: -90,
                    color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
                    style: {
                        textShadow: '0 0 3px black'
                    },
                    formatter: function(){
                        var obj = contractions_intensity;
                        if(this.point.y > 0){
                            //Because of middle align, 15 mins are added.
                            return obj[parseInt(this.point.x) - (900*1000)];
                        }
                    }
                }
            },

        },
        series: contractions
    });
}


function bpPulseGraph(graph_id, systolic_bp, diastolic_bp, pulse, tickPositions){
    $(graph_id).show();
    $(graph_id).highcharts({
        chart: {
            marginLeft: chartMargin
        },
        title: {
            text: '',
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                millisecond: '%H:%M:%S.%L',
                second: '%H:%M:%S',
                minute: '%H:%M',
                hour: '%H:%M',
                day: '%e %b',
                week: '%e %b',
                month: '%b \'%y',
                year: '%Y'
            },
            min: tickPositions[0],
            max: tickPositions.slice(-1).pop(),
            tickPositions: tickPositions,
            labels: {
                formatter: function () {
                  return Highcharts.dateFormat('%I:%M %p', this.value);
                },
                step: getStep(),
            },
            title: {
                text: ''
            },
            gridLineColor: '#000000',
            gridLineWidth: 1,
        },
        yAxis: {
            title: {
                text: 'Pulse & Blood Pressure'
            },
            tickInterval: 1,
            gridLineColor: '#000000',
            gridLineWidth: 1,
            min: 60,
            max: 180,
            tickPositioner: function () {
                var positions = [],
                i = 60;
                while(i <= 180){
                    positions.push(i);
                    i+=10;
                }
                return positions;
            }
        },
        tooltip: {
            formatter: function(){
                var val = this;
                return tooltipFormat(val);
            }
        },
        legend: {
            align: 'right',
            verticalAlign: 'bottom',
            layout: 'horizontal',
            y:-20,

            itemMarginTop: itemMargin,
            itemMarginBottom: itemMargin,
            itemStyle: {
                lineHeight: legendFont.toString() + 'px',
                fontSize: legendFont.toString() + 'px',
            },
            borderWidth: 1,
            borderColor: '#000000',
            zIndex: 2,
            backgroundColor : '#FFFFFF',
            floating : true,

        },
        series: [
            {
                name: 'Pulse',
                data: pulse,
                lineWidth: lineWidth,
                marker:{
                    radius : markerRadius,
                    symbol: "triangle"
                },
                color: '#93eb82'
            },
            {
                name: 'Systolic BP',
                data: systolic_bp,
                lineWidth: lineWidth,
                marker:{
                    radius : markerRadius,
                    symbol: "circle"
                },
                color: '#278DD1'
            },
            {
                name: 'Diastolic BP',
                data: diastolic_bp,
                lineWidth: lineWidth,
                marker:{
                    radius : markerRadius,
                    symbol: "square"
                },
                color: '#012F68'
            },
        ]
    });
}


function bpGraph(graph_id, systolic_bp, diastolic_bp, tickPositions){
    $(graph_id).show();
    $(graph_id).highcharts({
        chart: {
            marginLeft: chartMargin
        },
        title: {
            text: '',
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                millisecond: '%H:%M:%S.%L',
                second: '%H:%M:%S',
                minute: '%H:%M',
                hour: '%H:%M',
                day: '%e %b',
                week: '%e %b',
                month: '%b \'%y',
                year: '%Y'
            },
            min: tickPositions[0],
            max: tickPositions.slice(-1).pop(),
            tickPositions: tickPositions,
            labels: {
                formatter: function () {
                  return Highcharts.dateFormat('%I:%M %p', this.value);
                },
                step: getStep(),
            },
            title: {
                text: ''
            },
            gridLineColor: '#000000',
            gridLineWidth: 1,
        },
        yAxis: {
            title: {
                text: 'Blood Pressure'
            },
            tickInterval: 1,
            gridLineColor: '#000000',
            gridLineWidth: 1,
            min: 60,
            max: 180,
            tickPositioner: function () {
                var positions = [],
                i = 60;
                while(i <= 180){
                    positions.push(i);
                    i+=10;
                }
                return positions;
            }
        },
        tooltip: {
            formatter: function(){
                var val = this;
                return tooltipFormat(val);
            }
        },
        legend: {
            align: 'right',
            verticalAlign: 'top',
            layout: 'vertical',
            y:0,

            itemMarginTop: itemMargin,
            itemMarginBottom: itemMargin,
            itemStyle: {
                lineHeight: legendFont.toString() + 'px',
                fontSize: legendFont.toString() + 'px',
            },
            borderWidth: 1,
            borderColor: '#000000',
            zIndex: 2,
            backgroundColor : '#FFFFFF',
            floating : true,

        },
        series: [
            {
                name: 'Systolic BP',
                data: systolic_bp,
                lineWidth: lineWidth,
                marker:{
                    radius : markerRadius,
                    symbol: "circle"
                },
                color: '#278DD1'
            },
            {
                name: 'Diastolic BP',
                data: diastolic_bp,
                lineWidth: lineWidth,
                marker:{
                    radius : markerRadius,
                    symbol: "square"
                },
                color: '#012F68'
            },
        ]
    });
}

function pulseGraph(graph_id, pulse, tickPositions){
    $(graph_id).show();
    $(graph_id).highcharts({
        chart: {
            marginLeft: chartMargin
        },
        title: {
            text: '',
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                millisecond: '%H:%M:%S.%L',
                second: '%H:%M:%S',
                minute: '%H:%M',
                hour: '%H:%M',
                day: '%e %b',
                week: '%e %b',
                month: '%b \'%y',
                year: '%Y'
            },
            min: tickPositions[0],
            max: tickPositions.slice(-1).pop(),
            tickPositions: tickPositions,
            labels: {
                formatter: function () {
                  return Highcharts.dateFormat('%I:%M %p', this.value);
                },
                step: getStep(),
            },
            gridLineColor: '#000000',
            gridLineWidth: 1,
        },
        yAxis: {
            title: {
                text: 'Pulse Rate'
            },
            tickInterval: 1,
            gridLineColor: '#000000',
            gridLineWidth: 1,
            min: 60,
            max: 180,
            tickPositioner: function () {
                var positions = [],
                i = 60;
                while(i <= 180){
                    positions.push(i);
                    i+=10;
                }
                return positions;
            }
        },
        tooltip: {
            formatter: function(){
                var val = this;
                return tooltipFormat(val);
            }
        },
        legend: {
            enabled : false
        },
        series: [
            {
                name: 'Pulse',
                data: pulse,
                lineWidth: lineWidth,
                marker:{
                    radius : markerRadius,
                    symbol: "circle"
                },
                color: '#278DD1'
            }
        ]
    });
}

function fetalGraph(graph_id, fetal, tickPositions){
    $(graph_id).show();
    $(graph_id).highcharts({
        chart: {
            marginLeft: chartMargin
        },
        title: {
            text: '',
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                millisecond: '%H:%M:%S.%L',
                second: '%H:%M:%S',
                minute: '%H:%M',
                hour: '%H:%M',
                day: '%e %b',
                week: '%e %b',
                month: '%b \'%y',
                year: '%Y'
            },
            min: tickPositions[0],
            max: tickPositions.slice(-1).pop(),
            tickPositions: tickPositions,
            labels: {
                formatter: function () {
                  return Highcharts.dateFormat('%I:%M %p', this.value);
                },
                step: getStep(),
            },
            title: {
                text: ''
            },
            gridLineColor: '#000000',
            gridLineWidth: 1,
        },
        yAxis: {
            title: {
                text: 'Fetal Heart Rate'
            },
            tickInterval: 1,
            gridLineColor: '#000000',
            gridLineWidth: 1,
            min: 80,
            max: 200,
            plotLines: [
                {
                    color: '#000000',
                    width: 3,
                    value: 110
                },
                {
                    color: '#000000',
                    width: 3,
                    value: 170
                },
            ],
            tickPositioner: function () {
                var positions = [],
                i = 80;
                while(i <= 200){
                    positions.push(i);
                    i+=10;
                }
                return positions;
            }
        },
        tooltip: {
            valueSuffix: '',
            formatter: function(){
                var val = this;
                return tooltipFormat(val);
            }
        },
        legend: {
            layout: 'horizontal',
            align: 'center',
            borderWidth: 0,
            enabled: false
        },
        series: [
            {
                name: 'Fetal Heart Rate',
                data: fetal,
                lineWidth: lineWidth,
                marker:{
                    radius : markerRadius,
                    symbol: "circle"
                },
                color: '#278DD1'
            }
        ]
    });
}

function cervixGraph(graph_id, cervix, alert, action, tickPositions){

    var series_data = [
        {
            name: 'Cervix Diameter (cm)',
            data: cervix,
            lineWidth: lineWidth,
            marker:{
                radius : markerRadius,
            },
            color: '#278DD1'
        }
    ];

    if(alert.length > 0){
        series_data.push({
            name: 'Alert',
            data: alert,
            showInLegend: false,
            enableMouseTracking: false,
            marker: {
                enabled: false
            },
            width: alertWidth,
            color: '#179D62'
        });
        series_data.push({
            name: 'Action',
            data: action,
            showInLegend: false,
            enableMouseTracking: false,
            marker: {
                enabled: false
            },
            width: alertWidth,
            color: '#D92400'
        });
    }

    $(graph_id).show();
    $(graph_id).highcharts({
        title: {
            text: '',
        },
        chart: {
            marginLeft: chartMargin,
            events: {
                redraw: function () {
                    var chart = this;
                    if(alert.length > 0){
                        var coords = getTextCoords(chart);
                        $.each(coords, function(index, value){
                            $('#' + value['text'] + '_text').remove();
                            chart.renderer.text(value['text'], value['x'], value['y'])
                                .attr({
                                    rotation: value['slope_deg'],
                                    id : value['text'] + '_text'
                                })
                                .css({
                                    color: '#222222',
                                    fontSize: value['fontSize']
                                })
                                .add();
                        });
                    }
                }
            }
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                millisecond: '%H:%M:%S.%L',
                second: '%H:%M:%S',
                minute: '%H:%M',
                hour: '%H:%M',
                day: '%e %b',
                week: '%e %b',
                month: '%b \'%y',
                year: '%Y'
            },
            min: tickPositions[0],
            max: tickPositions.slice(-1).pop(),
            tickPositions: tickPositions,
            labels: {
                formatter: function () {
                  return Highcharts.dateFormat('%I:%M %p', this.value);
                },
                step: getStep(),
            },
            title: {
                text: ''
            },
            gridLineColor: '#000000',
            gridLineWidth: 1,
        },
        yAxis: {
            title: {
                text: 'Cervix Diameter (cm)'
            },
            tickInterval: 1,
            min: 4,
            max: 10,
            gridLineColor: '#000000',
            gridLineWidth: 1,
        },
        tooltip: {
            valueSuffix: ' cm',
            formatter: function(){
                var val = this;
                return tooltipFormat(val);
            }
        },
        legend: {
            align: 'right',
            verticalAlign: 'bottom',
            layout: 'vertical',
            y:-20,

            itemMarginTop: itemMargin,
            itemMarginBottom: itemMargin,
            itemStyle: {
                lineHeight: legendFont.toString()+ 'px',
                fontSize: legendFont.toString() + 'px',
            },
            borderWidth: 1,
            borderColor: '#000000',
            zIndex: 2,
            backgroundColor : '#FFFFFF',
            floating : true,

        },
        series: series_data
    }, function (chart) { // on complete
        if(alert.length > 0){
            var coords = getTextCoords(chart);
            $.each(coords, function(index, value){
                $('#' + value['text'] + '_text').remove();
                $.each(coords, function(index, value){
                    $('#' + value['text'] + '_text').remove();
                    chart.renderer.text(value['text'], value['x'], value['y'])
                        .attr({
                            rotation: value['slope_deg'],
                            id : value['text'] + '_text'
                        })
                        .css({
                            color: '#222222',
                            fontSize: value['fontSize']
                        })
                        .add();
                });
            });
        }
    });
}

function descentGraph(graph_id, descent, alert, action, tickPositions){
    $(graph_id).show();
    $(graph_id).highcharts({
        title: {
            text: '',
        },
        chart: {
            marginLeft: chartMargin,
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                millisecond: '%H:%M:%S.%L',
                second: '%H:%M:%S',
                minute: '%H:%M',
                hour: '%H:%M',
                day: '%e %b',
                week: '%e %b',
                month: '%b \'%y',
                year: '%Y'
            },
            min: tickPositions[0],
            max: tickPositions.slice(-1).pop(),
            tickPositions: tickPositions,
            labels: {
                formatter: function () {
                  return Highcharts.dateFormat('%I:%M %p', this.value);
                },
                step: getStep(),
            },
            title: {
                text: ''
            },
            gridLineColor: '#000000',
            gridLineWidth: 1,
        },
        yAxis: {
            title: {
                text: 'Head Descent'
            },
            tickInterval: 1,
            min: -4,
            max: 4,
            gridLineColor: '#000000',
            gridLineWidth: 1,
        },
        tooltip: {
            valueSuffix: '',
            formatter: function(){
                var val = this;
                return tooltipFormat(val);
            }
        },
        legend: {
            align: 'right',
            verticalAlign: 'bottom',
            layout: 'vertical',
            y:-20,

            itemMarginTop: itemMargin,
            itemMarginBottom: itemMargin,
            itemStyle: {
                lineHeight: legendFont.toString()+ 'px',
                fontSize: legendFont.toString() + 'px',
            },
            borderWidth: 1,
            borderColor: '#000000',
            zIndex: 2,
            backgroundColor : '#FFFFFF',
            floating : true,

        },
        series: [
            {
                name: 'Descent of Head',
                data: descent,
                lineWidth: lineWidth,
                marker:{
                    radius : markerRadius,
                    symbol: "square"
                },
                color: '#012F68'
            }
        ]
    }, function (chart) { 
        // on complete
    });
}

function getTextCoords(chart){

    var texts = ['Alert', 'Action'];
    var final_response = [];
    var i = 0;

    // var cervix_val = 0;
    // var cervix_val_diff = 1;
    
    // if(chart.series[0].data.length > 0){
    //     cervix_val = chart.series[0].data[0].y;
    //     var cervix_val_diff = 5 - (cervix_val - 4);
    // }
    
    // if(cervix_val_diff < 1){
    //     cervix_val_diff = 1;
    // }

    while(i < 2){
        var point_1 = chart.series[i+1].data[0];
        var point_2 = chart.series[i+1].data[5];
        var slope = (point_2.plotY - point_1.plotY)/(point_2.plotX - point_1.plotX);
        var slope_deg = Math.atan(slope)*180/Math.PI;
        var width = $(window).width();
        var fontSize = 6 + (12/1280)*width;
        var diff = (10/1280)*width;
        var result = {
                'x' : point_2.plotX + chart.plotLeft - diff, 
                'y' : point_2.plotY + chart.plotTop, 
                'fontSize': fontSize + 'px', 
                'slope_deg' : slope_deg,
                'text' : texts[i]
            };
        final_response.push(result);
        i++;
    }
    return final_response;
}