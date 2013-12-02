var sockjs  = require('sockjs'),
	redis   = require('redis'),
    url     = require('url');

function start (httpServer, options) {
    var config = {
            channel: (options && options.channel) || 'pushserver',
            redisUrl: (options && options.redisUrl) || 'redis://localhost:6379',
            prefix: (options && options.prefix) || '/pushserver'
        },
        password,
        parsedUrl  = url.parse(config.redisUrl),
        parsedAuth = (parsedUrl.auth || '').split(':');

    // Sockjs server
    var sockJSServer = sockjs.createServer();

    sockJSServer.on('connection', function(sockJSClientConnection) {
        var pushEventListener = redis.createClient(parsedUrl.port, parsedUrl.hostname);
        if (password = parsedAuth[1]) {
            redis.auth(password, function(err) {
              if (err) throw err;
            });
        }

        pushEventListener.subscribe(config.channel);

        // When we see a message on channel, send it to the browser
        pushEventListener.on('message', function(channel, message){
            sockJSClientConnection.write(message);
        });
    });

    sockJSServer.installHandlers(httpServer, {prefix: config.prefix});
}

module.exports = {
    start: start
};
