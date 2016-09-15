initializePage = function() {
	console.log("Registro Loaded correctly");
};

anhadirIngrediente = function() {
	tabla = $("#tb-productos-ingredientes");
	value = tabla.find('tr').length + 1;
	tabla.append("<tr class='ingrediente'>"+
		"<td>"+
		"<div class='ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset ui-input-has-clear'>"+
		"<input type='text' name='nombre' value='' data-clear-btn='true' placeholder='Nombre...' required>"+
		"</div>"+
		"</td>"+
		"<td>"+
		"<div class='ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset ui-input-has-clear'>"+
		"<input type='text' name='cantidad' value='' data-clear-btn='true' placeholder='Cant...' required>"+
		"</div>"+
		"</td>"+
		"<div class='ui-controlgroup-controls '>"+
		"<td>"+
		"<div class='ui-radio'>"+
		"<input type='radio' name='ingredientetipo"+value+"' value='kg' checked='checked' data-cacheval='false' style='margin: 0px;padding: 0px;margin-left: -10px;margin-top: 10px;'>"+
		"</div>"+
		"</td>"+
		"<td>"+
		"<div class='ui-radio'>"+
		"<input type='radio' name='ingredientetipo"+value+"' value='lb' data-cacheval='false' style='margin-left: -7.5px;margin-top: 10px;'>"+
		"</div>"+
		"</td>"+
		"<td>"+
		"<div class='ui-radio'>"+
		"<input type='radio' name='ingredientetipo"+value+"' value='g' data-cacheval='false' style='margin-left: -7.5px;margin-top: 10px;'>"+
		"</div>"+
		"</td>"+
		"<td>"+
		"<div class='ui-radio'>"+
		"<input type='radio' name='ingredientetipo"+value+"' value='lt' data-cacheval='false' style='margin-left: -7.5px;margin-top: 10px;'>"+
		"</div>"+
		"</td>"+
		"<td>"+
		"<div class='ui-radio'>"+
		"<input type='radio' name='ingredientetipo"+value+"' value='u' data-cacheval='false' style='margin-left: -7.5px;margin-top: 10px;'>"+
		"</div>"+
		"</td>"+
		"</div>"+
		"</tr>");
}

var performingAjaxLogIn = false;
registrarNuevoProducto = function() {
	var form = $('#producto-form'),
		nombreProducto = form.find('input[name=nombreProducto]').val(),
		precioProducto = form.find('input[name=precioProducto]').val(),
		tipo = form.find('input[name="tipo"]:checked').val();
	var ingredientes = "";
	var errors = false;
	$('#errors').html("");
	$('#errors2').html("");
	$('#errors3').html("");
	var ingredientesMapped = _.map(form.find('tr.ingrediente'), function(ingrediente, index) {
		var item = $(ingrediente),
			ingrediente = $(_.first(item.find('td'))).find('input[name="nombre"]').val(),
			cantidad = $(item.find('td')[1]).find('input[name="cantidad"]').val(),
			ingredienteTipo = item.find('input[name="ingredientetipo'+(index+1)+'"]:checked').val();
			if(_.isEmpty(ingrediente)) {
				return "";
			} else if(_.isEmpty(cantidad)) {
				$('#errors3').html("Algun ingrediente no tiene precio");
				errors = true;
			} else if(!isDecimal(cantidad)) {
				$('#errors2').html("Todas las cantidades de los ingredientes deben ser numeros enteros");
				errors = true;
			}
			return ingrediente + "|" + cantidad + "|" + ingredienteTipo;
	});
	ingredientesMapped = _.reject(ingredientesMapped, function(ing){ return _.isEmpty(ing); });
	ingredientes = ingredientesMapped.join(",");
	if(isNullOrEmpty(nombreProducto) || isNullOrEmpty(ingredientes) || isNullOrEmpty(precioProducto) || isNullOrEmpty(tipo)) {
		errors = true;
		$('#errors').html('Todos los campos deben estar llenos');
	} else if(!isInt(precioProducto)){
		errors = true;
		$('#errors').html('El precio debe ser un numero');
	} 
	if(errors == true) {
		return;
	}
	if(performingAjaxLogIn == false) {
		performingAjaxLogIn = true;
		$('#errors').html('');
		$("body").css("opacity", "0.5");
		$("body").css("pointer-events", "none");
		$.ajax({
			url: app.getBaseUrl() + "/producto",
			type: "POST",
			crossDomain: true,
			data: ({
				nombre: nombreProducto,
				ingredientes: ingredientes,
				precio: precioProducto,
				tipo: tipo
			}),
			dataType: 'json',
			success:function(data, textStatus, jqXHR){
				$("body").css("opacity", "1");
				$("body").css("pointer-events", "all");
				if(data.success === 'true') {
					redirectToHomeLogged();
				} else {
					$('#errors').html(data.message);
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
	}
}