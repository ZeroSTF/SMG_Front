# Use an official Node.js runtime as a parent image
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy the Angular project files
COPY . .

# Install the dependencies and build the Angular app
RUN npm install && npm run build --prod

# Stage 2: Use Nginx to serve the Angular app
FROM nginx:alpine

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built app from the previous stage to Nginx's default public directory
COPY --from=build /app/dist/smg /usr/share/nginx/html

# Expose the port Nginx is running on
EXPOSE 80
