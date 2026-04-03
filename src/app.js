import { 
    db, 
    getDocs, 
    query, 
    where, 
    updateDoc, 
    doc
} from "./firebase.js";

import { collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";


// ============================================================
// SISTEMA DE GESTIÓN DE RESERVAS - ELECTRODOMÉSTICOS
// ============================================================

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
// VALIDACIONES CENTRALIZADAS
// ============================================================
const Validaciones = {
    validarNombreBasico(nombre) {
        if (!nombre || !nombre.trim()) {
            return { valido: false, mensaje: 'El nombre es obligatorio y no puede estar vacío' };
        }
        if (nombre.trim().length < 2) {
            return { valido: false, mensaje: 'El nombre debe tener al menos 2 caracteres' };
        }
        return { valido: true };
    },

    validarTelefono(telefono) {
        if (!telefono || !telefono.trim()) {
            return { valido: false, mensaje: 'El teléfono es obligatorio' };
        }
        
        const telefonoLimpio = telefono.trim();
        
        // Validar que solo contenga números (y opcionalmente + al inicio)
        if (!/^\+?[0-9]+$/.test(telefonoLimpio)) {
            return { valido: false, mensaje: 'El teléfono solo puede contener números' };
        }
        
        // Validar largo (8-12 dígitos)
        const soloNumeros = telefonoLimpio.replace(/\D/g, '');
        if (soloNumeros.length < 8 || soloNumeros.length > 12) {
            return { valido: false, mensaje: 'El teléfono debe tener entre 8 y 12 dígitos' };
        }
        
        return { valido: true };
    },

    validarEmail(email) {
        if (!email || !email.trim()) {
            return { valido: false, mensaje: 'El correo es obligatorio' };
        }
        
        const correoLimpio = email.trim();
        
        // Validar formato de email (debe contener @ y un dominio válido)
        const regexEmail = /^[^\s@]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!regexEmail.test(correoLimpio)) {
            return { valido: false, mensaje: 'El correo debe tener un formato válido (ej: usuario@dominio.com)' };
        }
        
        return { valido: true };
    },

    validarEspecialidad(especialidad) {
        if (!especialidad || !especialidad.trim()) {
            return { valido: false, mensaje: 'La especialidad es obligatoria' };
        }
        return { valido: true };
    },

    validarDescripcion(descripcion) {
        if (!descripcion || !descripcion.trim()) {
            return { valido: false, mensaje: 'La descripción del problema es obligatoria' };
        }
        if (descripcion.trim().length < 5) {
            return { valido: false, mensaje: 'La descripción debe tener al menos 5 caracteres' };
        }
        return { valido: true };
    },

    validarFechaFutura(fechaStr, horaStr) {
        if (!fechaStr || !horaStr) {
            return { valido: false, mensaje: 'La fecha y hora son obligatorias' };
        }
        
        const fechaReserva = new Date(`${fechaStr}T${horaStr}`);
        const ahora = new Date();
        
        // Agregar un pequeño margen (1 minuto) para evitar problemas de timezone
        ahora.setMinutes(ahora.getMinutes() + 1);
        
        if (fechaReserva <= ahora) {
            return { valido: false, mensaje: 'La fecha y hora deben ser futuras' };
        }
        
        return { valido: true };
    },

    validarFecha(fechaStr) {
        if (!fechaStr) {
            return { valido: false, mensaje: 'La fecha es obligatoria' };
        }
        return { valido: true };
    },

    validarHora(horaStr) {
        if (!horaStr) {
            return { valido: false, mensaje: 'La hora es obligatoria' };
        }
        return { valido: true };
    },

    validarSinConflictoDeTecnico(tecnicoId, fecha, hora, reservasExistentes, excludeReservaId = null) {
        const conflicto = reservasExistentes.some(r => 
            r.tecnicoId === tecnicoId && 
            r.fecha === fecha && 
            r.hora === hora &&
            r.estado === 'disponible' &&
            r.id !== excludeReservaId
        );
        
        if (conflicto) {
            return { valido: false, mensaje: 'El técnico ya tiene una reserva disponible en esa fecha y hora' };
        }
        
        return { valido: true };
    },

    validarSinConflictoDeCliente(clienteId, fecha, hora, reservasExistentes, excludeReservaId = null) {
        const conflicto = reservasExistentes.some(r => 
            r.clienteId === clienteId && 
            r.fecha === fecha && 
            r.hora === hora && 
            r.estado === 'activa' &&
            r.id !== excludeReservaId
        );
        
        if (conflicto) {
            return { valido: false, mensaje: 'Ya tienes una reserva activa en ese horario' };
        }
        
        return { valido: true };
    }
};

