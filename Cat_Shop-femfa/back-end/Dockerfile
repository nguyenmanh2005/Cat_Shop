# Build stage
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml first
COPY pom.xml .

# Download dependencies (this helps with caching)
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Debug: List all service files to verify CaptchaService exists
RUN echo "=== Checking service files ===" && \
    ls -la src/main/java/com/catshop/catshop/service/ || true && \
    echo "=== Checking CaptchaService ===" && \
    ls -la src/main/java/com/catshop/catshop/service/CaptchaService.java || \
    (echo "ERROR: CaptchaService.java not found!" && \
     find . -name "*.java" -type f | head -20 && \
     exit 1)

# Build application with verbose output
RUN mvn clean package -DskipTests -X 2>&1 | tail -100 || \
    (echo "=== Build failed, showing errors ===" && \
     mvn clean package -DskipTests -e 2>&1 | tail -200 && \
     exit 1)

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]

