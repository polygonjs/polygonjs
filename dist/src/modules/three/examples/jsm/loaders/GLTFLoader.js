import {AnimationClip as AnimationClip2} from "three/src/animation/AnimationClip";
import {Bone as Bone2} from "three/src/objects/Bone";
import {Box3 as Box32} from "three/src/math/Box3";
import {BufferAttribute as BufferAttribute2} from "three/src/core/BufferAttribute";
import {BufferGeometry as BufferGeometry2} from "three/src/core/BufferGeometry";
import {CanvasTexture as CanvasTexture2} from "three/src/textures/CanvasTexture";
import {ClampToEdgeWrapping} from "three/src/constants";
import {Color as Color2} from "three/src/math/Color";
import {DirectionalLight as DirectionalLight2} from "three/src/lights/DirectionalLight";
import {DoubleSide} from "three/src/constants";
import {FileLoader as FileLoader2} from "three/src/loaders/FileLoader";
import {FrontSide} from "three/src/constants";
import {Group as Group2} from "three/src/objects/Group";
import {ImageBitmapLoader as ImageBitmapLoader2} from "three/src/loaders/ImageBitmapLoader";
import {InterleavedBuffer as InterleavedBuffer2} from "three/src/core/InterleavedBuffer";
import {InterleavedBufferAttribute as InterleavedBufferAttribute2} from "three/src/core/InterleavedBufferAttribute";
import {Interpolant as Interpolant2} from "three/src/math/Interpolant";
import {InterpolateDiscrete} from "three/src/constants";
import {InterpolateLinear} from "three/src/constants";
import {Line as Line2} from "three/src/objects/Line";
import {LineBasicMaterial as LineBasicMaterial2} from "three/src/materials/LineBasicMaterial";
import {LineLoop as LineLoop2} from "three/src/objects/LineLoop";
import {LineSegments as LineSegments2} from "three/src/objects/LineSegments";
import {LinearFilter} from "three/src/constants";
import {LinearMipmapLinearFilter} from "three/src/constants";
import {LinearMipmapNearestFilter} from "three/src/constants";
import {Loader as Loader2} from "three/src/loaders/Loader";
import {LoaderUtils as LoaderUtils2} from "three/src/loaders/LoaderUtils";
import {Material as Material2} from "three/src/materials/Material";
import {MathUtils as MathUtils2} from "three/src/math/MathUtils";
import {Matrix4 as Matrix42} from "three/src/math/Matrix4";
import {Mesh as Mesh2} from "three/src/objects/Mesh";
import {MeshBasicMaterial as MeshBasicMaterial2} from "three/src/materials/MeshBasicMaterial";
import {MeshPhysicalMaterial as MeshPhysicalMaterial2} from "three/src/materials/MeshPhysicalMaterial";
import {MeshStandardMaterial as MeshStandardMaterial2} from "three/src/materials/MeshStandardMaterial";
import {MirroredRepeatWrapping} from "three/src/constants";
import {NearestFilter} from "three/src/constants";
import {NearestMipmapLinearFilter} from "three/src/constants";
import {NearestMipmapNearestFilter} from "three/src/constants";
import {NumberKeyframeTrack as NumberKeyframeTrack2} from "three/src/animation/tracks/NumberKeyframeTrack";
import {Object3D as Object3D2} from "three/src/core/Object3D";
import {OrthographicCamera as OrthographicCamera2} from "three/src/cameras/OrthographicCamera";
import {PerspectiveCamera as PerspectiveCamera2} from "three/src/cameras/PerspectiveCamera";
import {PointLight as PointLight2} from "three/src/lights/PointLight";
import {Points as Points2} from "three/src/objects/Points";
import {PointsMaterial as PointsMaterial2} from "three/src/materials/PointsMaterial";
import {PropertyBinding as PropertyBinding2} from "three/src/animation/PropertyBinding";
import {QuaternionKeyframeTrack as QuaternionKeyframeTrack2} from "three/src/animation/tracks/QuaternionKeyframeTrack";
import {RGBFormat} from "three/src/constants";
import {RepeatWrapping} from "three/src/constants";
import {Skeleton as Skeleton2} from "three/src/objects/Skeleton";
import {SkinnedMesh as SkinnedMesh2} from "three/src/objects/SkinnedMesh";
import {Sphere as Sphere2} from "three/src/math/Sphere";
import {SpotLight as SpotLight2} from "three/src/lights/SpotLight";
import {TangentSpaceNormalMap} from "three/src/constants";
import {TextureLoader as TextureLoader2} from "three/src/loaders/TextureLoader";
import {TriangleFanDrawMode} from "three/src/constants";
import {TriangleStripDrawMode} from "three/src/constants";
import {Vector2 as Vector22} from "three/src/math/Vector2";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {VectorKeyframeTrack as VectorKeyframeTrack2} from "three/src/animation/tracks/VectorKeyframeTrack";
import {sRGBEncoding} from "three/src/constants";
var GLTFLoader = function() {
  function GLTFLoader2(manager) {
    Loader2.call(this, manager);
    this.dracoLoader = null;
    this.ddsLoader = null;
    this.ktx2Loader = null;
    this.meshoptDecoder = null;
    this.pluginCallbacks = [];
    this.register(function(parser) {
      return new GLTFMaterialsClearcoatExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFTextureBasisUExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFTextureWebPExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFMaterialsTransmissionExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFLightsExtension(parser);
    });
    this.register(function(parser) {
      return new GLTFMeshoptCompression(parser);
    });
  }
  GLTFLoader2.prototype = Object.assign(Object.create(Loader2.prototype), {
    constructor: GLTFLoader2,
    load: function(url, onLoad, onProgress, onError) {
      var scope = this;
      var resourcePath;
      if (this.resourcePath !== "") {
        resourcePath = this.resourcePath;
      } else if (this.path !== "") {
        resourcePath = this.path;
      } else {
        resourcePath = LoaderUtils2.extractUrlBase(url);
      }
      this.manager.itemStart(url);
      var _onError = function(e) {
        if (onError) {
          onError(e);
        } else {
          console.error(e);
        }
        scope.manager.itemError(url);
        scope.manager.itemEnd(url);
      };
      var loader = new FileLoader2(this.manager);
      loader.setPath(this.path);
      loader.setResponseType("arraybuffer");
      loader.setRequestHeader(this.requestHeader);
      loader.setWithCredentials(this.withCredentials);
      loader.load(url, function(data) {
        try {
          scope.parse(data, resourcePath, function(gltf) {
            onLoad(gltf);
            scope.manager.itemEnd(url);
          }, _onError);
        } catch (e) {
          _onError(e);
        }
      }, onProgress, _onError);
    },
    setDRACOLoader: function(dracoLoader) {
      this.dracoLoader = dracoLoader;
      return this;
    },
    setDDSLoader: function(ddsLoader) {
      this.ddsLoader = ddsLoader;
      return this;
    },
    setKTX2Loader: function(ktx2Loader) {
      this.ktx2Loader = ktx2Loader;
      return this;
    },
    setMeshoptDecoder: function(meshoptDecoder) {
      this.meshoptDecoder = meshoptDecoder;
      return this;
    },
    register: function(callback) {
      if (this.pluginCallbacks.indexOf(callback) === -1) {
        this.pluginCallbacks.push(callback);
      }
      return this;
    },
    unregister: function(callback) {
      if (this.pluginCallbacks.indexOf(callback) !== -1) {
        this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(callback), 1);
      }
      return this;
    },
    parse: function(data, path, onLoad, onError) {
      var content;
      var extensions = {};
      var plugins = {};
      if (typeof data === "string") {
        content = data;
      } else {
        var magic = LoaderUtils2.decodeText(new Uint8Array(data, 0, 4));
        if (magic === BINARY_EXTENSION_HEADER_MAGIC) {
          try {
            extensions[EXTENSIONS.KHR_BINARY_GLTF] = new GLTFBinaryExtension(data);
          } catch (error) {
            if (onError)
              onError(error);
            return;
          }
          content = extensions[EXTENSIONS.KHR_BINARY_GLTF].content;
        } else {
          content = LoaderUtils2.decodeText(new Uint8Array(data));
        }
      }
      var json = JSON.parse(content);
      if (json.asset === void 0 || json.asset.version[0] < 2) {
        if (onError)
          onError(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));
        return;
      }
      var parser = new GLTFParser(json, {
        path: path || this.resourcePath || "",
        crossOrigin: this.crossOrigin,
        manager: this.manager,
        ktx2Loader: this.ktx2Loader,
        meshoptDecoder: this.meshoptDecoder
      });
      parser.fileLoader.setRequestHeader(this.requestHeader);
      for (var i = 0; i < this.pluginCallbacks.length; i++) {
        var plugin = this.pluginCallbacks[i](parser);
        plugins[plugin.name] = plugin;
        extensions[plugin.name] = true;
      }
      if (json.extensionsUsed) {
        for (var i = 0; i < json.extensionsUsed.length; ++i) {
          var extensionName = json.extensionsUsed[i];
          var extensionsRequired = json.extensionsRequired || [];
          switch (extensionName) {
            case EXTENSIONS.KHR_MATERIALS_UNLIT:
              extensions[extensionName] = new GLTFMaterialsUnlitExtension();
              break;
            case EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS:
              extensions[extensionName] = new GLTFMaterialsPbrSpecularGlossinessExtension();
              break;
            case EXTENSIONS.KHR_DRACO_MESH_COMPRESSION:
              extensions[extensionName] = new GLTFDracoMeshCompressionExtension(json, this.dracoLoader);
              break;
            case EXTENSIONS.MSFT_TEXTURE_DDS:
              extensions[extensionName] = new GLTFTextureDDSExtension(this.ddsLoader);
              break;
            case EXTENSIONS.KHR_TEXTURE_TRANSFORM:
              extensions[extensionName] = new GLTFTextureTransformExtension();
              break;
            case EXTENSIONS.KHR_MESH_QUANTIZATION:
              extensions[extensionName] = new GLTFMeshQuantizationExtension();
              break;
            default:
              if (extensionsRequired.indexOf(extensionName) >= 0 && plugins[extensionName] === void 0) {
                console.warn('THREE.GLTFLoader: Unknown extension "' + extensionName + '".');
              }
          }
        }
      }
      parser.setExtensions(extensions);
      parser.setPlugins(plugins);
      parser.parse(onLoad, onError);
    }
  });
  function GLTFRegistry() {
    var objects = {};
    return {
      get: function(key) {
        return objects[key];
      },
      add: function(key, object) {
        objects[key] = object;
      },
      remove: function(key) {
        delete objects[key];
      },
      removeAll: function() {
        objects = {};
      }
    };
  }
  var EXTENSIONS = {
    KHR_BINARY_GLTF: "KHR_binary_glTF",
    KHR_DRACO_MESH_COMPRESSION: "KHR_draco_mesh_compression",
    KHR_LIGHTS_PUNCTUAL: "KHR_lights_punctual",
    KHR_MATERIALS_CLEARCOAT: "KHR_materials_clearcoat",
    KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS: "KHR_materials_pbrSpecularGlossiness",
    KHR_MATERIALS_TRANSMISSION: "KHR_materials_transmission",
    KHR_MATERIALS_UNLIT: "KHR_materials_unlit",
    KHR_TEXTURE_BASISU: "KHR_texture_basisu",
    KHR_TEXTURE_TRANSFORM: "KHR_texture_transform",
    KHR_MESH_QUANTIZATION: "KHR_mesh_quantization",
    EXT_TEXTURE_WEBP: "EXT_texture_webp",
    EXT_MESHOPT_COMPRESSION: "EXT_meshopt_compression",
    MSFT_TEXTURE_DDS: "MSFT_texture_dds"
  };
  function GLTFTextureDDSExtension(ddsLoader) {
    if (!ddsLoader) {
      throw new Error("THREE.GLTFLoader: Attempting to load .dds texture without importing DDSLoader");
    }
    this.name = EXTENSIONS.MSFT_TEXTURE_DDS;
    this.ddsLoader = ddsLoader;
  }
  function GLTFLightsExtension(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_LIGHTS_PUNCTUAL;
    this.cache = {refs: {}, uses: {}};
  }
  GLTFLightsExtension.prototype._markDefs = function() {
    var parser = this.parser;
    var nodeDefs = this.parser.json.nodes || [];
    for (var nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex++) {
      var nodeDef = nodeDefs[nodeIndex];
      if (nodeDef.extensions && nodeDef.extensions[this.name] && nodeDef.extensions[this.name].light !== void 0) {
        parser._addNodeRef(this.cache, nodeDef.extensions[this.name].light);
      }
    }
  };
  GLTFLightsExtension.prototype._loadLight = function(lightIndex) {
    var parser = this.parser;
    var cacheKey = "light:" + lightIndex;
    var dependency = parser.cache.get(cacheKey);
    if (dependency)
      return dependency;
    var json = parser.json;
    var extensions = json.extensions && json.extensions[this.name] || {};
    var lightDefs = extensions.lights || [];
    var lightDef = lightDefs[lightIndex];
    var lightNode;
    var color = new Color2(16777215);
    if (lightDef.color !== void 0)
      color.fromArray(lightDef.color);
    var range = lightDef.range !== void 0 ? lightDef.range : 0;
    switch (lightDef.type) {
      case "directional":
        lightNode = new DirectionalLight2(color);
        lightNode.target.position.set(0, 0, -1);
        lightNode.add(lightNode.target);
        break;
      case "point":
        lightNode = new PointLight2(color);
        lightNode.distance = range;
        break;
      case "spot":
        lightNode = new SpotLight2(color);
        lightNode.distance = range;
        lightDef.spot = lightDef.spot || {};
        lightDef.spot.innerConeAngle = lightDef.spot.innerConeAngle !== void 0 ? lightDef.spot.innerConeAngle : 0;
        lightDef.spot.outerConeAngle = lightDef.spot.outerConeAngle !== void 0 ? lightDef.spot.outerConeAngle : Math.PI / 4;
        lightNode.angle = lightDef.spot.outerConeAngle;
        lightNode.penumbra = 1 - lightDef.spot.innerConeAngle / lightDef.spot.outerConeAngle;
        lightNode.target.position.set(0, 0, -1);
        lightNode.add(lightNode.target);
        break;
      default:
        throw new Error('THREE.GLTFLoader: Unexpected light type, "' + lightDef.type + '".');
    }
    lightNode.position.set(0, 0, 0);
    lightNode.decay = 2;
    if (lightDef.intensity !== void 0)
      lightNode.intensity = lightDef.intensity;
    lightNode.name = parser.createUniqueName(lightDef.name || "light_" + lightIndex);
    dependency = Promise.resolve(lightNode);
    parser.cache.add(cacheKey, dependency);
    return dependency;
  };
  GLTFLightsExtension.prototype.createNodeAttachment = function(nodeIndex) {
    var self2 = this;
    var parser = this.parser;
    var json = parser.json;
    var nodeDef = json.nodes[nodeIndex];
    var lightDef = nodeDef.extensions && nodeDef.extensions[this.name] || {};
    var lightIndex = lightDef.light;
    if (lightIndex === void 0)
      return null;
    return this._loadLight(lightIndex).then(function(light) {
      return parser._getNodeRef(self2.cache, lightIndex, light);
    });
  };
  function GLTFMaterialsUnlitExtension() {
    this.name = EXTENSIONS.KHR_MATERIALS_UNLIT;
  }
  GLTFMaterialsUnlitExtension.prototype.getMaterialType = function() {
    return MeshBasicMaterial2;
  };
  GLTFMaterialsUnlitExtension.prototype.extendParams = function(materialParams, materialDef, parser) {
    var pending = [];
    materialParams.color = new Color2(1, 1, 1);
    materialParams.opacity = 1;
    var metallicRoughness = materialDef.pbrMetallicRoughness;
    if (metallicRoughness) {
      if (Array.isArray(metallicRoughness.baseColorFactor)) {
        var array = metallicRoughness.baseColorFactor;
        materialParams.color.fromArray(array);
        materialParams.opacity = array[3];
      }
      if (metallicRoughness.baseColorTexture !== void 0) {
        pending.push(parser.assignTexture(materialParams, "map", metallicRoughness.baseColorTexture));
      }
    }
    return Promise.all(pending);
  };
  function GLTFMaterialsClearcoatExtension(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_CLEARCOAT;
  }
  GLTFMaterialsClearcoatExtension.prototype.getMaterialType = function(materialIndex) {
    var parser = this.parser;
    var materialDef = parser.json.materials[materialIndex];
    if (!materialDef.extensions || !materialDef.extensions[this.name])
      return null;
    return MeshPhysicalMaterial2;
  };
  GLTFMaterialsClearcoatExtension.prototype.extendMaterialParams = function(materialIndex, materialParams) {
    var parser = this.parser;
    var materialDef = parser.json.materials[materialIndex];
    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve();
    }
    var pending = [];
    var extension = materialDef.extensions[this.name];
    if (extension.clearcoatFactor !== void 0) {
      materialParams.clearcoat = extension.clearcoatFactor;
    }
    if (extension.clearcoatTexture !== void 0) {
      pending.push(parser.assignTexture(materialParams, "clearcoatMap", extension.clearcoatTexture));
    }
    if (extension.clearcoatRoughnessFactor !== void 0) {
      materialParams.clearcoatRoughness = extension.clearcoatRoughnessFactor;
    }
    if (extension.clearcoatRoughnessTexture !== void 0) {
      pending.push(parser.assignTexture(materialParams, "clearcoatRoughnessMap", extension.clearcoatRoughnessTexture));
    }
    if (extension.clearcoatNormalTexture !== void 0) {
      pending.push(parser.assignTexture(materialParams, "clearcoatNormalMap", extension.clearcoatNormalTexture));
      if (extension.clearcoatNormalTexture.scale !== void 0) {
        var scale = extension.clearcoatNormalTexture.scale;
        materialParams.clearcoatNormalScale = new Vector22(scale, scale);
      }
    }
    return Promise.all(pending);
  };
  function GLTFMaterialsTransmissionExtension(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_MATERIALS_TRANSMISSION;
  }
  GLTFMaterialsTransmissionExtension.prototype.getMaterialType = function(materialIndex) {
    var parser = this.parser;
    var materialDef = parser.json.materials[materialIndex];
    if (!materialDef.extensions || !materialDef.extensions[this.name])
      return null;
    return MeshPhysicalMaterial2;
  };
  GLTFMaterialsTransmissionExtension.prototype.extendMaterialParams = function(materialIndex, materialParams) {
    var parser = this.parser;
    var materialDef = parser.json.materials[materialIndex];
    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve();
    }
    var pending = [];
    var extension = materialDef.extensions[this.name];
    if (extension.transmissionFactor !== void 0) {
      materialParams.transmission = extension.transmissionFactor;
    }
    if (extension.transmissionTexture !== void 0) {
      pending.push(parser.assignTexture(materialParams, "transmissionMap", extension.transmissionTexture));
    }
    return Promise.all(pending);
  };
  function GLTFTextureBasisUExtension(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.KHR_TEXTURE_BASISU;
  }
  GLTFTextureBasisUExtension.prototype.loadTexture = function(textureIndex) {
    var parser = this.parser;
    var json = parser.json;
    var textureDef = json.textures[textureIndex];
    if (!textureDef.extensions || !textureDef.extensions[this.name]) {
      return null;
    }
    var extension = textureDef.extensions[this.name];
    var source = json.images[extension.source];
    var loader = parser.options.ktx2Loader;
    if (!loader) {
      if (json.extensionsRequired && json.extensionsRequired.indexOf(this.name) >= 0) {
        throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");
      } else {
        return null;
      }
    }
    return parser.loadTextureImage(textureIndex, source, loader);
  };
  function GLTFTextureWebPExtension(parser) {
    this.parser = parser;
    this.name = EXTENSIONS.EXT_TEXTURE_WEBP;
    this.isSupported = null;
  }
  GLTFTextureWebPExtension.prototype.loadTexture = function(textureIndex) {
    var name = this.name;
    var parser = this.parser;
    var json = parser.json;
    var textureDef = json.textures[textureIndex];
    if (!textureDef.extensions || !textureDef.extensions[name]) {
      return null;
    }
    var extension = textureDef.extensions[name];
    var source = json.images[extension.source];
    var loader = source.uri ? parser.options.manager.getHandler(source.uri) : parser.textureLoader;
    return this.detectSupport().then(function(isSupported) {
      if (isSupported)
        return parser.loadTextureImage(textureIndex, source, loader);
      if (json.extensionsRequired && json.extensionsRequired.indexOf(name) >= 0) {
        throw new Error("THREE.GLTFLoader: WebP required by asset but unsupported.");
      }
      return parser.loadTexture(textureIndex);
    });
  };
  GLTFTextureWebPExtension.prototype.detectSupport = function() {
    if (!this.isSupported) {
      this.isSupported = new Promise(function(resolve) {
        var image = new Image();
        image.src = "data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA";
        image.onload = image.onerror = function() {
          resolve(image.height === 1);
        };
      });
    }
    return this.isSupported;
  };
  function GLTFMeshoptCompression(parser) {
    this.name = EXTENSIONS.EXT_MESHOPT_COMPRESSION;
    this.parser = parser;
  }
  GLTFMeshoptCompression.prototype.loadBufferView = function(index) {
    var json = this.parser.json;
    var bufferView = json.bufferViews[index];
    if (bufferView.extensions && bufferView.extensions[this.name]) {
      var extensionDef = bufferView.extensions[this.name];
      var buffer = this.parser.getDependency("buffer", extensionDef.buffer);
      var decoder = this.parser.options.meshoptDecoder;
      if (!decoder || !decoder.supported) {
        if (json.extensionsRequired && json.extensionsRequired.indexOf(this.name) >= 0) {
          throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");
        } else {
          return null;
        }
      }
      return Promise.all([buffer, decoder.ready]).then(function(res) {
        var byteOffset = extensionDef.byteOffset || 0;
        var byteLength = extensionDef.byteLength || 0;
        var count = extensionDef.count;
        var stride = extensionDef.byteStride;
        var result = new ArrayBuffer(count * stride);
        var source = new Uint8Array(res[0], byteOffset, byteLength);
        decoder.decodeGltfBuffer(new Uint8Array(result), count, stride, source, extensionDef.mode, extensionDef.filter);
        return result;
      });
    } else {
      return null;
    }
  };
  var BINARY_EXTENSION_HEADER_MAGIC = "glTF";
  var BINARY_EXTENSION_HEADER_LENGTH = 12;
  var BINARY_EXTENSION_CHUNK_TYPES = {JSON: 1313821514, BIN: 5130562};
  function GLTFBinaryExtension(data) {
    this.name = EXTENSIONS.KHR_BINARY_GLTF;
    this.content = null;
    this.body = null;
    var headerView = new DataView(data, 0, BINARY_EXTENSION_HEADER_LENGTH);
    this.header = {
      magic: LoaderUtils2.decodeText(new Uint8Array(data.slice(0, 4))),
      version: headerView.getUint32(4, true),
      length: headerView.getUint32(8, true)
    };
    if (this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC) {
      throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");
    } else if (this.header.version < 2) {
      throw new Error("THREE.GLTFLoader: Legacy binary file detected.");
    }
    var chunkView = new DataView(data, BINARY_EXTENSION_HEADER_LENGTH);
    var chunkIndex = 0;
    while (chunkIndex < chunkView.byteLength) {
      var chunkLength = chunkView.getUint32(chunkIndex, true);
      chunkIndex += 4;
      var chunkType = chunkView.getUint32(chunkIndex, true);
      chunkIndex += 4;
      if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON) {
        var contentArray = new Uint8Array(data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength);
        this.content = LoaderUtils2.decodeText(contentArray);
      } else if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN) {
        var byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex;
        this.body = data.slice(byteOffset, byteOffset + chunkLength);
      }
      chunkIndex += chunkLength;
    }
    if (this.content === null) {
      throw new Error("THREE.GLTFLoader: JSON content not found.");
    }
  }
  function GLTFDracoMeshCompressionExtension(json, dracoLoader) {
    if (!dracoLoader) {
      throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");
    }
    this.name = EXTENSIONS.KHR_DRACO_MESH_COMPRESSION;
    this.json = json;
    this.dracoLoader = dracoLoader;
    this.dracoLoader.preload();
  }
  GLTFDracoMeshCompressionExtension.prototype.decodePrimitive = function(primitive, parser) {
    var json = this.json;
    var dracoLoader = this.dracoLoader;
    var bufferViewIndex = primitive.extensions[this.name].bufferView;
    var gltfAttributeMap = primitive.extensions[this.name].attributes;
    var threeAttributeMap = {};
    var attributeNormalizedMap = {};
    var attributeTypeMap = {};
    for (var attributeName in gltfAttributeMap) {
      var threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase();
      threeAttributeMap[threeAttributeName] = gltfAttributeMap[attributeName];
    }
    for (attributeName in primitive.attributes) {
      var threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase();
      if (gltfAttributeMap[attributeName] !== void 0) {
        var accessorDef = json.accessors[primitive.attributes[attributeName]];
        var componentType = WEBGL_COMPONENT_TYPES[accessorDef.componentType];
        attributeTypeMap[threeAttributeName] = componentType;
        attributeNormalizedMap[threeAttributeName] = accessorDef.normalized === true;
      }
    }
    return parser.getDependency("bufferView", bufferViewIndex).then(function(bufferView) {
      return new Promise(function(resolve) {
        dracoLoader.decodeDracoFile(bufferView, function(geometry) {
          for (var attributeName2 in geometry.attributes) {
            var attribute = geometry.attributes[attributeName2];
            var normalized = attributeNormalizedMap[attributeName2];
            if (normalized !== void 0)
              attribute.normalized = normalized;
          }
          resolve(geometry);
        }, threeAttributeMap, attributeTypeMap);
      });
    });
  };
  function GLTFTextureTransformExtension() {
    this.name = EXTENSIONS.KHR_TEXTURE_TRANSFORM;
  }
  GLTFTextureTransformExtension.prototype.extendTexture = function(texture, transform) {
    texture = texture.clone();
    if (transform.offset !== void 0) {
      texture.offset.fromArray(transform.offset);
    }
    if (transform.rotation !== void 0) {
      texture.rotation = transform.rotation;
    }
    if (transform.scale !== void 0) {
      texture.repeat.fromArray(transform.scale);
    }
    if (transform.texCoord !== void 0) {
      console.warn('THREE.GLTFLoader: Custom UV sets in "' + this.name + '" extension not yet supported.');
    }
    texture.needsUpdate = true;
    return texture;
  };
  function GLTFMeshStandardSGMaterial(params) {
    MeshStandardMaterial2.call(this);
    this.isGLTFSpecularGlossinessMaterial = true;
    var specularMapParsFragmentChunk = [
      "#ifdef USE_SPECULARMAP",
      "	uniform sampler2D specularMap;",
      "#endif"
    ].join("\n");
    var glossinessMapParsFragmentChunk = [
      "#ifdef USE_GLOSSINESSMAP",
      "	uniform sampler2D glossinessMap;",
      "#endif"
    ].join("\n");
    var specularMapFragmentChunk = [
      "vec3 specularFactor = specular;",
      "#ifdef USE_SPECULARMAP",
      "	vec4 texelSpecular = texture2D( specularMap, vUv );",
      "	texelSpecular = sRGBToLinear( texelSpecular );",
      "	// reads channel RGB, compatible with a glTF Specular-Glossiness (RGBA) texture",
      "	specularFactor *= texelSpecular.rgb;",
      "#endif"
    ].join("\n");
    var glossinessMapFragmentChunk = [
      "float glossinessFactor = glossiness;",
      "#ifdef USE_GLOSSINESSMAP",
      "	vec4 texelGlossiness = texture2D( glossinessMap, vUv );",
      "	// reads channel A, compatible with a glTF Specular-Glossiness (RGBA) texture",
      "	glossinessFactor *= texelGlossiness.a;",
      "#endif"
    ].join("\n");
    var lightPhysicalFragmentChunk = [
      "PhysicalMaterial material;",
      "material.diffuseColor = diffuseColor.rgb * ( 1. - max( specularFactor.r, max( specularFactor.g, specularFactor.b ) ) );",
      "vec3 dxy = max( abs( dFdx( geometryNormal ) ), abs( dFdy( geometryNormal ) ) );",
      "float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );",
      "material.specularRoughness = max( 1.0 - glossinessFactor, 0.0525 ); // 0.0525 corresponds to the base mip of a 256 cubemap.",
      "material.specularRoughness += geometryRoughness;",
      "material.specularRoughness = min( material.specularRoughness, 1.0 );",
      "material.specularColor = specularFactor;"
    ].join("\n");
    var uniforms = {
      specular: {value: new Color2().setHex(16777215)},
      glossiness: {value: 1},
      specularMap: {value: null},
      glossinessMap: {value: null}
    };
    this._extraUniforms = uniforms;
    this.onBeforeCompile = function(shader) {
      for (var uniformName in uniforms) {
        shader.uniforms[uniformName] = uniforms[uniformName];
      }
      shader.fragmentShader = shader.fragmentShader.replace("uniform float roughness;", "uniform vec3 specular;").replace("uniform float metalness;", "uniform float glossiness;").replace("#include <roughnessmap_pars_fragment>", specularMapParsFragmentChunk).replace("#include <metalnessmap_pars_fragment>", glossinessMapParsFragmentChunk).replace("#include <roughnessmap_fragment>", specularMapFragmentChunk).replace("#include <metalnessmap_fragment>", glossinessMapFragmentChunk).replace("#include <lights_physical_fragment>", lightPhysicalFragmentChunk);
    };
    Object.defineProperties(this, {
      specular: {
        get: function() {
          return uniforms.specular.value;
        },
        set: function(v) {
          uniforms.specular.value = v;
        }
      },
      specularMap: {
        get: function() {
          return uniforms.specularMap.value;
        },
        set: function(v) {
          uniforms.specularMap.value = v;
          if (v) {
            this.defines.USE_SPECULARMAP = "";
          } else {
            delete this.defines.USE_SPECULARMAP;
          }
        }
      },
      glossiness: {
        get: function() {
          return uniforms.glossiness.value;
        },
        set: function(v) {
          uniforms.glossiness.value = v;
        }
      },
      glossinessMap: {
        get: function() {
          return uniforms.glossinessMap.value;
        },
        set: function(v) {
          uniforms.glossinessMap.value = v;
          if (v) {
            this.defines.USE_GLOSSINESSMAP = "";
            this.defines.USE_UV = "";
          } else {
            delete this.defines.USE_GLOSSINESSMAP;
            delete this.defines.USE_UV;
          }
        }
      }
    });
    delete this.metalness;
    delete this.roughness;
    delete this.metalnessMap;
    delete this.roughnessMap;
    this.setValues(params);
  }
  GLTFMeshStandardSGMaterial.prototype = Object.create(MeshStandardMaterial2.prototype);
  GLTFMeshStandardSGMaterial.prototype.constructor = GLTFMeshStandardSGMaterial;
  GLTFMeshStandardSGMaterial.prototype.copy = function(source) {
    MeshStandardMaterial2.prototype.copy.call(this, source);
    this.specularMap = source.specularMap;
    this.specular.copy(source.specular);
    this.glossinessMap = source.glossinessMap;
    this.glossiness = source.glossiness;
    delete this.metalness;
    delete this.roughness;
    delete this.metalnessMap;
    delete this.roughnessMap;
    return this;
  };
  function GLTFMaterialsPbrSpecularGlossinessExtension() {
    return {
      name: EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS,
      specularGlossinessParams: [
        "color",
        "map",
        "lightMap",
        "lightMapIntensity",
        "aoMap",
        "aoMapIntensity",
        "emissive",
        "emissiveIntensity",
        "emissiveMap",
        "bumpMap",
        "bumpScale",
        "normalMap",
        "normalMapType",
        "displacementMap",
        "displacementScale",
        "displacementBias",
        "specularMap",
        "specular",
        "glossinessMap",
        "glossiness",
        "alphaMap",
        "envMap",
        "envMapIntensity",
        "refractionRatio"
      ],
      getMaterialType: function() {
        return GLTFMeshStandardSGMaterial;
      },
      extendParams: function(materialParams, materialDef, parser) {
        var pbrSpecularGlossiness = materialDef.extensions[this.name];
        materialParams.color = new Color2(1, 1, 1);
        materialParams.opacity = 1;
        var pending = [];
        if (Array.isArray(pbrSpecularGlossiness.diffuseFactor)) {
          var array = pbrSpecularGlossiness.diffuseFactor;
          materialParams.color.fromArray(array);
          materialParams.opacity = array[3];
        }
        if (pbrSpecularGlossiness.diffuseTexture !== void 0) {
          pending.push(parser.assignTexture(materialParams, "map", pbrSpecularGlossiness.diffuseTexture));
        }
        materialParams.emissive = new Color2(0, 0, 0);
        materialParams.glossiness = pbrSpecularGlossiness.glossinessFactor !== void 0 ? pbrSpecularGlossiness.glossinessFactor : 1;
        materialParams.specular = new Color2(1, 1, 1);
        if (Array.isArray(pbrSpecularGlossiness.specularFactor)) {
          materialParams.specular.fromArray(pbrSpecularGlossiness.specularFactor);
        }
        if (pbrSpecularGlossiness.specularGlossinessTexture !== void 0) {
          var specGlossMapDef = pbrSpecularGlossiness.specularGlossinessTexture;
          pending.push(parser.assignTexture(materialParams, "glossinessMap", specGlossMapDef));
          pending.push(parser.assignTexture(materialParams, "specularMap", specGlossMapDef));
        }
        return Promise.all(pending);
      },
      createMaterial: function(materialParams) {
        var material = new GLTFMeshStandardSGMaterial(materialParams);
        material.fog = true;
        material.color = materialParams.color;
        material.map = materialParams.map === void 0 ? null : materialParams.map;
        material.lightMap = null;
        material.lightMapIntensity = 1;
        material.aoMap = materialParams.aoMap === void 0 ? null : materialParams.aoMap;
        material.aoMapIntensity = 1;
        material.emissive = materialParams.emissive;
        material.emissiveIntensity = 1;
        material.emissiveMap = materialParams.emissiveMap === void 0 ? null : materialParams.emissiveMap;
        material.bumpMap = materialParams.bumpMap === void 0 ? null : materialParams.bumpMap;
        material.bumpScale = 1;
        material.normalMap = materialParams.normalMap === void 0 ? null : materialParams.normalMap;
        material.normalMapType = TangentSpaceNormalMap;
        if (materialParams.normalScale)
          material.normalScale = materialParams.normalScale;
        material.displacementMap = null;
        material.displacementScale = 1;
        material.displacementBias = 0;
        material.specularMap = materialParams.specularMap === void 0 ? null : materialParams.specularMap;
        material.specular = materialParams.specular;
        material.glossinessMap = materialParams.glossinessMap === void 0 ? null : materialParams.glossinessMap;
        material.glossiness = materialParams.glossiness;
        material.alphaMap = null;
        material.envMap = materialParams.envMap === void 0 ? null : materialParams.envMap;
        material.envMapIntensity = 1;
        material.refractionRatio = 0.98;
        return material;
      }
    };
  }
  function GLTFMeshQuantizationExtension() {
    this.name = EXTENSIONS.KHR_MESH_QUANTIZATION;
  }
  function GLTFCubicSplineInterpolant(parameterPositions, sampleValues, sampleSize, resultBuffer) {
    Interpolant2.call(this, parameterPositions, sampleValues, sampleSize, resultBuffer);
  }
  GLTFCubicSplineInterpolant.prototype = Object.create(Interpolant2.prototype);
  GLTFCubicSplineInterpolant.prototype.constructor = GLTFCubicSplineInterpolant;
  GLTFCubicSplineInterpolant.prototype.copySampleValue_ = function(index) {
    var result = this.resultBuffer, values = this.sampleValues, valueSize = this.valueSize, offset = index * valueSize * 3 + valueSize;
    for (var i = 0; i !== valueSize; i++) {
      result[i] = values[offset + i];
    }
    return result;
  };
  GLTFCubicSplineInterpolant.prototype.beforeStart_ = GLTFCubicSplineInterpolant.prototype.copySampleValue_;
  GLTFCubicSplineInterpolant.prototype.afterEnd_ = GLTFCubicSplineInterpolant.prototype.copySampleValue_;
  GLTFCubicSplineInterpolant.prototype.interpolate_ = function(i1, t0, t, t1) {
    var result = this.resultBuffer;
    var values = this.sampleValues;
    var stride = this.valueSize;
    var stride2 = stride * 2;
    var stride3 = stride * 3;
    var td = t1 - t0;
    var p = (t - t0) / td;
    var pp = p * p;
    var ppp = pp * p;
    var offset1 = i1 * stride3;
    var offset0 = offset1 - stride3;
    var s2 = -2 * ppp + 3 * pp;
    var s3 = ppp - pp;
    var s0 = 1 - s2;
    var s1 = s3 - pp + p;
    for (var i = 0; i !== stride; i++) {
      var p0 = values[offset0 + i + stride];
      var m0 = values[offset0 + i + stride2] * td;
      var p1 = values[offset1 + i + stride];
      var m1 = values[offset1 + i] * td;
      result[i] = s0 * p0 + s1 * m0 + s2 * p1 + s3 * m1;
    }
    return result;
  };
  var WEBGL_CONSTANTS = {
    FLOAT: 5126,
    FLOAT_MAT3: 35675,
    FLOAT_MAT4: 35676,
    FLOAT_VEC2: 35664,
    FLOAT_VEC3: 35665,
    FLOAT_VEC4: 35666,
    LINEAR: 9729,
    REPEAT: 10497,
    SAMPLER_2D: 35678,
    POINTS: 0,
    LINES: 1,
    LINE_LOOP: 2,
    LINE_STRIP: 3,
    TRIANGLES: 4,
    TRIANGLE_STRIP: 5,
    TRIANGLE_FAN: 6,
    UNSIGNED_BYTE: 5121,
    UNSIGNED_SHORT: 5123
  };
  var WEBGL_COMPONENT_TYPES = {
    5120: Int8Array,
    5121: Uint8Array,
    5122: Int16Array,
    5123: Uint16Array,
    5125: Uint32Array,
    5126: Float32Array
  };
  var WEBGL_FILTERS = {
    9728: NearestFilter,
    9729: LinearFilter,
    9984: NearestMipmapNearestFilter,
    9985: LinearMipmapNearestFilter,
    9986: NearestMipmapLinearFilter,
    9987: LinearMipmapLinearFilter
  };
  var WEBGL_WRAPPINGS = {
    33071: ClampToEdgeWrapping,
    33648: MirroredRepeatWrapping,
    10497: RepeatWrapping
  };
  var WEBGL_TYPE_SIZES = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 4,
    MAT3: 9,
    MAT4: 16
  };
  var ATTRIBUTES = {
    POSITION: "position",
    NORMAL: "normal",
    TANGENT: "tangent",
    TEXCOORD_0: "uv",
    TEXCOORD_1: "uv2",
    COLOR_0: "color",
    WEIGHTS_0: "skinWeight",
    JOINTS_0: "skinIndex"
  };
  var PATH_PROPERTIES = {
    scale: "scale",
    translation: "position",
    rotation: "quaternion",
    weights: "morphTargetInfluences"
  };
  var INTERPOLATION = {
    CUBICSPLINE: void 0,
    LINEAR: InterpolateLinear,
    STEP: InterpolateDiscrete
  };
  var ALPHA_MODES = {
    OPAQUE: "OPAQUE",
    MASK: "MASK",
    BLEND: "BLEND"
  };
  function resolveURL(url, path) {
    if (typeof url !== "string" || url === "")
      return "";
    if (/^https?:\/\//i.test(path) && /^\//.test(url)) {
      path = path.replace(/(^https?:\/\/[^\/]+).*/i, "$1");
    }
    if (/^(https?:)?\/\//i.test(url))
      return url;
    if (/^data:.*,.*$/i.test(url))
      return url;
    if (/^blob:.*$/i.test(url))
      return url;
    return path + url;
  }
  function createDefaultMaterial(cache) {
    if (cache["DefaultMaterial"] === void 0) {
      cache["DefaultMaterial"] = new MeshStandardMaterial2({
        color: 16777215,
        emissive: 0,
        metalness: 1,
        roughness: 1,
        transparent: false,
        depthTest: true,
        side: FrontSide
      });
    }
    return cache["DefaultMaterial"];
  }
  function addUnknownExtensionsToUserData(knownExtensions, object, objectDef) {
    for (var name in objectDef.extensions) {
      if (knownExtensions[name] === void 0) {
        object.userData.gltfExtensions = object.userData.gltfExtensions || {};
        object.userData.gltfExtensions[name] = objectDef.extensions[name];
      }
    }
  }
  function assignExtrasToUserData(object, gltfDef) {
    if (gltfDef.extras !== void 0) {
      if (typeof gltfDef.extras === "object") {
        Object.assign(object.userData, gltfDef.extras);
      } else {
        console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, " + gltfDef.extras);
      }
    }
  }
  function addMorphTargets(geometry, targets, parser) {
    var hasMorphPosition = false;
    var hasMorphNormal = false;
    for (var i = 0, il = targets.length; i < il; i++) {
      var target = targets[i];
      if (target.POSITION !== void 0)
        hasMorphPosition = true;
      if (target.NORMAL !== void 0)
        hasMorphNormal = true;
      if (hasMorphPosition && hasMorphNormal)
        break;
    }
    if (!hasMorphPosition && !hasMorphNormal)
      return Promise.resolve(geometry);
    var pendingPositionAccessors = [];
    var pendingNormalAccessors = [];
    for (var i = 0, il = targets.length; i < il; i++) {
      var target = targets[i];
      if (hasMorphPosition) {
        var pendingAccessor = target.POSITION !== void 0 ? parser.getDependency("accessor", target.POSITION) : geometry.attributes.position;
        pendingPositionAccessors.push(pendingAccessor);
      }
      if (hasMorphNormal) {
        var pendingAccessor = target.NORMAL !== void 0 ? parser.getDependency("accessor", target.NORMAL) : geometry.attributes.normal;
        pendingNormalAccessors.push(pendingAccessor);
      }
    }
    return Promise.all([
      Promise.all(pendingPositionAccessors),
      Promise.all(pendingNormalAccessors)
    ]).then(function(accessors) {
      var morphPositions = accessors[0];
      var morphNormals = accessors[1];
      if (hasMorphPosition)
        geometry.morphAttributes.position = morphPositions;
      if (hasMorphNormal)
        geometry.morphAttributes.normal = morphNormals;
      geometry.morphTargetsRelative = true;
      return geometry;
    });
  }
  function updateMorphTargets(mesh, meshDef) {
    mesh.updateMorphTargets();
    if (meshDef.weights !== void 0) {
      for (var i = 0, il = meshDef.weights.length; i < il; i++) {
        mesh.morphTargetInfluences[i] = meshDef.weights[i];
      }
    }
    if (meshDef.extras && Array.isArray(meshDef.extras.targetNames)) {
      var targetNames = meshDef.extras.targetNames;
      if (mesh.morphTargetInfluences.length === targetNames.length) {
        mesh.morphTargetDictionary = {};
        for (var i = 0, il = targetNames.length; i < il; i++) {
          mesh.morphTargetDictionary[targetNames[i]] = i;
        }
      } else {
        console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.");
      }
    }
  }
  function createPrimitiveKey(primitiveDef) {
    var dracoExtension = primitiveDef.extensions && primitiveDef.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION];
    var geometryKey;
    if (dracoExtension) {
      geometryKey = "draco:" + dracoExtension.bufferView + ":" + dracoExtension.indices + ":" + createAttributesKey(dracoExtension.attributes);
    } else {
      geometryKey = primitiveDef.indices + ":" + createAttributesKey(primitiveDef.attributes) + ":" + primitiveDef.mode;
    }
    return geometryKey;
  }
  function createAttributesKey(attributes) {
    var attributesKey = "";
    var keys = Object.keys(attributes).sort();
    for (var i = 0, il = keys.length; i < il; i++) {
      attributesKey += keys[i] + ":" + attributes[keys[i]] + ";";
    }
    return attributesKey;
  }
  function GLTFParser(json, options) {
    this.json = json || {};
    this.extensions = {};
    this.plugins = {};
    this.options = options || {};
    this.cache = new GLTFRegistry();
    this.associations = new Map();
    this.primitiveCache = {};
    this.meshCache = {refs: {}, uses: {}};
    this.cameraCache = {refs: {}, uses: {}};
    this.lightCache = {refs: {}, uses: {}};
    this.nodeNamesUsed = {};
    if (typeof createImageBitmap !== "undefined" && /Firefox/.test(navigator.userAgent) === false) {
      this.textureLoader = new ImageBitmapLoader2(this.options.manager);
    } else {
      this.textureLoader = new TextureLoader2(this.options.manager);
    }
    this.textureLoader.setCrossOrigin(this.options.crossOrigin);
    this.fileLoader = new FileLoader2(this.options.manager);
    this.fileLoader.setResponseType("arraybuffer");
    if (this.options.crossOrigin === "use-credentials") {
      this.fileLoader.setWithCredentials(true);
    }
  }
  GLTFParser.prototype.setExtensions = function(extensions) {
    this.extensions = extensions;
  };
  GLTFParser.prototype.setPlugins = function(plugins) {
    this.plugins = plugins;
  };
  GLTFParser.prototype.parse = function(onLoad, onError) {
    var parser = this;
    var json = this.json;
    var extensions = this.extensions;
    this.cache.removeAll();
    this._invokeAll(function(ext) {
      return ext._markDefs && ext._markDefs();
    });
    Promise.all([
      this.getDependencies("scene"),
      this.getDependencies("animation"),
      this.getDependencies("camera")
    ]).then(function(dependencies) {
      var result = {
        scene: dependencies[0][json.scene || 0],
        scenes: dependencies[0],
        animations: dependencies[1],
        cameras: dependencies[2],
        asset: json.asset,
        parser,
        userData: {}
      };
      addUnknownExtensionsToUserData(extensions, result, json);
      assignExtrasToUserData(result, json);
      onLoad(result);
    }).catch(onError);
  };
  GLTFParser.prototype._markDefs = function() {
    var nodeDefs = this.json.nodes || [];
    var skinDefs = this.json.skins || [];
    var meshDefs = this.json.meshes || [];
    for (var skinIndex = 0, skinLength = skinDefs.length; skinIndex < skinLength; skinIndex++) {
      var joints = skinDefs[skinIndex].joints;
      for (var i = 0, il = joints.length; i < il; i++) {
        nodeDefs[joints[i]].isBone = true;
      }
    }
    for (var nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex++) {
      var nodeDef = nodeDefs[nodeIndex];
      if (nodeDef.mesh !== void 0) {
        this._addNodeRef(this.meshCache, nodeDef.mesh);
        if (nodeDef.skin !== void 0) {
          meshDefs[nodeDef.mesh].isSkinnedMesh = true;
        }
      }
      if (nodeDef.camera !== void 0) {
        this._addNodeRef(this.cameraCache, nodeDef.camera);
      }
    }
  };
  GLTFParser.prototype._addNodeRef = function(cache, index) {
    if (index === void 0)
      return;
    if (cache.refs[index] === void 0) {
      cache.refs[index] = cache.uses[index] = 0;
    }
    cache.refs[index]++;
  };
  GLTFParser.prototype._getNodeRef = function(cache, index, object) {
    if (cache.refs[index] <= 1)
      return object;
    var ref = object.clone();
    ref.name += "_instance_" + cache.uses[index]++;
    return ref;
  };
  GLTFParser.prototype._invokeOne = function(func) {
    var extensions = Object.values(this.plugins);
    extensions.push(this);
    for (var i = 0; i < extensions.length; i++) {
      var result = func(extensions[i]);
      if (result)
        return result;
    }
  };
  GLTFParser.prototype._invokeAll = function(func) {
    var extensions = Object.values(this.plugins);
    extensions.unshift(this);
    var pending = [];
    for (var i = 0; i < extensions.length; i++) {
      var result = func(extensions[i]);
      if (result)
        pending.push(result);
    }
    return pending;
  };
  GLTFParser.prototype.getDependency = function(type, index) {
    var cacheKey = type + ":" + index;
    var dependency = this.cache.get(cacheKey);
    if (!dependency) {
      switch (type) {
        case "scene":
          dependency = this.loadScene(index);
          break;
        case "node":
          dependency = this.loadNode(index);
          break;
        case "mesh":
          dependency = this._invokeOne(function(ext) {
            return ext.loadMesh && ext.loadMesh(index);
          });
          break;
        case "accessor":
          dependency = this.loadAccessor(index);
          break;
        case "bufferView":
          dependency = this._invokeOne(function(ext) {
            return ext.loadBufferView && ext.loadBufferView(index);
          });
          break;
        case "buffer":
          dependency = this.loadBuffer(index);
          break;
        case "material":
          dependency = this._invokeOne(function(ext) {
            return ext.loadMaterial && ext.loadMaterial(index);
          });
          break;
        case "texture":
          dependency = this._invokeOne(function(ext) {
            return ext.loadTexture && ext.loadTexture(index);
          });
          break;
        case "skin":
          dependency = this.loadSkin(index);
          break;
        case "animation":
          dependency = this.loadAnimation(index);
          break;
        case "camera":
          dependency = this.loadCamera(index);
          break;
        default:
          throw new Error("Unknown type: " + type);
      }
      this.cache.add(cacheKey, dependency);
    }
    return dependency;
  };
  GLTFParser.prototype.getDependencies = function(type) {
    var dependencies = this.cache.get(type);
    if (!dependencies) {
      var parser = this;
      var defs = this.json[type + (type === "mesh" ? "es" : "s")] || [];
      dependencies = Promise.all(defs.map(function(def, index) {
        return parser.getDependency(type, index);
      }));
      this.cache.add(type, dependencies);
    }
    return dependencies;
  };
  GLTFParser.prototype.loadBuffer = function(bufferIndex) {
    var bufferDef = this.json.buffers[bufferIndex];
    var loader = this.fileLoader;
    if (bufferDef.type && bufferDef.type !== "arraybuffer") {
      throw new Error("THREE.GLTFLoader: " + bufferDef.type + " buffer type is not supported.");
    }
    if (bufferDef.uri === void 0 && bufferIndex === 0) {
      return Promise.resolve(this.extensions[EXTENSIONS.KHR_BINARY_GLTF].body);
    }
    var options = this.options;
    return new Promise(function(resolve, reject) {
      loader.load(resolveURL(bufferDef.uri, options.path), resolve, void 0, function() {
        reject(new Error('THREE.GLTFLoader: Failed to load buffer "' + bufferDef.uri + '".'));
      });
    });
  };
  GLTFParser.prototype.loadBufferView = function(bufferViewIndex) {
    var bufferViewDef = this.json.bufferViews[bufferViewIndex];
    return this.getDependency("buffer", bufferViewDef.buffer).then(function(buffer) {
      var byteLength = bufferViewDef.byteLength || 0;
      var byteOffset = bufferViewDef.byteOffset || 0;
      return buffer.slice(byteOffset, byteOffset + byteLength);
    });
  };
  GLTFParser.prototype.loadAccessor = function(accessorIndex) {
    var parser = this;
    var json = this.json;
    var accessorDef = this.json.accessors[accessorIndex];
    if (accessorDef.bufferView === void 0 && accessorDef.sparse === void 0) {
      return Promise.resolve(null);
    }
    var pendingBufferViews = [];
    if (accessorDef.bufferView !== void 0) {
      pendingBufferViews.push(this.getDependency("bufferView", accessorDef.bufferView));
    } else {
      pendingBufferViews.push(null);
    }
    if (accessorDef.sparse !== void 0) {
      pendingBufferViews.push(this.getDependency("bufferView", accessorDef.sparse.indices.bufferView));
      pendingBufferViews.push(this.getDependency("bufferView", accessorDef.sparse.values.bufferView));
    }
    return Promise.all(pendingBufferViews).then(function(bufferViews) {
      var bufferView = bufferViews[0];
      var itemSize = WEBGL_TYPE_SIZES[accessorDef.type];
      var TypedArray = WEBGL_COMPONENT_TYPES[accessorDef.componentType];
      var elementBytes = TypedArray.BYTES_PER_ELEMENT;
      var itemBytes = elementBytes * itemSize;
      var byteOffset = accessorDef.byteOffset || 0;
      var byteStride = accessorDef.bufferView !== void 0 ? json.bufferViews[accessorDef.bufferView].byteStride : void 0;
      var normalized = accessorDef.normalized === true;
      var array, bufferAttribute;
      if (byteStride && byteStride !== itemBytes) {
        var ibSlice = Math.floor(byteOffset / byteStride);
        var ibCacheKey = "InterleavedBuffer:" + accessorDef.bufferView + ":" + accessorDef.componentType + ":" + ibSlice + ":" + accessorDef.count;
        var ib = parser.cache.get(ibCacheKey);
        if (!ib) {
          array = new TypedArray(bufferView, ibSlice * byteStride, accessorDef.count * byteStride / elementBytes);
          ib = new InterleavedBuffer2(array, byteStride / elementBytes);
          parser.cache.add(ibCacheKey, ib);
        }
        bufferAttribute = new InterleavedBufferAttribute2(ib, itemSize, byteOffset % byteStride / elementBytes, normalized);
      } else {
        if (bufferView === null) {
          array = new TypedArray(accessorDef.count * itemSize);
        } else {
          array = new TypedArray(bufferView, byteOffset, accessorDef.count * itemSize);
        }
        bufferAttribute = new BufferAttribute2(array, itemSize, normalized);
      }
      if (accessorDef.sparse !== void 0) {
        var itemSizeIndices = WEBGL_TYPE_SIZES.SCALAR;
        var TypedArrayIndices = WEBGL_COMPONENT_TYPES[accessorDef.sparse.indices.componentType];
        var byteOffsetIndices = accessorDef.sparse.indices.byteOffset || 0;
        var byteOffsetValues = accessorDef.sparse.values.byteOffset || 0;
        var sparseIndices = new TypedArrayIndices(bufferViews[1], byteOffsetIndices, accessorDef.sparse.count * itemSizeIndices);
        var sparseValues = new TypedArray(bufferViews[2], byteOffsetValues, accessorDef.sparse.count * itemSize);
        if (bufferView !== null) {
          bufferAttribute = new BufferAttribute2(bufferAttribute.array.slice(), bufferAttribute.itemSize, bufferAttribute.normalized);
        }
        for (var i = 0, il = sparseIndices.length; i < il; i++) {
          var index = sparseIndices[i];
          bufferAttribute.setX(index, sparseValues[i * itemSize]);
          if (itemSize >= 2)
            bufferAttribute.setY(index, sparseValues[i * itemSize + 1]);
          if (itemSize >= 3)
            bufferAttribute.setZ(index, sparseValues[i * itemSize + 2]);
          if (itemSize >= 4)
            bufferAttribute.setW(index, sparseValues[i * itemSize + 3]);
          if (itemSize >= 5)
            throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.");
        }
      }
      return bufferAttribute;
    });
  };
  GLTFParser.prototype.loadTexture = function(textureIndex) {
    var parser = this;
    var json = this.json;
    var options = this.options;
    var textureDef = json.textures[textureIndex];
    var textureExtensions = textureDef.extensions || {};
    var source;
    if (textureExtensions[EXTENSIONS.MSFT_TEXTURE_DDS]) {
      source = json.images[textureExtensions[EXTENSIONS.MSFT_TEXTURE_DDS].source];
    } else {
      source = json.images[textureDef.source];
    }
    var loader;
    if (source.uri) {
      loader = options.manager.getHandler(source.uri);
    }
    if (!loader) {
      loader = textureExtensions[EXTENSIONS.MSFT_TEXTURE_DDS] ? parser.extensions[EXTENSIONS.MSFT_TEXTURE_DDS].ddsLoader : this.textureLoader;
    }
    return this.loadTextureImage(textureIndex, source, loader);
  };
  GLTFParser.prototype.loadTextureImage = function(textureIndex, source, loader) {
    var parser = this;
    var json = this.json;
    var options = this.options;
    var textureDef = json.textures[textureIndex];
    var URL = self.URL || self.webkitURL;
    var sourceURI = source.uri;
    var isObjectURL = false;
    var hasAlpha = true;
    if (source.mimeType === "image/jpeg")
      hasAlpha = false;
    if (source.bufferView !== void 0) {
      sourceURI = parser.getDependency("bufferView", source.bufferView).then(function(bufferView) {
        if (source.mimeType === "image/png") {
          var colorType = new DataView(bufferView, 25, 1).getUint8(0, false);
          hasAlpha = colorType === 6 || colorType === 4 || colorType === 3;
        }
        isObjectURL = true;
        var blob = new Blob([bufferView], {type: source.mimeType});
        sourceURI = URL.createObjectURL(blob);
        return sourceURI;
      });
    }
    return Promise.resolve(sourceURI).then(function(sourceURI2) {
      return new Promise(function(resolve, reject) {
        var onLoad = resolve;
        if (loader.isImageBitmapLoader === true) {
          onLoad = function(imageBitmap) {
            resolve(new CanvasTexture2(imageBitmap));
          };
        }
        loader.load(resolveURL(sourceURI2, options.path), onLoad, void 0, reject);
      });
    }).then(function(texture) {
      if (isObjectURL === true) {
        URL.revokeObjectURL(sourceURI);
      }
      texture.flipY = false;
      if (textureDef.name)
        texture.name = textureDef.name;
      if (!hasAlpha)
        texture.format = RGBFormat;
      var samplers = json.samplers || {};
      var sampler = samplers[textureDef.sampler] || {};
      texture.magFilter = WEBGL_FILTERS[sampler.magFilter] || LinearFilter;
      texture.minFilter = WEBGL_FILTERS[sampler.minFilter] || LinearMipmapLinearFilter;
      texture.wrapS = WEBGL_WRAPPINGS[sampler.wrapS] || RepeatWrapping;
      texture.wrapT = WEBGL_WRAPPINGS[sampler.wrapT] || RepeatWrapping;
      parser.associations.set(texture, {
        type: "textures",
        index: textureIndex
      });
      return texture;
    });
  };
  GLTFParser.prototype.assignTexture = function(materialParams, mapName, mapDef) {
    var parser = this;
    return this.getDependency("texture", mapDef.index).then(function(texture) {
      if (mapDef.texCoord !== void 0 && mapDef.texCoord != 0 && !(mapName === "aoMap" && mapDef.texCoord == 1)) {
        console.warn("THREE.GLTFLoader: Custom UV set " + mapDef.texCoord + " for texture " + mapName + " not yet supported.");
      }
      if (parser.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM]) {
        var transform = mapDef.extensions !== void 0 ? mapDef.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM] : void 0;
        if (transform) {
          var gltfReference = parser.associations.get(texture);
          texture = parser.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM].extendTexture(texture, transform);
          parser.associations.set(texture, gltfReference);
        }
      }
      materialParams[mapName] = texture;
    });
  };
  GLTFParser.prototype.assignFinalMaterial = function(mesh) {
    var geometry = mesh.geometry;
    var material = mesh.material;
    var useVertexTangents = geometry.attributes.tangent !== void 0;
    var useVertexColors = geometry.attributes.color !== void 0;
    var useFlatShading = geometry.attributes.normal === void 0;
    var useSkinning = mesh.isSkinnedMesh === true;
    var useMorphTargets = Object.keys(geometry.morphAttributes).length > 0;
    var useMorphNormals = useMorphTargets && geometry.morphAttributes.normal !== void 0;
    if (mesh.isPoints) {
      var cacheKey = "PointsMaterial:" + material.uuid;
      var pointsMaterial = this.cache.get(cacheKey);
      if (!pointsMaterial) {
        pointsMaterial = new PointsMaterial2();
        Material2.prototype.copy.call(pointsMaterial, material);
        pointsMaterial.color.copy(material.color);
        pointsMaterial.map = material.map;
        pointsMaterial.sizeAttenuation = false;
        this.cache.add(cacheKey, pointsMaterial);
      }
      material = pointsMaterial;
    } else if (mesh.isLine) {
      var cacheKey = "LineBasicMaterial:" + material.uuid;
      var lineMaterial = this.cache.get(cacheKey);
      if (!lineMaterial) {
        lineMaterial = new LineBasicMaterial2();
        Material2.prototype.copy.call(lineMaterial, material);
        lineMaterial.color.copy(material.color);
        this.cache.add(cacheKey, lineMaterial);
      }
      material = lineMaterial;
    }
    if (useVertexTangents || useVertexColors || useFlatShading || useSkinning || useMorphTargets) {
      var cacheKey = "ClonedMaterial:" + material.uuid + ":";
      if (material.isGLTFSpecularGlossinessMaterial)
        cacheKey += "specular-glossiness:";
      if (useSkinning)
        cacheKey += "skinning:";
      if (useVertexTangents)
        cacheKey += "vertex-tangents:";
      if (useVertexColors)
        cacheKey += "vertex-colors:";
      if (useFlatShading)
        cacheKey += "flat-shading:";
      if (useMorphTargets)
        cacheKey += "morph-targets:";
      if (useMorphNormals)
        cacheKey += "morph-normals:";
      var cachedMaterial = this.cache.get(cacheKey);
      if (!cachedMaterial) {
        cachedMaterial = material.clone();
        if (useSkinning)
          cachedMaterial.skinning = true;
        if (useVertexTangents)
          cachedMaterial.vertexTangents = true;
        if (useVertexColors)
          cachedMaterial.vertexColors = true;
        if (useFlatShading)
          cachedMaterial.flatShading = true;
        if (useMorphTargets)
          cachedMaterial.morphTargets = true;
        if (useMorphNormals)
          cachedMaterial.morphNormals = true;
        this.cache.add(cacheKey, cachedMaterial);
        this.associations.set(cachedMaterial, this.associations.get(material));
      }
      material = cachedMaterial;
    }
    if (material.aoMap && geometry.attributes.uv2 === void 0 && geometry.attributes.uv !== void 0) {
      geometry.setAttribute("uv2", geometry.attributes.uv);
    }
    if (material.normalScale && !useVertexTangents) {
      material.normalScale.y = -material.normalScale.y;
    }
    if (material.clearcoatNormalScale && !useVertexTangents) {
      material.clearcoatNormalScale.y = -material.clearcoatNormalScale.y;
    }
    mesh.material = material;
  };
  GLTFParser.prototype.getMaterialType = function() {
    return MeshStandardMaterial2;
  };
  GLTFParser.prototype.loadMaterial = function(materialIndex) {
    var parser = this;
    var json = this.json;
    var extensions = this.extensions;
    var materialDef = json.materials[materialIndex];
    var materialType;
    var materialParams = {};
    var materialExtensions = materialDef.extensions || {};
    var pending = [];
    if (materialExtensions[EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS]) {
      var sgExtension = extensions[EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS];
      materialType = sgExtension.getMaterialType();
      pending.push(sgExtension.extendParams(materialParams, materialDef, parser));
    } else if (materialExtensions[EXTENSIONS.KHR_MATERIALS_UNLIT]) {
      var kmuExtension = extensions[EXTENSIONS.KHR_MATERIALS_UNLIT];
      materialType = kmuExtension.getMaterialType();
      pending.push(kmuExtension.extendParams(materialParams, materialDef, parser));
    } else {
      var metallicRoughness = materialDef.pbrMetallicRoughness || {};
      materialParams.color = new Color2(1, 1, 1);
      materialParams.opacity = 1;
      if (Array.isArray(metallicRoughness.baseColorFactor)) {
        var array = metallicRoughness.baseColorFactor;
        materialParams.color.fromArray(array);
        materialParams.opacity = array[3];
      }
      if (metallicRoughness.baseColorTexture !== void 0) {
        pending.push(parser.assignTexture(materialParams, "map", metallicRoughness.baseColorTexture));
      }
      materialParams.metalness = metallicRoughness.metallicFactor !== void 0 ? metallicRoughness.metallicFactor : 1;
      materialParams.roughness = metallicRoughness.roughnessFactor !== void 0 ? metallicRoughness.roughnessFactor : 1;
      if (metallicRoughness.metallicRoughnessTexture !== void 0) {
        pending.push(parser.assignTexture(materialParams, "metalnessMap", metallicRoughness.metallicRoughnessTexture));
        pending.push(parser.assignTexture(materialParams, "roughnessMap", metallicRoughness.metallicRoughnessTexture));
      }
      materialType = this._invokeOne(function(ext) {
        return ext.getMaterialType && ext.getMaterialType(materialIndex);
      });
      pending.push(Promise.all(this._invokeAll(function(ext) {
        return ext.extendMaterialParams && ext.extendMaterialParams(materialIndex, materialParams);
      })));
    }
    if (materialDef.doubleSided === true) {
      materialParams.side = DoubleSide;
    }
    var alphaMode = materialDef.alphaMode || ALPHA_MODES.OPAQUE;
    if (alphaMode === ALPHA_MODES.BLEND) {
      materialParams.transparent = true;
      materialParams.depthWrite = false;
    } else {
      materialParams.transparent = false;
      if (alphaMode === ALPHA_MODES.MASK) {
        materialParams.alphaTest = materialDef.alphaCutoff !== void 0 ? materialDef.alphaCutoff : 0.5;
      }
    }
    if (materialDef.normalTexture !== void 0 && materialType !== MeshBasicMaterial2) {
      pending.push(parser.assignTexture(materialParams, "normalMap", materialDef.normalTexture));
      materialParams.normalScale = new Vector22(1, 1);
      if (materialDef.normalTexture.scale !== void 0) {
        materialParams.normalScale.set(materialDef.normalTexture.scale, materialDef.normalTexture.scale);
      }
    }
    if (materialDef.occlusionTexture !== void 0 && materialType !== MeshBasicMaterial2) {
      pending.push(parser.assignTexture(materialParams, "aoMap", materialDef.occlusionTexture));
      if (materialDef.occlusionTexture.strength !== void 0) {
        materialParams.aoMapIntensity = materialDef.occlusionTexture.strength;
      }
    }
    if (materialDef.emissiveFactor !== void 0 && materialType !== MeshBasicMaterial2) {
      materialParams.emissive = new Color2().fromArray(materialDef.emissiveFactor);
    }
    if (materialDef.emissiveTexture !== void 0 && materialType !== MeshBasicMaterial2) {
      pending.push(parser.assignTexture(materialParams, "emissiveMap", materialDef.emissiveTexture));
    }
    return Promise.all(pending).then(function() {
      var material;
      if (materialType === GLTFMeshStandardSGMaterial) {
        material = extensions[EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS].createMaterial(materialParams);
      } else {
        material = new materialType(materialParams);
      }
      if (materialDef.name)
        material.name = materialDef.name;
      if (material.map)
        material.map.encoding = sRGBEncoding;
      if (material.emissiveMap)
        material.emissiveMap.encoding = sRGBEncoding;
      assignExtrasToUserData(material, materialDef);
      parser.associations.set(material, {type: "materials", index: materialIndex});
      if (materialDef.extensions)
        addUnknownExtensionsToUserData(extensions, material, materialDef);
      return material;
    });
  };
  GLTFParser.prototype.createUniqueName = function(originalName) {
    var name = PropertyBinding2.sanitizeNodeName(originalName || "");
    for (var i = 1; this.nodeNamesUsed[name]; ++i) {
      name = originalName + "_" + i;
    }
    this.nodeNamesUsed[name] = true;
    return name;
  };
  function computeBounds(geometry, primitiveDef, parser) {
    var attributes = primitiveDef.attributes;
    var box = new Box32();
    if (attributes.POSITION !== void 0) {
      var accessor = parser.json.accessors[attributes.POSITION];
      var min = accessor.min;
      var max = accessor.max;
      if (min !== void 0 && max !== void 0) {
        box.set(new Vector32(min[0], min[1], min[2]), new Vector32(max[0], max[1], max[2]));
      } else {
        console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
        return;
      }
    } else {
      return;
    }
    var targets = primitiveDef.targets;
    if (targets !== void 0) {
      var maxDisplacement = new Vector32();
      var vector = new Vector32();
      for (var i = 0, il = targets.length; i < il; i++) {
        var target = targets[i];
        if (target.POSITION !== void 0) {
          var accessor = parser.json.accessors[target.POSITION];
          var min = accessor.min;
          var max = accessor.max;
          if (min !== void 0 && max !== void 0) {
            vector.setX(Math.max(Math.abs(min[0]), Math.abs(max[0])));
            vector.setY(Math.max(Math.abs(min[1]), Math.abs(max[1])));
            vector.setZ(Math.max(Math.abs(min[2]), Math.abs(max[2])));
            maxDisplacement.max(vector);
          } else {
            console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
          }
        }
      }
      box.expandByVector(maxDisplacement);
    }
    geometry.boundingBox = box;
    var sphere = new Sphere2();
    box.getCenter(sphere.center);
    sphere.radius = box.min.distanceTo(box.max) / 2;
    geometry.boundingSphere = sphere;
  }
  function addPrimitiveAttributes(geometry, primitiveDef, parser) {
    var attributes = primitiveDef.attributes;
    var pending = [];
    function assignAttributeAccessor(accessorIndex, attributeName) {
      return parser.getDependency("accessor", accessorIndex).then(function(accessor2) {
        geometry.setAttribute(attributeName, accessor2);
      });
    }
    for (var gltfAttributeName in attributes) {
      var threeAttributeName = ATTRIBUTES[gltfAttributeName] || gltfAttributeName.toLowerCase();
      if (threeAttributeName in geometry.attributes)
        continue;
      pending.push(assignAttributeAccessor(attributes[gltfAttributeName], threeAttributeName));
    }
    if (primitiveDef.indices !== void 0 && !geometry.index) {
      var accessor = parser.getDependency("accessor", primitiveDef.indices).then(function(accessor2) {
        geometry.setIndex(accessor2);
      });
      pending.push(accessor);
    }
    assignExtrasToUserData(geometry, primitiveDef);
    computeBounds(geometry, primitiveDef, parser);
    return Promise.all(pending).then(function() {
      return primitiveDef.targets !== void 0 ? addMorphTargets(geometry, primitiveDef.targets, parser) : geometry;
    });
  }
  function toTrianglesDrawMode(geometry, drawMode) {
    var index = geometry.getIndex();
    if (index === null) {
      var indices = [];
      var position = geometry.getAttribute("position");
      if (position !== void 0) {
        for (var i = 0; i < position.count; i++) {
          indices.push(i);
        }
        geometry.setIndex(indices);
        index = geometry.getIndex();
      } else {
        console.error("THREE.GLTFLoader.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.");
        return geometry;
      }
    }
    var numberOfTriangles = index.count - 2;
    var newIndices = [];
    if (drawMode === TriangleFanDrawMode) {
      for (var i = 1; i <= numberOfTriangles; i++) {
        newIndices.push(index.getX(0));
        newIndices.push(index.getX(i));
        newIndices.push(index.getX(i + 1));
      }
    } else {
      for (var i = 0; i < numberOfTriangles; i++) {
        if (i % 2 === 0) {
          newIndices.push(index.getX(i));
          newIndices.push(index.getX(i + 1));
          newIndices.push(index.getX(i + 2));
        } else {
          newIndices.push(index.getX(i + 2));
          newIndices.push(index.getX(i + 1));
          newIndices.push(index.getX(i));
        }
      }
    }
    if (newIndices.length / 3 !== numberOfTriangles) {
      console.error("THREE.GLTFLoader.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");
    }
    var newGeometry = geometry.clone();
    newGeometry.setIndex(newIndices);
    return newGeometry;
  }
  GLTFParser.prototype.loadGeometries = function(primitives) {
    var parser = this;
    var extensions = this.extensions;
    var cache = this.primitiveCache;
    function createDracoPrimitive(primitive2) {
      return extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(primitive2, parser).then(function(geometry) {
        return addPrimitiveAttributes(geometry, primitive2, parser);
      });
    }
    var pending = [];
    for (var i = 0, il = primitives.length; i < il; i++) {
      var primitive = primitives[i];
      var cacheKey = createPrimitiveKey(primitive);
      var cached = cache[cacheKey];
      if (cached) {
        pending.push(cached.promise);
      } else {
        var geometryPromise;
        if (primitive.extensions && primitive.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION]) {
          geometryPromise = createDracoPrimitive(primitive);
        } else {
          geometryPromise = addPrimitiveAttributes(new BufferGeometry2(), primitive, parser);
        }
        cache[cacheKey] = {primitive, promise: geometryPromise};
        pending.push(geometryPromise);
      }
    }
    return Promise.all(pending);
  };
  GLTFParser.prototype.loadMesh = function(meshIndex) {
    var parser = this;
    var json = this.json;
    var extensions = this.extensions;
    var meshDef = json.meshes[meshIndex];
    var primitives = meshDef.primitives;
    var pending = [];
    for (var i = 0, il = primitives.length; i < il; i++) {
      var material = primitives[i].material === void 0 ? createDefaultMaterial(this.cache) : this.getDependency("material", primitives[i].material);
      pending.push(material);
    }
    pending.push(parser.loadGeometries(primitives));
    return Promise.all(pending).then(function(results) {
      var materials = results.slice(0, results.length - 1);
      var geometries = results[results.length - 1];
      var meshes = [];
      for (var i2 = 0, il2 = geometries.length; i2 < il2; i2++) {
        var geometry = geometries[i2];
        var primitive = primitives[i2];
        var mesh;
        var material2 = materials[i2];
        if (primitive.mode === WEBGL_CONSTANTS.TRIANGLES || primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP || primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN || primitive.mode === void 0) {
          mesh = meshDef.isSkinnedMesh === true ? new SkinnedMesh2(geometry, material2) : new Mesh2(geometry, material2);
          if (mesh.isSkinnedMesh === true && !mesh.geometry.attributes.skinWeight.normalized) {
            mesh.normalizeSkinWeights();
          }
          if (primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP) {
            mesh.geometry = toTrianglesDrawMode(mesh.geometry, TriangleStripDrawMode);
          } else if (primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN) {
            mesh.geometry = toTrianglesDrawMode(mesh.geometry, TriangleFanDrawMode);
          }
        } else if (primitive.mode === WEBGL_CONSTANTS.LINES) {
          mesh = new LineSegments2(geometry, material2);
        } else if (primitive.mode === WEBGL_CONSTANTS.LINE_STRIP) {
          mesh = new Line2(geometry, material2);
        } else if (primitive.mode === WEBGL_CONSTANTS.LINE_LOOP) {
          mesh = new LineLoop2(geometry, material2);
        } else if (primitive.mode === WEBGL_CONSTANTS.POINTS) {
          mesh = new Points2(geometry, material2);
        } else {
          throw new Error("THREE.GLTFLoader: Primitive mode unsupported: " + primitive.mode);
        }
        if (Object.keys(mesh.geometry.morphAttributes).length > 0) {
          updateMorphTargets(mesh, meshDef);
        }
        mesh.name = parser.createUniqueName(meshDef.name || "mesh_" + meshIndex);
        assignExtrasToUserData(mesh, meshDef);
        if (primitive.extensions)
          addUnknownExtensionsToUserData(extensions, mesh, primitive);
        parser.assignFinalMaterial(mesh);
        meshes.push(mesh);
      }
      if (meshes.length === 1) {
        return meshes[0];
      }
      var group = new Group2();
      for (var i2 = 0, il2 = meshes.length; i2 < il2; i2++) {
        group.add(meshes[i2]);
      }
      return group;
    });
  };
  GLTFParser.prototype.loadCamera = function(cameraIndex) {
    var camera;
    var cameraDef = this.json.cameras[cameraIndex];
    var params = cameraDef[cameraDef.type];
    if (!params) {
      console.warn("THREE.GLTFLoader: Missing camera parameters.");
      return;
    }
    if (cameraDef.type === "perspective") {
      camera = new PerspectiveCamera2(MathUtils2.radToDeg(params.yfov), params.aspectRatio || 1, params.znear || 1, params.zfar || 2e6);
    } else if (cameraDef.type === "orthographic") {
      camera = new OrthographicCamera2(-params.xmag, params.xmag, params.ymag, -params.ymag, params.znear, params.zfar);
    }
    if (cameraDef.name)
      camera.name = this.createUniqueName(cameraDef.name);
    assignExtrasToUserData(camera, cameraDef);
    return Promise.resolve(camera);
  };
  GLTFParser.prototype.loadSkin = function(skinIndex) {
    var skinDef = this.json.skins[skinIndex];
    var skinEntry = {joints: skinDef.joints};
    if (skinDef.inverseBindMatrices === void 0) {
      return Promise.resolve(skinEntry);
    }
    return this.getDependency("accessor", skinDef.inverseBindMatrices).then(function(accessor) {
      skinEntry.inverseBindMatrices = accessor;
      return skinEntry;
    });
  };
  GLTFParser.prototype.loadAnimation = function(animationIndex) {
    var json = this.json;
    var animationDef = json.animations[animationIndex];
    var pendingNodes = [];
    var pendingInputAccessors = [];
    var pendingOutputAccessors = [];
    var pendingSamplers = [];
    var pendingTargets = [];
    for (var i = 0, il = animationDef.channels.length; i < il; i++) {
      var channel = animationDef.channels[i];
      var sampler = animationDef.samplers[channel.sampler];
      var target = channel.target;
      var name = target.node !== void 0 ? target.node : target.id;
      var input = animationDef.parameters !== void 0 ? animationDef.parameters[sampler.input] : sampler.input;
      var output = animationDef.parameters !== void 0 ? animationDef.parameters[sampler.output] : sampler.output;
      pendingNodes.push(this.getDependency("node", name));
      pendingInputAccessors.push(this.getDependency("accessor", input));
      pendingOutputAccessors.push(this.getDependency("accessor", output));
      pendingSamplers.push(sampler);
      pendingTargets.push(target);
    }
    return Promise.all([
      Promise.all(pendingNodes),
      Promise.all(pendingInputAccessors),
      Promise.all(pendingOutputAccessors),
      Promise.all(pendingSamplers),
      Promise.all(pendingTargets)
    ]).then(function(dependencies) {
      var nodes = dependencies[0];
      var inputAccessors = dependencies[1];
      var outputAccessors = dependencies[2];
      var samplers = dependencies[3];
      var targets = dependencies[4];
      var tracks = [];
      for (var i2 = 0, il2 = nodes.length; i2 < il2; i2++) {
        var node = nodes[i2];
        var inputAccessor = inputAccessors[i2];
        var outputAccessor = outputAccessors[i2];
        var sampler2 = samplers[i2];
        var target2 = targets[i2];
        if (node === void 0)
          continue;
        node.updateMatrix();
        node.matrixAutoUpdate = true;
        var TypedKeyframeTrack;
        switch (PATH_PROPERTIES[target2.path]) {
          case PATH_PROPERTIES.weights:
            TypedKeyframeTrack = NumberKeyframeTrack2;
            break;
          case PATH_PROPERTIES.rotation:
            TypedKeyframeTrack = QuaternionKeyframeTrack2;
            break;
          case PATH_PROPERTIES.position:
          case PATH_PROPERTIES.scale:
          default:
            TypedKeyframeTrack = VectorKeyframeTrack2;
            break;
        }
        var targetName = node.name ? node.name : node.uuid;
        var interpolation = sampler2.interpolation !== void 0 ? INTERPOLATION[sampler2.interpolation] : InterpolateLinear;
        var targetNames = [];
        if (PATH_PROPERTIES[target2.path] === PATH_PROPERTIES.weights) {
          node.traverse(function(object) {
            if (object.isMesh === true && object.morphTargetInfluences) {
              targetNames.push(object.name ? object.name : object.uuid);
            }
          });
        } else {
          targetNames.push(targetName);
        }
        var outputArray = outputAccessor.array;
        if (outputAccessor.normalized) {
          var scale;
          if (outputArray.constructor === Int8Array) {
            scale = 1 / 127;
          } else if (outputArray.constructor === Uint8Array) {
            scale = 1 / 255;
          } else if (outputArray.constructor == Int16Array) {
            scale = 1 / 32767;
          } else if (outputArray.constructor === Uint16Array) {
            scale = 1 / 65535;
          } else {
            throw new Error("THREE.GLTFLoader: Unsupported output accessor component type.");
          }
          var scaled = new Float32Array(outputArray.length);
          for (var j = 0, jl = outputArray.length; j < jl; j++) {
            scaled[j] = outputArray[j] * scale;
          }
          outputArray = scaled;
        }
        for (var j = 0, jl = targetNames.length; j < jl; j++) {
          var track = new TypedKeyframeTrack(targetNames[j] + "." + PATH_PROPERTIES[target2.path], inputAccessor.array, outputArray, interpolation);
          if (sampler2.interpolation === "CUBICSPLINE") {
            track.createInterpolant = function InterpolantFactoryMethodGLTFCubicSpline(result) {
              return new GLTFCubicSplineInterpolant(this.times, this.values, this.getValueSize() / 3, result);
            };
            track.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = true;
          }
          tracks.push(track);
        }
      }
      var name2 = animationDef.name ? animationDef.name : "animation_" + animationIndex;
      return new AnimationClip2(name2, void 0, tracks);
    });
  };
  GLTFParser.prototype.loadNode = function(nodeIndex) {
    var json = this.json;
    var extensions = this.extensions;
    var parser = this;
    var nodeDef = json.nodes[nodeIndex];
    var nodeName = nodeDef.name ? parser.createUniqueName(nodeDef.name) : "";
    return function() {
      var pending = [];
      if (nodeDef.mesh !== void 0) {
        pending.push(parser.getDependency("mesh", nodeDef.mesh).then(function(mesh) {
          var node = parser._getNodeRef(parser.meshCache, nodeDef.mesh, mesh);
          if (nodeDef.weights !== void 0) {
            node.traverse(function(o) {
              if (!o.isMesh)
                return;
              for (var i = 0, il = nodeDef.weights.length; i < il; i++) {
                o.morphTargetInfluences[i] = nodeDef.weights[i];
              }
            });
          }
          return node;
        }));
      }
      if (nodeDef.camera !== void 0) {
        pending.push(parser.getDependency("camera", nodeDef.camera).then(function(camera) {
          return parser._getNodeRef(parser.cameraCache, nodeDef.camera, camera);
        }));
      }
      parser._invokeAll(function(ext) {
        return ext.createNodeAttachment && ext.createNodeAttachment(nodeIndex);
      }).forEach(function(promise) {
        pending.push(promise);
      });
      return Promise.all(pending);
    }().then(function(objects) {
      var node;
      if (nodeDef.isBone === true) {
        node = new Bone2();
      } else if (objects.length > 1) {
        node = new Group2();
      } else if (objects.length === 1) {
        node = objects[0];
      } else {
        node = new Object3D2();
      }
      if (node !== objects[0]) {
        for (var i = 0, il = objects.length; i < il; i++) {
          node.add(objects[i]);
        }
      }
      if (nodeDef.name) {
        node.userData.name = nodeDef.name;
        node.name = nodeName;
      }
      assignExtrasToUserData(node, nodeDef);
      if (nodeDef.extensions)
        addUnknownExtensionsToUserData(extensions, node, nodeDef);
      if (nodeDef.matrix !== void 0) {
        var matrix = new Matrix42();
        matrix.fromArray(nodeDef.matrix);
        node.applyMatrix4(matrix);
      } else {
        if (nodeDef.translation !== void 0) {
          node.position.fromArray(nodeDef.translation);
        }
        if (nodeDef.rotation !== void 0) {
          node.quaternion.fromArray(nodeDef.rotation);
        }
        if (nodeDef.scale !== void 0) {
          node.scale.fromArray(nodeDef.scale);
        }
      }
      parser.associations.set(node, {type: "nodes", index: nodeIndex});
      return node;
    });
  };
  GLTFParser.prototype.loadScene = function() {
    function buildNodeHierachy(nodeId, parentObject, json, parser) {
      var nodeDef = json.nodes[nodeId];
      return parser.getDependency("node", nodeId).then(function(node) {
        if (nodeDef.skin === void 0)
          return node;
        var skinEntry;
        return parser.getDependency("skin", nodeDef.skin).then(function(skin) {
          skinEntry = skin;
          var pendingJoints = [];
          for (var i = 0, il = skinEntry.joints.length; i < il; i++) {
            pendingJoints.push(parser.getDependency("node", skinEntry.joints[i]));
          }
          return Promise.all(pendingJoints);
        }).then(function(jointNodes) {
          node.traverse(function(mesh) {
            if (!mesh.isMesh)
              return;
            var bones = [];
            var boneInverses = [];
            for (var j = 0, jl = jointNodes.length; j < jl; j++) {
              var jointNode = jointNodes[j];
              if (jointNode) {
                bones.push(jointNode);
                var mat = new Matrix42();
                if (skinEntry.inverseBindMatrices !== void 0) {
                  mat.fromArray(skinEntry.inverseBindMatrices.array, j * 16);
                }
                boneInverses.push(mat);
              } else {
                console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', skinEntry.joints[j]);
              }
            }
            mesh.bind(new Skeleton2(bones, boneInverses), mesh.matrixWorld);
          });
          return node;
        });
      }).then(function(node) {
        parentObject.add(node);
        var pending = [];
        if (nodeDef.children) {
          var children = nodeDef.children;
          for (var i = 0, il = children.length; i < il; i++) {
            var child = children[i];
            pending.push(buildNodeHierachy(child, node, json, parser));
          }
        }
        return Promise.all(pending);
      });
    }
    return function loadScene(sceneIndex) {
      var json = this.json;
      var extensions = this.extensions;
      var sceneDef = this.json.scenes[sceneIndex];
      var parser = this;
      var scene = new Group2();
      if (sceneDef.name)
        scene.name = parser.createUniqueName(sceneDef.name);
      assignExtrasToUserData(scene, sceneDef);
      if (sceneDef.extensions)
        addUnknownExtensionsToUserData(extensions, scene, sceneDef);
      var nodeIds = sceneDef.nodes || [];
      var pending = [];
      for (var i = 0, il = nodeIds.length; i < il; i++) {
        pending.push(buildNodeHierachy(nodeIds[i], scene, json, parser));
      }
      return Promise.all(pending).then(function() {
        return scene;
      });
    };
  }();
  return GLTFLoader2;
}();
export {GLTFLoader};
