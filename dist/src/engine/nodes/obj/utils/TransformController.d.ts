import { Matrix4 } from 'three/src/math/Matrix4';
import { SetParamsFromMatrixOptions } from '../../../../core/Transform';
import { NodeParamsConfig } from '../../utils/params/ParamsConfig';
import { TypedObjNode, BaseObjNodeType } from '../_Base';
import { Object3D } from 'three/src/core/Object3D';
export declare function TransformedParamConfig<TBase extends Constructor>(Base: TBase): {
    new (...args: any[]): {
        transform: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.FOLDER>;
        t: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.VECTOR3>;
        r: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.VECTOR3>;
        s: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.VECTOR3>;
        scale: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.FLOAT>;
    };
} & TBase;
declare const TransformedParamsConfig_base: {
    new (...args: any[]): {
        transform: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.FOLDER>;
        t: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.VECTOR3>;
        r: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.VECTOR3>;
        s: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.VECTOR3>;
        scale: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.FLOAT>;
    };
} & typeof NodeParamsConfig;
declare class TransformedParamsConfig extends TransformedParamsConfig_base {
}
export declare class TransformedObjNode extends TypedObjNode<Object3D, TransformedParamsConfig> {
    readonly transform_controller: TransformController;
}
export declare class TransformController {
    private node;
    constructor(node: TransformedObjNode);
    initialize_node(): void;
    private _cook_main_without_inputs_when_dirty_bound;
    private _cook_main_without_inputs_when_dirty;
    static on_input_updated(node: BaseObjNodeType): void;
    on_input_updated(): void;
    update(matrix?: Matrix4): void;
    update_transform_with_matrix(matrix?: Matrix4): void;
    private _update_transform_from_params_scale;
    update_transform_from_params(): void;
    set_params_from_matrix(matrix: Matrix4, options?: SetParamsFromMatrixOptions): void;
}
export {};
