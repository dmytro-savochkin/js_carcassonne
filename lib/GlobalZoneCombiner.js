function GlobalZonesCombiner(gamezone, mainFieldCoords) {
	this.mainData = new MainData();
	var mainData = this.mainData;

	this.globalZones = gamezone.zones;	
    this.fields = gamezone.fields;	
    this.mainField = this.fields[mainFieldCoords.x][mainFieldCoords.y];

    this.keyCells = fillKeyCells();
    this.zonesToClose = [];
    
    //используются во время циклов
    this.direction;
    this.nearField;
    this.zoneTypeName; 
    this.gzNumberMainField; 
    
    
    
   	
   	function fillKeyCells() {
   		var end = mainData.cellsCount - 1;
		var half = Math.floor(end / 2);
		var quarter = Math.floor(half / 2);
   		var keyCells = {
			left: 	[[0, quarter],[0, half],[0, half + quarter]],
			right: 	[[end, quarter],[end, half],[end, half + quarter]],
			top: 	[[quarter, 0],[half, 0],[half + quarter, 0]],
			bottom: [[quarter, end],[half, end],[half + quarter, end]] 	
		};
		return keyCells;	
   	}       
}
var gzCombinerProto = GlobalZonesCombiner.prototype;








gzCombinerProto.uniteZonesAtNearFields = function() {	
	this.iterateNearFields();
	this.checkForClosingCloisters();	
}







gzCombinerProto.iterateNearFields = function() {
	for(var i in MainData.orientationArray) {
		this.direction = MainData.orientationArray[i].direction;
		var nearFieldCoords = new Coords( this.mainField.x+MainData.orientationArray[i].xShift, this.mainField.y + MainData.orientationArray[i].yShift	);

		if( ! this.fields.isFieldEmpty(nearFieldCoords)) {
			this.nearField = this.fields[nearFieldCoords.x][nearFieldCoords.y];
			
			this.iterateZoneTypes();
			
			delete this.nearField; 
		}                          
		delete this.direction;
	}	
}


gzCombinerProto.iterateZoneTypes = function() {
	for(var i in MainData.zoneTypes) {
		this.zoneTypeName = MainData.zoneTypes[i].name;
		var globalZones = this.globalZones[this.zoneTypeName];	
		
		this.iterateGlobalZones(globalZones);
		
		delete this.zoneTypeName;	
	}
}


gzCombinerProto.iterateGlobalZones = function(globalZones) {
	for(var i in globalZones) {
		this.gzNumberMainField = i; 
		var globalZone = globalZones[this.gzNumberMainField];
		var localZones = globalZone.localZones.valueFrom2DArrayAtCoords(this.mainField); 
			             
		if(localZones) {
			this.iterateLocalZones(localZones);   
		}

		this.gzNumberMainField = undefined;	
	}	
}


gzCombinerProto.iterateLocalZones = function(localZones) {
	for(var i in localZones) {
		var localZoneNumber = localZones[i];
		
		this.iterateKeyCells(localZoneNumber);	
	}		
}


gzCombinerProto.iterateKeyCells = function(localZoneNumber) {	
	for(var i in this.keyCells[this.direction]) {  
		var keyCell = this.keyCells[this.direction][i];	
	    var reverseDirection = MainData.reverseDirections[this.direction];
	        
		if( this.mainField.zones[this.zoneTypeName][localZoneNumber].data.inArray( keyCell )) {		 			
	 		this.iterateLocalZonesAtNearField( this.keyCells[reverseDirection][i] );
		} 
	}	    				
}


gzCombinerProto.iterateLocalZonesAtNearField = function( keyCellAtNearField ) {		
	for(var gzNumberNearField in this.globalZones[this.zoneTypeName]) {
		var globalZone = this.globalZones[this.zoneTypeName][gzNumberNearField];
		var localZonesAtNearField = globalZone.localZones.valueFrom2DArrayAtCoords(this.nearField);
		
		if( ! localZonesAtNearField) { 
			continue;
		}
				
    	for(var j in localZonesAtNearField) {
    		var lzNumberNearField = localZonesAtNearField[j];    
    	    if(this.cellExistsInLocalZoneAtNearField( keyCellAtNearField, lzNumberNearField )) {
    	    	this.updateGlobalZones(gzNumberNearField); 
    	    }    	    
    	}   
	}    
}


