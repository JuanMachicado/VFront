function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

initializePage = function() {
	sessionStorage.ingredientesAComprar = ""
	sessionStorage.comprasEnFecha = ""
	$(".datepicker").datepicker({ 
		onSelect: function(value, date) { 
			_.forEach($("#tb-Productos").find("tr"), function(item) {
				$(item).remove();
			});
			if($("#datepicker-from").val().length > 0 && $("#datepicker-to").val().length > 0) {
				var dateFrom = moment($("#datepicker-from").val(),"DD/MM/YYYY");
				var dateTo = moment($("#datepicker-to").val(),"DD/MM/YYYY");
				if(dateFrom <= dateTo) {
					$("body").css("opacity", "0.5");
					$("body").css("pointer-events", "none");
					HomeEncargado.cargarProductos(dateFrom, dateTo);
				}
			}
		},
		dateFormat: 'dd/mm/yy'
	});

	$.ajax({
		url: app.getBaseUrl() + "/comprasRealizadas",
		type: "GET",
		crossDomain: true,
		dataType: 'json',
		success:function(data, textStatus, jqXHR){
			if(data.success === 'true') {
				_.forEach(data.data, function(item) {
					$("#tb-compras-realizadas").append("<tr><td>"+item.nombre+"</td><td>"+item.comprado+"</td><td>"+item.unidad+"</td><td>"+item.user+"</td><td>"+item.fecha+"</td></tr>");
				})
			}
		}    
	});
};

HomeEncargado = {}

HomeEncargado.cargarProductos = function(dateFrom, dateTo) {
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
				productos = _.groupBy(data.data, function(item){return item.nombre;});
				$.ajax({
					url: app.getBaseUrl() + "/stock",
					type: "GET",
					crossDomain: true,
					dataType: 'json',
					success:function(data2, textStatus, jqXHR){
						/*if(data2.success === 'true') {
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
						}*/
						var enStock = {};
						_.forEach(data2.data, function(item, idx) {
							enStock[item.nombre] = item.cantidad;
						});
						HomeEncargado.cargarPedidos(dateFrom, dateTo, productos, enStock);
					}
				});
			}
		}    
	});
}

HomeEncargado.cargarPedidos = function(dateFrom, dateTo, productos, enStock) {
	$.ajax({
		url: app.getBaseUrl() + "/pedido",
		type: "GET",
		crossDomain: true,
		dataType: 'json',
		success:function(data, textStatus, jqXHR){
			$("body").css("opacity", "1");
			$("body").css("pointer-events", "all");	
			if(data.success === 'true') {
				compras = _.groupBy(data.data, function(item){return item.fecha;});
				ingredientes = []
				dateFrom;
				dateTo;
				comprasEnFecha = _.flatten(_.filter(compras, function(compra) {
				    return moment(compra[0].fecha, "DD/MM/YYYY").isBetween(dateFrom, dateTo, 'days', []);
				}));
				console.log(_.pluck(comprasEnFecha, 'fecha'));
				console.log(comprasEnFecha);
				//comprasEnFecha = compras[date] || [];
				_.forEach(comprasEnFecha, function(item) {
					if(productos[item.nombre]) {
						ingredientes = _.union(ingredientes, _.first(productos[item.nombre]).ingredientes.split(","));
					}
				});
				comprasEnFecha = _.filter(comprasEnFecha, function(item){return item.estadoDeChef == "No entregado";});
				sessionStorage.comprasEnFecha = _.pluck(comprasEnFecha, 'id').join("|");
				ingredientes = _.map(ingredientes, function(item){
					items = item.split("|");
					return {
						nombre: items[0],
						cantidad: items[1],
						tipo: items[2]
					};
				});
				var groups = _.groupBy(ingredientes, function(item){
					return item.nombre + "#" + item.tipo;
				});
				var objTotal = {}
				groupsOrdered = _.sortBy(_.allKeys(groups), function(item){ return item;});
				_.forEach(groupsOrdered, function(group){
					objTotal[group] = 0;
				});
				var data = _.map(groups, function(group){
			        return {
			            nombre: group[0].nombre,
						tipo: group[0].tipo,
						cantidad: _.pluck(group, 'cantidad')
			        }
			    });
			    _.forEach(comprasEnFecha, function(item) {
					producto = _.first(productos[item.nombre]);
					cantidadItem = parseFloat(item.cantidad);
					if(producto && !_.isNaN(cantidadItem)) {
						_.forEach(producto.ingredientes.split(","), function(ingrediente) {
							var itemsSplitted = ingrediente.split("|")
							var prop = itemsSplitted[0]+"#"+itemsSplitted[2];
							if(!_.isNull(groups[prop]) && groups[prop] && (groups[prop].length || 0) > 0) {
								var value = parseFloat(groups[prop][0].cantidad);
								if(!_.isNaN(value)) {
									objTotal[prop] += (value*cantidadItem);
								}
							}
						});
					}
				});


			    var ingredientesAComprar = _.map(_.allKeys(objTotal), function(item) {
					items = item.split("#");
					var _nombre = items[0],
					   _cantidad = objTotal[item].toFixed(3),
					   _enStock = (enStock[items[0]+"#"+items[1]] || 0),
					   _unidad = items[1],
					   _cantidadDouble = parseFloat(_cantidad),
					   _enStockDouble = parseFloat(_enStock);
					if(_.isNumber(_cantidadDouble) && _cantidadDouble > 0 && _enStockDouble < _cantidadDouble) {
						return _nombre + "#" + _unidad + "," + _cantidad;
					}
				});
				ingredientesAComprar = _.reject(ingredientesAComprar, function(item) {return _.isUndefined(item)});
				sessionStorage.ingredientesAComprar = ingredientesAComprar.join("|")

				_.forEach(_.allKeys(objTotal), function(item) {
					items = item.split("#");
					var _nombre = items[0],
					   _cantidad = objTotal[item].toFixed(3),
					   _enStock = (enStock[items[0]+"#"+items[1]] || 0),
					   _unidad = items[1],
					   _cantidadDouble = parseFloat(_cantidad),
					   _enStockDouble = parseFloat(_enStock);
					if(_.isNumber(_cantidadDouble) && _.isNumber(_enStockDouble) && _enStockDouble < _cantidadDouble) {
						$("#tb-Productos").append("<tr style='background-color: red;color: white;font-weight: bold;'><td>"+_nombre+"</td><td>"+_cantidad+"</td><td>"+_enStock+"</td><td>"+_unidad+"</td><td>"+(_cantidad-_enStock)+"</td></tr>");
					} else if (_.isNumber(_cantidadDouble) && _.isNumber(_enStockDouble)) {
						$("#tb-Productos").append("<tr'><td>"+_nombre+"</td><td>"+_cantidad+"</td><td>"+_enStock+"</td><td>"+_unidad+"</td><td>0 </td></tr>");
					}
					
				});
				var els = $("#tb-Productos").find("tr");
				els = _.filter(els, function(item) {
				    return $($(item).find("td")[1]).html() == "0.000";
				});
				_.forEach(els, function(item) {
					$(item).remove();
				});
			}
		}    
	});
}

