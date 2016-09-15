/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    getBaseUrl: function() {
        //return "http://www.gisoft-rest-api.appspot.com";
        return "http://localhost:8888";
    },
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('initializePage', initializePage, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        initializePage();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        /*var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);*/
    },
    saveIntoLocalDB: function(data, type) {
    	switch(type) {
		    case "error":
		        console.log("Error ocurred");
		        break;
		    default:
		        break;
		}
    },
    closeApplication: function() {
    	navigator.app.exitApp();
    },
    doLogout: function() {
    	app.removeSessionVariables();
    	redirectToHome();
    },
    removeSessionVariables: function() {
    	window.localStorage.removeItem('username');
    	window.localStorage.removeItem('nombre');
    	window.localStorage.removeItem('apellido');
        window.localStorage.removeItem('tipoUsuario');
    },
    addSessionVariables: function(username, nombre, apellido, tipoUsuario) {
    	window.localStorage.setItem("username", username);
		window.localStorage.setItem("nombre", nombre);
		window.localStorage.setItem("apellido", apellido);
		window.localStorage.setItem("tipoUsuario", tipoUsuario);
    },
    getNameAndLastNameFromLoggedUser: function() {
    	return window.localStorage.getItem('nombre') + ' ' + window.localStorage.getItem('apellido');
    },
    getTipeOfLoggedUser: function() {
    	return window.localStorage.getItem('tipoUsuario');
    },
    getLoggedUser: function() {
        return window.localStorage.getItem('username');
    }
};

//redirects
redirectToIndexIfNotLogged = function() {
	if(_.isNull(window.localStorage.getItem('username'))) {
		redirectToHome();
	}
}

redirectToLoggedMainifLooged = function() {
	if(!_.isNull(window.localStorage.getItem('username'))) {
		if(window.localStorage.getItem('tipoUsuario') === "Administrator") {
            redirectToHomeAdmin();
        } 
        else {
            switch(window.localStorage.getItem('tipoUsuario')) {
                case "Administrador":
                    redirectToHomeAdmin();
                    break;
                case "Encargado de compras":
                    redirectToHomeEncargadoDeCompras();
                    break;
                case "Chef":
                    redirectToHomeChef();
                    break;
                default:
                    redirectToHomeLogged();
            }
        }
	}
}

redirectToEditProduct = function(nombre) {
    sessionStorage.nombre = nombre;
    redirectToEditarProducto();
}

redirectToEditarProducto = function() {
    if(window.location.href.indexOf('/data/editarProducto.html') === -1) {
       window.location = "/data/editarProducto.html"
    }
}

redirectToControlDeStock = function() {
    if(window.location.href.indexOf('/data/controlStock.html') === -1) {
       window.location = "/data/controlStock.html"
    }
}

redirectToMainPage = function() {
    if(!_.isNull(window.localStorage.getItem('username'))) {
        switch(window.localStorage.getItem('tipoUsuario')) {
            case "Administrador":
                redirectToHomeAdmin();
                break;
            case "Encargado de compras":
                redirectToHomeEncargadoDeCompras();
                break;
            case "Chef":
                redirectToHomeChef();
                break;
            default:
                redirectToHomeLogged();
        }
    } else {
        redirectToHome();
    }
}

redirectToEdicionProductos = function() {
    if(window.location.href.indexOf('/data/edicionProductos.html') === -1) {
       window.location = "/data/edicionProductos.html"
    }
}

redirectToReportes = function() {
    if(window.location.href.indexOf('/data/reports.html') === -1) {
       window.location = "/data/reports.html"
    }
}

redirectToRegistroProductos = function() {
    if(window.location.href.indexOf('/data/registroProductos.html') === -1) {
       window.location = "/data/registroProductos.html"
    }
}

redirectIfNotAdmin = function() {
    if(_.isNull(window.localStorage.getItem('username')) || window.localStorage.getItem('tipoUsuario') !== "Administrador")  {
        app.doLogout();
    }
}
redirectToHomeLogged = function() {
    if(window.location.href.indexOf('home.html') === -1) {
	   window.location = "/data/home.html"
    }
};
redirectToHomeAdmin = function() {
    if(window.location.href.indexOf('homeAdmin') === -1) {
        window.location = "/data/homeAdmin.html"
    }
};
redirectToControlPersonal = function() {
    if(window.location.href.indexOf('controlPersonal') === -1) {
        window.location = "/data/controlPersonal.html"
    }
};
redirectToHomeChef = function() {
    if(window.location.href.indexOf('homeChef') === -1) {
        window.location = "/data/homeChef.html"
    }
};
redirectToHomeEncargadoDeCompras = function() {
    if(window.location.href.indexOf('homeEncargadoDeCompras') === -1) {
        window.location = "/data/homeEncargadoDeCompras.html"
    }
};
redirectToHome = function() {
    window.location = "/data/homeAdmin.html"
};
redirectToIndexIfItsNotAdmin = function() {
    if(!_.isNull(window.localStorage.getItem('username'))) {
        redirectToHomeLogged();
    }
    if(window.localStorage.getItem('tipoUsuario') !== "") {
        redirectToHomeLogged();
    }
}
redirectToControlPersonal = function() {
    window.location = "/data/ControlPersonal.html";
}
redirectToLogin = function() {
	window.location = "/data/login.html";
};

redirectToHome = function() {
	window.location = "/";
}

redirectToRegisterUsers = function() {
	window.location = "/data/registerUser.html";
}