# ATMOS - Real-Time Weather Application

A modern, beautiful weather application built with React, TypeScript, and Vite. Get real-time weather data and 5-day forecasts with dynamic visual themes based on weather conditions.

## Features

- 🌤️ Real-time weather data from OpenWeather API
- 📊 Comprehensive weather metrics (humidity, wind speed, visibility, pressure)
- 🌅 Sunrise and sunset times
- 📅 5-day weather forecast
- 🌡️ Temperature unit toggle (Celsius/Fahrenheit)
- 🎨 Dynamic accent colors based on weather conditions
- 📱 Responsive design
- ✨ Smooth animations and modern UI

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Configuration

1. Get your free API key from [OpenWeather](https://openweathermap.org/api)
2. Create a `.env.local` file in the project root (copy from `.env.example`):
   ```
   VITE_OPENWEATHER_API_KEY=your_api_key_here
   ```
3. Replace `your_api_key_here` with your actual OpenWeather API key

### Development Server

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## Project Structure

```
src/
├── App.tsx          # Main weather component with all logic
├── index.css        # Global styles and animations
├── main.tsx         # Entry point
└── App.css          # Component-specific styles
```

## Weather Conditions & Colors

The app uses dynamic accent colors based on weather conditions:

| Condition | Color |
|-----------|-------|
| Clear | #C8B97A |
| Clouds | #6B7280 |
| Rain | #3B82F6 |
| Thunderstorm | #7C3AED |
| Snow | #93C5FD |
| Mist/Fog | #9CA3AF |

## Technologies

- **React 19** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite 8** - Build tool
- **OpenWeather API** - Weather data
- **CSS3** - Styling with custom properties

## API Usage

The app makes two API calls per search:
1. Current weather data
2. 5-day forecast

Both requests use your provided OpenWeather API key.

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Performance

- HMR (Hot Module Replacement) enabled for fast development
- Optimized build with tree-shaking
- Minimal bundle size

## Notes

- Ensure your OpenWeather API key is valid
- The free tier includes current weather and 5-day forecast data
- Network errors are gracefully handled with user-friendly messages

## License

MIT
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