// Cache en memoria para optimizar
let clientesCache = [];
let tecnicosCache = [];
let reservasCache = [];

// ============================================================
// FUNCIONES DE CLIENTES
// ============================================================
const Clientes = {
    async agregar(nombre, telefono, correo) {
        // Validar nombre
        let validacion = Validaciones.validarNombreBasico(nombre);
        if (!validacion.valido) {
            Alert.error(validacion.mensaje);
            return false;
        }

        // Validar teléfono
        validacion = Validaciones.validarTelefono(telefono);
        if (!validacion.valido) {
            Alert.error(validacion.mensaje);
            return false;
        }

        // Validar correo
        validacion = Validaciones.validarEmail(correo);
        if (!validacion.valido) {
            Alert.error(validacion.mensaje);
            return false;
        }

        // Validar correo único
        const correoExistente = await this.buscarPorCorreo(correo);
        if (correoExistente) {
            Alert.error('El correo ya está registrado');
            return false;
        }

        try {
            await addDoc(collection(db, 'clientes'), {
                nombre: nombre.trim(),
                telefono: telefono.trim(),
                correo: correo.trim()
            });
            Alert.success(`Cliente "${nombre.trim()}" registrado correctamente`);
            await this.cargar();
            this.renderizar();
            this.actualizarSelect();
            return true;
        } catch (error) {
            console.error('Error al agregar cliente:', error);
            Alert.error('Error al registrar cliente');
            return false;
        }
    },

    async buscarPorCorreo(correo) {
        try {
            const q = query(collection(db, 'clientes'), where('correo', '==', correo));
            const snapshot = await getDocs(q);
            return !snapshot.empty;
        } catch (error) {
            console.error('Error al buscar correo:', error);
            return false;
        }
    },

    async cargar() {
        try {
            const snapshot = await getDocs(collection(db, 'clientes'));
            clientesCache = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error al cargar clientes:', error);
            clientesCache = [];
        }
    },

    obtenerNombre(id) {
        const cliente = clientesCache.find(c => c.id === id);
        return cliente ? cliente.nombre : 'Desconocido';
    },

    renderizar() {
        const tbody = document.getElementById('clientesTableBody');
        
        if (clientesCache.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="px-4 py-3 text-center text-gray-500">No hay clientes registrados</td></tr>';
            return;
        }

        tbody.innerHTML = clientesCache.map(cliente => `
            <tr class="border-b hover:bg-gray-50">
                <td class="px-4 py-3">${cliente.nombre}</td>
                <td class="px-4 py-3">${cliente.telefono}</td>
                <td class="px-4 py-3">${cliente.correo}</td>
            </tr>
        `).join('');
    },

    actualizarSelect() {
        const selectReserva = document.getElementById('reservaCliente');
        const selectTomar = document.getElementById('tomarReservaCliente');
        
        let valorReserva = '';
        let valorTomar = '';
        
        if (selectReserva) {
            valorReserva = selectReserva.value;
            selectReserva.innerHTML = '<option value="">Seleccionar cliente</option>';
            selectReserva.innerHTML += clientesCache.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
            selectReserva.value = valorReserva;
        }
        
        if (selectTomar) {
            valorTomar = selectTomar.value;
            selectTomar.innerHTML = '<option value="">Seleccionar cliente</option>';
            selectTomar.innerHTML += clientesCache.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
            selectTomar.value = valorTomar;
        }
    }
};

