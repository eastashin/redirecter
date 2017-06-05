function editUrl(id) {
    document.location.href="/url?id=" + id
}

function deleteUrl(id) {
    $('#progress').show();
    $.ajax({
        url: '/delete/' + id,
        type: 'DELETE',
        success: function(result) {
            $('#progress').hide();
            $( "#" + id ).remove();
        },
        error: function(error) {

        }
    });
}