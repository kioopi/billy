var http = require('http'), 
    sys = require('sys'), 
    path = require('path'), 
    paperboy = require('paperboy'), 
    imgprox = require('./lib/imageproxy');


var PORT = 1337, 
    WEBROOT = path.join(path.dirname(__filename), 'webroot'),
    URLPREF_IMAGEPROXY = '/img/', 
    URLPREF_WEBROOT = '/'; 




http.createServer(function (req, res) {
  if (req.url.substr(0,URLPREF_IMAGEPROXY.length) === URLPREF_IMAGEPROXY) {
    var target = req.url.substr(URLPREF_IMAGEPROXY.length); 
    if(target.length > 1){ 
      imgprox(target, req, res); 
    } else { 
      // TODO send dummy image 
      res.writeHead(200); 
      res.end();
    } 
  } else if ( req.url.substr(0, URLPREF_WEBROOT.length) === URLPREF_WEBROOT ){ 
    paperboy.deliver(WEBROOT, req, res); 
  } else { 
    res.writeHead(500); 
    res.end();
  } 


}).listen(PORT);

console.log('Server running at http://127.0.0.1:'+PORT+'/');

