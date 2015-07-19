function PlayerManager(logger) {
	this.mainData = new MainData();

	this.logger = logger;

	this.players = new Array();	
    this.availableColors;
    this.playerIdToMove;	
}
var plManagerProto = PlayerManager.prototype;








plManagerProto.restartPlayers = function() {
	this.players = new Array();
	this.playerIdToMove = 0;
	this.clearStats();	
}

plManagerProto.deleteColor = function(color) {
	for(var i in this.availableColors) {
		if(this.availableColors[i] == color) {
			delete this.availableColors[i];
			break;	
		}	
	}	
}




plManagerProto.createPlayer = function(name, color) { 
	this.deleteColor(color);
	return new Player(name, color);	
}

plManagerProto.addPlayer = function(name, color, id) {
	if(this.availableColors.length <= 0)throw new Error("maximumPlayers");
	if(id == undefined) {
		this.players.push( this.createPlayer(name, color) );
	} else {
		if(this.players[id] != undefined)throw new Error("tryingToCreatePlayerWithExistingId");
		this.players[id] = this.createPlayer(name, color);	
	}		
}


plManagerProto.getPlayerColor = function(id) {
	return this.players[id].color;	
}

plManagerProto.restartPlayersColors = function() {
	this.mainData.colors.shuffle();
	this.availableColors = new Array();
	for(var i in this.mainData.colors) {
		this.availableColors.push(this.mainData.colors[i]);
	}
	return this.availableColors;	
}


plManagerProto.nextPlayer = function() {
	if(this.playerIdToMove >= (this.players.length - 1)) {
		this.setPlayerIdToMove(0);
	} else {
		for(var i = this.playerIdToMove + 1; i < this.players.length; i++) {
			if(this.players[i] != undefined) {
				this.setPlayerIdToMove(i);
				return this.playerIdToMove;	
			}	
		}
		this.setPlayerIdToMove(0);		
	}	
	return this.playerIdToMove;
}






plManagerProto.addPlayersToStats = function(playerId) {
	var htmlString = "";
   	htmlString += 
   		"<div id='player" + playerId + "'>" + 
   		"<div class='playerLine' style='background-color:" + this.players[playerId].color + ";'></div>" + 
   		"<div class='playerStats' id='player_stat" + playerId + "'>" + 
    		"<div class='playerScoreDiv'><span class='playerScoreSpan' id='player_score" + playerId + "'>0</span></div>" +
    		"<span class='playerId'>" + this.players[playerId].name + "</span><br>" +  
    		"<span id='player_meeples" + playerId + "'>";
    		
   	for(var i = 0; i < this.players[playerId].meeples ; i++)
   		htmlString += this.getMeepleImgTag(this.players[playerId].color);
   	
   	htmlString += 
   			"</span>" + 
   		"</div>" +
   		"</div>"; 
   	
   	document.getElementById('playersStats').innerHTML += htmlString;	   
}	
plManagerProto.getMeepleImgTag = function(color) {
	return "<img src='"+ this.mainData.meeplesDirBasic + color +".png' width=20>";
}





plManagerProto.updatePlayersStats = function() {
    for(var i in this.players) { 
    	if(i == this.playerIdToMove)document.getElementById('player_stat' + i).style.backgroundColor = "#e0e0e0";
    	else document.getElementById('player_stat' + i).style.backgroundColor = "#ffffff";	
    
    	document.getElementById('player_score'+i).innerHTML = this.players[i].score;
    	
    	
    	var meeplesImagesCount = document.getElementById('player_meeples'+i).childNodes.length;
    	if(meeplesImagesCount != this.players[i].meeples) {
	    	var meeples = "";
	    	for(var j = 0; j < this.players[i].meeples; j++)
	    		meeples += "<img src='"+ this.mainData.meeplesDirBasic + this.players[i].color +".png' width=20>";
    	
	    	document.getElementById('player_meeples' + i).innerHTML = meeples;
    	}		
    }		
}
plManagerProto.removePlayerHighlighting = function() {
	for(var i in this.players) {
		document.getElementById('player_stat' + i).style.backgroundColor = "#ffffff";
	}	
}




plManagerProto.addPlayersFromDB = function(players) {
	for(var i = 0; i < players.length; i++) {
		this.addPlayer(players[i].name, players[i].color, players[i].id);
		this.addPlayersToStats(players[i].id);
	}	
}




plManagerProto.getRandomColor = function() {
	if(this.availableColors.length > 0)
		return this.availableColors.shift();
	return false;		
}










plManagerProto.refreshPlayers = function(players) {
	var deletedPlayers = [];
	
	//проверяем текущий массив игроков
	for(var id = 0; id < this.players.length; id++) {
		var oldPlayerReceived = false;
		
		if(this.players[id] != undefined) {
			for(var j = 0; j < players.length; j++) {
				if(players[j].id == id) {
					oldPlayerReceived = true;
					break;
				}	
			} 
			
			if( ! oldPlayerReceived) {		
				this.logger.createNotification(this.players[id].name + " leaves the game.");
				this.availableColors.push(this.players[id].color);
				this.deletePlayerFromStats(id);
				this.deletePlayer(id);
				deletedPlayers.push(id);				
			}
		}				
	}
	
	//проверяем принятый массив игроков
	for(var i = 0; i < players.length; i++) {
		var newPlayerReceived = false;
		
		for(var j = 0; j < this.players.length; j++) {
			if(this.players[j] != undefined) {
				if(players[i].id == j) {
					newPlayerReceived = true;
					break;
				}
			}		
		} 
			
		if( ! newPlayerReceived) {
			this.addPlayer(players[i].name, players[i].color, players[i].id);
			this.addPlayersToStats(players[i].id); 
			this.logger.createNotification(players[i].name + " joins us.");
		}			
	}
	
	return deletedPlayers;
}













plManagerProto.deletePlayer = function(id) {
	delete this.players[id];
}

plManagerProto.deletePlayerFromStats = function(id) {
	var element = document.getElementById("player" + id);
	element.parentNode.removeChild(element); 
}
plManagerProto.clearStats = function() {
	var statsElem = document.getElementById("playersStats");
	var statsElemChildren = statsElem.childNodes; 
	var children = statsElemChildren.length;
	for(var i = children-1; i >= 0; i--) { 
		if(statsElemChildren[i])
			statsElem.removeChild(statsElemChildren[i]); 		
	}	 
}	



plManagerProto.getPlayersCount = function() {
	var length = 0;
	for(var i in this.players)length++;
	return length;	
}

plManagerProto.isPlayerExists = function(id) {
	if( this.players[id] == undefined )return false;
	return true;
}	
plManagerProto.isHostExists = function() {
	return this.isPlayerExists(0);
}	





plManagerProto.setPlayerIdToMove = function(id) {
	id = parseInt(id);
	this.playerIdToMove = id;
	this.updatePlayersStats();	
}