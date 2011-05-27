dojo.require("dijit.form.TextBox"); 
dojo.require("dijit.form.Button"); 
    

var IMAGEPROXY_PREFIX = '/img/'; 

dojo.addOnLoad(function(){ 
  //var app = new App(); 
  var controls = dojo.byId("bgimg");
   canvas = new fabric.Element('canvas');
  var originalImage = null;
   billyfaces = []; 

  var loadOriginal = function(){ 
      if(originalImage) 
        canvas.remove(originalImage); 
       
      var url = IMAGEPROXY_PREFIX + originalUrlInput.attr('value'); 
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

}); 


