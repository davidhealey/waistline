FROM alvrme/alpine-android:android-24-jdk8

WORKDIR /waistline/app

ENV GRADLE_VERSION 4.4.1

# installing dependencies
RUN apk add --no-cache --update curl ca-certificates unzip nodejs npm
# TODO: change destination folder to /opt
RUN curl -L https://services.gradle.org/distributions/gradle-$GRADLE_VERSION-bin.zip \
    -o gradle-$GRADLE_VERSION-bin.zip && \
    unzip gradle-$GRADLE_VERSION-bin.zip && \
    rm -f gradle-$GRADLE_VERSION-bin.zip && \
    ln -s gradle-$GRADLE_VERSION gradle
RUN npm i -g cordova

ENV GRADLE_HOME /waistline/app/gradle-$GRADLE_VERSION
ENV PATH $PATH:$GRADLE_HOME/bin

# building the app
COPY . .
