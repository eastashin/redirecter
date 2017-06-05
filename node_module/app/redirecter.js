var parse = require('user-agent-parser');

function Redirecter(rules, userAgent, location) {
    var paramsFunc = [checkDays, checkTime, checkDate, checkOS, checkRegion];
    var rulesFunc = [];

    rules.forEach(function (rule) {
        rulesFunc.push(function () {
            paramsFunc.forEach(function (fun) {
                fun(rule)
            });
            return rule.url
        });
    });

    this.getRules = function () {
        return rulesFunc
    };

    function checkDays(rule) {
        var dayParams = getDayParams(rule);
        if (dayParams.enable == 'false')
            throw new Error();
    }

    function checkDate(rule) {
        try {
            rule.dates.forEach(function (date) {
                var startDate = new Date(date.start);
                var endDate = new Date(date.end);
                var currentDate = new Date();
                if (startDate <= currentDate && currentDate <= endDate)
                    throw new Error();
            });
        } catch (err) {
            return
        }
        throw new Error();
    }

    function checkTime(rule) {
        var dayParams = getDayParams(rule);
        var timePeriods = dayParams.time.replace(/ /g, '').split(';');
        if (timePeriods.length == 0 || timePeriods[0] == "")
            return;
        try {
            timePeriods.forEach(function (period) {
                if (period != "") {
                    var times = period.split('-');
                    var today = new Date();
                    var startTime = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear() + ' ' + times[0];
                    var endTime = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear() + ' ' + times[1];
                    if (new Date(startTime) < today && today < new Date(endTime))
                        throw new Error();
                }
            });
        } catch (err) {
            return
        }
        throw new Error();
    }

    function checkOS(rule) {
        var os = rule.os;
        var parsedUA = parse(userAgent);
        var osList = ['Android', 'iOS', 'Linux', 'Windows'];
        var osEnable = [os.android, os.ios, os.linux, os.windows];
        if(os.enable == 'true') {
            if(osList.indexOf(parsedUA.os.name) != -1) {
                if(osEnable[osList.indexOf(parsedUA.getOS().name)] == 'true')
                    return;
                else
                throw new Error();
            }
            if(os.other == 'true')
                return;
            throw new Error();
        }
    }

    function checkRegion(rule) {
        var region = rule.region;

        if(region && location) {
            if(region.country != "" && region.country.toLowerCase().indexOf(location['country'].toLowerCase()) == -1) {
                throw new Error();
            }
            if(region.region != "" && region.region.toLowerCase().indexOf(location.region.split(" ")[0].toLowerCase()) == -1) {
                throw new Error();
            }
        }
            
    }

    function getDayParams(rule) {
        var daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        var day = daysOfWeek[new Date().getDay()];
        return rule.days[day];
    }
}

module.exports = Redirecter;
