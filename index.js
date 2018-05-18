const fs = require('fs');
const async = require('async');
const _ = require('lodash');
const Benchmark = require('benchmark');
const beauty = require('beautify-benchmark');

// typescript
var __extends = (this && this.__extends) || (function () {
  var extendStatics = Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
      function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
  return function (d, b) {
      extendStatics(d, b);
      function __() { this.constructor = d; }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
})();

const benchmarks = {
  'create class A': {
    'prototype': () => {
      return {
        fn() {
          const A = function() {};
          A.prototype.x = function() {};
        },
      };
    },
    'es15': () => {
      return {
        fn() {
          class A {
            x() {}
          };
        },
      };
    },
    'typescript': () => {
      return {
        fn() {
          var A = /** @class */ (function () {
            function A() {
            }
            A.prototype.x = function () { };
            return A;
          }());
        },
      };
    },
  },
  'create instance A': {
    'prototype': () => {
      const A = function() {};
      A.prototype.x = function () { };
      return {
        fn() {
          new A();
        },
      };
    },
    'es15': () => {
      class A {
        x() {}
      };
      return {
        fn() {
          new A();
        },
      };
    },
    'typescript': () => {
      var A = /** @class */ (function () {
        function A() {
        }
        A.prototype.x = function () { };
        return A;
      }());
      return {
        fn() {
          new A();
        },
      };
    },
  },
  'create class B from A': {
    'prototype': () => {
      const A = function() {};
      A.prototype.x = function () { };
      return {
        fn() {
          const B = function() {};
          B.prototype = new A();
        },
      };
    },
    'es15': () => {
      class A {
        x() {}
      };
      return {
        fn() {
          class B extends A {};
        },
      };
    },
    'typescript': () => {
      var A = /** @class */ (function () {
        function A() {
        }
        A.prototype.x = function () { };
        return A;
      }());
      return {
        fn() {
          var B = /** @class */ (function (_super) {
            __extends(B, _super);
            function B() {
              return _super !== null && _super.apply(this, arguments) || this;
            }
            return B;
          }(A));
        },
      };
    },
  },
  'create instance B': {
    'prototype': () => {
      const A = function() {};
      A.prototype.x = function () { };
      const B = function() {};
      B.prototype = new A();
      return {
        fn() {
          new B();
        },
      };
    },
    'es15': () => {
      class A {
        x() {}
      };
      class B extends A {};
      return {
        fn() {
          new B();
        },
      };
    },
    'typescript': () => {
      var A = /** @class */ (function () {
        function A() {
        }
        A.prototype.x = function () { };
        return A;
      }());
      var B = /** @class */ (function (_super) {
        __extends(B, _super);
        function B() {
          return _super !== null && _super.apply(this, arguments) || this;
        }
        return B;
      }(A));
      return {
        fn() {
          new B();
        },
      };
    },
  },
  'create instance B with constructor': {
    'prototype (not supported)': () => {
      const A = function() {};
      A.prototype.x = function () { };
      const B = function() {};
      B.prototype = new A();
      return {
        fn() {
          new B();
        },
      };
    },
    'es15': () => {
      class A {
        constructor() {}
        x() {}
      };
      class B extends A {
        constructor() {
          super();
        }
      };
      return {
        fn() {
          new B();
        },
      };
    },
    'typescript': () => {
      var A = /** @class */ (function () {
        function A() {
        }
        A.prototype.x = function () { };
        return A;
      }());
      var B = /** @class */ (function (_super) {
        __extends(B, _super);
        function B() {
          return _super !== null && _super.apply(this, arguments) || this;
        }
        return B;
      }(A));
      return {
        fn() {
          new B();
        },
      };
    },
  },
}

const createSuite = (benchmarks) => {
  const suite = new Benchmark.Suite();
  for (let t in benchmarks) suite.add(t, benchmarks[t]());
  return suite;
};

const createSuites = (benchmarks) => {
  const suites = {};
  for (let n in benchmarks) suites[n] = createSuite(benchmarks[n]);
  return suites;
};

const suites = createSuites(benchmarks);

const launch = (suites) => {
  async.eachSeries(
    _.keys(suites),
    (suiteName, next) => {
      console.log(suiteName);
      suites[suiteName].on('cycle', (event) => beauty.add(event.target));
      suites[suiteName].on('complete', (event) => {
        beauty.log();
        next();
      });
      suites[suiteName].run({ async: true });
    },
  );
};

module.exports = {
  benchmarks,
  createSuite,
  createSuites,
  suites,
  launch,
};