// ============================================================
// FUNCIONES DE TÉCNICOS
// ============================================================
const Tecnicos = {
    async agregar(nombre, especialidad, telefono) {
        // Validar nombre
        let validacion = Validaciones.validarNombreBasico(nombre);
        if (!validacion.valido) {
            Alert.error(validacion.mensaje);
            return false;
        }

        // Validar especialidad
        validacion = Validaciones.validarEspecialidad(especialidad);
        if (!validacion.valido) {
            Alert.error(validacion.mensaje);
            return false;
        }

        // Validar teléfono
        validacion = Validaciones.validarTelefono(telefono);
        if (!validacion.valido) {
            Alert.error(validacion.mensaje);
            return false;
        }

        try {
            await addDoc(collection(db, 'tecnicos'), {
                nombre: nombre.trim(),
                especialidad,
                telefono: telefono.trim()
            });
            Alert.success(`Técnico "${nombre.trim()}" registrado correctamente`);
            await this.cargar();
            this.renderizar();
            this.actualizarSelect();
            return true;
        } catch (error) {
            console.error('Error al agregar técnico:', error);
            Alert.error('Error al registrar técnico');
            return false;
        }
    },

    async cargar() {
        try {
            const snapshot = await getDocs(collection(db, 'tecnicos'));
            tecnicosCache = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error al cargar técnicos:', error);
            tecnicosCache = [];
        }
    },

    obtenerNombre(id) {
        const tecnico = tecnicosCache.find(t => t.id === id);
        return tecnico ? tecnico.nombre : 'Desconocido';
    },

    obtenerEspecialidad(id) {
        const tecnico = tecnicosCache.find(t => t.id === id);
        return tecnico ? tecnico.especialidad : 'Desconocida';
    },

    renderizar() {
        const tbody = document.getElementById('tecnicosTableBody');
        
        if (tecnicosCache.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="px-4 py-3 text-center text-gray-500">No hay técnicos registrados</td></tr>';
            return;
        }

        tbody.innerHTML = tecnicosCache.map(tecnico => `
            <tr class="border-b hover:bg-gray-50">
                <td class="px-4 py-3">${tecnico.nombre}</td>
                <td class="px-4 py-3">${tecnico.especialidad}</td>
                <td class="px-4 py-3">${tecnico.telefono}</td>
            </tr>
        `).join('');
    },

    actualizarSelect() {
        const selectReserva = document.getElementById('reservaTecnico');
        const selectCrear = document.getElementById('tecnicoCrearReserva');
        
        let valorReserva = '';
        let valorCrear = '';
        
        if (selectReserva) {
            valorReserva = selectReserva.value;
            selectReserva.innerHTML = '<option value="">Seleccionar técnico</option>';
            selectReserva.innerHTML += tecnicosCache.map(t => `<option value="${t.id}">${t.nombre} (${t.especialidad})</option>`).join('');
            selectReserva.value = valorReserva;
        }
        
        if (selectCrear) {
            valorCrear = selectCrear.value;
            selectCrear.innerHTML = '<option value="">Seleccionar técnico</option>';
            selectCrear.innerHTML += tecnicosCache.map(t => `<option value="${t.id}">${t.nombre}</option>`).join('');
            selectCrear.value = valorCrear;
        }
    }
};

