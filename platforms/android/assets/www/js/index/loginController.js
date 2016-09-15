initializePage = function() {
	console.log("Index Loaded correctly");
};
var performingAjaxLogIn = false;
doLogIn = function() {
	var form = $('form[id=user-form]');
	var username = form.find('input[id=username]').val(),
		password = form.find('input[id=password]').val();
	data = _.map();
	if(performingAjaxLogIn === false) {
		$("body").css("opacity", "0.5");
		$("body").css("pointer-events", "none");
		performingAjaxLogIn = true;
		console.log('----------------------------------------------------------');
		console.log(performingAjaxLogIn);
		console.log('Performing login Ajaxcall');
		$.ajax({
		    url: app.getBaseUrl() + "/login",
		    type: "POST",
	        crossDomain: true,
		    data: ({
		    	Usuario: username,
		    	Contrasena:password
		    }),
		    dataType: 'json',
		    success:function(data, textStatus, jqXHR){
		    	$("body").css("opacity", "1");
				$("body").css("pointer-events", "all");
		        if(data.success === 'true') {
		        	app.addSessionVariables(username, data.data.Nombre, data.data.Apellido1, data.data.TipoUsuario); 
		        	$('#user-form-id-error').html('');
		        	redirectToHomeLogged();
		        } else {
		        	app.removeSessionVariables();
		        	$('#user-form-id-error').html(data.message);
		        }
		        performingAjaxLogIn = false;
		    },
		    error:function(){
		    	$("body").css("opacity", "1");
				$("body").css("pointer-events", "all");
		        app.saveIntoLocalDB({}, "error");
		        performingAjaxLogIn = false;
		    }      
		});
	} else {
		console.log('---------  Preventing ajax call ------------');
	}
};