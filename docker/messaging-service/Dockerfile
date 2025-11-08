# Expects the Spring Boot jar and build resources to be present under build/ within the service folder
FROM openjdk:11.0.16-jdk

WORKDIR /app

# Install minimal tools useful for debugging: ping, curl and telnet, plus netcat
RUN apt-get update && apt-get install -y --no-install-recommends \
    netcat-openbsd iputils-ping curl telnet \
    && rm -rf /var/lib/apt/lists/*

# Copy the built jar into the image (you must run Gradle build on host first)
# Use repository-root relative paths so building from repo root works.
COPY services/messaging-service/build/libs/*.jar /app/app.jar

# Copy the built resources (application.properties, etc.) into /app/config
COPY services/messaging-service/build/resources/main/application.properties /app/config/application.properties

# Copy the entrypoint script (from repo root context)
COPY docker/messaging-service/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 8080 8082

ENV JAVA_OPTS="-Xms256m -Xmx512m"

ENTRYPOINT ["/app/entrypoint.sh"]

