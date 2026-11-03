# Keep automatic migrations and seeds away from any external DATABASE_URL.
[env("DATABASE_URL", "postgres://postgres:postgres@127.0.0.1:55432/fm")]
dev:
    docker compose up --wait --wait-timeout 60 postgres
    bun run db:migrate
    bun run db:seed
    bunx --no-install vite dev --port 3000
