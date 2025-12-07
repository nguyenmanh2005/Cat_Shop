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

# Create uploads directory BEFORE switching to non-root user
RUN mkdir -p /app/uploads

# Copy jar from build stage (as root) - find jar file dynamically
# Spring Boot creates jar with pattern: artifactId-version.jar
# But we'll copy any jar file that matches the pattern
COPY --from=build --chown=spring:spring /app/target/catshop-*.jar app.jar

# Verify jar file exists and is readable
RUN ls -la app.jar && \
    test -f app.jar || (echo "ERROR: app.jar not found!" && \
    echo "Listing /app/target/:" && \
    ls -la /app/target/ 2>&1 || true && \
    exit 1)

# Set ownership for all files to spring user
RUN chown -R spring:spring /app

# Switch to non-root user
USER spring:spring

# Verify jar is accessible
RUN test -r app.jar || (echo "ERROR: Cannot read app.jar!" && ls -la app.jar && exit 1)

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]

