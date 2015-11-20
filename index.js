var fs        = require('fs');
var glob      = require('glob');
var http      = require('http');
var httpProxy = require('http-proxy');

var publicDir       = process.env.PUBLIC_DIR   || __dirname + '/public';
var target          = process.env.PROXY_TARGET || 'http://127.0.0.1:8080';
var serverPort      = process.env.PORT         || 8008;
var proxyHostHeader = process.env.PROXY_HOST   || null;

var publicFiles = [];
glob.sync(publicDir + '/**/*').forEach(function(f){
  publicFiles.push( f.replace(publicDir,'') );
});

var proxy = httpProxy.createProxyServer({
  target: target, // Where do we send all requests?
  xfwd: true,     // X-FORWARDED-FOR headers
});

proxy.on('proxyReq', function(proxyReq, req, res, options){
  if(proxyHostHeader){ proxyReq.setHeader('HOST', proxyHostHeader); }
});

var server = http.createServer(function(req, res){
  if(publicFiles.indexOf(req.url) >= 0){
    console.log('[file] ' + req.connection.remoteAddress + ' -> ' + req.url);
    fs.createReadStream(publicDir + req.url).pipe(res);
    // res.end();
  }else{
    console.log('[proxy] ' + req.connection.remoteAddress + ' -> ' + req.url);
    proxy.web(req, res);
  }
});

server.listen(serverPort);
console.log('*** PROXY BOOTED @ ' + serverPort + ' ***');
