import { DeleteSopNode } from '../../Delete';
import { CoreObject } from '../../../../../core/geometry/Object';
export declare class ByObjectTypeHelper {
    private node;
    constructor(node: DeleteSopNode);
    eval_for_objects(core_objects: CoreObject[]): void;
}
