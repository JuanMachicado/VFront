/*
	Common utilities
*/
var numberRegularExp = /^\d+$/;
var nameRegularExp = /^[a-zA-Z ]+$/;
var dirRegularExp = /^[a-zA-Z0-9 #]+$/;
var ciRegularExp = /^[a-zA-Z0-9 ]+$/;
var reservedWords = ['select', 'from', 'delete', 'drop', 'clean', 'alert', 'var', 'go'];

isNullOrEmpty = function (cad) {
	if(_.isNull(cad)) {
		return true;
	}
	if(cad.length === 0) {
		return true;
	}
	if(containReservedWords(cad)) {
		return true;
	}
	return false;
}

isName = function (cad) {
	if(containReservedWords(cad)) {
		return false;
	}
	return !nameRegularExp.test(cad);
}

isNumber = function (cad) {
	if(containReservedWords(cad)) {
		return false;
	}
	return !numberRegularExp.test(cad);
}

isNumber2 = function (cad) {
	if(containReservedWords(cad)) {
		return false;
	}
	var pattern = /^\d+$/;
	return pattern.test(cad);
}

isDecimal = function (cad) {
	if(containReservedWords(cad)) {
		return false;
	}
	var pattern = /^[0-9.]+$/;;
	return pattern.test(cad);
}

isDir = function (cad) {
	if(containReservedWords(cad)) {
		return false;
	}
	return !dirRegularExp.test(cad);
}

isCI = function (cad) {
	if(containReservedWords(cad)) {
		return false;
	}
	return !ciRegularExp.test(cad);
}


containReservedWords = function(cad) {
	if (new RegExp(reservedWords .join("|")).test(cad)) {
  		return true;
	}
	return false;
}

isInt = function(number) {
	return !_.isNaN(parseInt(number));
}