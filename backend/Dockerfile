# Use Eclipse Temurin JDK 17 for building
FROM eclipse-temurin:17-jdk-alpine AS build

WORKDIR /app

# Copy maven wrapper files and pom.xml
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Download dependencies (cached layer)
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw package -DskipTests -B

# Use JRE for running
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the built JAR file
COPY --from=build /app/target/*.jar app.jar

# Expose the application port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
