var http      = require('http');
var httpProxy = require('http-proxy');

var target          = process.env.PROXY_TARGET || 'http://127.0.0.1:8080';
var serverPort      = process.env.PORT         || 8008;
var proxyHostHeader = process.env.PROXY_HOST   || null;

var proxy = httpProxy.createProxyServer({
  target: target, // Where do we send all requests?
  xfwd: true,     // X-FORWARDED-FOR headers
});

proxy.on('proxyReq', function(proxyReq, req, res, options){
  if(proxyHostHeader){ proxyReq.setHeader('HOST', proxyHostHeader); }
});

var server = http.createServer(function(req, res){
  console.log('[proxy] request from ' + req.connection.remoteAddress);
  proxy.web(req, res);
});

server.listen(serverPort);

console.log("*** PROXY BOOTED ***");