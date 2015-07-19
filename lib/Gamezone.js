function Gamezone() {
	this.mainData = new MainData();
	
	this.tilesCount = this.mainData.tilesCount;
	this.cellsCount = this.mainData.cellsCount;
	
	this.fields = new Array(); //this.fields[0-49][0-49] = {isClosed: false, isHighlighted: false} 
	this.highlightedFields = new Array(); //this.highlightedFields[0-49][0-49] = true|undefined
    
 
    this.minScale = this.mainData.canvasMinScale;
    this.maxScale = this.mainData.canvasMaxScale;
    
    this.highlightedField = {image: false};        
    this.meeplesImages = new Object;
    this.imageManager = new ImageManager(this);
    
    this.zones = new ZonesList();	

    this.zonesToClose;
 	this.lastField = new Coords(0,0);   
 	
 	this.canvasLayer;
}
var gamezoneProto = Gamezone.prototype;








gamezoneProto.addCanvasDrawer = function() {
   	this.canvasLayer = new CanvasDrawerGamezone(this.mainData.canvasId);
}

gamezoneProto.getScale = function() {
	return this.canvasLayer.scale;
}





gamezoneProto.setAndLoadImages = function() {
	this.highlightedField.image = this.imageManager.loadImage( this.mainData.highlightedFieldImageSrc, true );
	
	for(var i in this.mainData.meeplesImagesSrc) {
		this.meeplesImages[i] = {};
		for(var j in this.mainData.meeplesImagesSrc[i]) {
			var meeple = this.mainData.meeplesImagesSrc[i][j];
			this.meeplesImages[i][meeple.name] = this.imageManager.loadImage( meeple.src, true );		
		}		
	}		
}

	








gamezoneProto.clearAllGlobalZones = function() {
	for(var i in this.zones) {
		delete this.zones[i];	
	}
	this.zones = undefined;
}




gamezoneProto.createEmptyFields = function() {      
	this.fields = this.fields.createMultidimensionalArray(2, this.tilesCount);	
	this.highlightedFields = this.highlightedFields.createMultidimensionalArray(2, this.tilesCount);	
} 
gamezoneProto.createGrid = function() {             
	this.canvasLayer.createGrid();	
}	
gamezoneProto.clearCanvas = function() { 
	this.canvasLayer.clearCanvas();
}	
gamezoneProto.drawTile = function(field) { 	
	this.canvasLayer.drawTile(field);
}
gamezoneProto.markTileAsLastPlaced = function(coords) { 	
	this.canvasLayer.drawBorder(coords);
}
gamezoneProto.removeMarkFromPastTile = function(coords) { 	
	this.canvasLayer.removeBorder(coords);
}


gamezoneProto.rescale = function(scaleRate) {
	this.canvasLayer.rescale(scaleRate);	
}
gamezoneProto.clearTile = function(coords) {
	this.canvasLayer.clearTile(coords); 
}




gamezoneProto.unhighlightAvailableFields = function() { 
	for(var x in this.highlightedFields) {
		for(var y in this.highlightedFields[x]) {
			if(this.highlightedFields[x][y]) {
				this.highlightField(false, x, y);	
			}
		}	
	}
}  

gamezoneProto.highlightAvailableFields = function(pendingField) {   
    var highlightingField = true;
    var availableFieldsToMove = this.checkForMoves(pendingField, highlightingField);
    
	if(availableFieldsToMove == 0) {	
		highlightingField = false;
		var orientationToMoveExists = false; 
		var fieldsToMove;
		
		for(var i = 0; i < 3; i++) {
			pendingField.orientation = MainData.directionsArray[pendingField.orientation]["right"];
			pendingField.updateStructureAndZones("right");  
			if(orientationToMoveExists == false) {
				fieldsToMove = this.checkForMoves(pendingField, highlightingField);	
	    	}
	    	if(fieldsToMove > 0) {
	    		orientationToMoveExists = true;
	    	}
	    }
	    pendingField.orientation = MainData.directionsArray[pendingField.orientation]["right"];
		pendingField.updateStructureAndZones("right");
	    
	 
	    if(orientationToMoveExists === false) {
	    	throw new Error("noAvailableTurn");	
	    }
	}
}

