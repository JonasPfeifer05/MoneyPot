FROM oven/bun
WORKDIR /app
COPY . .
WORKDIR /app/backend
RUN bun install
CMD ["bun", "index.ts"]