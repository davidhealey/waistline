FROM waistline:base

RUN cordova build browser
CMD cordova run browser
