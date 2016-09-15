HomeChef = {};
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

initializePage = function() {
	$(".datepicker").datepicker({ 
		dateFormat: 'dd/mm/yy' 
	});
	$(".datepicker").datepicker('setDate', new Date());
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1;
	var buttonClass = "class='ui-btn ui-btn-inline ui-btn-raised waves-effect waves-button waves-effect waves-button button-inline-table'";
	var yyyy = today.getFullYear();
	if(dd<10){
	    dd='0'+dd
	} 
	if(mm<10){
	    mm='0'+mm
	} 
	var fecha = dd+'/'+mm+'/'+yyyy;
	$('#fecha-pedido').val(fecha);
	$("body").css("opacity", "0.5");
	$("body").css("pointer-events", "none");
	$.ajax({
		url: app.getBaseUrl() + "/pedido",
		type: "GET",
		crossDomain: true,
		dataType: 'json',
		success:function(data, textStatus, jqXHR){
			$("body").css("opacity", "1");
			$("body").css("pointer-events", "all");
			if(data.success === 'true') {
				pedidos = _.reject(data.data, function(item){return item.usuario != app.getLoggedUser()});
				pedidos = _.sortBy(pedidos, function(item) {
					var fechas = item.fecha.split('/');
					return new Date(fechas[1]+'/'+fechas[0]+'/'+fechas[2]).getTime();
				});
				pedidosPendientes = _.filter(pedidos, function(item) {
					return item.estadoDeChef == "No entregado";
				})
				pedidosRealizados = _.filter(pedidos, function(item) {
					return item.estadoDeChef == "Entregado";
				})
				_.forEach(pedidosPendientes, function(item) {
					var fechas = item.fecha.split('/');
					var date1 = new Date(fechas[1]+'/'+fechas[0]+'/'+fechas[2]);
					var date2 = new Date();
					var timeDiff = Math.abs(date2.getTime() - date1.getTime());
					var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
					var color = "background-color:transparent";
					if(diffDays <= 7) {
						color = "background-color:cornsilk";
					}
					if(item.estadoDeChef === "No entregado") {
						$("#tb-Pedidos-Pendientes").append("<tr style='"+color+"'><td>"+item.fecha+"</td><td>"+item.nombre+"</td><td>"+item.cantidad+"</td><td><a href='#' "+buttonClass+" onclick='HomeChef.MarcarPedidoComoRealizado(this);'" +
						"data-pedidoId='"+item.id+"' style='width: 158px;'>Marcar como entregado</a></td></tr>");
					} else {
						$("#tb-Pedidos-Pendientes").append("<tr style='"+color+"'><td>"+item.fecha+"</td><td>"+item.nombre+"</td><td>"+item.cantidad+"</td><td>"+item.estadoDeChef+"</td></tr>");
					}
				});
				_.forEach(pedidosRealizados, function(item) {
					if(item.estadoDeChef === "No entregado") {
						$("#tb-Pedidos-Realizados").append("<tr><td>"+item.fecha+"</td><td>"+item.nombre+"</td><td>"+item.cantidad+"</td><td><a href='#' "+buttonClass+" onclick='HomeChef.MarcarPedidoComoRealizado(this);'" +
						"data-pedidoId='"+item.id+"' style='width: 158px;'>Marcar como entregado</a></td></tr>");
					} else {
						$("#tb-Pedidos-Realizados").append("<tr><td>"+item.fecha+"</td><td>"+item.nombre+"</td><td>"+item.cantidad+"</td><td>"+item.estadoDeChef+"</td></tr>");
					}
				});
			}
		}, error: function(XMLHttpRequest, textStatus, errorThrown) { 
			$("body").css("opacity", "1");
			$("body").css("pointer-events", "all");
		}  
	});
};

HomeChef.getDrownDownHtml = function(nombre) {
	return "<option value='"+nombre+"'>"+nombre+"</option>"
}

