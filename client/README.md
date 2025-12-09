# Streamer Tracker - Angular Client

Modern Angular 17 application for tracking your favorite streamers' subscriber counts across platforms.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Angular CLI (will be installed with dependencies)

### Installation

```bash
# Navigate to client folder
cd client

# Install dependencies
npm install

# Start development server
npm start
```

The app will run on `http://localhost:4200` and proxy API calls to the backend on port 3000.

## 📁 Project Structure

```
client/
├── src/
│   ├── app/
│   │   ├── components/        # Angular components
│   │   │   ├── dashboard/     # Dashboard view
│   │   │   ├── streamers/     # Streamers list view
│   │   │   └── modals/        # Modal components
│   │   ├── services/          # API and business logic services
│   │   │   └── streamer.service.ts
│   │   ├── models/            # TypeScript interfaces
│   │   │   └── streamer.model.ts
│   │   ├── app.component.ts   # Root component
│   │   ├── app.config.ts      # App configuration
│   │   └── app.routes.ts      # Routing configuration
│   ├── assets/                # Static assets (images, etc.)
│   ├── environments/          # Environment configs
│   ├── styles.scss            # Global styles
│   ├── index.html            # HTML entry point
│   └── main.ts               # Application bootstrap
├── angular.json              # Angular CLI configuration
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── proxy.conf.json          # API proxy configuration
```

## 🛠️ Available Scripts

- `npm start` - Start development server (http://localhost:4200)
- `npm run build` - Build for production
- `npm run watch` - Build and watch for changes
- `npm test` - Run unit tests

## 🎨 Features

- **Modern Angular 17** with standalone components
- **TypeScript** for type safety
- **Reactive Programming** with RxJS
- **Lazy Loading** routes for better performance
- **HTTP Client** with interceptors
- **Responsive Design** - works on all devices
- **Chart.js** integration for beautiful visualizations
- **Kid-Friendly Theme** - colorful and playful UI

## 🔌 API Integration

The Angular app communicates with the Node.js backend:

### Development
- Frontend: `http://localhost:4200`
- Backend: `http://localhost:3000`
- Proxy: `/api/*` → `http://localhost:3000/api/*`

### Production
- Build outputs to `dist/`
- Backend serves static files
- API calls to `/api/*`

## 📦 Key Dependencies

- **@angular/core** - Angular framework
- **@angular/router** - Routing
- **@angular/forms** - Form handling
- **rxjs** - Reactive programming
- **chart.js** - Data visualization
- **ng2-charts** - Angular Chart.js wrapper

## 🚧 Development Status

### ✅ Completed
- Project setup and configuration
- TypeScript models and interfaces
- StreamerService with full CRUD operations
- Routing configuration
- Root AppComponent with navigation
- Environment configuration

### 🔄 In Progress
- Dashboard component
- Streamers component
- Modal components
- Global styles migration

### 📝 TODO
- Component implementation
- Chart integration
- Modal dialogs
- Form validation
- Error handling UI
- Loading states
- Animations

## 🎯 Next Steps

1. **Create Components**: Dashboard, Streamers, Modals
2. **Migrate Styles**: Convert CSS to SCSS
3. **Implement Charts**: ng2-charts integration
4. **Build Modals**: Add/Edit/Update modals
5. **Testing**: Unit and E2E tests

## 🔧 Configuration Files

- `angular.json` - Angular CLI configuration
- `tsconfig.json` - TypeScript compiler options
- `proxy.conf.json` - Development proxy settings
- `environment.ts` - Environment variables

## 📚 Learn More

- [Angular Documentation](https://angular.io/docs)
- [RxJS Documentation](https://rxjs.dev/)
- [Chart.js Documentation](https://www.chartjs.org/)

## 🤝 Backend Integration

Ensure the Node.js backend is running on port 3000:

```bash
# In parent directory
cd ../server
npm start
```

## 🎨 Styling

The app maintains the kid-friendly rainbow theme with:
- Playful fonts (Fredoka, Baloo 2)
- Vibrant colors
- Smooth animations
- Responsive design
- Rainbow gradients
