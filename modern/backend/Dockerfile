# Stage 1: Build with Maven
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies first (layer caching)
RUN mvn dependency:go-offline --no-transfer-progress -q
COPY src ./src
RUN mvn package -DskipTests --no-transfer-progress -q

# Stage 2: Slim runtime image
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/banking-modern-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.datasource.url=jdbc:sqlite:/data/legacybank.db"]