gzCombinerProto.updateGlobalZones = function( gzNumberNearField ) {
	var gzNumTo = this.gzNumberMainField;
	var gzNumFrom = gzNumberNearField;

	if(this.areGlobalZonesDifferent(gzNumTo, gzNumFrom)) {
    	this.uniteGlobalZones(gzNumTo, gzNumFrom);
		this.moveOpenedSides(gzNumTo, gzNumFrom);
	} 
	
	this.checkForClosingRoadsOrCastles(gzNumTo);
	
	if(this.areGlobalZonesDifferent(gzNumTo, gzNumFrom)) {
		this.deleteGlobalZone(gzNumFrom);
	}		      
}


gzCombinerProto.uniteGlobalZones = function(gzNumTo, gzNumFrom) {
	var gzTo = this.getGlobalZoneByNumber(gzNumTo);    
	var gzFrom = this.getGlobalZoneByNumber(gzNumFrom);
		
	for(var x in gzFrom.localZones) { 
		for(var y in gzFrom.localZones[x]) {
			var fieldCoords = new Coords(x, y);
            
			while(gzFrom.localZones[x][y].length > 0) {  	
				var lzNumber = gzFrom.localZones[x][y].shift();
				this.addLocalZoneToGlobalZone(lzNumber, gzTo, fieldCoords);
				this.updateRefToGlobalZoneInLocalZone(lzNumber, gzNumTo, fieldCoords);			    
			}
		}	
	}
	for(var i in gzFrom.meeples) {
		gzTo.meeples.push(gzFrom.meeples[i]);	
	}      
}


gzCombinerProto.moveOpenedSides = function(gzNumTo, gzNumFrom) {
	var gzTo = this.getGlobalZoneByNumber(gzNumTo);    
	var gzFrom = this.getGlobalZoneByNumber(gzNumFrom);
	
	for(var x in gzFrom.openedSides) { 
		if(gzTo.openedSides[x] == undefined)gzTo.openedSides[x] = [];
			
		for(var y in gzFrom.openedSides[x]) {
			if(gzTo.openedSides[x][y] == undefined)gzTo.openedSides[x][y] = [];
									
			for(var i in gzFrom.openedSides[x][y]) {
				gzTo.openedSides[x][y].push(gzFrom.openedSides[x][y][i]);	
			}
		}	
	} 	
}


gzCombinerProto.checkForClosingRoadsOrCastles = function(gzNumTo) {
	var globalZone = this.globalZones[this.zoneTypeName][gzNumTo];	
	if(this.zoneTypeName == "castles" || this.zoneTypeName == "roads") {
		var reverseDirection = MainData.reverseDirections[this.direction];
		var mainFieldOpenedSides = this.getGlobalZoneOpenedSides(globalZone, this.mainField);
		var nearFieldOpenedSides = this.getGlobalZoneOpenedSides(globalZone, this.nearField);	
		
		if( mainFieldOpenedSides.inArray(this.direction) && nearFieldOpenedSides.inArray(reverseDirection) ) {
		    this.deleteDirectionFromOpenedSides(mainFieldOpenedSides, this.direction);
		    this.deleteDirectionFromOpenedSides(nearFieldOpenedSides, reverseDirection);		
		} 
		
		if( ! globalZone.closed) {
			var openedSidesExistYet = this.checkForOpenedSides( globalZone.openedSides );
			if( ! openedSidesExistYet) {
				var score = this.calcScoreForGlobalZone(globalZone);
				this.closeZone(globalZone, score, this.zoneTypeName);		
			} 
		}
	}		
}
 

gzCombinerProto.calcScoreForGlobalZone = function(globalZone) {
	var score = 0;
	for(var x in globalZone.localZones) { 
		for(var y in globalZone.localZones[x]) {   
			for(var lzNum in globalZone.localZones[x][y]) {     
				score += this.fields[x][y].zones[this.zoneTypeName][lzNum].score;
				break;	
			}	
		}	
	}
	return score;	
}
 

gzCombinerProto.closeZone = function(globalZone, score, zoneTypeName) {
	globalZone.closed = true;
	globalZone.score = score;
	globalZone.zoneTypeName = zoneTypeName;
	this.zonesToClose.push(globalZone);				
}











  

