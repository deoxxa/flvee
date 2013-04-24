var stream = require("stream");

var amf = require("amf"),
    compost = require("compost");

var FLVSerialiser = module.exports = function FLVSerialiser(options, config) {
  options = options || {};

  options.objectMode = true;

  stream.Transform.call(this, options);

  this._writtenHeader = false;

  config = config || {};

  this.version = config.version || 1;
  this.flags = config.flags || {};
};
FLVSerialiser.prototype = Object.create(stream.Transform.prototype);

FLVSerialiser.prototype._transform = function _transform(input, encoding, done) {
  if (input.header && !this._writtenHeader) {
    this.version = input.header.version;
    this.flags = input.header.flags;
  }

  if (!input.packet) {
    return done();
  }

  if (!this._writtenHeader) {
    this.push(Buffer([
      0x46, 0x4c, 0x56,
      this.version,
      compost.compose(this.flags),
      0, 0, 0, 9,
      0, 0, 0, 0,
    ]));

    this._writtenHeader = true;
  }

  var packet = Buffer(input.packet.length + 11 + 4);

  packet[0]  = (input.packet.type     & 255);
  packet[1]  = (input.packet.length   & 16711680) / 65536;
  packet[2]  = (input.packet.length   & 65280) / 256;
  packet[3]  = (input.packet.length   & 255);
  packet[4]  = (input.packet.time     & 16711680) / 65536;
  packet[5]  = (input.packet.time     & 65280) / 256;
  packet[6]  = (input.packet.time     & 255);
  packet[7]  = (input.packet.time     & 4278190080) / 16777216;
  packet[8]  = (input.packet.streamId & 16711680) / 65536;
  packet[9]  = (input.packet.streamId & 65280) / 256;
  packet[10] = (input.packet.streamId & 255);

  input.packet.data.copy(packet, 11);

  packet.writeUInt32BE(input.packet.length + 11, input.packet.length + 11);

  this.push(packet);

  return done();
};
