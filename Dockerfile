FROM node:22-alpine

# Install pnpm globally
RUN npm i -g pnpm@10.32.1

WORKDIR /app

# Copy EVERYTHING (monorepo needs all workspace files, catalogs, etc.)
COPY . .

# Install all dependencies
RUN pnpm install --no-frozen-lockfile

# Build the server
RUN pnpm --filter server build

EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production

CMD ["pnpm", "--filter", "server", "start"]
