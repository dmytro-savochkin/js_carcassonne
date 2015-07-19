function Game(gamezone, managezone) {
	this.mainData = new MainData();
	
	this.gamezone = gamezone;
	this.managezone = managezone;	
	
	this.tilesStructure = new Array();
	this.tilesQueue = new Array();
	this.tilesDir = this.mainData.tilesDir;
	this.audioSetFieldId = this.mainData.audioSetFieldId;
	
	this.countOfTilesTypes;	 
	this.lastMoveCoords;
	
	this.status;
	this.lastAvailableMeeplesPositions = new Array(); 
	
	this.moveMaker = new MoveMaker(this.gamezone.fields);
	this.logger = new Logger();
	this.playerManager = new PlayerManager(this.logger); 
	
	this.soundEnabled = true; 	
}
var gameProto = Game.prototype;    





gameProto.setStatus = function(status) {	
	this.status = status;
}
gameProto.getStatus = function() {
	return this.status;	
}
gameProto.getCurrentPlayer = function() {
	return this.playerManager.players[this.playerManager.playerIdToMove];	
}
gameProto.getCurrentPlayerId = function() {
	return this.playerManager.playerIdToMove;	
}
gameProto.setTilesStructure = function(tilesStructure) {
	this.tilesStructure = tilesStructure;
}



gameProto.createTilesQueue = function() {
	var queueLength = this.mainData.tileQueueLength;
	var tileTypeNumber = 0;
	for(var i = 1; i < queueLength; i++) {
		this.tilesQueue[i] = tileTypeNumber;
		this.tilesStructure[tileTypeNumber]["quantity"]--;
    		
		if( this.tilesStructure[tileTypeNumber]["quantity"] <= 0 ) {
			tileTypeNumber++;	
		}        
		if( tileTypeNumber >= this.countOfTilesTypes) {
			return true;	
		}			
	}	
}     
gameProto.shuffleTilesQueue = function() {
	this.tilesQueue.shuffle(1);	
}    
gameProto.addStartingElementInQueue = function() {
	this.tilesQueue[0] = this.mainData.startingTileNumber;
}
gameProto.getNextTileImageFromQueue = function() {
	if(this.tilesQueue[0] == undefined) {
		return false;	
	}
	return this.tilesStructure[this.tilesQueue[0]].image;
}




gameProto.removeMeeplesPositionsIfNoMeeples = function(player, field) {
	if(player.meeples <= 0) {
		this.gamezone.removeMeeplesPositions(field);
	} 	
}

gameProto.isTherePositionForMeepleAtCell = function(cellCoords) {
	var coordsArray = [cellCoords.x, cellCoords.y];
	for(var i in this.lastAvailableMeeplesPositions.coords) {
		if(this.lastAvailableMeeplesPositions.coords[i].equals(coordsArray)) {
			this.lastAvailableMeeplesPositions.zone[i].zoneTypeName = this.lastAvailableMeeplesPositions.zoneTypeName[i];
			return this.lastAvailableMeeplesPositions.zone[i];	
		}	
	}
	throw new Error("thereIsNoMeeplePositionForThisCoords");		
}

gameProto.setUpMeepleAtGlobalZone = function(playerId, cellCoords, globalZone) {
	if(this.playerManager.players[playerId].meeples <= 0) {
		throw new Error("playerHasNoMeeples");	
	}	
	var meepleData = new Meeple(playerId, this.gamezone.lastField, cellCoords);
	this.playerManager.players[playerId].meeples--;
	globalZone.meeples.push(meepleData);
	this.makeSound("meeple");	
}







gameProto.determineWinners = function() {
	var winners = [];
	var maxScore = 0;
	for(var i in this.playerManager.players) {
		if(this.playerManager.players[i].score > maxScore) {
			maxScore = this.playerManager.players[i].score;	
		}			
	}
	
	for(var i in this.playerManager.players) {      
		if(this.playerManager.players[i].score == maxScore) {
			winners.push(this.playerManager.players[i]);	
		}	
	}
	this.logger.makeGameWonMessage(winners);
}

