import { BaseSopOperation } from './_Base';
import { DefaultOperationParams } from '../_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { Vector3 } from 'three/src/math/Vector3';
interface AddSopParams extends DefaultOperationParams {
    create_point: boolean;
    points_count: number;
    position: Vector3;
    open: boolean;
    connect_to_last_point: boolean;
}
export declare class AddSopOperation extends BaseSopOperation {
    static readonly DEFAULT_PARAMS: AddSopParams;
    static type(): Readonly<'add'>;
    cook(input_contents: CoreGroup[], params: AddSopParams): CoreGroup;
    private _create_point;
}
export {};
