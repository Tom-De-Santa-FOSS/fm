dev:
    bun run db:migrate
    bun run db:seed
    bunx --no-install vite dev