gameProto.totalMeeplesScore = function() {		
    var playerHasMeeples = [];
    for(var zoneNum in this.gamezone.zonesToClose) {	
    	var zone = this.gamezone.zonesToClose[zoneNum];
    	playerHasMeeples[zoneNum] = [];
    	for(var meepleIndex in this.gamezone.zonesToClose[zoneNum].meeples) {
    		var playerId = zone.meeples[meepleIndex].player;   		
    		this.addMeepleToPlayer(playerId, zone.zoneTypeName);      		
    		playerHasMeeples[zoneNum][playerId] = this.countEveryMeeple(playerHasMeeples[zoneNum][playerId]);
    		this.removeMeeple(zoneNum, meepleIndex);
    	}                            
    	this.dealScoreForPlayers(playerHasMeeples, zoneNum);	   		 
    } 
    this.playerManager.updatePlayersStats();     
    this.gamezone.zonesToClose = new Array();
}


gameProto.addMeepleToPlayer = function(id, zoneTypeName) {	
	if(zoneTypeName != "grasses")			
		this.playerManager.players[id].meeples++;
}
gameProto.countEveryMeeple = function(arg) {	
	if(arg == undefined)
		arg = 0;
	arg++; 
	return arg;
}
gameProto.removeMeeple = function(zoneNum, meepleIndex) {	
	if(this.gamezone.zonesToClose[zoneNum].zoneTypeName != "grasses") {
		var fieldCoords = this.gamezone.zonesToClose[zoneNum].meeples[meepleIndex].field;
	    this.gamezone.removeMeeplesPositions(this.gamezone.fields[fieldCoords.x][fieldCoords.y]); 
    }
}
gameProto.dealScoreForPlayers = function(playerHasMeeples, zoneNum) {
	var max = playerHasMeeples[zoneNum].max();
   	var min = playerHasMeeples[zoneNum].min();
   	
   	if(max != min || playerHasMeeples[zoneNum].length == 1) {
    	for(var playerId in playerHasMeeples[zoneNum]) { 
    		if(playerHasMeeples[zoneNum][playerId] == max) {
    			var name = this.playerManager.players[playerId].name; 
    			var score = this.gamezone.zonesToClose[zoneNum].score;
    			var zoneTypeName = this.gamezone.zonesToClose[zoneNum].zoneTypeName; 
    			this.playerManager.players[playerId].score += score;  
    			this.logger.makeScoreReceivingMessage(name, score, zoneTypeName);   
    		}	
    	}
   	} 
   	//this.gamezone.zonesToClose[zoneNum].score = 0;  	
}
















gameProto.editScale = function(scaleRate) { 
	var newScale = this.gamezone.getScale() * scaleRate;  
	if(this.isScaleBetweenLimits(newScale)) {
		this.gamezone.rescale(scaleRate);
	}   
}
gameProto.canWeScaleMore = function(scaleRate) { 	
	return this.isScaleBetweenLimits( this.gamezone.getScale() * scaleRate );
}
gameProto.isScaleBetweenLimits = function(scale) {	
	if(scale <= this.gamezone.maxScale && scale >= this.gamezone.minScale)
		return true;
	return false;	
}















gameProto.createSoundTag = function() { 
	soundManager.createSound({
		id: 'tileIsPlaced',
		url: this.mainData.soundTilePlacedSrc
	});
	soundManager.createSound({
		id: 'meepleIsPlaced',
		url: this.mainData.soundMeeplePlacedSrc
	});
}

gameProto.makeSound = function(arg) { 
	if(this.soundEnabled) {
		if(arg == "tile")soundManager.play('tileIsPlaced'); 
		//if(arg == "meeple")soundManager.play('meepleIsPlaced');
	}       
}









