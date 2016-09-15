ControlPersonal = {};

var cont;
var chefs = [];
var encargados = [];
var chefs_encargados_rel = [];

initializePage = function() {
	cont = 0;
	$("body").css("opacity", "0.5");
	$("body").css("pointer-events", "none");
	$.ajax({
		url: app.getBaseUrl() + "/getChefs",
		type: "GET",
		crossDomain: true,
		dataType: 'json',
		success:function(data, textStatus, jqXHR){
			if(data.success === 'true') {
				chefs = data.data;
				chefs_encargados_rel = data.relaciones;
				cont++;
				processData();
			}
		}    
	});
	$.ajax({
		url: app.getBaseUrl() + "/getEncargados",
		type: "GET",
		crossDomain: true,
		dataType: 'json',
		success:function(data, textStatus, jqXHR){			
			if(data.success === 'true') {
				encargados = data.data;
				cont++;
				processData();
			}
		},
		error:function(){
		}      
	});
};

processData = function() {
	var tablaChefPersonal = $('#tb-controlPersonalEncargados'),
		tablaPersonalLectura = $('#tb-controlPersonalLectura'),
		buttonClass = "class='ui-btn ui-btn-inline ui-btn-raised waves-effect waves-button waves-effect waves-button button-inline-table'",
		encargadosDropdown = $('#encargados-dropdown-popup');
	if(cont == 2) {
		$("body").css("opacity", "1");
		$("body").css("pointer-events", "all");
		_.forEach(chefs, function(row) {
			var relation = chefs_encargados_rel.find(function(item){ return item.chef_usuario == row.Usuario; });
			var empresa = ""
			var encargado = ""
			if(relation) {
				empresa = relation.empresa;
				encargado = relation.encargado_usuario;
				if(encargado.length > 0) {
					encargado += "(Usuario no encontrado)";
				}
				var encargadoRel = encargados.find(function(item){ return item.Usuario == relation.encargado_usuario; });
				if(encargadoRel) {
					encargado = encargadoRel.Apellido1 + " " + encargadoRel.Nombre + " " + encargadoRel.CI;
				}
			}
			var item="<tr><td>"+row.Apellido1+" "+row.Nombre+" - "+row.CI+"</td><td>"+empresa+"</td><td>"+encargado+"</td>" +
			"<td><a href='#' "+buttonClass+" onclick='ControlPersonal.AbrirAsignarChefAEncargado(this);'" +
			"data-Apellido1='"+row.Apellido1+"' data-Nombre='"+row.Nombre+"' data-Usuario='"+row.Usuario+"'" +
			"data-Empresa='"+empresa+"' data-Encargado='"+encargado+"'>Asignar</a></td></tr>";
			tablaChefPersonal.append(item);
		});
		_.forEach(encargados, function(row) {
			var item="<option value='"+row.Usuario+"'>"+row.Apellido1+" "+row.Nombre+" "+row.CI+"</option>";
			encargadosDropdown.append(item);
		})
		_.forEach(encargados, function(row) {
			var encargado = row.Apellido1 + " " + row.Nombre + " " + row.CI;
			var relation = chefs_encargados_rel.find(function(item){ return item.encargado_usuario == row.Usuario; });
			var encargados = _.filter(chefs_encargados_rel, function(item){ return item.encargado_usuario == row.Usuario; });
			_.forEach(encargados, function(relation) {
				var empresa = ""
				var chef = ""
				if(relation) {
					empresa = relation.empresa;
					chef = relation.chef_usuario;
					if(chef.length > 0) {
						chef += "(Usuario no encontrado)";
					}
					var chefRel = chefs.find(function(item){ return item.Usuario == relation.chef_usuario; });
					if(chefRel) {
						chef = chefRel.Apellido1 + " " + chefRel.Nombre + " " + chefRel.CI;
					}
				}
				var item="<tr><td>"+encargado+"</td><td>"+chef+"</td><td>"+empresa+"</td></tr>";
				tablaPersonalLectura.append(item);
			});
			/*var empresa = ""
			var chef = ""
			if(relation) {
				empresa = relation.empresa;
				chef = relation.chef_usuario;
				if(chef.length > 0) {
					chef += "(Usuario no encontrado)";
				}
				var chefRel = chefs.find(function(item){ return item.Usuario == relation.chef_usuario; });
				if(chefRel) {
					chef = chefRel.Apellido1 + " " + chefRel.Nombre + " " + chefRel.CI;
				}
			}
			var item="<tr><td>"+encargado+"</td><td>"+chef+"</td><td>"+empresa+"</td></tr>";
			tablaPersonalLectura.append(item);*/
		});
	}
}