gamezoneProto.checkForMoves = function(field, highlightingField) {
	var availableFieldsToMove = 0;
	var checkedFields = new Array();
	checkedFields = checkedFields.createMultidimensionalArray(2, this.tilesCount);
	
	for(var x in this.fields) {
		for(var y in this.fields[x]) {
			if(this.fields[x][y].isClosed == undefined || this.fields[x][y].isClosed == false) {

				var settingField = {};
				var weCanSetFieldHere;
				for(var i in MainData.orientationArray) {
					settingField.x = parseInt(x) + MainData.orientationArray[i].xShift;
					settingField.y = parseInt(y) + MainData.orientationArray[i].yShift;
					if(checkedFields[settingField.x][settingField.y] == undefined && this.fields.isFieldEmpty(settingField)) { 
						weCanSetFieldHere = this.checkCanWeSetFieldHere(field, settingField.x, settingField.y);     
					    if(weCanSetFieldHere) {
					    	availableFieldsToMove++;
					    	if(highlightingField) {
					    		this.highlightField(true, settingField.x, settingField.y);
					    	}	
					    } else {
					    	if(highlightingField) {
								this.highlightField(false, settingField.x, settingField.y);
							}		
						}
					
						checkedFields[settingField.x][settingField.y] = true;  
				    } 
				}
			}
		}		
	}        
	return availableFieldsToMove;	
}
 
gamezoneProto.highlightField = function(highlight, x, y) {
	var fieldCoords = new Coords(x, y);
	if(highlight) {
		this.highlightedFields[x][y] = true;
		var highlightedField = {image: this.highlightedField.image, x: x, y: y}; 
		this.canvasLayer.drawHighlighting(highlightedField);		
	} else {
		delete this.highlightedFields[x][y];		
		if(this.fields.isFieldEmpty(fieldCoords)) {
			this.canvasLayer.removeHighlighting(fieldCoords);	
		}		
	}
}
 
gamezoneProto.clearAllHighlightedFields = function() {
	for(var x in this.highlightedFields) {
		for(var y in this.highlightedFields[x]) {
			this.highlightField(false, x, y);			
		}	
	}	
}



        
gamezoneProto.checkCanWeSetFieldHere = function(field, x, y) {  
	var weCanSetFieldHere = true;
	
	for(var i in MainData.orientationArray) {
		var direction = MainData.orientationArray[i].direction;
		var reverseDirection = MainData.orientationArray[i].reverseDirection;
		var dx = parseInt(x) + MainData.orientationArray[i].xShift;
		var dy = parseInt(y) + MainData.orientationArray[i].yShift;
		var coords = new Coords(dx, dy);
		if( ! this.fields.isFieldEmpty(coords)) { 
			weCanSetFieldHere = weCanSetFieldHere && (field[direction] == this.fields[dx][dy][reverseDirection]);	
	    }
	}
	return weCanSetFieldHere;	
}

gamezoneProto.checkAreThereNearFields = function(field) {
	for(var i = 0; i < 4; i++) {
		var nearFieldCoords = new Coords(field.x + MainData.orientationArray[i].xShift, field.y + MainData.orientationArray[i].yShift);
		if( ! this.fields.isFieldEmpty(nearFieldCoords) ) { 
			return true;                            
		}
	}				            
	throw new Error("noNearFieldsThere");
}





gamezoneProto.uniteNearGlobalZones = function(placedFieldCoords) {
	var gzCombiner = new GlobalZonesCombiner(this, placedFieldCoords);
	gzCombiner.uniteZonesAtNearFields();
	this.zonesToClose = gzCombiner.getZonesToClose();	
}

gamezoneProto.calculateAvailableMeeplePositions = function(field) {
	var meeplesManager = new MeeplesManager(this.zones, field);	
	meeplesManager.calculateAvailablePositions();
	return meeplesManager.getAvailablePositions();			
}

gamezoneProto.highlightMeeplesPositions = function(field, meeplesPositions) {	
	for(var i in meeplesPositions.coords) {
		var cell = new Coords(meeplesPositions.coords[i][0], meeplesPositions.coords[i][1]);
		var zoneTypeName = meeplesPositions.zoneTypeName[i];
		this.canvasLayer.drawMeeple(field, cell, zoneTypeName, this.meeplesImages.basic.free, 1.5);
	}
}

gamezoneProto.drawMeeple = function(field, cell, globalZone, player) {
	this.canvasLayer.drawMeeple(field, cell, globalZone.zoneTypeName, this.meeplesImages["basic"][player.color], 2);		
}

gamezoneProto.removeMeeplesPositions = function(field){
	this.canvasLayer.drawTile(field); 	
}

