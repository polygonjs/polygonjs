import { BaseSopOperation } from './_Base';
import { CoreGroup } from '../../geometry/Group';
import { Vector3 } from 'three/src/math/Vector3';
import { DefaultOperationParams } from '../_Base';
import { InputCloneMode } from '../../../engine/poly/InputCloneMode';
interface TransformSopParams extends DefaultOperationParams {
    apply_on: number;
    group: string;
    rotation_order: number;
    t: Vector3;
    r: Vector3;
    s: Vector3;
    scale: number;
    pivot: Vector3;
}
export declare class TransformSopOperation extends BaseSopOperation {
    static readonly DEFAULT_PARAMS: TransformSopParams;
    static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
    static type(): Readonly<'transform'>;
    private _core_transform;
    cook(input_contents: CoreGroup[], params: TransformSopParams): CoreGroup;
    private _apply_transform;
    private _apply_matrix_to_geometries;
    private _object_position;
    private _apply_matrix_to_objects;
}
export {};
