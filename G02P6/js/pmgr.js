"use strict"

import * as Pmgr from './pmgrapi.js'

/**
 * Librería de cliente para interaccionar con el servidor de PrinterManager (prmgr).
 * Prácticas de IU 2020-21
 *
 * Para las prácticas de IU, pon aquí (o en otros js externos incluidos desde tus .htmls) el código
 * necesario para añadir comportamientos a tus páginas. Recomiendo separar el fichero en 2 partes:
 * - funciones que pueden generar cachos de contenido a partir del modelo, pero que no
 *   tienen referencias directas a la página
 * - un bloque rodeado de $(() => { y } donde está el código de pegamento que asocia comportamientos
 *   de la parte anterior con elementos de la página.
 *
 * Fuera de las prácticas, lee la licencia: dice lo que puedes hacer con él, que es esencialmente
 * lo que quieras siempre y cuando no digas que lo escribiste tú o me persigas por haberlo escrito mal.
 */

function addGroup(g) {
    return ` <tr>
<td>${g.name}</td>   
<td><button type="button" data-toggle="modal"  data-name= "${g.name}" data-name1= "${g.id}" data-target="#modalPrinters"><img class="icon" src="img/vergrupos.png"></img></button> 
</td>
<td>
    <button type="button" data-toggle="modal" data-name= "${g.name}" data-name1= "${g.id}"  data-name2= "${g.printers}" data-target="#modalEditGroup"><img class="icon" src="img/edit.png"></img></button>
    <button type="button" data-toggle="modal" data-name= "${g.name}" data-name1= "${g.id}" data-target="#modalDeleteGroup"><img class="icon" src="img/delete.png"></img></button>
</td>
</tr>
`
}

function mostrarGruposPrinter(g, idPrinter) {  //derecha
    return ` <tr>
    <td>${g.name}</td>
    <td>
    <button type="button" data-toggle="modal" data-name= "${g.name}" data-name1= "${g.id}" data-name2= "${g.printers}" data-name3= "${idPrinter}" data-target="#modalDeleteGroupfromPrinter"><img class="icon" src="img/delete.png"></img></button>
    </td>
    </tr>
    `
}

function mostrarPrinterGrupos(p, idGroup) {  //izquierda
    return ` <tr>
    <td>${p.alias}</td>
    <td>
    <button type="button" data-toggle="modal" data-name= "${p.alias}" data-name1= "${p.id}" data-name2= "${idGroup}" data-target="#modalDeletePrinterfromGroup"><img class="icon" src="img/delete.png"></img></button>
    </td>
    </tr>
    `
}

function addPrinter(p) {

    const hid = 'h_' + p.id;

    let pillClass = {
        PAUSED: "badge-secondary",
        PRINTING: "badge-success",
        NO_INK: "badge-danger",
        NO_PAPER: "badge-danger"
    };

    return `
    <tr id=${hid}>
    <td>${p.alias}</td>
    <td>${p.model}</td>
    <td>${p.location}</td>
    <td>${p.ip}</td>
    <td><span class="badge badge-pill ${pillClass[p.status]}">${p.status}</span></td>
    <td><button type="button" data-toggle="modal"  data-name= "${p.alias}" data-name1= "${p.id}" data-target="#modalGroups"><img class="icon" src="img/vergrupos.png"></img></button> </td>
    <td>
        <button type="button" data-toggle="modal"  data-name= "${p.alias}" data-name1= "${p.queue}" data-name2= "${p.id}" data-target="#modalJobs"><img class="icon" src="img/jobs.png"></img></button>
        <button type="button" data-toggle="modal"  data-name= "${p.alias}" data-name1= "${p.id}" data-target="#modalSend"><img class="icon" src="img/send.png"></img></button>
    </td>
    <td>
        <button type="button" data-toggle="modal" data-name= "${p.alias}" data-name1= "${p.model}" data-name2= "${p.location}" data-name3= "${p.ip}" data-name4= "${p.id}" data-target="#modalEditPrinter"><img class="icon" src="img/edit.png"></img></button>
        <button type="button" data-toggle="modal"  data-name= "${p.alias}" data-name1= "${p.id}" data-target="#modalDeletePrinter"><img class="icon" src="img/delete.png"></img></button>
    </td>
    </tr>
    `
}