var isAjaxCallInProgress = false;
HomeEncargado.marcarIngredientesComoComprados = function() {
	if(isAjaxCallInProgress == false) {
		$("body").css("opacity", "1");
		$("body").css("pointer-events", "none");
		var els = $("#tb-Productos").find("tr");
		els = _.filter(els, function(item) {
            cAc = parseFloat($($(item).find("td")[4]).html());
		    return cAc > 0;
		});
		var ids = sessionStorage.comprasEnFecha.split("|");
		var cont = 0;
		var ingredientesAModificar = sessionStorage.ingredientesAComprar.split("|");
		ingredientesAModificar = _.reject(ingredientesAModificar, function(item){return item.length == 0;});
		if(els.length > 0 && ids.length > 0 && ingredientesAModificar.length > 0) {
			isAjaxCallInProgress = true;
			$("body").css("opacity", "0.5");
			$("body").css("pointer-events", "none");
			_.forEach(els, function(item) {
				var items = $(item).find("td")
				nombre = $(items[0]).html()
				cantidad = $(items[1]).html()
				unidad = $(items[3]).html()
				comprado = $(items[4]).html()
				$.ajax({
					url: app.getBaseUrl() + "/comprasRealizadas",
					type: "POST",
					data: {
						nombre: nombre,
						cantidad: cantidad,
						unidad: unidad,
						fecha: moment().format('DD/MM/YYYY'),
						user: window.localStorage.getItem('username'),
						comprado: comprado
					},
					crossDomain: true,
					dataType: 'json',
					success:function(data, textStatus, jqXHR){
						cont++;
						if(cont == (els.length+ids.length+ingredientesAModificar.length)) {
							$("body").css("opacity", "1");
							$("body").css("pointer-events", "all");
							isAjaxCallInProgress = false;
							window.location.reload(true);
						}
					},
					error: function(XMLHttpRequest, textStatus, errorThrown) { 
						cont++;
						if(cont == (els.length+ids.length+ingredientesAModificar.length)) {
							$("body").css("opacity", "1");
							$("body").css("pointer-events", "all");
							isAjaxCallInProgress = false;
							window.location.reload(true);
						}
					}    
				});
			});
			_.forEach(ids, function(item) {
				$.ajax({
					url: app.getBaseUrl() + "/pedido",
					type: "POST",
					data: {
						id: item
					},
					crossDomain: true,
					dataType: 'json',
					success:function(data, textStatus, jqXHR){
						cont++;
						if(cont == (els.length+ids.length+ingredientesAModificar.length)) {
							$("body").css("opacity", "1");
							$("body").css("pointer-events", "all");
							isAjaxCallInProgress = false;
							window.location.reload(true);
						}
					},
					error: function(XMLHttpRequest, textStatus, errorThrown) { 
						cont++;
						if(cont == (els.length+ids.length+ingredientesAModificar.length)) {
							$("body").css("opacity", "1");
							$("body").css("pointer-events", "all");
							isAjaxCallInProgress = false;
							window.location.reload(true);
						}
					}    
				});
			});
			_.forEach(ingredientesAModificar, function(item) {
				items = item.split(",");
				$.ajax({
					url: app.getBaseUrl() + "/stock",
					type: "POST",
					crossDomain: true,
					data: ({
						nombre: items[0],
						cantidad: items[1]
					}),
					dataType: 'json',
					success:function(data, textStatus, jqXHR){
						cont++;
						if(cont == (els.length+ids.length+ingredientesAModificar.length)) {
							$("body").css("opacity", "1");
							$("body").css("pointer-events", "all");	
							isAjaxCallInProgress = false;
							window.location.reload(true);
						}
					},
					error:function(){
						app.saveIntoLocalDB({}, "error");
						cont++;
						if(cont == (els.length+ids.length+ingredientesAModificar.length)) {
							$("body").css("opacity", "1");
							$("body").css("pointer-events", "all");	
							isAjaxCallInProgress = false;
							window.location.reload(true);
						}
					}      
				});
			});
		} else {
			window.location.reload(true);
		}
	}
}