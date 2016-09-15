EdicionProductos = {};

getIngredienteHtml = function(idx, nombre, cantidad) {
	return "<tr class='ingrediente'>"+
		"<td>"+
		"<div class='ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset ui-input-has-clear'>"+
		"<input type='text' name='nombre' value='"+nombre+"' data-clear-btn='true' placeholder='Nombre...' required>"+
		"</div>"+
		"</td>"+
		"<td>"+
		"<div class='ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset ui-input-has-clear'>"+
		"<input type='text' name='cantidad' value='"+cantidad+"' data-clear-btn='true' placeholder='Cant...' required>"+
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

getButtonEditarIngrediente = function(nombre) {
	return "<a href='#'' class='ui-btn ui-btn-inline ui-btn-raised waves-effect waves-button waves-effect waves-button button-inline-table'"+ 
	    "onclick='EdicionProductos.EditarProducto(this);' data-nombre='"+nombre+"'>Editar</a>";
}

getButtonEliminarIngrediente = function(nombre) {
	return "<a href='#'' class='ui-btn ui-btn-inline ui-btn-raised waves-effect waves-button waves-effect waves-button button-inline-table'"+ 
	    "onclick='EdicionProductos.EliminarProducto(this);' data-nombre='"+nombre+"'>Eliminar</a>";
}

initializePage = function() {
	$.ajax({
		url: app.getBaseUrl() + "/producto",
		type: "GET",
		crossDomain: true,
		dataType: 'json',
		success:function(data, textStatus, jqXHR){
			if(data.success === 'true') {
				_.forEach(data.data, function(item) {
					$('#tb-edicionProductos').append("<tr><td>"+item.nombre+"</td><td>"+getButtonEditarIngrediente(item.nombre)+"</td><td>"+getButtonEliminarIngrediente(item.nombre)+"</td></tr>");
				})
			}
		}    
	});
};
var performingAjaxLogIn = false;
EdicionProductos.EliminarProducto = function(el) {
	var nombre = $(el).attr('data-nombre');
	$("#popupDialog-eliminar-producto-link").attr('nombre', nombre);
	$("#popupDialog-eliminar-producto-link").click();
}

EdicionProductos.EliminarProductoClicked = function(el) {
	var nombre = $("#popupDialog-eliminar-producto-link").attr('nombre');
	EdicionProductos.EliminarProductoDb(nombre);
}

EdicionProductos.Cerrar = function(el){
	window.location = "/data/edicionProductos.html";
}

EdicionProductos.EliminarProductoDb = function(nombre) {
	if(performingAjaxLogIn == false) {
		performingAjaxLogIn = true;
		$("body").css("opacity", "0.5");
		$("body").css("pointer-events", "none");
		$.ajax({
			url: app.getBaseUrl() + "/producto/eliminar",
			type: "POST",
			crossDomain: true,
			data: ({
				nombre: nombre
			}),
			dataType: 'json',
			success:function(data, textStatus, jqXHR){
				if(data.success === 'true') {
					window.location = "/data/edicionProductos.html";
					window.location.reload(true);
				}
				performingAjaxLogIn = false;
				$("body").css("opacity", "1");
				$("body").css("pointer-events", "all");
			},
			error:function(){
				app.saveIntoLocalDB({}, "error");
				performingAjaxLogIn = false;
				$("body").css("opacity", "1");
				$("body").css("pointer-events", "all");
			}      
		});
	}
}

EdicionProductos.EditarProducto = function(el) {
	var nombre = $(el).attr('data-nombre');
	redirectToEditProduct(nombre);
}