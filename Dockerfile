# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine AS runner

# Copy static assets from builder stage
COPY --from=builder /app/out /usr/share/nginx/html

# Copy custom nginx config if needed (optional, using default for now which works for static)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
