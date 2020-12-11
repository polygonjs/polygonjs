import { BaseSopOperation } from './_Base';
import { DefaultOperationParams } from '../_Base';
import { CoreGroup } from '../../geometry/Group';
import { Vector3 } from 'three/src/math/Vector3';
interface IcosahedronSopParams extends DefaultOperationParams {
    radius: number;
    detail: number;
    points_only: boolean;
    center: Vector3;
}
export declare class IcosahedronSopOperation extends BaseSopOperation {
    static readonly DEFAULT_PARAMS: IcosahedronSopParams;
    static type(): Readonly<'icosahedron'>;
    cook(input_contents: CoreGroup[], params: IcosahedronSopParams): CoreGroup;
}
export {};
