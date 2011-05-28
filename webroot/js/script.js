dojo.require("dijit.form.TextBox"); 
dojo.require("dijit.form.Button"); 
    

var IMAGEPROXY_PREFIX = '/img/'; 

dojo.addOnLoad(function(){ 
  //var app = new App(); 
  var controls = dojo.byId("bgimg");
   canvas = new fabric.Element('canvas');
  var originalImage = null;
   billyfaces = []; 

  var loadOriginal = function(url){ 
      url = url || IMAGEPROXY_PREFIX + originalUrlInput.attr('value'); 
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

  var originalUrlInput = new dijit.form.TextBox({
    onKeyDown: function(e){
      if(e.keyCode == 13) loadOriginal();
    } 
  }).placeAt(controls);

  new dijit.form.Button({
    label: 'Load Image', 
    onClick: function(){ 
        loadOriginal();
    } 
  }).placeAt(controls); 


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
	  dojo.byId('canvas').scrollIntoViewIfNeeded(); 
        }); 
      } 
    }; 
  })()); 

  var save = new dijit.form.Button({
    label: 'Save', 
    onClick: function(){ 
      canvas.deactivateAll();
      window.open(canvas.toDataURL('png')); 
    } 
  }).placeAt(dojo.byId('save'));


  // drag and drop original image loading ------  
  var noop = function(e){
    e.stopPropagation();
    e.preventDefault();
  }; 

  var dropzone = document.getElementById("gfxNode"); 
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

