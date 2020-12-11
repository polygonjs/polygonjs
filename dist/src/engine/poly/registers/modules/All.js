import {ModuleName} from "./_BaseRegister";
export class AllModulesRegister {
  static run(poly) {
    poly.modules_register.register_module(ModuleName.BasisTextureLoader, import("../../../../modules/three/examples/jsm/loaders/BasisTextureLoader"));
    poly.modules_register.register_module(ModuleName.DRACOLoader, import("../../../../modules/three/examples/jsm/loaders/DRACOLoader"));
    poly.modules_register.register_module(ModuleName.EXRLoader, import("../../../../modules/three/examples/jsm/loaders/EXRLoader"));
    poly.modules_register.register_module(ModuleName.FBXLoader, import("../../../../modules/three/examples/jsm/loaders/FBXLoader"));
    poly.modules_register.register_module(ModuleName.GLTFLoader, import("../../../../modules/three/examples/jsm/loaders/GLTFLoader"));
    poly.modules_register.register_module(ModuleName.OBJLoader2, import("../../../../modules/three/examples/jsm/loaders/OBJLoader2"));
    poly.modules_register.register_module(ModuleName.PDBLoader, import("../../../../modules/three/examples/jsm/loaders/PDBLoader"));
    poly.modules_register.register_module(ModuleName.PLYLoader, import("../../../../modules/three/examples/jsm/loaders/PLYLoader"));
    poly.modules_register.register_module(ModuleName.RGBELoader, import("../../../../modules/three/examples/jsm/loaders/RGBELoader"));
    poly.modules_register.register_module(ModuleName.TTFLoader, import("../../../../modules/core/loaders/TTFLoader"));
    poly.modules_register.register_module(ModuleName.SVGLoader, import("../../../../modules/three/examples/jsm/loaders/SVGLoader"));
  }
}
