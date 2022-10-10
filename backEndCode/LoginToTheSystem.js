$(document).ready(function () {
    login()
})

function login() {
    $('#login-button').on('click', function (event) {
        event.preventDefault();
        alert("Username or Password are incorrect.")
    })


}