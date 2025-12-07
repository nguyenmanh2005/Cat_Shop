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

# Build application (save full output to file for debugging)
RUN mvn clean package -DskipTests > /tmp/build.log 2>&1 || \
    (echo "=== Build failed ===" && \
     cat /tmp/build.log && \
     exit 1)

# Verify build succeeded and jar file exists
RUN echo "=== Checking build result ===" && \
    echo "Build log tail:" && \
    tail -50 /tmp/build.log && \
    echo "=== Listing target directory ===" && \
    ls -la /app/target/ && \
    echo "=== Looking for jar files ===" && \
    find /app/target -name "*.jar" -type f && \
    echo "=== Verifying jar file ===" && \
    JAR_COUNT=$(find /app/target -name "*.jar" -type f | wc -l) && \
    if [ "$JAR_COUNT" -eq 0 ]; then \
        echo "ERROR: No jar file found after build!" && \
        echo "Full build log:" && \
        cat /tmp/build.log && \
        exit 1; \
    fi && \
    echo "Found $JAR_COUNT jar file(s)"

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S spring && adduser -S spring -G spring

# Create uploads directory BEFORE switching to non-root user
RUN mkdir -p /app/uploads

# Copy target directory from build stage to inspect
COPY --from=build /app/target /tmp/target

# Debug: List what was copied
RUN echo "=== Listing copied files ===" && \
    ls -la /tmp/target/ || echo "No target directory"

# Find and copy the jar file to app.jar
# Spring Boot creates jar with pattern: artifactId-version.jar
RUN echo "=== Finding jar file ===" && \
    JAR_FILE=$(find /tmp/target -name "*.jar" -type f ! -name "*-sources.jar" ! -name "*-javadoc.jar" | head -1) && \
    if [ -z "$JAR_FILE" ]; then \
        echo "ERROR: No jar file found!" && \
        echo "Listing /tmp/target/:" && \
        ls -la /tmp/target/ && \
        echo "Looking for any jar files:" && \
        find /tmp/target -name "*.jar" -type f || true && \
        echo "Looking for all files:" && \
        find /tmp/target -type f | head -20 && \
        exit 1; \
    fi && \
    echo "Found jar file: $JAR_FILE" && \
    cp "$JAR_FILE" /app/app.jar && \
    chown spring:spring /app/app.jar && \
    ls -la /app/app.jar && \
    echo "Jar file copied successfully"

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

# Run application with memory limits
# -Xmx512m: Maximum heap size 512MB
# -Xms256m: Initial heap size 256MB
# -XX:+UseG1GC: Use G1 garbage collector (better for low memory)
# -XX:MaxMetaspaceSize=128m: Limit metaspace
# -XX:+ExitOnOutOfMemoryError: Exit immediately on OOM
ENTRYPOINT ["java", "-Xmx512m", "-Xms256m", "-XX:+UseG1GC", "-XX:MaxMetaspaceSize=128m", "-XX:+ExitOnOutOfMemoryError", "-jar", "app.jar"]