// ============================================================
// FUNCIONES DE RESERVAS
// ============================================================
const Reservas = {
    async crearDisponible(tecnicoId, fecha, hora, descripcion) {
        // Validar técnico
        if (!tecnicoId) {
            Alert.error('Debe seleccionar un técnico');
            return false;
        }

        // Validar fecha
        let validacion = Validaciones.validarFecha(fecha);
        if (!validacion.valido) {
            Alert.error(validacion.mensaje);
            return false;
        }

        // Validar hora
        validacion = Validaciones.validarHora(hora);
        if (!validacion.valido) {
            Alert.error(validacion.mensaje);
            return false;
        }

        // Validar fecha/hora futura
        validacion = Validaciones.validarFechaFutura(fecha, hora);
        if (!validacion.valido) {
            Alert.error(validacion.mensaje);
            return false;
        }

        // Validar descripción
        validacion = Validaciones.validarDescripcion(descripcion);
        if (!validacion.valido) {
            Alert.error(validacion.mensaje);
            return false;
        }

        // Validar no haya conflicto de técnico
        validacion = Validaciones.validarSinConflictoDeTecnico(tecnicoId, fecha, hora, reservasCache);
        if (!validacion.valido) {
            Alert.error(validacion.mensaje);
            return false;
        }

        try {
            await addDoc(collection(db, 'reservas'), {
                tecnicoId,
                fecha,
                hora,
                descripcion: descripcion.trim(),
                estado: 'disponible',
                fechaCreacion: new Date()
            });
            Alert.success('Reserva disponible creada correctamente');
            await this.cargar();
            this.renderizarDisponibles();
            Reservas.renderizarFormulario();
            return true;
        } catch (error) {
            console.error('Error al crear reserva:', error);
            Alert.error('Error al crear reserva');
            return false;
        }
    },

    async tomarDisponible(reservaId, clienteId) {
        // Validar cliente y reserva requeridos
        if (!clienteId) {
            Alert.error('Debe seleccionar un cliente');
            return false;
        }

        if (!reservaId) {
            Alert.error('Debe seleccionar una reserva disponible');
            return false;
        }

        // Obtener reserva
        const reserva = reservasCache.find(r => r.id === reservaId);
        if (!reserva) {
            Alert.error('Reserva no encontrada');
            return false;
        }

        if (reserva.estado !== 'disponible') {
            Alert.error('La reserva ya no está disponible');
            return false;
        }

        // Validar cliente no tiene otra reserva activa en mismo horario
        const validacion = Validaciones.validarSinConflictoDeCliente(clienteId, reserva.fecha, reserva.hora, reservasCache);
        if (!validacion.valido) {
            Alert.error(validacion.mensaje);
            return false;
        }

        try {
            await updateDoc(doc(db, 'reservas', reservaId), {
                clienteId,
                estado: 'activa'
            });

            Alert.success('Reserva tomada correctamente');
            await this.cargar();
            this.renderizarFuturas();
            this.renderizarDisponibles();
            this.renderizarFormulario();
            return true;
        } catch (error) {
            console.error('Error al tomar reserva:', error);
            Alert.error('Error al tomar reserva');
            return false;
        }
    },

    async cancelar(reservaId) {
        try {
            const reserva = reservasCache.find(r => r.id === reservaId);
            if (!reserva) {
                Alert.error('Reserva no encontrada');
                return false;
            }

            // Actualizar reserva a disponible (vuelve a estar disponible)
            await updateDoc(doc(db, 'reservas', reservaId), {
                estado: 'disponible',
                clienteId: null
            });

            Alert.success('Reserva cancelada correctamente');
            await this.cargar();
            this.renderizarFuturas();
            this.renderizarDisponibles();
            this.renderizarFormulario();
            return true;
        } catch (error) {
            console.error('Error al cancelar reserva:', error);
            Alert.error('Error al cancelar reserva');
            return false;
        }
    },

    async cargar() {
        try {
            const snapshot = await getDocs(collection(db, 'reservas'));
            reservasCache = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error al cargar reservas:', error);
            reservasCache = [];
        }
    },

    obtenerDisponibles() {
        const ahora = new Date();
        return reservasCache
            .filter(r => {
                if (r.estado !== 'disponible') return false;
                const fechaReserva = new Date(`${r.fecha}T${r.hora}`);
                return fechaReserva > ahora;
            })
            .sort((a, b) => {
                const fechaA = new Date(`${a.fecha}T${a.hora}`);
                const fechaB = new Date(`${b.fecha}T${b.hora}`);
                return fechaA - fechaB;
            });
    },

    obtenerFuturas() {
        const ahora = new Date();
        return reservasCache
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

    renderizarDisponibles() {
        const disponibles = this.obtenerDisponibles();
        const tbody = document.getElementById('disponiblesTableBody');
        
        if (disponibles.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="px-4 py-3 text-center text-gray-500">No hay reservas disponibles</td></tr>';
            return;
        }

        tbody.innerHTML = disponibles.map(reserva => {
            const tecnicoNombre = Tecnicos.obtenerNombre(reserva.tecnicoId);
            const tecnicoEspecialidad = Tecnicos.obtenerEspecialidad(reserva.tecnicoId);
            const fechaFormato = this.formatearFecha(reserva.fecha);
            
            return `
                <tr class="border-b hover:bg-gray-50">
                    <td class="px-4 py-3">${tecnicoNombre}</td>
                    <td class="px-4 py-3">${tecnicoEspecialidad}</td>
                    <td class="px-4 py-3">${fechaFormato}</td>
                    <td class="px-4 py-3">${reserva.hora}</td>
                    <td class="px-4 py-3 max-w-xs truncate">${reserva.descripcion}</td>
                </tr>
            `;
        }).join('');
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

    renderizarFormulario() {
        const disponibles = this.obtenerDisponibles();
        const select = document.getElementById('reservaDisponible');
        
        if (!select) return;
        
        select.innerHTML = '<option value="">Seleccionar reserva</option>';
        
        if (disponibles.length === 0) {
            select.innerHTML += '<option disabled>No hay reservas disponibles</option>';
            return;
        }

        select.innerHTML += disponibles.map(r => {
            const tecnicoNombre = Tecnicos.obtenerNombre(r.tecnicoId);
            const tecnicoEspecialidad = Tecnicos.obtenerEspecialidad(r.tecnicoId);
            const fechaFormato = this.formatearFecha(r.fecha);
            return `<option value="${r.id}">${tecnicoNombre} (${tecnicoEspecialidad}) - ${fechaFormato} ${r.hora}</option>`;
        }).join('');
    },

    formatearFecha(fecha) {
        const date = new Date(`${fecha}T00:00:00`);
        const opciones = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('es-ES', opciones);
    }
};

// ============================================================
// FUNCIÓN AUXILIAR PARA CAMBIAR TABS
// ============================================================
function mostrarTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });

    document.getElementById(tabName).classList.remove('hidden');

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'text-blue-600', 'border-b-2', 'border-blue-600');
        btn.classList.add('text-gray-600', 'border-transparent');
    });
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active', 'text-blue-600', 'border-b-2', 'border-blue-600');
    document.querySelector(`[data-tab="${tabName}"]`).classList.remove('text-gray-600', 'border-transparent');

    if (tabName === 'listar') {
        Reservas.renderizarFuturas();
    } else if (tabName === 'reservar') {
        Reservas.renderizarFormulario();
    } else if (tabName === 'crear') {
        Reservas.renderizarDisponibles();
    }
}

