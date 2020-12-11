import {Color as Color2} from "three/src/math/Color";
import {LoadingManager as LoadingManager2} from "three/src/loaders/LoadingManager";
const DefaultLoadingManager = new LoadingManager2();
import {FileLoader as FileLoader2} from "three/src/loaders/FileLoader";
import {FrontSide} from "three/src/constants";
import {Loader as Loader2} from "three/src/loaders/Loader";
import {LoaderUtils as LoaderUtils2} from "three/src/loaders/LoaderUtils";
import {MeshPhongMaterial as MeshPhongMaterial2} from "three/src/materials/MeshPhongMaterial";
import {RepeatWrapping} from "three/src/constants";
import {TextureLoader as TextureLoader2} from "three/src/loaders/TextureLoader";
import {Vector2 as Vector22} from "three/src/math/Vector2";
var MTLLoader = function(manager) {
  Loader2.call(this, manager);
};
MTLLoader.prototype = Object.assign(Object.create(Loader2.prototype), {
  constructor: MTLLoader,
  load: function(url, onLoad, onProgress, onError) {
    var scope = this;
    var path = this.path === "" ? LoaderUtils2.extractUrlBase(url) : this.path;
    var loader = new FileLoader2(this.manager);
    loader.setPath(this.path);
    loader.setRequestHeader(this.requestHeader);
    loader.setWithCredentials(this.withCredentials);
    loader.load(url, function(text) {
      try {
        onLoad(scope.parse(text, path));
      } catch (e) {
        if (onError) {
          onError(e);
        } else {
          console.error(e);
        }
        scope.manager.itemError(url);
      }
    }, onProgress, onError);
  },
  setMaterialOptions: function(value) {
    this.materialOptions = value;
    return this;
  },
  parse: function(text, path) {
    var lines = text.split("\n");
    var info = {};
    var delimiter_pattern = /\s+/;
    var materialsInfo = {};
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      line = line.trim();
      if (line.length === 0 || line.charAt(0) === "#") {
        continue;
      }
      var pos = line.indexOf(" ");
      var key = pos >= 0 ? line.substring(0, pos) : line;
      key = key.toLowerCase();
      var value = pos >= 0 ? line.substring(pos + 1) : "";
      value = value.trim();
      if (key === "newmtl") {
        info = {name: value};
        materialsInfo[value] = info;
      } else {
        if (key === "ka" || key === "kd" || key === "ks" || key === "ke") {
          var ss = value.split(delimiter_pattern, 3);
          info[key] = [parseFloat(ss[0]), parseFloat(ss[1]), parseFloat(ss[2])];
        } else {
          info[key] = value;
        }
      }
    }
    var materialCreator = new MTLLoader.MaterialCreator(this.resourcePath || path, this.materialOptions);
    materialCreator.setCrossOrigin(this.crossOrigin);
    materialCreator.setManager(this.manager);
    materialCreator.setMaterials(materialsInfo);
    return materialCreator;
  }
});
MTLLoader.MaterialCreator = function(baseUrl, options) {
  this.baseUrl = baseUrl || "";
  this.options = options;
  this.materialsInfo = {};
  this.materials = {};
  this.materialsArray = [];
  this.nameLookup = {};
  this.side = this.options && this.options.side ? this.options.side : FrontSide;
  this.wrap = this.options && this.options.wrap ? this.options.wrap : RepeatWrapping;
};
MTLLoader.MaterialCreator.prototype = {
  constructor: MTLLoader.MaterialCreator,
  crossOrigin: "anonymous",
  setCrossOrigin: function(value) {
    this.crossOrigin = value;
    return this;
  },
  setManager: function(value) {
    this.manager = value;
  },
  setMaterials: function(materialsInfo) {
    this.materialsInfo = this.convert(materialsInfo);
    this.materials = {};
    this.materialsArray = [];
    this.nameLookup = {};
  },
  convert: function(materialsInfo) {
    if (!this.options)
      return materialsInfo;
    var converted = {};
    for (var mn in materialsInfo) {
      var mat = materialsInfo[mn];
      var covmat = {};
      converted[mn] = covmat;
      for (var prop in mat) {
        var save = true;
        var value = mat[prop];
        var lprop = prop.toLowerCase();
        switch (lprop) {
          case "kd":
          case "ka":
          case "ks":
            if (this.options && this.options.normalizeRGB) {
              value = [value[0] / 255, value[1] / 255, value[2] / 255];
            }
            if (this.options && this.options.ignoreZeroRGBs) {
              if (value[0] === 0 && value[1] === 0 && value[2] === 0) {
                save = false;
              }
            }
            break;
          default:
            break;
        }
        if (save) {
          covmat[lprop] = value;
        }
      }
    }
    return converted;
  },
  preload: function() {
    for (var mn in this.materialsInfo) {
      this.create(mn);
    }
  },
  getIndex: function(materialName) {
    return this.nameLookup[materialName];
  },
  getAsArray: function() {
    var index = 0;
    for (var mn in this.materialsInfo) {
      this.materialsArray[index] = this.create(mn);
      this.nameLookup[mn] = index;
      index++;
    }
    return this.materialsArray;
  },
  create: function(materialName) {
    if (this.materials[materialName] === void 0) {
      this.createMaterial_(materialName);
    }
    return this.materials[materialName];
  },
  createMaterial_: function(materialName) {
    var scope = this;
    var mat = this.materialsInfo[materialName];
    var params = {
      name: materialName,
      side: this.side
    };
    function resolveURL(baseUrl, url) {
      if (typeof url !== "string" || url === "")
        return "";
      if (/^https?:\/\//i.test(url))
        return url;
      return baseUrl + url;
    }
    function setMapForType(mapType, value2) {
      if (params[mapType])
        return;
      var texParams = scope.getTextureParams(value2, params);
      var map = scope.loadTexture(resolveURL(scope.baseUrl, texParams.url));
      map.repeat.copy(texParams.scale);
      map.offset.copy(texParams.offset);
      map.wrapS = scope.wrap;
      map.wrapT = scope.wrap;
      params[mapType] = map;
    }
    for (var prop in mat) {
      var value = mat[prop];
      var n;
      if (value === "")
        continue;
      switch (prop.toLowerCase()) {
        case "kd":
          params.color = new Color2().fromArray(value);
          break;
        case "ks":
          params.specular = new Color2().fromArray(value);
          break;
        case "ke":
          params.emissive = new Color2().fromArray(value);
          break;
        case "map_kd":
          setMapForType("map", value);
          break;
        case "map_ks":
          setMapForType("specularMap", value);
          break;
        case "map_ke":
          setMapForType("emissiveMap", value);
          break;
        case "norm":
          setMapForType("normalMap", value);
          break;
        case "map_bump":
        case "bump":
          setMapForType("bumpMap", value);
          break;
        case "map_d":
          setMapForType("alphaMap", value);
          params.transparent = true;
          break;
        case "ns":
          params.shininess = parseFloat(value);
          break;
        case "d":
          n = parseFloat(value);
          if (n < 1) {
            params.opacity = n;
            params.transparent = true;
          }
          break;
        case "tr":
          n = parseFloat(value);
          if (this.options && this.options.invertTrProperty)
            n = 1 - n;
          if (n > 0) {
            params.opacity = 1 - n;
            params.transparent = true;
          }
          break;
        default:
          break;
      }
    }
    this.materials[materialName] = new MeshPhongMaterial2(params);
    return this.materials[materialName];
  },
  getTextureParams: function(value, matParams) {
    var texParams = {
      scale: new Vector22(1, 1),
      offset: new Vector22(0, 0)
    };
    var items = value.split(/\s+/);
    var pos;
    pos = items.indexOf("-bm");
    if (pos >= 0) {
      matParams.bumpScale = parseFloat(items[pos + 1]);
      items.splice(pos, 2);
    }
    pos = items.indexOf("-s");
    if (pos >= 0) {
      texParams.scale.set(parseFloat(items[pos + 1]), parseFloat(items[pos + 2]));
      items.splice(pos, 4);
    }
    pos = items.indexOf("-o");
    if (pos >= 0) {
      texParams.offset.set(parseFloat(items[pos + 1]), parseFloat(items[pos + 2]));
      items.splice(pos, 4);
    }
    texParams.url = items.join(" ").trim();
    return texParams;
  },
  loadTexture: function(url, mapping, onLoad, onProgress, onError) {
    var texture;
    var manager = this.manager !== void 0 ? this.manager : DefaultLoadingManager;
    var loader = manager.getHandler(url);
    if (loader === null) {
      loader = new TextureLoader2(manager);
    }
    if (loader.setCrossOrigin)
      loader.setCrossOrigin(this.crossOrigin);
    texture = loader.load(url, onLoad, onProgress, onError);
    if (mapping !== void 0)
      texture.mapping = mapping;
    return texture;
  }
};
export {MTLLoader};
