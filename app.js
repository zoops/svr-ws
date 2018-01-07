var express        = require( 'express' );
var http           = require( 'http' );
var app            = express();
var expressWs      = require('express-ws')(app);

app.set( 'port', process.env.PORT || 3001 );

app.get('/', function(req, res, next){
  res.send('Hello World');  
});

app.ws('/echo', function(ws, req) {
  ws.on('message', function(msg) {
    ws.send(msg);
  });
});

var signalClients = [];

app.ws('/signal', function(ws, req) {

  signalClients.push(ws);

  ws.on('message', function(msg) {
    console.info('message : ' + msg + ', ' + signalClients.length);

    signalClients.forEach(function(tgt) {
        try {
          if (tgt != ws) {
            tgt.send(msg);
          }
        } catch (e) {
          console.info(e);
        }
      });
  });
});

var rooms = {};

function send(tgt, from_user, message) {
  if (tgt) {
      tgt.send(JSON.stringify({ user: from_user, message: message}));
  }
}

function broadcast(room, from_ws, user, message) {
  room.forEach(function(tgt) {
      try {
          if (tgt != from_ws) {
              send(tgt, user, message);
          }
      } catch (e) {
          room.delete(tgt);
      }
  });
}

app.ws('/room/:room', function(ws, req) {
  var room_name = req.params.room;
  if (!(room_name in rooms)) {
      log.info({ room: room_name }, "new room created");
      rooms[room_name] = new Set([ws]);
  } else {
      rooms[room_name].add(ws);
  }
  var room = rooms[room_name];

  ws.on('message', function(msg) {
      var user = 'anonymous';
      try {
          var parsed = JSON.parse(msg);
          if ("user" in parsed && "message" in parsed) {
              user = parsed.user;
              msg = parsed.message;
          } else {
              throw new Error();
          }
      } catch (error) {
          log.info({ msg: msg }, "Plain text message (not JSON) treated as from anonymous");
      }
      if (msg == "_announce_") {
          send(ws, "Room", "Welcome to chat room " + room_name);
          msg = user + " has joined the chat";
          user = "Room";
      }
      broadcast(room, ws, user, msg);
      if (msg != "_announce") {
          log.info({ user: user, message: msg, room: "room_" + room_name, type: "chat_message",
              sent: new Date()}, "user message");
      }
  });

  send(ws, "Room", "_whois_");
});


app.listen(app.get( 'port' ), function(){
  console.log( 'Express server listening on port ' + app.get( 'port' ));
});
