import {BufferGeometry as BufferGeometry2} from "three/src/core/BufferGeometry";
var DRACOExporter = function() {
};
DRACOExporter.prototype = {
  constructor: DRACOExporter,
  parse: function(object, options) {
    if (object.isBufferGeometry === true || object.isGeometry === true) {
      throw new Error("DRACOExporter: The first parameter of parse() is now an instance of Mesh or Points.");
    }
    if (DracoEncoderModule === void 0) {
      throw new Error("THREE.DRACOExporter: required the draco_decoder to work.");
    }
    if (options === void 0) {
      options = {
        decodeSpeed: 5,
        encodeSpeed: 5,
        encoderMethod: DRACOExporter.MESH_EDGEBREAKER_ENCODING,
        quantization: [16, 8, 8, 8, 8],
        exportUvs: true,
        exportNormals: true,
        exportColor: false
      };
    }
    var geometry = object.geometry;
    var dracoEncoder = DracoEncoderModule();
    var encoder = new dracoEncoder.Encoder();
    var builder;
    var dracoObject;
    if (geometry.isGeometry === true) {
      var bufferGeometry = new BufferGeometry2();
      bufferGeometry.setFromObject(object);
      geometry = bufferGeometry;
    }
    if (geometry.isBufferGeometry !== true) {
      throw new Error("THREE.DRACOExporter.parse(geometry, options): geometry is not a THREE.Geometry or BufferGeometry instance.");
    }
    if (object.isMesh === true) {
      builder = new dracoEncoder.MeshBuilder();
      dracoObject = new dracoEncoder.Mesh();
      var vertices = geometry.getAttribute("position");
      builder.AddFloatAttributeToMesh(dracoObject, dracoEncoder.POSITION, vertices.count, vertices.itemSize, vertices.array);
      var faces = geometry.getIndex();
      if (faces !== null) {
        builder.AddFacesToMesh(dracoObject, faces.count / 3, faces.array);
      } else {
        var faces = new (vertices.count > 65535 ? Uint32Array : Uint16Array)(vertices.count);
        for (var i = 0; i < faces.length; i++) {
          faces[i] = i;
        }
        builder.AddFacesToMesh(dracoObject, vertices.count, faces);
      }
      if (options.exportNormals === true) {
        var normals = geometry.getAttribute("normal");
        if (normals !== void 0) {
          builder.AddFloatAttributeToMesh(dracoObject, dracoEncoder.NORMAL, normals.count, normals.itemSize, normals.array);
        }
      }
      if (options.exportUvs === true) {
        var uvs = geometry.getAttribute("uv");
        if (uvs !== void 0) {
          builder.AddFloatAttributeToMesh(dracoObject, dracoEncoder.TEX_COORD, uvs.count, uvs.itemSize, uvs.array);
        }
      }
      if (options.exportColor === true) {
        var colors = geometry.getAttribute("color");
        if (colors !== void 0) {
          builder.AddFloatAttributeToMesh(dracoObject, dracoEncoder.COLOR, colors.count, colors.itemSize, colors.array);
        }
      }
    } else if (object.isPoints === true) {
      builder = new dracoEncoder.PointCloudBuilder();
      dracoObject = new dracoEncoder.PointCloud();
      var vertices = geometry.getAttribute("position");
      builder.AddFloatAttribute(dracoObject, dracoEncoder.POSITION, vertices.count, vertices.itemSize, vertices.array);
      if (options.exportColor === true) {
        var colors = geometry.getAttribute("color");
        if (colors !== void 0) {
          builder.AddFloatAttribute(dracoObject, dracoEncoder.COLOR, colors.count, colors.itemSize, colors.array);
        }
      }
    } else {
      throw new Error("DRACOExporter: Unsupported object type.");
    }
    var encodedData = new dracoEncoder.DracoInt8Array();
    var encodeSpeed = options.encodeSpeed !== void 0 ? options.encodeSpeed : 5;
    var decodeSpeed = options.decodeSpeed !== void 0 ? options.decodeSpeed : 5;
    encoder.SetSpeedOptions(encodeSpeed, decodeSpeed);
    if (options.encoderMethod !== void 0) {
      encoder.SetEncodingMethod(options.encoderMethod);
    }
    if (options.quantization !== void 0) {
      for (var i = 0; i < 5; i++) {
        if (options.quantization[i] !== void 0) {
          encoder.SetAttributeQuantization(i, options.quantization[i]);
        }
      }
    }
    var length;
    if (object.isMesh === true) {
      length = encoder.EncodeMeshToDracoBuffer(dracoObject, encodedData);
    } else {
      length = encoder.EncodePointCloudToDracoBuffer(dracoObject, true, encodedData);
    }
    dracoEncoder.destroy(dracoObject);
    if (length === 0) {
      throw new Error("THREE.DRACOExporter: Draco encoding failed.");
    }
    var outputData = new Int8Array(new ArrayBuffer(length));
    for (var i = 0; i < length; i++) {
      outputData[i] = encodedData.GetValue(i);
    }
    dracoEncoder.destroy(encodedData);
    dracoEncoder.destroy(encoder);
    dracoEncoder.destroy(builder);
    return outputData;
  }
};
DRACOExporter.MESH_EDGEBREAKER_ENCODING = 1;
DRACOExporter.MESH_SEQUENTIAL_ENCODING = 0;
DRACOExporter.POINT_CLOUD = 0;
DRACOExporter.TRIANGULAR_MESH = 1;
DRACOExporter.INVALID = -1;
DRACOExporter.POSITION = 0;
DRACOExporter.NORMAL = 1;
DRACOExporter.COLOR = 2;
DRACOExporter.TEX_COORD = 3;
DRACOExporter.GENERIC = 4;
export {DRACOExporter};
