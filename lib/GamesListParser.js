function GamesListParser(data) {
	this.mainData = new MainData();
	                      
	this.data = data;
}
glpProto = GamesListParser.prototype;



glpProto.parse = function() {  
	var gamesList = JSON.parse(this.data);
	var select = document.getElementById(this.mainData.gamesSelectId);
	
	var optionsList = [];
	for(var i in gamesList) {
		if(gamesList[i].playerName == null)break;		                        
		var text = gamesList[i].playerName + " [" + gamesList[i].playersCount + "]";
		optionsList[i] = document.createElement('option');
		var textNode = document.createTextNode(text);
		optionsList[i].appendChild(textNode);
	    optionsList[i].setAttribute("value", gamesList[i].gameId);
	    
	    if( ! this.isOptionTagInSelectTag(select, optionsList[i]))
	    	select.appendChild(optionsList[i]);
		
	}     
	for(var i = 0; i < select.children.length; i++) {
		if( ! this.isOldOptionInNewOptionsList(select.children[i], optionsList)) {
			select.removeChild( select.children[i] );	
		}	
	}     
}

glpProto.isOptionTagInSelectTag = function(select, option) {  
	for(var i = 0; i < select.children.length; i++) {
		if((select.children[i].value == option.value && select.children[i].innerHTML == option.innerHTML)) {
			return true; 
		}	
	} 
	return false;
}  
glpProto.isOldOptionInNewOptionsList = function(selectChild, optionsList) {  
	for(var i = 0; i < optionsList.length; i++) {
		if(selectChild.value == optionsList[i].value && selectChild.innerHTML == optionsList[i].innerHTML) {
			return true; 
		}	
	} 
	return false;
}