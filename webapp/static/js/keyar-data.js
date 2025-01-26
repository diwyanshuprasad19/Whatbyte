var dataTimes = [];
var keyarValuesByDataTime = {};
var keyarMetaDataByDataTime = {};

function keyarGraphs(response, graph_type, print, idIdentifier, callback) {
    dataTimes = [];
    keyarValuesByDataTime = {};
    keyarMetaDataByDataTime = {};
    var tickPositions = [];
    $.each(response, function(index, dataRow) {
        var data_time = dataRow.data_time;
        if (dataRow.params) {
            $.each(dataRow.params, function(index, dataSet) {
                if(dataTimes.indexOf(data_time) === -1) {
                    dataTimes.push(data_time);
                    keyarValuesByDataTime[data_time] = {};
                    keyarMetaDataByDataTime[data_time] = {};
                }
                if(typeof(keyarMetaDataByDataTime[data_time][dataSet.param_type]) === 'undefined') {
                    keyarMetaDataByDataTime[data_time][dataSet.param_type] = dataSet.meta_data;
                }
                if(typeof(keyarValuesByDataTime[data_time][dataSet.param_type]) === 'undefined') {
                    keyarValuesByDataTime[data_time][dataSet.param_type] = [];
                }
                $.each(dataSet.data_set, function(index, value) {
                    keyarValuesByDataTime[data_time][dataSet.param_type].push(value);
                });
            });
        }
    });
    if(dataTimes.length > 0) {
        $('.no-fhr-mhr-uc').hide();
        setupDataSetChooser(dataTimes);
        buildKeyarGraphs(dataTimes[0]);
    } else {
        $('.no-fhr-mhr-uc').show();
    }
}

function buildKeyarGraphs(dataTime) {

    var tickPositions = [];
    var fhr = keyarValuesByDataTime[dataTime]['fhr'] ? keyarValuesByDataTime[dataTime]['fhr'] : [];
    var mhr = keyarValuesByDataTime[dataTime]['mhr'] ? keyarValuesByDataTime[dataTime]['mhr'] : [];
    var uc = keyarValuesByDataTime[dataTime]['uc'] ? keyarValuesByDataTime[dataTime]['uc'] : [];
    var startTime = 0;

    if (fhr.length > 0) {
        startTime = fhr[0][0];
    } else if (mhr.length > 0) {
        startTime = mhr[0][0];
    } else if (uc.length > 0) {
        startTime = uc[0][0];
    }

    fhrMhrGraph('#keyar-fhr-mhr-graph', fhr, mhr, startTime);
    uterineContractionGraph('#keyar-uc-graph', uc, startTime);
    setContractionsData(dataTime);
}

function setContractionsData(dataTime) {
    $('#keyar-uc-contraction-number').html('-');
    $('#keyar-uc-average-duration').html('-');
    var metaData = keyarMetaDataByDataTime[dataTime]['uc'] ? keyarMetaDataByDataTime[dataTime]['uc'] : {};

    if(typeof(metaData['contractions']) !== 'undefined' && metaData['contractions'].toString() !== "-1") {
        $('#keyar-uc-contraction-number').html(metaData['contractions']);
    }
    if(typeof(metaData['average']) !== 'undefined' && metaData['average'].toString() !== "-1") {
        $('#keyar-uc-average-duration').html(metaData['average']);
    }
}

function setupDataSetChooser(dataTimes) {
    var optionsHtml = '';
    for(var i = 0; i < dataTimes.length; i++) {
        optionsHtml += '<option value="' + dataTimes[i] + '">' + getReadableTime(dataTimes[i]) + '</option>'
    }
    $('.keyar-data-select').html(optionsHtml);
    $(".keyar-data-select").off("change");
    $('.keyar-data-select').on('change', function() {
        buildKeyarGraphs(parseInt($(this).val()));
    });
    $(".selectpicker").selectpicker('refresh');
}

