Highcharts.theme = {
    colors: ['#673784', '#c82506', '#FFFFFF', '#DDDF00', '#24CBE5', '#64E572', 
             '#FF9655', '#FFF263', '#6AF9C4'],
    chart: {
        backgroundColor: {
            linearGradient: [0, 0, 500, 500],
            stops: [
                [0, 'rgb(255, 255, 255)'],
                [1, 'rgb(240, 240, 255)']
            ]
        },
    },
    title: {
        style: {
            color: '#000',
            font: 'bold 16px "Trebuchet MS", Verdana, sans-serif'
        }
    },
    subtitle: {
        style: {
            color: '#666666',
            font: 'bold 12px "Trebuchet MS", Verdana, sans-serif'
        }
    },

    legend: {
        itemStyle: {
            font: '9pt Trebuchet MS, Verdana, sans-serif',
            color: 'black'
        },
        itemHoverStyle:{
            color: 'gray'
        }   
    }
};

// Apply the theme
Highcharts.setOptions(Highcharts.theme);


function semiPieChart(data, attributes){
    $('#' + attributes.selector_id).highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: 0,
            plotShadow: false,
            backgroundColor: '#DDD',
        },
        title: {
            text: attributes.title,
            align: 'center',
            verticalAlign: 'top',
        },
        tooltip: {
            pointFormat: '<b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                dataLabels: {
                    enabled: false,
                },
                showInLegend: true,
                startAngle: -90,
                endAngle: 90,
                center: ['50%', '75%']
            },
            series: {
                dataLabels: {
                    enabled: true,
                    formatter: function() {
                        return this.key + '<br/>' + Math.round(this.percentage*100)/100 + ' %';
                    },
                    distance: -30,
                    color:'white',
                    style: {
                        textShadow: false 
                    }
                }
            }

        },
        series: [{
            type: 'pie',
            name: attributes.series_name,
            innerSize: '50%',
            data: data
        }],
    });
}

function pieChart(data, attributes){
    $('#' + attributes.selector_id).highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie',
            backgroundColor: '#DDD',
        },
        title: {
            text: attributes.title
        },
        tooltip: {
            pointFormat: '<b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false
                },
                showInLegend: true
            },
            series: {
                dataLabels: {
                    enabled: true,
                    formatter: function() {
                        return this.key + '<br/>' + Math.round(this.percentage*100)/100 + ' %';
                    },
                    distance: -30,
                    color:'white',
                    style: {
                        textShadow: false 
                    }
                }
            }
        },
        series: [{
            name: attributes.series_name,
            colorByPoint: true,
            data: data
        }]
    });
}

function lineChart(data, attributes){
    var labelStep = 2;
    if(data){
        var totalDataPoints = data[0]['data'].length;
        labelStep = parseInt(totalDataPoints/12) + 1;
    }
    $('#' + attributes.selector_id).highcharts({
        chart:{
            backgroundColor: '#DDD',
        },
        title: {
            text: attributes.title,
            x: -20 //center
        },
        xAxis: {
            categories: attributes.categories,
            labels:{
                step:labelStep
            }
        },
        yAxis: {
            title: {
                text: attributes.y_axis_title
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }],
            min: 0,
        },
        series: data
    });
}

function stackedBarChart(data, attributes){
    $('#' + attributes.selector_id).highcharts({
        chart: {
            type: 'bar',
            backgroundColor: '#DDD',
        },
        title: {
            text: attributes.title
        },
        xAxis: {
            categories: attributes.categories,
            allowDecimals: false,
        },
        yAxis: {
            min: 0,
            title: {
                text: attributes.series_name
            },
            allowDecimals: false,
        },
        legend: {
            reversed: true
        },
        plotOptions: {
            series: {
                stacking: 'normal'
            }
        },
        series: data
    });
}