// ============================================================
// SISTEMA DE GESTIÓN DE RESERVAS - ELECTRODOMÉSTICOS
// ============================================================

// ============================================================
// UTILIDADES DE STORAGE
// ============================================================
const Storage = {
    getClientes() {
        const data = localStorage.getItem('clientes');
        return data ? JSON.parse(data) : [];
    },
    saveClientes(clientes) {
        localStorage.setItem('clientes', JSON.stringify(clientes));
    },
    getTecnicos() {
        const data = localStorage.getItem('tecnicos');
        return data ? JSON.parse(data) : [];
    },
    saveTecnicos(tecnicos) {
        localStorage.setItem('tecnicos', JSON.stringify(tecnicos));
    },
    getReservas() {
        const data = localStorage.getItem('reservas');
        return data ? JSON.parse(data) : [];
    },
    saveReservas(reservas) {
        localStorage.setItem('reservas', JSON.stringify(reservas));
    },
    generarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// ============================================================
// UTILIDADES DE MENSAJES
// ============================================================
const Alert = {
    success(mensaje) {
        const successAlert = document.getElementById('successAlert');
        const successMessage = document.getElementById('successMessage');
        successMessage.textContent = mensaje;
        successAlert.classList.remove('hidden');
        setTimeout(() => successAlert.classList.add('hidden'), 4000);
    },
    error(mensaje) {
        const errorAlert = document.getElementById('errorAlert');
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = mensaje;
        errorAlert.classList.remove('hidden');
        setTimeout(() => errorAlert.classList.add('hidden'), 4000);
    }
};

// ============================================================
// FUNCIONES DE CLIENTES
// ============================================================
const Clientes = {
    agregar(nombre, telefono, correo) {
        // Validación
        if (!nombre.trim() || !telefono.trim() || !correo.trim()) {
            Alert.error('Todos los campos del cliente son obligatorios');
            return false;
        }
        if (!this.validarEmail(correo)) {
            Alert.error('El correo no es válido');
            return false;
        }

        const clientes = Storage.getClientes();
        const nuevoCliente = {
            id: Storage.generarId(),
            nombre: nombre.trim(),
            telefono: telefono.trim(),
            correo: correo.trim()
        };
        clientes.push(nuevoCliente);
        Storage.saveClientes(clientes);
        Alert.success(`Cliente "${nombre}" registrado correctamente`);
        return true;
    },
    validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },
    obtenerNombre(id) {
        const cliente = Storage.getClientes().find(c => c.id === id);
        return cliente ? cliente.nombre : 'Desconocido';
    },
    renderizar() {
        const clientes = Storage.getClientes();
        const tbody = document.getElementById('clientesTableBody');
        
        if (clientes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="px-4 py-3 text-center text-gray-500">No hay clientes registrados</td></tr>';
            return;
        }

        tbody.innerHTML = clientes.map(cliente => `
            <tr class="border-b hover:bg-gray-50">
                <td class="px-4 py-3">${cliente.nombre}</td>
                <td class="px-4 py-3">${cliente.telefono}</td>
                <td class="px-4 py-3">${cliente.correo}</td>
            </tr>
        `).join('');
    },
    actualizarSelect() {
        const select = document.getElementById('reservaCliente');
        const clientes = Storage.getClientes();
        const valor = select.value;
        
        select.innerHTML = '<option value="">Seleccionar cliente</option>';
        select.innerHTML += clientes.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
        select.value = valor;
    }
};

// ============================================================
// FUNCIONES DE TÉCNICOS
// ============================================================
const Tecnicos = {
    agregar(nombre, especialidad, telefono) {
        // Validación
        if (!nombre.trim() || !especialidad || !telefono.trim()) {
            Alert.error('Todos los campos del técnico son obligatorios');
            return false;
        }

        const tecnicos = Storage.getTecnicos();
        const nuevoTecnico = {
            id: Storage.generarId(),
            nombre: nombre.trim(),
            especialidad,
            telefono: telefono.trim()
        };
        tecnicos.push(nuevoTecnico);
        Storage.saveTecnicos(tecnicos);
        Alert.success(`Técnico "${nombre}" registrado correctamente`);
        return true;
    },
    obtenerNombre(id) {
        const tecnico = Storage.getTecnicos().find(t => t.id === id);
        return tecnico ? tecnico.nombre : 'Desconocido';
    },
    renderizar() {
        const tecnicos = Storage.getTecnicos();
        const tbody = document.getElementById('tecnicosTableBody');
        
        if (tecnicos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="px-4 py-3 text-center text-gray-500">No hay técnicos registrados</td></tr>';
            return;
        }

        tbody.innerHTML = tecnicos.map(tecnico => `
            <tr class="border-b hover:bg-gray-50">
                <td class="px-4 py-3">${tecnico.nombre}</td>
                <td class="px-4 py-3">${tecnico.especialidad}</td>
                <td class="px-4 py-3">${tecnico.telefono}</td>
            </tr>
        `).join('');
    },
    actualizarSelect() {
        const select = document.getElementById('reservaTecnico');
        const tecnicos = Storage.getTecnicos();
        const valor = select.value;
        
        select.innerHTML = '<option value="">Seleccionar técnico</option>';
        select.innerHTML += tecnicos.map(t => `<option value="${t.id}">${t.nombre} (${t.especialidad})</option>`).join('');
        select.value = valor;
    }
};

