$('#progress').show();

var date = new Date();
date.setHours(0, 0, 0, 0);
$("#date").html(formatDate(date));

var currentUrlName;
var currentId;
var currentStat;
var currentDate;

function previousDay() {
    date.setHours(date.getHours() - 24);
    $("#nextDayButton").prop('disabled', false);
    $("#date").html(formatDate(date));
    urlClick();
}

function nextDay() {
    date.setHours(date.getHours() + 24);
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date.getTime() == today.getTime())
        $("#nextDayButton").prop('disabled', true);
    $("#date").html(formatDate(date));
    urlClick();
}

function urlClick(id, name) {
    $("#url_name").html(name);

    currentDate = date;

    if (name && id) {
        currentUrlName = name;
        currentId = id;
        loadStatistic();
    } else {
        drawCharts(currentStat, currentDate);
    }
}

function loadStatistic() {
    $('#progress').show();
    $.get(
        "/statistic/" + currentId,
        function (data, status) {
            currentStat = data;
            drawCharts(currentStat, currentDate);
            $('#progress').hide();
        }
    );
}

function drawCharts(currentStat, currentDate) {
    drawVisitsChart(currentStat, currentDate);
    drawRulesChart(currentStat, currentDate);
    drawOsChart(currentStat, currentDate);
    drawRegions(currentStat, currentDate);
}

function drawVisitsChart(currentStat, currentDate) {
    var date = new Date('' + currentDate);
    var failed = [];
    var success = [];
    for (var i = 0; i < 24; i++) {
        failed[date] = 0;
        success[date] = 0;
        date.setHours(date.getHours() + 1);
    }

    currentStat.forEach(function (stat) {
        var date = new Date(stat.created);
        date.setMinutes(0, 0, 0);
        if (date in success) {
            if (stat.success)
                success[date]++;
            else
                failed[date]++;
        }
    });

    var rows = [];

    for (var i = 0; i < 24; i++) {
        date.setHours(date.getHours() - 1);
        rows.push([{
            v: [date.getHours(), 30, 0],
            f: '' + date.getHours() + ":00 - " + (date.getHours() + 1) + ":00"
        }, success[date], failed[date]]);
    }

    var data = new google.visualization.DataTable();
    data.addColumn('timeofday', 'Time of Day');
    data.addColumn('number', 'Success');
    data.addColumn('number', 'Filed');

    data.addRows(rows);

    var options = {
        title: 'Following a links',
        isStacked: true,
        hAxis: {
            title: 'Time',
            format: 'h:mm a',
            viewWindow: {
                min: [0, 0, 0],
                max: [24, 0, 0]
            }
        },
        vAxis: {
            title: 'Following a link',
            viewWindowMode: 'explicit',
            viewWindow: {
                min: 0
            }
        },
        backgroundColor: { fill:'transparent' }
    };

    var chart = new google.visualization.ColumnChart(document.getElementById('visits_chart_div'));
    chart.draw(data, options);
}

function drawRulesChart(currentStat, currentDate) {
    var date = new Date('' + currentDate);

    var rules = new Set();
    var timeRulesCount = [];

    currentStat.forEach(function (stat) {
        if (stat.success) {
            rules.add(stat.url)
        }
    });

    for (var i = 0; i < 24; i++) {
        timeRulesCount[date] = [];
        rules.forEach(function (rule) {
            timeRulesCount[date][rule] = 0;
        });
        date.setHours(date.getHours() + 1);
    }

    currentStat.forEach(function (stat) {
        var date = new Date(stat.created);
        date.setMinutes(0, 0, 0);
        if (date in timeRulesCount && stat.success)
            timeRulesCount[date][stat.url]++;
    });

    var data = new google.visualization.DataTable();
    data.addColumn('number', 'X');
    rules.forEach(function (rule) {
        data.addColumn('number', rule);
    });

    var rows = [];

    date.setHours(date.getHours() - 24);

    for (var i = 0; i < 24; i++) {
        var row = [];
        row.push({v: i, f: '' + i + ":00 - " + (i + 1) + ":00"})
        rules.forEach(function (rule) {
            row.push(timeRulesCount[date][rule]);
        });
        date.setHours(date.getHours() + 1);
        rows.push(row);
    }

    data.addRows(rows);

    var options = {
        title: 'Rules',
        hAxis: {
            title: 'Time'
        },
        vAxis: {
            title: 'Rule triggering',
            viewWindow: {
                min: 0
            }
        },
        series: {
            1: {curveType: 'function'}
        },
        backgroundColor: { fill:'transparent' }
    };

    var chart = new google.visualization.LineChart(document.getElementById('rules_chart_div'));
    chart.draw(data, options);
}

function drawOsChart(currentStat, currentDate) {
    var os = [];
    os['Windows'] = 0;
    os['Android'] = 0;
    os['iOS'] = 0;
    os['Linux'] = 0;
    os['Other'] = 0;

    var showed = false;

    currentStat.forEach(function (stat) {
        var date = new Date(stat.created);
        date.setHours(0, 0, 0, 0);
        if (date.getTime() === currentDate.getTime() && stat.userAgent) {
            showed = true;
            var parsedOs = UAParser(stat.userAgent).os;
            if(os[parsedOs.version])
                os[parsedOs.version]++;
            else
                os['Other']++;
        }
    });

    if (showed)
        $('#os_chart').show();
    else
        $('#os_chart').hide();

    var data = google.visualization.arrayToDataTable([
        ['Os', 'count'],
        ['Windows', os['Windows']],
        ['Android', os['Android']],
        ['IOS', os['iOS']],
        ['Linux', os['Linux']],
        ['Other', os['Other']]
    ]);

    var options = {
        title: 'Daily Activities',
        backgroundColor: { fill:'transparent' }
    };

    var chart = new google.visualization.PieChart(document.getElementById('os_chart'));

    chart.draw(data, options);
}

function drawRegions(currentStat, currentDate) {
    var regions = new Map();
    currentStat.forEach(function (stat) {
        var date = new Date(stat.created);
        date.setHours(0, 0, 0, 0);
        if (date.getTime() === currentDate.getTime() && stat.location) {
            var locationJson = JSON.parse(stat.location);
            if(!locationJson.country_name || !locationJson.region)
                return;
            var region = locationJson.country_name + " " + locationJson.region;
            if(region in regions)
                regions[region]++;
            else
                regions[region] = 1;
        }
    });

    var regionKeys = Object.keys(regions);

    regionKeys.sort(function(a,b){return regions[b] - regions[a]});

    $('#region_table tbody').empty();
    regionKeys.forEach(function (key) {
        $('#region_table tbody').append("<tr><td>" + key + "</td><td>" + regions[key] + "</td></tr>");
    });

}


function formatDate(date) {
    var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return day + ' ' + monthNames[monthIndex] + ' ' + year;
}