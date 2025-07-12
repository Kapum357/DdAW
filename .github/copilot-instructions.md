# Copilot Instructions for AI Coding Agents

## Project Overview
- **Architecture:** Full-stack web platform for order and inventory management. Backend (Node.js/Express, MongoDB) exposes a RESTful API; frontend is a React SPA (Vite) with global state and modular components.
- **User Roles:** Client and POS operator, with role-based access and JWT authentication.
- **Key Flows:** Product browsing, order lifecycle (creation, confirmation, tracking), inventory CRUD, reviews, and notifications.

## Directory Structure & Key Files
- `backend/` — Express app, models, routes, middleware, config, Dockerfile.
- `frontend/` — React SPA, Vite config, components, context, features, Dockerfile.
- `src/` (backend) — Modernized backend code: controllers, DTOs, services, repositories, routes, middleware, models, utils.
- `docker-compose.yml` — Multi-service orchestration for local/dev environments.

## Patterns & Conventions
- **Backend:**
  - MVC structure: Controllers (`src/controllers`), Services (`src/services`), Repositories (`src/repositories`).
  - DTOs for data transfer and validation.
  - Custom middlewares for auth, error handling, security, and validation.
  - Models use Mongoose for MongoDB.
  - API endpoints grouped by resource in `routes/`.
  - Use environment variables for secrets/config.
- **Frontend:**
  - Components organized by domain (auth, products, orders, layout, common).
  - Context API for global state (auth, notifications).
  - Features directory for domain logic (inventory, orders, products).
  - Use of Material UI and responsive design principles.

## Developer Workflows
- **Build/Run:**
  - Use `docker-compose up` for full-stack local development.
  - Backend: `npm install && npm start` in `backend/`.
  - Frontend: `npm install && npm run dev` in `frontend/`.
- **Debugging:**
  - Backend: Use nodemon or VS Code launch configs for hot reload.
  - Frontend: Vite HMR, React DevTools.
- **Linting:**
  - Frontend uses ESLint (`eslint.config.js`).

## Integration Points
- **API:** Frontend communicates with backend via RESTful endpoints (see `routes/` and `services/`).
- **Auth:** JWT-based, enforced via middleware.
- **Notifications:** Asynchronous, handled in backend and surfaced in frontend context/components.
- **Docker:** Both frontend and backend have Dockerfiles; use `docker-compose.yml` for orchestration.

## Project-Specific Tips
- Always validate user input in backend using custom schemas/middleware.
- Use DTOs for consistent data exchange between layers.
- Keep business logic in services, not controllers.
- For new features, follow the domain-driven structure in both frontend (`features/`, `components/`) and backend (`services/`, `repositories/`).
- Reference `README.md` for architectural rationale and requirements.
