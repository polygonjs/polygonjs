import {Constructor} from '../../../types/GlobalTypes';
import {ParamConfig} from '../../../engine/nodes/utils/params/ParamsConfig';
import {
	MarkerTrackingControllerConfig,
	MARKER_TRACKING_TRANSFORM_MODES,
	MarkerTrackingTransformMode,
} from '../../webXR/markerTracking/Common';
import {CoreObject} from '../../geometry/Object';
import {CameraAttribute} from '../CoreCamera';
import {PolyScene} from '../../../engine/scene/PolyScene';
import {CameraWebXRARMarkerTrackingSopOperation} from '../../../engine/operations/sop/CameraWebXRARMarkerTracking';
import {CoreType} from '../../Type';
import {Camera} from 'three';
import {Poly} from '../../../engine/Poly';

const DEFAULT = CameraWebXRARMarkerTrackingSopOperation.DEFAULT_PARAMS;

export function CoreCameraMarkerTrackingParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param transformMode */
		transformMode = ParamConfig.INTEGER(DEFAULT.transformMode, {
			menu: {
				entries: MARKER_TRACKING_TRANSFORM_MODES.map((name, value) => ({name, value})),
			},
		});
		/** @param barcode type */
		barCodeType = ParamConfig.STRING(DEFAULT.barCodeType, {
			menuString: {
				entries: Poly.markerTracking.barCodeTypes().map((name, value) => ({name, value: name})),
			},
		});
		/** @param barcode value */
		barCodeValue = ParamConfig.INTEGER(DEFAULT.barCodeValue, {
			range: [0, 511],
			rangeLocked: [true, true],
		});
	};
}

interface MarkerTrackingControllerOptions {
	camera: Camera;
	scene: PolyScene;
	// renderer: WebGLRenderer;
	canvas: HTMLCanvasElement;
}

export class CoreCameraMarkerTrackingController {
	static process(options: MarkerTrackingControllerOptions): MarkerTrackingControllerConfig | undefined {
		const {canvas, scene, camera} = options;

		const isARjsTrackMarker = CoreObject.attribValue(camera, CameraAttribute.WEBXR_AR_MARKER_TRACKING) as
			| boolean
			| null;
		if (!isARjsTrackMarker) {
			return;
		}

		const barCodeType = CoreObject.attribValue(camera, CameraAttribute.WEBXR_AR_MARKER_TRACKING_BAR_CODE_TYPE) as
			| string
			| null;
		const barCodeValue = CoreObject.attribValue(camera, CameraAttribute.WEBXR_AR_MARKER_TRACKING_BAR_CODE_VALUE) as
			| number
			| null;
		const transformMode = CoreObject.attribValue(
			camera,
			CameraAttribute.WEBXR_AR_MARKER_TRACKING_TRANSFORM_MODE
		) as number | null;

		if (barCodeType == null || barCodeValue == null || transformMode == null) {
			return;
		}
		if (!CoreType.isString(barCodeType)) {
			return;
		}
		if (!CoreType.isString(transformMode)) {
			return;
		}
		if (!Poly.markerTracking.barCodeTypes().includes(barCodeType)) {
			return;
		}
		if (!MARKER_TRACKING_TRANSFORM_MODES.includes(transformMode as MarkerTrackingTransformMode)) {
			return;
		}
		if (!CoreType.isNumber(barCodeValue)) {
			return;
		}

		const controller = Poly.markerTracking.createController({
			canvas,
			camera,
			scene: scene.threejsScene(),
			barCode: {
				type: barCodeType,
				value: barCodeValue,
			},
			transformMode: transformMode as MarkerTrackingTransformMode,
		});

		return controller?.config();
	}
}
