function Ajaxer() {
	this.mainData = new MainData();
}
var ajaxerProto = Ajaxer.prototype;







ajaxerProto.getGamesList = function() {
    $.ajax({
		type: "POST",
    data: {action: 'get_open_games', maxPlayers: this.mainData.colors.length},
		url: this.mainData.serverScriptDown,
		success: function( data ) {    		
			var parser = new GamesListParser(data);
			parser.parse();
		}
	});
}



ajaxerProto.getPlayersAndMovesAndStatus = function() {
	if(controller) {
		$.ajax({
			type: "POST",
			data: {action: 'get_players_moves_status', gameId: controller.gameId, lastViewedMoveId: controller.lastViewedMoveId, playerId: controller.me.getId()},
			url: this.mainData.serverScriptDown,
			success: function( dataJson ) {
				var data = JSON.parse(dataJson);
                controller.operateMovesPlayersStatusAndData(data);
			}
		});
	} 
}












ajaxerProto.sendRequestForJoining = function(playerName, gameId, allColors) {
	$.ajax({
		type: "POST",
		data: {action: 'join_game', playerName: playerName, gameId: gameId, allColors: allColors, maxPlayers: this.mainData.colors.length},
		url: this.mainData.serverScriptUp,
		success: function( dataJson ) {
			if(dataJson != "maxPlayers") {
				var data = JSON.parse(dataJson);
                controller.joinGameContinue(data);
			} else {
				throw new Error("tooManyPlayers");	
			}	     
		}
	});	
}

ajaxerProto.sendRequestForHosting = function(playerName, tilesQueue, playerColor) {
	var tilesQueueString = JSON.stringify( tilesQueue );
	$.ajax({
		type: "POST",
		data: {action: 'create_game', myPlayerId: 0, playerName: playerName, playerColor: playerColor, tilesQueue: tilesQueueString},
		url: this.mainData.serverScriptUp,
		success: function( data ) {
			if(Math.isInt(data)) {
                controller.hostGameContinue(data);
			} else {
				throw new Error("serverScriptError");	
			}	
		}
	});	
}


ajaxerProto.sendRequestForStarting = function(gameId) {
	$.ajax({
		type: "POST",
		data: {action: 'start_game', gameId: gameId},
		url: this.mainData.serverScriptUp,
		success: function( data ) {
		}
	});	
}














ajaxerProto.sendElementPlaced = function(dataObj) {
	$.ajax({
		type: "POST",
		data: dataObj,
		url: this.mainData.serverScriptUp,
		success: function( dataJson ) {  
			var data = JSON.parse(dataJson);
            controller.operatePlacedElementData(data);
		}		
	});	
}









ajaxerProto.shiftToNextPlayer = function(gameId, playerIdToMove) {
	$.ajax({
		type: "POST",
		data: {action: 'next_player', gameId: gameId, playerIdToMove: playerIdToMove},
		url: this.mainData.serverScriptUp,
		success: function( data ) {
		}
	});	
}





ajaxerProto.sendGameEndNotification = function(gameId) {
	$.ajax({
		type: "POST",
		data: {action: 'end_game', gameId: gameId},
		url: this.mainData.serverScriptUp,
		success: function( data ) {
		}
	});
}











ajaxerProto.deleteGame = function(gameId) {
	$.ajax({
		type: "POST",
		data: {action: 'delete_game', gameId: gameId},
		url: this.mainData.serverScriptUp,
		success: function( data ) {
		}
	});	
}


ajaxerProto.deletePlayer = function(playerId, gameId) {
	$.ajax({
		type: "POST",
		data: {action: 'delete_player', playerId: playerId, gameId: gameId},
		url: this.mainData.serverScriptUp,
		success: function( data ) {
		}
	});	
}