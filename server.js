/**
 * Node modules
 */
const express    = require('express');
const http       = require('http'); 
const path       = require('path');
const shortId    = require('shortid');

/**
 * Initialize
 */
const app    = express();
const server = http.createServer(app);
const io     = require('socket.io')(server);

/**
 * Setup
 */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Routes
 */

// Root
app.get('/', (req, res, next) => {
  res.render('index');
});

// Not found redirect
app.use((req, res, next) => {
  res.redirect('/');
});

/**
 * Server
 */
server.listen(app.get('port'), () => {
  console.log('server running on port 3000');
});

/**
 * socket.io
 */

let users = [];

io.on('connection', socket => {

  socket.on('disconnect', function(){
    if(users.indexOf(socket) !== -1) {
      users.splice(users.indexOf(socket), 1);
    }
    socket.emit('total', users.length);
  });

  let guestId =  shortId.generate(); // unique shortId

  if(users.indexOf(socket) === -1) {
    users.push(socket);
  }

  socket.emit('guestId', guestId); // Send unique guest id

  socket.broadcast.emit('user connected', `guest-${guestId}`); // broadcast guest connected

  io.emit('total', users.length);

  // emit chat messages
  socket.on('chat message', (msgObject) => {
    io.emit('chat message', msgObject);
  });

  // broadcast user nickname
  socket.on('user has nickname', (user) => {
    socket.broadcast.emit('user has nickname', user);
  });

});