gzCombinerProto.checkForClosingCloisters = function() {
	var zoneTypeName = "cloisters";
	
	for(var xShift = -1; xShift <= 1; xShift++) {
		for(var yShift = -1; yShift <= 1; yShift++) {		
			var internalFieldCoords = new Coords(this.mainField.x + xShift, this.mainField.y + yShift);	
			var field = this.fields[internalFieldCoords.x][internalFieldCoords.y];
			var middleCell = Math.floor((this.mainData.cellsCount - 1) / 2);
			
			var cloisterLetter = MainData.zoneTypesShortly[zoneTypeName][0];
			if( ! this.fields.isFieldEmpty(internalFieldCoords) && field.structure[middleCell][middleCell] == cloisterLetter) { 
				var cloisterGlobalZoneNumber = field.zones.cloisters[0].global;
					
				if(this.globalZones.cloisters[cloisterGlobalZoneNumber].closed == false) {    
					if( this.thereAreNoEmptyNearFields(internalFieldCoords) ) {
						var scoreForFullCloister = MainData.scoresForZones[zoneTypeName] * 9;
				    	this.closeZone(this.globalZones[zoneTypeName][cloisterGlobalZoneNumber], scoreForFullCloister, zoneTypeName);
				    }
				}	
			}	
		}	
	}	
}


gzCombinerProto.thereAreNoEmptyNearFields = function(internalFieldCoords) {
	for(var xExtShift = -1; xExtShift <= 1; xExtShift++) {
		for(var yExtShift = -1; yExtShift <= 1; yExtShift++) {
			var externalFieldCoords = new Coords(internalFieldCoords.x + xExtShift, internalFieldCoords.y + yExtShift);		     
			if(this.fields.isFieldEmpty(externalFieldCoords)) {
				return false;	
			}
		}
	}
	return true;	
}













gzCombinerProto.cellExistsInLocalZoneAtNearField = function(cell, localZoneNumber) {
	return this.nearField.zones[this.zoneTypeName][localZoneNumber].data.inArray(cell);
}

gzCombinerProto.areGlobalZonesDifferent = function(gzNumberField1, gzNumberField2) {
	return (gzNumberField1 != gzNumberField2);
}

gzCombinerProto.addLocalZoneToGlobalZone = function(localZoneNumber, globalZone, coords) {
	if(globalZone.localZones[coords.x] == undefined) {
		globalZone.localZones[coords.x] = new Array();		
	} if(globalZone.localZones[coords.x][coords.y] == undefined) {
		globalZone.localZones[coords.x][coords.y] = new Array();	
	}
	globalZone.localZones[coords.x][coords.y].push(localZoneNumber); 	  
}

gzCombinerProto.updateRefToGlobalZoneInLocalZone = function(lzNumber, gzNumber, fieldCoords) {
	this.fields[fieldCoords.x][fieldCoords.y].zones[this.zoneTypeName][lzNumber].global = parseInt(gzNumber);	
}

gzCombinerProto.getGlobalZoneByNumber = function(number) {
	return this.globalZones[this.zoneTypeName][number];
}

gzCombinerProto.getGlobalZoneOpenedSides = function(globalZone, coords) {
    if(globalZone.openedSides == undefined) {
    	return new Array();
    } if(globalZone.openedSides[coords.x] == undefined) {
    	return new Array();
    } if(globalZone.openedSides[coords.x][coords.y] == undefined) {
    	return new Array();
    }	
	return globalZone.openedSides[coords.x][coords.y];	
}

gzCombinerProto.deleteDirectionFromOpenedSides = function(openedSides, direction) {
	for(var i in openedSides) {
		if(openedSides[i] == direction) {
			delete openedSides[i];	   
		}		
	}	
}

gzCombinerProto.checkForOpenedSides = function(openedSides) {
	for(var x in openedSides) {
		for(var y in openedSides[x]) {      
			for(var i in openedSides[x][y]) {
				return true;	
			}	
		}	
	}
	return false;	
}

gzCombinerProto.deleteGlobalZone = function(gzNumFrom) {
	if(this.globalZones[this.zoneTypeName][gzNumFrom].score == 0) {
		this.globalZones[this.zoneTypeName][gzNumFrom].score = undefined;	
	}
	delete this.globalZones[this.zoneTypeName][gzNumFrom];	
}

gzCombinerProto.getZonesToClose = function() {
	return this.zonesToClose;	
}
	
