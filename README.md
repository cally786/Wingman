# Wingman App

Aplicación móvil para conectar personas con intereses similares y descubrir lugares increíbles.

## 🚀 Características

- Autenticación de usuarios con Supabase
- Navegación con Expo Router
- Diseño moderno y minimalista
- Integración con mapas y geolocalización
- Sistema de reservas en tiempo real
- Billetera digital integrada
- Notificaciones push

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- npm o yarn
- Expo CLI (`npm install -g expo-cli`)
- Cuenta en Supabase

## 🛠️ Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/wingman.git
cd wingman
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env` en la raíz del proyecto:
```env
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
EXPO_PUBLIC_SUPABASE_KEY=tu_anon_key_de_supabase
```

## 🚀 Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm start
```

## 📁 Estructura del Proyecto

```
wingman/
├── app/                  # Rutas y pantallas de la aplicación
│   ├── (auth)/          # Rutas de autenticación
│   └── (tabs)/          # Rutas principales de la app
├── assets/              # Imágenes, fuentes y recursos
├── components/          # Componentes reutilizables
├── hooks/              # Hooks personalizados
├── lib/                # Configuraciones y utilidades
└── services/           # Servicios de API
```

## 🔧 Tecnologías

- React Native
- Expo
- Supabase
- React Query
- Expo Router
- TypeScript

## 📱 Capturas de Pantalla

[Aquí irán las capturas de pantalla de la app]

## 🤝 Contribución

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## ✨ Agradecimientos

- [Expo](https://expo.dev)
- [Supabase](https://supabase.com)
- [React Native](https://reactnative.dev) 