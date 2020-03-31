import { BaseEventNodeType } from '../../../nodes/event/_Base';
import { BaseCameraObjNodeType } from '../../../nodes/obj/_BaseCamera';
export declare abstract class BaseEventsController<E extends Event, T extends BaseEventNodeType> {
    protected _nodes_by_graph_node_id: Map<string, T>;
    register_node(node: T): void;
    unregister_node(node: T): void;
    abstract accepts_event(event: Event): boolean;
    process(event: E, canvas: HTMLCanvasElement, camera_node: BaseCameraObjNodeType): void;
}
