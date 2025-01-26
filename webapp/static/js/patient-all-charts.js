function drawAllValues(response, graph_type){
    Highcharts.setOptions({
      global: {
        useUTC: false
      }
    });

    var first_reading_time = parseInt(moment(response[0]['data_time']).format('x'));
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
                cervix.push([parseInt(moment(value.data_time).format('x')), parseInt(value.param_1)]);
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
                        contractions[tickPositions[intervals-1]] = {'number' : parseInt(value.param_1), 'duration': parseInt(value.param_2), 'intensity': parseInt(value.param_3)};
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
                // var timing = moment(value.data_time).format('x');
                // for(var intervals = 2 ; intervals < tickPositions.length ; intervals+=2){
                //     if(tickPositions[intervals-2] <= parseInt(timing) && parseInt(timing) < tickPositions[intervals]){
                //         temperature[tickPositions[intervals-2]] = value.param_1;
                //     }
                // }
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
    var intensity_labels = ['', 'Mild', 'Moderate', 'Strong'];
                

    for(var intervals = 1 ; intervals < tickPositions.length ; intervals++){
        var label_pos = parseInt((tickPositions[intervals-1] + tickPositions[intervals])/2);
        if(typeof(amniotic[tickPositions[intervals-1]]) === 'undefined'){
            amniotic[tickPositions[intervals-1]] = '';
        }
        if(typeof(moulding[tickPositions[intervals-1]]) === 'undefined'){
            moulding[tickPositions[intervals-1]] = '';
        }

        amniotic_moulding.push([label_pos, 1, amniotic[tickPositions[intervals-1]]]);
        amniotic_moulding.push([label_pos, 0, moulding[tickPositions[intervals-1]]]);

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

        // if(typeof(temperature[tickPositions[intervals-2]]) === 'undefined'){
        //     temperature[tickPositions[intervals-2]] = '';
        // }
        // temperature_data.push([label_pos, 0, temperature[tickPositions[intervals-2]]]);
    }

    switch(graph_type){
        case 'cervix_diameter':
            cervixGraph('#cervix-all-graph', cervix, [], [], tickPositions);
            break;
        case 'head_descent':
            descentGraph('#descent-all-graph', descent, [], [], tickPositions);
            break;    
        case 'blood_pressure':
            bpGraph('#bp-all-graph', systolic_bp, diastolic_bp, tickPositions);
            break;
        case 'pulse_rate':
            pulseGraph('#pulse-all-graph', pulse, tickPositions);
            break;
        case 'fetal_heart_rate':
            fetalGraph('#fetal-all-graph', fetal, tickPositions);
            break;
        case 'amniotic_fluid':
            amnioticGraph('#amniotic-all-graph', amniotic_data, tickPositions);
            break;

        case 'moulding':
            mouldingGraph('#moulding-all-graph', moulding_data, tickPositions);
            break;

        case 'contraction':
            contractionsGraph('#contractions-all-graph', contractions_data, contractions_intensity, tickPositions);
            break;
        case 'oxytocin':
            oxytocinGraph('#oxytocin-all-graph', oxytocin_data, tickPositions);
            break;
        case 'drugs':
            drugsGraph('#drugs-all-graph', drugs_data, tickPositions);
            break;
        case 'temperature':
            temperatureGraph('#temperature-all-graph', temperature, hourTickPostions);
            break;

        case 'all':
            checkScreen();
            $(window).resize(function(){
                checkScreen();
            });
            //Draw Parto Graph
            if(cervix.length > 0){ cervixGraph('#cervix-all-graph', cervix, [], [], tickPositions);}
            if(descent.length > 0){ descentGraph('#descent-all-graph', descent, [], [], tickPositions);}
            //Draw BP Graph
            if(systolic_bp.length > 0){ bpGraph('#bp-all-graph', systolic_bp, diastolic_bp, tickPositions); }
            //Draw Pulse Graph
            if(pulse.length > 0){ pulseGraph('#pulse-all-graph', pulse, tickPositions); }
            //Draw Fetal Graph
            if(fetal.length > 0){ fetalGraph('#fetal-all-graph', fetal, tickPositions); }
            //Draw Amniotic and Moulding Graph
            if(amniotic_moulding.length > 0){ amnioticMouldingGraph('#amniotic-moulding-all-graph', amniotic_moulding, tickPositions); }
            if(contractions_data.length > 0){ contractionsGraph('#contractions-all-graph', contractions_data, contractions_intensity, tickPositions); }
            if(oxytocin_data.length > 0){ oxytocinGraph('#oxytocin-all-graph', oxytocin_data, tickPositions); }
            if(drugs_data.length > 0){ drugsGraph('#drugs-all-graph', drugs_data, tickPositions); }
            if(temperature.length > 0){ temperatureGraph('#temperature-all-graph', temperature, hourTickPostions); }
            break;
    }
}