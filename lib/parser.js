var stream = require("stream");

var amf = require("amf"),
    compost = require("compost");

var FLVParser = module.exports = function FLVParser(options, strictMode) {
  options = options || {};

  options.objectMode = true;

  stream.Transform.call(this, options);

  this.strictMode = !!strictMode;

  this.version = null;
  this.flags = null;
  this.headerSize = null;

  this._buffer = Buffer(0);

  this._gotHeader = false;
  this._expectingFooter = -1;
};
FLVParser.prototype = Object.create(stream.Transform.prototype);

FLVParser.prototype._transform = function _transform(input, encoding, done) {
  this._buffer = Buffer.concat([this._buffer, input]);

  if (!this._gotHeader) {
    if (this._buffer.length < 9) {
      return done();
    }

    this.version = this._buffer[3];
    this.flags = compost.decompose(this._buffer[4]);
    this.headerSize = this._buffer.readUInt32BE(5);

    var header = {
      version: this.version,
      flags: this.flags,
      headerSize: this.headerSize,
    };

    this.push({header: header});

    this._buffer = this._buffer.slice(9);

    this._expectingFooter = 0;

    this._gotHeader = true;
  }

  var offset = 0;
  while (offset < this._buffer.length) {
    if (this._expectingFooter >= 0) {
      if (this._buffer.length < offset + 4) {
        break;
      }

      var footer = this._buffer.readUInt32BE(offset);

      if (this.strictMode && footer !== this._expectingFooter) {
        return done(Error("expected footer value of " + this._expectingFooter + " but got " + footer));
      }

      this.push({footer: footer});
      this._expectingFooter = -1;
      offset += 4;
    }

    if (this._buffer.length < offset + 11) {
      break;
    }

    var type     = this._buffer[offset],
        length   = this._buffer[offset+1] * 65536 + this._buffer[offset+2] * 256 + this._buffer[offset+3],
        time     = this._buffer[offset+4] * 65536 + this._buffer[offset+5] * 256 + this._buffer[offset+6] + this._buffer[offset+7] * 16777216,
        streamId = this._buffer[offset+8] * 65536 + this._buffer[offset+9] * 256 + this._buffer[offset+10];

    if (this._buffer.length < offset + 11 + length) {
      break;
    }

    var data = this._buffer.slice(offset + 11, offset + 11 + length);

    var packet = {
      type: type,
      length: length,
      time: time,
      streamId: streamId,
      data: data,
    };

    if (type === 18) {
      // the first 12 bytes are some actionscript-related thing... derp.
      packet.parsed = amf.read(data, 13);
    }

    this.push({packet: packet});

    this._expectingFooter = 11 + length;

    offset += this._expectingFooter;
  }

  if (offset) {
    this._buffer = this._buffer.slice(offset);
  }

  return done();
};
