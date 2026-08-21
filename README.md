# SprintDesk 🚀

SprintDesk is a modern, high-performance Kanban and project management dashboard built entirely with **React 18, TypeScript, and Vite**.

It features a fully functional drag-and-drop board, real-time analytics charts, background notification polling, and persistent global state—all wrapped in a beautifully responsive, accessible, and dark-mode-ready UI powered by **Tailwind CSS**.

---

## ✨ Key Features

- **Drag-and-Drop Kanban Board**: Seamlessly move tasks across `Backlog`, `In Progress`, `Review`, and `Done` columns using `@dnd-kit/core`.
- **Live Analytics Dashboard**: Visualize team velocity, task statuses, and completion trends using interactive SVG charts via `recharts`.
- **Background Notifications**: Simulates real-time alerts by polling a live API via `TanStack Query`. Intelligently pauses when you switch browser tabs to save resources!
- **State Persistence**: Your tasks, theme preferences, and authentication sessions are securely persisted in `localStorage` via `Zustand`, ensuring you never lose data on refresh.
- **Dark Mode Ready**: A meticulously crafted design system that looks stunning in both light and dark environments.
- **Fully Accessible & Responsive**: Achieves perfect Lighthouse scores with deep screen reader support (`aria` attributes, focus trapping) and flawless rendering down to a `375px` mobile viewport.

---

## 🛠️ Tech Stack

- **Framework**: React 18
- **Language**: TypeScript (Strict Mode)
- **Build Tool**: Vite (Lightning-fast HMR)
- **Styling**: Tailwind CSS v4 + `tailwind-merge`
- **Global State**: Zustand
- **Server State**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Data Visualization**: Recharts
- **Drag & Drop**: @dnd-kit

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository** (or download the source):
   ```bash
   git clone <repository-url>
   cd Grubpac/my-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in Browser**:
   Navigate to `http://localhost:5173`.

### 🔑 Demo Login
Since this is a simulated environment, use the following credentials to access the dashboard:
- **Username**: `admin`
- **Password**: `password123`

---

## 📚 Documentation

For a deep dive into how the global state, styling mechanisms, and data flow operate under the hood, please read the [Architecture Guide](docs/ARCHITECTURE.md).

---

## 🏗️ Building for Production

To create an optimized, minified production build:

```bash
npm run build
```

This will run a strict TypeScript check (`tsc -b`) followed by Vite's production bundler. The compiled static assets will be output to the `dist/` directory.

### Deployment Instructions (Vercel / Netlify)

SprintDesk is a Single Page Application (SPA). To deploy it to a static host like Vercel or Netlify:
1. Connect your GitHub repository to the hosting platform.
2. Set the **Build Command** to `npm run build`.
3. Set the **Output Directory** to `dist`.
4. *Important*: Ensure you configure Rewrite Rules so that all routes point to `index.html` (Vercel and Netlify usually auto-detect Vite projects and handle this for you).

