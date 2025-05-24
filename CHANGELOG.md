# Registro de Cambios (CHANGELOG)

Todos los cambios notables en el proyecto "Airbnb Financial Insights" serán documentados en este archivo.

## [1.0.0] - 2025-05-06

### Añadido
- Implementación del modo oscuro con botón para alternar entre temas
- Botones de acceso rápido para cuentas de usuario y administrador
- Funcionalidad para registrar y visualizar noches bloqueadas
- Nueva columna "Noches Bloqueadas" en la tabla de apartamentos
- Archivo de utilidades para formateo de números en formato europeo

### Cambiado
- Terminología de "días vacíos" a "noches vacías" para mayor precisión
- Cálculo de beneficios para excluir correctamente las noches bloqueadas
- Formato de números en todos los componentes para usar el estándar europeo (punto para miles, coma para decimales)
- Actualización del README con información detallada sobre la aplicación y sus funcionalidades

### Corregido
- Error en el componente Pie del gráfico de fuentes de reservas
- Cálculo incorrecto de noches vacías que no excluía las noches bloqueadas
- Visualización de porcentajes en los gráficos para usar formato europeo

### Componentes Actualizados
- **ApartmentList.tsx**: Adición de columnas para noches vacías y bloqueadas
- **BookingSourceChart.tsx**: Corrección de errores y aplicación de formato europeo
- **AdminDashboard.tsx**: Actualización de todos los números para usar formato europeo
- **ComparativeMetricCard.tsx**: Implementación de formateo adecuado para porcentajes
- **RevenueChart.tsx**: Aplicación de formato europeo a los valores mostrados
- **OccupancyChart.tsx**: Actualización de formatos en ejes y tooltips
