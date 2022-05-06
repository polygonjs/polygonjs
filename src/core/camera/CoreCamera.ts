export const CORE_CAMERA_DEFAULT = {
	near: 0.1,
	far: 100.0,
};

export enum CameraAttribute {
	CONTROLS_PATH = '_Camera_controlsPath',
	CSS_RENDERER_PATH = '_Camera_CSSRendererPath',
	FRAME_MODE = '_Camera_frameMode',
	FRAME_MODE_EXPECTED_ASPECT_RATIO = '_Camera_frameModeExpectedAspectRatio',
	POST_PROCESS_PATH = '_Camera_postProcessPath',
	RENDER_SCENE_PATH = '_Camera_renderScenePath',
	RENDERER_PATH = '_Camera_rendererPath',
}
export enum PerspectiveCameraAttribute {
	FOV = '_PerspectiveCamera_fov',
}
export enum OrthographicCameraAttribute {
	SIZE = '_OrthographicCamera_size',
}
