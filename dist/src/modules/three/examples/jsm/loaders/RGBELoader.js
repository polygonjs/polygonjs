import {DataTextureLoader as DataTextureLoader2} from "three/src/loaders/DataTextureLoader";
import {DataUtils as DataUtils2} from "three/src/extras/DataUtils";
import {FloatType} from "three/src/constants";
import {HalfFloatType} from "three/src/constants";
import {LinearEncoding} from "three/src/constants";
import {LinearFilter} from "three/src/constants";
import {NearestFilter} from "three/src/constants";
import {RGBEEncoding} from "three/src/constants";
import {RGBEFormat} from "three/src/constants";
import {RGBFormat} from "three/src/constants";
import {UnsignedByteType} from "three/src/constants";
var RGBELoader = function(manager) {
  DataTextureLoader2.call(this, manager);
  this.type = UnsignedByteType;
};
RGBELoader.prototype = Object.assign(Object.create(DataTextureLoader2.prototype), {
  constructor: RGBELoader,
  parse: function(buffer) {
    var RGBE_RETURN_FAILURE = -1, rgbe_read_error = 1, rgbe_write_error = 2, rgbe_format_error = 3, rgbe_memory_error = 4, rgbe_error = function(rgbe_error_code, msg) {
      switch (rgbe_error_code) {
        case rgbe_read_error:
          console.error("RGBELoader Read Error: " + (msg || ""));
          break;
        case rgbe_write_error:
          console.error("RGBELoader Write Error: " + (msg || ""));
          break;
        case rgbe_format_error:
          console.error("RGBELoader Bad File Format: " + (msg || ""));
          break;
        default:
        case rgbe_memory_error:
          console.error("RGBELoader: Error: " + (msg || ""));
      }
      return RGBE_RETURN_FAILURE;
    }, RGBE_VALID_PROGRAMTYPE = 1, RGBE_VALID_FORMAT = 2, RGBE_VALID_DIMENSIONS = 4, NEWLINE = "\n", fgets = function(buffer2, lineLimit, consume) {
      lineLimit = !lineLimit ? 1024 : lineLimit;
      var p = buffer2.pos, i = -1, len = 0, s = "", chunkSize = 128, chunk = String.fromCharCode.apply(null, new Uint16Array(buffer2.subarray(p, p + chunkSize)));
      while (0 > (i = chunk.indexOf(NEWLINE)) && len < lineLimit && p < buffer2.byteLength) {
        s += chunk;
        len += chunk.length;
        p += chunkSize;
        chunk += String.fromCharCode.apply(null, new Uint16Array(buffer2.subarray(p, p + chunkSize)));
      }
      if (-1 < i) {
        if (consume !== false)
          buffer2.pos += len + i + 1;
        return s + chunk.slice(0, i);
      }
      return false;
    }, RGBE_ReadHeader = function(buffer2) {
      var line, match, magic_token_re = /^#\?(\S+)$/, gamma_re = /^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/, exposure_re = /^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/, format_re = /^\s*FORMAT=(\S+)\s*$/, dimensions_re = /^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/, header = {
        valid: 0,
        string: "",
        comments: "",
        programtype: "RGBE",
        format: "",
        gamma: 1,
        exposure: 1,
        width: 0,
        height: 0
      };
      if (buffer2.pos >= buffer2.byteLength || !(line = fgets(buffer2))) {
        return rgbe_error(rgbe_read_error, "no header found");
      }
      if (!(match = line.match(magic_token_re))) {
        return rgbe_error(rgbe_format_error, "bad initial token");
      }
      header.valid |= RGBE_VALID_PROGRAMTYPE;
      header.programtype = match[1];
      header.string += line + "\n";
      while (true) {
        line = fgets(buffer2);
        if (line === false)
          break;
        header.string += line + "\n";
        if (line.charAt(0) === "#") {
          header.comments += line + "\n";
          continue;
        }
        if (match = line.match(gamma_re)) {
          header.gamma = parseFloat(match[1], 10);
        }
        if (match = line.match(exposure_re)) {
          header.exposure = parseFloat(match[1], 10);
        }
        if (match = line.match(format_re)) {
          header.valid |= RGBE_VALID_FORMAT;
          header.format = match[1];
        }
        if (match = line.match(dimensions_re)) {
          header.valid |= RGBE_VALID_DIMENSIONS;
          header.height = parseInt(match[1], 10);
          header.width = parseInt(match[2], 10);
        }
        if (header.valid & RGBE_VALID_FORMAT && header.valid & RGBE_VALID_DIMENSIONS)
          break;
      }
      if (!(header.valid & RGBE_VALID_FORMAT)) {
        return rgbe_error(rgbe_format_error, "missing format specifier");
      }
      if (!(header.valid & RGBE_VALID_DIMENSIONS)) {
        return rgbe_error(rgbe_format_error, "missing image size specifier");
      }
      return header;
    }, RGBE_ReadPixels_RLE = function(buffer2, w2, h2) {
      var data_rgba, offset, pos, count, byteValue, scanline_buffer, ptr, ptr_end, i, l, off, isEncodedRun, scanline_width = w2, num_scanlines = h2, rgbeStart;
      if (scanline_width < 8 || scanline_width > 32767 || (buffer2[0] !== 2 || buffer2[1] !== 2 || buffer2[2] & 128)) {
        return new Uint8Array(buffer2);
      }
      if (scanline_width !== (buffer2[2] << 8 | buffer2[3])) {
        return rgbe_error(rgbe_format_error, "wrong scanline width");
      }
      data_rgba = new Uint8Array(4 * w2 * h2);
      if (!data_rgba.length) {
        return rgbe_error(rgbe_memory_error, "unable to allocate buffer space");
      }
      offset = 0;
      pos = 0;
      ptr_end = 4 * scanline_width;
      rgbeStart = new Uint8Array(4);
      scanline_buffer = new Uint8Array(ptr_end);
      while (num_scanlines > 0 && pos < buffer2.byteLength) {
        if (pos + 4 > buffer2.byteLength) {
          return rgbe_error(rgbe_read_error);
        }
        rgbeStart[0] = buffer2[pos++];
        rgbeStart[1] = buffer2[pos++];
        rgbeStart[2] = buffer2[pos++];
        rgbeStart[3] = buffer2[pos++];
        if (rgbeStart[0] != 2 || rgbeStart[1] != 2 || (rgbeStart[2] << 8 | rgbeStart[3]) != scanline_width) {
          return rgbe_error(rgbe_format_error, "bad rgbe scanline format");
        }
        ptr = 0;
        while (ptr < ptr_end && pos < buffer2.byteLength) {
          count = buffer2[pos++];
          isEncodedRun = count > 128;
          if (isEncodedRun)
            count -= 128;
          if (count === 0 || ptr + count > ptr_end) {
            return rgbe_error(rgbe_format_error, "bad scanline data");
          }
          if (isEncodedRun) {
            byteValue = buffer2[pos++];
            for (i = 0; i < count; i++) {
              scanline_buffer[ptr++] = byteValue;
            }
          } else {
            scanline_buffer.set(buffer2.subarray(pos, pos + count), ptr);
            ptr += count;
            pos += count;
          }
        }
        l = scanline_width;
        for (i = 0; i < l; i++) {
          off = 0;
          data_rgba[offset] = scanline_buffer[i + off];
          off += scanline_width;
          data_rgba[offset + 1] = scanline_buffer[i + off];
          off += scanline_width;
          data_rgba[offset + 2] = scanline_buffer[i + off];
          off += scanline_width;
          data_rgba[offset + 3] = scanline_buffer[i + off];
          offset += 4;
        }
        num_scanlines--;
      }
      return data_rgba;
    };
    var RGBEByteToRGBFloat = function(sourceArray, sourceOffset, destArray, destOffset) {
      var e = sourceArray[sourceOffset + 3];
      var scale = Math.pow(2, e - 128) / 255;
      destArray[destOffset + 0] = sourceArray[sourceOffset + 0] * scale;
      destArray[destOffset + 1] = sourceArray[sourceOffset + 1] * scale;
      destArray[destOffset + 2] = sourceArray[sourceOffset + 2] * scale;
    };
    var RGBEByteToRGBHalf = function(sourceArray, sourceOffset, destArray, destOffset) {
      var e = sourceArray[sourceOffset + 3];
      var scale = Math.pow(2, e - 128) / 255;
      destArray[destOffset + 0] = DataUtils2.toHalfFloat(sourceArray[sourceOffset + 0] * scale);
      destArray[destOffset + 1] = DataUtils2.toHalfFloat(sourceArray[sourceOffset + 1] * scale);
      destArray[destOffset + 2] = DataUtils2.toHalfFloat(sourceArray[sourceOffset + 2] * scale);
    };
    var byteArray = new Uint8Array(buffer);
    byteArray.pos = 0;
    var rgbe_header_info = RGBE_ReadHeader(byteArray);
    if (RGBE_RETURN_FAILURE !== rgbe_header_info) {
      var w = rgbe_header_info.width, h = rgbe_header_info.height, image_rgba_data = RGBE_ReadPixels_RLE(byteArray.subarray(byteArray.pos), w, h);
      if (RGBE_RETURN_FAILURE !== image_rgba_data) {
        switch (this.type) {
          case UnsignedByteType:
            var data = image_rgba_data;
            var format = RGBEFormat;
            var type = UnsignedByteType;
            break;
          case FloatType:
            var numElements = image_rgba_data.length / 4 * 3;
            var floatArray = new Float32Array(numElements);
            for (var j = 0; j < numElements; j++) {
              RGBEByteToRGBFloat(image_rgba_data, j * 4, floatArray, j * 3);
            }
            var data = floatArray;
            var format = RGBFormat;
            var type = FloatType;
            break;
          case HalfFloatType:
            var numElements = image_rgba_data.length / 4 * 3;
            var halfArray = new Uint16Array(numElements);
            for (var j = 0; j < numElements; j++) {
              RGBEByteToRGBHalf(image_rgba_data, j * 4, halfArray, j * 3);
            }
            var data = halfArray;
            var format = RGBFormat;
            var type = HalfFloatType;
            break;
          default:
            console.error("THREE.RGBELoader: unsupported type: ", this.type);
            break;
        }
        return {
          width: w,
          height: h,
          data,
          header: rgbe_header_info.string,
          gamma: rgbe_header_info.gamma,
          exposure: rgbe_header_info.exposure,
          format,
          type
        };
      }
    }
    return null;
  },
  setDataType: function(value) {
    this.type = value;
    return this;
  },
  load: function(url, onLoad, onProgress, onError) {
    function onLoadCallback(texture, texData) {
      switch (texture.type) {
        case UnsignedByteType:
          texture.encoding = RGBEEncoding;
          texture.minFilter = NearestFilter;
          texture.magFilter = NearestFilter;
          texture.generateMipmaps = false;
          texture.flipY = true;
          break;
        case FloatType:
          texture.encoding = LinearEncoding;
          texture.minFilter = LinearFilter;
          texture.magFilter = LinearFilter;
          texture.generateMipmaps = false;
          texture.flipY = true;
          break;
        case HalfFloatType:
          texture.encoding = LinearEncoding;
          texture.minFilter = LinearFilter;
          texture.magFilter = LinearFilter;
          texture.generateMipmaps = false;
          texture.flipY = true;
          break;
      }
      if (onLoad)
        onLoad(texture, texData);
    }
    return DataTextureLoader2.prototype.load.call(this, url, onLoadCallback, onProgress, onError);
  }
});
export {RGBELoader};
