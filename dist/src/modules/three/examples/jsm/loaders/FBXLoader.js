import {AmbientLight as AmbientLight2} from "three/src/lights/AmbientLight";
import {AnimationClip as AnimationClip2} from "three/src/animation/AnimationClip";
import {Bone as Bone2} from "three/src/objects/Bone";
import {BufferAttribute as BufferAttribute2} from "three/src/core/BufferAttribute";
import {BufferGeometry as BufferGeometry2} from "three/src/core/BufferGeometry";
import {ClampToEdgeWrapping} from "three/src/constants";
import {Color as Color2} from "three/src/math/Color";
import {DirectionalLight as DirectionalLight2} from "three/src/lights/DirectionalLight";
import {EquirectangularReflectionMapping} from "three/src/constants";
import {Euler as Euler2} from "three/src/math/Euler";
import {FileLoader as FileLoader2} from "three/src/loaders/FileLoader";
import {Float32BufferAttribute} from "three/src/core/BufferAttribute";
import {Group as Group2} from "three/src/objects/Group";
import {Line as Line2} from "three/src/objects/Line";
import {LineBasicMaterial as LineBasicMaterial2} from "three/src/materials/LineBasicMaterial";
import {Loader as Loader2} from "three/src/loaders/Loader";
import {LoaderUtils as LoaderUtils2} from "three/src/loaders/LoaderUtils";
import {MathUtils as MathUtils2} from "three/src/math/MathUtils";
import {Matrix3 as Matrix32} from "three/src/math/Matrix3";
import {Matrix4 as Matrix42} from "three/src/math/Matrix4";
import {Mesh as Mesh2} from "three/src/objects/Mesh";
import {MeshLambertMaterial as MeshLambertMaterial2} from "three/src/materials/MeshLambertMaterial";
import {MeshPhongMaterial as MeshPhongMaterial2} from "three/src/materials/MeshPhongMaterial";
import {NumberKeyframeTrack as NumberKeyframeTrack2} from "three/src/animation/tracks/NumberKeyframeTrack";
import {Object3D as Object3D2} from "three/src/core/Object3D";
import {OrthographicCamera as OrthographicCamera2} from "three/src/cameras/OrthographicCamera";
import {PerspectiveCamera as PerspectiveCamera2} from "three/src/cameras/PerspectiveCamera";
import {PointLight as PointLight2} from "three/src/lights/PointLight";
import {PropertyBinding as PropertyBinding2} from "three/src/animation/PropertyBinding";
import {Quaternion as Quaternion2} from "three/src/math/Quaternion";
import {QuaternionKeyframeTrack as QuaternionKeyframeTrack2} from "three/src/animation/tracks/QuaternionKeyframeTrack";
import {RepeatWrapping} from "three/src/constants";
import {Skeleton as Skeleton2} from "three/src/objects/Skeleton";
import {SkinnedMesh as SkinnedMesh2} from "three/src/objects/SkinnedMesh";
import {SpotLight as SpotLight2} from "three/src/lights/SpotLight";
import {Texture as Texture2} from "three/src/textures/Texture";
import {TextureLoader as TextureLoader2} from "three/src/loaders/TextureLoader";
import {Uint16BufferAttribute} from "three/src/core/BufferAttribute";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {Vector4 as Vector42} from "three/src/math/Vector4";
import {VectorKeyframeTrack as VectorKeyframeTrack2} from "three/src/animation/tracks/VectorKeyframeTrack";
import {sRGBEncoding} from "three/src/constants";
import {Inflate} from "../libs/inflate.module.min.js";
import {NURBSCurve as NURBSCurve2} from "../curves/NURBSCurve.js";
var FBXLoader = function() {
  var fbxTree;
  var connections;
  var sceneGraph;
  function FBXLoader2(manager) {
    Loader2.call(this, manager);
  }
  FBXLoader2.prototype = Object.assign(Object.create(Loader2.prototype), {
    constructor: FBXLoader2,
    load: function(url, onLoad, onProgress, onError) {
      var scope = this;
      var path = scope.path === "" ? LoaderUtils2.extractUrlBase(url) : scope.path;
      var loader = new FileLoader2(this.manager);
      loader.setPath(scope.path);
      loader.setResponseType("arraybuffer");
      loader.setRequestHeader(scope.requestHeader);
      loader.setWithCredentials(scope.withCredentials);
      loader.load(url, function(buffer) {
        try {
          onLoad(scope.parse(buffer, path));
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
    parse: function(FBXBuffer, path) {
      if (isFbxFormatBinary(FBXBuffer)) {
        fbxTree = new BinaryParser().parse(FBXBuffer);
      } else {
        var FBXText = convertArrayBufferToString(FBXBuffer);
        if (!isFbxFormatASCII(FBXText)) {
          throw new Error("THREE.FBXLoader: Unknown format.");
        }
        if (getFbxVersion(FBXText) < 7e3) {
          throw new Error("THREE.FBXLoader: FBX version not supported, FileVersion: " + getFbxVersion(FBXText));
        }
        fbxTree = new TextParser().parse(FBXText);
      }
      var textureLoader = new TextureLoader2(this.manager).setPath(this.resourcePath || path).setCrossOrigin(this.crossOrigin);
      return new FBXTreeParser(textureLoader, this.manager).parse(fbxTree);
    }
  });
  function FBXTreeParser(textureLoader, manager) {
    this.textureLoader = textureLoader;
    this.manager = manager;
  }
  FBXTreeParser.prototype = {
    constructor: FBXTreeParser,
    parse: function() {
      connections = this.parseConnections();
      var images = this.parseImages();
      var textures = this.parseTextures(images);
      var materials = this.parseMaterials(textures);
      var deformers = this.parseDeformers();
      var geometryMap = new GeometryParser().parse(deformers);
      this.parseScene(deformers, geometryMap, materials);
      return sceneGraph;
    },
    parseConnections: function() {
      var connectionMap = new Map();
      if ("Connections" in fbxTree) {
        var rawConnections = fbxTree.Connections.connections;
        rawConnections.forEach(function(rawConnection) {
          var fromID = rawConnection[0];
          var toID = rawConnection[1];
          var relationship = rawConnection[2];
          if (!connectionMap.has(fromID)) {
            connectionMap.set(fromID, {
              parents: [],
              children: []
            });
          }
          var parentRelationship = {ID: toID, relationship};
          connectionMap.get(fromID).parents.push(parentRelationship);
          if (!connectionMap.has(toID)) {
            connectionMap.set(toID, {
              parents: [],
              children: []
            });
          }
          var childRelationship = {ID: fromID, relationship};
          connectionMap.get(toID).children.push(childRelationship);
        });
      }
      return connectionMap;
    },
    parseImages: function() {
      var images = {};
      var blobs = {};
      if ("Video" in fbxTree.Objects) {
        var videoNodes = fbxTree.Objects.Video;
        for (var nodeID in videoNodes) {
          var videoNode = videoNodes[nodeID];
          var id = parseInt(nodeID);
          images[id] = videoNode.RelativeFilename || videoNode.Filename;
          if ("Content" in videoNode) {
            var arrayBufferContent = videoNode.Content instanceof ArrayBuffer && videoNode.Content.byteLength > 0;
            var base64Content = typeof videoNode.Content === "string" && videoNode.Content !== "";
            if (arrayBufferContent || base64Content) {
              var image = this.parseImage(videoNodes[nodeID]);
              blobs[videoNode.RelativeFilename || videoNode.Filename] = image;
            }
          }
        }
      }
      for (var id in images) {
        var filename = images[id];
        if (blobs[filename] !== void 0)
          images[id] = blobs[filename];
        else
          images[id] = images[id].split("\\").pop();
      }
      return images;
    },
    parseImage: function(videoNode) {
      var content = videoNode.Content;
      var fileName = videoNode.RelativeFilename || videoNode.Filename;
      var extension = fileName.slice(fileName.lastIndexOf(".") + 1).toLowerCase();
      var type;
      switch (extension) {
        case "bmp":
          type = "image/bmp";
          break;
        case "jpg":
        case "jpeg":
          type = "image/jpeg";
          break;
        case "png":
          type = "image/png";
          break;
        case "tif":
          type = "image/tiff";
          break;
        case "tga":
          if (this.manager.getHandler(".tga") === null) {
            console.warn("FBXLoader: TGA loader not found, skipping ", fileName);
          }
          type = "image/tga";
          break;
        default:
          console.warn('FBXLoader: Image type "' + extension + '" is not supported.');
          return;
      }
      if (typeof content === "string") {
        return "data:" + type + ";base64," + content;
      } else {
        var array = new Uint8Array(content);
        return window.URL.createObjectURL(new Blob([array], {type}));
      }
    },
    parseTextures: function(images) {
      var textureMap = new Map();
      if ("Texture" in fbxTree.Objects) {
        var textureNodes = fbxTree.Objects.Texture;
        for (var nodeID in textureNodes) {
          var texture = this.parseTexture(textureNodes[nodeID], images);
          textureMap.set(parseInt(nodeID), texture);
        }
      }
      return textureMap;
    },
    parseTexture: function(textureNode, images) {
      var texture = this.loadTexture(textureNode, images);
      texture.ID = textureNode.id;
      texture.name = textureNode.attrName;
      var wrapModeU = textureNode.WrapModeU;
      var wrapModeV = textureNode.WrapModeV;
      var valueU = wrapModeU !== void 0 ? wrapModeU.value : 0;
      var valueV = wrapModeV !== void 0 ? wrapModeV.value : 0;
      texture.wrapS = valueU === 0 ? RepeatWrapping : ClampToEdgeWrapping;
      texture.wrapT = valueV === 0 ? RepeatWrapping : ClampToEdgeWrapping;
      if ("Scaling" in textureNode) {
        var values = textureNode.Scaling.value;
        texture.repeat.x = values[0];
        texture.repeat.y = values[1];
      }
      return texture;
    },
    loadTexture: function(textureNode, images) {
      var fileName;
      var currentPath = this.textureLoader.path;
      var children = connections.get(textureNode.id).children;
      if (children !== void 0 && children.length > 0 && images[children[0].ID] !== void 0) {
        fileName = images[children[0].ID];
        if (fileName.indexOf("blob:") === 0 || fileName.indexOf("data:") === 0) {
          this.textureLoader.setPath(void 0);
        }
      }
      var texture;
      var extension = textureNode.FileName.slice(-3).toLowerCase();
      if (extension === "tga") {
        var loader = this.manager.getHandler(".tga");
        if (loader === null) {
          console.warn("FBXLoader: TGA loader not found, creating placeholder texture for", textureNode.RelativeFilename);
          texture = new Texture2();
        } else {
          texture = loader.load(fileName);
        }
      } else if (extension === "psd") {
        console.warn("FBXLoader: PSD textures are not supported, creating placeholder texture for", textureNode.RelativeFilename);
        texture = new Texture2();
      } else {
        texture = this.textureLoader.load(fileName);
      }
      this.textureLoader.setPath(currentPath);
      return texture;
    },
    parseMaterials: function(textureMap) {
      var materialMap = new Map();
      if ("Material" in fbxTree.Objects) {
        var materialNodes = fbxTree.Objects.Material;
        for (var nodeID in materialNodes) {
          var material = this.parseMaterial(materialNodes[nodeID], textureMap);
          if (material !== null)
            materialMap.set(parseInt(nodeID), material);
        }
      }
      return materialMap;
    },
    parseMaterial: function(materialNode, textureMap) {
      var ID = materialNode.id;
      var name = materialNode.attrName;
      var type = materialNode.ShadingModel;
      if (typeof type === "object") {
        type = type.value;
      }
      if (!connections.has(ID))
        return null;
      var parameters = this.parseParameters(materialNode, textureMap, ID);
      var material;
      switch (type.toLowerCase()) {
        case "phong":
          material = new MeshPhongMaterial2();
          break;
        case "lambert":
          material = new MeshLambertMaterial2();
          break;
        default:
          console.warn('THREE.FBXLoader: unknown material type "%s". Defaulting to MeshPhongMaterial.', type);
          material = new MeshPhongMaterial2();
          break;
      }
      material.setValues(parameters);
      material.name = name;
      return material;
    },
    parseParameters: function(materialNode, textureMap, ID) {
      var parameters = {};
      if (materialNode.BumpFactor) {
        parameters.bumpScale = materialNode.BumpFactor.value;
      }
      if (materialNode.Diffuse) {
        parameters.color = new Color2().fromArray(materialNode.Diffuse.value);
      } else if (materialNode.DiffuseColor && (materialNode.DiffuseColor.type === "Color" || materialNode.DiffuseColor.type === "ColorRGB")) {
        parameters.color = new Color2().fromArray(materialNode.DiffuseColor.value);
      }
      if (materialNode.DisplacementFactor) {
        parameters.displacementScale = materialNode.DisplacementFactor.value;
      }
      if (materialNode.Emissive) {
        parameters.emissive = new Color2().fromArray(materialNode.Emissive.value);
      } else if (materialNode.EmissiveColor && (materialNode.EmissiveColor.type === "Color" || materialNode.EmissiveColor.type === "ColorRGB")) {
        parameters.emissive = new Color2().fromArray(materialNode.EmissiveColor.value);
      }
      if (materialNode.EmissiveFactor) {
        parameters.emissiveIntensity = parseFloat(materialNode.EmissiveFactor.value);
      }
      if (materialNode.Opacity) {
        parameters.opacity = parseFloat(materialNode.Opacity.value);
      }
      if (parameters.opacity < 1) {
        parameters.transparent = true;
      }
      if (materialNode.ReflectionFactor) {
        parameters.reflectivity = materialNode.ReflectionFactor.value;
      }
      if (materialNode.Shininess) {
        parameters.shininess = materialNode.Shininess.value;
      }
      if (materialNode.Specular) {
        parameters.specular = new Color2().fromArray(materialNode.Specular.value);
      } else if (materialNode.SpecularColor && materialNode.SpecularColor.type === "Color") {
        parameters.specular = new Color2().fromArray(materialNode.SpecularColor.value);
      }
      var scope = this;
      connections.get(ID).children.forEach(function(child) {
        var type = child.relationship;
        switch (type) {
          case "Bump":
            parameters.bumpMap = scope.getTexture(textureMap, child.ID);
            break;
          case "Maya|TEX_ao_map":
            parameters.aoMap = scope.getTexture(textureMap, child.ID);
            break;
          case "DiffuseColor":
          case "Maya|TEX_color_map":
            parameters.map = scope.getTexture(textureMap, child.ID);
            parameters.map.encoding = sRGBEncoding;
            break;
          case "DisplacementColor":
            parameters.displacementMap = scope.getTexture(textureMap, child.ID);
            break;
          case "EmissiveColor":
            parameters.emissiveMap = scope.getTexture(textureMap, child.ID);
            parameters.emissiveMap.encoding = sRGBEncoding;
            break;
          case "NormalMap":
          case "Maya|TEX_normal_map":
            parameters.normalMap = scope.getTexture(textureMap, child.ID);
            break;
          case "ReflectionColor":
            parameters.envMap = scope.getTexture(textureMap, child.ID);
            parameters.envMap.mapping = EquirectangularReflectionMapping;
            parameters.envMap.encoding = sRGBEncoding;
            break;
          case "SpecularColor":
            parameters.specularMap = scope.getTexture(textureMap, child.ID);
            parameters.specularMap.encoding = sRGBEncoding;
            break;
          case "TransparentColor":
          case "TransparencyFactor":
            parameters.alphaMap = scope.getTexture(textureMap, child.ID);
            parameters.transparent = true;
            break;
          case "AmbientColor":
          case "ShininessExponent":
          case "SpecularFactor":
          case "VectorDisplacementColor":
          default:
            console.warn("THREE.FBXLoader: %s map is not supported in three.js, skipping texture.", type);
            break;
        }
      });
      return parameters;
    },
    getTexture: function(textureMap, id) {
      if ("LayeredTexture" in fbxTree.Objects && id in fbxTree.Objects.LayeredTexture) {
        console.warn("THREE.FBXLoader: layered textures are not supported in three.js. Discarding all but first layer.");
        id = connections.get(id).children[0].ID;
      }
      return textureMap.get(id);
    },
    parseDeformers: function() {
      var skeletons = {};
      var morphTargets = {};
      if ("Deformer" in fbxTree.Objects) {
        var DeformerNodes = fbxTree.Objects.Deformer;
        for (var nodeID in DeformerNodes) {
          var deformerNode = DeformerNodes[nodeID];
          var relationships = connections.get(parseInt(nodeID));
          if (deformerNode.attrType === "Skin") {
            var skeleton = this.parseSkeleton(relationships, DeformerNodes);
            skeleton.ID = nodeID;
            if (relationships.parents.length > 1)
              console.warn("THREE.FBXLoader: skeleton attached to more than one geometry is not supported.");
            skeleton.geometryID = relationships.parents[0].ID;
            skeletons[nodeID] = skeleton;
          } else if (deformerNode.attrType === "BlendShape") {
            var morphTarget = {
              id: nodeID
            };
            morphTarget.rawTargets = this.parseMorphTargets(relationships, DeformerNodes);
            morphTarget.id = nodeID;
            if (relationships.parents.length > 1)
              console.warn("THREE.FBXLoader: morph target attached to more than one geometry is not supported.");
            morphTargets[nodeID] = morphTarget;
          }
        }
      }
      return {
        skeletons,
        morphTargets
      };
    },
    parseSkeleton: function(relationships, deformerNodes) {
      var rawBones = [];
      relationships.children.forEach(function(child) {
        var boneNode = deformerNodes[child.ID];
        if (boneNode.attrType !== "Cluster")
          return;
        var rawBone = {
          ID: child.ID,
          indices: [],
          weights: [],
          transformLink: new Matrix42().fromArray(boneNode.TransformLink.a)
        };
        if ("Indexes" in boneNode) {
          rawBone.indices = boneNode.Indexes.a;
          rawBone.weights = boneNode.Weights.a;
        }
        rawBones.push(rawBone);
      });
      return {
        rawBones,
        bones: []
      };
    },
    parseMorphTargets: function(relationships, deformerNodes) {
      var rawMorphTargets = [];
      for (var i = 0; i < relationships.children.length; i++) {
        var child = relationships.children[i];
        var morphTargetNode = deformerNodes[child.ID];
        var rawMorphTarget = {
          name: morphTargetNode.attrName,
          initialWeight: morphTargetNode.DeformPercent,
          id: morphTargetNode.id,
          fullWeights: morphTargetNode.FullWeights.a
        };
        if (morphTargetNode.attrType !== "BlendShapeChannel")
          return;
        rawMorphTarget.geoID = connections.get(parseInt(child.ID)).children.filter(function(child2) {
          return child2.relationship === void 0;
        })[0].ID;
        rawMorphTargets.push(rawMorphTarget);
      }
      return rawMorphTargets;
    },
    parseScene: function(deformers, geometryMap, materialMap) {
      sceneGraph = new Group2();
      var modelMap = this.parseModels(deformers.skeletons, geometryMap, materialMap);
      var modelNodes = fbxTree.Objects.Model;
      var scope = this;
      modelMap.forEach(function(model) {
        var modelNode = modelNodes[model.ID];
        scope.setLookAtProperties(model, modelNode);
        var parentConnections = connections.get(model.ID).parents;
        parentConnections.forEach(function(connection) {
          var parent = modelMap.get(connection.ID);
          if (parent !== void 0)
            parent.add(model);
        });
        if (model.parent === null) {
          sceneGraph.add(model);
        }
      });
      this.bindSkeleton(deformers.skeletons, geometryMap, modelMap);
      this.createAmbientLight();
      this.setupMorphMaterials();
      sceneGraph.traverse(function(node) {
        if (node.userData.transformData) {
          if (node.parent)
            node.userData.transformData.parentMatrixWorld = node.parent.matrix;
          var transform = generateTransform(node.userData.transformData);
          node.applyMatrix4(transform);
        }
      });
      var animations = new AnimationParser().parse();
      if (sceneGraph.children.length === 1 && sceneGraph.children[0].isGroup) {
        sceneGraph.children[0].animations = animations;
        sceneGraph = sceneGraph.children[0];
      }
      sceneGraph.animations = animations;
    },
    parseModels: function(skeletons, geometryMap, materialMap) {
      var modelMap = new Map();
      var modelNodes = fbxTree.Objects.Model;
      for (var nodeID in modelNodes) {
        var id = parseInt(nodeID);
        var node = modelNodes[nodeID];
        var relationships = connections.get(id);
        var model = this.buildSkeleton(relationships, skeletons, id, node.attrName);
        if (!model) {
          switch (node.attrType) {
            case "Camera":
              model = this.createCamera(relationships);
              break;
            case "Light":
              model = this.createLight(relationships);
              break;
            case "Mesh":
              model = this.createMesh(relationships, geometryMap, materialMap);
              break;
            case "NurbsCurve":
              model = this.createCurve(relationships, geometryMap);
              break;
            case "LimbNode":
            case "Root":
              model = new Bone2();
              break;
            case "Null":
            default:
              model = new Group2();
              break;
          }
          model.name = node.attrName ? PropertyBinding2.sanitizeNodeName(node.attrName) : "";
          model.ID = id;
        }
        this.getTransformData(model, node);
        modelMap.set(id, model);
      }
      return modelMap;
    },
    buildSkeleton: function(relationships, skeletons, id, name) {
      var bone = null;
      relationships.parents.forEach(function(parent) {
        for (var ID in skeletons) {
          var skeleton = skeletons[ID];
          skeleton.rawBones.forEach(function(rawBone, i) {
            if (rawBone.ID === parent.ID) {
              var subBone = bone;
              bone = new Bone2();
              bone.matrixWorld.copy(rawBone.transformLink);
              bone.name = name ? PropertyBinding2.sanitizeNodeName(name) : "";
              bone.ID = id;
              skeleton.bones[i] = bone;
              if (subBone !== null) {
                bone.add(subBone);
              }
            }
          });
        }
      });
      return bone;
    },
    createCamera: function(relationships) {
      var model;
      var cameraAttribute;
      relationships.children.forEach(function(child) {
        var attr = fbxTree.Objects.NodeAttribute[child.ID];
        if (attr !== void 0) {
          cameraAttribute = attr;
        }
      });
      if (cameraAttribute === void 0) {
        model = new Object3D2();
      } else {
        var type = 0;
        if (cameraAttribute.CameraProjectionType !== void 0 && cameraAttribute.CameraProjectionType.value === 1) {
          type = 1;
        }
        var nearClippingPlane = 1;
        if (cameraAttribute.NearPlane !== void 0) {
          nearClippingPlane = cameraAttribute.NearPlane.value / 1e3;
        }
        var farClippingPlane = 1e3;
        if (cameraAttribute.FarPlane !== void 0) {
          farClippingPlane = cameraAttribute.FarPlane.value / 1e3;
        }
        var width = window.innerWidth;
        var height = window.innerHeight;
        if (cameraAttribute.AspectWidth !== void 0 && cameraAttribute.AspectHeight !== void 0) {
          width = cameraAttribute.AspectWidth.value;
          height = cameraAttribute.AspectHeight.value;
        }
        var aspect = width / height;
        var fov = 45;
        if (cameraAttribute.FieldOfView !== void 0) {
          fov = cameraAttribute.FieldOfView.value;
        }
        var focalLength = cameraAttribute.FocalLength ? cameraAttribute.FocalLength.value : null;
        switch (type) {
          case 0:
            model = new PerspectiveCamera2(fov, aspect, nearClippingPlane, farClippingPlane);
            if (focalLength !== null)
              model.setFocalLength(focalLength);
            break;
          case 1:
            model = new OrthographicCamera2(-width / 2, width / 2, height / 2, -height / 2, nearClippingPlane, farClippingPlane);
            break;
          default:
            console.warn("THREE.FBXLoader: Unknown camera type " + type + ".");
            model = new Object3D2();
            break;
        }
      }
      return model;
    },
    createLight: function(relationships) {
      var model;
      var lightAttribute;
      relationships.children.forEach(function(child) {
        var attr = fbxTree.Objects.NodeAttribute[child.ID];
        if (attr !== void 0) {
          lightAttribute = attr;
        }
      });
      if (lightAttribute === void 0) {
        model = new Object3D2();
      } else {
        var type;
        if (lightAttribute.LightType === void 0) {
          type = 0;
        } else {
          type = lightAttribute.LightType.value;
        }
        var color = 16777215;
        if (lightAttribute.Color !== void 0) {
          color = new Color2().fromArray(lightAttribute.Color.value);
        }
        var intensity = lightAttribute.Intensity === void 0 ? 1 : lightAttribute.Intensity.value / 100;
        if (lightAttribute.CastLightOnObject !== void 0 && lightAttribute.CastLightOnObject.value === 0) {
          intensity = 0;
        }
        var distance = 0;
        if (lightAttribute.FarAttenuationEnd !== void 0) {
          if (lightAttribute.EnableFarAttenuation !== void 0 && lightAttribute.EnableFarAttenuation.value === 0) {
            distance = 0;
          } else {
            distance = lightAttribute.FarAttenuationEnd.value;
          }
        }
        var decay = 1;
        switch (type) {
          case 0:
            model = new PointLight2(color, intensity, distance, decay);
            break;
          case 1:
            model = new DirectionalLight2(color, intensity);
            break;
          case 2:
            var angle = Math.PI / 3;
            if (lightAttribute.InnerAngle !== void 0) {
              angle = MathUtils2.degToRad(lightAttribute.InnerAngle.value);
            }
            var penumbra = 0;
            if (lightAttribute.OuterAngle !== void 0) {
              penumbra = MathUtils2.degToRad(lightAttribute.OuterAngle.value);
              penumbra = Math.max(penumbra, 1);
            }
            model = new SpotLight2(color, intensity, distance, angle, penumbra, decay);
            break;
          default:
            console.warn("THREE.FBXLoader: Unknown light type " + lightAttribute.LightType.value + ", defaulting to a PointLight.");
            model = new PointLight2(color, intensity);
            break;
        }
        if (lightAttribute.CastShadows !== void 0 && lightAttribute.CastShadows.value === 1) {
          model.castShadow = true;
        }
      }
      return model;
    },
    createMesh: function(relationships, geometryMap, materialMap) {
      var model;
      var geometry = null;
      var material = null;
      var materials = [];
      relationships.children.forEach(function(child) {
        if (geometryMap.has(child.ID)) {
          geometry = geometryMap.get(child.ID);
        }
        if (materialMap.has(child.ID)) {
          materials.push(materialMap.get(child.ID));
        }
      });
      if (materials.length > 1) {
        material = materials;
      } else if (materials.length > 0) {
        material = materials[0];
      } else {
        material = new MeshPhongMaterial2({color: 13421772});
        materials.push(material);
      }
      if ("color" in geometry.attributes) {
        materials.forEach(function(material2) {
          material2.vertexColors = true;
        });
      }
      if (geometry.FBX_Deformer) {
        materials.forEach(function(material2) {
          material2.skinning = true;
        });
        model = new SkinnedMesh2(geometry, material);
        model.normalizeSkinWeights();
      } else {
        model = new Mesh2(geometry, material);
      }
      return model;
    },
    createCurve: function(relationships, geometryMap) {
      var geometry = relationships.children.reduce(function(geo, child) {
        if (geometryMap.has(child.ID))
          geo = geometryMap.get(child.ID);
        return geo;
      }, null);
      var material = new LineBasicMaterial2({color: 3342591, linewidth: 1});
      return new Line2(geometry, material);
    },
    getTransformData: function(model, modelNode) {
      var transformData = {};
      if ("InheritType" in modelNode)
        transformData.inheritType = parseInt(modelNode.InheritType.value);
      if ("RotationOrder" in modelNode)
        transformData.eulerOrder = getEulerOrder(modelNode.RotationOrder.value);
      else
        transformData.eulerOrder = "ZYX";
      if ("Lcl_Translation" in modelNode)
        transformData.translation = modelNode.Lcl_Translation.value;
      if ("PreRotation" in modelNode)
        transformData.preRotation = modelNode.PreRotation.value;
      if ("Lcl_Rotation" in modelNode)
        transformData.rotation = modelNode.Lcl_Rotation.value;
      if ("PostRotation" in modelNode)
        transformData.postRotation = modelNode.PostRotation.value;
      if ("Lcl_Scaling" in modelNode)
        transformData.scale = modelNode.Lcl_Scaling.value;
      if ("ScalingOffset" in modelNode)
        transformData.scalingOffset = modelNode.ScalingOffset.value;
      if ("ScalingPivot" in modelNode)
        transformData.scalingPivot = modelNode.ScalingPivot.value;
      if ("RotationOffset" in modelNode)
        transformData.rotationOffset = modelNode.RotationOffset.value;
      if ("RotationPivot" in modelNode)
        transformData.rotationPivot = modelNode.RotationPivot.value;
      model.userData.transformData = transformData;
    },
    setLookAtProperties: function(model, modelNode) {
      if ("LookAtProperty" in modelNode) {
        var children = connections.get(model.ID).children;
        children.forEach(function(child) {
          if (child.relationship === "LookAtProperty") {
            var lookAtTarget = fbxTree.Objects.Model[child.ID];
            if ("Lcl_Translation" in lookAtTarget) {
              var pos = lookAtTarget.Lcl_Translation.value;
              if (model.target !== void 0) {
                model.target.position.fromArray(pos);
                sceneGraph.add(model.target);
              } else {
                model.lookAt(new Vector32().fromArray(pos));
              }
            }
          }
        });
      }
    },
    bindSkeleton: function(skeletons, geometryMap, modelMap) {
      var bindMatrices = this.parsePoseNodes();
      for (var ID in skeletons) {
        var skeleton = skeletons[ID];
        var parents = connections.get(parseInt(skeleton.ID)).parents;
        parents.forEach(function(parent) {
          if (geometryMap.has(parent.ID)) {
            var geoID = parent.ID;
            var geoRelationships = connections.get(geoID);
            geoRelationships.parents.forEach(function(geoConnParent) {
              if (modelMap.has(geoConnParent.ID)) {
                var model = modelMap.get(geoConnParent.ID);
                model.bind(new Skeleton2(skeleton.bones), bindMatrices[geoConnParent.ID]);
              }
            });
          }
        });
      }
    },
    parsePoseNodes: function() {
      var bindMatrices = {};
      if ("Pose" in fbxTree.Objects) {
        var BindPoseNode = fbxTree.Objects.Pose;
        for (var nodeID in BindPoseNode) {
          if (BindPoseNode[nodeID].attrType === "BindPose") {
            var poseNodes = BindPoseNode[nodeID].PoseNode;
            if (Array.isArray(poseNodes)) {
              poseNodes.forEach(function(poseNode) {
                bindMatrices[poseNode.Node] = new Matrix42().fromArray(poseNode.Matrix.a);
              });
            } else {
              bindMatrices[poseNodes.Node] = new Matrix42().fromArray(poseNodes.Matrix.a);
            }
          }
        }
      }
      return bindMatrices;
    },
    createAmbientLight: function() {
      if ("GlobalSettings" in fbxTree && "AmbientColor" in fbxTree.GlobalSettings) {
        var ambientColor = fbxTree.GlobalSettings.AmbientColor.value;
        var r = ambientColor[0];
        var g = ambientColor[1];
        var b = ambientColor[2];
        if (r !== 0 || g !== 0 || b !== 0) {
          var color = new Color2(r, g, b);
          sceneGraph.add(new AmbientLight2(color, 1));
        }
      }
    },
    setupMorphMaterials: function() {
      var scope = this;
      sceneGraph.traverse(function(child) {
        if (child.isMesh) {
          if (child.geometry.morphAttributes.position && child.geometry.morphAttributes.position.length) {
            if (Array.isArray(child.material)) {
              child.material.forEach(function(material, i) {
                scope.setupMorphMaterial(child, material, i);
              });
            } else {
              scope.setupMorphMaterial(child, child.material);
            }
          }
        }
      });
    },
    setupMorphMaterial: function(child, material, index) {
      var uuid = child.uuid;
      var matUuid = material.uuid;
      var sharedMat = false;
      sceneGraph.traverse(function(node) {
        if (node.isMesh) {
          if (Array.isArray(node.material)) {
            node.material.forEach(function(mat) {
              if (mat.uuid === matUuid && node.uuid !== uuid)
                sharedMat = true;
            });
          } else if (node.material.uuid === matUuid && node.uuid !== uuid)
            sharedMat = true;
        }
      });
      if (sharedMat === true) {
        var clonedMat = material.clone();
        clonedMat.morphTargets = true;
        if (index === void 0)
          child.material = clonedMat;
        else
          child.material[index] = clonedMat;
      } else
        material.morphTargets = true;
    }
  };
  function GeometryParser() {
  }
  GeometryParser.prototype = {
    constructor: GeometryParser,
    parse: function(deformers) {
      var geometryMap = new Map();
      if ("Geometry" in fbxTree.Objects) {
        var geoNodes = fbxTree.Objects.Geometry;
        for (var nodeID in geoNodes) {
          var relationships = connections.get(parseInt(nodeID));
          var geo = this.parseGeometry(relationships, geoNodes[nodeID], deformers);
          geometryMap.set(parseInt(nodeID), geo);
        }
      }
      return geometryMap;
    },
    parseGeometry: function(relationships, geoNode, deformers) {
      switch (geoNode.attrType) {
        case "Mesh":
          return this.parseMeshGeometry(relationships, geoNode, deformers);
          break;
        case "NurbsCurve":
          return this.parseNurbsGeometry(geoNode);
          break;
      }
    },
    parseMeshGeometry: function(relationships, geoNode, deformers) {
      var skeletons = deformers.skeletons;
      var morphTargets = [];
      var modelNodes = relationships.parents.map(function(parent) {
        return fbxTree.Objects.Model[parent.ID];
      });
      if (modelNodes.length === 0)
        return;
      var skeleton = relationships.children.reduce(function(skeleton2, child) {
        if (skeletons[child.ID] !== void 0)
          skeleton2 = skeletons[child.ID];
        return skeleton2;
      }, null);
      relationships.children.forEach(function(child) {
        if (deformers.morphTargets[child.ID] !== void 0) {
          morphTargets.push(deformers.morphTargets[child.ID]);
        }
      });
      var modelNode = modelNodes[0];
      var transformData = {};
      if ("RotationOrder" in modelNode)
        transformData.eulerOrder = getEulerOrder(modelNode.RotationOrder.value);
      if ("InheritType" in modelNode)
        transformData.inheritType = parseInt(modelNode.InheritType.value);
      if ("GeometricTranslation" in modelNode)
        transformData.translation = modelNode.GeometricTranslation.value;
      if ("GeometricRotation" in modelNode)
        transformData.rotation = modelNode.GeometricRotation.value;
      if ("GeometricScaling" in modelNode)
        transformData.scale = modelNode.GeometricScaling.value;
      var transform = generateTransform(transformData);
      return this.genGeometry(geoNode, skeleton, morphTargets, transform);
    },
    genGeometry: function(geoNode, skeleton, morphTargets, preTransform) {
      var geo = new BufferGeometry2();
      if (geoNode.attrName)
        geo.name = geoNode.attrName;
      var geoInfo = this.parseGeoNode(geoNode, skeleton);
      var buffers = this.genBuffers(geoInfo);
      var positionAttribute = new Float32BufferAttribute(buffers.vertex, 3);
      positionAttribute.applyMatrix4(preTransform);
      geo.setAttribute("position", positionAttribute);
      if (buffers.colors.length > 0) {
        geo.setAttribute("color", new Float32BufferAttribute(buffers.colors, 3));
      }
      if (skeleton) {
        geo.setAttribute("skinIndex", new Uint16BufferAttribute(buffers.weightsIndices, 4));
        geo.setAttribute("skinWeight", new Float32BufferAttribute(buffers.vertexWeights, 4));
        geo.FBX_Deformer = skeleton;
      }
      if (buffers.normal.length > 0) {
        var normalMatrix = new Matrix32().getNormalMatrix(preTransform);
        var normalAttribute = new Float32BufferAttribute(buffers.normal, 3);
        normalAttribute.applyNormalMatrix(normalMatrix);
        geo.setAttribute("normal", normalAttribute);
      }
      buffers.uvs.forEach(function(uvBuffer, i) {
        var name = "uv" + (i + 1).toString();
        if (i === 0) {
          name = "uv";
        }
        geo.setAttribute(name, new Float32BufferAttribute(buffers.uvs[i], 2));
      });
      if (geoInfo.material && geoInfo.material.mappingType !== "AllSame") {
        var prevMaterialIndex = buffers.materialIndex[0];
        var startIndex = 0;
        buffers.materialIndex.forEach(function(currentIndex, i) {
          if (currentIndex !== prevMaterialIndex) {
            geo.addGroup(startIndex, i - startIndex, prevMaterialIndex);
            prevMaterialIndex = currentIndex;
            startIndex = i;
          }
        });
        if (geo.groups.length > 0) {
          var lastGroup = geo.groups[geo.groups.length - 1];
          var lastIndex = lastGroup.start + lastGroup.count;
          if (lastIndex !== buffers.materialIndex.length) {
            geo.addGroup(lastIndex, buffers.materialIndex.length - lastIndex, prevMaterialIndex);
          }
        }
        if (geo.groups.length === 0) {
          geo.addGroup(0, buffers.materialIndex.length, buffers.materialIndex[0]);
        }
      }
      this.addMorphTargets(geo, geoNode, morphTargets, preTransform);
      return geo;
    },
    parseGeoNode: function(geoNode, skeleton) {
      var geoInfo = {};
      geoInfo.vertexPositions = geoNode.Vertices !== void 0 ? geoNode.Vertices.a : [];
      geoInfo.vertexIndices = geoNode.PolygonVertexIndex !== void 0 ? geoNode.PolygonVertexIndex.a : [];
      if (geoNode.LayerElementColor) {
        geoInfo.color = this.parseVertexColors(geoNode.LayerElementColor[0]);
      }
      if (geoNode.LayerElementMaterial) {
        geoInfo.material = this.parseMaterialIndices(geoNode.LayerElementMaterial[0]);
      }
      if (geoNode.LayerElementNormal) {
        geoInfo.normal = this.parseNormals(geoNode.LayerElementNormal[0]);
      }
      if (geoNode.LayerElementUV) {
        geoInfo.uv = [];
        var i = 0;
        while (geoNode.LayerElementUV[i]) {
          if (geoNode.LayerElementUV[i].UV) {
            geoInfo.uv.push(this.parseUVs(geoNode.LayerElementUV[i]));
          }
          i++;
        }
      }
      geoInfo.weightTable = {};
      if (skeleton !== null) {
        geoInfo.skeleton = skeleton;
        skeleton.rawBones.forEach(function(rawBone, i2) {
          rawBone.indices.forEach(function(index, j) {
            if (geoInfo.weightTable[index] === void 0)
              geoInfo.weightTable[index] = [];
            geoInfo.weightTable[index].push({
              id: i2,
              weight: rawBone.weights[j]
            });
          });
        });
      }
      return geoInfo;
    },
    genBuffers: function(geoInfo) {
      var buffers = {
        vertex: [],
        normal: [],
        colors: [],
        uvs: [],
        materialIndex: [],
        vertexWeights: [],
        weightsIndices: []
      };
      var polygonIndex = 0;
      var faceLength = 0;
      var displayedWeightsWarning = false;
      var facePositionIndexes = [];
      var faceNormals = [];
      var faceColors = [];
      var faceUVs = [];
      var faceWeights = [];
      var faceWeightIndices = [];
      var scope = this;
      geoInfo.vertexIndices.forEach(function(vertexIndex, polygonVertexIndex) {
        var endOfFace = false;
        if (vertexIndex < 0) {
          vertexIndex = vertexIndex ^ -1;
          endOfFace = true;
        }
        var weightIndices = [];
        var weights = [];
        facePositionIndexes.push(vertexIndex * 3, vertexIndex * 3 + 1, vertexIndex * 3 + 2);
        if (geoInfo.color) {
          var data = getData(polygonVertexIndex, polygonIndex, vertexIndex, geoInfo.color);
          faceColors.push(data[0], data[1], data[2]);
        }
        if (geoInfo.skeleton) {
          if (geoInfo.weightTable[vertexIndex] !== void 0) {
            geoInfo.weightTable[vertexIndex].forEach(function(wt) {
              weights.push(wt.weight);
              weightIndices.push(wt.id);
            });
          }
          if (weights.length > 4) {
            if (!displayedWeightsWarning) {
              console.warn("THREE.FBXLoader: Vertex has more than 4 skinning weights assigned to vertex. Deleting additional weights.");
              displayedWeightsWarning = true;
            }
            var wIndex = [0, 0, 0, 0];
            var Weight = [0, 0, 0, 0];
            weights.forEach(function(weight, weightIndex) {
              var currentWeight = weight;
              var currentIndex = weightIndices[weightIndex];
              Weight.forEach(function(comparedWeight, comparedWeightIndex, comparedWeightArray) {
                if (currentWeight > comparedWeight) {
                  comparedWeightArray[comparedWeightIndex] = currentWeight;
                  currentWeight = comparedWeight;
                  var tmp = wIndex[comparedWeightIndex];
                  wIndex[comparedWeightIndex] = currentIndex;
                  currentIndex = tmp;
                }
              });
            });
            weightIndices = wIndex;
            weights = Weight;
          }
          while (weights.length < 4) {
            weights.push(0);
            weightIndices.push(0);
          }
          for (var i = 0; i < 4; ++i) {
            faceWeights.push(weights[i]);
            faceWeightIndices.push(weightIndices[i]);
          }
        }
        if (geoInfo.normal) {
          var data = getData(polygonVertexIndex, polygonIndex, vertexIndex, geoInfo.normal);
          faceNormals.push(data[0], data[1], data[2]);
        }
        if (geoInfo.material && geoInfo.material.mappingType !== "AllSame") {
          var materialIndex = getData(polygonVertexIndex, polygonIndex, vertexIndex, geoInfo.material)[0];
        }
        if (geoInfo.uv) {
          geoInfo.uv.forEach(function(uv, i2) {
            var data2 = getData(polygonVertexIndex, polygonIndex, vertexIndex, uv);
            if (faceUVs[i2] === void 0) {
              faceUVs[i2] = [];
            }
            faceUVs[i2].push(data2[0]);
            faceUVs[i2].push(data2[1]);
          });
        }
        faceLength++;
        if (endOfFace) {
          scope.genFace(buffers, geoInfo, facePositionIndexes, materialIndex, faceNormals, faceColors, faceUVs, faceWeights, faceWeightIndices, faceLength);
          polygonIndex++;
          faceLength = 0;
          facePositionIndexes = [];
          faceNormals = [];
          faceColors = [];
          faceUVs = [];
          faceWeights = [];
          faceWeightIndices = [];
        }
      });
      return buffers;
    },
    genFace: function(buffers, geoInfo, facePositionIndexes, materialIndex, faceNormals, faceColors, faceUVs, faceWeights, faceWeightIndices, faceLength) {
      for (var i = 2; i < faceLength; i++) {
        buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[0]]);
        buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[1]]);
        buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[2]]);
        buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[(i - 1) * 3]]);
        buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[(i - 1) * 3 + 1]]);
        buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[(i - 1) * 3 + 2]]);
        buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[i * 3]]);
        buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[i * 3 + 1]]);
        buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[i * 3 + 2]]);
        if (geoInfo.skeleton) {
          buffers.vertexWeights.push(faceWeights[0]);
          buffers.vertexWeights.push(faceWeights[1]);
          buffers.vertexWeights.push(faceWeights[2]);
          buffers.vertexWeights.push(faceWeights[3]);
          buffers.vertexWeights.push(faceWeights[(i - 1) * 4]);
          buffers.vertexWeights.push(faceWeights[(i - 1) * 4 + 1]);
          buffers.vertexWeights.push(faceWeights[(i - 1) * 4 + 2]);
          buffers.vertexWeights.push(faceWeights[(i - 1) * 4 + 3]);
          buffers.vertexWeights.push(faceWeights[i * 4]);
          buffers.vertexWeights.push(faceWeights[i * 4 + 1]);
          buffers.vertexWeights.push(faceWeights[i * 4 + 2]);
          buffers.vertexWeights.push(faceWeights[i * 4 + 3]);
          buffers.weightsIndices.push(faceWeightIndices[0]);
          buffers.weightsIndices.push(faceWeightIndices[1]);
          buffers.weightsIndices.push(faceWeightIndices[2]);
          buffers.weightsIndices.push(faceWeightIndices[3]);
          buffers.weightsIndices.push(faceWeightIndices[(i - 1) * 4]);
          buffers.weightsIndices.push(faceWeightIndices[(i - 1) * 4 + 1]);
          buffers.weightsIndices.push(faceWeightIndices[(i - 1) * 4 + 2]);
          buffers.weightsIndices.push(faceWeightIndices[(i - 1) * 4 + 3]);
          buffers.weightsIndices.push(faceWeightIndices[i * 4]);
          buffers.weightsIndices.push(faceWeightIndices[i * 4 + 1]);
          buffers.weightsIndices.push(faceWeightIndices[i * 4 + 2]);
          buffers.weightsIndices.push(faceWeightIndices[i * 4 + 3]);
        }
        if (geoInfo.color) {
          buffers.colors.push(faceColors[0]);
          buffers.colors.push(faceColors[1]);
          buffers.colors.push(faceColors[2]);
          buffers.colors.push(faceColors[(i - 1) * 3]);
          buffers.colors.push(faceColors[(i - 1) * 3 + 1]);
          buffers.colors.push(faceColors[(i - 1) * 3 + 2]);
          buffers.colors.push(faceColors[i * 3]);
          buffers.colors.push(faceColors[i * 3 + 1]);
          buffers.colors.push(faceColors[i * 3 + 2]);
        }
        if (geoInfo.material && geoInfo.material.mappingType !== "AllSame") {
          buffers.materialIndex.push(materialIndex);
          buffers.materialIndex.push(materialIndex);
          buffers.materialIndex.push(materialIndex);
        }
        if (geoInfo.normal) {
          buffers.normal.push(faceNormals[0]);
          buffers.normal.push(faceNormals[1]);
          buffers.normal.push(faceNormals[2]);
          buffers.normal.push(faceNormals[(i - 1) * 3]);
          buffers.normal.push(faceNormals[(i - 1) * 3 + 1]);
          buffers.normal.push(faceNormals[(i - 1) * 3 + 2]);
          buffers.normal.push(faceNormals[i * 3]);
          buffers.normal.push(faceNormals[i * 3 + 1]);
          buffers.normal.push(faceNormals[i * 3 + 2]);
        }
        if (geoInfo.uv) {
          geoInfo.uv.forEach(function(uv, j) {
            if (buffers.uvs[j] === void 0)
              buffers.uvs[j] = [];
            buffers.uvs[j].push(faceUVs[j][0]);
            buffers.uvs[j].push(faceUVs[j][1]);
            buffers.uvs[j].push(faceUVs[j][(i - 1) * 2]);
            buffers.uvs[j].push(faceUVs[j][(i - 1) * 2 + 1]);
            buffers.uvs[j].push(faceUVs[j][i * 2]);
            buffers.uvs[j].push(faceUVs[j][i * 2 + 1]);
          });
        }
      }
    },
    addMorphTargets: function(parentGeo, parentGeoNode, morphTargets, preTransform) {
      if (morphTargets.length === 0)
        return;
      parentGeo.morphTargetsRelative = true;
      parentGeo.morphAttributes.position = [];
      var scope = this;
      morphTargets.forEach(function(morphTarget) {
        morphTarget.rawTargets.forEach(function(rawTarget) {
          var morphGeoNode = fbxTree.Objects.Geometry[rawTarget.geoID];
          if (morphGeoNode !== void 0) {
            scope.genMorphGeometry(parentGeo, parentGeoNode, morphGeoNode, preTransform, rawTarget.name);
          }
        });
      });
    },
    genMorphGeometry: function(parentGeo, parentGeoNode, morphGeoNode, preTransform, name) {
      var vertexIndices = parentGeoNode.PolygonVertexIndex !== void 0 ? parentGeoNode.PolygonVertexIndex.a : [];
      var morphPositionsSparse = morphGeoNode.Vertices !== void 0 ? morphGeoNode.Vertices.a : [];
      var indices = morphGeoNode.Indexes !== void 0 ? morphGeoNode.Indexes.a : [];
      var length = parentGeo.attributes.position.count * 3;
      var morphPositions = new Float32Array(length);
      for (var i = 0; i < indices.length; i++) {
        var morphIndex = indices[i] * 3;
        morphPositions[morphIndex] = morphPositionsSparse[i * 3];
        morphPositions[morphIndex + 1] = morphPositionsSparse[i * 3 + 1];
        morphPositions[morphIndex + 2] = morphPositionsSparse[i * 3 + 2];
      }
      var morphGeoInfo = {
        vertexIndices,
        vertexPositions: morphPositions
      };
      var morphBuffers = this.genBuffers(morphGeoInfo);
      var positionAttribute = new Float32BufferAttribute(morphBuffers.vertex, 3);
      positionAttribute.name = name || morphGeoNode.attrName;
      positionAttribute.applyMatrix4(preTransform);
      parentGeo.morphAttributes.position.push(positionAttribute);
    },
    parseNormals: function(NormalNode) {
      var mappingType = NormalNode.MappingInformationType;
      var referenceType = NormalNode.ReferenceInformationType;
      var buffer = NormalNode.Normals.a;
      var indexBuffer = [];
      if (referenceType === "IndexToDirect") {
        if ("NormalIndex" in NormalNode) {
          indexBuffer = NormalNode.NormalIndex.a;
        } else if ("NormalsIndex" in NormalNode) {
          indexBuffer = NormalNode.NormalsIndex.a;
        }
      }
      return {
        dataSize: 3,
        buffer,
        indices: indexBuffer,
        mappingType,
        referenceType
      };
    },
    parseUVs: function(UVNode) {
      var mappingType = UVNode.MappingInformationType;
      var referenceType = UVNode.ReferenceInformationType;
      var buffer = UVNode.UV.a;
      var indexBuffer = [];
      if (referenceType === "IndexToDirect") {
        indexBuffer = UVNode.UVIndex.a;
      }
      return {
        dataSize: 2,
        buffer,
        indices: indexBuffer,
        mappingType,
        referenceType
      };
    },
    parseVertexColors: function(ColorNode) {
      var mappingType = ColorNode.MappingInformationType;
      var referenceType = ColorNode.ReferenceInformationType;
      var buffer = ColorNode.Colors.a;
      var indexBuffer = [];
      if (referenceType === "IndexToDirect") {
        indexBuffer = ColorNode.ColorIndex.a;
      }
      return {
        dataSize: 4,
        buffer,
        indices: indexBuffer,
        mappingType,
        referenceType
      };
    },
    parseMaterialIndices: function(MaterialNode) {
      var mappingType = MaterialNode.MappingInformationType;
      var referenceType = MaterialNode.ReferenceInformationType;
      if (mappingType === "NoMappingInformation") {
        return {
          dataSize: 1,
          buffer: [0],
          indices: [0],
          mappingType: "AllSame",
          referenceType
        };
      }
      var materialIndexBuffer = MaterialNode.Materials.a;
      var materialIndices = [];
      for (var i = 0; i < materialIndexBuffer.length; ++i) {
        materialIndices.push(i);
      }
      return {
        dataSize: 1,
        buffer: materialIndexBuffer,
        indices: materialIndices,
        mappingType,
        referenceType
      };
    },
    parseNurbsGeometry: function(geoNode) {
      if (NURBSCurve2 === void 0) {
        console.error("THREE.FBXLoader: The loader relies on NURBSCurve for any nurbs present in the model. Nurbs will show up as empty geometry.");
        return new BufferGeometry2();
      }
      var order = parseInt(geoNode.Order);
      if (isNaN(order)) {
        console.error("THREE.FBXLoader: Invalid Order %s given for geometry ID: %s", geoNode.Order, geoNode.id);
        return new BufferGeometry2();
      }
      var degree = order - 1;
      var knots = geoNode.KnotVector.a;
      var controlPoints = [];
      var pointsValues = geoNode.Points.a;
      for (var i = 0, l = pointsValues.length; i < l; i += 4) {
        controlPoints.push(new Vector42().fromArray(pointsValues, i));
      }
      var startKnot, endKnot;
      if (geoNode.Form === "Closed") {
        controlPoints.push(controlPoints[0]);
      } else if (geoNode.Form === "Periodic") {
        startKnot = degree;
        endKnot = knots.length - 1 - startKnot;
        for (var i = 0; i < degree; ++i) {
          controlPoints.push(controlPoints[i]);
        }
      }
      var curve = new NURBSCurve2(degree, knots, controlPoints, startKnot, endKnot);
      var vertices = curve.getPoints(controlPoints.length * 7);
      var positions = new Float32Array(vertices.length * 3);
      vertices.forEach(function(vertex, i2) {
        vertex.toArray(positions, i2 * 3);
      });
      var geometry = new BufferGeometry2();
      geometry.setAttribute("position", new BufferAttribute2(positions, 3));
      return geometry;
    }
  };
  function AnimationParser() {
  }
  AnimationParser.prototype = {
    constructor: AnimationParser,
    parse: function() {
      var animationClips = [];
      var rawClips = this.parseClips();
      if (rawClips !== void 0) {
        for (var key in rawClips) {
          var rawClip = rawClips[key];
          var clip = this.addClip(rawClip);
          animationClips.push(clip);
        }
      }
      return animationClips;
    },
    parseClips: function() {
      if (fbxTree.Objects.AnimationCurve === void 0)
        return void 0;
      var curveNodesMap = this.parseAnimationCurveNodes();
      this.parseAnimationCurves(curveNodesMap);
      var layersMap = this.parseAnimationLayers(curveNodesMap);
      var rawClips = this.parseAnimStacks(layersMap);
      return rawClips;
    },
    parseAnimationCurveNodes: function() {
      var rawCurveNodes = fbxTree.Objects.AnimationCurveNode;
      var curveNodesMap = new Map();
      for (var nodeID in rawCurveNodes) {
        var rawCurveNode = rawCurveNodes[nodeID];
        if (rawCurveNode.attrName.match(/S|R|T|DeformPercent/) !== null) {
          var curveNode = {
            id: rawCurveNode.id,
            attr: rawCurveNode.attrName,
            curves: {}
          };
          curveNodesMap.set(curveNode.id, curveNode);
        }
      }
      return curveNodesMap;
    },
    parseAnimationCurves: function(curveNodesMap) {
      var rawCurves = fbxTree.Objects.AnimationCurve;
      for (var nodeID in rawCurves) {
        var animationCurve = {
          id: rawCurves[nodeID].id,
          times: rawCurves[nodeID].KeyTime.a.map(convertFBXTimeToSeconds),
          values: rawCurves[nodeID].KeyValueFloat.a
        };
        var relationships = connections.get(animationCurve.id);
        if (relationships !== void 0) {
          var animationCurveID = relationships.parents[0].ID;
          var animationCurveRelationship = relationships.parents[0].relationship;
          if (animationCurveRelationship.match(/X/)) {
            curveNodesMap.get(animationCurveID).curves["x"] = animationCurve;
          } else if (animationCurveRelationship.match(/Y/)) {
            curveNodesMap.get(animationCurveID).curves["y"] = animationCurve;
          } else if (animationCurveRelationship.match(/Z/)) {
            curveNodesMap.get(animationCurveID).curves["z"] = animationCurve;
          } else if (animationCurveRelationship.match(/d|DeformPercent/) && curveNodesMap.has(animationCurveID)) {
            curveNodesMap.get(animationCurveID).curves["morph"] = animationCurve;
          }
        }
      }
    },
    parseAnimationLayers: function(curveNodesMap) {
      var rawLayers = fbxTree.Objects.AnimationLayer;
      var layersMap = new Map();
      for (var nodeID in rawLayers) {
        var layerCurveNodes = [];
        var connection = connections.get(parseInt(nodeID));
        if (connection !== void 0) {
          var children = connection.children;
          children.forEach(function(child, i) {
            if (curveNodesMap.has(child.ID)) {
              var curveNode = curveNodesMap.get(child.ID);
              if (curveNode.curves.x !== void 0 || curveNode.curves.y !== void 0 || curveNode.curves.z !== void 0) {
                if (layerCurveNodes[i] === void 0) {
                  var modelID = connections.get(child.ID).parents.filter(function(parent) {
                    return parent.relationship !== void 0;
                  })[0].ID;
                  if (modelID !== void 0) {
                    var rawModel = fbxTree.Objects.Model[modelID.toString()];
                    if (rawModel === void 0) {
                      console.warn("THREE.FBXLoader: Encountered a unused curve.", child);
                      return;
                    }
                    var node = {
                      modelName: rawModel.attrName ? PropertyBinding2.sanitizeNodeName(rawModel.attrName) : "",
                      ID: rawModel.id,
                      initialPosition: [0, 0, 0],
                      initialRotation: [0, 0, 0],
                      initialScale: [1, 1, 1]
                    };
                    sceneGraph.traverse(function(child2) {
                      if (child2.ID === rawModel.id) {
                        node.transform = child2.matrix;
                        if (child2.userData.transformData)
                          node.eulerOrder = child2.userData.transformData.eulerOrder;
                      }
                    });
                    if (!node.transform)
                      node.transform = new Matrix42();
                    if ("PreRotation" in rawModel)
                      node.preRotation = rawModel.PreRotation.value;
                    if ("PostRotation" in rawModel)
                      node.postRotation = rawModel.PostRotation.value;
                    layerCurveNodes[i] = node;
                  }
                }
                if (layerCurveNodes[i])
                  layerCurveNodes[i][curveNode.attr] = curveNode;
              } else if (curveNode.curves.morph !== void 0) {
                if (layerCurveNodes[i] === void 0) {
                  var deformerID = connections.get(child.ID).parents.filter(function(parent) {
                    return parent.relationship !== void 0;
                  })[0].ID;
                  var morpherID = connections.get(deformerID).parents[0].ID;
                  var geoID = connections.get(morpherID).parents[0].ID;
                  var modelID = connections.get(geoID).parents[0].ID;
                  var rawModel = fbxTree.Objects.Model[modelID];
                  var node = {
                    modelName: rawModel.attrName ? PropertyBinding2.sanitizeNodeName(rawModel.attrName) : "",
                    morphName: fbxTree.Objects.Deformer[deformerID].attrName
                  };
                  layerCurveNodes[i] = node;
                }
                layerCurveNodes[i][curveNode.attr] = curveNode;
              }
            }
          });
          layersMap.set(parseInt(nodeID), layerCurveNodes);
        }
      }
      return layersMap;
    },
    parseAnimStacks: function(layersMap) {
      var rawStacks = fbxTree.Objects.AnimationStack;
      var rawClips = {};
      for (var nodeID in rawStacks) {
        var children = connections.get(parseInt(nodeID)).children;
        if (children.length > 1) {
          console.warn("THREE.FBXLoader: Encountered an animation stack with multiple layers, this is currently not supported. Ignoring subsequent layers.");
        }
        var layer = layersMap.get(children[0].ID);
        rawClips[nodeID] = {
          name: rawStacks[nodeID].attrName,
          layer
        };
      }
      return rawClips;
    },
    addClip: function(rawClip) {
      var tracks = [];
      var scope = this;
      rawClip.layer.forEach(function(rawTracks) {
        tracks = tracks.concat(scope.generateTracks(rawTracks));
      });
      return new AnimationClip2(rawClip.name, -1, tracks);
    },
    generateTracks: function(rawTracks) {
      var tracks = [];
      var initialPosition = new Vector32();
      var initialRotation = new Quaternion2();
      var initialScale = new Vector32();
      if (rawTracks.transform)
        rawTracks.transform.decompose(initialPosition, initialRotation, initialScale);
      initialPosition = initialPosition.toArray();
      initialRotation = new Euler2().setFromQuaternion(initialRotation, rawTracks.eulerOrder).toArray();
      initialScale = initialScale.toArray();
      if (rawTracks.T !== void 0 && Object.keys(rawTracks.T.curves).length > 0) {
        var positionTrack = this.generateVectorTrack(rawTracks.modelName, rawTracks.T.curves, initialPosition, "position");
        if (positionTrack !== void 0)
          tracks.push(positionTrack);
      }
      if (rawTracks.R !== void 0 && Object.keys(rawTracks.R.curves).length > 0) {
        var rotationTrack = this.generateRotationTrack(rawTracks.modelName, rawTracks.R.curves, initialRotation, rawTracks.preRotation, rawTracks.postRotation, rawTracks.eulerOrder);
        if (rotationTrack !== void 0)
          tracks.push(rotationTrack);
      }
      if (rawTracks.S !== void 0 && Object.keys(rawTracks.S.curves).length > 0) {
        var scaleTrack = this.generateVectorTrack(rawTracks.modelName, rawTracks.S.curves, initialScale, "scale");
        if (scaleTrack !== void 0)
          tracks.push(scaleTrack);
      }
      if (rawTracks.DeformPercent !== void 0) {
        var morphTrack = this.generateMorphTrack(rawTracks);
        if (morphTrack !== void 0)
          tracks.push(morphTrack);
      }
      return tracks;
    },
    generateVectorTrack: function(modelName, curves, initialValue, type) {
      var times = this.getTimesForAllAxes(curves);
      var values = this.getKeyframeTrackValues(times, curves, initialValue);
      return new VectorKeyframeTrack2(modelName + "." + type, times, values);
    },
    generateRotationTrack: function(modelName, curves, initialValue, preRotation, postRotation, eulerOrder) {
      if (curves.x !== void 0) {
        this.interpolateRotations(curves.x);
        curves.x.values = curves.x.values.map(MathUtils2.degToRad);
      }
      if (curves.y !== void 0) {
        this.interpolateRotations(curves.y);
        curves.y.values = curves.y.values.map(MathUtils2.degToRad);
      }
      if (curves.z !== void 0) {
        this.interpolateRotations(curves.z);
        curves.z.values = curves.z.values.map(MathUtils2.degToRad);
      }
      var times = this.getTimesForAllAxes(curves);
      var values = this.getKeyframeTrackValues(times, curves, initialValue);
      if (preRotation !== void 0) {
        preRotation = preRotation.map(MathUtils2.degToRad);
        preRotation.push(eulerOrder);
        preRotation = new Euler2().fromArray(preRotation);
        preRotation = new Quaternion2().setFromEuler(preRotation);
      }
      if (postRotation !== void 0) {
        postRotation = postRotation.map(MathUtils2.degToRad);
        postRotation.push(eulerOrder);
        postRotation = new Euler2().fromArray(postRotation);
        postRotation = new Quaternion2().setFromEuler(postRotation).invert();
      }
      var quaternion = new Quaternion2();
      var euler = new Euler2();
      var quaternionValues = [];
      for (var i = 0; i < values.length; i += 3) {
        euler.set(values[i], values[i + 1], values[i + 2], eulerOrder);
        quaternion.setFromEuler(euler);
        if (preRotation !== void 0)
          quaternion.premultiply(preRotation);
        if (postRotation !== void 0)
          quaternion.multiply(postRotation);
        quaternion.toArray(quaternionValues, i / 3 * 4);
      }
      return new QuaternionKeyframeTrack2(modelName + ".quaternion", times, quaternionValues);
    },
    generateMorphTrack: function(rawTracks) {
      var curves = rawTracks.DeformPercent.curves.morph;
      var values = curves.values.map(function(val) {
        return val / 100;
      });
      var morphNum = sceneGraph.getObjectByName(rawTracks.modelName).morphTargetDictionary[rawTracks.morphName];
      return new NumberKeyframeTrack2(rawTracks.modelName + ".morphTargetInfluences[" + morphNum + "]", curves.times, values);
    },
    getTimesForAllAxes: function(curves) {
      var times = [];
      if (curves.x !== void 0)
        times = times.concat(curves.x.times);
      if (curves.y !== void 0)
        times = times.concat(curves.y.times);
      if (curves.z !== void 0)
        times = times.concat(curves.z.times);
      times = times.sort(function(a, b) {
        return a - b;
      }).filter(function(elem, index, array) {
        return array.indexOf(elem) == index;
      });
      return times;
    },
    getKeyframeTrackValues: function(times, curves, initialValue) {
      var prevValue = initialValue;
      var values = [];
      var xIndex = -1;
      var yIndex = -1;
      var zIndex = -1;
      times.forEach(function(time) {
        if (curves.x)
          xIndex = curves.x.times.indexOf(time);
        if (curves.y)
          yIndex = curves.y.times.indexOf(time);
        if (curves.z)
          zIndex = curves.z.times.indexOf(time);
        if (xIndex !== -1) {
          var xValue = curves.x.values[xIndex];
          values.push(xValue);
          prevValue[0] = xValue;
        } else {
          values.push(prevValue[0]);
        }
        if (yIndex !== -1) {
          var yValue = curves.y.values[yIndex];
          values.push(yValue);
          prevValue[1] = yValue;
        } else {
          values.push(prevValue[1]);
        }
        if (zIndex !== -1) {
          var zValue = curves.z.values[zIndex];
          values.push(zValue);
          prevValue[2] = zValue;
        } else {
          values.push(prevValue[2]);
        }
      });
      return values;
    },
    interpolateRotations: function(curve) {
      for (var i = 1; i < curve.values.length; i++) {
        var initialValue = curve.values[i - 1];
        var valuesSpan = curve.values[i] - initialValue;
        var absoluteSpan = Math.abs(valuesSpan);
        if (absoluteSpan >= 180) {
          var numSubIntervals = absoluteSpan / 180;
          var step = valuesSpan / numSubIntervals;
          var nextValue = initialValue + step;
          var initialTime = curve.times[i - 1];
          var timeSpan = curve.times[i] - initialTime;
          var interval = timeSpan / numSubIntervals;
          var nextTime = initialTime + interval;
          var interpolatedTimes = [];
          var interpolatedValues = [];
          while (nextTime < curve.times[i]) {
            interpolatedTimes.push(nextTime);
            nextTime += interval;
            interpolatedValues.push(nextValue);
            nextValue += step;
          }
          curve.times = inject(curve.times, i, interpolatedTimes);
          curve.values = inject(curve.values, i, interpolatedValues);
        }
      }
    }
  };
  function TextParser() {
  }
  TextParser.prototype = {
    constructor: TextParser,
    getPrevNode: function() {
      return this.nodeStack[this.currentIndent - 2];
    },
    getCurrentNode: function() {
      return this.nodeStack[this.currentIndent - 1];
    },
    getCurrentProp: function() {
      return this.currentProp;
    },
    pushStack: function(node) {
      this.nodeStack.push(node);
      this.currentIndent += 1;
    },
    popStack: function() {
      this.nodeStack.pop();
      this.currentIndent -= 1;
    },
    setCurrentProp: function(val, name) {
      this.currentProp = val;
      this.currentPropName = name;
    },
    parse: function(text) {
      this.currentIndent = 0;
      this.allNodes = new FBXTree();
      this.nodeStack = [];
      this.currentProp = [];
      this.currentPropName = "";
      var scope = this;
      var split = text.split(/[\r\n]+/);
      split.forEach(function(line, i) {
        var matchComment = line.match(/^[\s\t]*;/);
        var matchEmpty = line.match(/^[\s\t]*$/);
        if (matchComment || matchEmpty)
          return;
        var matchBeginning = line.match("^\\t{" + scope.currentIndent + "}(\\w+):(.*){", "");
        var matchProperty = line.match("^\\t{" + scope.currentIndent + "}(\\w+):[\\s\\t\\r\\n](.*)");
        var matchEnd = line.match("^\\t{" + (scope.currentIndent - 1) + "}}");
        if (matchBeginning) {
          scope.parseNodeBegin(line, matchBeginning);
        } else if (matchProperty) {
          scope.parseNodeProperty(line, matchProperty, split[++i]);
        } else if (matchEnd) {
          scope.popStack();
        } else if (line.match(/^[^\s\t}]/)) {
          scope.parseNodePropertyContinued(line);
        }
      });
      return this.allNodes;
    },
    parseNodeBegin: function(line, property) {
      var nodeName = property[1].trim().replace(/^"/, "").replace(/"$/, "");
      var nodeAttrs = property[2].split(",").map(function(attr) {
        return attr.trim().replace(/^"/, "").replace(/"$/, "");
      });
      var node = {name: nodeName};
      var attrs = this.parseNodeAttr(nodeAttrs);
      var currentNode = this.getCurrentNode();
      if (this.currentIndent === 0) {
        this.allNodes.add(nodeName, node);
      } else {
        if (nodeName in currentNode) {
          if (nodeName === "PoseNode") {
            currentNode.PoseNode.push(node);
          } else if (currentNode[nodeName].id !== void 0) {
            currentNode[nodeName] = {};
            currentNode[nodeName][currentNode[nodeName].id] = currentNode[nodeName];
          }
          if (attrs.id !== "")
            currentNode[nodeName][attrs.id] = node;
        } else if (typeof attrs.id === "number") {
          currentNode[nodeName] = {};
          currentNode[nodeName][attrs.id] = node;
        } else if (nodeName !== "Properties70") {
          if (nodeName === "PoseNode")
            currentNode[nodeName] = [node];
          else
            currentNode[nodeName] = node;
        }
      }
      if (typeof attrs.id === "number")
        node.id = attrs.id;
      if (attrs.name !== "")
        node.attrName = attrs.name;
      if (attrs.type !== "")
        node.attrType = attrs.type;
      this.pushStack(node);
    },
    parseNodeAttr: function(attrs) {
      var id = attrs[0];
      if (attrs[0] !== "") {
        id = parseInt(attrs[0]);
        if (isNaN(id)) {
          id = attrs[0];
        }
      }
      var name = "", type = "";
      if (attrs.length > 1) {
        name = attrs[1].replace(/^(\w+)::/, "");
        type = attrs[2];
      }
      return {id, name, type};
    },
    parseNodeProperty: function(line, property, contentLine) {
      var propName = property[1].replace(/^"/, "").replace(/"$/, "").trim();
      var propValue = property[2].replace(/^"/, "").replace(/"$/, "").trim();
      if (propName === "Content" && propValue === ",") {
        propValue = contentLine.replace(/"/g, "").replace(/,$/, "").trim();
      }
      var currentNode = this.getCurrentNode();
      var parentName = currentNode.name;
      if (parentName === "Properties70") {
        this.parseNodeSpecialProperty(line, propName, propValue);
        return;
      }
      if (propName === "C") {
        var connProps = propValue.split(",").slice(1);
        var from = parseInt(connProps[0]);
        var to = parseInt(connProps[1]);
        var rest = propValue.split(",").slice(3);
        rest = rest.map(function(elem) {
          return elem.trim().replace(/^"/, "");
        });
        propName = "connections";
        propValue = [from, to];
        append(propValue, rest);
        if (currentNode[propName] === void 0) {
          currentNode[propName] = [];
        }
      }
      if (propName === "Node")
        currentNode.id = propValue;
      if (propName in currentNode && Array.isArray(currentNode[propName])) {
        currentNode[propName].push(propValue);
      } else {
        if (propName !== "a")
          currentNode[propName] = propValue;
        else
          currentNode.a = propValue;
      }
      this.setCurrentProp(currentNode, propName);
      if (propName === "a" && propValue.slice(-1) !== ",") {
        currentNode.a = parseNumberArray(propValue);
      }
    },
    parseNodePropertyContinued: function(line) {
      var currentNode = this.getCurrentNode();
      currentNode.a += line;
      if (line.slice(-1) !== ",") {
        currentNode.a = parseNumberArray(currentNode.a);
      }
    },
    parseNodeSpecialProperty: function(line, propName, propValue) {
      var props = propValue.split('",').map(function(prop) {
        return prop.trim().replace(/^\"/, "").replace(/\s/, "_");
      });
      var innerPropName = props[0];
      var innerPropType1 = props[1];
      var innerPropType2 = props[2];
      var innerPropFlag = props[3];
      var innerPropValue = props[4];
      switch (innerPropType1) {
        case "int":
        case "enum":
        case "bool":
        case "ULongLong":
        case "double":
        case "Number":
        case "FieldOfView":
          innerPropValue = parseFloat(innerPropValue);
          break;
        case "Color":
        case "ColorRGB":
        case "Vector3D":
        case "Lcl_Translation":
        case "Lcl_Rotation":
        case "Lcl_Scaling":
          innerPropValue = parseNumberArray(innerPropValue);
          break;
      }
      this.getPrevNode()[innerPropName] = {
        type: innerPropType1,
        type2: innerPropType2,
        flag: innerPropFlag,
        value: innerPropValue
      };
      this.setCurrentProp(this.getPrevNode(), innerPropName);
    }
  };
  function BinaryParser() {
  }
  BinaryParser.prototype = {
    constructor: BinaryParser,
    parse: function(buffer) {
      var reader = new BinaryReader(buffer);
      reader.skip(23);
      var version = reader.getUint32();
      if (version < 6400) {
        throw new Error("THREE.FBXLoader: FBX version not supported, FileVersion: " + version);
      }
      var allNodes = new FBXTree();
      while (!this.endOfContent(reader)) {
        var node = this.parseNode(reader, version);
        if (node !== null)
          allNodes.add(node.name, node);
      }
      return allNodes;
    },
    endOfContent: function(reader) {
      if (reader.size() % 16 === 0) {
        return (reader.getOffset() + 160 + 16 & ~15) >= reader.size();
      } else {
        return reader.getOffset() + 160 + 16 >= reader.size();
      }
    },
    parseNode: function(reader, version) {
      var node = {};
      var endOffset = version >= 7500 ? reader.getUint64() : reader.getUint32();
      var numProperties = version >= 7500 ? reader.getUint64() : reader.getUint32();
      version >= 7500 ? reader.getUint64() : reader.getUint32();
      var nameLen = reader.getUint8();
      var name = reader.getString(nameLen);
      if (endOffset === 0)
        return null;
      var propertyList = [];
      for (var i = 0; i < numProperties; i++) {
        propertyList.push(this.parseProperty(reader));
      }
      var id = propertyList.length > 0 ? propertyList[0] : "";
      var attrName = propertyList.length > 1 ? propertyList[1] : "";
      var attrType = propertyList.length > 2 ? propertyList[2] : "";
      node.singleProperty = numProperties === 1 && reader.getOffset() === endOffset ? true : false;
      while (endOffset > reader.getOffset()) {
        var subNode = this.parseNode(reader, version);
        if (subNode !== null)
          this.parseSubNode(name, node, subNode);
      }
      node.propertyList = propertyList;
      if (typeof id === "number")
        node.id = id;
      if (attrName !== "")
        node.attrName = attrName;
      if (attrType !== "")
        node.attrType = attrType;
      if (name !== "")
        node.name = name;
      return node;
    },
    parseSubNode: function(name, node, subNode) {
      if (subNode.singleProperty === true) {
        var value = subNode.propertyList[0];
        if (Array.isArray(value)) {
          node[subNode.name] = subNode;
          subNode.a = value;
        } else {
          node[subNode.name] = value;
        }
      } else if (name === "Connections" && subNode.name === "C") {
        var array = [];
        subNode.propertyList.forEach(function(property, i) {
          if (i !== 0)
            array.push(property);
        });
        if (node.connections === void 0) {
          node.connections = [];
        }
        node.connections.push(array);
      } else if (subNode.name === "Properties70") {
        var keys = Object.keys(subNode);
        keys.forEach(function(key) {
          node[key] = subNode[key];
        });
      } else if (name === "Properties70" && subNode.name === "P") {
        var innerPropName = subNode.propertyList[0];
        var innerPropType1 = subNode.propertyList[1];
        var innerPropType2 = subNode.propertyList[2];
        var innerPropFlag = subNode.propertyList[3];
        var innerPropValue;
        if (innerPropName.indexOf("Lcl ") === 0)
          innerPropName = innerPropName.replace("Lcl ", "Lcl_");
        if (innerPropType1.indexOf("Lcl ") === 0)
          innerPropType1 = innerPropType1.replace("Lcl ", "Lcl_");
        if (innerPropType1 === "Color" || innerPropType1 === "ColorRGB" || innerPropType1 === "Vector" || innerPropType1 === "Vector3D" || innerPropType1.indexOf("Lcl_") === 0) {
          innerPropValue = [
            subNode.propertyList[4],
            subNode.propertyList[5],
            subNode.propertyList[6]
          ];
        } else {
          innerPropValue = subNode.propertyList[4];
        }
        node[innerPropName] = {
          type: innerPropType1,
          type2: innerPropType2,
          flag: innerPropFlag,
          value: innerPropValue
        };
      } else if (node[subNode.name] === void 0) {
        if (typeof subNode.id === "number") {
          node[subNode.name] = {};
          node[subNode.name][subNode.id] = subNode;
        } else {
          node[subNode.name] = subNode;
        }
      } else {
        if (subNode.name === "PoseNode") {
          if (!Array.isArray(node[subNode.name])) {
            node[subNode.name] = [node[subNode.name]];
          }
          node[subNode.name].push(subNode);
        } else if (node[subNode.name][subNode.id] === void 0) {
          node[subNode.name][subNode.id] = subNode;
        }
      }
    },
    parseProperty: function(reader) {
      var type = reader.getString(1);
      switch (type) {
        case "C":
          return reader.getBoolean();
        case "D":
          return reader.getFloat64();
        case "F":
          return reader.getFloat32();
        case "I":
          return reader.getInt32();
        case "L":
          return reader.getInt64();
        case "R":
          var length = reader.getUint32();
          return reader.getArrayBuffer(length);
        case "S":
          var length = reader.getUint32();
          return reader.getString(length);
        case "Y":
          return reader.getInt16();
        case "b":
        case "c":
        case "d":
        case "f":
        case "i":
        case "l":
          var arrayLength = reader.getUint32();
          var encoding = reader.getUint32();
          var compressedLength = reader.getUint32();
          if (encoding === 0) {
            switch (type) {
              case "b":
              case "c":
                return reader.getBooleanArray(arrayLength);
              case "d":
                return reader.getFloat64Array(arrayLength);
              case "f":
                return reader.getFloat32Array(arrayLength);
              case "i":
                return reader.getInt32Array(arrayLength);
              case "l":
                return reader.getInt64Array(arrayLength);
            }
          }
          if (typeof Inflate === "undefined") {
            console.error("THREE.FBXLoader: External library Inflate.min.js required, obtain or import from https://github.com/imaya/zlib.js");
          }
          var inflate = new Inflate(new Uint8Array(reader.getArrayBuffer(compressedLength)));
          var reader2 = new BinaryReader(inflate.decompress().buffer);
          switch (type) {
            case "b":
            case "c":
              return reader2.getBooleanArray(arrayLength);
            case "d":
              return reader2.getFloat64Array(arrayLength);
            case "f":
              return reader2.getFloat32Array(arrayLength);
            case "i":
              return reader2.getInt32Array(arrayLength);
            case "l":
              return reader2.getInt64Array(arrayLength);
          }
        default:
          throw new Error("THREE.FBXLoader: Unknown property type " + type);
      }
    }
  };
  function BinaryReader(buffer, littleEndian) {
    this.dv = new DataView(buffer);
    this.offset = 0;
    this.littleEndian = littleEndian !== void 0 ? littleEndian : true;
  }
  BinaryReader.prototype = {
    constructor: BinaryReader,
    getOffset: function() {
      return this.offset;
    },
    size: function() {
      return this.dv.buffer.byteLength;
    },
    skip: function(length) {
      this.offset += length;
    },
    getBoolean: function() {
      return (this.getUint8() & 1) === 1;
    },
    getBooleanArray: function(size) {
      var a = [];
      for (var i = 0; i < size; i++) {
        a.push(this.getBoolean());
      }
      return a;
    },
    getUint8: function() {
      var value = this.dv.getUint8(this.offset);
      this.offset += 1;
      return value;
    },
    getInt16: function() {
      var value = this.dv.getInt16(this.offset, this.littleEndian);
      this.offset += 2;
      return value;
    },
    getInt32: function() {
      var value = this.dv.getInt32(this.offset, this.littleEndian);
      this.offset += 4;
      return value;
    },
    getInt32Array: function(size) {
      var a = [];
      for (var i = 0; i < size; i++) {
        a.push(this.getInt32());
      }
      return a;
    },
    getUint32: function() {
      var value = this.dv.getUint32(this.offset, this.littleEndian);
      this.offset += 4;
      return value;
    },
    getInt64: function() {
      var low, high;
      if (this.littleEndian) {
        low = this.getUint32();
        high = this.getUint32();
      } else {
        high = this.getUint32();
        low = this.getUint32();
      }
      if (high & 2147483648) {
        high = ~high & 4294967295;
        low = ~low & 4294967295;
        if (low === 4294967295)
          high = high + 1 & 4294967295;
        low = low + 1 & 4294967295;
        return -(high * 4294967296 + low);
      }
      return high * 4294967296 + low;
    },
    getInt64Array: function(size) {
      var a = [];
      for (var i = 0; i < size; i++) {
        a.push(this.getInt64());
      }
      return a;
    },
    getUint64: function() {
      var low, high;
      if (this.littleEndian) {
        low = this.getUint32();
        high = this.getUint32();
      } else {
        high = this.getUint32();
        low = this.getUint32();
      }
      return high * 4294967296 + low;
    },
    getFloat32: function() {
      var value = this.dv.getFloat32(this.offset, this.littleEndian);
      this.offset += 4;
      return value;
    },
    getFloat32Array: function(size) {
      var a = [];
      for (var i = 0; i < size; i++) {
        a.push(this.getFloat32());
      }
      return a;
    },
    getFloat64: function() {
      var value = this.dv.getFloat64(this.offset, this.littleEndian);
      this.offset += 8;
      return value;
    },
    getFloat64Array: function(size) {
      var a = [];
      for (var i = 0; i < size; i++) {
        a.push(this.getFloat64());
      }
      return a;
    },
    getArrayBuffer: function(size) {
      var value = this.dv.buffer.slice(this.offset, this.offset + size);
      this.offset += size;
      return value;
    },
    getString: function(size) {
      var a = [];
      for (var i = 0; i < size; i++) {
        a[i] = this.getUint8();
      }
      var nullByte = a.indexOf(0);
      if (nullByte >= 0)
        a = a.slice(0, nullByte);
      return LoaderUtils2.decodeText(new Uint8Array(a));
    }
  };
  function FBXTree() {
  }
  FBXTree.prototype = {
    constructor: FBXTree,
    add: function(key, val) {
      this[key] = val;
    }
  };
  function isFbxFormatBinary(buffer) {
    var CORRECT = "Kaydara FBX Binary  \0";
    return buffer.byteLength >= CORRECT.length && CORRECT === convertArrayBufferToString(buffer, 0, CORRECT.length);
  }
  function isFbxFormatASCII(text) {
    var CORRECT = ["K", "a", "y", "d", "a", "r", "a", "\\", "F", "B", "X", "\\", "B", "i", "n", "a", "r", "y", "\\", "\\"];
    var cursor = 0;
    function read(offset) {
      var result = text[offset - 1];
      text = text.slice(cursor + offset);
      cursor++;
      return result;
    }
    for (var i = 0; i < CORRECT.length; ++i) {
      var num = read(1);
      if (num === CORRECT[i]) {
        return false;
      }
    }
    return true;
  }
  function getFbxVersion(text) {
    var versionRegExp = /FBXVersion: (\d+)/;
    var match = text.match(versionRegExp);
    if (match) {
      var version = parseInt(match[1]);
      return version;
    }
    throw new Error("THREE.FBXLoader: Cannot find the version number for the file given.");
  }
  function convertFBXTimeToSeconds(time) {
    return time / 46186158e3;
  }
  var dataArray = [];
  function getData(polygonVertexIndex, polygonIndex, vertexIndex, infoObject) {
    var index;
    switch (infoObject.mappingType) {
      case "ByPolygonVertex":
        index = polygonVertexIndex;
        break;
      case "ByPolygon":
        index = polygonIndex;
        break;
      case "ByVertice":
        index = vertexIndex;
        break;
      case "AllSame":
        index = infoObject.indices[0];
        break;
      default:
        console.warn("THREE.FBXLoader: unknown attribute mapping type " + infoObject.mappingType);
    }
    if (infoObject.referenceType === "IndexToDirect")
      index = infoObject.indices[index];
    var from = index * infoObject.dataSize;
    var to = from + infoObject.dataSize;
    return slice(dataArray, infoObject.buffer, from, to);
  }
  var tempEuler = new Euler2();
  var tempVec = new Vector32();
  function generateTransform(transformData) {
    var lTranslationM = new Matrix42();
    var lPreRotationM = new Matrix42();
    var lRotationM = new Matrix42();
    var lPostRotationM = new Matrix42();
    var lScalingM = new Matrix42();
    var lScalingPivotM = new Matrix42();
    var lScalingOffsetM = new Matrix42();
    var lRotationOffsetM = new Matrix42();
    var lRotationPivotM = new Matrix42();
    var lParentGX = new Matrix42();
    var lGlobalT = new Matrix42();
    var inheritType = transformData.inheritType ? transformData.inheritType : 0;
    if (transformData.translation)
      lTranslationM.setPosition(tempVec.fromArray(transformData.translation));
    if (transformData.preRotation) {
      var array = transformData.preRotation.map(MathUtils2.degToRad);
      array.push(transformData.eulerOrder);
      lPreRotationM.makeRotationFromEuler(tempEuler.fromArray(array));
    }
    if (transformData.rotation) {
      var array = transformData.rotation.map(MathUtils2.degToRad);
      array.push(transformData.eulerOrder);
      lRotationM.makeRotationFromEuler(tempEuler.fromArray(array));
    }
    if (transformData.postRotation) {
      var array = transformData.postRotation.map(MathUtils2.degToRad);
      array.push(transformData.eulerOrder);
      lPostRotationM.makeRotationFromEuler(tempEuler.fromArray(array));
    }
    if (transformData.scale)
      lScalingM.scale(tempVec.fromArray(transformData.scale));
    if (transformData.scalingOffset)
      lScalingOffsetM.setPosition(tempVec.fromArray(transformData.scalingOffset));
    if (transformData.scalingPivot)
      lScalingPivotM.setPosition(tempVec.fromArray(transformData.scalingPivot));
    if (transformData.rotationOffset)
      lRotationOffsetM.setPosition(tempVec.fromArray(transformData.rotationOffset));
    if (transformData.rotationPivot)
      lRotationPivotM.setPosition(tempVec.fromArray(transformData.rotationPivot));
    if (transformData.parentMatrixWorld)
      lParentGX = transformData.parentMatrixWorld;
    var lLRM = lPreRotationM.multiply(lRotationM).multiply(lPostRotationM);
    var lParentGRM = new Matrix42();
    lParentGX.extractRotation(lParentGRM);
    var lParentTM = new Matrix42();
    lParentTM.copyPosition(lParentGX);
    var lParentGSM = new Matrix42();
    lParentGSM.copy(lParentGRM).invert().multiply(lParentGX);
    var lGlobalRS = new Matrix42();
    if (inheritType === 0) {
      lGlobalRS.copy(lParentGRM).multiply(lLRM).multiply(lParentGSM).multiply(lScalingM);
    } else if (inheritType === 1) {
      lGlobalRS.copy(lParentGRM).multiply(lParentGSM).multiply(lLRM).multiply(lScalingM);
    } else {
      var lParentLSM_inv = new Matrix42();
      lParentLSM_inv.copy(lScalingM).invert();
      var lParentGSM_noLocal = new Matrix42().multiply(lParentGSM).multiply(lParentLSM_inv);
      lGlobalRS.copy(lParentGRM).multiply(lLRM).multiply(lParentGSM_noLocal).multiply(lScalingM);
    }
    var lRotationPivotM_inv = new Matrix42();
    lRotationPivotM_inv.copy(lRotationPivotM).invert();
    var lScalingPivotM_inv = new Matrix42();
    lScalingPivotM_inv.copy(lScalingPivotM).invert();
    var lTransform = new Matrix42();
    lTransform.copy(lTranslationM).multiply(lRotationOffsetM).multiply(lRotationPivotM).multiply(lPreRotationM).multiply(lRotationM).multiply(lPostRotationM).multiply(lRotationPivotM_inv).multiply(lScalingOffsetM).multiply(lScalingPivotM).multiply(lScalingM).multiply(lScalingPivotM_inv);
    var lLocalTWithAllPivotAndOffsetInfo = new Matrix42().copyPosition(lTransform);
    var lGlobalTranslation = new Matrix42().copy(lParentGX).multiply(lLocalTWithAllPivotAndOffsetInfo);
    lGlobalT.copyPosition(lGlobalTranslation);
    lTransform = new Matrix42().multiply(lGlobalT).multiply(lGlobalRS);
    return lTransform;
  }
  function getEulerOrder(order) {
    order = order || 0;
    var enums = [
      "ZYX",
      "YZX",
      "XZY",
      "ZXY",
      "YXZ",
      "XYZ"
    ];
    if (order === 6) {
      console.warn("THREE.FBXLoader: unsupported Euler Order: Spherical XYZ. Animations and rotations may be incorrect.");
      return enums[0];
    }
    return enums[order];
  }
  function parseNumberArray(value) {
    var array = value.split(",").map(function(val) {
      return parseFloat(val);
    });
    return array;
  }
  function convertArrayBufferToString(buffer, from, to) {
    if (from === void 0)
      from = 0;
    if (to === void 0)
      to = buffer.byteLength;
    return LoaderUtils2.decodeText(new Uint8Array(buffer, from, to));
  }
  function append(a, b) {
    for (var i = 0, j = a.length, l = b.length; i < l; i++, j++) {
      a[j] = b[i];
    }
  }
  function slice(a, b, from, to) {
    for (var i = from, j = 0; i < to; i++, j++) {
      a[j] = b[i];
    }
    return a;
  }
  function inject(a1, index, a2) {
    return a1.slice(0, index).concat(a2).concat(a1.slice(index));
  }
  return FBXLoader2;
}();
export {FBXLoader};
