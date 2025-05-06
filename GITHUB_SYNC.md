# Instrucciones para sincronizar con GitHub

## Paso 1: Crear un nuevo repositorio en GitHub

1. Ve a [GitHub](https://github.com) e inicia sesión en tu cuenta
2. Haz clic en el botón "+" en la esquina superior derecha y selecciona "Nuevo repositorio"
3. Dale un nombre al repositorio, por ejemplo: "airbnb-financial-insights"
4. Añade una descripción opcional (puedes usar: "Herramienta de análisis financiero para propietarios de apartamentos en Airbnb")
5. Elige si quieres que sea público o privado
6. **IMPORTANTE**: No inicialices el repositorio con README, .gitignore o licencia (ya que estamos importando un proyecto existente)
7. Haz clic en "Crear repositorio"

## Paso 2: Conectar tu repositorio local con GitHub

Después de crear el repositorio, GitHub te mostrará una página con instrucciones. Sigue estas instrucciones específicas para nuestro proyecto:

```bash
# Asegúrate de estar en la carpeta del proyecto
cd /Users/vimasero/Downloads/airbnb-financial-insights-719871ab-main

# Añade el repositorio remoto (reemplaza TU_USUARIO con tu nombre de usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/airbnb-financial-insights.git

# Sube los cambios al repositorio remoto
git push -u origin main
```

## Paso 3: Verificar que todo se haya sincronizado correctamente

1. Visita tu repositorio en GitHub (https://github.com/TU_USUARIO/airbnb-financial-insights)
2. Deberías ver todos los archivos del proyecto, incluyendo el README.md actualizado y el CHANGELOG.md

## Para futuros cambios

Después de realizar modificaciones en tu proyecto local, puedes sincronizarlas con GitHub usando estos comandos:

```bash
# Añadir todos los archivos modificados
git add .

# Crear un commit con un mensaje descriptivo
git commit -m "Descripción de los cambios realizados"

# Subir los cambios a GitHub
git push
```

## Recursos útiles

- [Documentación oficial de Git](https://git-scm.com/doc)
- [Guía de GitHub para principiantes](https://guides.github.com/activities/hello-world/)
- [Chuleta de comandos Git](https://education.github.com/git-cheat-sheet-education.pdf)
