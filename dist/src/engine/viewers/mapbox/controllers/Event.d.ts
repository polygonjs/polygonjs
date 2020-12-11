import { MapboxViewer } from '../../Mapbox';
export declare class MapboxViewerEventsController {
    private _viewer;
    constructor(_viewer: MapboxViewer);
    init_events(): void;
    private _on_move;
    private _on_moveend;
    private _on_mousemove;
    private _on_mousedown;
    private _on_mouseup;
    camera_node_move_end(): void;
}
