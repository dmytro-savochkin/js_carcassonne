function Controller() {
	this.mainData = new MainData();
	
	this.gamezone;
	this.managezone;
	this.game;
	this.tilesParser;
	this.tilesStructure;	
	
	
	this.nextField;  
	
	this.systemIsLoaded = false;

	this.me;
	this.lastViewedMoveId
	this.gameId;
	
	this.ajaxer = new Ajaxer(); 
	
	this.sentElements = {"tiles": [], "meeples": []};
}
var controllerProto = Controller.prototype;








controllerProto.createGamezoneObject = function() {
    this.gamezone = new Gamezone(); 
    this.gamezone.addCanvasDrawer();
	this.gamezone.setAndLoadImages();
	this.gamezone.createGrid();
	this.gamezone.createEmptyFields();	
}
controllerProto.createManagezoneObject = function() {
	this.managezone = new Managezone();   
}
controllerProto.createTilesParserObject = function() {
	this.tilesParser = new TilesDataParser();
	this.tilesStructure = this.tilesParser.createTilesStructure();	
}    
controllerProto.createGameObject = function() {
	this.game = new Game(this.gamezone, this.managezone);
	this.game.createSoundTag();      
	this.game.playerManager.restartPlayersColors();
	this.game.setTilesStructure(this.tilesStructure);
	this.game.countOfTilesTypes = this.tilesParser.countOfTilesTypes;    
	this.game.logger.clearData();
	this.game.playerManager.restartPlayers();
}

controllerProto.createQueue = function() {
	this.game.createTilesQueue();
	this.game.shuffleTilesQueue();    
	this.game.addStartingElementInQueue();	
}
controllerProto.setQueue = function(queue) {
	this.game.tilesQueue = queue;	
}
	












controllerProto.waitForLoadingImages = function () {
	this.loader = new ResourseLoadingChecker(this.tilesParser.imageManager, this.gamezone.imageManager);
	this.loader.checkResourses();
}

controllerProto.loadingIsFailed = function () {
	$('#'+this.mainData.preloaderId).hide();
	$('#'+this.mainData.imagesErrorId).show();
}    










controllerProto.sayToUser = function (message) {
	alert(message);
	this.game.logger.createNotification(message);
}
















controllerProto.putStartingTile = function() {
	var centralField = new Field(this.game, this.mainData.startingTileOrientation);
	this.game.makeMove(centralField, this.mainData.centralFieldCoords, false);
}                                            
controllerProto.drawAndCreateNextField = function() {
	var nextTileImg = this.game.getNextTileImageFromQueue();
	this.managezone.drawNextTileInGameInfo(nextTileImg);    
	this.nextField = new Field(this.game, this.mainData.startingTileOrientation);
	this.updateTilesQueuePanel(); 
}
controllerProto.highlightFields = function () {
    if(this.me.getId() === this.game.playerManager.playerIdToMove)
        if(this.game.status == this.mainData.statuses.WAITING_FOR_TURN)
            this.game.gamezone.highlightAvailableFields(this.nextField);
}
controllerProto.updateTilesQueuePanel = function () {
	var tilesInQueue = this.game.tilesQueue.length;
	$('#'+this.mainData.tilesQueueId).html(tilesInQueue);
}















controllerProto.pixelsToField = function(dx, dy) {
	var x = Math.floor(($('#'+this.mainData.canvasId).offset().left * (-1) + dx) / (this.gamezone.canvasLayer.tileWidth * this.gamezone.getScale()));
	var y = Math.floor(($('#'+this.mainData.canvasId).offset().top * (-1) + dy) / (this.gamezone.canvasLayer.tileWidth * this.gamezone.getScale()));
	var fieldCoords = new Coords(x, y);
	return fieldCoords;	
}


