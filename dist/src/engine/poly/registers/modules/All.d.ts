import { ModuleName } from './_BaseRegister';
import { BasisTextureLoader } from '../../../../../modules/three/examples/jsm/loaders/BasisTextureLoader';
import { DRACOLoader } from '../../../../../modules/three/examples/jsm/loaders/DRACOLoader';
import { EXRLoader } from '../../../../../modules/three/examples/jsm/loaders/EXRLoader';
import { FBXLoader } from '../../../../../modules/three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from '../../../../../modules/three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader2 } from '../../../../../modules/three/examples/jsm/loaders/OBJLoader2';
import { RGBELoader } from '../../../../../modules/three/examples/jsm/loaders/RGBELoader';
import { TTFLoader } from '../../../../../modules/three/examples/jsm/loaders/TTFLoader';
import { SVGLoader } from '../../../../../modules/three/examples/jsm/loaders/SVGLoader';
export interface ModulesMap extends Dictionary<any> {
    [ModuleName.BasisTextureLoader]: {
        BasisTextureLoader: typeof BasisTextureLoader;
    };
    [ModuleName.DRACOLoader]: {
        DRACOLoader: typeof DRACOLoader;
    };
    [ModuleName.EXRLoader]: {
        EXRLoader: typeof EXRLoader;
    };
    [ModuleName.FBXLoader]: {
        FBXLoader: typeof FBXLoader;
    };
    [ModuleName.GLTFLoader]: {
        GLTFLoader: typeof GLTFLoader;
    };
    [ModuleName.OBJLoader2]: {
        OBJLoader2: typeof OBJLoader2;
    };
    [ModuleName.RGBELoader]: {
        RGBELoader: typeof RGBELoader;
    };
    [ModuleName.TTFLoader]: {
        TTFLoader: typeof TTFLoader;
    };
    [ModuleName.SVGLoader]: {
        SVGLoader: typeof SVGLoader;
    };
}
import { Poly } from '../../../Poly';
export declare class AllModulesRegister {
    static run(poly: Poly): void;
}