// ============================================================
// FUNCIONES DE RESERVAS
// ============================================================
const Reservas = {
    agregar(clienteId, tecnicoId, fecha, hora, descripcion) {
        // Validación de campos
        if (!clienteId || !tecnicoId || !fecha || !hora || !descripcion.trim()) {
            Alert.error('Todos los campos de la reserva son obligatorios');
            return false;
        }

        // Validación de fecha futura
        const fechaReserva = new Date(`${fecha}T${hora}`);
        const ahora = new Date();
        if (fechaReserva <= ahora) {
            Alert.error('La reserva debe ser en una fecha y hora futura');
            return false;
        }

        // Validación de conflictos de horario
        if (this.hayConflicto(tecnicoId, fecha, hora)) {
            Alert.error('El técnico ya tiene una reserva en esa fecha y hora');
            return false;
        }

        const reservas = Storage.getReservas();
        const nuevaReserva = {
            id: Storage.generarId(),
            clienteId,
            tecnicoId,
            fecha,
            hora,
            descripcion: descripcion.trim(),
            estado: 'activa'
        };
        reservas.push(nuevaReserva);
        Storage.saveReservas(reservas);
        Alert.success('Reserva agendada correctamente');
        return true;
    },
    hayConflicto(tecnicoId, fecha, hora) {
        const reservas = Storage.getReservas();
        return reservas.some(r => 
            r.tecnicoId === tecnicoId && 
            r.fecha === fecha && 
            r.hora === hora && 
            r.estado === 'activa'
        );
    },
    cancelar(reservaId) {
        const reservas = Storage.getReservas();
        const reserva = reservas.find(r => r.id === reservaId);
        if (reserva) {
            reserva.estado = 'cancelada';
            Storage.saveReservas(reservas);
            Alert.success('Reserva cancelada correctamente');
            this.renderizarFuturas();
            return true;
        }
        return false;
    },
    obtenerFuturas() {
        const reservas = Storage.getReservas();
        const ahora = new Date();
        return reservas
            .filter(r => {
                if (r.estado !== 'activa') return false;
                const fechaReserva = new Date(`${r.fecha}T${r.hora}`);
                return fechaReserva > ahora;
            })
            .sort((a, b) => {
                const fechaA = new Date(`${a.fecha}T${a.hora}`);
                const fechaB = new Date(`${b.fecha}T${b.hora}`);
                return fechaA - fechaB;
            });
    },
    renderizarFuturas() {
        const reservas = this.obtenerFuturas();
        const tbody = document.getElementById('reservasTableBody');
        
        if (reservas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="px-4 py-3 text-center text-gray-500">No hay reservas futuras</td></tr>';
            return;
        }

        tbody.innerHTML = reservas.map(reserva => {
            const clienteNombre = Clientes.obtenerNombre(reserva.clienteId);
            const tecnicoNombre = Tecnicos.obtenerNombre(reserva.tecnicoId);
            const fechaFormato = this.formatearFecha(reserva.fecha);
            
            return `
                <tr class="border-b hover:bg-gray-50">
                    <td class="px-4 py-3">${clienteNombre}</td>
                    <td class="px-4 py-3">${tecnicoNombre}</td>
                    <td class="px-4 py-3">${fechaFormato}</td>
                    <td class="px-4 py-3">${reserva.hora}</td>
                    <td class="px-4 py-3 max-w-xs truncate">${reserva.descripcion}</td>
                    <td class="px-4 py-3">
                        <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                            ${reserva.estado}
                        </span>
                    </td>
                    <td class="px-4 py-3">
                        <button onclick="Reservas.cancelar('${reserva.id}')" class="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-xs font-semibold transition">
                            Cancelar
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },
    formatearFecha(fecha) {
        const date = new Date(`${fecha}T00:00:00`);
        const opciones = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('es-ES', opciones);
    }
};

// ============================================================
// INICIALIZACIÓN Y EVENT LISTENERS
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar datos de ejemplo si no existen
    inicializarDatos();

    // Renderizar interfaz
    Clientes.renderizar();
    Tecnicos.renderizar();
    Clientes.actualizarSelect();
    Tecnicos.actualizarSelect();
    Reservas.renderizarFuturas();

    // Form de clientes
    document.getElementById('clienteForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = document.getElementById('clienteNombre').value;
        const telefono = document.getElementById('clienteTelefono').value;
        const correo = document.getElementById('clienteCorreo').value;
        
        if (Clientes.agregar(nombre, telefono, correo)) {
            document.getElementById('clienteForm').reset();
            Clientes.renderizar();
            Clientes.actualizarSelect();
        }
    });

    // Form de técnicos
    document.getElementById('tecnicoForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = document.getElementById('tecnicoNombre').value;
        const especialidad = document.getElementById('tecnicoEspecialidad').value;
        const telefono = document.getElementById('tecnicoTelefono').value;
        
        if (Tecnicos.agregar(nombre, especialidad, telefono)) {
            document.getElementById('tecnicoForm').reset();
            Tecnicos.renderizar();
            Tecnicos.actualizarSelect();
        }
    });

    // Form de reservas
    document.getElementById('reservaForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const clienteId = document.getElementById('reservaCliente').value;
        const tecnicoId = document.getElementById('reservaTecnico').value;
        const fecha = document.getElementById('reservaFecha').value;
        const hora = document.getElementById('reservaHora').value;
        const descripcion = document.getElementById('reservaDescripcion').value;
        
        if (Reservas.agregar(clienteId, tecnicoId, fecha, hora, descripcion)) {
            document.getElementById('reservaForm').reset();
            Reservas.renderizarFuturas();
        }
    });

    // Navigation de tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            mostrarTab(tabName);
        });
    });
});

function mostrarTab(tabName) {
    // Ocultar todos los tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });

    // Mostrar tab seleccionado
    document.getElementById(tabName).classList.remove('hidden');

    // Actualizar estilos de botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'text-blue-600', 'border-b-2', 'border-blue-600');
        btn.classList.add('text-gray-600', 'border-transparent');
    });
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active', 'text-blue-600', 'border-b-2', 'border-blue-600');
    document.querySelector(`[data-tab="${tabName}"]`).classList.remove('text-gray-600', 'border-transparent');

    // Actualizar datos cuando se abre la tab de listar
    if (tabName === 'listar') {
        Reservas.renderizarFuturas();
    }
}

function inicializarDatos() {
    // Solo agregar datos de ejemplo si no hay datos previos
    if (Storage.getClientes().length === 0) {
        const clientesEjemplo = [
            { id: Storage.generarId(), nombre: 'Ana Martínez', telefono: '3001234567', correo: 'ana@example.com' },
            { id: Storage.generarId(), nombre: 'Roberto García', telefono: '3102345678', correo: 'roberto@example.com' },
            { id: Storage.generarId(), nombre: 'Sofía López', telefono: '3203456789', correo: 'sofia@example.com' }
        ];
        Storage.saveClientes(clientesEjemplo);
    }

    if (Storage.getTecnicos().length === 0) {
        const tecnicosEjemplo = [
            { id: Storage.generarId(), nombre: 'Juan Rodríguez', especialidad: 'Neveras', telefono: '3011111111' },
            { id: Storage.generarId(), nombre: 'Pedro Sánchez', especialidad: 'Lavadoras', telefono: '3022222222' },
            { id: Storage.generarId(), nombre: 'Carmen Díaz', especialidad: 'General', telefono: '3033333333' }
        ];
        Storage.saveTecnicos(tecnicosEjemplo);
    }

    if (Storage.getReservas().length === 0) {
        const mañana = new Date();
        mañana.setDate(mañana.getDate() + 1);
        const fechaMañana = mañana.toISOString().split('T')[0];

        const clientesEjemplo = Storage.getClientes();
        const tecnicosEjemplo = Storage.getTecnicos();

        if (clientesEjemplo.length > 0 && tecnicosEjemplo.length > 0) {
            const reservasEjemplo = [
                {
                    id: Storage.generarId(),
                    clienteId: clientesEjemplo[0].id,
                    tecnicoId: tecnicosEjemplo[0].id,
                    fecha: fechaMañana,
                    hora: '10:00',
                    descripcion: 'Revisión general de nevera',
                    estado: 'activa'
                }
            ];
            Storage.saveReservas(reservasEjemplo);
        }
    }
}
