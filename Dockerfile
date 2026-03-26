# ==========================================
# Stage 1: Build the React Application
# ==========================================
FROM node:20-alpine AS build

# Set working directory inside the container
WORKDIR /app

# Copy the frontend package.json
COPY package*.json ./

# Install frontend dependencies
RUN npm install

# Copy the rest of the React code
COPY . .

# Build the React app for production
# (If using Vite, change "build" to the appropriate build script if different)
RUN npm run build

# ==========================================
# Stage 2: Serve the App with Nginx
# ==========================================
# Use the official Nginx image
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output from Stage 1 to Nginx's serving directory
# Note: If you used Vite, the folder is usually /app/dist instead of /app/build
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 (Nginx default)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]