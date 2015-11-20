var fs        = require('fs');
var glob      = require('glob');
var http      = require('http');
var https     = require('https');
var request   = require('request');
var mime      = require('mime');

http.globalAgent.maxSockets  = 1000;
https.globalAgent.maxSockets = 1000;

/////////////////////////////
// CONFIGURATION VARIALBES //
/////////////////////////////

var publicDir       = process.env.PUBLIC_DIR   || __dirname + '/public';
var target          = process.env.PROXY_TARGET || 'http://127.0.0.1:8080';
var serverPort      = process.env.PORT         || 8080;
var proxyHostHeader = process.env.PROXY_HOST   || null;

// This host can return multiple files based on the HOST header of the request
var siteFileMappings = {
  '*'                                     : __dirname + '/apple-app-site-association/production.json',
  'sailthru-links.taskrabbit.net'         : __dirname + '/apple-app-site-association/production.json',
  'sailthru-proxy.taskrabbit.net'         : __dirname + '/apple-app-site-association/production.json',
  'staging-sailthru-proxy.taskrabbit.net' : __dirname + '/apple-app-site-association/staging.json',
};

/////////////////////////////
// STATIC FILE SERVER INIT //
/////////////////////////////

var publicFiles = [];
glob.sync(publicDir + '/**/*').forEach(function(f){
  publicFiles.push( f.replace(publicDir,'') );
});

/////////////////////
// APPLE SITE FILE //
/////////////////////

var doAppleSiteFile = function(req, res){
  var filePath = siteFileMappings['*'];
  if( siteFileMappings[req.headers.host] ){
    filePath = siteFileMappings[req.headers.host];
  }

  res.setHeader("Content-Type", 'application/json');
  fs.createReadStream(filePath).pipe(res);
};

//////////////////////////
// FILE SERVER HANDLER //
/////////////////////////

var doStaticFile = function(req, res){
  var filePath = publicDir + req.url;
  var contentType = mime.lookup(filePath);
  res.setHeader("Content-Type", contentType);
  fs.createReadStream(filePath).pipe(res);
};

///////////////////
// PROXY HANDLER //
///////////////////

var doProxy = function(req, res){
  var proxyOptions = {
    url: target + req.url,
    followRedirect: false,
    headers: {}
  };

  for(var key in req.headers){
    proxyOptions.headers[key] = req.headers[key];
  }

  ['host', 'Host', 'HOST'].forEach(function(h){
    delete proxyOptions.headers[h];
  });
  proxyOptions.headers.Host = proxyHostHeader;

  proxyOptions.headers['X-Proxy-Note'] = 'taskrabbit-sailthru-proxy';
  proxyOptions.headers['X-Forwarded-For'] = req.connection.remoteAddress;

  request(proxyOptions, function(error, response){
    if(error){ console.log(error); }
    res.writeHead(response.statusCode, response.headers);
    res.end(response.body);
  });
};

////////////
// SERVER //
////////////

var server = http.createServer(function(req, res){
  if(req.url === '/apple-app-site-association'){
    console.log('[apple-app-site-association] ' + req.connection.remoteAddress + ' -> ' + req.url);
    doAppleSiteFile(req, res);
  }
  else if(publicFiles.indexOf(req.url) >= 0){
    console.log('[file] ' + req.connection.remoteAddress + ' -> ' + req.url);
    doStaticFile(req, res);
  }else{
    console.log('[proxy] ' + req.connection.remoteAddress + ' -> ' + req.url);
    doProxy(req, res);    
  }
});

server.listen(serverPort);
console.log('*** PROXY BOOTED @ ' + serverPort + ' ***');
