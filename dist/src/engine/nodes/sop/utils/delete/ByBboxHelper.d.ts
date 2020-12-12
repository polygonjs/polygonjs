import { DeleteSopNode } from '../../Delete';
import { CorePoint } from '../../../../../core/geometry/Point';
export declare class ByBboxHelper {
    private node;
    private _bbox_cache;
    private _point_position;
    constructor(node: DeleteSopNode);
    eval_for_points(points: CorePoint[]): void;
    private get _bbox();
}