function addJobs(j) {
    console.log("hola")
    return `<tr>
    <td>${j.fileName}</td>
    <td>${j.owner}</td>
    <td>
    <button type = "button" data-toggle = "modal"  data-name= "${j.fileName}" data-name1= "${j.id}" data-target = "#modalDeleteJob"> <img class="icon" src = "img/delete.png"></img></button>
    </td> 
    </tr>
    `
}



$().button('toggle')

//
// PARTE 1:
// Código de comportamiento, que sólo se llama desde consola (para probarlo) o desde la parte 2,
// en respuesta a algún evento.
//

function createPrinterItem(printer) {
    const rid = 'x_' + Math.floor(Math.random() * 1000000);
    const hid = 'h_' + rid;
    const cid = 'c_' + rid;

    // usar [] en las claves las evalua (ver https://stackoverflow.com/a/19837961/15472)

    let pillClass = {
        PAUSED: "badge-secondary",
        PRINTING: "badge-success",
        NO_INK: "badge-danger",
        NO_PAPER: "badge-danger"
    };

    let allJobs = printer.queue.map((id) =>
        `<span class="badge badge-secondary">${id}</span>`
    ).join(" ");

    return `   
    <div class="card">
    <div class="card-header" id="${hid}">
        <h2 class="mb-0">
            <button class="btn btn-link" type="button"
                data-toggle="collapse" data-target="#${cid}",
                aria-expanded="false" aria-controls="#${rid}">
            <b class="pcard">${printer.alias}</b>
            <span class="badge badge-pill ${pillClass[printer.status]}">${printer.status}</span>
            <div class="small">
                ${printer.model} at ${printer.location}
            </div>
            </button>
        </h2>
    </div>

    <div id="${cid}" class="collapse hide" aria-labelledby="${hid}
        data-parent="#accordionExample">
        <div class="card-body pcard">
            ${allJobs}
    </div>
    </div>
    </div>
 `;
}

// funcion para generar datos de ejemplo: impresoras, grupos, trabajos, ...
// se puede no-usar, o modificar libremente
async function populate(minPrinters, maxPrinters, minGroups, maxGroups, jobCount) {
    const U = Pmgr.Util;

    // genera datos de ejemplo
    minPrinters = minPrinters || 10;
    maxPrinters = maxPrinters || 20;
    minGroups = minGroups || 1;
    maxGroups = maxGroups || 3;
    jobCount = jobCount || 5;
    let lastId = 0;

    let printers = U.fill(U.randomInRange(minPrinters, maxPrinters),
        () => U.randomPrinter(lastId++));

    let groups = U.fill(U.randomInRange(minPrinters, maxPrinters),
        () => U.randomGroup(lastId++, printers, 50));

    let jobs = [];
    for (let i = 0; i < jobCount; i++) {
        let p = U.randomChoice(printers);
        let j = new Pmgr.Job(lastId++,
            p.id, [
                U.randomChoice([
                    "Alice", "Bob", "Chema", "Daryl", "Eduardo", "Facundo", "Gloria", "Humberto"
                ]),
                U.randomChoice([
                    "Fernández", "García", "Pérez", "Giménez", "Hervás", "Haya", "McEnroe"
                ]),
                U.randomChoice([
                    "López", "Gutiérrez", "Pérez", "del Oso", "Anzúa", "Báñez", "Harris"
                ]),
            ].join(" "),
            U.randomString() + ".pdf");
        p.queue.push(j.id);
        jobs.push(j);
    }

    if (Pmgr.globalState.token) {
        console.log("Updating server with all-new data");

        // FIXME: remove old data
        // FIXME: prepare update-tasks
        let tasks = [];
        for (let t of tasks) {
            try {
                console.log("Starting a task ...");
                await t().then(console.log("task finished!"));
            } catch (e) {
                console.log("ABORTED DUE TO ", e);
            }
        }
    } else {
        console.log("Local update - not connected to server");
        Pmgr.updateState({
            jobs: jobs,
            printers: printers,
            groups: groups
        });
    }
}

/**
 * En un div que contenga un campo de texto de búsqueda
 * y un select, rellena el select con el resultado de la
 * funcion actualizaElementos (que debe generar options), y hace que
 * cualquier búsqueda filtre los options visibles.
 */
