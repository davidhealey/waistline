# csp-parse

NodeJS module for parsing Content-Security-policy policies.

The module takes raw CSP policy strings, and parses them into Policy objects. From there the objects can be manipulated (adding/removing different values from the directives).

Afterwards policy.toString() can be called to get the updated policy.

## Installation

```
npm install csp-parse
```

Or to use as plain javascript, remove the last line.

## Usage

```javascript
var Policy = require('csp-parse');

var example = "script-src 'self' www.google-analytics.com ajax.googleapis.com; style-src 'self';"
var policy = new Policy(example)

policy.get('script-src') // "'self' www.google-analytics.com ajax.googleapis.com"
policy.add('script-src', 'code.jquery.com');
policy.get('script-src') // "'self' www.google-analytics.com ajax.googleapis.com code.jquery.com"

policy.toString() // "script-src 'self' www.google-analytics.com ajax.googleapis.com code.jquery.com; style-src 'self';"

policy.set('connect-src', 'socket.webserver.com socket2.webserver.com');

policy.toPrettyString()
//script-src
//  'self' www.google-analytics.com ajax.googleapis.com code.jquery.com;
//style-src
//  'self';
//connect-src
//  socket.webserver.com socket2.webserver.com
```

For more examples see the test cases.

## API

### Policy(string)
  Takes a CSP policy and returns a Policy object.

### policy.get(string directive)
  Returns a list of allowed values for 'directive'

### policy.add(string directive, string value)
  Adds the value to the directive string

### policy.set(string diretcive, string line)
  Sets the 'directive' value to 'line'

### Policy.toString()
  Returns string representation of policy

### Policy.toPrettyString()
  Returns a pretty string representation of the policy

## Test

```
mocha
```

/brain explodes

## Contact

c0nrad@c0nrad.io
