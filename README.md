# Airbnb Financial Insights

## Descripción de la Aplicación

**Airbnb Financial Insights** es una herramienta de análisis financiero diseñada para propietarios y administradores de apartamentos turísticos en plataformas como Airbnb. La aplicación permite visualizar, analizar y gestionar datos financieros relacionados con las reservas, ocupación y rentabilidad de los apartamentos.

## Funcionalidades Principales

- **Dashboard Administrativo**: Visualización completa de métricas financieras clave.
- **Análisis de Apartamentos**: Datos detallados sobre ocupación, ingresos y rentabilidad por apartamento.
- **Gráficos Interactivos**: Visualización de tendencias de ingresos, ocupación y fuentes de reservas.
- **Gestión de Noches**: Control de noches ocupadas, vacías y bloqueadas.
- **Modo Oscuro/Claro**: Interfaz adaptable a las preferencias visuales del usuario.

## Mejoras Implementadas

### Interfaz de Usuario
- **Modo Oscuro**: Implementación de un botón para alternar entre modo claro y oscuro.
- **Botones de Acceso Rápido**: Acceso directo a cuentas de usuario y administrador para facilitar el desarrollo.
- **Formato Europeo de Números**: Visualización de valores monetarios y porcentajes con formato europeo (punto para miles, coma para decimales).

### Funcionalidades
- **Noches Bloqueadas**: Implementación del registro y visualización de noches bloqueadas que no se contabilizan en los cálculos de beneficios.
- **Terminología Mejorada**: Cambio de "días vacíos" a "noches vacías" para mayor precisión.
- **Cálculos Financieros Optimizados**: Mejora en la precisión de los cálculos de rentabilidad excluyendo noches bloqueadas.

### Componentes Actualizados
- **ApartmentList**: Adición de columnas para noches vacías y bloqueadas.
- **BookingSourceChart**: Corrección de errores y aplicación de formato europeo.
- **RevenueChart**: Implementación de formato europeo para valores monetarios.
- **OccupancyChart**: Actualización de formatos en ejes y tooltips.

## Tecnologías Utilizadas
- React
- TypeScript
- Recharts (para visualizaciones)
- Tailwind CSS
- Shadcn UI

## Cómo Ejecutar el Proyecto

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build
```

## URL del Proyecto Original
**URL**: https://lovable.dev/projects/0e44a6f8-2206-4a7f-92fa-b03e8d8b0e59

## Requisitos
Node.js & npm - [instalar con nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