controllerProto.pixelsToCell = function(dx, dy) {
	var canvas = $('#'+this.mainData.canvasId);
	
	dx = canvas.offset().left * (-1) + dx;
	dy = canvas.offset().top * (-1) + dy;
	var x = Math.floor( dx / (this.gamezone.canvasLayer.tileWidth * this.gamezone.getScale()) );
	var y = Math.floor( dy / (this.gamezone.canvasLayer.tileWidth * this.gamezone.getScale()) );
	var field = new Coords(x, y);
	
	if(this.gamezone.lastField.x == field.x && this.gamezone.lastField.y == field.y) {
		var cellCoords = new Coords(false, false);
		cellCoords.x = Math.floor( (dx - x * this.gamezone.canvasLayer.tileWidth * this.gamezone.getScale()) / (this.gamezone.canvasLayer.cellWidth * this.gamezone.getScale()) );
		cellCoords.y = Math.floor( (dy - y * this.gamezone.canvasLayer.tileWidth * this.gamezone.getScale()) / (this.gamezone.canvasLayer.cellWidth * this.gamezone.getScale()) );	
	} else {
		throw new Error("cellIsntAtProperField");	
	}
	return cellCoords;	
}





                   












controllerProto.disablePreloader = function() {$('#'+this.mainData.preloaderId).hide();}
controllerProto.enableMenu = function() {$('#'+this.mainData.menuId).show();}
controllerProto.disableMenu = function() {$('#'+this.mainData.menuId).hide();}

controllerProto.enableStartGameButton = function() {$('#'+this.mainData.startGameButtonId).removeAttr('disabled');}
controllerProto.disableStartGameButton = function() {$('#'+this.mainData.startGameButtonId).attr('disabled', 'disabled');}
controllerProto.enableLeaveGameButton = function() {$('#'+this.mainData.leaveGameButtonId).removeAttr('disabled');}
controllerProto.disableLeaveGameButton = function() {$('#'+this.mainData.leaveGameButtonId).attr('disabled', 'disabled');}





















controllerProto.beginGameLoading = function () {
    this.createMainObjects();
	this.waitForLoadingImages();      
}
controllerProto.createMainObjects = function () {
	this.createGamezoneObject();     
	this.createManagezoneObject();
	this.createTilesParserObject();
}
controllerProto.continueGameLoading = function () {
	this.timersOperator = new TimersOperator(this);
	this.timersOperator.startReceivingGamesList();     	
	this.disablePreloader();	
	this.enableMenu();		 
}






controllerProto.hostGame = function () {
	try {
		this.me = new Me();
		this.me.setId(0);
		this.me.setName();
        this.me.setMode("host");
        this.movesMade = 0;
        
        Sizer.moveCanvasToCenter();
		this.timersOperator.stopAllTimers();
		this.disableMenu();      
		this.createGameObject();	
		this.createQueue();       
		this.game.playerManager.addPlayer(this.me.getName(), this.game.playerManager.getRandomColor());					  		  

		this.ajaxer.sendRequestForHosting(this.me.getName(), this.game.tilesQueue, this.game.playerManager.getPlayerColor(this.me.getId())); 
	} catch(e) {
		if(e.message == "maximumPlayers") {
			alert("can't create more players");			 
    	} else if(e.message == "serverScriptError") {
			alert(e.message);			 
    	} else {
    		throw e;	
    	}
	}      
}
controllerProto.hostGameContinue = function (gameId) {
	this.gameId = gameId;                   
	this.lastViewedMoveId = 0;
	
	this.game.logger.createNotification("The game was created. Waiting for players.");
	          
    this.game.playerManager.addPlayersToStats(this.me.getId());
	this.timersOperator.startMainTimers();   
	this.setSystemIsLoaded(); 
}






controllerProto.joinGame = function () {
	try { 
		this.me = new Me();
		this.me.setName();
        this.me.setMode("join");
        this.movesMade = 0;
        
	    this.gameId = $('#'+this.mainData.gamesSelectId).val();
	    this.lastViewedMoveId = 0;
	    
	    Sizer.moveCanvasToCenter();
	    this.timersOperator.stopAllTimers();     
		this.disableMenu();        
		this.createGameObject();	
		
		this.ajaxer.sendRequestForJoining(this.me.getName(), this.gameId, this.game.playerManager.availableColors);
	} 
	catch (e) {
		if(e.message == "tooManyPlayers") {
			this.sayToUser("Too many players in this game. You have to leave and reload the game.");	
		} else {
			throw e;	
		}	
	}
}
controllerProto.joinGameContinue = function (serverResponse) {
	this.me.setId(serverResponse.yourId);
	this.setQueue(serverResponse.tilesQueue);
	this.game.playerManager.addPlayersFromDB(serverResponse.players);
				
	this.game.logger.createNotification("You have joined the game.");
	
	this.timersOperator.startMainTimers();  
	this.setSystemIsLoaded();  
}