function activaBusquedaDropdown(div, actualizaElementos) {
    let search = $(div).find('input[type=search]');
    let select = $(div).find('select');
    console.log("BUSQUEDA: ", search, select);
    // vacia el select, lo llena con impresoras validas
    select.empty();
    actualizaElementos(select);

    // filtrado dinámico
    $(search).off('input'); // elimina manejador anterior, si lo habia
    $(search).on('input', () => {
        let w = $(search).val().trim().toLowerCase();
        let items = $(select).find("option");

        items.each((i, o) =>
            $(o).text().toLowerCase().indexOf(w) > -1 ? $(o).show() : $(o).hide());

        // muestra un array JS con los seleccionados

        console.log("Seleccionados:", $(select).val());
    });
}

// funcion de actualización de ejemplo. Llámala para refrescar interfaz
function update(result) {
    try {
        // Vaciamos un contenedor
        $("#myTable").empty();
        $("#myTableImp").empty();
        $("#myTableGroup").empty();

        // y lo volvemos a rellenar con su nuevo contenido
        Pmgr.globalState.printers.forEach(m => $("#myTable").append(createPrinterItem(m)));

        //Añadimos datos a impresoras, grupos y trabajos de impresion:
        Pmgr.globalState.printers.forEach(m => $("#myTableImp").append(addPrinter(m)));
        Pmgr.globalState.groups.forEach(g => $("#myTableGroup").append(addGroup(g)));

        //Busqueda para el filtrado:
        activaBusquedaDropdown($('#dropdownBuscableGrupos'),
            (select) => Pmgr.globalState.groups.forEach(m =>
                select.append(`<option value="${m.name}">${m.name}</option>`)
            )
        );
        activaBusquedaDropdown($('#dropdownBuscableImpresoras'),
            (select) => Pmgr.globalState.printers.forEach(m =>
                select.append(`<option value="${m.id}">${m.alias}</option>`))
        );

    } catch (e) {
        console.log('Error actualizando', e);
    }
}

