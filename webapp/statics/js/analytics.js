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

function getDashboardDataV2(){
    var from_time = $('#daterange').data('daterangepicker').startDate.format('X');
    var to_time = $('#daterange').data('daterangepicker').endDate.format('X');

    var place_ids = $('#place-selector').val() ? $('#place-selector').val().join() : '';
    if (place_ids.length == 0) {
        alert('Please select at least one place to view the details.');
        return false;
    }

    $('#page-wrapper').mask("Loading...");
    $.ajax({
        type: "GET",
        data: {
            'from_time': from_time,
            'to_time': to_time,
            'place_ids': place_ids
        },
        url: window.location.origin + '/api/v2/dashboard-data/',
        success: function(response) {
            setDashboardDataV2(response);
            initializeToolTips();
            $('#page-wrapper').unmask();
        },
        error: function(response){
            alert('Something went wrong.');
            $('#page-wrapper').unmask();
        }
    });
}

function initializeToolTips() {
    // $('.analytics-tooltip').tooltipster({
    //     contentCloning: true,
    //     maxWidth: 600,
    //     theme: 'tooltipster-janitri',
    //     trigger: 'click'
    // });
}

function prepareFamilyPlanningModal(family_planning_method) {
    var familyPlanningMethods = {
        'LAM': 'LAM',
        'PPS': 'PPS',
        'condom': 'Condom',
        'other': 'Other'
    };
    var html = '';
    var i = 0;
    html += '<div class="analytics-modal">';
    for (var key in family_planning_method) {
        if (family_planning_method.hasOwnProperty(key) && _.get(familyPlanningMethods, key, false)) {
            if (i % 2 == 0) {
                html += '<div class="modal-content-wrapper row">';
            }
            html += '<div class="analytics-modal-block col-md-6">';
            html +=     '<div class="open-search-modal">';
            html +=         '<div class="analytics-modal-value" patients="' + family_planning_method[key]["patients"] + '">' + family_planning_method[key]["count"] + '</div>';
            html +=         '<div class="analytics-modal-attribute">' + familyPlanningMethods[key] + '</div>';
            html +=     '</div>';
            html += '</div>';
            if (i % 2 == 1) {
                html += '</div>';
            }
            i++;
        }
    }
    html += '</div>';

    return html;
}

function prepareHighRiskModal(complications) {
    var highRiskComplications = {
        'severe_anemia': 'Severe Anemia',
        'malpresentation': 'Malpresentation',
        'multiple_pregnancies': 'Multiple Pregnancies',
        'pih': 'PIH',
        'gestational_diabetes_mellitus': 'Gestational Diabetes Mellitus',
        'medical_disorder': 'Medical Disorder',
        'previous_csection': 'Previous C-Section',
        'bad_obstetric_history': 'Bad Obstetric History',
        'sti_rti': 'STI/RTI',
        'hiv': 'HIV',
    };
    var html = '';
    var i = 0;
    html += '<div class="analytics-modal">';
    for (var key in complications) {
        if (complications.hasOwnProperty(key) && _.get(highRiskComplications, key, false)) {
            if (i % 3 == 0) {
                html += '<div class="modal-content-wrapper mt-20 row">';
            }
            html += '<div class="analytics-modal-block col-md-4">';
            html +=     '<div class="open-search-modal">'
            html +=         '<div class="analytics-modal-value" patients="' + complications[key]["patients"] + '">' + complications[key]["count"] + '</div>';
            html +=         '<div class="analytics-modal-attribute">' + highRiskComplications[key] + '</div>';
            html +=     '</div>';
            html += '</div>';
            if (i % 3 == 2) {
                html += '</div>';
            }
            i++;
        }
    }
    html += '</div>';
    return html;
}

function openSearchWithContext(clickedElement, childClass) {
    var patients = clickedElement.find('.' + childClass).attr('patients');
    if (patients && patients != '') {
        window.open('/website/search/?patient_ids=' + patients, '_blank');
    } else {
        alert("No patients are available for this criteria.");
    }
}

