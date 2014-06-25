/*jshint node: true */
"use strict";

var sockjs = require('sockjs'),
    redis = require('redis'),
    url = require('url');

function start(httpServer, options) {
    var config = {
        channel: (options && options.channel) ||  'pushserver',
        redisUrl: (options && options.redisUrl) ||  'redis://localhost:6379',
        prefix: (options && options.prefix) ||  '/pushserver',
        heartbeat_delay: 10,
        disconnect_delay: 3
    },
        parsedUrl = url.parse(config.redisUrl),
        parsedAuth = (parsedUrl.auth || '').split(':'),
        sockJSServer = sockjs.createServer();

    sockJSServer.on('connection', function(sockJSClientConnection) {
        var pushEventListener = redis.createClient(parsedUrl.port, parsedUrl.hostname);
        if (parsedAuth[1]) {
            pushEventListener.auth(parsedAuth[1], function(err) {
                if (err) throw err;
            });
        }

        pushEventListener.subscribe(config.channel);

        // When we see a message on channel, send it to the browser
        pushEventListener.on('message', function(channel, message) {
            sockJSClientConnection.write(message);
        });
        pushEventListener.on('error', function(err) {
            console.log('Redis error ' + err);
            sockJSClientConnection.close();
        });
        sockJSClientConnection.on('close', function() {
            pushEventListener.quit();
        });
    });

    sockJSServer.installHandlers(httpServer, {
        prefix: config.prefix
    });
}

module.exports = {
    start: start
};