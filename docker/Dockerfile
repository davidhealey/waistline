FROM alpine:3

# To be able to customize builds
ARG NPM_INSTALL_ARG="-g cordova"
ARG CORDOVA_TELEMETRY_OPTION="off"

# Create app directory
WORKDIR /usr/src/

# Install dependencies
COPY package*.json ./
RUN apk add --no-cache --update nodejs npm && \
npm install ${NPM_INSTALL_ARG}

# Because some commands ask if we want to opt in
RUN cordova telemetry ${CORDOVA_TELEMETRY_OPTION}

# Bundle source code
COPY . .

EXPOSE 8000
