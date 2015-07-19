function CanvasDrawer(canvasId) {
	this.mainData = new MainData();
	this.canvas = document.getElementById(arguments[0]);      
	this.canvas.context = this.canvas.getContext('2d');	
}

CanvasDrawer.prototype.getRotateAngleByFieldOrientation = function(orientation) {
	var rotateAngle = false;

    switch(orientation) {
        case "north":
            rotateAngle = 0;
            break;
        case "west":
            rotateAngle = -Math.PI/2;
            break;
        case "east":
            rotateAngle = Math.PI/2;
            break;
        case "south":
            rotateAngle = Math.PI;
            break;
    }

	return rotateAngle;		
}

















function CanvasDrawerGamezone(canvasId) {
	if ( ! CanvasDrawerGamezone._instance)CanvasDrawerGamezone._instance = this; 
	else return CanvasDrawerGamezone._instance;  
	           
	
	
	CanvasDrawerGamezone.superclass.constructor.call(this, canvasId);

    this.canvasId = canvasId;      
	this.canvasJquery = $('#' + canvasId);
		
	this.tilesCount = this.mainData.tilesCount;
	this.cellsCount = this.mainData.cellsCount;
	this.imageWidthToTileWidth = this.mainData.imageWidthToTileWidth;
	
	var self = this;
	this.canvas.getSize = function() {
		return self.canvasJquery.width(); 
	} 
	this.canvas.setSize = function(size) {
		self.canvasJquery.width(size);  
		self.canvasJquery.height(size);
	} 
	
	this.tileWidth = this.canvas.getSize() / this.tilesCount;
	this.cellWidth = this.tileWidth / this.cellsCount;
	this.imageWidth = Math.floor( this.tileWidth * this.imageWidthToTileWidth );	
	this.tileMinusImageWidth = this.tileWidth - this.imageWidth;

	this.innerTileSavedState;
	this.outerTileSavedState;
	this.highlightedImagesStates; 

	this.scale = 1;
}
extend(CanvasDrawerGamezone, CanvasDrawer);
var canvasDrawerProto = CanvasDrawerGamezone.prototype;






canvasDrawerProto.createGrid = function() {
	for (var i = 1; i <= this.tilesCount; i++) {
		this.createGridLine(this.tileWidth * i, 0);
		this.createGridLine(0, this.tileWidth * i);	
	}	
}	
canvasDrawerProto.createGridLine = function(x, y) {   
	this.canvas.context.save(); 
	this.canvas.context.strokeStyle = "rgba(255, 255, 255, 0.25)";                
	this.canvas.context.translate(x, y);
	this.canvas.context.beginPath();
	this.canvas.context.moveTo(0, 0);      
	if(y == 0) this.canvas.context.lineTo(0, this.tileWidth*this.tilesCount);
	if(x == 0) this.canvas.context.lineTo(this.tileWidth*this.tilesCount, 0);                                
	this.canvas.context.stroke();
	this.canvas.context.restore();  
}






canvasDrawerProto.drawTile = function(field) { 
	if( ! field) throw new Error("tryingToDrawButFieldIsFalse");

	var translate = this.calcTranslates(field);
	this.canvas.context.save();
	this.canvas.context.translate(translate.x, translate.y); 
	if(field.orientation != undefined) {
		var rotateAngle = this.getRotateAngleByFieldOrientation(field.orientation);
		this.canvas.context.rotate(rotateAngle); 
	}               
	this.canvas.context.drawImage(field.image, - this.tileWidth / 2 , - this.tileWidth / 2, this.imageWidth, this.imageWidth);
    this.canvas.context.restore();
}

canvasDrawerProto.calcTranslates = function(field) {
	var translate = new Coords(
		this.tileWidth * field.x + this.tileMinusImageWidth + this.imageWidth/2, 
		this.tileWidth * field.y + this.tileMinusImageWidth + this.imageWidth/2
	);
	translate = this.addPixelComensationBecauseOfRotating(translate, field.orientation);
	return translate;
}

canvasDrawerProto.addPixelComensationBecauseOfRotating = function(translate, orientation) {
	// компенсация пикселей при повороте. Возникает из-за различия в размере тайла и клетки.
	switch(orientation) {
        case "west":
            translate.y -= this.tileMinusImageWidth;
            break;
        case "east":
            translate.x -= this.tileMinusImageWidth;
            break
        case "south":
            translate.x -= this.tileMinusImageWidth;
            translate.y -= this.tileMinusImageWidth;
            break;
    }
	return translate;	
}






canvasDrawerProto.drawBorder = function(coords) {
	if(coords == undefined)return false;
	this.outerTileSavedState = this.getOuterTileImage(coords);
	this.canvas.context.save(); 
	this.canvas.context.strokeStyle = "rgba(255, 255, 255, 1)"; // 255, 216, 0, 1
	this.canvas.context.strokeRect(coords.x * this.tileWidth, coords.y * this.tileWidth, this.tileWidth, this.tileWidth); 
	this.canvas.context.stroke();	
    this.canvas.context.restore();      
}
canvasDrawerProto.removeBorder = function(coords) { 
	if(this.outerTileSavedState == undefined)return false;
	
	this.innerTileSavedState = this.getInnerTileImage(coords); 
	this.putOuterTileImage(coords);	
	this.putInnerTileImage(coords);
}





