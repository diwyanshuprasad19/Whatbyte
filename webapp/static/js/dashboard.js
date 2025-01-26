function getAge(dob){
    d2 = new Date();
    var diff = d2.getTime() - dob.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function getReadableDate(date_string){
    if(typeof(date_string) === 'undefined' || date_string == '' || parseInt(date_string) == maxTime || parseInt(date_string) == 0){
        return valueNotAvailable;
    } else {
        return moment(date_string*1000).format('DD MMM YYYY');
    }
}

function getReadableTime(date_string){
    if(date_string ==''){
        return 'N/A';
    } else {
        return moment(date_string).format('DD MMM YYYY hh:mm A');
    }
}

function getReadableStatus(status){
    switch(status){
        case 'completed': 
            return 'Complete';
        case 'referred':
            return 'Referred';
        default:
            return 'In Process';
    }
}

function getDashboardData(){
    var from_time = $('#daterange').data('daterangepicker').startDate.format('X');
    var to_time = $('#daterange').data('daterangepicker').endDate.format('X');
    $('#page-wrapper').mask("Loading...");
    $.ajax({
        type: "GET",
        data: {
            'from_time': from_time,
            'to_time': to_time,
            'place_ids': $('#place-selector').val().join()
        },
        url: window.location.origin + '/api/dashboard-data/',
        success: function(response) {
            setDashboardData(response);
            $('#page-wrapper').unmask();
        },
        error: function(response){
            alert('Something went wrong.');
            $('#page-wrapper').unmask();
        }
    });
}

function setDashboardData(response){

    //Semi Pie Chart for Normal/C-Section
    setDeliveryType(response);

    //Full Pie Chart for Male/Female
    setSexRatio(response);
    
    //Stacked Bar Chart for Mother Died, Child Died, Successful
    setLivingStatus(response);

    //Stacked Bar Chart for Patient Status
    setPatientStatus(response);

    //Line Chart for Daily Deliveries
    setDailyDeliveries(response);

}


function setDailyDeliveries(response){

    var from_time = parseInt($('#daterange').data('daterangepicker').startDate.format('x'));
    var to_time = parseInt($('#daterange').data('daterangepicker').endDate.format('x'));

    var categories = [];
    var series_data = [];

    while(from_time <= to_time){
        categories.push(moment(from_time).format('DD MMM'));
        if(typeof(response['daily_deliveries'][moment(from_time).format('YYYY-MM-DD')]) !== 'undefined'){
            series_data.push(parseInt(response['daily_deliveries'][moment(from_time).format('YYYY-MM-DD')]));
        } else {
            series_data.push(0);
        }
        from_time += 86400000;
    }

    var data = [{'name': 'Daily Deliveries', data: series_data}]

    var attributes = {
        'title': 'Daily Deliveries',
        'series_name': '',
        'selector_id': 'daily-delivery',
        'y_axis_title': 'Total Deliveries',
        'categories': categories
    };

    lineChart(data, attributes);

}

function setPatientStatus(response){


    $('#registered_numbers .value').html(response.patient_status_data.registered);
    $('#completed_numbers .value').html(response.patient_status_data.delivered);
    $('#referred_numbers .value').html(response.patient_status_data.referred);
    $('#in_process_numbers .value').html(response.patient_status_data.in_process);

    // var data = [];
    // data.push({name: 'Total', data: [parseInt(response.patient_status_data.in_process), parseInt(response.patient_status_data.referred), parseInt(response.patient_status_data.delivered)]});
    
    // var attributes = {
    //     'title': 'Delivery Status',
    //     'series_name': '',
    //     'selector_id': 'patient-status',
    //     'categories': ['In Progress', 'Referred', 'Completed']
    // };

    // stackedBarChart(data, attributes);
}

function setLivingStatus(response){
    
    var data = [];
    data.push({name: 'Alive', data: [parseInt(response.alive_mother), parseInt(response.alive_male_child), parseInt(response.alive_female_child)]});
    data.push({name: 'Dead', data: [parseInt(response.dead_mother), parseInt(response.dead_male_child), parseInt(response.dead_female_child)]});

    var attributes = {
        'title': 'Life Status<br/>(Alive/Dead)',
        'series_name': '',
        'selector_id': 'living-status',
        'categories': ['Mother', 'Male<br/>Child', 'Female<br/>Child']
    };

    stackedBarChart(data, attributes);
}

function setDeliveryType(response){
    
    var data = [];
    data.push(['Normal', parseInt(response.normal_delivery)]);
    data.push(['C-Section', parseInt(response.c_section)]);

    var attributes = {
        'title': 'Delivery Type<br/>(Normal/C-Section)',
        'series_name': 'Delivery Type',
        'selector_id': 'delivery-type'
    };

    semiPieChart(data, attributes);
}

function setSexRatio(response){
    
    var total_male_child = parseInt(response.alive_male_child) + parseInt(response.dead_male_child);
    var total_female_child = parseInt(response.alive_female_child) + parseInt(response.dead_female_child);
    var total_others = parseInt(response.total_child) - total_male_child - total_female_child;
    var values = {
        'male': total_male_child,
        'female': total_female_child,
        'others': total_others
    };
    var data = [];
    data.push({name: 'Male', y: values['male']});
    data.push({name: 'Female', y: values['female']});
    data.push({name: 'Others', y: values['others']});

    var sexRatio = '';
    if (total_male_child > 0){
        sexRatio = parseInt((total_female_child/total_male_child)*1000).toString() + ':1000';
    } else {
        sexRatio = '0:1000';
    }

    var attributes = {
        'title': 'Sex Ratio at Birth<br/>(' + sexRatio + ')<br/>',
        'series_name': 'Genders',
        'selector_id': 'sex-ratio'
    };

    pieChart(data, attributes);
}

$(document).ready(function(){

    $('#daterange').val(moment().subtract(30, 'days').format('DD MMM YYYY') + ' - ' + moment().format('DD MMM YYYY'));
    $('#daterange').daterangepicker({
        timePicker: false,
        opens: 'left',
        maxDate: moment(),
        format: 'DD MMM YYYY',
        startDate: moment().subtract(30, 'days'),
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

    getAssociatedPlaces(function() {
        getDashboardData();
    });

    $('#fetch_data').click(function(){
        getDashboardData();
    });
    
});