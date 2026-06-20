# Stage 1: Build the React application
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Set build-time variables
ARG VITE_API_BASE
ENV VITE_API_BASE=$VITE_API_BASE

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Serve the static files
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
