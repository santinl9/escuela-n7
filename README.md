# Sistema de Gestión Escolar - Escuela N° 7

Sistema integral de gestión académica y administrativa para la Escuela de Educación Secundaria N° 7. 
La plataforma gestiona ciclos lectivos, cursos, cursadas, inscripciones, estudiantes, personal docente/no docente, asistencia institucional, calificaciones y mesas de examen.

---

## 🌳 Estructura del Proyecto

```text
escuela-n7/
├── docker-compose.yml          # Orquestación de contenedores (Base de datos PostgreSQL y Backend)
├── CLAUDE.md                   # Reglas de arquitectura, modelos de dominio y estándares
├── README.md                   # Documentación general y estructura del proyecto
│
├── Backend/                    # Servidor API REST (Node.js, Express, TypeScript, Prisma)
│   ├── Dockerfile              # Configuración del contenedor Docker para la API
│   ├── api.http                # Ejemplos de peticiones HTTP para pruebas de endpoints
│   ├── package.json            # Dependencias y scripts del backend
│   ├── tsconfig.json           # Configuración de TypeScript
│   ├── prisma.config.ts        # Configuración para migraciones y cliente Prisma
│   │
│   ├── prisma/                 # Capa de datos y persistencia con Prisma ORM
│   │   ├── schema.prisma       # Definición del modelo de datos de la base de datos
│   │   ├── seed.ts             # Datos iniciales para pruebas y desarrollo
│   │   └── migrations/         # Historial de migraciones SQL generadas
│   │
│   └── src/                    # Código fuente del backend
│       ├── index.ts            # Punto de entrada y configuración del servidor Express
│       ├── config/             # Configuración del entorno y variables globales
│       ├── constants/          # Constantes y enumeraciones del negocio
│       ├── controllers/        # Controladores HTTP (manejo de req, res y llamadas a servicios)
│       ├── errors/             # Manejo centralizado de errores y excepciones
│       ├── middlewares/        # Middlewares (autenticación, roles, permisos, validación)
│       ├── routes/             # Definición de rutas y endpoints de la API
│       ├── services/           # Lógica de negocio y consultas a base de datos
│       ├── types/              # Tipos e interfaces de TypeScript
│       └── validations/        # Esquemas de validación de datos de entrada (Zod)
│
└── Frontend/                   # Aplicación Web SPA (React 19, TypeScript, Vite, Tailwind CSS)
    ├── index.html              # Plantilla HTML principal
    ├── vite.config.ts          # Configuración de Vite
    ├── package.json            # Dependencias y scripts del frontend
    ├── tsconfig.json           # Configuración de TypeScript
    ├── public/                 # Archivos estáticos públicos
    │
    └── src/                    # Código fuente de la interfaz de usuario
        ├── main.tsx            # Punto de entrada de React (montaje en el DOM)
        ├── App.tsx             # Enrutamiento principal (React Router) y providers globales
        │
        ├── assets/             # Estilos globales (Tailwind CSS) y recursos multimedia
        │
        ├── components/         # Componentes modulares y reutilizables
        │   ├── cards/          # Tarjetas de resumen y visualización de entidades
        │   ├── elements/       # Componentes atómicos (botones, inputs, spinners, alertas)
        │   ├── layout/         # Estructura visual (Sidebar, Navbar, Footer, contenedores)
        │   └── modals/         # Ventanas modales y formularios emergentes
        │
        ├── constants/          # Constantes, opciones de selección y tipos enumerados
        ├── context/            # Contextos de React para estado global (ej. autenticación)
        ├── hooks/              # Custom hooks para lógica reutilizable y llamadas a la API
        │
        ├── pages/              # Vistas y pantallas principales de la aplicación
        │   ├── Home.tsx                        # Tablero de inicio y resumen general
        │   ├── Login.tsx                       # Inicio de sesión
        │   ├── MiPerfil.tsx                    # Perfil del usuario autenticado
        │   ├── GestionEstudiantes.tsx          # Administración y registro de alumnos
        │   ├── DetalleEstudiante.tsx           # Ficha completa del estudiante
        │   ├── GestionCursos.tsx               # Administración de cursos y divisiones
        │   ├── GestionCursadas.tsx             # Gestión de asignaturas y cursadas anuales
        │   ├── CursadasCurso.tsx               # Detalle de cursadas asociadas a un curso
        │   ├── PasarListaCurso.tsx             # Registro de asistencia diaria
        │   ├── InscriptosCursada.tsx           # Administración de alumnos inscriptos en cursada
        │   ├── TotalizadoraCurso.tsx           # Carga de calificaciones y valoraciones
        │   ├── Intensificaciones.tsx           # Registro de períodos de intensificación
        │   ├── GestionMesasExamen.tsx          # Configuración y actas de mesas de examen
        │   ├── InscriptosMesaExamen.tsx        # Alumnos anotados en mesas de examen
        │   ├── GestionPersonal.tsx             # Registro de docentes y no docentes
        │   ├── DetallePersonal.tsx             # Ficha del personal institucional
        │   ├── GestionCiclosLectivos.tsx       # Ciclos lectivos y períodos lectivos
        │   ├── GestionMaterias.tsx             # Plan de estudios y materias
        │   ├── GestionAulas.tsx                # Espacios físicos y aulas
        │   ├── GestionOrientaciones.tsx        # Orientaciones académicas de la escuela
        │   ├── GestionPeriodosCarga.tsx        # Ventanas habilitadas para carga de notas
        │   ├── RolesYUsuarios.tsx              # Seguridad, usuarios y asignación de roles
        │   ├── MisCursos.tsx                   # Panel rápido de cursos del docente
        │   └── Reportes.tsx                    # Generación y visualización de reportes
        │
        └── types/              # Definición de modelos, tipos e interfaces
            ├── formTypes/      # Tipos específicos para estados de formularios
            ├── props/          # Tipos para las props de componentes
            ├── schemas/        # Esquemas de validación de datos (Zod)
            └── *.ts            # Interfaces TypeScript para entidades del dominio
```

---

## 🛠️ Tecnologías Principales

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7, React Hook Form, Zod.
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, Zod.
- **Base de Datos e Infraestructura:** PostgreSQL 16, Docker & Docker Compose.
