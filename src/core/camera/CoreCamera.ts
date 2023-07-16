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
	VIEWER_ID = '_Camera_viewerId',
	// VIEWER_SHADOW_ROOT = '_Camera_viewerShadowRoot',
	VIEWER_HTML = '_Camera_viewerHTML',
	// webXR
	WEBXR_AR = '_Camera_WebXR_AR',
	WEBXR_VR = '_Camera_WebXR_VR',
	// AR and VR attributes should be 2 different sets
	// to ensure that there will be no conflict
	// when a camera is set up with both
	WEBXR_AR_FEATURES_OPTIONAL = '_Camera_WebXR_AR_Features_Optional',
	WEBXR_AR_FEATURES_REQUIRED = '_Camera_WebXR_AR_Features_Required',
	WEBXR_AR_OVERRIDE_REFERENCE_SPACE_TYPE = '_Camera_WebXR_AR_overrideReferenceSpaceType',
	WEBXR_AR_REFERENCE_SPACE_TYPE = '_Camera_WebXR_AR_referenceSpaceType',
	WEBXR_VR_FEATURES_OPTIONAL = '_Camera_WebXR_VR_Features_Optional',
	WEBXR_VR_FEATURES_REQUIRED = '_Camera_WebXR_VR_Features_Required',
	WEBXR_VR_OVERRIDE_REFERENCE_SPACE_TYPE = '_Camera_WebXR_VR_overrideReferenceSpaceType',
	WEBXR_VR_REFERENCE_SPACE_TYPE = '_Camera_WebXR_VR_referenceSpaceType',
	// webXR + marker tracking
	WEBXR_AR_MARKER_TRACKING = '_Camera_WebXR_AR_markerTracking',
	WEBXR_AR_MARKER_TRACKING_SOURCE_MODE = '_Camera_WebXR_AR_markerTracking_sourceMode',
	WEBXR_AR_MARKER_TRACKING_SOURCE_URL = '_Camera_WebXR_AR_markerTracking_sourceUrl',
	WEBXR_AR_MARKER_TRACKING_BAR_CODE_TYPE = '_Camera_WebXR_AR_markerTracking_barCodeType',
	WEBXR_AR_MARKER_TRACKING_BAR_CODE_VALUE = '_Camera_WebXR_AR_markerTracking_barCodeValue',
	WEBXR_AR_MARKER_TRACKING_TRANSFORM_MODE = '_Camera_WebXR_AR_markerTracking_transformMode',
	WEBXR_AR_MARKER_TRACKING_SMOOTH = '_Camera_WebXR_AR_markerTracking_smooth',
	WEBXR_AR_MARKER_TRACKING_SMOOTH_COUNT = '_Camera_WebXR_AR_markerTracking_smoothCount',
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
	CameraAttribute.WEBXR_AR_FEATURES_OPTIONAL,
	CameraAttribute.WEBXR_AR_FEATURES_REQUIRED,
	CameraAttribute.WEBXR_AR_OVERRIDE_REFERENCE_SPACE_TYPE,
	CameraAttribute.WEBXR_AR_REFERENCE_SPACE_TYPE,
	CameraAttribute.WEBXR_VR_FEATURES_OPTIONAL,
	CameraAttribute.WEBXR_VR_FEATURES_REQUIRED,
	CameraAttribute.WEBXR_VR_OVERRIDE_REFERENCE_SPACE_TYPE,
	CameraAttribute.WEBXR_VR_REFERENCE_SPACE_TYPE,
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
