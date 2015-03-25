PushServer a minimal push server bridging together [Redis](https://github.com/antirez/redis) pub/sub capability and [SockJS](https://github.com/sockjs/sockjs-node).

## Quick start

To install TwitterStreamClient, run: 

```
npm install push-server
```

Setting up a push server connected to your local Redis instance is as simple as:

```javascript
var http = require('http'),
    pushServer = require('push-server'),
    server = http.createServer();

pushServer.start(server);
server.listen(5000);
```

To send message to SockJS connected clients you only need to publish it on your local Redis `pushserver` channel.

```javascript
// connect to local redis instance
var pushServerRedis = redis.createClient();

// send a message
pushServerRedis.publish('pushserver', 'A cool message for connected browser');
```

On the browser side, just use [SockJS](https://github.com/sockjs/sockjs-client) to connect to your new PushServer:

```javascript
var socket = new SockJS('http://localhost:5000/pushserver');

socket.onmessage = function (message) {
    console.log(message);
};
```

You can configure PushServer by passing an options hash to connect():

```javascript
pushServer.start(server, {
    channel: 'my-fancy-channel',
    redisUrl: 'redis://user:password@localhost:6379',
    prefix: '/fancyurlpath'
});
```

## Licence
MIT