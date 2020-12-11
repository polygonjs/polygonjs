import { BaseController } from './_BaseController';
import { Material } from 'three/src/materials/Material';
import { NodeParamsConfig } from '../../utils/params/ParamsConfig';
import { TypedMatNode } from '../_Base';
export declare function SkinningParamConfig<TBase extends Constructor>(Base: TBase): {
    new (...args: any[]): {
        skinning: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
    };
} & TBase;
declare class SkinnedMaterial extends Material {
    skinning: boolean;
}
declare const SkinningParamsConfig_base: {
    new (...args: any[]): {
        skinning: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
    };
} & typeof NodeParamsConfig;
declare class SkinningParamsConfig extends SkinningParamsConfig_base {
}
declare class SkinningMatNode extends TypedMatNode<SkinnedMaterial, SkinningParamsConfig> {
    create_material(): SkinnedMaterial;
}
export declare class SkinningController extends BaseController {
    protected node: SkinningMatNode;
    constructor(node: SkinningMatNode);
    static update(node: SkinningMatNode): void;
}
export {};
