# ATMOS - React Vite TypeScript Weather App

## Project Overview

ATMOS is a modern, real-time weather application built with React 19, TypeScript, and Vite. It provides comprehensive weather data with a beautiful, responsive UI.

## Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 8 with HMR support
- **Styling**: CSS3 with custom animations
- **API**: OpenWeather API for real-time weather data
- **Language**: TypeScript for type safety

## Key Features

- Real-time weather data and 5-day forecasts
- Dynamic accent colors based on weather conditions
- Temperature unit toggle (Celsius/Fahrenheit)
- Comprehensive weather metrics (humidity, wind, pressure, visibility)
- Sunrise/sunset times
- Responsive design for all devices
- Smooth animations and modern UI

## Project Structure

```
src/
├── App.tsx       # Main component with weather logic (all-in-one)
├── index.css     # Global styles and animations
├── main.tsx      # React entry point
└── App.css       # Additional component styles
```

## Setup Instructions

### 1. API Key Configuration

1. Sign up at [OpenWeather](https://openweathermap.org/api) to get a free API key
2. The `.env.local` file is already created with placeholder
3. Add your actual API key:
   ```
   VITE_OPENWEATHER_API_KEY=your_key_here
   ```

### 2. Running the Application

**Development Mode:**
```bash
npm run dev
# Available at http://localhost:5173/
```

**Production Build:**
```bash
npm run build
```

**Preview Build:**
```bash
npm run preview
```

**Lint Code:**
```bash
npm run lint
```

## Development Guidelines

### Code Style
- Use TypeScript for all code
- Follow ESLint configuration included in project
- Use meaningful variable names with clear purpose
- Keep components focused on single responsibility

### Component Architecture
- Main App component contains all weather logic
- Separate StatCard sub-component for stats display
- Inline styles for dynamic theming based on weather conditions
- Helper functions at module level (formatTime, getDayName, getConditionBg)

### Styling Approach
- Inline styles for dynamic values (accent colors, animations)
- CSS for static styles and responsive design
- Font: Inter (Google Fonts) for modern look
- Color scheme: Dark theme (#0A0A0A background)

### State Management
- React hooks (useState, useEffect, useCallback)
- Separate state for: query, inputValue, weather, forecast, loading, error, unit, animating
- useCallback for fetchWeather to prevent unnecessary rerenders

### API Integration
- Uses OpenWeather API with free tier
- Endpoints: /weather (current) and /forecast (5-day)
- Environment variable for API key management
- Error handling for 404, 401, and network errors

## Responsive Design

Breakpoints and strategies:
- Mobile-first approach
- Max-width 600px: Forecast cards stack, stats grid shows 2 columns
- Flexible font sizing with clamp()
- Touch-friendly input and buttons

## Weather Condition Colors

| Condition | Hex Color |
|-----------|-----------|
| Clear | #C8B97A |
| Clouds | #6B7280 |
| Rain | #3B82F6 |
| Drizzle | #60A5FA |
| Thunderstorm | #7C3AED |
| Snow | #93C5FD |
| Mist/Fog/Haze | #9CA3AF |
| Smoke | #78716C |
| Dust/Sand | #D97706 |
| Default | #4B5563 |

## Performance Notes

- Component uses lazy evaluation for weather data
- Animations use CSS for smooth performance
- API calls are debounced through form submission
- Images lazy-loaded from OpenWeather CDN

## Common Tasks

### Adding New Weather Metrics
1. Add field to WeatherData interface
2. Extract from API response in fetchWeather()
3. Add StatCard in stats grid section
4. Update styles if needed

### Changing Color Scheme
1. Modify getConditionBg() function for weather colors
2. Update CSS variables in index.css for static colors
3. Test responsiveness after changes

### Improving Error Handling
1. Update fetchWeather() error handling logic
2. Add specific error messages in catch block
3. Test with invalid cities and bad API keys

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

**App shows "Invalid API key" error:**
- Verify API key in .env.local
- Check key is active on OpenWeather dashboard
- Restart dev server after updating .env.local

**Forecast not showing:**
- Ensure API key has forecast endpoint access
- Check browser console for network errors
- Verify city name is valid

**Styling looks broken:**
- Clear browser cache (Ctrl+Shift+Delete)
- Restart Vite dev server
- Check that index.css was imported in main.tsx

## Future Enhancement Ideas

- Save favorite cities to localStorage
- Add weather alerts and warnings
- Implement weather maps visualization
- Add multiple language support
- Create PWA (Progressive Web App) version
- Add dark/light theme toggle
- Integrate more detailed historical data
