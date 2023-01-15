import {Camera} from 'three';
import {ArrayUtils} from '../ArrayUtils';
import {CoreObject} from '../geometry/Object';

export const CORE_CAMERA_DEFAULT = {
	near: 0.1,
	far: 100.0,
};

export enum CameraAttribute {
	NODE_ID = '_Camera_nodeGeneratorId__',
	CONTROLS_NODE_ID = '_Camera_controlsNodeId',
	CSS_RENDERER_NODE_ID = '_Camera_CSSRendererNodeId',
	FRAME_MODE = '_Camera_frameMode',
	FRAME_MODE_EXPECTED_ASPECT_RATIO = '_Camera_frameModeExpectedAspectRatio',
	POST_PROCESS_NODE_ID = '_Camera_postProcessNodeId',
	RENDER_SCENE_NODE_ID = '_Camera_renderSceneNodeId',
	RENDERER_NODE_ID = '_Camera_rendererNodeId',
	// webXR
	WEBXR_AR = '_Camera_WebXR_AR',
	WEBXR_VR = '_Camera_WebXR_VR',
	WEBXR_FEATURES_OPTIONAL = '_Camera_WebXR_Features_Optional',
	WEBXR_FEATURES_REQUIRED = '_Camera_WebXR_Features_Required',
	WEBXR_OVERRIDE_REFERENCE_SPACE_TYPE = '_Camera_WebXR_overrideReferenceSpaceType',
	WEBXR_REFERENCE_SPACE_TYPE = '_Camera_WebXR_referenceSpaceType',
	// webXR + marker tracking
	WEBXR_AR_MARKER_TRACKING = '_Camera_WebXR_AR_markerTracking',
	WEBXR_AR_MARKER_TRACKING_BAR_CODE_TYPE = '_Camera_WebXR_AR_markerTracking_barCodeType',
	WEBXR_AR_MARKER_TRACKING_BAR_CODE_VALUE = '_Camera_WebXR_AR_markerTracking_barCodeValue',
	WEBXR_AR_MARKER_TRACKING_TRANSFORM_MODE = '_Camera_WebXR_AR_markerTracking_transformMode',
}
export const CAMERA_ATTRIBUTES: CameraAttribute[] = [
	CameraAttribute.NODE_ID,
	CameraAttribute.CONTROLS_NODE_ID,
	CameraAttribute.CSS_RENDERER_NODE_ID,
	CameraAttribute.FRAME_MODE,
	CameraAttribute.FRAME_MODE_EXPECTED_ASPECT_RATIO,
	CameraAttribute.POST_PROCESS_NODE_ID,
	CameraAttribute.RENDER_SCENE_NODE_ID,
	CameraAttribute.RENDERER_NODE_ID,
	CameraAttribute.WEBXR_AR,
	CameraAttribute.WEBXR_VR,
	CameraAttribute.WEBXR_FEATURES_OPTIONAL,
	CameraAttribute.WEBXR_FEATURES_REQUIRED,
	CameraAttribute.WEBXR_OVERRIDE_REFERENCE_SPACE_TYPE,
	CameraAttribute.WEBXR_REFERENCE_SPACE_TYPE,
];
export enum PerspectiveCameraAttribute {
	FOV = '_PerspectiveCamera_fov',
}
export const PERSPECTIVE_CAMERA_ATTRIBUTES: PerspectiveCameraAttribute[] = [PerspectiveCameraAttribute.FOV];
export enum OrthographicCameraAttribute {
	SIZE = '_OrthographicCamera_size',
}
export const ORTHOGRAPHIC_CAMERA_ATTRIBUTES: OrthographicCameraAttribute[] = [OrthographicCameraAttribute.SIZE];

export function serializeCamera<C extends Camera>(camera: C, attributeNames: string[]) {
	return JSON.stringify({
		uuid: camera.uuid,
		attributes: ArrayUtils.compact(
			attributeNames.map((attribName) => {
				const value = CoreObject.attribValue(camera, attribName);
				if (value != null) {
					return {[attribName]: value};
				}
			})
		),
	});
}
