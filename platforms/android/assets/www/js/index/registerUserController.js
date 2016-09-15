initializePage = function() {
	console.log("Register User Loaded correctly");
};
var performingAjaxLogIn = false;
registerUser = function() {
	var form = $('form[id=user-form]');
	var Usuario = form.find('input[id=Usuario]').val(),
		Contrasena = form.find('input[id=Contrasena]').val(),
		Celular = form.find('input[id=Celular]').val(),
		CI = form.find('input[id=ci]').val(),
		Nombre = form.find('input[id=Nombre]').val(),
		Apellido1 = form.find('input[id=Apellido1]').val(),
		Apellido2 = form.find('input[id=Apellido2]').val(),
		Direccion = form.find('input[id=Direccion]').val(),
		TipoUsuario = form.find('select[id=tipo-de-usuario]').val();

	var errors='<div>';
	var hasError=false;
	if(isNullOrEmpty(Usuario)) {
		hasError=true;
		$('#error-Usuario').html('<div class="error"> El usuario no puede estar vacio.</div>');
	} else {
		if(isDir(Usuario)) {
			hasError=true;
			$('#error-Usuario').html('<div class="error"> El usuario solo puede contener letras, espacios, numeros y #.</div>');
		} else {
			$('#error-Usuario').html('');
		}
	}
	if(isNullOrEmpty(Contrasena)) {
		hasError=true;
		$('#error-Contrasena').html('<div class="error"> La contrasena no puede estar vacia.</div>');
	} else {
		if(isDir(Contrasena)) {
			hasError=true;
			$('#error-Contrasena').html('<div class="error"> La contrasena solo puede contener letras, espacios, numeros y #.</div>');
		} else {
			$('#error-Contrasena').html('');
		}
	}
	if(isNullOrEmpty(Celular)) {
		hasError=true;
		$('#error-Celular').html('<div class="error"> El celular no puede estar vacio.</div>');
	} else {
		if(isNumber(Celular)) {
			hasError=true;
			$('#error-Celular').html('<div class="error"> El celular solo puede contener numeros.</div>');
		} else {
			$('#error-Celular').html('');
		}
	}
	if(isNullOrEmpty(Nombre)) {
		hasError=true;
		$('#error-Nombre').html('<div class="error"> El nombre no puede estar vacio.</div>');
	} else {
		if(isName(Nombre)) {
			hasError=true;
			$('#error-Nombre').html('<div class="error"> El nombre solo puede contener letras y espacios.</div>');
		} else {
			$('#error-Nombre').html('');
		}
	}
	if(isNullOrEmpty(Apellido1)) {
		hasError=true;
		$('#error-Apellido1').html('<div class="error"> El apellido paterno no puede estar vacio.</div>');
	} else {
		if(isName(Apellido1)) {
			hasError=true;
			$('#error-Apellido1').html('<div class="error"> El apellido paterno solo puede contener letras y espacios.</div>');
		} else {
			$('#error-Apellido1').html('');
		}
	}
	if(isNullOrEmpty(Apellido2)) {
		hasError=true;
		$('#error-Apellido2').html('<div class="error"> El apellido materno no puede estar vacio.</div>');
	} else {
		if(isName(Apellido2)) {
			hasError=true;
			$('#error-Apellido2').html('<div class="error"> El apellido materno solo puede contener letras y espacios.</div>');
		} else {
			$('#error-Apellido2').html('');
		}
	}
	if(isNullOrEmpty(CI)) {
		hasError=true;
		$('#error-CI').html('<div class="error"> El CI no puede estar vacio.</div>');
	} else {
		if(isCI(CI)) {
			hasError=true;
			$('#error-CI').html('<div class="error"> El ci letras, espacios y numeros.</div>');
		} else {
			$('#error-CI').html('');
		}
	}
	if(isNullOrEmpty(Direccion)) {
		hasError=true;
		$('#error-Direccion').html('<div class="error"> La direccion no puede estar vacia.</div>');
	} else {
		if(isDir(Direccion)) {
			hasError=true;
			$('#error-Direccion').html('<div class="error"> La direccion solo puede contener letras, espacios, numeros y #.</div>');
		} else {
			$('#error-Direccion').html('');
		}
	}
	if(isNullOrEmpty(TipoUsuario)) {
		hasError=true;
		$('#error-TipoUsuario').html('<div class="error"> Debe seleccionar un tipo de usuario.</div>');
	} else {
		if(isNumber(TipoUsuario)) {
			hasError=true;
			$('#error-TipoUsuario').html('<div class="error"> El tipo de usuario solo puede ser un numero.</div>');
		} else {
			$('#error-TipoUsuario').html('');
		}
	}
	if(hasError) {
		$("#errors").html(errors);
	} else {
		if(performingAjaxLogIn === false) {
			performingAjaxLogIn = true;
			console.log('----------------------------------------------------------');
			console.log(performingAjaxLogIn);
			console.log('Performing user Ajaxcall');
			$.ajax({
			    url: app.getBaseUrl() + "/user",
			    type: "POST",
		        crossDomain: true,
			    data: ({
			    	Usuario: Usuario,
			    	Contrasena: Contrasena,
			    	Nombre: Nombre,
			    	Apellido1: Apellido1,
			    	Apellido2: Apellido2,
			    	CI: CI,
			    	TipoUsuario: TipoUsuario,
			    	Celular: Celular,
			    	Direccion: Direccion
			    }),
			    dataType: 'json',
			    success:function(data, textStatus, jqXHR){
			        if(data.success === 'true') {
			        	redirectToHomeLogged();
			        } else {
			        	$('#errors').html(data.message);
			        }
			        performingAjaxLogIn = false;
			    },
			    error:function(){
			        app.saveIntoLocalDB({}, "error");
			        performingAjaxLogIn = false;
			    }      
			});
		} else {
			console.log('---------  Preventing ajax call ------------');
		}
	}
	/**/
};