import {Constructor} from '../../../types/GlobalTypes';
import {ParamConfig} from '../../../engine/nodes/utils/params/ParamsConfig';
import {
	CoreCameraARjsControllerConfig,
	ARJS_BAR_CODE_TYPES,
	ARjsBarCodeType,
	BAR_CODES_COUNT_BY_TYPE,
	ARJS_TRANSFORM_MODES,
	ArjsTransformMode,
} from '../../webXR/arjs/Common';
import {CoreObject} from '../../geometry/Object';
import {CameraAttribute} from '../CoreCamera';
import {PolyScene} from '../../../engine/scene/PolyScene';
import {CameraWebXRARTrackMarkerSopOperation} from '../../../engine/operations/sop/CameraWebXRARTrackMarker';
import {IntegerParamOptions} from '../../../engine/params/utils/OptionsController';
import {CoreType} from '../../Type';
import {Camera} from 'three';

const DEFAULT = CameraWebXRARTrackMarkerSopOperation.DEFAULT_PARAMS;

function _paramOptions(barCodeType: ARjsBarCodeType): IntegerParamOptions {
	return {
		range: [0, BAR_CODES_COUNT_BY_TYPE[barCodeType]],
		rangeLocked: [true, true],
		visibleIf: {barCodeType: ARJS_BAR_CODE_TYPES.indexOf(barCodeType)},
	};
}

export function CoreCameraTrackMarkerParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param transformMode */
		transformMode = ParamConfig.INTEGER(DEFAULT.transformMode, {
			menu: {
				entries: ARJS_TRANSFORM_MODES.map((name, value) => ({name, value})),
			},
		});
		/** @param barcode type */
		barCodeType = ParamConfig.INTEGER(DEFAULT.barCodeType, {
			menu: {
				entries: ARJS_BAR_CODE_TYPES.map((name, value) => ({name, value})),
			},
		});
		/** @param barcode value */
		barCodeValue_3x3 = ParamConfig.INTEGER(DEFAULT.barCodeValue_3x3, _paramOptions(ARjsBarCodeType._3x3));
		/** @param barcode value */
		barCodeValue_3x3_hamming63 = ParamConfig.INTEGER(
			DEFAULT.barCodeValue_3x3_hamming63,
			_paramOptions(ARjsBarCodeType._3x3_HAMMING63)
		);
		/** @param barcode value */
		barCodeValue_3x3_parity65 = ParamConfig.INTEGER(
			DEFAULT.barCodeValue_3x3_parity65,
			_paramOptions(ARjsBarCodeType._3x3_PARITY65)
		);
		/** @param barcode value */
		barCodeValue_4x4_bch_13_5_5 = ParamConfig.INTEGER(
			DEFAULT.barCodeValue_4x4_bch_13_5_5,
			_paramOptions(ARjsBarCodeType._4x4_BCH_13_5_5)
		);
		/** @param barcode value */
		barCodeValue_4x4_bch_13_9_3 = ParamConfig.INTEGER(
			DEFAULT.barCodeValue_4x4_bch_13_9_3,
			_paramOptions(ARjsBarCodeType._4x4_BCH_13_9_3)
		);
	};
}

interface ARjsControllerOptions {
	camera: Camera;
	scene: PolyScene;
	// renderer: WebGLRenderer;
	canvas: HTMLCanvasElement;
}

export class CoreCameraTrackMarkerController {
	static process(options: ARjsControllerOptions): CoreCameraARjsControllerConfig | undefined {
		const {canvas, scene, camera} = options;

		const isARjsTrackMarker = CoreObject.attribValue(camera, CameraAttribute.WEBXR_AR_TRACK_MARKER) as
			| boolean
			| null;
		if (!isARjsTrackMarker) {
			return;
		}

		const barCodeType = CoreObject.attribValue(camera, CameraAttribute.WEBXR_AR_TRACK_MARKER_BAR_CODE_TYPE) as
			| string
			| null;
		const barCodeValue = CoreObject.attribValue(camera, CameraAttribute.WEBXR_AR_TRACK_MARKER_BAR_CODE_VALUE) as
			| number
			| null;
		const transformMode = CoreObject.attribValue(camera, CameraAttribute.WEBXR_AR_TRACK_MARKER_TRANSFORM_MODE) as
			| number
			| null;

		if (barCodeType == null || barCodeValue == null || transformMode == null) {
			return;
		}
		if (!CoreType.isString(barCodeType)) {
			return;
		}
		if (!CoreType.isString(transformMode)) {
			return;
		}
		if (!ARJS_BAR_CODE_TYPES.includes(barCodeType as ARjsBarCodeType)) {
			return;
		}
		if (!ARJS_TRANSFORM_MODES.includes(transformMode as ArjsTransformMode)) {
			return;
		}
		if (!CoreType.isNumber(barCodeValue)) {
			return;
		}

		const controller = scene.arjs.createController({
			canvas,
			camera,
			scene: scene.threejsScene(),
			barCode: {
				type: barCodeType as ARjsBarCodeType,
				value: barCodeValue,
			},
			transformMode: transformMode as ArjsTransformMode,
		});

		return controller?.config();
	}
}