gameProto.makeMove = function(field, coords, isThisMyTurn) {  
	if( ! field) {     
		throw new Error("emptyFieldObjectWhenMakingMove");      	 
	}
	field.x = coords.x;
	field.y = coords.y;
	
	var nearFieldsCoords = this.moveMaker.createCoordsForNearFields(coords); 
    var fieldCanBeSetted = this.moveMaker.isFieldCanBeSettedThere(field, nearFieldsCoords);

    if( ! fieldCanBeSetted) {
    	this.moveMaker.deleteNearFieldsCoords(nearFieldsCoords); 
    	throw new Error("fieldCantBeSettedWhenMakingMove");     	
	}  
	  
	this.gamezone.fields[coords.x][coords.y] = field;
	delete this.gamezone.highlightedFields[coords.x][coords.y]; 
	this.moveMaker.checkAreFieldsClosedNow(nearFieldsCoords); 
	      
	// 1. для созданных глобальных зон записываются координаты поля в котором находятся соотвествующие локальные зоны
	// в глобальных зонах записываются ссылки на локальные зоны, а также данные о незакрытых сторонах дорог и замков
	field.zoneCreator.iterateLocalZonesAndMakeAction("addIntoGlobalZonesLinksToLocal", coords);
	
	// 2. соединение и сочленение зон поставленного и соседнего поля
	// происходит переход глобальных зон друг в друга, причем изменяется нумерация и глобальных и локальных зон (при необходимости)
	// при необходимости закрываются открытые стороны зон в данных глобальных зон
	this.gamezone.uniteNearGlobalZones(coords);
	                                   
	
	// 3. отрисовывем поставленный тайл
	this.gamezone.drawTile(this.gamezone.fields[coords.x][coords.y]);   
	
	// 4. удаляем у предыдущего тайла границу и добавляем к новому тайлу границу
	this.gamezone.removeMarkFromPastTile(this.gamezone.lastField); 
	this.gamezone.markTileAsLastPlaced(coords);
	  
	// 5. включаем анализ мест куда можно поставить миплов. 
	// смотрим места миплов в field поле которое ставим и сопоставляем с глобальными зонами этой клетки,, чтобы понять
	// можно ли ставить мипла на конкретную клетку.
	// если не самый первый ход, то подсвечиваем 
	if(field.x != this.mainData.centralFieldCoords.x || field.y != this.mainData.centralFieldCoords.y) {
		this.makeSound("tile");
		this.lastAvailableMeeplesPositions = this.gamezone.calculateAvailableMeeplePositions(field);
		
		if(isThisMyTurn) {	
			this.gamezone.highlightMeeplesPositions(field, this.lastAvailableMeeplesPositions);
		}	
	} 
	
	   
	this.gamezone.lastField = field;	
	this.moveMaker.deleteNearFieldsCoords(nearFieldsCoords);	
}
































gameProto.processNewMovesFromDb = function(moves, firstField) {
	var tilesProcessed = 0;
	var meeplesProcessed = 0;
	
	for(var i in moves) {
	    var moveData = moves[i];

        if(moveData.type == "TILE") {
            this.processTileFromDb(moveData, tilesProcessed, firstField);
            tilesProcessed++;
        }
        else if(moveData.type == "MEEPLE") {
            this.processMeepleFromDb(moveData);
            meeplesProcessed++;
        }

		var lastViewedMoveId = moveData.moveId;
	}
		
	return {"lastMoveId": lastViewedMoveId, "tilesProcessed": tilesProcessed};
}


gameProto.processTileFromDb = function(moveData, tilesProcessed, firstField) {
    if(moveData.fieldCoords != null) {
        var orientation = moveData.data.orientation;
        var rotation = MainData.orientation2rotation[orientation];

        if(tilesProcessed > 0) {
            var field = new Field(this, orientation);
        } else {
            var field = firstField;
            field.orientation = orientation;
            field.updateStructureAndZones(rotation);
        }

        this.makeMove(field, moveData.fieldCoords, false);
    } else {
        if(tilesProcessed > 0) {
            this.tilesQueue.shift();
        }
    }
}
gameProto.processMeepleFromDb = function(moveData) {
    var cellCoords = moveData.data.cellCoords;
    if(cellCoords != null) {
        var field = this.gamezone.fields[moveData.fieldCoords.x][moveData.fieldCoords.y];
        var playerObj = this.playerManager.players[moveData.playerId];
        var globalZone = this.isTherePositionForMeepleAtCell(cellCoords);

        this.setUpMeepleAtGlobalZone(moveData.playerId, cellCoords, globalZone);
        this.gamezone.drawMeeple(field, cellCoords, globalZone, playerObj);
    }
    this.totalMeeplesScore();
}