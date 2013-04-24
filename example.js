#!/usr/bin/env node

var flvee = require("./"),
    fs = require("fs"),
    stream = require("stream");

var parser = new flvee.Parser(),
    serialiser = new flvee.Serialiser();

parser.on("readable", function() {
  var e;
  while (e = parser.read()) {
    console.log(e);
  }
});

var nowhere = new stream.Writable();
nowhere._write = function _write(input, encoding, done) { return done(); };

fs.createReadStream(process.argv[2]).pipe(parser).pipe(serialiser).pipe(nowhere);
