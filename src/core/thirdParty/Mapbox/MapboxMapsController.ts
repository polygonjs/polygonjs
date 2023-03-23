import mapboxgl from 'mapbox-gl';
import {Camera} from 'three';
import {CoreObject} from '../../geometry/Object';
import {PolyScene} from '../../../engine/scene/PolyScene';
import {MapboxCameraAttribute} from './MapboxCameraAttribute';
import {MapboxLayersController, LayersOptions} from './LayersController';
import {ThreejsLayerRenderFunc} from './layers/MapboxThreejsLayer';
import {MapboxViewer} from '../../../engine/viewers/Mapbox';
import {NodeContext} from '../../../engine/poly/NodeContext';
import {JsType} from '../../../engine/poly/registers/nodes/types/Js';
interface CreateMapboxMapOptions {
	camera: Camera;
	container: HTMLElement;
	scene: PolyScene;
	renderFunc: ThreejsLayerRenderFunc;
	viewer: MapboxViewer;
}
type MapRegisterCallback = (value: mapboxgl.Map) => void;

// const CAMERA_MOVE_EVENT: Event = {
// 	type: 'cameraMove',
// };

class MapboxMapsControllerClass {
	private static _instance: MapboxMapsControllerClass;

	static instance() {
		return (this._instance = this._instance || new MapboxMapsControllerClass());
	}
	private constructor() {}

	private _scene: PolyScene | undefined;
	private _mapByCameraName: Map<string, mapboxgl.Map> = new Map();
	private _lastCreatedMap: mapboxgl.Map | undefined;
	private _resolves: MapRegisterCallback[] = [];
	async waitForMap(): Promise<mapboxgl.Map> {
		if (this._lastCreatedMap) {
			return this._lastCreatedMap;
		} else {
			return new Promise((resolve, reject) => {
				this._resolves.push(resolve);
			});
		}
	}
	private _styleFlushed = false;
	private _flushCallbacksWithMap(map: mapboxgl.Map) {
		if (this._styleFlushed) {
			return;
		}
		this._styleFlushed = true;
		const callbacks: MapRegisterCallback[] = [...this._resolves];
		this._resolves.length = 0;
		for (let c of callbacks) {
			c(map);
		}
	}

	createMap(options: CreateMapboxMapOptions) {
		const {camera, container, scene, renderFunc, viewer} = options;
		this._scene = scene;
		const style = CoreObject.attribValue(camera, MapboxCameraAttribute.STYLE) as string;
		const longitude = CoreObject.attribValue(camera, MapboxCameraAttribute.LONGITUDE) as number;
		const latitude = CoreObject.attribValue(camera, MapboxCameraAttribute.LATITUDE) as number;
		const zoom = CoreObject.attribValue(camera, MapboxCameraAttribute.ZOOM) as number;
		const minZoom = CoreObject.attribValue(camera, MapboxCameraAttribute.MIN_ZOOM) as number;
		const maxZoom = CoreObject.attribValue(camera, MapboxCameraAttribute.MAX_ZOOM) as number;
		const pitch = CoreObject.attribValue(camera, MapboxCameraAttribute.PITCH) as number;
		const bearing = CoreObject.attribValue(camera, MapboxCameraAttribute.BEARING) as number;

		const allowDragRotate = CoreObject.attribValue(camera, MapboxCameraAttribute.ALLOW_DRAG_ROTATE) as boolean;
		const addZoomControl = CoreObject.attribValue(camera, MapboxCameraAttribute.ADD_ZOOM_CONTROL) as boolean;
		const tlayerBuildings = CoreObject.attribValue(camera, MapboxCameraAttribute.LAYER_BUILDINGS) as boolean;
		const tlayer3D = CoreObject.attribValue(camera, MapboxCameraAttribute.LAYER_3D) as boolean;
		const tlayerSky = CoreObject.attribValue(camera, MapboxCameraAttribute.LAYER_SKY) as boolean;

		const mapOptions: mapboxgl.MapboxOptions = {
			style,
			container,
			center: [longitude, latitude],
			zoom,
			minZoom,
			maxZoom,
			pitch,
			bearing,
			// preserveDrawingBuffer: true,
			dragRotate: allowDragRotate,
			pitchWithRotate: allowDragRotate,
			antialias: true,
			interactive: true,
			// useWebGL2: true,
		};
		// webgl2 required since three 150 addition of textureLod in common.glsl
		(mapOptions as any).useWebGL2 = true;
		const map = new mapboxgl.Map(mapOptions);

		const layersOptions: LayersOptions = {
			map,
			scene,
			camera,
			renderFunc,
			viewer,
			lngLat: {
				lng: longitude,
				lat: latitude,
			},
			displayScene: scene.threejsScene(),
			zoomControls: addZoomControl,
			layer3D: tlayer3D,
			layerBuildings: tlayerBuildings,
			layerSky: tlayerSky,
		};
		const layersController = new MapboxLayersController(layersOptions);
		map.on('load', () => {
			layersController.addLayers();
			// this.mapboxEventController.camera_node_move_end(); // to update mapbox planes
			window.dispatchEvent(new Event('resize')); // helps making sure it is resized correctly
		});

		map.on('styledata', () => {
			// console.log('A styledata event occurred.', map.isStyleLoaded());
			if (map.isStyleLoaded()) {
				if (!this._styleFlushed && this._lastCreatedMap) {
					this._flushCallbacksWithMap(this._lastCreatedMap);
				}
			}
		});
		map.on('move', () => this._dispatchCameraMove(JsType.ON_MAPBOX_CAMERA_MOVE));
		map.on('movestart', () => this._dispatchCameraMove(JsType.ON_MAPBOX_CAMERA_MOVE_START));
		map.on('moveend', () => this._dispatchCameraMove(JsType.ON_MAPBOX_CAMERA_MOVE_END));
		// map.on('styledataloading', () => {
		// 	console.log('A styledataloading event occurred.', map.isStyleLoaded());
		// });

		// this._updateCameraAttributes();
		// this._addRemoveControls(map, container.id);

		// this._maps_by_container_id.set(container.id, map);
		// this._map_containers_by_container_id.set(container.id, container);
		// this._canvases_by_container_id.set(container.id, container.querySelector('canvas')!);

		this._mapByCameraName.set(camera.name, map);
		this._lastCreatedMap = map;
		// if (this._mapByCameraName.size == 1) {
		// 	this._flushCallbacksWithMap(map);
		// }

		return {map, layersController};
	}
	private _dispatchCameraMove(
		type: JsType.ON_MAPBOX_CAMERA_MOVE | JsType.ON_MAPBOX_CAMERA_MOVE_START | JsType.ON_MAPBOX_CAMERA_MOVE_END
	) {
		// this.dispatchEvent(CAMERA_MOVE_EVENT);
		if (!this._scene) {
			return;
		}
		if (!this._scene.nodesController.hasNodesByContextAndType(NodeContext.ACTOR, type)) {
			return;
		}
		this._scene.threejsScene().traverse((object) => {
			this._scene?.actorsManager.triggerEventNodes(object, type);
		});
	}
}
export const MapboxMapsController = MapboxMapsControllerClass.instance();
