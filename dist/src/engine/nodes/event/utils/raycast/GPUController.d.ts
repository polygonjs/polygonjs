import { EventContext } from '../../../../scene/utils/events/_BaseEventsController';
import { RaycastEventNode } from '../../Raycast';
export declare class RaycastGPUController {
    private _node;
    private _resolved_material;
    private _restore_context;
    private _mouse;
    private _mouse_array;
    private _render_target;
    private _read;
    private _param_read;
    constructor(_node: RaycastEventNode);
    process_event(context: EventContext<MouseEvent>): void;
    private _modify_scene_and_renderer;
    private _restore_scene_and_renderer;
    update_material(): void;
    static PARAM_CALLBACK_update_material(node: RaycastEventNode): void;
}
