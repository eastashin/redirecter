$('#error').hide();

function hideError() {
    $('#error').hide()
}

$('#form-signup').submit(function () {
    send();
    return false;
});

function send() {
    $('#error').hide();

    var pass = $('#password').val();
    var confirmPass = $('#confirm_password').val();

    if(pass != confirmPass) {
        $('#error').show();
        $('#error_message').html("Passwords do not match!");
        return
    }

    var postbody = {username: $('#username').val(),
        password: $('#password').val()};

    $.ajax({
        url:  "/registration",
        type: "POST",
        data: postbody,

        statusCode: {
            200: function() {
                document.location.href="/urls"
            },
            403: function() {
                $('#error').show();
                $('#error_message').html("Username is not available!")
            }
        }
    });
}