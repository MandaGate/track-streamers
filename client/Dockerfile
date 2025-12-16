# Stage 1: Build Angular App
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN yarn install

# Copy source code
COPY . .

# Build for production
RUN yarn build -- --configuration=production

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy build artifacts
COPY --from=build /app/dist/streamer-tracker /usr/share/nginx/html

# Copy Nginx configuration
# Copy from build context (not the build stage)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
