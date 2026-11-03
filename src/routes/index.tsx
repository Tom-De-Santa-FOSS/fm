import { createFileRoute } from "@tanstack/react-router";

const Home = () => (
  <main>
    <h1>Welcome to TanStack Start</h1>
    <p>
      Edit <code>src/routes/index.tsx</code> to get started.
    </p>
  </main>
);

export const Route = createFileRoute("/")({ component: Home });
