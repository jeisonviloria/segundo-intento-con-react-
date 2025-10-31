# Juegos Desconocidos

Una aplicación web para compartir y descubrir juegos poco conocidos.

## Características

- 🎮 Publicar juegos desconocidos
- 👍 Sistema de likes y favoritos
- 💬 Comentarios y calificaciones
- 👤 Perfiles de usuario
- 🔍 Búsqueda de juegos
- 📱 Diseño responsivo

## Tecnologías utilizadas

- React.js
- Firebase (Autenticación y Firestore)
- CSS moderno
- React Hooks
- Context API

## Instalación

1. Clona el repositorio
```bash
git clone [url-del-repositorio]
```

2. Instala las dependencias
```bash
cd segundo-intento-con-react
npm install
```

3. Inicia el servidor de desarrollo
```bash
npm start
```

## Estructura del proyecto

```
mi-app/
├── public/
├── src/
│   ├── components/
│   │   ├── Comments.js
│   │   ├── GameCard.js
│   │   ├── GamesApp.js
│   │   ├── GamesList.js
│   │   ├── Header.js
│   │   ├── LoginModal.js
│   │   ├── PublishGameModal.js
│   │   ├── Stats.js
│   │   ├── UserProfile.js
│   │   └── ViewGameModal.js
│   ├── firebase/
│   │   ├── auth.js
│   │   └── config.js
│   ├── hooks/
│   │   └── useAuth.js
│   ├── utils/
│   │   └── validaciones.js
│   ├── App.js
│   └── index.js
└── package.json
```

## Funcionalidades principales

- Autenticación con Google
- Publicación de juegos con título, descripción, plataforma y género
- Sistema de likes y comentarios
- Lista de favoritos por usuario
- Perfil de usuario con estadísticas
- Búsqueda y filtrado de juegos

## Contribución

Si quieres contribuir al proyecto:

1. Haz fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.