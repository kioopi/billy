/*global fabric*/
var IMAGEPROXY_PREFIX = '/img/'; 

/*
function setPixel(imageData, x, y, r, g, b, a) {
  var index = (x + y * imageData.width) * 4;
  var data = imageData.data; 
  data[index+0] = r;
  data[index+1] = g;
  data[index+2] = b;
  data[index+3] = a;
}
*/ 
 

function pixelAt(imageData,x,y){
  var data = imageData.data; 
  var index = (x + y * imageData.width) * 4;
  return {
    r: data[index+0], 
    g: data[index+1], 
    b: data[index+2], 
    a: data[index+3] 
  }; 
} 

function findEdges(imageData) { 
  var w = imageData.width,
      h = imageData.height,
      x,y, // cursor
      topleft = {x:undefined, y:undefined}, 
      bottomright = {x:undefined, y:undefined}; 

  // aproach from top 
  for (y=0; y<h; y++) { 
    for (x=0; x<w; x++) { 
      if (pixelAt(imageData,x,y).a > 0) {
        topleft.y = y;	
	break; 
      } 
    } 
    if (topleft.y) break; 
  } 

  // from left    
  for (x=0; x<w; x++) { 
    for (y=0; y<h; y++) { 
      if (pixelAt(imageData,x,y).a > 0) {
        topleft.x = x; 
	break;
      } 
    } 
    if (topleft.x) break; 
  } 

  // from right
  for (x=w; x>=0; x--) { 
    for (y=0; y<h; y++) { 
      if (pixelAt(imageData,x,y).a > 0) {
        bottomright.x = x;
	break;
      } 
    } 
    if (bottomright.x) break; 
  } 

  // from bottom
  for (y=h; y>=0; y--) { 
    for (x=0; x<w; x++) { 
      if (pixelAt(imageData,x,y).a > 0) {
        bottomright.y = y;
	break;
      } 
    } 
    if (bottomright.y) break; 
  } 
  
  if (!(topleft.x && topleft.y && bottomright.x && bottomright.y)) { 
    return null;
  } else { 
    return { 
      x: topleft.x,
      y: topleft.y, 
      w: bottomright.x - topleft.x,
      h: bottomright.y - topleft.y
    };
  } 
} 

function clippedDataUrl (context, x,y,w,h) { 
  // create new canvas 
  var tmpCan = document.createElement('canvas'); 
  tmpCan.setAttribute('width', w);
  tmpCan.setAttribute('height', h);
  // copy cropped data to new canvas
  var croppedData = context.getImageData(x, y, w, h); 
  var ctx = tmpCan.getContext('2d');
  ctx.putImageData(croppedData, 0,0); 
  // get imgdata from new canvas
  var imgdata = tmpCan.toDataURL('png'); 
  return imgdata; 
} 



// add a polyfill for bind from mdc
// is this necc? used only once. 
if ( !Function.prototype.bind ) {
  Function.prototype.bind = function( obj ) {
    var slice = [].slice,
        args = slice.call(arguments, 1), 
        self = this, 
        nop = function () {}, 
        bound = function () {
          return self.apply( this instanceof nop ? this : ( obj || {} ), 
                              args.concat( slice.call(arguments) ) );    
        };
    nop.prototype = self.prototype;
    bound.prototype = new nop();
    return bound;
  };
}

var byId = document.getElementById.bind(document); 

