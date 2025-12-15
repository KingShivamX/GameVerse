@REM Maven Wrapper CMD Script
@echo off
setlocal

set WRAPPER_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"
set WRAPPER_JAR="%~dp0.mvn\wrapper\maven-wrapper.jar"
set MAVEN_HOME="%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.6"

if not exist %WRAPPER_JAR% (
    echo Downloading Maven Wrapper...
    powershell -Command "Invoke-WebRequest -Uri %WRAPPER_URL% -OutFile %WRAPPER_JAR% -UseBasicParsing"
)

java -jar %WRAPPER_JAR% %*