controllerProto.setSystemIsLoaded = function () {
	this.systemIsLoaded = true;   
	this.game.setStatus(this.mainData.statuses.WAITING_FOR_PLAYERS);
	this.putStartingTile(); 
	this.updateTilesQueuePanel();
	this.enableLeaveGameButton(); 
}





controllerProto.hostStartGame = function () {
    this.disableStartGameButton();
    this.disableLeaveGameButton();  
    this.setStatus( this.mainData.statuses.WAITING_FOR_TURN );
    
    this.ajaxer.sendRequestForStarting( this.gameId );
}






controllerProto.enablePlayzones = function () {
	this.disableLeaveGameButton();
    if(this.nextField == undefined) {
	    this.drawAndCreateNextField();
	    this.highlightFields();
    }
}















controllerProto.setStatus = function(status) {
    if(this.game.status != status) {
        if(this.game.status == this.mainData.statuses.WAITING_FOR_PLAYERS && status != this.mainData.statuses.WAITING_FOR_PLAYERS ) {
            this.enablePlayzones();
        }

        if(this.game.status != this.mainData.statuses.WAITING_FOR_GAME_END || status == this.mainData.statuses.GAME_END) {
            this.game.setStatus(status);
        }
    }
}

controllerProto.checkForGameEnd = function() {
    if(this.game.status == this.mainData.statuses.GAME_END && this.movesMade >= (this.mainData.tileQueueLength-1)*2) {
        this.endGame();
    }

}







controllerProto.operateMovesPlayersStatusAndData = function (serverResponse) {
	try {  
        var deletedPlayers = this.game.playerManager.refreshPlayers(serverResponse.players);

	 	this.setNextPlayerIfNecessary( deletedPlayers );

        if(this.areNewMovesCanBeProcessed(serverResponse)) {
            this.movesMade = serverResponse.movesMade;
            this.game.playerManager.setPlayerIdToMove( serverResponse.playerIdToMove );
            this.setStatus( this.mainData.statuses[serverResponse.gameStatus] );
            this.processNewMovesFromDb( serverResponse.moves );
	    }      


		this.highlightFields();
        this.checkForGameEnd();

	} catch (e) {        
		if(e.message == "noAvailableTurn") {
			this.replaceField();
			this.updateTilesQueuePanel();
    	} else if(e.message == "queueIsOver") {
            this.gamezone.unhighlightAvailableFields();
            this.setStatus(this.mainData.statuses.WAITING_FOR_GAME_END);
		}
		else if(e.message == "fieldCantBeSettedWhenMakingMove") {
			console.warn(e, this.gamezone.fields);
		}
		else
            throw e;
	}	  
}
controllerProto.areNewMovesCanBeProcessed = function (serverResponse) {
    var isInDbMoreMovesThanAtClient = serverResponse.movesMade >= this.movesMade;
    var isFirstMove = (this.game.status == this.mainData.statuses.WAITING_FOR_PLAYERS);
    var isGameEndStatusReceived = (this.mainData.statuses[serverResponse.gameStatus] == this.mainData.statuses.GAME_END);
    return (isInDbMoreMovesThanAtClient || isFirstMove || isGameEndStatusReceived);
}
controllerProto.setNextPlayerIfNecessary = function (deletedPlayers) {
    var iAmDeleted = deletedPlayers.inArray( this.me.getId() );
    var playerWhoShouldMoveNowIsDeleted = deletedPlayers.inArray( this.game.playerManager.playerIdToMove );

    if(playerWhoShouldMoveNowIsDeleted && ! iAmDeleted) {
        this.game.playerManager.nextPlayer();
        this.ajaxer.shiftToNextPlayer( this.gameId, this.game.playerManager.playerIdToMove );
    }
}
controllerProto.processNewMovesFromDb = function (moves) {
    var processedMovesData = this.game.processNewMovesFromDb(moves, this.nextField);

    if(processedMovesData.lastMoveId != undefined) {
        this.lastViewedMoveId = processedMovesData.lastMoveId;
    }
    if(processedMovesData.tilesProcessed > 0)  {
        this.drawAndCreateNextField();
    }
}





