function fhrMhrGraph(graph_id, fhr, mhr, startTime) {

    fhr.sort(function(a, b) {
        if(a[0] > b[0]) return 1;
        if(a[0] < b[0]) return -1;
        return 0;
    });

    mhr.sort(function(a, b) {
        if(a[0] > b[0]) return 1;
        if(a[0] < b[0]) return -1;
        return 0;
    });

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
            min: startTime,
            max: startTime + 10 * 60 * 1000, // Make sure that the graph is for exactly 10 minutes
            // scrollbar: {
            //     enabled: true
            // },
            tickInterval: 60 * 1000,  // 1 hour major grid lines
            minorTickInterval: 30 * 1000, // 30 mins minor grid lines
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
                text: 'FHR & MHR'
            },
            minorTickInterval: 10,
            tickInterval: 30,
            min: 30,
            max: 240,
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
            layout: 'horizontal',
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
                name: 'FHR',
                data: fhr,
                lineWidth: lineWidth,
                marker:{
                    radius : markerRadius,
                    symbol: "circle"
                },
                color: '#278DD1'
            },
            {
                name: 'MHR',
                data: mhr,
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


function uterineContractionGraph(graph_id, uc, startTime) {

    // The below logic is working to make the graph look neat and normalize all values between 0 & 100
    // with a 30% high margin so that the peak does not hit top of the graph

    var ucValues = [];
    var ucMin = 0;
    var ucMax = 0;
    var firstNonZeroDataTime = 0;
    $.each(uc, function(index, value){
        if (ucMin == 0 || value[1] < ucMin) {
            ucMin = value[1];
        }
        if (ucMax == 0 || value[1] > ucMax) {
            ucMax = value[1];
        }
        if (parseFloat(value[1]) > 0 && firstNonZeroDataTime == 0) {
            firstNonZeroDataTime = value[0];
        }
    });

    var multiplier = 100/(ucMax * 130/100);

    $.each(uc, function(index, value){
        value[1] = value[1] * multiplier;
    });

    // The below logic is working to make the graph stretch to a +1 minute duration as the first minute values are waste

    if(dataDuration <= 0) {
        console.log("Cannot draw graph as dataDuration <= 0");
        return false;
    }

    var lastDataTime =  uc.length > 0 ? uc[uc.length - 1][0] : 0;
    var dataDuration = lastDataTime - firstNonZeroDataTime;
    var dataDurationToExtrapolate = lastDataTime - startTime;

    var percentageExtrapolation = (dataDurationToExtrapolate - dataDuration) / dataDuration;

    var ucValues = [];
    $.each(uc, function(index, value) {
        if(value[1] > 0) {
            var extraPolation = parseInt((lastDataTime - value[0]) * percentageExtrapolation);
            ucValues.push([value[0] - extraPolation, value[1]]);
        }
    });

    uc = ucValues;

    uc.sort(function(a, b) {
        if(a[0] > b[0]) return 1;
        if(a[0] < b[0]) return -1;
        return 0;
    });

    $(graph_id).show();
    $(graph_id).highcharts({
        chart: {
            marginLeft: chartMargin,
            type: 'spline'
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
            min: startTime,
            max: startTime + 10 * 60 * 1000, // Make sure that the graph is for exactly 10 minutes
            // scrollbar: {
            //     enabled: true
            // },
            tickInterval: 60 * 1000,  // 1 hour major grid lines
            minorTickInterval: 30 * 1000, // 30 mins minor grid lines
            labels: {
                formatter: function () {
                  return Highcharts.dateFormat('%I:%M %p', this.value);
                },
                step: getStep(),
            },
            title: {
                text: ''
            },
        },
        yAxis: {
            title: {
                text: 'Uterine Contraction'
            },
            tickInterval: 20,
            minorTickInterval: 10,
            gridLineColor: '#000000',
            gridLineWidth: 1,
            min: 0,
            max: 100,
        },
        tooltip: {
            formatter: function(){
                var val = {
                    x: this.x,
                    series: {
                        name: this.series.name
                    },
                    y: ''
                };
                return tooltipFormat(val);
            }
        },
        legend: {
            align: 'right',
            verticalAlign: 'top',
            layout: 'horizontal',
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
                name: 'Uterine Contraction',
                data: uc,
                lineWidth: lineWidth,
                marker:{
                    radius : markerRadius,
                    symbol: "circle"
                },
                color: '#278DD1'
            },
        ]
    });
}