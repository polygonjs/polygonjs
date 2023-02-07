import {PolyEngine} from '../../../engine/Poly';
import {OnNodeRegisterCallback} from '../../../engine/poly/registers/nodes/NodesRegister';
import {MapboxViewer} from '../../../engine/viewers/Mapbox';
import {MapboxPerspectiveCamera} from './MapboxPerspectiveCamera';

export type MapboxCameraObjNodeType = 'mapboxCamera';
export const MAPBOX_CAMERA_OBJ_NODE_TYPE: MapboxCameraObjNodeType = 'mapboxCamera';

export const registerMapboxCamera: OnNodeRegisterCallback = (poly: PolyEngine) => {
	poly.registerCameraNodeType(MAPBOX_CAMERA_OBJ_NODE_TYPE);

	poly.registerCamera<MapboxPerspectiveCamera>(MapboxPerspectiveCamera, (options) => {
		const {camera, scene} = options;
		// since the camera is only created via the obj node for now,
		// we can assume that the path of the camera object and the camera node are the same
		// const cameraPath = CorePath.objectPath(camera);
		// const cameraNode = scene.node(cameraPath) as MapboxCameraObjNode;

		const viewer = new MapboxViewer({
			// cameraNode,
			camera,
			scene,
			updateCameraAspect: (aspect) => {
				camera.aspect = aspect;
				// camera.updateProjectionMatrix();
				// CoreCameraPerspectiveFrameMode.updateCameraAspect(camera, aspect);
			},
		});
		return viewer;
	});
};
