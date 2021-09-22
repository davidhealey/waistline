FROM alvrme/alpine-android:android-30-jdk8

# Set up some environment variables
ENV GRADLE_VERSION 7.1.1
ENV GRADLE_HOME /opt/gradle-$GRADLE_VERSION
ENV PATH $PATH:$GRADLE_HOME/bin

# Install dependencies
WORKDIR /opt
RUN apk add --no-cache --update curl ca-certificates unzip nodejs npm
RUN curl -L https://services.gradle.org/distributions/gradle-$GRADLE_VERSION-bin.zip \
    -o gradle-$GRADLE_VERSION-bin.zip && \
    unzip gradle-$GRADLE_VERSION-bin.zip && \
    rm -f gradle-$GRADLE_VERSION-bin.zip && \
    ln -s gradle-$GRADLE_VERSION gradle
RUN npm install -g cordova

# Because some commands ask if we want to opt in
RUN cordova telemetry off

# Create app directory
WORKDIR /waistline/app

# Build the app when the container is run
CMD ["./docker/android.start.sh"]
