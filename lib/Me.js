function Me() {
	this.mainData = new MainData();
	this.id;
	this.name;
	this.mode;	
}
var meProto = Me.prototype;





meProto.setId = function(arg) { this.id = arg; }
meProto.setName = function() { 
	this.name = $('#'+this.mainData.playerNameId).val();
	$.cookie( 'playerName', this.name, {expires:7} ); 
}
meProto.setMode = function(arg) { this.mode = arg; }

meProto.getId = function() { return this.id; }
meProto.getName = function() { return this.name; }
meProto.getMode = function() { return this.mode; }



meProto.iAmHost = function() { 
	if(this.mode == "host") return true;
	return false;
}