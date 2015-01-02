function WindowWidget(attributes, refreshFunction) {
  this.attributes = attributes;

  var self = this;
  this.cache = {};
  Object.keys(this.attributes).forEach(function (key) {
    self.cache[key] = refreshFunction(self.attributes[key]);
  });
}

function applyAttribute(attributes, name, element) {
  if (/^on/.test(name)) {
    element.addEventListener(name.substr(2), this[name]);
  }
}

WindowWidget.prototype.type = 'Widget';
WindowWidget.prototype.init = function () {
  console.log('init', this.attributes);

  applyPropertyDiffs(window, {}, this.attributes, {}, this.cache);

  return document.createTextNode('');
};

function uniq(array) {
  var sortedArray = array.slice();
  sortedArray.sort();

  var last;

  for(var n = 0; n < sortedArray.length;) {
    var current = sortedArray[n];

    if (last === current) {
      sortedArray.splice(n, 1);
    } else {
      n++;
    }
    last = current;
  }

  return sortedArray;
}

function applyPropertyDiffs(element, previous, current, previousCache, currentCache) {
  uniq(Object.keys(previous).concat(Object.keys(current))).forEach(function (key) {
    if (/^on/.test(key)) {
      var event = key.slice(2);

      var prev = previous[key];
      var curr = current[key];
      var refreshPrev = previousCache[key];
      var refreshCurr = currentCache[key];

      if (prev !== undefined && curr === undefined) {
        console.log('removing listener for ', key);
        element.removeEventListener(event, refreshPrev);
      } else if (prev !== undefined && curr !== undefined && prev !== curr) {
        console.log('updating listener for ', key);
        element.removeEventListener(event, refreshPrev);
        element.addEventListener(event, refreshCurr);
      } else if (prev === undefined && curr !== undefined) {
        console.log('adding listener for ', key);
        element.addEventListener(event, refreshCurr);
      } else {
        console.log('leaving listener for ', key);
      }
    }
  });
}

WindowWidget.prototype.update = function (previous) {
  var self = this;
  console.log('update');
  applyPropertyDiffs(window, previous.attributes, this.attributes, previous.cache, this.cache);
};

WindowWidget.prototype.destroy = function () {
  console.log('destroy');
  applyPropertyDiffs(window, this.attributes, {}, this.cache, {});
};

module.exports = function (attributes, refreshFunction) {
  return new WindowWidget(attributes, refreshFunction);
};
