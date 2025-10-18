## Project Overview

This is a single-page application built with Angular (version 17+). It uses a modern, standalone-component architecture. The application features a layout-based routing system to provide a consistent user experience.

- **Core Framework:** Angular
- **Language:** TypeScript
- **Architecture:** Standalone Components
- **Styling:** use bootstrap when posible, CSS (scoped to components)

### Key Architectural Features

- **Layout-Based Routing:** The application uses a `DefaultLayoutComponent` that provides a consistent UI shell with a collapsible side navigation menu for most pages. Auth-related pages like `Login` and `Logout` are rendered independently without the main layout.
- **Centralized Routing:** All application routes are defined in `src/app/app.routes.ts`.
- **Service Layer:** The `RestService` (`src/app/services/rest.service.ts`) is responsible for handling communication with the backend API, managing authentication state, and providing error handling.
- **Multi-Domain Awareness:** The project is configured for a multi-domain setup. The `RestService` contains logic to determine the correct `externalAppBaseUrl` for generating external links, which is crucial for environments where the application is served from a sub-path (e.g., `/produccion`). Internal navigation should use Angular's `routerLink`.

## Development Conventions

- **Component Generation:** Use the Angular CLI to scaffold new components, ensuring they are created as `standalone`.
- **Routing:**
    - For internal navigation between pages, always use the `routerLink` directive.
    - For external links, use the `externalAppBaseUrl` property from `RestService` to construct the URL dynamically.
- **State Management:** Application state (like user and session data) is managed within the `RestService` and persisted to `localStorage`.
- **Error Handling:** The `RestService` provides a centralized mechanism for displaying success and error messages to the user via a toast-like notification system.

# Prohibitions

- Never do `commit --amend ` of any type commands
