initializePage = function() {
	console.log("Home logged Loaded correctly");

	var userInformation = '<div>Bienvenido: '+app.getNameAndLastNameFromLoggedUser()+'</div>';
	userInformation += '<div>Tipo de usuario: '+app.getTipeOfLoggedUser()+'</div>';
	$('#content-user').html(userInformation);

};