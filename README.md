FLV
===

Flash Video (FLV) parser and serialiser

Overview
--------

This module consumes and produces Flash Video data with delicious streams.

Super Quickstart
----------------

```javascript
var fs = require("fs"),
    flv = require("flv");

var parser = new flv.Parser();

fs.createReadStream("in.flv").pipe(parser);

parser.on("readable", function() {
  var e;
  while (e = parser.read()) {
    console.log(e);
  }
});
```

Installation
------------

Available via [npm](http://npmjs.org/):

> $ npm install flv

Or via git:

> $ git clone git://github.com/deoxxa/flv.git node_modules/flv

Usage
-----

Both the parser and serialiser are streams. The parser expects buffers on input
and outputs objects. The serialiser expects objects on input and outputs
buffers. See the Node.JS [stream](http://nodejs.org/docs/latest/api/stream.html)
docs for more on how to use streams.

FLVParser API
-------------

**constructor**

Constructs a new FLVParser object. `options` is an object that gets passed
through to the `stream.Transform` constructor. `strictMode` is a boolean that
controls whether the parser tries to validate footer values or not. If the
parser is initialised with `strictMode: true`, it will throw an error when an
invalid footer value is encountered.

```javascript
new flv.Parser(options, strictMode);
```

```javascript
// basic instantiation
var parser = new flv.Parser();

// instantiation with strict mode
var parser = new flv.Parser(null, true);

// instantiation with some options to go through to stream.Transform
var parser = new flv.Parser({highWaterMark: 10});
```

Arguments

* _options_ - an object that gets passed through to the `stream.Transform`
  constructor.
* _strictMode_ - a boolean that controls whether the parser tries to validate
  footer values or not.

FLVSerialiser API
-----------------

**constructor**

Constructs a new FLVSerialiser object. Like in FLVParser, `options` is an object
that gets passed through to the `stream.Transform` constructor.

```javascript
new flv.Parser(options, strictMode);
```

```javascript
// basic instantiation
var parser = new flv.Parser();

// instantiation with strict mode
var parser = new flv.Parser(null, true);

// instantiation with some options to go through to stream.Transform
var parser = new flv.Parser({highWaterMark: 10});
```

Arguments

* _options_ - an object that gets passed through to the `stream.Transform`
  constructor.
* _strictMode_ - a boolean that controls whether the parser tries to validate
  footer values or not.

Example
-------

Also see [example.js](https://github.com/deoxxa/pillion/blob/master/example.js).

```javascript
#!/usr/bin/env node

// this script will dump out packet information

var flv = require("flv"),
    fs = require("fs"),
    stream = require("stream");

var parser = new flv.Parser(),
    serialiser = new flv.Serialiser();

parser.on("readable", function() {
  var e;
  while (e = parser.read()) {
    console.log(e);
  }
});

var nowhere = new stream.Writable();
nowhere._write = function _write(input, encoding, done) { return done(); };

fs.createReadStream(process.argv[2]).pipe(parser).pipe(serialiser).pipe(nowhere);
```

Output (example):

```
{ header: { version: 1, flags: { '0': true, '2': true }, headerSize: 9 } }
{ footer: 0 }
{ packet:
   { type: 18,
     length: 4064,
     time: 0,
     streamId: 0,
     data: <Buffer 02 00 0a 6f 6e 4d 65 74 61 44 61 74 61 08 00 00 00 1b 00 0c 61 75 64 69 6f 63 6f 64 65 63 69 64 00 40 24 00 00 00 00 00 00 00 0d 61 75 64 69 6f 64 61 74 ...>,
     parsed:
      [ audiocodecid: 10,
        audiodatarate: 96.80490091625826,
        audiosamplerate: 44100,
        audiosamplesize: 16,
        audiosize: 2271527,
        canSeekToEnd: true,
        datasize: 12038034,
        duration: 187.72,
        encoder: 'Lavf54.6.100',
        filesize: 12033955,
        framerate: 25.01598124866823,
        hasAudio: true,
        hasCuePoints: false,
        hasKeyframes: true,
        hasMetadata: true,
        hasVideo: true,
        height: 408,
        keyframes: [Object],
        lasttimestamp: 187.72,
        metadatacreator: 'flvtool++ (Facebook, Motion project, dweatherford)',
        metadatadate: Sun Apr 14 2013 03:31:25 GMT+1000 (EST),
        stereo: true,
        totalframes: 4696,
        videocodecid: 7,
        videodatarate: 407.65105476241206,
        videosize: 9565532,
        width: 544 ] } }
{ footer: 267059200 }
{ packet:
   { type: 18,
     length: 292,
     time: 0,
     streamId: 0,
     data: <Buffer 02 00 0a 6f 6e 4d 65 74 61 44 61 74 61 08 00 00 00 0d 00 08 64 75 72 61 74 69 6f 6e 00 40 67 a0 00 00 00 00 00 00 05 77 69 64 74 68 00 40 81 00 00 00 00 ...>,
     parsed:
      [ duration: 189,
        width: 544,
        height: 408,
        videodatarate: 390.625,
        framerate: 25,
        videocodecid: 7,
        audiodatarate: 93.75,
        audiosamplerate: 44100,
        audiosamplesize: 16,
        stereo: true,
        audiocodecid: 10,
        encoder: 'Lavf54.6.100',
        filesize: 12033955 ] } }
{ footer: 303 }
{ packet:
   { type: 9,
     length: 47,
     time: 0,
     streamId: 0,
     data: <Buffer 17 00 00 00 00 01 64 00 1e ff e1 00 1a 67 64 00 1e ac d9 80 88 35 f9 70 11 00 00 03 00 01 00 00 03 00 32 0f 16 2d 9a 01 00 05 68 e9 7b 3c 8f> } }
{ footer: 58 }
{ packet:
   { type: 8,
     length: 4,
     time: 0,
     streamId: 0,
     data: <Buffer af 00 12 10> } }
{ footer: 15 }
```

License
-------

3-clause BSD. A copy is included with the source.

Contact
-------

* GitHub ([deoxxa](http://github.com/deoxxa))
* Twitter ([@deoxxa](http://twitter.com/deoxxa))
* ADN ([@deoxxa](https://alpha.app.net/deoxxa))
* Email ([deoxxa@fknsrs.biz](mailto:deoxxa@fknsrs.biz))
