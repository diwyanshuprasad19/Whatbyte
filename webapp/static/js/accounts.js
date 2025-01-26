function getRole(role){
    switch(role){
        case 'worker':
            return 'Worker';
        case 'doctor':
            return 'Doctor';
        case 'admin':
            return 'Admin';
        default:
            return 'Worker';
    }
}

function setAccounts(){
    var data = {
        'place_id': $('#place_id').val()
    };
    $('#page-wrapper').mask("Loading...");
    $.ajax({
        type: "GET",
        url: window.location.origin + '/api/admin-accounts/',
        headers: { "X-CSRFToken": getCookie("csrftoken") },
        data: data,
        success: function(response) {
            var html = '';
            $.each(response, function(index, value){
                html += '<tr>' +
                            '<td>' + value.first_name + '</td>' +
                            '<td>' + value.email + '</td>' +
                            '<td>' + value.phone + '</td>' +
                            '<td>' + getRole(value.account_type) + '</td>' +
                            '<td>' +
                                '<button user_id="' + value.id + '" type="button" class="btn btn-info btn-sm digiparto-table-btn account-list-delete" data-toggle="modal" data-target="#account-delete-modal">Delete</button>' +
                            '</td>' +
                        '</tr>';
            });
            $('#accounts-table-body').html(html);
            $('#page-wrapper').unmask();
        }
    });
}

function getCookie(c_name){
    if (document.cookie.length > 0){
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1){
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) c_end = document.cookie.length;
            return unescape(document.cookie.substring(c_start,c_end));
        }
    }
    return "";
}

$(document).ready(function(){
    setAccounts();

    $('#account-delete-modal').on('show.bs.modal', function (e) {
        $('#submit-delete-user').attr('user_id', $(e.relatedTarget).attr('user_id'));
    });

    $('#submit-delete-user').on('click', function(){
        $.ajax({
            type: "DELETE",
            url: window.location.origin + '/api/admin-accounts/',
            headers: { "X-CSRFToken": getCookie("csrftoken") },
            data: {
                'user_id': $(this).attr('user_id')
            },
            success: function(response) {
                $('#account-delete-modal').modal('toggle');
                if (response.status == 'success'){
                    alert('User deleted successfully.');
                    window.location.reload();
                } else {
                    alert(response.message);
                }
            }
        });
    });


    $('#submit-add-user').on('click', function(){
        
        var data = {
            'first_name': $('#first_name').val(),
            'email': $('#email').val(),
            'password': $('#password').val(),
            'account_type': $('#account_type').val(),
            'phone': $('#phone').val(),
            'place_id': $('#place_id').val(),
            'location': 'N/A',
            'sms_allowed': $('#sms_allowed').val()
        };
        $.ajax({
            type: "POST",
            url: window.location.origin + '/api/admin-accounts/',
            headers: { "X-CSRFToken": getCookie("csrftoken") },
            data: data,
            success: function(response) {
                window.location.reload();
            }
        });
    });

});