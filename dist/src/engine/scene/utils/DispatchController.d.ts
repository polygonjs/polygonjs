import { PolyScene } from '../PolyScene';
import { CoreGraphNode } from '../../../core/graph/CoreGraphNode';
import '../../Poly';
import { SceneEvent } from '../../poly/SceneEvent';
import { NodeEvent } from '../../poly/NodeEvent';
import { ParamEvent } from '../../poly/ParamEvent';
interface EventsListener {
    process_events: (emitter: CoreGraphNode, event_name: SceneEvent | NodeEvent | ParamEvent, data?: any) => void;
}
export declare class DispatchController {
    private scene;
    constructor(scene: PolyScene);
    private _events_listener;
    set_listener(events_listener: EventsListener): void;
    get events_listener(): EventsListener | undefined;
    dispatch(emitter: CoreGraphNode, event_name: SceneEvent | NodeEvent | ParamEvent, data?: any): void;
    get emit_allowed(): boolean;
}
export {};
