$(document).ready(function () {
    login()
})

function login() {
    $('#login-button').on('click', function (event) {
        $.ajax({
            type: 'POST',
            // dataType: 'jsonp',
            url: '/api/login',
            async: true,
            data: {'username': $('#username').val(),'password':  $('#password').val() },
            success: function (position) {
                var ojb = JSON.parse(position)

                if (ojb == null) {
                    alert("Username or Password are incorrect.")
                }
                else if (ojb.position == "manager") {
                  window.location.assign('/manager.html');
                }
                else if (ojb.position == "academic") {
                  window.location.assign('/academic.html');
                }
            },
            error: function (obj, textStatus) {
                console.log(obj.msg);
            }
        });
    })
}
