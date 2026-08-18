FROM alvrme/alpine-android:android-36-jdk17

# Set up some environment variables
ENV GRADLE_VERSION=8.14.2
ENV GRADLE_HOME=/opt/gradle-$GRADLE_VERSION
ENV ANDROID_HOME=/opt/sdk
ENV PATH=$PATH:$GRADLE_HOME/bin

# Install dependencies
WORKDIR /opt
RUN apk add --no-cache --update curl ca-certificates unzip nodejs npm
RUN curl -L https://services.gradle.org/distributions/gradle-$GRADLE_VERSION-bin.zip \
    -o gradle-$GRADLE_VERSION-bin.zip && \
    unzip gradle-$GRADLE_VERSION-bin.zip && \
    rm -f gradle-$GRADLE_VERSION-bin.zip && \
    ln -s gradle-$GRADLE_VERSION gradle
RUN npm install -g cordova

# Go to app directory
WORKDIR /waistline/app
