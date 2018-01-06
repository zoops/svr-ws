var express        = require( 'express' );
var http           = require( 'http' );
var app            = express();
var expressWs      = require('express-ws')(app);

app.set( 'port', process.env.PORT || 3001 );
/*
app.get('/', function (req, res) {
    res.send('Hello World');
});
http.createServer( app ).listen( app.get( 'port' ), function (){
  console.log( 'Express server listening on port ' + app.get( 'port' ));
});
//*/
//*
/*
app.use(function (req, res, next) {
  console.log('middleware');
  req.testing = 'testing';
  return next();
});
 */
app.get('/', function(req, res, next){
  res.send('Hello World');  
  //  res.end();
});

app.ws('/echo', function(ws, req) {
  ws.on('message', function(msg) {
    ws.send(msg);
  });
});

app.listen(app.get( 'port' ), function(){
  console.log( 'Express server listening on port ' + app.get( 'port' ));
});
//*/