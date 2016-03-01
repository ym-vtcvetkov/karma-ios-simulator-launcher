"use strict";
describe("iOS Simulator - Mobile Safari", function() {
  it("launches the simulator and opens Mobile Safari", function(done) {
    expect(/AppleWebKit/.test(navigator.userAgent)).toBeTruthy();
    expect(navigator.vendor).toEqual("Apple Computer, Inc.");
    done();
  });
});