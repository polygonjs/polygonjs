import { PolyScene } from '../PolyScene';
import { CoreGraphNode } from '../../../core/graph/CoreGraphNode';
import '../../Poly';
import { SceneEvent } from '../../poly/SceneEvent';
import { NodeEvent } from '../../poly/NodeEvent';
import { ParamEvent } from '../../poly/ParamEvent';
interface EventsListener {
    process_events: (emitter: CoreGraphNode, event_name: SceneEvent | NodeEvent | ParamEvent, data?: any) => void;
}
declare type OnAddListenerCallback = () => void;
export declare class DispatchController {
    private scene;
    private _on_add_listener_callbacks;
    constructor(scene: PolyScene);
    private _events_listener;
    set_listener(events_listener: EventsListener): void;
    on_add_listener(callback: OnAddListenerCallback): void;
    private run_on_add_listener_callbacks;
    get events_listener(): EventsListener | undefined;
    dispatch(emitter: CoreGraphNode, event_name: SceneEvent | NodeEvent | ParamEvent, data?: any): void;
    get emit_allowed(): boolean;
}
export {};
