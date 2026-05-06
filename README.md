# Patio 1220 — Sistema de e-commerce y gestión de reservas

Aplicación web full stack desarrollada para Patio 1220, un vivero real ubicado en Tucumán, Argentina. El sistema reemplaza la gestión manual de stock y reservas, permitiendo a los clientes explorar el catálogo y reservar productos online, mientras el administrador controla el negocio desde un panel con métricas, alertas de stock e informes financieros analizados por IA.

**Demo en producción:** [patio1220.vercel.app](https://patio1220.vercel.app)
> El backend corre en Render (plan gratuito). La primera carga puede demorar entre 30 y 60 segundos mientras el servidor despierta.

---

## Capturas

### Catálogo de productos
<img width="1897" height="906" alt="Captura de pantalla 2026-05-06 014207" src="https://github.com/user-attachments/assets/e6331a00-2084-469e-b942-1cc9a5067276" />


### Flujo de reserva / Checkout
<img width="866" height="684" alt="Captura de pantalla 2026-05-06 014400" src="https://github.com/user-attachments/assets/a4c3a769-9f64-4cbd-9ad2-c53572cda248" />


### Panel de reportes
<img width="667" height="852" alt="Captura de pantalla 2026-05-06 014542" src="https://github.com/user-attachments/assets/1288e1d9-924d-4528-93aa-151e3651843e" />


### Informe generado con IA
<img width="686" height="861" alt="Captura de pantalla 2026-05-06 014515" src="https://github.com/user-attachments/assets/ef29771f-05f9-4e7c-8250-f6d874e78579" />


---

## Funcionalidades principales

### Usuario
- Registro e inicio de sesión con autenticación JWT
- Exploración del catálogo con filtros por categoría
- Carrito de compras y flujo completo de checkout
- Comprobante de reserva exportable en PDF
- Notificación por mail al confirmar la reserva
- Perfil editable: datos personales, direcciones de entrega e historial de reservas

### Administrador
- Panel de control con KPIs del negocio (clientes activos, reservas, productos en stock)
- Gráficos de evolución de clientes, reservas por estado y distribución de stock por categoría
- Alertas automáticas de stock (sin stock, crítico, bajo) por producto y tamaño
- Gestión de reservas con cambio de estado y detalle por reserva
- Gestión de usuarios y productos (CRUD completo)
- Generación de informes financieros por período personalizado con exportación a PDF
- Análisis de informes procesado por IA (Groq): resumen ejecutivo, análisis financiero, productos destacados y recomendaciones exportables a PDF

---

## Stack tecnológico

### Frontend
- React 19 + Vite
- Zustand (manejo de estado global)
- React Router DOM
- Framer Motion (animaciones)
- Recharts (gráficos del panel admin)
- Bootstrap + React Bootstrap
- Axios
- jsPDF (generación de PDFs en el cliente)
- SweetAlert2

### Backend
- Node.js + Express 5
- Autenticación con JWT + bcryptjs
- Nodemailer (notificaciones por mail)
- Groq SDK (generación de informes con IA)
- Helmet (seguridad HTTP)
- Morgan (logging)
- MySQL2

### Base de datos
- MySQL (hosteada en Railway)

### Deploy
| Capa | Plataforma |
|------|------------|
| Frontend | Vercel |
| Backend | Render |
| Base de datos | Railway |

---

## Arquitectura del backend

```
backend/
├── app.js
├── routes/
├── controllers/
├── middlewares/
└── .env
```

El backend sigue una arquitectura en capas con separación de responsabilidades entre rutas, controladores y middlewares. La lógica de acceso a datos está integrada en los controladores, decisión tomada en función del tamaño del proyecto para evitar sobreingeniería.
Groq fue elegido como proveedor de IA por ofrecer una API gratuita con baja latencia, lo que lo hace viable para proyectos sin presupuesto de infraestructura. Zustand se prefirió sobre Redux por su API minimal y ausencia de boilerplate para el tamaño del proyecto.

---

## Cómo correr el proyecto localmente

### Requisitos
- Node.js 18+
- MySQL corriendo localmente

### 1. Clonar el repositorio

```bash
git clone https://github.com/JuanTosi/patio1220.git
cd patio1220
```

### 2. Configurar el backend

```bash
cd backend
npm install
```

Copiá el archivo `.env.example` como `.env` y completá las variables con tus propios valores:

```bash
cp .env.example .env
```

Iniciá el servidor:

```bash
npm run dev
```

### 3. Configurar el frontend

```bash
cd ../frontend
npm install
```

Copiá el archivo `.env.example` como `.env` y completá las variables:

```bash
cp .env.example .env
```

Iniciá la app:

```bash
npm run dev
```

---

## Autor

**Juan Ignacio Tosi**  
[github.com/JuanTosi](https://github.com/JuanTosi) - [linkedin.com/in/juan-tosi-488b66338](https://linkedin.com/in/juan-tosi-488b66338)
