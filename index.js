var sockjs  = require('sockjs'),
	http    = require('http'),
	redis   = require('redis');

// Sockjs server
var sockJSOptions = {sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"};
var sockjs_chat = sockjs.createServer(sockjs_opts);
sockjs_chat.on('connection', function(conn) {
    var browser = redis.createClient();
    browser.subscribe('chat_channel');

    // When we see a message on chat_channel, send it to the browser
    browser.on("message", function(channel, message){
        conn.write(message);
    });

    // When we receive a message from browser, send it to be published
    conn.on('data', function(message) {
        publisher.publish('chat_channel', message);
    });
});

// Express server
var app = express();
var server = http.createServer(app);

sockjs_chat.installHandlers(server, {prefix:'/chat'});

console.log(' [*] Listening on 0.0.0.0:9001' );
server.listen(9001, '0.0.0.0');

app.get('*', function (req, res) {
    
});