# --------- Build Stage ---------
    FROM node:18-alpine AS builder

    WORKDIR /app
    
    RUN npm install -g pnpm
    
    COPY package.json pnpm-lock.yaml ./
    RUN pnpm install --frozen-lockfile
    
    COPY . .
    RUN pnpm run build
    
    # --------- Production Stage ---------
    FROM node:18-alpine
    
    WORKDIR /app
    
    RUN npm install -g pnpm
    
    # COPY --from=builder /app/package.json ./
    # COPY --from=builder /app/pnpm-lock.yaml ./
    # COPY --from=builder /app/.next ./.next
    # COPY --from=builder /app/public ./public
    # COPY --from=builder /app/node_modules ./node_modules
    # COPY --from=builder /app/next.config.js ./
    # COPY --from=builder /app/articles ./articles

    ENV NODE_ENV=production
    EXPOSE 4287
    
    CMD ["pnpm", "start"]
    