controllerProto.operatePlacedElementData = function(serverResponse) {
	var lastSentElement = this.sentElements[serverResponse.type][serverResponse.myMoveId];
	
	if(serverResponse.result == "ok") {
		lastSentElement.dbSaved = true;
		this.lastViewedMoveId = serverResponse.moveId;
    } else if(serverResponse.result == "placed_already") {
    	lastSentElement.dbSaved = true;	
    } else {
    	lastSentElement.dbSaved = false;	
    }	
}



controllerProto.resendFailedMoves = function() {
	for(var type in this.sentElements) {
		if(type != "game_end") {
            for(var id in this.sentElements[type]) {
                if(this.sentElements[type][id].dbSaved == false) {
                    this.ajaxer.sendElementPlaced( this.sentElements[type][id] );
                }
            }
        }
	}
}














controllerProto.handleCanvasMouseClick = function(dx, dy, tileAction, meepleAction) {
    try {
        var fieldCoords, cellCoords, sendingObj;

    	var gameStatus = this.game.getStatus();
    	var player = this.game.getCurrentPlayer();  
    	var fieldOrientation = this.nextField.orientation;

    	if(this.me.getId() === this.game.playerManager.playerIdToMove) {
    	
	    	if(gameStatus == this.mainData.statuses.WAITING_FOR_TURN) {

	    		if(tileAction == "cantBePlaced") {
	    			fieldCoords = new Coords(null, null);
	    			this.sayToUser("Next tile can't be placed. Replacing it.");
                    this.drawAndCreateNextField();
				   	this.highlightFields();
				   	this.game.setStatus(this.mainData.statuses.WAITING_FOR_TURN);
	    		}
	    		else {
		    		fieldCoords = this.pixelsToField(dx, dy);
					this.gamezone.checkAreThereNearFields(fieldCoords);     
			        this.game.makeMove(this.nextField, fieldCoords, true);	
			        this.game.removeMeeplesPositionsIfNoMeeples(player, this.nextField);
			        this.game.gamezone.unhighlightAvailableFields();        
			        this.game.managezone.removeNextTileInGameInfo();       
			        this.game.setStatus(this.mainData.statuses.WAITING_FOR_MEEPLE);
				}

                this.movesMade++;    
                         
                sendingObj = new TileSentData( this.sentElements["tiles"].length, this.gameId, this.me.getId(), fieldCoords, fieldOrientation );
                this.sentElements["tiles"].push(sendingObj);
                this.ajaxer.sendElementPlaced(sendingObj);                                   
	        }  
	          
	        else if(gameStatus == this.mainData.statuses.WAITING_FOR_MEEPLE) {
	        	
	        	fieldCoords = new Coords(this.nextField.x, this.nextField.y);
	        	if(meepleAction == "canceling") {
	        		cellCoords = new Coords(null, null);
	        		this.gamezone.removeMeeplesPositions(this.nextField);	
				} else {
		        	cellCoords = this.pixelsToCell(dx, dy);
		        	var globalZoneToSetUpMeeple = this.game.isTherePositionForMeepleAtCell(cellCoords); 
		        	this.game.setUpMeepleAtGlobalZone(this.game.getCurrentPlayerId(), cellCoords, globalZoneToSetUpMeeple);          
		            this.gamezone.removeMeeplesPositions(this.nextField); 
		            this.gamezone.drawMeeple(this.nextField, cellCoords, globalZoneToSetUpMeeple, player);
	            } 
				var nextPlayerId = this.game.playerManager.nextPlayer();
				
				this.game.setStatus(this.mainData.statuses.WAITING_FOR_TURN);

	        	this.movesMade++;

	        	sendingObj = new MeepleSentData( this.sentElements["meeples"].length, this.gameId, this.me.getId(), fieldCoords, cellCoords, nextPlayerId, fieldOrientation );
                this.sentElements["meeples"].push(sendingObj);
                this.ajaxer.sendElementPlaced(sendingObj);
                
                this.game.totalMeeplesScore();
			   	this.drawAndCreateNextField();
	        } 
	        
        }
    } 
    catch(e) {  
    	if(e.message == "noNearFieldsThere") {} 
    	else if(e.message == "fieldCantBeSettedWhenMakingMove") {} 
    	else if(e.message == "emptyFieldObjectWhenMakingMove") {
    		console.log("Ошибка в логике или пытаемся ходить после завершения игры (передано false поле).");
    	} else if(e.message == "queueIsOver") {
    		this.ajaxer.sendGameEndNotification(this.gameId);
    		this.endGame();
    	} else if(e.message == "noAvailableTurn") {
			this.movesMade++;    
            sendingObj = new TileSentData( this.sentElements["tiles"].length, this.gameId, this.me.getId(), new Coords(null, null), "north" );
            this.ajaxer.sendElementPlaced(sendingObj);
            this.sentElements["tiles"].push(sendingObj);
			
			this.replaceField();
    	}
    	else if(e.message == "cellIsntAtProperField"){} 
    	else if(e.message == "thereIsNoMeeplePositionForThisCoords"){} 
    	else if(e.message == "playerHasNoMeeples") {} 
    	else if(e.message == "tryingToDrawButFieldIsFalse") {}	
    	else throw e;
    } 
}



