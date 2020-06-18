import { MapboxViewer } from '../../Mapbox';
import { ThreejsLayer } from '../layers/Threejs';
export declare class MapboxViewerLayersController {
    private _viewer;
    _threejs_layer: ThreejsLayer | undefined;
    constructor(_viewer: MapboxViewer);
    get threejs_layer(): ThreejsLayer | undefined;
    add_layers(): void;
    resize(): void;
    _add_buildings_layer(label_layer_id: string): void;
    _add_threejs_layer(label_layer_id: string): void;
    _has_layer_id(layer_id: string): boolean;
}
