Date.getHoursLeadingZero = function() {	var d = new Date();
	return ('0' + d.getHours()).slice(-2);;
}

Date.getMinutesLeadingZero = function() {
	var d = new Date();
	return ('0' + d.getMinutes()).slice(-2);;
}