window.addEventListener("load", function(e){
  var sizeCanvas = function(){ 
    var cc = byId('canvascontainer'),
        can = byId('canvas'); 
    var value = document.defaultView.getComputedStyle(cc, "").getPropertyValue('width');

    can.style.width = ( parseInt(value,10) - 50) + 'px';
    can.setAttribute('width', ( parseInt(value,10) - 50) );
  }; 
  sizeCanvas();
   
  window.addEventListener("resize", function(e){
    sizeCanvas();
  }, false);

  byId('helpBtn').addEventListener('click', function(e){ 
    e.stopPropagation();
    if(byId('helpbox').classList.toggle('active')){ 
      var closeHelpBox = function(e){ 
        byId('helpbox').classList.remove('active'); 
	document.removeEventListener('click', closeHelpBox, false); 
      } 
      document.addEventListener('click', closeHelpBox, false); 
    } 

  }, false); 

  var canvas = new fabric.Element('canvas');
  var originalImage = null;
  var billyfaces = []; 

  var loadOriginal = function(url){ 
    url = url || IMAGEPROXY_PREFIX + byId('originalUrlField').value; 
    if(originalImage) { 
      canvas.remove(originalImage);
    }

    fabric.Image.fromURL(url, function(image) {
      originalImage = image; 
	  canvas.centerObjectH(image);
	  canvas.centerObjectV(image);
      canvas.add(image); 
	  canvas.sendToBack(image); 
    }); 
  };

  byId('originalUrlField').addEventListener('keyDown', function(e){ 
    if(e.keyCode == 13) loadOriginal();
  }); 


  byId('loadOriginalBtn').addEventListener('click', function(){ 
    loadOriginal();
  }); 
  
  // pressing 'escape' should remove the active billyface
  document.addEventListener('keydown', function(e){ 
    if(e.keyCode == 46) {
      var selected = canvas.getActiveObject(); 
      billyfaces.slice(billyfaces.indexOf(selected),1); 
      canvas.fxRemove(selected);   
    } 
  }); 

  byId('cbfs').addEventListener('click', (function(){ 
    var deg = 0; 
    return function(e){ 
      if(e.target.tagName == 'IMG'){  
        fabric.Image.fromURL(e.target.src, function(image) {
          image.set('top', 150);
	  canvas.centerObjectH(image);
	  image.setAngle(deg); 
	  deg += 15; 
	  if (deg>=360) deg = 0;
          canvas.add(image); 
	  canvas.bringToFront(image);
          billyfaces.push(image); 
	  var can = byId('canvas'); 
	  (can.scrollIntoViewIfNeeded && can.scrollIntoViewIfNeeded()) || can.scrollIntoView(); 
        }); 
      } 
    }; 
  })(), false); 

  byId('grayscaleBtn').addEventListener('click', function(){ 
    var obj =  canvas.getActiveObject(); 
    if(obj && obj.toGrayscale){ 
      obj.toGrayscale(function(){ 
        obj.render(canvas.getElement().getContext('2d')); 
      }); 
    } 
  }, false);

  byId('saveBtn').addEventListener('click', function(){ 
    canvas.deactivateAll();
    if (!canvas.isEmpty()) { 
      var imgdata = canvas.toDataURL('png'); 
    
      var ce = document.getElementsByClassName('lower-canvas')[0],
          ct = ce.getContext("2d"),
          id = ct.getImageData(0,0, ce.width, ce.height),
          rect = findEdges(id); // find boundaries
	 // ct.putImageData(id,0,0); 

      if(rect) 
        imgdata = clippedDataUrl(ct, rect.x, rect.y, rect.w, rect.h); 
      
      window.open(imgdata); 

    }  
  }, false); 


  // drag and drop original image loading ------  
  var noop = function(e){
    e.stopPropagation();
    e.preventDefault();
  }; 

  var dropzone = document.getElementById("canvascontainer"); 
  dropzone.addEventListener("dragenter", noop, false);
  dropzone.addEventListener("dragexit", noop, false);
  dropzone.addEventListener("dragover", noop, false);
  dropzone.addEventListener("drop", function(e){ 
    noop(e); 

    if (e.dataTransfer) { 
      var files = e.dataTransfer.files; 
      if(typeof files == "undefined" || files.length == 0){ 
        console.log('No files dropped!?');  
	return 0; 
      } 
      var reader = new FileReader(); 
      // Handle errors that might occur while reading the file (before upload).
      reader.onerror = function(evt) {
        var message;
        // REF: http://www.w3.org/TR/FileAPI/#ErrorDescriptions
        switch(evt.target.error.code) {
          case 1:
            message = file.name + " not found.";
            break;
          case 2:
            message = file.name + " has changed on disk, please re-try.";
            break;
          case 3:
            messsage = "Upload cancelled.";
            break;
          case 4:
            message = "Cannot read " + file.name + ".";
            break;
          case 5:
            message = "File too large for browser to upload.";
            break;
        }
        console.error(message);
      }      
      reader.onloadend = function(evt){
        var data = evt.target.result;
	loadOriginal(data);
      }; 
      // TODO prevent the processing of anything but real image files. 
      reader.readAsDataURL(files[0]); // we only care about one dropped image. 
    }
  }, false); 
}, false); 
