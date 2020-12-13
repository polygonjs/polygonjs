import { MapboxCameraObjNode } from '../../../nodes/obj/MapboxCamera';
import { MapboxViewer } from '../../Mapbox';
import { Scene } from 'three/src/scenes/Scene';
import mapboxgl from 'mapbox-gl';
export declare class ThreejsLayer {
    private _camera_node;
    private _display_scene;
    private _viewer;
    readonly id: string;
    readonly type: 'custom';
    readonly renderingMode: '3d';
    private _camera;
    private _renderer;
    private _map;
    private _gl;
    constructor(_camera_node: MapboxCameraObjNode, _display_scene: Scene, _viewer: MapboxViewer);
    onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext): void;
    create_renderer(): void;
    onRemove(): void;
    resize(): void;
    render(gl: WebGLRenderingContext, matrix: number[]): void;
    _update_camera_matrix2(gl: WebGLRenderingContext, matrix: number[]): void;
}
