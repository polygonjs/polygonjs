import {Constructor} from '../../../types/GlobalTypes';
import {ParamConfig} from '../../../engine/nodes/utils/params/ParamsConfig';
import {
	MarkerTrackingControllerConfig,
	MarkerTrackingSourceMode,
	MARKER_TRACKING_SOURCE_MODES,
	MARKER_TRACKING_TRANSFORM_MODES,
	MarkerTrackingTransformMode,
} from '../../webXR/markerTracking/Common';
import {CameraAttribute} from '../CoreCamera';
import {PolyScene} from '../../../engine/scene/PolyScene';
import {CameraWebXRARMarkerTrackingSopOperation} from '../../../engine/operations/sop/CameraWebXRARMarkerTracking';
import {isString, isNumber} from '../../Type';
import {Camera} from 'three';
import {Poly} from '../../../engine/Poly';
import {EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT} from '../../loader/FileExtensionRegister';
import {CameraSopNodeType, NodeContext} from '../../../engine/poly/NodeContext';
import {coreObjectClassFactory} from '../../geometry/CoreObjectFactory';

const DEFAULT = CameraWebXRARMarkerTrackingSopOperation.DEFAULT_PARAMS;

export function CoreCameraMarkerTrackingParamConfig<TBase extends Constructor>(Base: TBase) {
	// the default bar code value is set here instead of taking it from the operation
	// as it would otherwise be set to an invalid value, since the operation is defined before
	// the plugin is loaded
	const defaultBarCodeType = Poly.thirdParty.markerTracking().barCodeTypes()[0];
	return class Mixin extends Base {
		/** @param select if you want to use the webcam or an image/video as tracking source */
		sourceMode = ParamConfig.INTEGER(DEFAULT.sourceMode, {
			menu: {
				entries: MARKER_TRACKING_SOURCE_MODES.map((name, value) => ({name, value})),
			},
		});
		/** @param image or video url */
		sourceUrl = ParamConfig.STRING(DEFAULT.sourceUrl, {
			fileBrowse: {
				extensions:
					EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT[NodeContext.COP][CameraSopNodeType.WEBXR_AR_MARKER_TRACKING],
			},
			visibleIf: [
				{sourceMode: MARKER_TRACKING_SOURCE_MODES.indexOf(MarkerTrackingSourceMode.IMAGE)},
				{sourceMode: MARKER_TRACKING_SOURCE_MODES.indexOf(MarkerTrackingSourceMode.VIDEO)},
			],
		});
		/** @param transformMode */
		transformMode = ParamConfig.INTEGER(DEFAULT.transformMode, {
			menu: {
				entries: MARKER_TRACKING_TRANSFORM_MODES.map((name, value) => ({name, value})),
			},
		});
		/** @param smooth */
		smooth = ParamConfig.BOOLEAN(DEFAULT.smooth, {
			separatorBefore: true,
		});
		/** @param  smooth count */
		smoothCount = ParamConfig.INTEGER(DEFAULT.smoothCount, {
			range: [0, 10],
			rangeLocked: [true, false],
		});
		/** @param barcode type */
		barCodeType = ParamConfig.STRING(defaultBarCodeType, {
			separatorBefore: true,
			menuString: {
				entries: Poly.thirdParty
					.markerTracking()
					.barCodeTypes()
					.map((name, value) => ({name, value: name})),
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
	onError: (errorMessage: string) => void;
}

export class CoreCameraMarkerTrackingController {
	static process(options: MarkerTrackingControllerOptions): MarkerTrackingControllerConfig | undefined {
		const {canvas, scene, camera, onError} = options;
		const coreObjectClass = coreObjectClassFactory(camera);
		const isARjsTrackMarker = coreObjectClass.attribValue(camera, CameraAttribute.WEBXR_AR_MARKER_TRACKING) as
			| boolean
			| null;
		if (!isARjsTrackMarker) {
			return;
		}
		const sourceMode = coreObjectClass.attribValue(
			camera,
			CameraAttribute.WEBXR_AR_MARKER_TRACKING_SOURCE_MODE
		) as MarkerTrackingSourceMode | null;
		const sourceUrl = coreObjectClass.attribValue(camera, CameraAttribute.WEBXR_AR_MARKER_TRACKING_SOURCE_URL) as
			| string
			| undefined;

		const barCodeType = coreObjectClass.attribValue(
			camera,
			CameraAttribute.WEBXR_AR_MARKER_TRACKING_BAR_CODE_TYPE
		) as string | null;
		const barCodeValue = coreObjectClass.attribValue(
			camera,
			CameraAttribute.WEBXR_AR_MARKER_TRACKING_BAR_CODE_VALUE
		) as number | null;
		const transformMode = coreObjectClass.attribValue(
			camera,
			CameraAttribute.WEBXR_AR_MARKER_TRACKING_TRANSFORM_MODE
		) as number | null;

		if (sourceMode == null || barCodeType == null || barCodeValue == null || transformMode == null) {
			return;
		}
		if (!MARKER_TRACKING_SOURCE_MODES.includes(sourceMode)) {
			return;
		}
		if (
			[MarkerTrackingSourceMode.IMAGE, MarkerTrackingSourceMode.VIDEO].includes(sourceMode) &&
			sourceUrl == null
		) {
			return;
		}
		if (!isString(barCodeType)) {
			return;
		}
		if (!isString(transformMode)) {
			return;
		}
		if (!Poly.thirdParty.markerTracking().barCodeTypes().includes(barCodeType)) {
			return;
		}
		if (!MARKER_TRACKING_TRANSFORM_MODES.includes(transformMode as MarkerTrackingTransformMode)) {
			return;
		}
		if (!isNumber(barCodeValue)) {
			return;
		}

		const smooth =
			(coreObjectClass.attribValue(camera, CameraAttribute.WEBXR_AR_MARKER_TRACKING_SMOOTH) as boolean | null) ||
			false;
		const smoothCount =
			(coreObjectClass.attribValue(camera, CameraAttribute.WEBXR_AR_MARKER_TRACKING_SMOOTH_COUNT) as
				| number
				| null) || 0;

		try {
			const controller = Poly.thirdParty.markerTracking().createController({
				sourceMode,
				sourceUrl,
				canvas,
				camera,
				scene: scene.threejsScene(),
				transformMode: transformMode as MarkerTrackingTransformMode,
				barCode: {
					type: barCodeType,
					value: barCodeValue,
				},
				smooth: {
					active: smooth,
					count: smoothCount,
				},
			});

			const errorMessage = controller?.errorMessage();
			if (errorMessage) {
				onError(errorMessage);
			} else {
				if (!controller) {
					onError(
						'failed to create the MarkerTracking controller. Make sure you have loaded the plugin. See: `https://polygonjs.com/markerTracking`'
					);
				}
			}

			return controller?.config();
		} catch (err) {
			onError('There was an unknown error while using the MarkerTracking plugin');
		}
	}
}
