function TimersOperator(parent) {
	this.mainData = new MainData();
	this.parent = parent;
	this.timersIds = new Array(); 		
}
var timerOpProto = TimersOperator.prototype;







              

timerOpProto.startReceivingGamesList = function() {
	this.parent.ajaxer.getGamesList();
    this.timersIds.push(
   		window.setInterval( this.parent.ajaxer.getGamesList, this.mainData.recheckTimeBasic )
   	); 
}






timerOpProto.startMainTimers = function() {
	this.startCheckingForUnsentMoves();
	this.startReceivingPlayersList();
	this.startReceivingPlayersCount();
	this.startReceivingDataForButtonVisibility();
}







timerOpProto.startCheckingForUnsentMoves = function() {
	this.timersIds.push(
		window.setInterval( this.checkForUnsentMoves, this.mainData.recheckTimeForResendingMoves )
   	);                           
}                           
timerOpProto.startReceivingPlayersList = function() {
	this.timersIds.push(
		window.setInterval( this.parent.ajaxer.getPlayersAndMovesAndStatus, this.mainData.recheckTimeForPlayersFromDB )
   	);
}
timerOpProto.startReceivingPlayersCount = function() {	
	this.timersIds.push(
		window.setInterval( this.checkForPlayersAvailability, this.mainData.recheckTimeBasic )
   	);
}
timerOpProto.startReceivingDataForButtonVisibility = function() {	
	this.timersIds.push(
		window.setInterval( this.checkForStartgameButtonVisibility, this.mainData.recheckTimeBasic )
   	);
}






timerOpProto.checkForUnsentMoves = function() {
    controller.resendFailedMoves();
}
timerOpProto.checkForPlayersAvailability = function() {
    controller.timersOperator.checkForMeOnline();
    controller.timersOperator.checkForHostOnline();
}
timerOpProto.checkForStartgameButtonVisibility = function() {
	if(controller.me.iAmHost() && controller.game.getStatus() == controller.mainData.statuses.WAITING_FOR_PLAYERS) {
		if(controller.game.playerManager.getPlayersCount() > 1)controller.enableStartGameButton();
		if(controller.game.playerManager.getPlayersCount() <= 1)controller.disableStartGameButton();
   	} else {
        controller.disableStartGameButton();
   	}	
}
timerOpProto.checkForHostOnline = function() {
   	if( ! controller.game.playerManager.isHostExists()) {
	   	if(controller.me.iAmHost()) {
            controller.ajaxer.deleteGame(controller.gameId);
	   	} else {
            controller.sayToUser("Host has left the game!");
	   	}
        controller.timersOperator.stopAllIntervals();
        controller.quitGame();
   	}
}
timerOpProto.checkForMeOnline = function() {
	if( ! controller.game.playerManager.isPlayerExists(controller.me.getId())) {
		controller.sayToUser("Your game record was deleted from server by some reason. You have to reload game.");
        controller.timersOperator.stopAllIntervals();
        controller.quitGame();
	}	
}

















timerOpProto.stopAllTimers = function () {
    for(var i in this.timersIds) {
	    if(this.timersIds[i] != undefined) {
			window.clearInterval( this.timersIds.shift() );
		}		
	}	
}


/*timerOpProto.stopAllIntervals = function() {	
	for(var i in controller.checker.timersIds) {
		window.clearInterval( controller.checker.timersIds[i] );
        controller.checker.timersIds[i] = undefined;
	}	
} */  	 