ControlPersonal.AbrirAsignarChefAEncargado = function(element) {
	var data = $(element).data();
	$("#popupDialog-chef-engargado-link").attr('apellido1', data.apellido1);
	$("#popupDialog-chef-engargado-link").attr('nombre', data.nombre);
	$("#popupDialog-chef-engargado-link").attr('usuario', data.usuario);
	$("#popupDialog-chef-engargado-link").attr('empresa', data.empresa);
	$("#popupDialog-chef-engargado-link").attr('encargado', data.encargado);
	$("#popupDialog-chef-engargado-titulo").html("Aisgnar chef a encargado<br><span style='font-size:15px;'>Chef:"+data.apellido1+" "+data.nombre+"<br>Usuario: "+data.usuario);
	var form = $('form[id=asignacion-chef-form]');
	form.find('input[id=empresa]').val("");
	form.find('select[id=encargados-dropdown-popup]').val("");
	form.find('select[id=encargados-dropdown-popup]').parent().find('span').html("Seleccione al encargado");
	if(!isNullOrEmpty(data.empresa)) {
		form.find('input[id=empresa]').val(data.empresa);
	}
	if(!isNullOrEmpty(data.encargado)) {
		form.find('select[id=encargados-dropdown-popup]').val(data.encargado);
		form.find('select[id=encargados-dropdown-popup]').parent().find('span').html(data.encargado);
	}
	$("#popupDialog-chef-engargado-link").click();
}

ControlPersonal.AsignarChefAEncargado = function(element) {
	el = $("#popupDialog-chef-engargado-link");
	Apellido1 = el.attr('apellido1');
	Nombre = el.attr('nombre');
	Usuario = el.attr('usuario');
	Empresa = el.attr('empresa');
	Encargado = el.attr('encargado');
	var form = $('form[id=asignacion-chef-form]');
	var Empresa = form.find('input[id=empresa]').val(),
		Encargado = form.find('select[id=encargados-dropdown-popup]').val();
	/*hasError = false;
	if(isNullOrEmpty(Empresa)) {
		hasError = true;
		$("#error-empresa").html("La empresa no puede estar vacio");
	} else {
		$("#error-empresa").html("");
	}
	if(isNullOrEmpty(Encargado)) {
		hasError = true;
		$("#error-encargados-dropdown-popup").html("Debe seleccionar un encargado");
	} else {
		$("#error-encargados-dropdown-popup").html("");
	}*/
	$("body").css("opacity", "0.5");
	$("body").css("pointer-events", "none");
	$.ajax({
		url: app.getBaseUrl() + "/chefEncargado",
		type: "POST",
		data: {
			chef_usuario: Usuario,
			encargado_usuario: Encargado,
			empresa: Empresa
		},
		crossDomain: true,
		dataType: 'json',
		success:function(data, textStatus, jqXHR){
			$("body").css("opacity", "1");
			$("body").css("pointer-events", "all");
			url = window.location.href;
			if(url.indexOf('&') > 0) {
				window.location.href = url.slice( 0, url.indexOf('&') );
			}
			window.location.reload(true);
		},
		error:function(){
			$("body").css("opacity", "1");
			$("body").css("pointer-events", "all");
		}      
	});
}
