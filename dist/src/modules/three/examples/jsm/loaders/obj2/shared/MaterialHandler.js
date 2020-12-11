import {LineBasicMaterial as LineBasicMaterial2} from "three/src/materials/LineBasicMaterial";
import {MaterialLoader as MaterialLoader2} from "three/src/loaders/MaterialLoader";
import {MeshStandardMaterial as MeshStandardMaterial2} from "three/src/materials/MeshStandardMaterial";
import {PointsMaterial as PointsMaterial2} from "three/src/materials/PointsMaterial";
const MaterialHandler = function() {
  this.logging = {
    enabled: false,
    debug: false
  };
  this.callbacks = {
    onLoadMaterials: null
  };
  this.materials = {};
};
MaterialHandler.prototype = {
  constructor: MaterialHandler,
  setLogging: function(enabled, debug) {
    this.logging.enabled = enabled === true;
    this.logging.debug = debug === true;
  },
  _setCallbacks: function(onLoadMaterials) {
    if (onLoadMaterials !== void 0 && onLoadMaterials !== null && onLoadMaterials instanceof Function) {
      this.callbacks.onLoadMaterials = onLoadMaterials;
    }
  },
  createDefaultMaterials: function(overrideExisting) {
    const defaultMaterial = new MeshStandardMaterial2({color: 14479871});
    defaultMaterial.name = "defaultMaterial";
    const defaultVertexColorMaterial = new MeshStandardMaterial2({color: 14479871});
    defaultVertexColorMaterial.name = "defaultVertexColorMaterial";
    defaultVertexColorMaterial.vertexColors = true;
    const defaultLineMaterial = new LineBasicMaterial2();
    defaultLineMaterial.name = "defaultLineMaterial";
    const defaultPointMaterial = new PointsMaterial2({size: 0.1});
    defaultPointMaterial.name = "defaultPointMaterial";
    const runtimeMaterials = {};
    runtimeMaterials[defaultMaterial.name] = defaultMaterial;
    runtimeMaterials[defaultVertexColorMaterial.name] = defaultVertexColorMaterial;
    runtimeMaterials[defaultLineMaterial.name] = defaultLineMaterial;
    runtimeMaterials[defaultPointMaterial.name] = defaultPointMaterial;
    this.addMaterials(runtimeMaterials, overrideExisting);
  },
  addPayloadMaterials: function(materialPayload) {
    let material, materialName;
    const materialCloneInstructions = materialPayload.materials.materialCloneInstructions;
    let newMaterials = {};
    if (materialCloneInstructions !== void 0 && materialCloneInstructions !== null) {
      let materialNameOrg = materialCloneInstructions.materialNameOrg;
      materialNameOrg = materialNameOrg !== void 0 && materialNameOrg !== null ? materialNameOrg : "";
      const materialOrg = this.materials[materialNameOrg];
      if (materialOrg) {
        material = materialOrg.clone();
        materialName = materialCloneInstructions.materialName;
        material.name = materialName;
        Object.assign(material, materialCloneInstructions.materialProperties);
        this.materials[materialName] = material;
        newMaterials[materialName] = material;
      } else {
        if (this.logging.enabled) {
          console.info('Requested material "' + materialNameOrg + '" is not available!');
        }
      }
    }
    let materials = materialPayload.materials.serializedMaterials;
    if (materials !== void 0 && materials !== null && Object.keys(materials).length > 0) {
      const loader = new MaterialLoader2();
      let materialJson;
      for (materialName in materials) {
        materialJson = materials[materialName];
        if (materialJson !== void 0 && materialJson !== null) {
          material = loader.parse(materialJson);
          if (this.logging.enabled) {
            console.info('De-serialized material with name "' + materialName + '" will be added.');
          }
          this.materials[materialName] = material;
          newMaterials[materialName] = material;
        }
      }
    }
    materials = materialPayload.materials.runtimeMaterials;
    newMaterials = this.addMaterials(materials, true, newMaterials);
    return newMaterials;
  },
  addMaterials: function(materials, overrideExisting, newMaterials) {
    if (newMaterials === void 0 || newMaterials === null) {
      newMaterials = {};
    }
    if (materials !== void 0 && materials !== null && Object.keys(materials).length > 0) {
      let material;
      let existingMaterial;
      let add;
      for (const materialName in materials) {
        material = materials[materialName];
        add = overrideExisting === true;
        if (!add) {
          existingMaterial = this.materials[materialName];
          add = existingMaterial === null || existingMaterial === void 0;
        }
        if (add) {
          this.materials[materialName] = material;
          newMaterials[materialName] = material;
        }
        if (this.logging.enabled && this.logging.debug) {
          console.info('Material with name "' + materialName + '" was added.');
        }
      }
    }
    if (this.callbacks.onLoadMaterials) {
      this.callbacks.onLoadMaterials(newMaterials);
    }
    return newMaterials;
  },
  getMaterials: function() {
    return this.materials;
  },
  getMaterial: function(materialName) {
    return this.materials[materialName];
  },
  getMaterialsJSON: function() {
    const materialsJSON = {};
    let material;
    for (const materialName in this.materials) {
      material = this.materials[materialName];
      materialsJSON[materialName] = material.toJSON();
    }
    return materialsJSON;
  },
  clearMaterials: function() {
    this.materials = {};
  }
};
export {MaterialHandler};
