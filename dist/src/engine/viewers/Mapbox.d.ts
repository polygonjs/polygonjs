import { PolyScene } from '../scene/PolyScene';
import { MapboxCameraObjNode } from '../nodes/obj/MapboxCamera';
import { TypedViewer } from './_Base';
import { MapboxViewerEventsController } from './mapbox/controllers/Event';
import mapboxgl from 'mapbox-gl';
import { MapboxViewerLayersController } from './mapbox/controllers/Layers';
export declare class MapboxViewer extends TypedViewer<MapboxCameraObjNode> {
    protected _element: HTMLElement;
    protected _scene: PolyScene;
    protected _camera_node: MapboxCameraObjNode;
    private _canvas_container;
    private _map;
    private _map_loaded;
    readonly layers_controller: MapboxViewerLayersController;
    readonly mapbox_events_controller: MapboxViewerEventsController;
    constructor(_element: HTMLElement, _scene: PolyScene, _camera_node: MapboxCameraObjNode);
    get map_loaded(): boolean;
    get map(): mapboxgl.Map;
    get camera_node(): MapboxCameraObjNode;
    get canvas_container(): HTMLElement;
    on_resize(): void;
    dispose(): void;
    wait_for_map_loaded(): Promise<unknown> | undefined;
    camera_lng_lat(): {
        lng: number;
        lat: number;
    };
    _add_navigation_controls(): void;
    find_canvas(): HTMLCanvasElement;
}
