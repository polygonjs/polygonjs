import { BaseController } from './_BaseController';
import { Material } from 'three/src/materials/Material';
import { TypedMatNode } from '../_Base';
import { NodeParamsConfig } from '../../utils/params/ParamsConfig';
export declare function SideParamConfig<TBase extends Constructor>(Base: TBase): {
    new (...args: any[]): {
        double_sided: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        front: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
    };
} & TBase;
declare class SidedMaterial extends Material {
    side: number;
}
declare const SideParamsConfig_base: {
    new (...args: any[]): {
        double_sided: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        front: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
    };
} & typeof NodeParamsConfig;
declare class SideParamsConfig extends SideParamsConfig_base {
}
declare class SideMatNode extends TypedMatNode<SidedMaterial, SideParamsConfig> {
    create_material(): SidedMaterial;
}
export declare class SideController extends BaseController {
    protected node: SideMatNode;
    constructor(node: SideMatNode);
    static update(node: SideMatNode): void;
}
export {};
