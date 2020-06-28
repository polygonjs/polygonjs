import { TypedObjNode } from '../_Base';
import { Matrix4 } from 'three/src/math/Matrix4';
import { SetParamsFromMatrixOptions } from '../../../../core/Transform';
import { Object3D } from 'three/src/core/Object3D';
import { NodeParamsConfig } from '../../utils/params/ParamsConfig';
interface TransformedParamConfigDefaultParams {
    matrix_auto_update?: boolean;
}
export declare function TransformedParamConfig<TBase extends Constructor>(Base: TBase, default_params?: TransformedParamConfigDefaultParams): {
    new (...args: any[]): {
        transform: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.FOLDER>;
        keep_pos_when_parenting: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        rotation_order: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.INTEGER>;
        t: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.VECTOR3>;
        r: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.VECTOR3>;
        s: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.VECTOR3>;
        scale: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.FLOAT>;
        matrix_auto_update: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        tlook_at: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        look_at_pos: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.VECTOR3>;
        up: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.VECTOR3>;
    };
} & TBase;
declare const TransformedParamsConfig_base: {
    new (...args: any[]): {
        transform: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.FOLDER>;
        keep_pos_when_parenting: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        rotation_order: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.INTEGER>;
        t: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.VECTOR3>;
        r: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.VECTOR3>;
        s: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.VECTOR3>;
        scale: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.FLOAT>;
        matrix_auto_update: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        tlook_at: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        look_at_pos: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.VECTOR3>;
        up: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.VECTOR3>;
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
    update(): void;
    update_transform_with_matrix(matrix?: Matrix4): void;
    private _core_transform;
    private _update_matrix_from_params_with_core_transform;
    private _apply_look_at;
    set_params_from_matrix(matrix: Matrix4, options?: SetParamsFromMatrixOptions): void;
    static update_node_transform_params_if_required(node: TransformedObjNode, new_parent_object: Object3D): void;
    private _keep_pos_when_parenting_m_object;
    private _keep_pos_when_parenting_m_new_parent_inv;
    update_node_transform_params_if_required(new_parent_object: Object3D): void;
}
export {};
