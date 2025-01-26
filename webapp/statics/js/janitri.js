var maxTime = 253402300799;
var valueNotAvailable = '-';

$(document).ready(function(){
    
    $('#refresh-btn').on('click', function(){
        $('body').mask('Loading...');
        window.location.reload();
    });

    $('#current-time').html(moment().format('DD MMM YYYY hh:mm A'));

    $('.save-new-password-btn').on('click', function(){
        if(validateChangePassword()){
            var data = {
                "current_password": $('#current-password').val(),
                "new_password": $('#new-password').val()
            }
            changePassword(data, function(){});
        }
        
    });
});


function validateChangePassword(){
    var currentPassword = $('#current-password').val();
    var newPassword = $('#new-password').val();
    var confirmNewPassword = $('#confirm-new-password').val();
    if(!currentPassword || !newPassword || !confirmNewPassword){
        alert('Please fill all the required fields.');
        return false;
    } else if(newPassword != confirmNewPassword){
        alert('The new password and confirm new password fields do not match.');
        return false;
    } else if(newPassword.length < 6) {
        alert('The new password has to be 6 characters or more.');
        return false;
    }
    return true;
}

function changePassword(data, callback) {
   callAjax(window.location.origin + '/api/change-password/', "POST", data, function(response) {
        if(response["success"]) {
            alert('Your password has changed successully. Please re-login with your new password.');
            window.location.href = window.location.origin + '/website/logout/';
        } else {
            alert(response.data.message);
        }
        callback();
    });
}

function getContractionDurationStep(param2) {
    var step = parseInt(param2/20) + 1;
    if (step > 3) {
        step = 3;
    }
    return step;
}

function generateUUID() {
    var d = new Date().getTime();
    var d2 = (performance && performance.now && (performance.now()*1000)) || 0;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16; //random number between 0 and 16
        if(d > 0){
            //Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {
            //Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function callAjax(url, request_type, data, callback){
    $('#loading').show();
    if (request_type != "GET") {
        data = JSON.stringify(data);
    }
    $.ajax({
        type: request_type,
        data: data,
        url: url,
        beforeSend: function (xhr){
            if(ACCESS_TOKEN != ''){
                xhr.setRequestHeader('Authorization', 'Bearer ' + ACCESS_TOKEN);
            }
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Request-ID', generateUUID());
        },
        success: function(data) {
            $('#loading').hide();
            callback({"data": data, "success": true});
        },
        error: function(response){
            $('#loading').hide();
            var errorMsg = 'Something went wrong. Please try again later.';
            if(response.responseJSON && response.responseJSON.error){
                switch(response.responseJSON.error) {
                    case 'Unauthorized Access':
                        errorMsg = 'You are not authorized to view the data.';
                        break;
                }
                if (request_type != "GET") {
                    errorMsg = response.responseJSON.error;
                }
            }
            callback({"data": {"statusCode": response.status, "message": errorMsg}, "success": false});
        }
    });
}

function getModalOptions(modalTarget='animatedModal', beforeOpen, afterClose){

    modalOptions = {
        animatedIn:'zoomIn',
        animatedOut:'bounceOut',
        modalTarget: modalTarget,
        color:'#801c44',
        overflow: 'scroll',
        beforeOpen: function(clickedDOMElement) {
            beforeOpen(clickedDOMElement);
            $('#' + modalTarget).show();
            $('html, body').css('overflow', 'hidden');
        },
        afterClose: function(clickedDOMElement) {
            afterClose(clickedDOMElement);
            $('html, body').css('overflow', 'auto');
            $('#' + modalTarget).hide();
        }
    }

    return modalOptions;
}


function resetModalHeight(){
    var maxHeight = 0;
    $(".tabs__content-item").each(function() {
        maxHeight = maxHeight > $(this).outerHeight() ? maxHeight : $(this).outerHeight();
    });
    $('.js-tabs-height').height(maxHeight);
}

function getURLParam(paramName) {
    var url = new URL(window.location.href);
    var searchParams = new URLSearchParams(url.search);
    return searchParams.get(paramName);
}

function getReadableTime(date_string){
    if(typeof(date_string) === 'undefined' || date_string == '' || parseInt(date_string) == maxTime || parseInt(date_string) == 0) {
        return valueNotAvailable;
    } else {
        return moment(date_string*1000).format('DD MMM YYYY hh:mm A');
    }
}

function checkUndefined(object, value){
    if (_.get(object, value, false)){
        return _.get(object, value);
    } else {
        return valueNotAvailable;
    }
}

function getData(param){
    if (typeof(param) === 'undefined' || param == ""){
        return valueNotAvailable;
    } else {
        return param;
    }
}
