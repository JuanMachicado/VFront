ControlStock = {}

var performingAjaxLogIn = false;

initializePage = function() { 
	ControlStock.cargarProductos();
}

ControlStock.cargarProductos = function() {
	var comprasEnFecha = []
	var productos = {}
	$("body").css("opacity", "0.5");
	$("body").css("pointer-events", "none");
	$.ajax({
		url: app.getBaseUrl() + "/producto",
		type: "GET",
		crossDomain: true,
		dataType: 'json',
		success:function(data, textStatus, jqXHR){
			if(data.success === 'true') {
				var ingredientes = _.pluck(data.data, 'ingredientes');
				var tiposDeIngredientes = [];
				_.forEach(ingredientes, function(item) {
					items = item.split(",");
					_.forEach(items, function(ingrediente) {
						var splitted = ingrediente.split("|");
						tiposDeIngredientes.push(splitted[0]+"#"+splitted[2]);
					});
				});
				ingredientes = _.unique(tiposDeIngredientes);
				$.ajax({
					url: app.getBaseUrl() + "/stock",
					type: "GET",
					crossDomain: true,
					dataType: 'json',
					success:function(data2, textStatus, jqXHR){
						if(data2.success === 'true') {
							ingredientes = _.map(ingredientes, function(ingrediente, idx) {
								resul = _.find(data2.data, function(item) {
								    return item.nombre == ingrediente;
								})
								if(resul) {
									return ingrediente + "#" + resul.cantidad;
								} else {
									return ingrediente + "#0";
								}
							});
							_.forEach(ingredientes, function(ingrediente) {
								items = ingrediente.split("#");
								$("#tb-stock").append('<tr><td>'+items[0]+'</td><td>'+items[1]+'</td><td>'+items[2]+'</td><td><a href="#" class="ui-btn ui-btn-inline ui-btn-raised waves-effect waves-button waves-effect waves-button button-inline-table" onclick="ControlStock.ModificarCantidad(this);" style="width: 158px;">Modificar</a></td></tr>');
							});
						}
						$("body").css("opacity", "1");
						$("body").css("pointer-events", "all");	
					}
				});
			}
		}    
	});
}

ControlStock.ModificarCantidad = function(el) {
	var els = $(el).closest('tr').find('td');
	var nombre = $(els[0]).html(),
		unidad = $(els[1]).html();
	$("#cantidad").val($($(el).closest("tr").find("td")[2]).html());	
	$("#nombre-producto-en-edicion").html(nombre+" "+unidad);
	$("#popupDialog-realizar-pedido").attr("attr-nombre", nombre+"#"+unidad);
	$("#popupDialog-realizar-pedido-link").click();
}

ControlStock.GuardarCantidad = function(el) {
	var nombre = $("#popupDialog-realizar-pedido").attr("attr-nombre"),
		cantidad = $("#cantidad").val();
	if(performingAjaxLogIn == false) {
		performingAjaxLogIn = true;
		$("body").css("opacity", "0.5");
		$("body").css("pointer-events", "none");
		$.ajax({
			url: app.getBaseUrl() + "/stock",
			type: "POST",
			crossDomain: true,
			data: ({
				nombre: nombre,
				cantidad: cantidad
			}),
			dataType: 'json',
			success:function(data, textStatus, jqXHR){
				performingAjaxLogIn = false;
				$("body").css("opacity", "1");
				$("body").css("pointer-events", "all");	
				window.location.reload(true);
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