import { BaseController } from './_BaseController';
import { TypedMatNode } from '../_Base';
import { Material } from 'three/src/materials/Material';
import { Color } from 'three/src/math/Color';
import { NodeParamsConfig } from '../../utils/params/ParamsConfig';
export declare function ColorParamConfig<TBase extends Constructor>(Base: TBase): {
    new (...args: any[]): {
        color: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.COLOR>;
        use_vertex_colors: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        transparent: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        opacity: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.FLOAT>;
        alpha_test: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.FLOAT>;
        use_fog: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
    };
} & TBase;
declare class ColoredMaterial extends Material {
    color: Color;
    vertexColors: boolean;
    transparent: boolean;
    depthTest: boolean;
    alphaTest: number;
    fog: boolean;
}
declare const ColorParamsConfig_base: {
    new (...args: any[]): {
        color: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.COLOR>;
        use_vertex_colors: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        transparent: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        opacity: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.FLOAT>;
        alpha_test: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.FLOAT>;
        use_fog: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
    };
} & typeof NodeParamsConfig;
declare class ColorParamsConfig extends ColorParamsConfig_base {
}
declare class ColoredMatNode extends TypedMatNode<ColoredMaterial, ColorParamsConfig> {
    create_material(): ColoredMaterial;
}
export declare class ColorsController extends BaseController {
    protected node: ColoredMatNode;
    constructor(node: ColoredMatNode);
    static update(node: ColoredMatNode): void;
}
export {};
