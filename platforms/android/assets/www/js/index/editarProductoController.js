initializePage = function() {
	nombre = sessionStorage.nombre
	var checks = {}
	checks["desayuno"] = 0
	checks["almuerzo"] = 1
	checks["plato especial"] = 2
	checks["refresco"] = 3
	checks["postre"] = 4
	var checksTipos = {}
	checksTipos["kg"] = 0
	checksTipos["lb"] = 1
	checksTipos["g"] = 2
	checksTipos["lt"] = 3
	checksTipos["u"] = 4
	$.ajax({
		url: app.getBaseUrl() + "/producto/obtener",
		type: "POST",
		data: {
			nombre: nombre
		},
		crossDomain: true,
		dataType: 'json',
		success:function(data, textStatus, jqXHR){
			if(data.success === 'true') {
				var form = $('#producto-form');
				form.find('input[name=nombreProducto]').val(data.data.nombre);
				form.find('input[name=precioProducto]').val(data.data.precio);
				$(form.find('input[name=tipo]')).attr('checked', false);
				$(form.find('input[name=tipo]')[checks[data.data.tipo]]).attr('checked', true);
				$(form.find('input[name=tipo]')[checks[data.data.tipo]]).click();
				$(form.find('input[name=tipo]')[checks[data.data.tipo]]).parent().find('label').addClass('ui-btn ui-corner-all ui-btn-inherit ui-btn-icon-left ui-last-child ui-radio-on');
				_.forEach(data.data.ingredientes.split(","), function(item, idx) {
					var items = item.split("|");
					var _html = getIngredienteHtml(items[0], items[1], idx+1);
					$("#tb-productos-ingredientes").append(_html);
					var boxes = $("#tb-productos-ingredientes").find("input[name='ingredientetipo"+(idx+1)+"']");
					$(boxes[checksTipos[items[2]]]).attr('checked', true);
				});
			}
		}    
	});
};

getIngredienteHtml = function(nombre, cantidad, idx) {
	return "<tr class='ingrediente'>"+
		"<td>"+
		"<div class='ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset ui-input-has-clear'>"+
		"<input type='text' name='nombre' value='"+nombre+"' data-clear-btn='true' placeholder='Nombre...' required>"+
		"</div>"+
		"</td>"+
		"<td>"+
		"<div class='ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset ui-input-has-clear'>"+
		"<input type='text' name='cantidad' value="+cantidad+" data-clear-btn='true' placeholder='Cant...' required>"+
		"</div>"+
		"</td>"+
		"<div class='ui-controlgroup-controls '>"+
		"<td>"+
		"<div class='ui-radio'>"+
		"<input type='radio' name='ingredientetipo"+idx+"' value='kg' data-cacheval='false' style='margin: 0px;padding: 0px;margin-left: -10px;margin-top: 10px;'>"+
		"</div>"+
		"</td>"+
		"<td>"+
		"<div class='ui-radio'>"+
		"<input type='radio' name='ingredientetipo"+idx+"' value='lb' data-cacheval='false' style='margin-left: -7.5px;margin-top: 10px;'>"+
		"</div>"+
		"</td>"+
		"<td>"+
		"<div class='ui-radio'>"+
		"<input type='radio' name='ingredientetipo"+idx+"' value='g' data-cacheval='false' style='margin-left: -7.5px;margin-top: 10px;'>"+
		"</div>"+
		"</td>"+
		"<td>"+
		"<div class='ui-radio'>"+
		"<input type='radio' name='ingredientetipo"+idx+"' value='lt' data-cacheval='false' style='margin-left: -7.5px;margin-top: 10px;'>"+
		"</div>"+
		"</td>"+
		"<td>"+
		"<div class='ui-radio'>"+
		"<input type='radio' name='ingredientetipo"+idx+"' value='u' data-cacheval='false' style='margin-left: -7.5px;margin-top: 10px;'>"+
		"</div>"+
		"</td>"+
		"</div>"+
		"</tr>";
}

var performingAjaxLogIn = false;
registrarNuevoProducto = function() {}

registrarProducto = function() {
	var form = $('#producto-form'),
		nombreProducto = form.find('input[name=nombreProducto]').val(),
		precioProducto = form.find('input[name=precioProducto]').val(),
		tipo = form.find('input[name="tipo"]:checked').val();
	var ingredientes = "";
	$('#errors').html("");
	$('#errors2').html("");
	$('#errors3').html("");
	var errors = false;
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
			url: app.getBaseUrl() + "/producto/editar",
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