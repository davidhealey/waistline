'use strict';

function Policy(policy) {
  // Allow empty policies
  if (!policy) {
    this.raw = '';
    this.directives = {};
    return this;
  }

  policy = policy.toLowerCase();

  this.raw = policy;
  this.directives = {};

  var directives = this.raw.split(';');
  for (var i = 0; i < directives.length; ++i) {
    var directive = directives[i].trim();
    var tokens = directive.split(/\s+/);

    var name = tokens[0];
    if (!name) {
      continue;
    }
    var values = tokens.slice(1, tokens.length);
    this.directives[name] = values.join(' ');
  }
  return this;
}

Policy.prototype.get = function(directive) {
  if (!this.directives[directive])
    return '';
  return this.directives[directive];
};

Policy.prototype.add = function(directive, value) {
  if (!this.directives[directive]) {
    this.directives[directive] = value;
  } else {
    this.directives[directive] += ' ' + value;
  }
  return this.directives[directive];
};

Policy.prototype.set = function(directive, value) {
  if (!value) {
    delete this.directives[directive];
    return;
  }
  this.directives[directive] = value;
  return this.directives[directive];
};

Policy.prototype.remove = function(directive, value) {
  if (!this.directives[directive]) {
    return;
  } else {
    var directiveValues = this.directives[directive].split(' ');
    var index = directiveValues.indexOf(value);
    if (index > -1) {
      directiveValues.splice(index, 1);
      this.directives[directive] = directiveValues.join(' ');
    }
  }
};

Policy.prototype.toString = Policy.prototype.string = function() {
  var out = '';
  for (var directive in this.directives) {
    if (this.directives[directive]) {
      out += directive + ' ' + this.directives[directive] + '; ';
    }
  }
  return out.trim();
};

Policy.prototype.toPrettyString = Policy.prototype.prettyString = function() {
  var out = '';
  for (var directive in this.directives) {
    if (this.directives[directive]) {
      out += directive+'\n\t'+this.directives[directive]+';\n';
    }
  }
  return out.substring(0,out.length-1);
};

module.exports = Policy;
