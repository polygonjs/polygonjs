import {BufferAttribute as BufferAttribute2} from "three/src/core/BufferAttribute";
import {BufferGeometry as BufferGeometry2} from "three/src/core/BufferGeometry";
import {LineSegments as LineSegments2} from "three/src/objects/LineSegments";
import {Mesh as Mesh2} from "three/src/objects/Mesh";
import {Points as Points2} from "three/src/objects/Points";
const MeshReceiver = function(materialHandler) {
  this.logging = {
    enabled: false,
    debug: false
  };
  this.callbacks = {
    onProgress: null,
    onMeshAlter: null
  };
  this.materialHandler = materialHandler;
};
MeshReceiver.prototype = {
  constructor: MeshReceiver,
  setLogging: function(enabled, debug) {
    this.logging.enabled = enabled === true;
    this.logging.debug = debug === true;
  },
  _setCallbacks: function(onProgress, onMeshAlter) {
    if (onProgress !== null && onProgress !== void 0 && onProgress instanceof Function) {
      this.callbacks.onProgress = onProgress;
    }
    if (onMeshAlter !== null && onMeshAlter !== void 0 && onMeshAlter instanceof Function) {
      this.callbacks.onMeshAlter = onMeshAlter;
    }
  },
  buildMeshes: function(meshPayload) {
    const meshName = meshPayload.params.meshName;
    const buffers = meshPayload.buffers;
    const bufferGeometry = new BufferGeometry2();
    if (buffers.vertices !== void 0 && buffers.vertices !== null) {
      bufferGeometry.setAttribute("position", new BufferAttribute2(new Float32Array(buffers.vertices), 3));
    }
    if (buffers.indices !== void 0 && buffers.indices !== null) {
      bufferGeometry.setIndex(new BufferAttribute2(new Uint32Array(buffers.indices), 1));
    }
    if (buffers.colors !== void 0 && buffers.colors !== null) {
      bufferGeometry.setAttribute("color", new BufferAttribute2(new Float32Array(buffers.colors), 3));
    }
    if (buffers.normals !== void 0 && buffers.normals !== null) {
      bufferGeometry.setAttribute("normal", new BufferAttribute2(new Float32Array(buffers.normals), 3));
    } else {
      bufferGeometry.computeVertexNormals();
    }
    if (buffers.uvs !== void 0 && buffers.uvs !== null) {
      bufferGeometry.setAttribute("uv", new BufferAttribute2(new Float32Array(buffers.uvs), 2));
    }
    if (buffers.skinIndex !== void 0 && buffers.skinIndex !== null) {
      bufferGeometry.setAttribute("skinIndex", new BufferAttribute2(new Uint16Array(buffers.skinIndex), 4));
    }
    if (buffers.skinWeight !== void 0 && buffers.skinWeight !== null) {
      bufferGeometry.setAttribute("skinWeight", new BufferAttribute2(new Float32Array(buffers.skinWeight), 4));
    }
    let material, materialName, key;
    const materialNames = meshPayload.materials.materialNames;
    const createMultiMaterial = meshPayload.materials.multiMaterial;
    const multiMaterials = [];
    for (key in materialNames) {
      materialName = materialNames[key];
      material = this.materialHandler.getMaterial(materialName);
      if (createMultiMaterial)
        multiMaterials.push(material);
    }
    if (createMultiMaterial) {
      material = multiMaterials;
      const materialGroups = meshPayload.materials.materialGroups;
      let materialGroup;
      for (key in materialGroups) {
        materialGroup = materialGroups[key];
        bufferGeometry.addGroup(materialGroup.start, materialGroup.count, materialGroup.index);
      }
    }
    const meshes = [];
    let mesh;
    let callbackOnMeshAlterResult;
    let useOrgMesh = true;
    const geometryType = meshPayload.geometryType === null ? 0 : meshPayload.geometryType;
    if (this.callbacks.onMeshAlter) {
      callbackOnMeshAlterResult = this.callbacks.onMeshAlter({
        detail: {
          meshName,
          bufferGeometry,
          material,
          geometryType
        }
      });
    }
    if (callbackOnMeshAlterResult) {
      if (callbackOnMeshAlterResult.isDisregardMesh()) {
        useOrgMesh = false;
      } else if (callbackOnMeshAlterResult.providesAlteredMeshes()) {
        for (const i in callbackOnMeshAlterResult.meshes) {
          meshes.push(callbackOnMeshAlterResult.meshes[i]);
        }
        useOrgMesh = false;
      }
    }
    if (useOrgMesh) {
      if (meshPayload.computeBoundingSphere)
        bufferGeometry.computeBoundingSphere();
      if (geometryType === 0) {
        mesh = new Mesh2(bufferGeometry, material);
      } else if (geometryType === 1) {
        mesh = new LineSegments2(bufferGeometry, material);
      } else {
        mesh = new Points2(bufferGeometry, material);
      }
      mesh.name = meshName;
      meshes.push(mesh);
    }
    let progressMessage = meshPayload.params.meshName;
    if (meshes.length > 0) {
      const meshNames = [];
      for (const i in meshes) {
        mesh = meshes[i];
        meshNames[i] = mesh.name;
      }
      progressMessage += ": Adding mesh(es) (" + meshNames.length + ": " + meshNames + ") from input mesh: " + meshName;
      progressMessage += " (" + (meshPayload.progress.numericalValue * 100).toFixed(2) + "%)";
    } else {
      progressMessage += ": Not adding mesh: " + meshName;
      progressMessage += " (" + (meshPayload.progress.numericalValue * 100).toFixed(2) + "%)";
    }
    if (this.callbacks.onProgress) {
      this.callbacks.onProgress("progress", progressMessage, meshPayload.progress.numericalValue);
    }
    return meshes;
  }
};
const LoadedMeshUserOverride = function(disregardMesh, alteredMesh) {
  this.disregardMesh = disregardMesh === true;
  this.alteredMesh = alteredMesh === true;
  this.meshes = [];
};
LoadedMeshUserOverride.prototype = {
  constructor: LoadedMeshUserOverride,
  addMesh: function(mesh) {
    this.meshes.push(mesh);
    this.alteredMesh = true;
  },
  isDisregardMesh: function() {
    return this.disregardMesh;
  },
  providesAlteredMeshes: function() {
    return this.alteredMesh;
  }
};
export {
  MeshReceiver,
  LoadedMeshUserOverride
};
