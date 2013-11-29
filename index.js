var sockjs  = require('sockjs'),
	http    = require('http'),
	redis   = require('redis'),;

function start (expressServer, options) {
    var config = {
            channel: options.channel || 'push_channel',
            redisUrl: options.redisUrl || 'redis://localhost:6376',
            prefix: options.prefix || 'pushserver'
        },
        password,
        parsedUrl  = url.parse(config.redisUrl),
        parsedAuth = (parsedUrl.auth || '').split(':');

    // Sockjs server
    var sockJSServer = sockjs.createServer();

    sockJSServer.on('connection', function(conn) {
        var pushEventListener = redis.createClient(parsedUrl.port, parsedUrl.hostname);
        if (password = parsedAuth[1]) {
            redis.auth(password, function(err) {
              if (err) throw err;
            });
        }

        pushEventListener.subscribe(config.channel);

        // When we see a message on channel, send it to the browser
        pushEventListener.on('message', function(channel, message){
            conn.write(message);
        });
    });

    sockJSServer.installHandlers(expressServer, {prefix: config.prefix});
}

module.exports = {
    start: start
};
