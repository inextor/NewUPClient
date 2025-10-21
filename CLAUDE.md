# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NewUPClient is an Angular 19.2 single-page application using standalone components architecture. The app provides user, role, and item management functionality with authentication.

## Development Commands

### Start Development Server
```bash
npm start
# or
ng serve
```
Server runs on http://localhost:4200/

### Build
```bash
npm run build          # Production build
npm run watch          # Development build with watch mode
```
Build output: `dist/new-upclient/`

### Testing
```bash
npm test              # Run unit tests with Karma
ng test               # Same as above
```

### Code Generation
```bash
ng generate component component-name    # Generate standalone component
ng generate service service-name        # Generate service
ng generate guard guard-name            # Generate guard
```

All generated components should be standalone (this is the default in this project).

## Architecture

### Core Architecture Patterns

**Layout-Based Routing**: The app uses a nested routing structure:
- `MainComponent` (`src/app/pages/main/main.component.ts`) serves as the layout shell with collapsible side navigation
- Protected routes (requiring authentication) are children of `MainComponent`
- Public routes (login, logout) render independently without the layout
- All routes defined in `src/app/app.routes.ts`

**Authentication Flow**:
- `authGuard` (`src/app/guards/auth.guard.ts`) protects routes by checking `RestService.is_logged_in`
- Auth state loaded from localStorage on guard activation
- RestService manages: user, session, permission, store, and bearer token
- Logout clears localStorage and redirects to `/login`

**Data Layer Architecture**:
- `Rest<T,U>` class (`src/app/classes/Rest.ts`): Generic HTTP client wrapper using native fetch API
- Supports CRUD operations: get, search, create, update, delete
- Advanced feature: `searchWithRelations()` - performs automatic data joining by fetching related entities and merging them into result objects
- `RestEndPoint` interface: defines base_url and bearer token contract
- `RestService` implements `RestEndPoint` and provides app-wide configuration

**Models Organization**:
- `src/app/models/RestModels/`: TypeScript interfaces matching backend entities (User, Role, Session, etc.)
- `src/app/models/Empties/`: Factory functions returning empty/default instances of models
- `src/app/models/GetEmpty.ts`: Centralized static class to access all empty model factories
- `src/app/models/POSModels/`: Point of sale related models

### State Management

Application state is centralized in `RestService`:
- User authentication data stored in localStorage
- Bearer token automatically retrieved from localStorage if not set
- Observable-based error messaging system via `error_behavior_subject`

### Error Handling & User Feedback

`RestService` provides centralized error handling:
- `showError(error, auto_hide?)`: Display error messages
- `showSuccess(message)`: Display success messages
- `getErrorString(error)`: Extract user-friendly error messages from various error formats
- Errors broadcast via RxJS BehaviorSubject for components to subscribe

### Multi-Domain Configuration

The app supports deployment under sub-paths (e.g., `/produccion`):
- `RestService.externalAppBaseUrl`: Use this for constructing external links
- For internal navigation between app pages: **always use Angular's `routerLink` directive**
- Do not hardcode paths for navigation

### Backend Communication

- Base URL configured in `RestService.base_url` (defaults to `http://localhost/NewUpServer`)
- Secondary POS API endpoint in `RestService.pos_rest`
- All requests include bearer token via Authorization header
- Uses native fetch API (not HttpClient)

## File Structure Conventions

```
src/app/
├── classes/           # Core utility classes (Rest, RestEndPoint, ErrorMessage, etc.)
├── components/        # Reusable UI components (menu, header, attachment-uploader, toas-message)
├── guards/            # Route guards (authGuard)
├── models/
│   ├── RestModels/    # Backend entity TypeScript interfaces
│   ├── Empties/       # Default/empty model factory functions
│   ├── POSModels/     # Point of sale models
│   └── GetEmpty.ts    # Centralized access to all empty model factories
├── pages/             # Route-level page components (login, main, list-user, save-role, etc.)
├── pipes/             # Custom pipes (short-date, image)
├── services/          # Singleton services (RestService, ConfirmationService)
└── app.routes.ts      # Application routing configuration
```

## Styling

- Bootstrap 5.3.8 is included globally via angular.json
- **Use Bootstrap classes when possible** for consistent styling
- Component-scoped CSS for custom styles
- Global styles in `src/styles.css`

## Development Workflow

### Multi-Instance Development
- Developers frequently work with multiple project instances/branches running simultaneously
- Each instance typically has its own:
  - Terminal/console session
  - Browser tab (usually on different ports)
  - Local server instance
- **When investigating errors**: Always verify you're checking the correct terminal and browser tab that corresponds to the specific branch/instance where the error occurred
- Common pitfall: The error may be appearing in a different branch's terminal or browser tab than expected

## Important Notes

- All components are standalone (do not use NgModules)
- When adding new models, create both the interface in RestModels/ and the empty factory in Empties/, then register in GetEmpty.ts
- Authentication state persists in localStorage with keys: session, user, permission, store
- The Rest<T,U> class bearer property must be set for authenticated requests
