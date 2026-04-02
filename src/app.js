import { 
    db, 
    //collection, 
    //addDoc, 
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

// Cache en memoria para optimizar
let clientesCache = [];
let tecnicosCache = [];
let disponibilidadesCache = [];
let reservasCache = [];

// ============================================================
// FUNCIONES DE CLIENTES
// ============================================================
const Clientes = {
    async agregar(nombre, telefono, correo) {
        // Validación
        if (!nombre.trim() || !telefono.trim() || !correo.trim()) {
            Alert.error('Todos los campos del cliente son obligatorios');
            return false;
        }
        if (!this.validarEmail(correo)) {
            Alert.error('El correo no es válido');
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
            Alert.success(`Cliente "${nombre}" registrado correctamente`);
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

    validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
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
        const select = document.getElementById('reservaCliente');
        const valor = select.value;
        
        select.innerHTML = '<option value="">Seleccionar cliente</option>';
        select.innerHTML += clientesCache.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
        select.value = valor;
    }
};

// ============================================================
// FUNCIONES DE TÉCNICOS
// ============================================================
const Tecnicos = {
    async agregar(nombre, especialidad, telefono) {
        // Validación
        if (!nombre.trim() || !especialidad || !telefono.trim()) {
            Alert.error('Todos los campos del técnico son obligatorios');
            return false;
        }

        try {
            await addDoc(collection(db, 'tecnicos'), {
                nombre: nombre.trim(),
                especialidad,
                telefono: telefono.trim()
            });
            Alert.success(`Técnico "${nombre}" registrado correctamente`);
            await this.cargar();
            this.renderizar();
            this.actualizarSelect();
            this.actualizarSelectDisponibilidad();
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
        const select = document.getElementById('reservaTecnico');
        if (!select) return;
        const valor = select.value;
        
        select.innerHTML = '<option value="">Seleccionar técnico</option>';
        select.innerHTML += tecnicosCache.map(t => `<option value="${t.id}">${t.nombre} (${t.especialidad})</option>`).join('');
        select.value = valor;
    },

    actualizarSelectDisponibilidad() {
        const select = document.getElementById('tecnicoDisponibilidad');
        if (!select) return;
        const valor = select.value;
        
        select.innerHTML = '<option value="">Seleccionar técnico</option>';
        select.innerHTML += tecnicosCache.map(t => `<option value="${t.id}">${t.nombre}</option>`).join('');
        select.value = valor;
    }
};

// ============================================================
// FUNCIONES DE DISPONIBILIDADES
// ============================================================
const Disponibilidades = {
    async agregar(tecnicoId, fecha, hora) {
        // Validación
        if (!tecnicoId || !fecha || !hora) {
            Alert.error('Todos los campos son obligatorios');
            return false;
        }

        // Validar fecha/hora futura
        const fechaDisp = new Date(`${fecha}T${hora}`);
        const ahora = new Date();
        if (fechaDisp <= ahora) {
            Alert.error('La disponibilidad debe ser en fecha y hora futura');
            return false;
        }

        // Validar no haya conflicto (no permitir dos disponibilidades en mismo horario)
        const conflicto = disponibilidadesCache.some(d => 
            d.tecnicoId === tecnicoId && 
            d.fecha === fecha && 
            d.hora === hora
        );
        if (conflicto) {
            Alert.error('El técnico ya tiene una disponibilidad en esa fecha y hora');
            return false;
        }

        try {
            await addDoc(collection(db, 'disponibilidades'), {
                tecnicoId,
                fecha,
                hora,
                estado: 'disponible',
                fechaCreacion: new Date()
            });
            Alert.success('Disponibilidad creada correctamente');
            await this.cargar();
            this.renderizar();
            return true;
        } catch (error) {
            console.error('Error al agregar disponibilidad:', error);
            Alert.error('Error al crear disponibilidad');
            return false;
        }
    },

    async cargar() {
        try {
            const snapshot = await getDocs(collection(db, 'disponibilidades'));
            disponibilidadesCache = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error al cargar disponibilidades:', error);
            disponibilidadesCache = [];
        }
    },

    obtenerDisponibles() {
        const ahora = new Date();
        return disponibilidadesCache
            .filter(d => {
                if (d.estado !== 'disponible') return false;
                const fechaDisp = new Date(`${d.fecha}T${d.hora}`);
                return fechaDisp > ahora;
            })
            .sort((a, b) => {
                const fechaA = new Date(`${a.fecha}T${a.hora}`);
                const fechaB = new Date(`${b.fecha}T${b.hora}`);
                return fechaA - fechaB;
            });
    },

    renderizar() {
        const disponibles = this.obtenerDisponibles();
        const tbody = document.getElementById('disponibilidadesTableBody');
        
        if (disponibles.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="px-4 py-3 text-center text-gray-500">No hay disponibilidades registradas</td></tr>';
            return;
        }

        tbody.innerHTML = disponibles.map(disp => {
            const tecnicoNombre = Tecnicos.obtenerNombre(disp.tecnicoId);
            const tecnicoEspecialidad = Tecnicos.obtenerEspecialidad(disp.tecnicoId);
            const fechaFormato = this.formatearFecha(disp.fecha);
            
            return `
                <tr class="border-b hover:bg-gray-50">
                    <td class="px-4 py-3">${tecnicoNombre}</td>
                    <td class="px-4 py-3">${tecnicoEspecialidad}</td>
                    <td class="px-4 py-3">${fechaFormato}</td>
                    <td class="px-4 py-3">${disp.hora}</td>
                    <td class="px-4 py-3">
                        <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                            ${disp.estado}
                        </span>
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
// FUNCIONES DE RESERVAS
// ============================================================
const Reservas = {
    async crearDesdeDisponibilidad(clienteId, disponibilidadId, descripcion) {
        // Validación
        if (!clienteId || !disponibilidadId || !descripcion.trim()) {
            Alert.error('Todos los campos son obligatorios');
            return false;
        }

        // Obtener disponibilidad
        const disponibilidad = disponibilidadesCache.find(d => d.id === disponibilidadId);
        if (!disponibilidad) {
            Alert.error('Disponibilidad no encontrada');
            return false;
        }

        if (disponibilidad.estado !== 'disponible') {
            Alert.error('La disponibilidad ya está reservada');
            return false;
        }

        // Validar cliente no tiene otra reserva en mismo horario
        const conflicto = reservasCache.some(r => 
            r.clienteId === clienteId && 
            r.fecha === disponibilidad.fecha && 
            r.hora === disponibilidad.hora && 
            r.estado === 'activa'
        );
        if (conflicto) {
            Alert.error('Ya tienes una reserva en ese horario');
            return false;
        }

        try {
            // Crear reserva
            await addDoc(collection(db, 'reservas'), {
                clienteId,
                tecnicoId: disponibilidad.tecnicoId,
                fecha: disponibilidad.fecha,
                hora: disponibilidad.hora,
                descripcion: descripcion.trim(),
                estado: 'activa',
                disponibilidadId,
                fechaCreacion: new Date()
            });

            // Actualizar disponibilidad a reservada
            await updateDoc(doc(db, 'disponibilidades', disponibilidadId), {
                estado: 'reservado'
            });

            Alert.success('Reserva creada correctamente');
            await this.cargar();
            await Disponibilidades.cargar();
            this.renderizarFuturas();
            Disponibilidades.renderizar();
            return true;
        } catch (error) {
            console.error('Error al crear reserva:', error);
            Alert.error('Error al crear reserva');
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

            // Actualizar reserva a cancelada
            await updateDoc(doc(db, 'reservas', reservaId), {
                estado: 'cancelada'
            });

            // Si existe disponibilidad asociada, volver a disponible
            if (reserva.disponibilidadId) {
                await updateDoc(doc(db, 'disponibilidades', reserva.disponibilidadId), {
                    estado: 'disponible'
                });
            }

            Alert.success('Reserva cancelada correctamente');
            await this.cargar();
            await Disponibilidades.cargar();
            this.renderizarFuturas();
            Disponibilidades.renderizar();
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
        const disponibles = Disponibilidades.obtenerDisponibles();
        const select = document.getElementById('disponibilidadReserva');
        
        if (!select) return;
        
        select.innerHTML = '<option value="">Seleccionar disponibilidad</option>';
        
        if (disponibles.length === 0) {
            select.innerHTML += '<option disabled>No hay disponibilidades</option>';
            return;
        }

        select.innerHTML += disponibles.map(d => {
            const tecnicoNombre = Tecnicos.obtenerNombre(d.tecnicoId);
            const tecnicoEspecialidad = Tecnicos.obtenerEspecialidad(d.tecnicoId);
            const fechaFormato = this.formatearFecha(d.fecha);
            return `<option value="${d.id}">${tecnicoNombre} (${tecnicoEspecialidad}) - ${fechaFormato} ${d.hora}</option>`;
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
        await Disponibilidades.cargar();
        await Reservas.cargar();

        // Renderizar interfaz
        Clientes.renderizar();
        Tecnicos.renderizar();
        Disponibilidades.renderizar();
        Clientes.actualizarSelect();
        Tecnicos.actualizarSelect();
        Tecnicos.actualizarSelectDisponibilidad();
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

        // Form de disponibilidades
        document.getElementById('disponibilidadForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const tecnicoId = document.getElementById('tecnicoDisponibilidad').value;
            const fecha = document.getElementById('disponibilidadFecha').value;
            const hora = document.getElementById('disponibilidadHora').value;
            
            if (await Disponibilidades.agregar(tecnicoId, fecha, hora)) {
                document.getElementById('disponibilidadForm').reset();
            }
        });

        // Form de reservas
        document.getElementById('reservaForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const clienteId = document.getElementById('reservaCliente').value;
            const disponibilidadId = document.getElementById('disponibilidadReserva').value;
            const descripcion = document.getElementById('reservaDescripcion').value;
            
            if (await Reservas.crearDesdeDisponibilidad(clienteId, disponibilidadId, descripcion)) {
                document.getElementById('reservaForm').reset();
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