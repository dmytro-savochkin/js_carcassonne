// глобальные зоны
// gamezone.zones.castles[globalZoneNumber].localZones[x][y] = [0,1, ... ]                
// gamezone.zones.castles[globalZoneNumber].openedSides[x][y] = [left, top, ... ]         
// gamezone.zones.castles[globalZoneNumber].meeples = [{чей мипл, где стоит}, ... ]    		
// gamezone.zones.castles[globalZoneNumber].closed = false;
// gamezone.zones.castles[globalZoneNumber].score = 0-4
// gamezone.zones.castles[globalZoneNumber].zoneTypeName = castles|roads|grasses|cloisters

// локальные зоны
// field.zones.castles[0-...].global - ссылка на глобальный
// field.zones.castles[0-...].data = [[,], [,], [,], ...]
// field.zones.castles[0-...].score = int


function ZoneCreator(field) {
	this.mainData = new MainData();
	
	this.field = field;
	this.globalZones = this.field.game.gamezone.zones;
	this.fieldStructure = this.field.structure;
	this.cellsCount = this.mainData.cellsCount;
	
	this.zones = new ZonesList();		
	this.checkedCells = new Array();
}
var zoneCreatorProto = ZoneCreator.prototype;
















zoneCreatorProto.getLocalZones = function() {
	return this.zones;	
}
zoneCreatorProto.setFieldStructure = function(fieldStructure) {
	this.fieldStructure = fieldStructure;	
}




zoneCreatorProto.createZones = function() { 
	for(var x = 0; x < this.cellsCount; x++) {
		for(var y = 0; y < this.cellsCount; y++) {
			var cell = new Coords(x, y);
			if(this.cellHasChecked(cell)) {
				continue;		
			} else {
				this.addCellToChecked(cell);
				
				for(var typeNumber in MainData.zoneTypes) {
					var consideringZoneType = MainData.zoneTypes[typeNumber];
				    if(this.isCellHasSameTypeAsConsideringZone (cell, consideringZoneType)) {
						var localZoneNumber = this.createLocalZone(consideringZoneType.name);
						this.addScoreForZone(consideringZoneType, localZoneNumber, cell);
						this.fillRecursivelyLocalZone(cell.x, cell.y, consideringZoneType, localZoneNumber);	
					}		
				}
			}	
		}	
	}     
	
	this.iterateLocalZonesAndMakeAction("createGlobalZonesAndAddLinksToThem");	
}


zoneCreatorProto.fillRecursivelyLocalZone = function(x, y, consideringZoneType, localZoneNumber) { 
	this.pushCellCoordsIntoLocalZone(x, y, consideringZoneType.name, localZoneNumber);
    
	var nearCellsCoords = [[x+1,y], [x,y+1], [x-1,y], [x,y-1]]; 
	for(var i = 0; i < nearCellsCoords.length; i++) {
		var nearCell = new Coords(nearCellsCoords[i][0], nearCellsCoords[i][1]);
		if(this.cellCoordsAreValid(nearCell)) {	
            if(this.isCellHasSameTypeAsConsideringZone(nearCell, consideringZoneType) && ! this.cellHasChecked(nearCell)) {
				this.addScoreIfShieldIsOccured(this.zones[consideringZoneType.name][localZoneNumber], nearCell);
				this.addCellToChecked(nearCell);
				this.fillRecursivelyLocalZone(nearCell.x, nearCell.y, consideringZoneType, localZoneNumber); 	
			}
    	}
    }     
}


zoneCreatorProto.iterateLocalZonesAndMakeAction = function(action, fieldCoords) {
	for(var typeNumber in MainData.zoneTypes) {
		var zoneTypeName = MainData.zoneTypes[typeNumber].name;
		for(var localZoneNumber = 0; localZoneNumber < this.zones[zoneTypeName].length; localZoneNumber++) {			
			if(action == "createGlobalZonesAndAddLinksToThem") {
				this.createGlobalZone(zoneTypeName);
			    this.writeIntoLocalZoneLinkToGlobal(zoneTypeName, localZoneNumber);	      	    
		    } else if(action == "addIntoGlobalZonesLinksToLocal") { 
		    	var globalZoneNumber = this.zones[zoneTypeName][localZoneNumber].global;   
		    	this.pushLocalZoneNumberIntoGlobalZone(fieldCoords, zoneTypeName, globalZoneNumber, localZoneNumber);
		    	this.addOpenedSidesIntoGlobalZone(fieldCoords, zoneTypeName, localZoneNumber, globalZoneNumber);	    	
		    }    	
		}
	}	
}




