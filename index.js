var fs        = require('fs');
var glob      = require('glob');
var http      = require('http');
var https     = require('https');
var request   = require('request');

http.globalAgent.maxSockets  = 1000;
https.globalAgent.maxSockets = 1000;

var publicDir       = process.env.PUBLIC_DIR   || __dirname + '/public';
var target          = process.env.PROXY_TARGET || 'http://127.0.0.1:8080';
var serverPort      = process.env.PORT         || 8080;
var proxyHostHeader = process.env.PROXY_HOST   || null;

var publicFiles = [];
glob.sync(publicDir + '/**/*').forEach(function(f){
  publicFiles.push( f.replace(publicDir,'') );
});

var doProxy = function(req,res){
  var proxyOptions = {
    url: target + req.url,
    followRedirect: false,
    headers: {}
  };

  for(var key in req.headers){
    proxyOptions.headers[key] = req.headers[key];
  }

  delete proxyOptions.headers.host;
  delete proxyOptions.headers.Host;
  delete proxyOptions.headers.HOST;

  proxyOptions.headers['X-Proxy-Note'] = 'taskrabbit-sailthru-proxy';
  proxyOptions.headers['X-Forwarded-For'] = req.connection.remoteAddress;
  proxyOptions.headers['Host'] = proxyHostHeader;

  request(proxyOptions, function(error, response){
    if(error){ console.log(error); }
    else{
      for(var key in response.headers){
        res.setHeader(key, response.headers[key]);
      }
    }
    res.end(response.body);
  });
};

var server = http.createServer(function(req, res){
  if(publicFiles.indexOf(req.url) >= 0){
    console.log('[file] ' + req.connection.remoteAddress + ' -> ' + req.url);
    fs.createReadStream(publicDir + req.url).pipe(res);
  }else{
    console.log('[proxy] ' + req.connection.remoteAddress + ' -> ' + req.url);
    doProxy(req, res);    
  }
});

server.listen(serverPort);
console.log('*** PROXY BOOTED @ ' + serverPort + ' ***');
