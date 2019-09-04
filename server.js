#!/usr/bin/env node

/**
 * Module dependencies.
 */

let app = require('./server/config/app');
let debug = require('debug')('team-collaboration-tool:server');
let http = require('http');

/**
 * Get port from environment and store in Express.
 */

let port = normalizePort(process.env.PORT || '8080');
app.set('port', port);

/**
 * Create HTTP server.
 */

let server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

//implement web socketio. 
const socketio = require('socket.io')
const io = socketio.listen(server)
/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  let port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  let bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  let addr = server.address();
  let bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

const chatModel = require("./server/models/chat");

var chat = io
  // .of('/dashboard')
  .on('connection', (socket) => {
    console.log('user connected')
    socket.on('chat-msg', (msg) => {
      io.emit('chat-msg', msg)
      console.log(msg)
      let newChat = chatModel({
        "username": msg.name,
        "message": msg.message,
        "team_id": msg.team_id
      });
      chatModel.create(newChat, (err, chatModel) => {
        if (err) {
          console.log(err);
        }
      });
      console.log(msg)
    });

  })