import { DeleteSopNode } from '../../Delete';
import { CoreEntity } from '../../../../../core/geometry/Entity';
export declare class EntitySelectionHelper {
    protected node: DeleteSopNode;
    readonly selected_state: Map<CoreEntity, boolean>;
    private _entities_count;
    private _selected_entities_count;
    constructor(node: DeleteSopNode);
    init(entities: CoreEntity[]): void;
    select(entity: CoreEntity): void;
    entities_to_keep(): CoreEntity[];
    entities_to_delete(): CoreEntity[];
    private _entities_for_state;
}
