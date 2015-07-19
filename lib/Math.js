Math.getRandomInt = function(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
Math.isInt = function(n) {
   return n % 1 == 0;
}