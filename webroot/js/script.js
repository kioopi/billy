var IMAGEPROXY_PREFIX = '/img/'; 


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

dojo.addOnLoad(function(){ 
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
  //*/ 

  byId('helpBtn').addEventListener('click', function(e){ 
    console.log('hello');
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
   billyfaces = []; 

  var loadOriginal = function(url){ 
      url = url || IMAGEPROXY_PREFIX + byId('originalUrlField').value; 
      if(originalImage) 
        canvas.remove(originalImage); 

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
  }, false); 


  byId('loadOriginalBtn').addEventListener('click', function(){ 
        loadOriginal();
  }, false); 


  // pressing 'escape' should remove the active billyface
  dojo.connect(dojo.body(), 'onkeydown', null, function(e){ 
    if(e.keyCode == 46) {
      var selected = canvas.getActiveObject(); 
      billyfaces.slice(billyfaces.indexOf(selected),1); 
      canvas.fxRemove(selected);   
    } 
  }); 

  dojo.connect(dojo.byId('cbfs'), 'click', null,(function(){
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
	  //dojo.byId('canvas').scrollIntoViewIfNeeded(); 
        }); 
      } 
    }; 
  })()); 

  byId('saveBtn').addEventListener('click', function(){ 
    canvas.deactivateAll();
    window.open(canvas.toDataURL('png')); 
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

    if(e.dataTransfer){ 
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

}); 

