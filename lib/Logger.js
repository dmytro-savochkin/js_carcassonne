function Logger() {
	var mainData = new MainData();
	this.loggerText = document.getElementById(mainData.loggerTextId);
	this.loggerTextJQuery = $('#' + mainData.loggerTextId);
}
var loggerProto = Logger.prototype;




loggerProto.makeScoreReceivingMessage = function(playerName, score, zoneTypeName) {
	var message = this.makeDateString() +  " " + playerName + " received " + score + " points for " + zoneTypeName + ".";
    this.addNoteToLoggerDiv(message, false);
}

loggerProto.createNotification = function(message, bold) {
	if(bold == undefined)bold = true;   
	
	message = this.makeDateString() + message;
	this.addNoteToLoggerDiv(message, bold);
}

loggerProto.makeGameWonMessage = function(winners) {
	var message;
	if(winners.length == 1) {
		message = this.makeDateString() +  " " + winners[0].name + " has won the game with  " + winners[0].score + " points!";
    } else {
    	message = this.makeDateString() +  " "; 
    	for(var i in winners) {
    		var score = winners[i].score;
    		message += winners[i].name;
    		if(winners[parseInt(i)+1] != undefined)message += ", ";	
    	}
    	message += " have won the game with  " + score + " points!";	
    }
    this.addNoteToLoggerDiv(message, true);
}


loggerProto.addNoteToLoggerDiv = function(message, bold) {
    var tagP = document.createElement('p');
    var textNode = document.createTextNode(message);
    if(bold) {
	    var tagStrong = document.createElement('strong');
		tagP.appendChild(tagStrong);           
		tagStrong.appendChild(textNode);
    } else {
    	tagP.appendChild(textNode);	
    }
    this.loggerText.appendChild(tagP);   
    this.loggerTextJQuery.scrollTop(this.loggerTextJQuery[0].scrollHeight);		
}


loggerProto.makeDateString = function() {
	var hours = Date.getHoursLeadingZero(); 
	var minutes = Date.getMinutesLeadingZero(); 
	return "[" + hours + ":" + minutes + "]";	
}


loggerProto.clearData = function() {
	while(this.loggerText.childNodes[0]){
  		this.loggerText.removeChild(this.loggerText.childNodes[0]);
	}	
}