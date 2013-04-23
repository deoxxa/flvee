var stream = require("stream");

var amf = require("amf"),
    compost = require("compost");

var FLVSerialiser = module.exports = function FLVSerialiser(options) {
  options = options || {};

  options.objectMode = true;

  stream.Transform.call(this, options);

  this.push(Buffer([
    0x46, 0x4c, 0x56,
    options.version || 1,
    compost.compose(options.flags || {}),
    0, 0, 0, 9,
    0, 0, 0, 0,
  ]));
};
FLVSerialiser.prototype = Object.create(stream.Transform.prototype);

FLVSerialiser.prototype._transform = function _transform(input, encoding, done) {
  if (!input.packet) {
    return done();
  }

  var packet = Buffer(input.length + 11);

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

  this.push(packet);

  return done();
};
