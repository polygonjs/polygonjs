import { Object3D } from 'three/src/core/Object3D';
export declare class CoreLoaderGeometry {
    private url;
    private ext;
    constructor(url: string);
    load(on_success: (objects: Object3D[]) => void, on_error: (error: string) => void): void;
    private load_auto;
    private on_load_success;
    private on_load_succes_gltf;
    private on_load_succes_drc;
    loader_for_ext(): Promise<import("../../../modules/three/examples/jsm/loaders/GLTFLoader").GLTFLoader | import("../../../modules/three/examples/jsm/loaders/DRACOLoader").DRACOLoader | import("../../../modules/three/examples/jsm/loaders/OBJLoader").OBJLoader | undefined>;
    loader_for_gltf(): Promise<import("../../../modules/three/examples/jsm/loaders/GLTFLoader").GLTFLoader>;
    loader_for_glb(): Promise<import("../../../modules/three/examples/jsm/loaders/GLTFLoader").GLTFLoader>;
    loader_for_drc(): Promise<import("../../../modules/three/examples/jsm/loaders/DRACOLoader").DRACOLoader>;
    loader_for_obj(): Promise<import("../../../modules/three/examples/jsm/loaders/OBJLoader").OBJLoader>;
}
