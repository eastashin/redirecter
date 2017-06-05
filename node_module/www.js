var config = require('./config.json');

var app = require('./app')
    , port = process.env.PORT || config.port;

app.listen(port, function () {
  console.log('Listening on port ', port)
});