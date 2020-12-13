import {ModuleName} from "./_BaseRegister";
export class AllModulesRegister {
  static run(poly) {
    poly.modulesRegister.register(ModuleName.BasisTextureLoader, import("../../../../modules/three/examples/jsm/loaders/BasisTextureLoader"));
    poly.modulesRegister.register(ModuleName.DRACOLoader, import("../../../../modules/three/examples/jsm/loaders/DRACOLoader"));
    poly.modulesRegister.register(ModuleName.EXRLoader, import("../../../../modules/three/examples/jsm/loaders/EXRLoader"));
    poly.modulesRegister.register(ModuleName.FBXLoader, import("../../../../modules/three/examples/jsm/loaders/FBXLoader"));
    poly.modulesRegister.register(ModuleName.GLTFLoader, import("../../../../modules/three/examples/jsm/loaders/GLTFLoader"));
    poly.modulesRegister.register(ModuleName.OBJLoader2, import("../../../../modules/three/examples/jsm/loaders/OBJLoader2"));
    poly.modulesRegister.register(ModuleName.PDBLoader, import("../../../../modules/three/examples/jsm/loaders/PDBLoader"));
    poly.modulesRegister.register(ModuleName.PLYLoader, import("../../../../modules/three/examples/jsm/loaders/PLYLoader"));
    poly.modulesRegister.register(ModuleName.RGBELoader, import("../../../../modules/three/examples/jsm/loaders/RGBELoader"));
    poly.modulesRegister.register(ModuleName.TTFLoader, import("../../../../modules/core/loaders/TTFLoader"));
    poly.modulesRegister.register(ModuleName.SVGLoader, import("../../../../modules/three/examples/jsm/loaders/SVGLoader"));
  }
}
