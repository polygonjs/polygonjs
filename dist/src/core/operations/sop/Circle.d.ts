import { BaseSopOperation } from './_Base';
import { DefaultOperationParams } from '../_Base';
import { CoreGroup } from '../../geometry/Group';
import { Vector3 } from 'three/src/math/Vector3';
interface CircleSopParams extends DefaultOperationParams {
    radius: number;
    segments: number;
    open: boolean;
    arc_angle: number;
    direction: Vector3;
}
export declare class CircleSopOperation extends BaseSopOperation {
    static readonly DEFAULT_PARAMS: CircleSopParams;
    static type(): Readonly<'circle'>;
    private _core_transform;
    cook(input_contents: CoreGroup[], params: CircleSopParams): CoreGroup;
    private _create_circle;
    private _create_disk;
}
export {};
