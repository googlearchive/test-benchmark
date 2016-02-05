(function(mochaTest, mochaPending, mochaSetup) {
  'use strict';

  function skipUnless(condition, test) {
    var isAsyncTest = !!test.length;

    return function(done) {
      var testCalledDone = false;

      if (!condition()) {
        return done();
      }

      var result = test.call(this, done);

      if (!isAsyncTest) {
        done();
      }

      return result;
    };
  }

  window.skipUnless = skipUnless;
})(window.test, window.xtest, window.setup);
