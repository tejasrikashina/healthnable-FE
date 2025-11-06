# Step 1: Use Node.js base image for building the application
FROM node:18 AS build
 
# Set the working directory to /app
WORKDIR /app
 
# Copy package.json and package-lock.json (from the root of your project)
COPY package*.json ./
 
# Install dependencies for the Angular project
# RUN npm install
RUN npm install --no-audit --no-fund
 
# Copy the entire Angular project into the container
COPY . .
 
# Build the Angular project with the appropriate baseHref
ARG BASE_HREF="/healthnable_foundation/" # Default base href
RUN npm run build -- --configuration=production --base-href ${BASE_HREF}
 
# Step 2: Use NGINX to serve the Angular application
FROM nginx:alpine
 
# Set working directory to /usr/share/nginx/html
WORKDIR /usr/share/nginx/html
 
# Remove the default NGINX static files
RUN rm -rf ./*
 
# Copy the built Angular files from the previous step
COPY --from=build /app/dist/healthnable-foundation-app/ /usr/share/nginx/html/
 
# Copy custom NGINX configuration for Angular routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
 
# Expose port 80 for the application
EXPOSE 80
 
# Start NGINX server
CMD ["nginx", "-g", "daemon off;"]