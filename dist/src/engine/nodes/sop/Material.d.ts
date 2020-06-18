import { TypedSopNode } from './_Base';
import { GlobalsGeometryHandler } from '../gl/code/globals/Geometry';
import { BaseMatNodeType } from '../mat/_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { Material } from 'three/src/materials/Material';
import { Object3D } from 'three/src/core/Object3D';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class MaterialSopParamsConfig extends NodeParamsConfig {
    group: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    material: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    apply_to_children: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    swap_current_tex: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    tex_src0: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    tex_dest0: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
}
export declare class MaterialSopNode extends TypedSopNode<MaterialSopParamsConfig> {
    params_config: MaterialSopParamsConfig;
    static type(): string;
    _param_material: BaseMatNodeType | undefined;
    _globals_handler: GlobalsGeometryHandler;
    static displayed_input_names(): string[];
    initialize_node(): void;
    cook(core_groups: CoreGroup[]): Promise<void>;
    apply_material(object: Object3D, material: Material): void;
    private _swap_textures;
}
export {};
