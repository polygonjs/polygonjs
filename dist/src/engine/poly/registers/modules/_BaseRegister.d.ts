export declare enum ModuleName {
    BasisTextureLoader = "BasisTextureLoader",
    DRACOLoader = "DRACOLoader",
    EXRLoader = "EXRLoader",
    FBXLoader = "FBXLoader",
    GLTFLoader = "GLTFLoader",
    OBJLoader2 = "OBJLoader2",
    PDBLoader = "PDBLoader",
    PLYLoader = "PLYLoader",
    RGBELoader = "RGBELoader",
    TTFLoader = "TTFLoader",
    SVGLoader = "SVGLoader"
}
export declare class BaseModulesRegister {
    private _loaded_module_by_name;
    private _promise_by_name;
    register_module(name: ModuleName, promise: Promise<object>): void;
    module(name: ModuleName): Promise<any>;
}
