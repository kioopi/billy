var http = require('http'),
    url = require('url'); 

function imgprox (target, req, res) { 
  var remoteUrl = url.parse(target), 
      headers = req.headers, 
      proxy = http.createClient(80, remoteUrl.host); 
  headers.host = remoteUrl.host; 
  var remoteRequest = proxy.request('GET', remoteUrl.href, headers); 

  remoteRequest.on('response', function(remoteResponse){ 
    res.writeHead(remoteResponse.statusCode, remoteResponse.headers); 
    remoteResponse.pipe(res); 
  }); 
  req.pipe(remoteRequest); 
} 

module.exports = imgprox; 