function setParamBoxData(paramName, data, dataParam) {
    $('.' + paramName).html(_.get(data, dataParam + '.count', '-'));
    $('.' + paramName).attr('patients', _.get(data, dataParam + '.patients', ''));
}


function setDashboardDataV2(response){
    var data = response;

    // COVID Section

    $('.covid_screened').html(_.get(data, 'covid_screened', '-'));
    $('.covid_screened').attr('patients', _.get(data, 'covid_screened_patients', ''));
    setParamBoxData('covid_high_risk', data, 'covid_patient_risk.high_risk');
    setParamBoxData('covid_moderate_risk', data, 'covid_patient_risk.moderate_risk');
    setParamBoxData('covid_low_risk', data, 'covid_patient_risk.low_risk');

    // Deliveries Section
    $('.total_deliveries').html(_.get(data, 'total_deliveries', '-'));
    $('.total_deliveries').attr('patients', _.get(data, 'delivered_patients', ''));
    setParamBoxData('vacuum', data, 'delivery_type.vacuum');
    setParamBoxData('c_section', data, 'delivery_type.c_section');
    setParamBoxData('normal', data, 'delivery_type.normal');
    setParamBoxData('day', data, 'delivery_time.day');
    setParamBoxData('night', data, 'delivery_time.night');
    setParamBoxData('partograph_generated', data, 'partograph_generated');

    // High Risk Section
    $('.high-risk').html(_.get(data, 'complications.high_risk.count', '-'));
    $('#high-risk-modal').html(prepareHighRiskModal(_.get(data, 'complications', {})));

    // Family Planning Section
    var fpTotal = _.get(data, 'family_planning_method.total.count', 0);
    var ppiucd = _.get(data, 'family_planning_method.PPIUCD.count', 0);

    setParamBoxData('total_family_planning', data, 'family_planning_method.total');
    setParamBoxData('ppiucd', data, 'family_planning_method.PPIUCD');

    // Family Planning Modal
    $('.family_planning_other').html((fpTotal - ppiucd).toString());
    $('#family-planning-modal').html(prepareFamilyPlanningModal(_.get(data, 'family_planning_method', {})));

    // Antenatal Section
    setParamBoxData('antenatal_none', data, 'antenatal_steroid.none');
    setParamBoxData('antenatal_one_dose', data, 'antenatal_steroid.one_dose');
    setParamBoxData('antenatal_two_dose', data, 'antenatal_steroid.two_dose');

    // Maternal Deaths Section
    setParamBoxData('maternal_death', data, 'mother_status.dead');
    setParamBoxData('pph', data, 'mother_death.pph');
    setParamBoxData('sepsis', data, 'mother_death.sepsis');
    setParamBoxData('diabetes', data, 'mother_death.gestational_diabetes_mellitus');
    setParamBoxData('aph', data, 'mother_death.aph');
    setParamBoxData('pih_pre_eclampsia', data, 'mother_death.pih_pre_eclampsia');

    var motherDeathOtherCount = _.get(data, 'mother_death.other.count', 0) +
                                _.get(data, 'mother_death.eclampsia.count', 0) +
                                _.get(data, 'mother_death.anemia.count', 0);

    var motherDeathOtherPatients = _.union(
        _.get(data, 'mother_death.other.patients', ''),
        _.get(data, 'mother_death.eclampsia.patients', ''),
        _.get(data, 'mother_death.anemia.patients', '')
    );

    $('.maternal_death_other').html(motherDeathOtherCount.toString());
    $('.maternal_death_other').attr('patients', motherDeathOtherPatients);

    // Child Births Section
    var freshStillBirth = _.get(data, 'child_status.fresh_still_birth.count', 0);
    var macreatedStillBirth = _.get(data, 'child_status.macreated_still_birth.count', 0);
    $('.still_birth').html(parseInt(freshStillBirth + macreatedStillBirth));
    $('.still_birth').attr('patients', _.union(_.get(data, 'child_status.fresh_still_birth.patients', ''), _.get(data, 'child_status.fresh_still_birth.patients', '')));

    setParamBoxData('live_birth', data, 'child_status.live_birth');
    setParamBoxData('preterm_delivery', data, 'gestation_type.pre_term');
    setParamBoxData('low_birth_weight', data, 'birth_weight.less_than_2500');
    setParamBoxData('breastfeed_within_1_hour', data, 'breastfeeding_within_one_hour.yes');
    setParamBoxData('resuscitated', data, 'resuscitated.yes');
    setParamBoxData('phototherapy', data, 'phototherapy_used.yes');
    setParamBoxData('fresh_still_birth', data, 'child_status.fresh_still_birth');
    setParamBoxData('macreated_still_birth', data, 'child_status.macreated_still_birth');

    // Child Deaths Section
    setParamBoxData('child_death', data, 'child_status.dead');
    setParamBoxData('prematurity', data, 'child_death.prematurity');
    setParamBoxData('child_sepsis', data, 'child_death.sepsis');
    setParamBoxData('asphyxia', data, 'child_death.asphyxia');

    var childDeathOtherCount = _.get(data, 'child_death.other.count', 0) +
                               _.get(data, 'child_death.pneumonia.count', 0) +
                               _.get(data, 'child_death.congenital_heart_disease.count', 0) +
                               _.get(data, 'child_death.jaundice.count', 0) +
                               _.get(data, 'child_death.low_birth_weight.count', 0);

    var childDeathOtherPatients = _.union(
        _.get(data, 'child_death.other.patients', ''),
        _.get(data, 'child_death.pneumonia.patients', ''),
        _.get(data, 'child_death.congenital_heart_disease.patients', ''),
        _.get(data, 'child_death.jaundice.patients', ''),
        _.get(data, 'child_death.low_birth_weight.patients', '')
    );

    $('.neonatal_death_other').html(childDeathOtherCount.toString());
    $('.neonatal_death_other').attr('patients', childDeathOtherPatients);

    // Sex Ratio Section
    var male = _.get(data, 'gender.male.count', 0);
    var female = _.get(data, 'gender.female.count', 0);
    var sexRatio = male > 0 ? parseInt((female/male) * 1000) : '-';
    $('.sex_ratio').html(sexRatio);

    setParamBoxData('male', data, 'gender.male');
    setParamBoxData('female', data, 'gender.female');

    // Immunization Section
    setParamBoxData('bcg', data, 'immunization.BCG');
    setParamBoxData('opv_0', data, 'immunization.OPV -0');
    setParamBoxData('hep_b', data, 'immunization.Hep B');
    setParamBoxData('vitamin_k1', data, 'immunization.Vitamin K1');

    //Set Alert Indicator
    var alertNumbers = ['maternal_death', 'pph', 'sepsis', 'diabetes', 'aph', 'pih', 'maternal_death_other',
                        'child_death', 'prematurity', 'child_sepsis', 'asphyxia', 'neonatal_death_other',
                        'still_birth', 'fresh_still_birth', 'macreated_still_birth'];
    $.each(alertNumbers, function(index, value){
        var number = $('.' + value).html();
        if (number != '-' && parseInt(number) != 0){
            $('.' + value).addClass('analytics-number-alert');
        }
    });
}

$(document).ready(function(){

    getAssociatedPlaces(function() {
        getDashboardDataV2();
    });

    $('#fetch_data').click(function(){
        getDashboardDataV2();
    });

    $('.open-search').on('click', function(){
        openSearchWithContext($(this), 'analytics-number');
    });

    $('.open-search-2x').on('click', function(){
        openSearchWithContext($(this), 'analytics-number-2x');
    });

    $('body').on('click', '.open-search-modal', function() {
        openSearchWithContext($(this), 'analytics-modal-value');
    });

    $('.high-risk-popup-link').click(function() {
        Swal.fire({
            title: '',
            html: $('#high-risk-modal').html(),
            showCloseButton: true,
            showCancelButton: false,
            showConfirmButton: false,
            width: '70%',
        })
    });

    $('.family-planning-popup-link').click(function() {
        Swal.fire({
            title: '',
            html: $('#family-planning-modal').html(),
            showCloseButton: true,
            showCancelButton: false,
            showConfirmButton: false,
            width: '50%',
        })
    });
    
});