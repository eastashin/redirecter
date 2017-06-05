var dateCount = 0;
var dates = {};

var urlCount = 0;
var urls = {};
var currentUrlId = 0;

$('#addRuleForm').submit(function () {
    addUrl();
    return false;
});

$('#form').submit(function () {
    return false;
});

function sendUrl(created, id) {
    if($("#name").val() == "" || $("#shortName").val() == "")
        return;
    $('#progress').show();
    var result_urls = [];
    for (var key in urls) {
        result_urls.push(urls[key])
    }
    var result = {
        name: $("#name").val(),
        shortName: $("#shortName").val(),
        urls: result_urls,
        description: $("#description").val()};

    var url;
    if (created) {
        url = "/update?id=" + id
    } else {
        url = '/create'
    }

    $.ajax(url, {
        type: 'POST',
        data: result,
        statusCode: {
            200: function() {
                $('#progress').hide();
                document.location.href="/urls"
            },
            400: function() {
                $('#progress').hide();
                alert('name or short name is not available')
            }
        }
    });
}

function showAddRuleLinkWindow() {
    closeAddUrlWindow();
    $('#modal').modal({backdrop: 'static', keyboard: false});
    $('#datetimepicker1').datetimepicker({pickTime: false});
    $('#datetimepicker2').datetimepicker({pickTime: false});
}

function addPeriod() {
    dateCount++;
    var date1 = document.getElementById('datetimepicker1').value;
    var date2 = document.getElementById('datetimepicker2').value;
    if(date1 == '' || date2 == '')
        return;
    dates["date" + dateCount] = {start: date1, end: date2};
    document.getElementById('datetimepicker1').value = "";
    document.getElementById('datetimepicker2').value = "";
    var div = document.createElement('div');
    var date = "'date" + dateCount + "'";
    div.innerHTML = '<p class="date" id="date' + dateCount + '" name="data"><label name="start">' + date1 + '</label>' + " - " + '<label name="end">' + date2 + '</label><button type="button" class="btn btn-danger delete_date_btn" onclick="deletePeriod('+date+')">Delete</button></p>';

    document.getElementById('date_container').appendChild(div);
}

function deletePeriod(id) {
    $("#" + id ).remove();
    delete dates[id]
}

function getSubUrl() {
    var result_dates = [];
    for (var key in dates) {
        result_dates.push(dates[key])
    }
    var days = {
        monday : { enable: "" + $("#monday").prop("checked"), time : $("#monday_time").val()},
        tuesday : { enable: "" + $("#tuesday").prop("checked"), time : $("#tuesday_time").val()},
        wednesday : { enable: "" + $("#wednesday").prop("checked"), time : $("#wednesday_time").val()},
        thursday : { enable: "" + $("#thursday").prop("checked"), time : $("#thursday_time").val()},
        friday : { enable: "" + $("#friday").prop("checked"), time : $("#friday_time").val()},
        saturday : { enable: "" + $("#saturday").prop("checked"), time : $("#saturday_time").val()},
        sunday : { enable: "" + $("#sunday").prop("checked"), time : $("#sunday_time").val()}
    };
    var os = {
        enable: $("#use_os_params").prop("checked"),
        other: $("#check_other").prop("checked"),
        windows: $("#check_windows").prop("checked"),
        android: $("#check_android").prop("checked"),
        ios: $("#check_ios").prop("checked"),
        linux: $("#check_linux").prop("checked")
    };
    var region = {
        country: $("#country").val(),
        region: $("#one").val()
    };

    return { url: $("#subUrl").val(),
        name: $("#subName").val(),
        dates: result_dates,
        days: days,
        os: os,
        region: region,
        description: $("#subUrlDescription").val()};
}

function addUrl() {
    var edited = false;
    if(currentUrlId == 0) {
        urlCount++;
        currentUrlId = urlCount
    } else {
        edited = true;
    }
    var url = getSubUrl();
    urls['url' + currentUrlId] = url;
    var description = '';
    if(url.description) {
        description = '<p>' + url.description + '</p>';
    }

    var html = '<hr><div class="rule">' +
        '<div class="rule_info">' +
        '<h5>' + url.name + '</h5>' +
        '<p><a href="' + url.url +'">' + url.url + '</a></p>' +
        description +
        '</div>' +
        '<div class="rule_btn_container">' +
        '<button type="button" class="btn btn-success rule_edit_btn" onclick="editLink(' + "'" + currentUrlId + "'" + ')">Edit</button>' +
        '<button type="button" class="btn btn-danger rule_delete_btn" onclick="deleteLink(' + "'url" + currentUrlId + "'" + ')">Delete</button>' +
        '</div></div>';

    if(edited) {
        $("#url" + currentUrlId).empty();
        $("#url" + currentUrlId).append(html)
    } else {
        var div = document.createElement('div');
        div.innerHTML = '<div id="url' + currentUrlId + '">' +
            html +
            '</div>';
        document.getElementById('urlContainer').appendChild(div);
    }
    closeAddUrlWindow();
}