zoneCreatorProto.addOpenedSidesIntoGlobalZone = function(fieldCoords, zoneTypeName, localZoneNumber, globalZoneNumber) {
	if(zoneTypeName == "castles" || zoneTypeName == "roads") {
		var end = Math.floor(this.cellsCount - 1);
	   	var middle = Math.floor(end / 2);
	   	var outermostCoords = [
	   		{coords: [0, middle], direction: "left"},
	   		{coords: [middle, 0], direction: "top"},
	   		{coords: [middle, end], direction: "bottom"},
	   		{coords: [end, middle], direction: "right"}
	   	];
   
	   	for(var i in outermostCoords) {
	   		var cell = new Coords(outermostCoords[i].coords[0], outermostCoords[i].coords[1]);
            var location = outermostCoords[i].direction;              
	   		if(this.cellInLocalZone(cell, zoneTypeName, localZoneNumber)) {
	   			this.pushOpenedSidesIntoGlobalZone(fieldCoords, zoneTypeName, globalZoneNumber, location);	   			
	   		}	
	   	}
	}	   		
}






zoneCreatorProto.pushLocalZoneNumberIntoGlobalZone = function(field, zoneTypeName, globalZoneNumber, localZoneNumber) {
	var localZones = this.globalZones[zoneTypeName][globalZoneNumber].localZones; 
	this.newArrayInGlobalZoneElement(localZones, field);	
	localZones[field.x][field.y].push(localZoneNumber);	
}
zoneCreatorProto.pushOpenedSidesIntoGlobalZone = function(field, zoneTypeName, globalZoneNumber, location) {
	var openedSides = this.globalZones[zoneTypeName][globalZoneNumber].openedSides; 
	this.newArrayInGlobalZoneElement(openedSides, field);	
	openedSides[field.x][field.y].push(location);	   			
}
zoneCreatorProto.createGlobalZone = function(zoneTypeName) {
	this.globalZones[zoneTypeName].push( new GlobalZone() );
}
zoneCreatorProto.newArrayInGlobalZoneElement = function(globalZoneElement, field) {
	if(globalZoneElement[field.x] == undefined) {
		globalZoneElement[field.x] = new Array();	
	} 
	if(globalZoneElement[field.x][field.y] == undefined) {
		globalZoneElement[field.x][field.y] = new Array();	
	}
}






 
zoneCreatorProto.writeIntoLocalZoneLinkToGlobal = function(zoneTypeName, localZoneNumber) {
	this.zones[zoneTypeName][localZoneNumber].global = this.globalZones[zoneTypeName].length - 1;
}
zoneCreatorProto.createLocalZone = function(zoneTypeName) {
	this.zones[zoneTypeName].push( new LocalZone() );
	return this.zones[zoneTypeName].length - 1;
}
zoneCreatorProto.pushCellCoordsIntoLocalZone = function(x, y, zoneTypeName, localZoneNumber) {
	this.zones[zoneTypeName][localZoneNumber].data.push([x, y]);	
}	
zoneCreatorProto.cellCoordsAreValid = function(field) { 
	return field.x >= 0 && field.x < this.cellsCount && field.y >= 0 && field.y < this.cellsCount
}
zoneCreatorProto.isCellHasSameTypeAsConsideringZone = function(cell, consideringZoneType) { 
	var zoneTypeLetters = consideringZoneType.letters;
	var cellType = this.fieldStructure[cell.x][cell.y];
	return zoneTypeLetters.inArray(cellType);
}
zoneCreatorProto.cellHasChecked = function(coordsObject) { 
	var coordsArray = [coordsObject.x, coordsObject.y];
	return this.checkedCells.inArray(coordsArray);
}
zoneCreatorProto.addCellToChecked = function(cellObject) { 
	var cellArray = [cellObject.x, cellObject.y];
	this.checkedCells.push(cellArray);
}
zoneCreatorProto.cellInLocalZone = function(cell, zoneTypeName, localZoneNumber) {
	return this.zones[zoneTypeName][localZoneNumber].data.inArray([cell.x, cell.y]);	
}

zoneCreatorProto.addScoreForZone = function(zoneType, localZoneNumber, cell) {
	var localZone = this.zones[zoneType.name][localZoneNumber];
	localZone.score = MainData.scoresForZones[zoneType.name];
	this.addScoreIfShieldIsOccured(localZone, cell);	
}
zoneCreatorProto.addScoreIfShieldIsOccured = function(localZone, cell) {
	if(this.fieldStructure[cell.x][cell.y] == MainData.zoneTypesShortly.castles[1]) {
		localZone.score += MainData.scoresForZones.shields;
	}	
}





zoneCreatorProto.rotateLocalZones = function(rotate) {
	for(var typeNumber in MainData.zoneTypes) {
		var zoneTypeName = MainData.zoneTypes[typeNumber].name;
		for(var localZoneNumber = 0; localZoneNumber < this.zones[zoneTypeName].length; localZoneNumber++) {			
			for(var i = 0; i < this.zones[zoneTypeName][localZoneNumber].data.length; i++) {			
		    	var coords = this.zones[zoneTypeName][localZoneNumber].data[i];
		    	this.zones[zoneTypeName][localZoneNumber].data[i] = this.field.rotateCoordsInCell(coords, rotate);
			}
		}
	}                           
}




















