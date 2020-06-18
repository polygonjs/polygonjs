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
        rotation_order: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.INTEGER>;
        t: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.VECTOR3>;
        r: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.VECTOR3>;
        s: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.VECTOR3>;
        scale: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.FLOAT>;
        matrix_auto_update: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
    };
} & TBase;
declare const TransformedParamsConfig_base: {
    new (...args: any[]): {
        transform: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.FOLDER>;
        rotation_order: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.INTEGER>;
        t: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.VECTOR3>;
        r: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.VECTOR3>;
        s: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.VECTOR3>;
        scale: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.FLOAT>;
        matrix_auto_update: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
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
    update(matrix?: Matrix4): void;
    update_transform_with_matrix(matrix?: Matrix4): void;
    private _core_transform;
    private _update_matrix_from_params_with_core_transform;
    set_params_from_matrix(matrix: Matrix4, options?: SetParamsFromMatrixOptions): void;
}
export {};