HomeChef.MarcarProductoRealizadoClicked = function(el) {
	var id = $("#popupDialog-marcar-pedido-realizado").attr('data-pedidoId');
	$("body").css("opacity", "0.5");
	$("body").css("pointer-events", "none");
	$.ajax({
		url: app.getBaseUrl() + "/pedido",
		type: "POST",
		data: {
			id: id,
			estadoDeChef: "Realizado"
		},
		crossDomain: true,
		dataType: 'json',
		success:function(data, textStatus, jqXHR){
			$("body").css("opacity", "1");
			$("body").css("pointer-events", "all");
			window.location.reload(true);
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) { 
			$("body").css("opacity", "1");
			$("body").css("pointer-events", "all");
		}    
	});
}

HomeChef.MarcarPedidoComoRealizado = function(el) {
	var id = $(el).attr('data-pedidoId');
	$("#popupDialog-marcar-pedido-realizado").attr('data-pedidoId', id);
	$("#popupDialog-marcar-pedido-realizado-link").click();
}

HomeChef.Cerrar = function(el){
	window.location = "/data/homeChef.html";
}


HomeChef.cargarDescripcionProducto = function(el) {
	rows = $('#tb-Productos').find("td")
	_.forEach(rows, function(row) {
		$(row).remove();
	})
	if(!isNullOrEmpty(el.value)) {
		$("body").css("opacity", "0.5");
		$("body").css("pointer-events", "none");
		$.ajax({
			url: app.getBaseUrl() + "/producto/obtener",
			type: "POST",
			data: {
				nombre: el.value
			},
			crossDomain: true,
			dataType: 'json',
			success:function(data, textStatus, jqXHR){
				$("body").css("opacity", "1");
				$("body").css("pointer-events", "all");
				if(data.success === 'true') {
					_.forEach(data.data.ingredientes.split(","), function(item) {
						var table = $('#tb-Productos');
						var items = item.split("|");
						table.append("<tr><td>"+items[0]+"</td><td>"+items[1]+"</td><td>"+items[2]+"</td></tr>");
					}); 
				}
			}    
		});
	}
}

HomeChef.cargarProductos = function(el) {
	var tipo = $(el).attr("tipo");
	var productosDropdown = $("#productos-dropdown");
	_.forEach(_.rest(productosDropdown.find("option"), 1), function(item) {
		$(item).remove();
	})
	_.forEach($("#tb-Productos").find("tr"), function(item) {
		$(item).remove();
	})
	$("input[name=cantidad]").val("");
	$("#productos-dropdown").selectmenu('refresh');
	$("body").css("opacity", "0.5");
	$("body").css("pointer-events", "none");
	$.ajax({
		url: app.getBaseUrl() + "/producto/tipo/"+tipo,
		type: "GET",
		crossDomain: true,
		dataType: 'json',
		success:function(data, textStatus, jqXHR){
			$("body").css("opacity", "1");
			$("body").css("pointer-events", "all");
			if(data.success === 'true') {
				_.forEach(data.data, function(item) {
					productosDropdown.append(HomeChef.getDrownDownHtml(item.nombre));
				})
				$("#popupDialog-realizar-pedido-link").click();
			}	
		}    
	});
}
var performingAjaxLogIn = false;
HomeChef.enviarPedido = function() {
	var fecha = $("#fecha-pedido").val(),
		nombre = $("select[name=nombre-producto]").val(),
		cantidad = $("[name=cantidad]").val();
	if(isNullOrEmpty(fecha) || isNullOrEmpty(nombre) || isNullOrEmpty(cantidad)) {
		$("#error-producto").html("Debe llenar todos los campos");
	} else if(!isNumber2(cantidad)) {
		$("#error-producto").html("La cantidad debe ser un numero");
	} else {
		$("#error-producto").html("");
		if(performingAjaxLogIn == false) {
			performingAjaxLogIn = true;
			$("body").css("opacity", "0.5");
			$("body").css("pointer-events", "none");
			$.ajax({
				url: app.getBaseUrl() + "/pedido",
				type: "POST",
				crossDomain: true,
				data: ({
					fecha: fecha,
					nombre: nombre,
					cantidad: cantidad,
					usuario: app.getLoggedUser()
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
}