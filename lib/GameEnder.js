function GameEnder(game) {
	this.mainData = new MainData();
	this.game = game;
	this.globalZones = this.game.gamezone.zones; 
	this.fields = this.game.gamezone.fields;
}
var gameEnderProto = GameEnder.prototype;




gameEnderProto.scoreAllZones = function() {
	this.closeGrasses();
	
	this.closeZone("castles", 2);
	this.closeZone("roads", 1);
	this.closeZone("cloisters", 1);
	
	this.game.totalMeeplesScore();
}


gameEnderProto.closeZone = function(zoneTypeName, scoreDivider) {
    for(var gzNum in this.globalZones[zoneTypeName]) {
    	var globalZone = this.globalZones[zoneTypeName][gzNum];
    	if(globalZone.meeples.length != 0 && globalZone.closed == false) {
    		globalZone.score = Math.floor(this.calcScoreForGlobalZone(globalZone, zoneTypeName) / scoreDivider);
    		globalZone.closed = true;
    		globalZone.zoneTypeName = zoneTypeName;
			this.game.gamezone.zonesToClose.push(globalZone);
    	}	
    }
}


gameEnderProto.calcScoreForGlobalZone = function(globalZone, zoneTypeName) {
	var score = 0;
	
	if(zoneTypeName == "cloisters") {
		for(var x in globalZone.localZones) { 
			for(var y in globalZone.localZones[x]) {	
				for(var xShift = -1; xShift <= 1; xShift++) {
					for(var yShift = -1; yShift <= 1; yShift++) {
						var nearCloisterCoords = new Coords(parseInt(x) + xShift, parseInt(y) + yShift);
						if( ! this.game.gamezone.fields.isFieldEmpty(nearCloisterCoords)) {
							score++;	
						}	
					}
				}	
					
			}
		}			
	} 
	else if(zoneTypeName == "castles" || zoneTypeName == "roads") {
		for(var x in globalZone.localZones) { 
			for(var y in globalZone.localZones[x]) {   
				for(var lzNum in globalZone.localZones[x][y]) {     
					score += this.game.gamezone.fields[x][y].zones[zoneTypeName][lzNum].score;
					break;	
				}	
			}	
		} 
	}
	return score;	
}











/*
Методика расчета очков за поля:
1. цикл по полям
2. цикл по замкам
3-4. цикл по координатам полей
5-6. цикл по координатам замков
7. цикл по локальным зонам замков
8. цикл по ячейкам локальных зон замков
9. цикл по соседним ячейкам ячейки из цикла выше
10. цикл по локальным зонам полей
*/


gameEnderProto.closeGrasses = function() {
	this.iterateAllGrassesWithMeeples();
}


gameEnderProto.iterateAllGrassesWithMeeples = function() {
    for(var gzGrassNum in this.globalZones["grasses"]) {
		var gzGrass = this.globalZones["grasses"][gzGrassNum];

		if(gzGrass.meeples.length > 0) {   
			this.iterateAllClosedCastles(gzGrass);		
		}
		
		if(gzGrass.score > 0) {
			this.game.gamezone.zonesToClose.push(gzGrass);
		}
	}
}

gameEnderProto.iterateAllClosedCastles = function(gzGrass) {    
	for(var gzCastleNum in this.globalZones["castles"]) {
		var gzCastle = this.globalZones["castles"][gzCastleNum];
		
		if(gzCastle.closed) {
			if(this.findMutualFields(gzCastle, gzGrass) == MainData.CASTLE_ALREADY_SCORED)
				continue;
		}							
	}
}


gameEnderProto.findMutualFields = function(gzCastle, gzGrass) { 
	for(var x in gzGrass.localZones) {
	for(var y in gzGrass.localZones[x]) {		
		for(var xCastle in gzCastle.localZones) {
		for(var yCastle in gzCastle.localZones[xCastle]) {	
			if(x == xCastle && y == yCastle) {
				if(this.iterateCastleCells(gzCastle, gzGrass, x, y)) 
					return MainData.CASTLE_ALREADY_SCORED;
			}			
		}
		}			
	}
	} 	
}


gameEnderProto.iterateCastleCells = function(gzCastle, gzGrass, x, y) { 
	for(var lzCastleIndex in gzCastle.localZones[x][y]) {
		var lzCastleNum = gzCastle.localZones[x][y][lzCastleIndex]; 
		var lzCastleCells = this.fields[x][y].zones.castles[lzCastleNum].data;
    	
    	for(var lzCastleCellNum in lzCastleCells) {	
   		    var lzCastleCell = lzCastleCells[lzCastleCellNum];
   		    
   		    if(this.iterateNearCastleCells(gzCastle, gzGrass, x, y, lzCastleCells, lzCastleCell)) 
   		    	return MainData.CASTLE_ALREADY_SCORED;
		}
	}
}


gameEnderProto.iterateNearCastleCells = function(gzCastle, gzGrass, x, y, lzCastleCells, lzCastleCell) { 
	for(var orientationNum in MainData.orientationArray) {
		var orientation = MainData.orientationArray[orientationNum];
		var nearCell = [lzCastleCell[0] + orientation.xShift, lzCastleCell[1] + orientation.yShift];     
		
		if(this.areCellCoordsValid(nearCell)) { 		    			    	
			if(this.isNearCellNotInCastle(gzGrass, x, y, lzCastleCells, nearCell)) 
				return MainData.CASTLE_ALREADY_SCORED;
		}	
	} 	
}


gameEnderProto.isNearCellNotInCastle = function(gzGrass, x, y, lzCastleCells, nearCell) { 
	if( ! lzCastleCells.inArray(nearCell)) {
			  			    				
		for(var lzGrassIndex in gzGrass.localZones[x][y]) {	
  			var lzGrassNum = gzGrass.localZones[x][y][lzGrassIndex]; 
			var lzGrassCells = this.fields[x][y].zones.grasses[lzGrassNum].data;
			
			if(this.isNearCellInGrass(gzGrass, lzGrassCells, nearCell))
		    	return MainData.CASTLE_ALREADY_SCORED;
		}	    	
	}
}


gameEnderProto.isNearCellInGrass = function(gzGrass, lzGrassCells, nearCell) { 
	if(lzGrassCells.inArray(nearCell)) {	  			                                
		gzGrass.score += 3;
	    gzGrass.closed = true;
		gzGrass.zoneTypeName = "grasses";						  			    	
	   	return MainData.CASTLE_ALREADY_SCORED;
	}  	
}









gameEnderProto.areCellCoordsValid = function(cell) {
	return (cell[0] >= 0 && cell[1] >= 0 && cell[0] < this.mainData.cellsCount && cell[1] < this.mainData.cellsCount);
}