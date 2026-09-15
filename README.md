# Sistema de Selección de Electivas

Sistema web completo para la selección y administración de materias/electivas para estudiantes de 11.º y 12.º grado.

## 🚀 Tecnologías

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Base de datos**: Turso (SQLite) con Drizzle ORM
- **Autenticación**: JWT con jose
- **Gráficos**: Recharts
- **Exportación**: xlsx (Excel) + jspdf (PDF)
- **Validación**: Zod
- **Deployment**: Vercel

## 📋 Características

### Panel de Estudiante
- Formulario de 8 pasos para selección de electivas
- Validación en tiempo real
- Control de cupos en tiempo real
- Confirmación antes de envío
- Número de registro único

### Panel de Administrador
- Dashboard con estadísticas y gráficos interactivos
- Gestión completa de estudiantes (CRUD)
- Gestión de materias, electivas y cursos avanzados
- Control de cupos con alertas
- Reportes con filtros avanzados
- Exportación a Excel (separado por grado) y PDF
- Configuración de reglas de selección
- Autenticación segura

## 🛠️ Instalación

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Cuenta en Turso (para base de datos)

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd seleccion-electivas
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```

Edita `.env` con tus valores:
```env
# Base de datos Turso
DATABASE_URL="libsql://tu-database.turso.io"
TURSO_AUTH_TOKEN="tu-auth-token"

# Autenticación Administrador
ADMIN_EMAIL="admin@colegio.edu"
ADMIN_PASSWORD="contraseña-segura"

# JWT Secret
JWT_SECRET="secreto-super-seguro-aleatorio"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Crear base de datos en Turso

1. Ve a [Turso](https://turso.tech) y crea una cuenta
2. Crea una nueva base de datos
3. Obtén la URL y el token de autenticación
4. Agrégalos a tu `.env`

### 5. Ejecutar migraciones y seed
```bash
# Generar migraciones
npm run db:generate

# Aplicar migraciones
npm run db:push

# Poblar datos iniciales
npm run db:seed
```

### 6. Ejecutar en desarrollo
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── api/              # API Routes
│   │   ├── auth/         # Autenticación
│   │   ├── students/     # Estudiantes
│   │   ├── subjects/     # Materias
│   │   ├── admin/        # Admin (dashboard, rules)
│   │   ├── export/       # Exportaciones
│   │   ├── dashboard/    # Dashboard stats
│   │   └── reports/      # Reportes
│   ├── admin/            # Panel admin pages
│   │   ├── dashboard/
│   │   ├── estudiantes/
│   │   ├── materias/
│   │   ├── configuracion/
│   │   └── reportes/
│   ├── estudiante/       # Panel estudiante
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── student/          # Componentes estudiante
│   └── admin/            # Componentes admin
├── db/
│   ├── schema.ts         # Esquema Drizzle
│   ├── index.ts          # Cliente DB
│   └── seed.ts           # Seed inicial
├── lib/
│   ├── auth.ts           # Autenticación JWT
│   └── validations.ts    # Esquemas Zod
├── types/
│   └── index.ts          # Tipos TypeScript
└── utils/
    └── helpers.ts        # Utilidades
```

## 🗄️ Esquema de Base de Datos

### Tablas principales
- **students**: Datos de estudiantes y selecciones
- **subjects**: Materias, electivas y cursos avanzados
- **selections**: Relación estudiante-materia con tipo
- **admins**: Usuarios administradores
- **selection_rules**: Reglas configurables por grado

## 🔧 Scripts disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linting
npm run db:generate  # Generar migraciones
npm run db:push      # Aplicar migraciones
npm run db:studio    # Drizzle Studio
npm run db:seed      # Poblar datos iniciales
```

## 🌐 Deployment en Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel:
   - `DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_APP_URL` (URL de tu deployment)
3. Deploy automático

## 📝 Uso del sistema

### Para estudiantes
1. Accede a la URL pública
2. Completa tus datos personales
3. Selecciona tu grado (11º o 12º)
4. Si eres 12º, selecciona bachillerato
5. Elige tus electivas/materias (respetando cupos)
6. Opcional: selecciona curso avanzado (12º)
7. Agrega observaciones
8. Confirma y guarda tu número de registro

### Para administradores
1. Accede a `/admin/login`
2. Inicia sesión con credenciales configuradas
3. Dashboard: visión general con gráficos
4. Estudiantes: lista, búsqueda, filtros, edición, exportación
5. Materias: CRUD completo, control de cupos
6. Configuración: reglas de selección por grado
7. Reportes: filtros avanzados, exportación Excel/PDF

## 🔒 Seguridad

- Autenticación JWT con cookies httpOnly
- Validación en frontend y backend
- Sanitización de entradas con Zod
- Protección de rutas administrativas
- Variables de entorno para secretos
- Control de concurrencia en cupos

## 📊 Exportaciones

### Excel
- **Estudiantes_11_Grado.xlsx**: Solo 11º grado
- **Estudiantes_12_Grado.xlsx**: Solo 12º grado
- Columnas ajustadas automáticamente

### PDF
- General (todos)
- Por grado (11º / 12º)
- Por materia
- Por curso avanzado

## 🎨 Personalización

Colores institucionales en `tailwind.config.ts`:
```js
colors: {
  primary: { /* tus colores */ },
  secondary: { /* tus colores */ }
}
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🆘 Soporte

Para dudas o problemas:
- Revisa la documentación
- Abre un issue en GitHub
- Contacta al equipo de desarrollo