function deleteLink(id) {
    $("#" + id ).remove();
    delete urls[id]
}

function editLink(id) {
    showAddRuleLinkWindow();
    currentUrlId = id;
    var url = urls['url' + id];
    try {
        $("#subUrl").val(url.url);
        $("#subName").val(url.name);
        if (url.description) {
            $("#subUrlDescription").val(url.description);
        }
        $('#country').val("").change();
        $('#one').find('option').remove();
        $('#one').append($("<option></option>")
            .attr("value","")
            .text("-"));
        if (url.dates) {
            url.dates.forEach( function( date ) {
                dateCount++;
                dates["date" + dateCount] = {start: date.start, end: date.end};
                var div = document.createElement('div');
                var dateId = "'date" + dateCount + "'";
                div.innerHTML = '<p class="date" id="date' + dateCount + '" name="data"><label name="start">' + date.start  + '</label>' + " - " + '<label name="end">' + date.end + '</label><button type="button" class="btn btn-danger delete_date_btn" onclick="deletePeriod('+dateId+')">Delete</button></p>';

                document.getElementById('date_container').appendChild(div);
            });
        }
        $("#monday").prop('checked', url.days.monday.enable == "true");
        $("#tuesday").prop('checked', url.days.tuesday.enable == "true");
        $("#wednesday").prop('checked', url.days.wednesday.enable == "true");
        $("#thursday").prop('checked', url.days.thursday.enable == "true");
        $("#friday").prop('checked', url.days.friday.enable == "true");
        $("#saturday").prop('checked', url.days.saturday.enable == "true");
        $("#sunday").prop('checked', url.days.sunday.enable == "true");
        $("#monday_time").val(url.days.monday.time);
        $("#tuesday_time").val(url.days.tuesday.time);
        $("#wednesday_time").val(url.days.wednesday.time);
        $("#thursday_time").val(url.days.thursday.time);
        $("#friday_time").val(url.days.friday.time);
        $("#saturday_time").val(url.days.saturday.time);
        $("#sunday_time").val(url.days.sunday.time);
        $("#use_os_params").prop('checked', url.os.enable == "true");
        $("#check_windows").prop('checked', url.os.windows == "true");
        $("#check_android").prop('checked', url.os.android == "true");
        $("#check_ios").prop('checked', url.os.ios == "true");
        $("#check_linux").prop('checked', url.os.linux == "true");
        $("#use_other").prop('checked', url.os.other == "true");

        if (url.region.country)
            $('#country').val(url.region.country).change();
        if (url.region.region)
            $('#one').val(url.region.region).change();

    } catch (e) {}
}

function closeAddUrlWindow() {
    $('#modal').modal('hide');
    $("#subUrl").val('');
    $("#subName").val('');
    $("#monday_time").val('');
    $("#tuesday_time").val('');
    $("#wednesday_time").val('');
    $("#thursday_time").val('');
    $("#friday_time").val('');
    $("#saturday_time").val('');
    $("#sunday_time").val('');
    $("#monday").prop('checked', false);
    $("#tuesday").prop('checked', false);
    $("#wednesday").prop('checked', false);
    $("#thursday").prop('checked', false);
    $("#friday").prop('checked', false);
    $("#saturday").prop('checked', false);
    $("#sunday").prop('checked', false);
    $("#subUrlDescription").val('');
    $("#date_container").empty();
    $("#use_os_params").prop('checked', false);
    $("#check_other").prop('checked', false);
    $("#check_windows").prop('checked', false);
    $("#check_android").prop('checked', false);
    $("#check_ios").prop('checked', false);
    $("#check_linux").prop('checked', false);
    dates = {};
    dateCount = 0;
    currentUrlId = 0
}

function showUrl(created_urls) {
    if (created_urls) {
        created_urls.forEach( function( url ) {
            urlCount++;
            urls['url' + urlCount] = url;
            var description = '';
            if(url.description) {
                description = '<p>' + url.description + '</p>';
            }

            var html = '<hr><div class="rule">' +
                '<div class="rule_info">' +
                '<h5>' + url.name + '</h5>' +
                '<p><a href="' + url.url +'">' + url.url + '</a></p>' +
                description +
                '</div>' +
                '<div class="rule_btn_container">' +
                '<button type="button" class="btn btn-success rule_edit_btn" onclick="editLink(' + "'" + urlCount + "'" + ')">Edit</button>' +
                '<button type="button" class="btn btn-danger rule_delete_btn" onclick="deleteLink(' + "'url" + urlCount + "'" + ')">Delete</button>' +
                '</div></div>';
            var div = document.createElement('div');
            div.innerHTML = '<div id="url' + urlCount + '">' +
                html +
                '</div>';
            document.getElementById('urlContainer').appendChild(div);
        });
    }
}