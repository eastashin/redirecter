var bodyParser = require('body-parser');
var Url = require('../models/url').Url;
var Statistics = require('../models/statistics').Statistics;
var auth = require('../auth');
var Redirecter = require('../redirecter');
var iplocation = require('iplocation');

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var config = require('../../config');

module.exports = function (app) {

    app.use(session({
        secret: 'VFDLKFKJVR',
        store: new MongoStore({
            url: config.mongoose.uri
        })
    }));

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(bodyParser.json());

    app.post('/registration', function (req, res, next) {
        auth.createUser(req.body)
            .then(function (user) {
                req.session.user = {id: user._id, username: user.username};
                res.status(200).send();
            }).catch(function () {
            res.status(403).send();
        })
    });

    app.post('/login', function (req, res, next) {
        auth.checkUser(req.body)
            .then(function (user) {
                req.session.user = {id: user._id, username: user.username};
                res.status(200).send();
            })
            .catch(function () {
                res.status(401).send("Invalid username or password")
            })
    });

    app.get('/logout', function (req, res, next) {
        req.session.user = undefined;
        res.redirect('/signin')
    });

    app.get('/signup', function (req, res, next) {
        res.render('pages/registration')
    });

    app.get("/signin", function (req, res, next) {
        res.render('pages/login')
    });

    app.get('/', function (req, res, next) {
        check(req, res);
        res.redirect('/urls');
    });

    app.get("/urls", function (req, res, next) {
        check(req, res);
        var page = req.param('page');
        if (page == undefined)
            page = 1;
        var pageSize = 10;
        Url.find({userName: req.session.user.username}, function (err, urls) {
            if(err)
                return res.status(500).send('Server error');
            var pageCount = Math.round(urls.length / pageSize);
            urls = urls.reverse();
            if (urls.length / pageSize - pageCount > 0)
                pageCount++;
            urls = urls.slice(pageSize * (page - 1), pageSize * page);
            res.render('pages/urls', {
                title: 'Urls',
                username: req.session.user.username,
                urls: urls,
                pageCount: pageCount,
                currentPage: page,
                resultUrl: config.url
            })
        });
    });

    app.get('/url', function (req, res, next) {
        check(req, res);
        var id = req.param('id');
        if(!id)
            return res.render('pages/url', {title: 'Url', username: req.session.user.username, created: false});

        Url.findById(id, function (err, url) {
            if (url) {
                return res.render('pages/url', {
                    title: 'Url',
                    username: req.session.user.username,
                    url: url,
                    created: true
                })
            }
            res.render('pages/url', {title: 'Url', username: req.session.user.username, created: false})
        });
    });

    app.post("/create", function (req, res, next) {
        check(req, res);
        Url.find({userName: {$eq: req.session.user.username}, name: {$eq: req.body.name}}, function (err, url) {
            if (url.length != 0) {
                return res.status(400).send();
            }
            var urldb = new Url({
                userName: req.session.user.username,
                name: req.body.name,
                shortName: req.body.shortName,
                urls: JSON.stringify(req.body.urls),
                description: req.body.description
            });

            urldb.save(function (err) {
                if (!err)
                    return res.send({id: urldb._id});
                return res.status(400).send({error: err.name});
            });
        });
    });

    app.post("/update", function (req, res, next) {
        check(req, res);
        if (!req.param('id')) {
            return res.status(404).send('Not found');
        }
        var url = {
            userName: req.session.user.username,
            name: req.body.name,
            shortName: req.body.shortName,
            urls: JSON.stringify(req.body.urls),
            description: req.body.description
        };
        Url.update({_id: req.param('id')}, url, function (err) {
            if (!err)
                return res.status(200).send();
            return res.status(400).send({error: err.name});
        });
    });

    app.get("/statistics", function (req, res, next) {
        check(req, res);
        Url.find({userName: req.session.user.username}, {name: 1}, function (err, urls) {
            if (!err) {
                return res.render('pages/statistics', {
                    title: 'Statistics',
                    urls: urls,
                    username: req.session.user.username
                });
            }
            res.status(500).send({error: 'Server error'});
        });
    });

    app.get("/statistic/:ID", function (req, res, next) {
        check(req, res);
        Statistics.find({url_id: req.params.ID}, function (err, stat) {
            res.send(stat)
        });
    });

    app.delete('/delete/:ID', function (req, res, next) {
        check(req, res);
        Url.remove({_id: req.params.ID}, function (err) {
            if (!err)
                return res.status(200).send();
            res.status(404).send('Not found');
        });
    });

    app.get('/:ID', function (req, res, next) {
        iplocation(req.connection.remoteAddress, function (error, location) {
            Url.findOne({shortName: req.params.ID}, function (err, url) {
                if (err || !url)
                    return res.status(404).send();
                var urls = JSON.parse(url.urls);
                var redirecter = new Redirecter(urls, req.headers['user-agent'], location);
                try {
                    redirecter.getRules().forEach(function (fun) {
                        var resultUrl;
                        try {
                            resultUrl = fun();
                        } catch (err) {}
                        if (resultUrl != undefined) {
                            res.redirect(resultUrl);
                            saveStat(url._id, url.userName, true, req.headers['user-agent'],location , resultUrl);
                            throw new Error()
                        }
                    });
                    saveStat(url._id, url.userName, false, req.headers['user-agent'], location);
                    res.status(404).send('Not found');
                } catch (err) {}
            });
        });
    });

    app.use(function(err, req, res, next) {
        res.status(500).send('500');
    });

    function check(req, res) {
        if (req.session == undefined || req.session.user == undefined) {
            res.redirect('/signin');
            throw new Error;
        }
    }

    function saveStat(id, userName, success, userAgent, location, resultUrl) {
        if(!resultUrl)
            resultUrl = '';
        var stat = new Statistics({
            url_id: id,
            userName: userName,
            success: success,
            url: resultUrl,
            userAgent: userAgent,
            location: JSON.stringify(location)
        });
        stat.save();
    }
};