# Guía Completa: Creación de DigitalCenter desde Cero

Esta guía te llevará paso a paso a través del proceso de construcción de la aplicación de gestión educativa "DigitalCenter" utilizando Next.js, Firebase, ShadCN UI, Tailwind CSS y Genkit para las funcionalidades de IA.

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado lo siguiente:
- **Node.js**: Versión 18 o superior.
- **npm** o **yarn**: Gestor de paquetes de Node.js.
- Una cuenta de **Google** para usar Firebase.

---

### Paso 1: Configuración del Proyecto Next.js y Firebase

1.  **Crear la aplicación Next.js:**
    Abre tu terminal y ejecuta el siguiente comando. Responde a las preguntas de configuración como se indica.

    ```bash
    npx create-next-app@latest digital-center
    # TypeScript: Yes, ESLint: Yes, Tailwind CSS: Yes, `src/` directory: Yes, App Router: Yes, customize aliases: No
    cd digital-center
    ```

2.  **Configurar Firebase:**
    - Ve a la [Consola de Firebase](https://console.firebase.google.com/), crea un nuevo proyecto.
    - Registra una aplicación web y copia el objeto `firebaseConfig`.
    - Habilita **Authentication** (con proveedor Correo/Contraseña) y **Firestore Database** (en modo de producción).
    - Crea `src/lib/firebase.ts` y pega tu `firebaseConfig`. Exporta `auth` y `db`.

3.  **Configurar Firebase Admin (Servidor):**
    - Para las operaciones del lado del servidor (como en los flujos de Genkit), el SDK de Admin se autentica automáticamente en entornos de Google.
    - Crea `src/lib/firebase-admin.ts` con el siguiente contenido para una inicialización centralizada y robusta:
    ```typescript
    // src/lib/firebase-admin.ts
    import { initializeApp, getApps, App } from 'firebase-admin/app';
    import { getFirestore } from 'firebase-admin/firestore';
    import { getAuth } from 'firebase-admin/auth';

    let adminApp: App;
    if (!getApps().length) {
      adminApp = initializeApp();
    } else {
      adminApp = getApps()[0];
    }
    export const db = getFirestore(adminApp);
    export const auth = getAuth(adminApp);
    ```

---

### Paso 2: Diseño y Componentes con ShadCN UI

1.  **Inicializar ShadCN UI:**
    Ejecuta `npx shadcn-ui@latest init` y sigue las instrucciones, aceptando los valores por defecto.

2.  **Instalar Componentes:**
    Instalaremos todos los componentes que necesita la aplicación.

    ```bash
    npx shadcn-ui@latest add button card input label dialog dropdown-menu avatar tabs table badge select sheet toast accordion alert alert-dialog sidebar command popover collapsible
    ```

---

### Paso 3: Autenticación Avanzada y Estructura de la Aplicación

1.  **Crear Páginas de Autenticación:**
    - `src/app/login/page.tsx`: Formulario de inicio de sesión con correo/contraseña y proveedores sociales (Google/Apple).
    - `src/app/signup/page.tsx`: Flujo de registro en dos pasos.
        - **Paso 1:** Recopila nombre, correo y contraseña.
        - **Paso 2:** El usuario selecciona el tipo de organización (`colegio`, `academia`, etc.). Esto crea una nueva organización con un conjunto de módulos preconfigurados y una suscripción de prueba de 15 días.
    - `src/app/pending-approval/page.tsx`: Página de espera para usuarios cuyo rol es `"Unassigned"`.

2.  **Proteger Rutas y Gestionar Roles (`AuthProvider`):**
    - Crea un `AuthProvider` (`src/contexts/auth-context.tsx`) que envuelva toda la aplicación en `layout.tsx`.
    - Este proveedor usará el hook `onAuthStateChanged` de Firebase para:
      - Rastrear el estado de autenticación y cargar el perfil del usuario desde Firestore.
      - Redirigir a `/login` si no está autenticado.
      - Si el rol del usuario es `"Unassigned"`, redirigirlo a `/pending-approval`.
      - Si `forcePasswordChange` es `true`, mostrar una alerta persistente en toda la app para que el usuario actualice su contraseña, sin bloquear la navegación.
      - Validar el acceso a rutas según el rol del usuario (ej. solo `SuperAdmin` puede acceder a `/admin`).

3.  **Crear el Layout Principal (`AppContent`):**
    - Diseña el layout principal con un `Sidebar` y una cabecera.
    - El `Sidebar` muestra enlaces dinámicamente según los módulos activados para la organización del usuario.
    - La cabecera muestra el nombre del usuario, su avatar y un menú para ir a ajustes o cerrar sesión.

---

### Paso 4: Implementación de Módulos (CRUD + Lógica de Negocio)

Para cada módulo (RRHH, Finanzas, Académico, Estudiantes, Inventario, Ventas), el proceso es similar:

1.  **Definir los Tipos de Datos:**
    - En `src/lib/types.ts`, define las interfaces para cada entidad (ej. `Employee`, `Invoice`, `Product`, `Sale`).

2.  **Crear el Servicio Firestore:**
    - Crea un archivo de servicio por cada entidad (ej. `src/services/employee-service.ts`).
    - Implementa las funciones CRUD (Crear, Leer, Actualizar, Borrar) usando `firebase/firestore`.
    - **Ejemplo (Finanzas):** Al crear una `Invoice` (factura), el servicio `invoice-service.ts` también debe llamar al `accounting-service.ts` para crear el asiento contable correspondiente (Débito a Cuentas por Cobrar, Crédito a Ingresos).

3.  **Construir el Componente Cliente:**
    - Crea un componente cliente por cada vista principal (ej. `src/app/hr/employees-client.tsx`).
    - Usa `useState` y `useEffect` para obtener y mostrar los datos del servicio.
    - Muestra los datos en un componente `Table` de ShadCN. En dispositivos móviles, la tabla se transforma en una vista de tarjetas para una mejor experiencia de usuario.
    - Usa `Dialog` con un `Form` (usando `react-hook-form` y `zod` para validaciones) para crear y editar registros.
    - Usa `AlertDialog` para confirmar la eliminación de registros.

---

### Paso 5: Integración de IA con Genkit

1.  **Instalar Dependencias y Configurar:**
    - `npm install genkit @genkit-ai/googleai zod`
    - Crea `src/ai/genkit.ts` para inicializar Genkit. Configura tu `GEMINI_API_KEY` en un archivo `.env`.

2.  **Crear el Flujo de IA (Ej: Resumen de Video):**
    - Crea `src/ai/flows/generate-class-recording-summary.ts`.
    - Define los esquemas de entrada (`videoClassLink`) y salida (`summary`) con `zod`.
    - Usa `ai.definePrompt` para crear la plantilla del prompt.
    - Usa `ai.defineFlow` para envolver el prompt y crear el flujo principal.
    - Exporta una función `async` que llame al flujo para ser usada desde el frontend.

3.  **Integrar el Flujo en el Frontend:**
    - En el componente de "Grabaciones de Clases" (`src/app/academics/video-summary-client.tsx`), llama a la función del flujo.
    - Muestra un estado de carga mientras se genera el resumen.
    - Guarda el resumen en Firestore usando el servicio correspondiente (`video-recording-service.ts`).

---

### Paso 6: Módulo de SuperAdmin

Este módulo es accesible solo para el rol `SuperAdmin` y permite la gestión global de la plataforma.

1.  **Gestión de Clientes (Organizaciones):**
    - Un CRUD completo para las organizaciones.
    - Permite al SuperAdmin activar o desactivar módulos para cada cliente, definir la fecha de vencimiento de la suscripción y gestionar los detalles del contrato.

2.  **Personalización de Marca:**
    - Un formulario donde el SuperAdmin puede personalizar la página pública de cada cliente (`/o/[orgId]`).
    - Se puede cambiar el título, la descripción y los colores del tema (primario, fondo, acento) usando variables HSL.

3.  **Gestión de Usuarios del Sistema:**
    - Permite ver y editar el perfil de cualquier usuario en el sistema.
    - El SuperAdmin puede cambiar roles, asignar organizaciones, forzar cambios de contraseña y eliminar usuarios de forma permanente.

4.  **Flujo de Eliminación de Usuario Robusto:**
    - Se implementa un flujo de Genkit (`delete-user.ts`) que maneja la eliminación completa de un usuario:
        - Primero, registra la eliminación en una colección de auditoría (`deletedUsersLog`).
        - Luego, elimina al usuario de Firebase Authentication.
        - Finalmente, elimina sus documentos asociados en las colecciones `users` y `employees` de Firestore.
        - Este flujo está diseñado para manejar casos donde el usuario ya fue eliminado manualmente de Auth, limpiando los registros restantes de Firestore.

---

### Paso 7: Módulo de Chat y Soporte para Invitados

1.  **Estructura del Chat:**
    - Se definen `ChatRoom` y `ChatMessage` en `types.ts`.
    - El servicio `chat-service.ts` maneja la creación de salas, el envío de mensajes y la escucha de nuevos mensajes en tiempo real con `onSnapshot`.
    - Al crear una nueva organización, se inicializan automáticamente salas de chat por defecto (Soporte, Admin, etc.).

2.  **Widget de Contacto y Chat para Invitados:**
    - En la página de inicio pública, un widget flotante (`contact-widget.tsx`) permite a los visitantes anónimos iniciar una conversación.
    - Para lograr esto, se crea un flujo de Genkit (`create-guest-chat-room.ts`):
        - Crea una sala de chat temporal de tipo "Soporte".
        - Asigna a un SuperAdmin para atender la conversación.
        - Genera un token de autenticación personalizado y anónimo para el visitante usando Firebase Admin Auth. Esto permite al visitante chatear de forma segura sin tener una cuenta.

---

¡Felicidades! Siguiendo esta guía, habrás recreado la aplicación DigitalCenter desde cero. Ahora tienes una base sólida, escalable y con funcionalidades avanzadas que puedes seguir expandiendo.