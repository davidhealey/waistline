FROM alvrme/alpine-android:android-31-jdk11

# Set up some environment variables
ENV GRADLE_VERSION 7.1.1
ENV GRADLE_HOME /opt/gradle-$GRADLE_VERSION
ENV ANDROID_HOME /opt/sdk
ENV PATH $PATH:$GRADLE_HOME/bin

# Install dependencies
WORKDIR /opt
RUN apk add --no-cache --update curl ca-certificates unzip nodejs npm
RUN curl -L https://downloads.gradle-dn.com/distributions/gradle-$GRADLE_VERSION-bin.zip \
    -o gradle-$GRADLE_VERSION-bin.zip && \
    unzip gradle-$GRADLE_VERSION-bin.zip && \
    rm -f gradle-$GRADLE_VERSION-bin.zip && \
    ln -s gradle-$GRADLE_VERSION gradle
RUN npm install -g cordova

# Because some commands ask if we want to opt in
RUN cordova telemetry off

# Cordova needs Android build tools 30.0.3
RUN sdkmanager "build-tools;30.0.3"
ENV PATH $PATH:$ANDROID_HOME/build-tools/30.0.3

# Create app directory
WORKDIR /waistline/app

# Build the app when the container is run
CMD ["./docker/android.start.sh"]
