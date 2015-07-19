function ImageManager(parent) {
    this.parent = parent;
    
    this.imagesToLoad = 0;
    this.imagesAreLoaded = 0;
    this.allImagesAreLoaded = false;
}
var imageManagerProto = ImageManager.prototype;






imageManagerProto.loadImage = function(src, count) {
	var image = new Image();
    image.src = src;
    
    if(count)this.imagesToLoad++;
    
    var imageManager = this;
	image.onload = function(e) {      
		imageManager.imagesAreLoaded++; 
	}			

	return image;	
}




imageManagerProto.checkAreAllImagesLoaded = function() {  
	if(this.imagesToLoad == this.imagesAreLoaded) {  
		this.allImagesAreLoaded = true;	
	}
}




imageManagerProto.reloadImagesGamezone = function() {
	var array = this.parent.meeplesImages;   
	for(var i in array) {       
		for(var j in array[i]) {  
			if(array[i][j] instanceof Image && array[i][j].width == 0) {
				array[i][j] = this.loadImage(array[i][j].src, false);	
			}	
		}	 
	}	
}    



imageManagerProto.reloadImagesTilesParser = function() {
	var array = this.parent.tilesStructure;  
	for(var i in array) {       
		if(array[i].image instanceof Image && array[i].image.width == 0) {
			array[i].image = this.loadImage(array[i].image.src, false);	
		}	 
	}	
}   