canvasDrawerProto.getInnerTileImage = function(coords) { 
	return this.canvas.context.getImageData(coords.x * this.tileWidth + this.tileMinusImageWidth/2, coords.y * this.tileWidth + this.tileMinusImageWidth/2, this.imageWidth, this.imageWidth);	
}
canvasDrawerProto.putInnerTileImage = function(coords) { 
	this.canvas.context.putImageData(this.innerTileSavedState, coords.x * this.tileWidth + this.tileMinusImageWidth/2, coords.y * this.tileWidth + this.tileMinusImageWidth/2);
}

canvasDrawerProto.getOuterTileImage = function(coords) { 
	return this.canvas.context.getImageData(coords.x * this.tileWidth - 1, coords.y * this.tileWidth - 1, this.tileWidth + 2, this.tileWidth + 2);
}
canvasDrawerProto.putOuterTileImage = function(coords) {
	this.canvas.context.putImageData(this.outerTileSavedState, coords.x * this.tileWidth - 1, coords.y * this.tileWidth - 1);
}






canvasDrawerProto.drawHighlighting = function(highlightingField) { 
	this.saveBackgroundState(highlightingField);
	this.removeHighlighting(highlightingField);
	this.drawTile(highlightingField);	
}
canvasDrawerProto.removeHighlighting = function(coords) { 
	this.putBackgroundState(coords);
}

canvasDrawerProto.saveBackgroundState = function(coords) { 
	if(this.backgroundStates == undefined) this.backgroundStates = [];
	if(this.backgroundStates[coords.x] == undefined) this.backgroundStates[coords.x] = [];
 	if(this.backgroundStates[coords.x][coords.y] == undefined) {      
		this.backgroundStates[coords.x][coords.y] = this.getInnerTileImage(coords);
	}	
}
canvasDrawerProto.putBackgroundState = function(coords) {
	if(this.backgroundStates == undefined)return false;
	if(this.backgroundStates[coords.x] == undefined)return false;
	if(this.backgroundStates[coords.x][coords.y] == undefined)return false;
	this.canvas.context.putImageData(this.backgroundStates[coords.x][coords.y], coords.x * this.tileWidth + this.tileMinusImageWidth/2, coords.y * this.tileWidth + this.tileMinusImageWidth/2);
}                                    






canvasDrawerProto.clearCanvas = function() {
 	var pattern = this.canvas.context.createPattern(this.mainData.wallpaperObj, "repeat");
 	this.canvas.context.rect(0, 0, this.canvas.width, this.canvas.height);     
	this.canvas.context.fillStyle = pattern;
	this.canvas.context.fill(); 
}






canvasDrawerProto.drawMeeple = function(field, cell, zoneTypeName, meepleImage, meepleSize) {
	var translateX = this.tileWidth * field.x + this.cellWidth * cell.x + this.cellWidth / 2;
	var translateY = this.tileWidth * field.y + this.cellWidth * cell.y + this.cellWidth / 2;
	var imageWidth = meepleSize * this.tileWidth / this.cellWidth;
	
	this.canvas.context.save();
	this.canvas.context.translate(translateX, translateY); 
	if(zoneTypeName == "grasses")this.canvas.context.rotate(0.3);
	this.canvas.context.drawImage(meepleImage, - imageWidth / 2, - imageWidth / 2, imageWidth, imageWidth);
    this.canvas.context.restore();		
}






canvasDrawerProto.rescale = function(scaleRate) {
	this.scale *= scaleRate;
	Sizer.memorizeCanvasPaddingsAfterRescaling(scaleRate);	
	this.canvas.setSize( scaleRate * this.canvas.getSize() ) ;
	Sizer.setFieldSizes();   
	Sizer.setCanvasPaddings(this.tileWidth, this.scale);
}
























function CanvasDrawerNextTilePanel(canvasId) {
	CanvasDrawerNextTilePanel.superclass.constructor.call(this, canvasId);	
}
extend(CanvasDrawerNextTilePanel, CanvasDrawer);

CanvasDrawerNextTilePanel.prototype.drawTileInGameInfo = function(rotateAngle, nextTileImg) {
	if(nextTileImg)this.canvas.image = nextTileImg;
	if( ! this.canvas.image) throw new Error("noImageWasPassedForDrawingInGameInfo");	
	
	var imageWidth = this.canvas.image.width;	          
	var translate = imageWidth * 0.5;
	
	this.canvas.context.save();
	this.canvas.context.translate(translate, translate);    
	this.canvas.context.rotate(rotateAngle);
	this.canvas.context.drawImage(this.canvas.image, - imageWidth / 2, - imageWidth / 2, imageWidth, imageWidth);
    this.canvas.context.restore();
}
