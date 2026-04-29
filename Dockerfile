FROM node:22-alpine

# Install pnpm globally
RUN npm i -g pnpm@10.32.1

WORKDIR /app

# Copy EVERYTHING (monorepo needs all workspace files, catalogs, etc.)
COPY . .

# Show what files are present for debugging
RUN ls -la && cat pnpm-workspace.yaml

# Install all dependencies (verbose to see errors)
RUN pnpm install --no-frozen-lockfile 2>&1 || (echo "=== PNPM INSTALL FAILED ===" && cat /root/.npm/_logs/*.log 2>/dev/null; exit 1)

# Build the server
RUN pnpm --filter server build

EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production

CMD ["pnpm", "--filter", "server", "start"]
