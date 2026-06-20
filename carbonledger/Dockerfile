# Stage 1: Build the React frontend
FROM node:22-alpine AS build-frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the Spring Boot backend embedding the frontend static files
FROM maven:3.9.6-eclipse-temurin-21 AS build-backend
WORKDIR /app/backend
COPY backend/pom.xml ./
COPY backend/src ./src
# Copy the built React assets into Spring Boot's static resources directory
COPY --from=build-frontend /app/frontend/dist ./src/main/resources/static/
RUN mvn clean package -DskipTests

# Stage 3: Run the unified application in a lightweight JRE
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build-backend /app/backend/target/backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
