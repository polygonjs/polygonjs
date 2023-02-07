import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Object3D, PerspectiveCamera} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CameraNodeType} from '../../poly/NodeContext';
import {registerMapboxCamera} from '../../../core/thirdParty/Mapbox/registerMapboxCamera';
import {MapboxPerspectiveCamera} from '../../../core/thirdParty/Mapbox/MapboxPerspectiveCamera';
import {CameraAttribute} from '../../../core/camera/CoreCamera';
import {CoreObject} from '../../../core/geometry/Object';
import type {BaseNodeType} from '../../nodes/_Base';
import {MapboxCameraAttribute} from '../../../core/thirdParty/Mapbox/MapboxCameraAttribute';
import mapboxgl from 'mapbox-gl';
import {Poly} from '../../Poly';
import {MAPBOX_TOKEN_MISSING_ERROR_MESSAGE} from '../../poly/thirdParty/Mapbox';

interface MapboxCameraSopParams extends DefaultOperationParams {
	style: string;
	longitude: number;
	latitude: number;
	zoom: number;
	minZoom: number;
	maxZoom: number;
	pitch: number;
	bearing: number;
	allowDragRotate: boolean;
	addZoomControl: boolean;
	tlayerBuildings: boolean;
	tlayer3D: boolean;
	tlayerSky: boolean;
	name: string;
}

export class MapboxCameraSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: MapboxCameraSopParams = {
		style: 'mapbox://styles/mapbox/dark-v10',
		longitude: -0.07956,
		latitude: 51.5146,
		zoom: 15.55,
		minZoom: 0,
		maxZoom: 24,
		pitch: 60,
		bearing: 60.373613,
		allowDragRotate: true,
		addZoomControl: true,
		tlayerBuildings: false,
		tlayer3D: false,
		tlayerSky: false,
		name: CameraNodeType.MAPBOX,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<CameraNodeType.MAPBOX> {
		return CameraNodeType.MAPBOX;
	}
	static override onRegister = registerMapboxCamera;
	override async cook(inputCoreGroups: CoreGroup[], params: MapboxCameraSopParams) {
		const camera = MapboxCameraSopOperation.createCamera(this._node);
		camera.name = params.name || CameraNodeType.MAPBOX;

		const token = await Poly.thirdParty.mapbox().token();
		if (token) {
			mapboxgl.accessToken = token;
		} else {
			this._node?.states.error.set(MAPBOX_TOKEN_MISSING_ERROR_MESSAGE);
		}

		// camera.position.copy(params.position);
		// camera.rotation.set(
		// 	MathUtils.degToRad(params.rotation.x),
		// 	MathUtils.degToRad(params.rotation.y),
		// 	MathUtils.degToRad(params.rotation.z)
		// );

		// this needs to be .updateWorldMatrix and not .updateMatrix
		// as otherwise the camera appears to behave find in most cases,
		// except when using the sop/cameraRenderScene
		// camera.updateWorldMatrix(false, false);
		// camera.updateProjectionMatrix();
		// camera.matrixAutoUpdate = params.matrixAutoUpdate;

		MapboxCameraSopOperation.setCameraAttributes(camera, params);

		const objects: Object3D[] = [camera];
		return this.createCoreGroupFromObjects(objects);
	}
	static createCamera(nodeGenerator?: BaseNodeType) {
		const camera = new MapboxPerspectiveCamera();
		if (nodeGenerator) {
			CoreObject.addAttribute(camera, CameraAttribute.NODE_ID, nodeGenerator.graphNodeId());
		}
		return camera;
	}
	static setCameraAttributes(camera: PerspectiveCamera, params: MapboxCameraSopParams) {
		CoreObject.addAttribute(camera, MapboxCameraAttribute.STYLE, params.style);
		CoreObject.addAttribute(camera, MapboxCameraAttribute.LONGITUDE, params.longitude);
		CoreObject.addAttribute(camera, MapboxCameraAttribute.LATITUDE, params.latitude);
		CoreObject.addAttribute(camera, MapboxCameraAttribute.ZOOM, params.zoom);
		CoreObject.addAttribute(camera, MapboxCameraAttribute.MIN_ZOOM, params.minZoom);
		CoreObject.addAttribute(camera, MapboxCameraAttribute.MAX_ZOOM, params.maxZoom);
		CoreObject.addAttribute(camera, MapboxCameraAttribute.PITCH, params.pitch);
		CoreObject.addAttribute(camera, MapboxCameraAttribute.BEARING, params.bearing);
		CoreObject.addAttribute(camera, MapboxCameraAttribute.ALLOW_DRAG_ROTATE, params.allowDragRotate);
		CoreObject.addAttribute(camera, MapboxCameraAttribute.ADD_ZOOM_CONTROL, params.addZoomControl);
		CoreObject.addAttribute(camera, MapboxCameraAttribute.LAYER_BUILDINGS, params.tlayerBuildings);
		CoreObject.addAttribute(camera, MapboxCameraAttribute.LAYER_3D, params.tlayer3D);
		CoreObject.addAttribute(camera, MapboxCameraAttribute.LAYER_SKY, params.tlayerSky);
	}
}
