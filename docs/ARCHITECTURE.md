# SprintDesk Architecture

This document provides a high-level overview of the SprintDesk application architecture, designed for maximum performance, strict type safety, and seamless state management.

## Tech Stack Overview

- **Core Framework**: React 18 + TypeScript (Strict Mode)
- **Build Tool**: Vite (Lightning-fast HMR and optimized production builds)
- **Styling**: Tailwind CSS v4 + `clsx` & `tailwind-merge`
- **Global State**: Zustand (with Persistence middleware)
- **Server State / API**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Data Visualization**: Recharts
- **Drag and Drop**: `@dnd-kit/core`

---

## State Management Strategy

We employ a strict separation of concerns regarding state:

### 1. Server State (`TanStack Query`)
All asynchronous data fetching, caching, and background polling is handled by TanStack Query. 
- Example: **Notifications**. The `useNotificationPolling` hook polls the simulated JSONPlaceholder API in the background. TanStack Query automatically manages the cache, pauses polling on window blur to save resources, and resumes immediately upon focus.

### 2. Global UI & Domain State (`Zustand`)
Synchronous, cross-component state is managed by lightweight Zustand stores:
- **`useBoardStore`**: The central source of truth for all Kanban tasks. Manages adding, moving, and updating tasks. It uses Zustand's `persist` middleware to save state to `localStorage`, ensuring data survives hard refreshes without needing a real backend.
- **`useAuthStore`**: Manages the authentication JWT tokens and the currently logged-in user profile.
- **`useThemeStore`**: Manages the Light/Dark mode preference (also persisted to `localStorage`).
- **`useNotificationStore`**: Holds the structured notification data mapped from the API, managing read/unread states and deduplication.

### 3. Local State (`React.useState`)
Used exclusively for isolated UI states, such as managing whether a dropdown is open or tracking temporary form inputs before submission.

---

## Component Architecture

We adhere to a heavily modular, feature-based directory structure to keep the codebase scalable:

```
src/
├── app/               # Global setup (Router, Providers, App root)
├── components/        
│   ├── layout/        # Structural components (Sidebar, Header, AppLayout)
│   └── ui/            # Reusable, stateless Design System components (Button, Modal, Input)
├── features/          # Domain-specific modules
│   ├── analytics/     # Recharts dashboard 
│   ├── auth/          # Login & session handling
│   ├── board/         # Kanban drag-and-drop logic
│   └── dashboard/     # Summary metrics
├── hooks/             # Custom React hooks (e.g., useNotificationPolling)
├── lib/               # Utility functions (e.g., Tailwind cn merge)
├── services/          # External API interaction layers (e.g., fetch, axios)
└── stores/            # Zustand global stores
```

### The Design System (`src/components/ui`)
We built our own accessible, unstyled primitives heavily inspired by `Radix UI` and `shadcn/ui`.
- **Styling mechanism**: We export components wrapped with `cn()`, a utility that combines `clsx` (for conditional classes) and `tailwind-merge` (to elegantly resolve conflicting utility classes).
- **Accessibility**: All interactive UI components are equipped with semantic HTML and appropriate `aria-*` attributes (e.g., `aria-invalid` on form errors, `role="dialog"` on modals).

---

## Data Flow (Mock API)

Since this project was built without a real backend, we utilize a combination of static mock data and simulated API calls:
- **Auth**: The `apiClient.ts` intercepts requests and simulates network latency, returning a mock JWT token if the credentials are correct.
- **Tasks**: Seeded from `public/mock-data.json` on the first load, then mutated and persisted entirely within the browser via Zustand.
- **Notifications**: Fetched live from the public `JSONPlaceholder` API using TanStack Query.

---

## Future Extensibility

To connect this application to a real backend (e.g., Node.js/PostgreSQL):
1. **Auth**: Swap the hardcoded credentials in `authService.ts` to POST to your `/login` endpoint. Keep the JWT storage logic intact.
2. **Tasks**: Replace the Zustand `persist` middleware with TanStack Query mutations (e.g., `useMutation`) inside the Kanban board to POST/PATCH task status changes to your REST/GraphQL API. The UI components will remain unchanged.
