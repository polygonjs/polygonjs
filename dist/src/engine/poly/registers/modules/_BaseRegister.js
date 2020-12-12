export var ModuleName;
(function(ModuleName2) {
  ModuleName2["BasisTextureLoader"] = "BasisTextureLoader";
  ModuleName2["DRACOLoader"] = "DRACOLoader";
  ModuleName2["EXRLoader"] = "EXRLoader";
  ModuleName2["FBXLoader"] = "FBXLoader";
  ModuleName2["GLTFLoader"] = "GLTFLoader";
  ModuleName2["OBJLoader2"] = "OBJLoader2";
  ModuleName2["PDBLoader"] = "PDBLoader";
  ModuleName2["PLYLoader"] = "PLYLoader";
  ModuleName2["RGBELoader"] = "RGBELoader";
  ModuleName2["TTFLoader"] = "TTFLoader";
  ModuleName2["SVGLoader"] = "SVGLoader";
})(ModuleName || (ModuleName = {}));
export class BaseModulesRegister {
  constructor() {
    this._loaded_module_by_name = new Map();
    this._promise_by_name = new Map();
  }
  register(name, promise) {
    this._promise_by_name.set(name, promise);
  }
  async module(name) {
    const loaded_module = this._loaded_module_by_name.get(name);
    if (loaded_module) {
      return loaded_module;
    } else {
      const promise = this._promise_by_name.get(name);
      if (promise) {
        const new_loaded_module = await promise;
        if (new_loaded_module) {
          this._loaded_module_by_name.set(name, new_loaded_module);
          return new_loaded_module;
        }
      } else {
        console.warn(`module ${name} not registered`);
      }
    }
  }
}