// ============================================================
// INICIALIZACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Cargar datos de Firestore
        await Clientes.cargar();
        await Tecnicos.cargar();
        await Reservas.cargar();

        // Renderizar interfaz
        Clientes.renderizar();
        Tecnicos.renderizar();
        Reservas.renderizarDisponibles();
        Clientes.actualizarSelect();
        Tecnicos.actualizarSelect();
        Reservas.renderizarFuturas();
        Reservas.renderizarFormulario();

        // Form de clientes
        document.getElementById('clienteForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre = document.getElementById('clienteNombre').value;
            const telefono = document.getElementById('clienteTelefono').value;
            const correo = document.getElementById('clienteCorreo').value;
            
            if (await Clientes.agregar(nombre, telefono, correo)) {
                document.getElementById('clienteForm').reset();
            }
        });

        // Form de técnicos
        document.getElementById('tecnicoForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre = document.getElementById('tecnicoNombre').value;
            const especialidad = document.getElementById('tecnicoEspecialidad').value;
            const telefono = document.getElementById('tecnicoTelefono').value;
            
            if (await Tecnicos.agregar(nombre, especialidad, telefono)) {
                document.getElementById('tecnicoForm').reset();
            }
        });

        // Form de creación de reservas disponibles (técnicos)
        document.getElementById('crearReservaForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const tecnicoId = document.getElementById('tecnicoCrearReserva').value;
            const fecha = document.getElementById('crearReservaFecha').value;
            const hora = document.getElementById('crearReservaHora').value;
            const descripcion = document.getElementById('crearReservaDescripcion').value;
            
            if (await Reservas.crearDisponible(tecnicoId, fecha, hora, descripcion)) {
                document.getElementById('crearReservaForm').reset();
            }
        });

        // Form de toma de reservas (clientes)
        document.getElementById('tomarReservaForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const clienteId = document.getElementById('tomarReservaCliente').value;
            const reservaId = document.getElementById('reservaDisponible').value;
            
            if (await Reservas.tomarDisponible(reservaId, clienteId)) {
                document.getElementById('tomarReservaForm').reset();
            }
        });

        // Navigation de tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                mostrarTab(tabName);
            });
        });

        console.log('✅ Aplicación iniciada correctamente');
    } catch (error) {
        console.error('Error durante la inicialización:', error);
        Alert.error('Error al inicializar la aplicación');
    }
});


async function testFirebase() {
  try {
    await addDoc(collection(db, "test"), {
      mensaje: "ok",
      fecha: new Date().toISOString()
    });
    console.log("🔥 Firebase funciona");
  } catch (error) {
    console.error("❌ Firebase error:", error);
  }
}

testFirebase();