controllerProto.handleNextTileWindowMouseClick = function(dx, dy) {
	this.handleCanvasMouseClick(dx, dy, false, "canceling");
}


controllerProto.replaceField = function () {
	this.handleCanvasMouseClick(0, 0, "cantBePlaced");
}


controllerProto.rotateNextTile = function (rotate) {
	try {
		if(this.me.getId() === this.game.playerManager.playerIdToMove) {
			if(this.game.getStatus() == this.mainData.statuses.WAITING_FOR_TURN) {
				this.game.managezone.rotateNextTileInGameInfo(this.nextField, rotate);
				this.highlightFields();
			} 
		}	
	}  catch(e) {
    	if(e.message  == "fieldDoesntExist") {
    	} else if(e.message == "noAvailableTurn") {
		    // TODO: убрать в конечной версии всю ветку catch здесь
    		this.sayToUser("Такой ситуации не может быть, исчезли все возможные ходы при повороте.");   		
    	} else {
    		throw e;	
    	}	
    } 
}







controllerProto.quitGame = function () {
	this.systemIsLoaded = false;    
	this.managezone.clearNextTileWindow();
	this.gamezone.clearCanvas();  	
	this.clearZonesAndFields();  
    this.createMainObjects();
	this.enableMenu(); 
	this.timersOperator.startReceivingGamesList();
}


controllerProto.endGame = function () {
	this.timersOperator.stopAllTimers();
	var gameEnder = new GameEnder(this.game);
	gameEnder.scoreAllZones();
	this.game.playerManager.updatePlayersStats();
	this.game.playerManager.removePlayerHighlighting();	
	this.game.determineWinners();   
	this.clearZonesAndFields();
	this.managezone.clearNextTileWindow(); 
	this.enableLeaveGameButton();	
}

controllerProto.restartGame = function () {
	this.systemIsLoaded = false;    
	this.gamezone.clearCanvas();  	
	this.clearZonesAndFields();
	this.beginGameLoading();   	
}

controllerProto.clearZonesAndFields = function () {
	this.nextField = false;  
	this.gamezone.clearAllHighlightedFields();
	this.gamezone.clearAllGlobalZones();
}











controllerProto.editScale = function(direction) {
	this.game.editScale(this.mainData.canvasScaleStep[direction]);
    this.editScaleButtonsOpacity(direction);	
}

controllerProto.editScaleButtonsOpacity = function(direction) {
	var directions = ["plus", "minus"];
	for(var i in directions) {             
		var id = "#" + directions[i];  
		if( this.game.canWeScaleMore( this.mainData.canvasScaleStep[directions[i]]) ) {
			$(id).css({ opacity: this.mainData.opacity.full }).css('cursor', 'pointer');
		} else { 
			$(id).css({ opacity: this.mainData.opacity.low }).css('cursor', 'default');
		}        			
	}
}
















controllerProto.testStructure = function () {
	console.log(this);
	console.log("статус: ", this.game.getStatus());
	console.log("");
	console.log("Очередь длиной: ", this.game.tilesQueue.length, ". Очередь: ", this.game.tilesQueue);
	console.log("");
	console.log("Глобальные зоны");
	console.log(this.game.gamezone.zones);
	console.log("");
	console.log("Игроки");
	console.log(this.game.playerManager.players);
	console.log("");
	console.log("Данные о структуре");
	for(var x in this.game.gamezone.fields) {
		for(var y in this.game.gamezone.fields[x]) {
			console.log(x, " ", y, ": ", this.game.gamezone.fields[x][y]);			
		}	
	}
}