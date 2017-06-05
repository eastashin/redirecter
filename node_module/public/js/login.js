$('#error').hide();

function hideError() {
    $('#error').hide()
}

$('#form-signin').submit(function () {
    send();
    return false;
});

function send() {
    $('#error').hide();

    var postbody = {username: $('#username').val(),
        password: $('#password').val()};

    $.ajax({
        url:  "/login",
        type: "POST",
        data: postbody,

        statusCode: {
            200: function() {
                document.location.href="/urls"
            },
            401: function() {
                $('#error').show();
                $('#error_message').html("Invalid username or password!")
            }
        }
    });
}