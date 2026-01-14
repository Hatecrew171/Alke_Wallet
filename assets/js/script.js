$(document).ready(function () {
    // --- 1. INICIALIZACIÓN ---
    if (!localStorage.getItem('balance')) {
        localStorage.setItem('balance', '5000');
        localStorage.setItem('history', JSON.stringify([{ tipo: 'deposito', monto: 5000, fecha: new Date().toLocaleString(), desc: 'Saldo inicial' }]));
        localStorage.setItem('contacts', JSON.stringify([
            { nombre: 'Juan Pérez', rut: '12.345.678-9' },
            { nombre: 'María López', rut: '18.765.432-1' }
        ]));
    }

    const fmt = (num) => parseFloat(num).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });

    // --- 2. LOGIN ---
    $('#loginForm').submit(function (e) {
        e.preventDefault();
        if ($('#username').val() === "admin" && $('#password').val() === "12345") {
            window.location.href = 'menu.html';
        } else {
            $('#alert-container').html('<div class="alert alert-danger p-2 small">Usuario o clave incorrecta</div>');
        }
    });

    // --- 3. DASHBOARD ---
    if ($('#balanceDisplay').length) {
        $('#balanceDisplay').text(fmt(localStorage.getItem('balance')));
        $('.btn-nav').click(function () {
            $('#redirectMsg').text(`Abriendo ${$(this).data('name')}...`).fadeIn();
            setTimeout(() => { window.location.href = $(this).data('target'); }, 800);
        });
    }

    // --- 4. DEPÓSITO ---
    if ($('#depositForm').length) {
        $('#currentBalance').text(fmt(localStorage.getItem('balance')));
        $('#depositForm').submit(function (e) {
            e.preventDefault();
            const monto = parseFloat($('#amount').val());
            if (monto > 0) {
                const nuevoSaldo = parseFloat(localStorage.getItem('balance')) + monto;
                localStorage.setItem('balance', nuevoSaldo);
                let history = JSON.parse(localStorage.getItem('history'));
                history.push({ tipo: 'deposito', monto: monto, fecha: new Date().toLocaleString(), desc: 'Depósito Alke' });
                localStorage.setItem('history', JSON.stringify(history));
                $('#confirmacionMonto').text(`Depositaste ${fmt(monto)}`).fadeIn();
                setTimeout(() => { window.location.href = 'menu.html'; }, 1500);
            }
        });
    }

    // --- 5. ENVIAR DINERO ---
    if ($('#sendContainer').length) {
        $('#btnNuevoC').click(() => $('#formContacto').slideDown());
        $('#btnCancelarC').click(() => $('#formContacto').slideUp());

        const cargarContactos = (filtro = "") => {
            const lista = JSON.parse(localStorage.getItem('contacts')) || [];
            let options = '<option value="" disabled selected>Selecciona destinatario</option>';
            lista.filter(c => c.nombre.toLowerCase().includes(filtro.toLowerCase())).forEach(c => {
                options += `<option value="${c.nombre}">${c.nombre} (RUT: ${c.rut})</option>`;
            });
            $('#selectContacto').html(options);
        };
        cargarContactos();

        $('#searchContact').keyup(function() { cargarContactos($(this).val()); });

        $('#newContactForm').on('submit', function(e) {
            e.preventDefault();
            let lista = JSON.parse(localStorage.getItem('contacts')) || [];
            lista.push({ nombre: $('#nomC').val(), rut: $('#rutC').val() });
            localStorage.setItem('contacts', JSON.stringify(lista));
            alert("Contacto guardado");
            this.reset();
            $('#formContacto').slideUp();
            cargarContactos();
        });

        $('#selectContacto').change(() => $('#seccionMonto').removeClass('d-none'));

        $('#btnTransferir').click(function() {
            const monto = parseFloat($('#montoEnvio').val());
            const saldo = parseFloat(localStorage.getItem('balance'));
            if (monto > 0 && monto <= saldo) {
                localStorage.setItem('balance', saldo - monto);
                let history = JSON.parse(localStorage.getItem('history'));
                history.push({ tipo: 'transferencia', monto: monto, fecha: new Date().toLocaleString(), desc: `A: ${$('#selectContacto').val()}` });
                localStorage.setItem('history', JSON.stringify(history));
                $('#msgExito').text("Transferencia Realizada").fadeIn();
                setTimeout(() => window.location.href = 'menu.html', 1500);
            } else { alert("Saldo insuficiente."); }
        });
    }

    // --- 6. HISTORIAL ---
    if ($('#tablaTransacciones').length) {
        const render = (filtro) => {
            const history = JSON.parse(localStorage.getItem('history')) || [];
            let rows = '';
            history.filter(t => filtro === 'todos' || t.tipo === filtro).reverse().forEach(t => {
                rows += `<tr><td>${t.fecha.split(',')[0]}</td><td class="small">${t.tipo}</td><td>${t.desc}</td><td class="${t.tipo === 'deposito' ? 'text-success' : 'text-danger'} fw-bold">${fmt(t.monto)}</td></tr>`;
            });
            $('#tablaTransacciones').html(rows);
        };
        render('todos');
        $('#filtroTipo').change(function() { render($(this).val()); });
    }

    $('.logout').click(function() { if(confirm("¿Cerrar sesión?")) window.location.href = 'index.html'; });
});