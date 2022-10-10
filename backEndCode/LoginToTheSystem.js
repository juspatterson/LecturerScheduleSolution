$(document).ready(function () {
    login()
})

function login() {
    $('#login-button').on('click', function (event) {
        event.preventDefault();
        alert("User name or Password are incorrect.")
    })


}