//
// PARTE 2:
// Código de pegamento, ejecutado sólo una vez que la interfaz esté cargada.
// Generalmente de la forma $("selector").cosaQueSucede(...)
//
$(function () {

    //FILTRO
    //Cambiar el nombre del filtro al lado del icono:
    $('.search-panel .dropdown-menu').find('a').click(function (e) {
        e.preventDefault();
        let param = $(this).attr("href").replace("#", ""); //
        let concept = $(this).text(); //el de la tabla
        $('.search-panel span#search_concept').text(concept);
        $('.input-group #search_param').val(param);

        console.log(param, " ", concept) //con Todos muestra all    Todos
        console.log(value)
    });
    //Filtado general
    $("#searchInput").on("keyup", function () {
        let value = $(this).val().toLowerCase();
        $("#myTableImp tr").filter(function () {
            //editar esta sentencia para filtrado especifico
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)

            console.log(value)

        });
    });


    //TODO filtros especificos

    //VALIDACION IP
    $(".ip-input").change((e) => {
        let o = $(e.target);
        let regexp = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
        //inputText.value.match(ip)
        let esValido = regexp.test(o.val());


        $(o)[0].setCustomValidity(esValido ?
            "" : "IP inválida. Ej: 192.168.120.10"
        );
    })

    //VALIDAR DOCUMENTO PDF
    $(".doc-validator").change((e) => {
        let o = $(e.target);

        //nombre Archivo
        let filename = o.val().split(/(\\|\/)/g).pop()

        //Obtener la extensión
        let ext = filename.split('.').reverse()[0]

        let esValido;
        if (ext == 'pdf')
            esValido = true;
        else
            esValido = false;

        //Comparar si es archivo .pdf 
        $(o)[0].setCustomValidity(esValido ?
            "" : "Archivo inválido. Introducir documento PDF"
        );
    })

    //AÑADIR IMPRESORAS
    $("#addprinter").click(() => {
        let alias = $("#inputalias").val();
        let model = $("#inputmodelo").val();
        let location = $("#inputloc").val();
        let ip = $("#inputip").val();

        const PS = Pmgr.PrinterStates;
        Pmgr.addPrinter({ alias: alias, model: model, location: location, ip: ip, queue: [], status: PS.PAUSED }).then(update());
    })

    //AÑADIR GRUPO
    $("#addgroups").click(() => {
        let nombre = $("#nameGroup").val();
        let printers = $("#printersGroupAdd").val();

        Pmgr.addGroup({ name: nombre, printers: printers }).then(update());
    });

    /*MODALS (autocompletar)*/
    $('#modalDeletePrinter').on('show.bs.modal', function (event) {
        let button = $(event.relatedTarget) // Button that triggered the modal
        let alias = button.data('name') // Extract info from data-* attributes
        let id = button.data('name1')
        console.log(id)
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        let modal = $(this)
        modal.find('.modal-title').text('¿Desea eliminar la impresora ' + alias + "?")
        modal.find('.modal-body input').val(alias)

        $("#deletePrinter").click(() => {
            Pmgr.rmPrinter(id).then(update()); //UPDATE IMPORTANTE

            Pmgr.globalState.groups.forEach(function (g) {
                let filtered = g.printers.filter(function (idPrinter) {
                    return idPrinter !== id;
                });
                console.log(filtered)
                Pmgr.setGroup({ id: g.id, name: g.name, printers: filtered }).then(update());
            });
        });
    })

    $('#modalDeleteGroup').on('show.bs.modal', function (event) {
        let button = $(event.relatedTarget) // Button that triggered the modal
        let name = button.data('name') // Extract info from data-* attributes
        let id = button.data('name1')
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        let modal = $(this)
        modal.find('.modal-title').text('¿Desea eliminar el grupo ' + name + "?")
        modal.find('.modal-body input').val(name)

        $("#deleteGroup").click(() => {
            Pmgr.rmGroup(id).then(update());
        });

    })

    $('#modalDeleteGroupfromPrinter').on('show.bs.modal', function (event) {//derecha
        let button = $(event.relatedTarget) // Button that triggered the modal
        let name = button.data('name') // Extract info from data-* attributes
        let id = button.data('name1')
        let printers = button.data('name2')
        let idPrinter = button.data('name3')
        let arrayPrinters = JSON.parse("[" + printers + "]");
        console.log(printers)
        console.log(idPrinter)
        console.log(arrayPrinters)

        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        let modal = $(this)
        modal.find('.modal-title').text('¿Desea eliminar el grupo ' + name + " de la impresora?")
        modal.find('.modal-body input').val(name)

        $("#deleteGroupFromPrinter").click(() => {
            let filtered = arrayPrinters.filter(function (p) {
                return idPrinter !== p;
            });
            Pmgr.setGroup({ id: id, name: name, printers: filtered }).then(update());
        });
    })

    $('#modalDeletePrinterfromGroup').on('show.bs.modal', function (event) {//izquierda
        let button = $(event.relatedTarget) // Button that triggered the modal
        let alias = button.data('name') // Extract info from data-* attributes
        let id = button.data('name1')
        let idGroup = button.data('name2')
        console.log(idGroup)
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        let modal = $(this)
        modal.find('.modal-title').text('¿Desea eliminar la impresora ' + alias + " del grupo?")
        modal.find('.modal-body input').val(alias)

        $("#deletePrinterFromGroup").click(() => {
            Pmgr.globalState.groups.forEach(function (g) {
                if (g.id == idGroup) {
                    let filtered = g.printers.filter(function (p) {
                        return p !== id;
                    });
                    console.log(filtered)
                    Pmgr.setGroup({ id: g.id, name: g.name, printers: filtered }).then(update());
                }
            });
        });
    })

    $('#modalJobs').on('show.bs.modal', function (event) {
        let button = $(event.relatedTarget) // Button that triggered the modal
        let alias = button.data('name') // Extract info from data-* attributes

        let colaTrabajo = button.data('name1')
        let idPrinter = button.data('name2')
        console.log(colaTrabajo)
        console.log(idPrinter)
        let arrayJobs = JSON.parse("[" + colaTrabajo + "]");
        console.log(arrayJobs)

        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        let modal = $(this)
        modal.find('.modal-title').text("Cola de trabajo de " + alias)

        $("#myTableJobs").empty();
        Pmgr.globalState.jobs.forEach(function (j) {
            arrayJobs.forEach(function (idJb) {
                if (idJb == j.id) {
                    $("#myTableJobs").append(addJobs(j))
                }
            })
        });

        update();
    })

    $('#modalDeleteJob').on('show.bs.modal', function (event) {
        let button = $(event.relatedTarget) // Button that triggered the modal
        let filename = button.data('name') // Extract info from data-* attributes
        let jobsId = button.data('name1')

        console.log(filename)
        console.log(jobsId)

        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        let modal = $(this)
        modal.find('.modal-title').text("¿Desea eliminar el trabajo " + filename + "?")

        $("#btnDeleteJob").click(() => {
            Pmgr.rmJob(jobsId).then(update());
        });

    })

    //radios de enviar trabajo
    $("#radioGroup").click(function () {
        $("#enviarTrabajoGrupo").attr("disabled", false);
    });
    $("#radioPrinter").click(function () {
        $("#enviarTrabajoGrupo").attr("disabled", true);
    });

    $('#modalSend').on('show.bs.modal', function (event) {
        let button = $(event.relatedTarget) // Button that triggered the modal
        let alias = button.data('name') // Extract info from data-* attributes
        let id = button.data('name1')

        let modal = $(this)
        modal.find('.modal-title').text("Enviar trabajo a " + alias)

        $("#myTableJobs").empty();
        activaBusquedaDropdown($('#dropdownBuscableTrabajoGrupo'),
            (select) => Pmgr.globalState.groups.forEach(function (g) {
                if (g.printers.includes(id)) { //sacar solo los grupos que tienen esa printer
                    select.append(`<option value="${g.id}">${g.name}</option>`)
                }
            })
        );

        $("#btnsendJob").click(() => {
            let filepath = $("#exampleInputFile").val();
            let filename = filepath.split(/(\\|\/)/g).pop()
            let owner = $("#exampleInputOwner").val();

            if (document.getElementById('radioGroup').checked) {
                let selected = []; //grupos
                for (let option of document.getElementById('enviarTrabajoGrupo').options) {
                    if (option.selected) {
                        selected.push(option.value);
                    }
                }

                if (selected.length > 0) {
                    Pmgr.globalState.groups.forEach(function (g) {
                        let minJobs = 999
                        let idP;
                        let aliasP;
                        let jobs;
                        if (selected.includes(g.id.toString())) {
                            g.printers.forEach(function (idPrinter) {
                                Pmgr.globalState.printers.forEach(function (p) {
                                    if (p.id == idPrinter) {
                                        if (p.queue.length < minJobs) {
                                            minJobs = p.queue.length
                                            idP = p.id //impresora a la que le enviamos el trabajo final
                                        }
                                    }
                                })
                            })
                            Pmgr.addJob({ printer: idP, owner: owner, fileName: filename}).then(update());
                        }
                    });
                }
            }
            if (document.getElementById('radioPrinter').checked) {
                Pmgr.addJob({ printer: id, owner: owner, fileName: filename }).then(update());
            }

        });
    })

    $('#modalGroups').on('show.bs.modal', function (event) {
        let button = $(event.relatedTarget) // Button that triggered the modal
        let name = button.data('name') // Extract info from data-* attributes
        let id = button.data('name1')
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        let modal = $(this)
        modal.find('.modal-title').text("Grupos de " + name)
        modal.find('.modal-body input').val(name)

        $("#tablaGruposPrinter").empty();
        Pmgr.globalState.groups.forEach(function (g) {
            g.printers.forEach(function (p) {
                if (p === id) {
                    $("#tablaGruposPrinter").append(mostrarGruposPrinter(g, p));
                }
            });
        });
        update();
    })

    $('#modalPrinters').on('show.bs.modal', function (event) {
        let button = $(event.relatedTarget) // Button that triggered the modal
        let name = button.data('name') // Extract info from data-* attributes
        let id = button.data('name1')
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        let modal = $(this)

        modal.find('.modal-title').text("Impresoras de " + name)
        modal.find('.modal-body input').val(name)

        $("#tablaPrinterGrupos").empty();
        Pmgr.globalState.groups.forEach(function (g) {
            g.printers.forEach(function (idPrinter) {
                if (g.id == id) {
                    Pmgr.globalState.printers.forEach(function (p) {
                        if (p.id == idPrinter) {
                            $("#tablaPrinterGrupos").append(mostrarPrinterGrupos(p, g.id));
                        }
                    });
                }
            });
        });
        update();
    })

    $('#modalEditGroup').on('show.bs.modal', function (event) {
        let button = $(event.relatedTarget) // Button that triggered the modal
        let name = button.data('name') // Extract info from data-* attributes
        let id = button.data('name1')
        let printers = button.data('name2') //te devuelve un string con los ids separados con , NO UN ARRAY
        let arrayPrinters = JSON.parse("[" + printers + "]"); //array con los ids de las impresoras

        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        let modal = $(this)
        modal.find('.modal-title').text('Editar ' + name)
        modal.find('.modal-body #aliasGroup ').val(name)

        activaBusquedaDropdown($('#dropdownBuscableImpresorasGroup'), //SE SELECCIONAN CON CTRL
            (select) => Pmgr.globalState.printers.forEach(function (m) {
                if (!arrayPrinters.includes(m.id)) { //sacar solo las printers que no esten en el grupo
                    select.append(`<option value="${m.id}">${m.alias}</option>`)
                }
            })
        );

        $("#editGroup").click(() => {
            let nombre = $("#aliasGroup").val();
            let addedPrinters = $("#printersGroupEdit").val();
            let arrayP = JSON.parse("[" + addedPrinters + "]");

            if (addedPrinters.length == 0) { //no ha añadido ninguna printer al grupo
                Pmgr.setGroup({ id: id, name: nombre }).then(update());
            }
            else {
                let array = arrayPrinters.concat(arrayP);
                Pmgr.setGroup({ id: id, name: nombre, printers: array }).then(update());
            }
        });
    })

    $('#modalEditPrinter').on('show.bs.modal', function (event) {
        let button = $(event.relatedTarget) // Button that triggered the modal
        let alias = button.data('name')
        let modelo = button.data('name1')
        let loc = button.data('name2')
        let ip = button.data('name3')
        let idPrinter = button.data('name4')
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        let modal = $(this)
        modal.find('.modal-title').text('Editar ' + alias)
        modal.find('.modal-body #inputAlias').val(alias)
        modal.find('.modal-body #inputModelo').val(modelo)
        modal.find('.modal-body #inputLoc').val(loc)
        modal.find('.modal-body #inputIp').val(ip)

        activaBusquedaDropdown($('#dropdownBuscableGruposEdit'),
            (select) => Pmgr.globalState.groups.forEach(function (g) {
                if (!g.printers.includes(idPrinter)) {
                    select.append(`<option value="${g.id}">${g.name}</option>`)
                }
            })
        );

        $("#editPrinter").click(() => {
            let a = $("#inputAlias").val();
            let m = $("#inputModelo").val();
            let l = $("#inputLoc").val();
            let i = $("#inputIp").val();
            let addedGroups = $("#groupPrintersEdit").val();
            //TODO: LOS GRUPOS
            Pmgr.setPrinter({ id: idPrinter, alias: a, model: m, location: l, ip: i }).then(update());
            let arrayG = JSON.parse("[" + addedGroups + "]");

            Pmgr.globalState.groups.forEach(function (g) {
                if (arrayG.includes(g.id)) {
                    let array = g.printers;
                    array.push(idPrinter)
                    Pmgr.setGroup({ id: g.id, name: g.name, printers: array }).then(update());
                }
            })

        });

    })


    // Servidor a utilizar. También puedes lanzar tú el tuyo en local (instrucciones en Github)
    //const serverUrl = "http://localhost:8080/api/";
    const serverUrl = "http://gin.fdi.ucm.es:3128/api/";
    Pmgr.connect(serverUrl);

    // ejemplo de login
    Pmgr.login("g2", "thj02qm").then(d => {
        if (d !== undefined) {
            //Pmgr.populate(); -- genera datos de prueba, usar sólo 1 vez
            update();
            console.log("login ok!");
        } else {
            console.log(`error en login (revisa la URL: ${serverUrl}, y verifica que está vivo)`);
            console.log("Generando datos de ejemplo para uso en local...")

            Pmgr.populate();
            update();
        }
    });

});

/** APUNTES PROFE
 * Pmgr.addPrinter({alias:"hola"})
 * Pmgr.setPrinter({id:1, alias:"adios", location:"Casa"})
 * Pmgr.addGroup({name:"Todas"})
 * Pmgr.setGroup({id:1, name:"Todas", printers:[1]}) //array de ids
 * Pmgr.addJob({printer:"1", owner:"Francisco Lopez", filename:"algo.pdf"})
 * 
 * Pmgr.addPrinter({alias:"prueba"}).then(() => update())
 * 
 * $("#inputTitulo").click(() => {
 *      let alias = $("#inputTitulo").val();
 *      Pmgr.addPrinter({alias:alias}).then(d => update())
 * });
 */

// cosas que exponemos para usarlas desde la consola
window.populate = populate
window.Pmgr = Pmgr;
window.createPrinterItem = createPrinterItem

//window.update = update;// y sacar el update fuera
