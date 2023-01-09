import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CameraSopNodeType} from '../../poly/NodeContext';
import {Object3D} from 'three';
import {PolyScene} from '../../scene/PolyScene';
import {CoreARjsController} from '../../../core/webXR/arjs/CoreARjsController';
import {CoreObject} from '../../../core/geometry/Object';
import {CameraAttribute} from '../../../core/camera/CoreCamera';
import {
	ARjsBarCodeType,
	ArjsTransformMode,
	ARJS_BAR_CODE_TYPES,
	ARJS_TRANSFORM_MODES,
} from '../../../core/webXR/arjs/Common';
import {TypeAssert} from '../../poly/Assert';

interface CameraWebXRARTrackMarkerSopParams extends DefaultOperationParams {
	transformMode: number;
	barCodeType: number;
	barCodeValue_3x3: number;
	barCodeValue_3x3_hamming63: number;
	barCodeValue_3x3_parity65: number;
	barCodeValue_4x4_bch_13_5_5: number;
	barCodeValue_4x4_bch_13_9_3: number;
}

interface UpdateObjectOptions {
	scene: PolyScene;
	objects: Object3D[];
	params: CameraWebXRARTrackMarkerSopParams;
	active: boolean;
}

export function valueByBarCodeType(type: ARjsBarCodeType, params: CameraWebXRARTrackMarkerSopParams) {
	switch (type) {
		case ARjsBarCodeType._3x3: {
			return params.barCodeValue_3x3;
		}
		case ARjsBarCodeType._3x3_HAMMING63: {
			return params.barCodeValue_3x3_hamming63;
		}
		case ARjsBarCodeType._3x3_PARITY65: {
			return params.barCodeValue_3x3_parity65;
		}
		case ARjsBarCodeType._4x4_BCH_13_5_5: {
			return params.barCodeValue_4x4_bch_13_5_5;
		}
		case ARjsBarCodeType._4x4_BCH_13_9_3: {
			return params.barCodeValue_4x4_bch_13_9_3;
		}
	}
	TypeAssert.unreachable(type);
}

export class CameraWebXRARTrackMarkerSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: CameraWebXRARTrackMarkerSopParams = {
		transformMode: ARJS_TRANSFORM_MODES.indexOf(ArjsTransformMode.CAMERA),
		barCodeType: ARJS_BAR_CODE_TYPES.indexOf(ARjsBarCodeType._4x4_BCH_13_9_3),
		barCodeValue_3x3: 0,
		barCodeValue_3x3_hamming63: 0,
		barCodeValue_3x3_parity65: 0,
		barCodeValue_4x4_bch_13_5_5: 0,
		barCodeValue_4x4_bch_13_9_3: 0,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<CameraSopNodeType.WEBXR_AR_TRACK_MARKER> {
		return CameraSopNodeType.WEBXR_AR_TRACK_MARKER;
	}
	override cook(inputCoreGroups: CoreGroup[], params: CameraWebXRARTrackMarkerSopParams) {
		const objects = inputCoreGroups[0].objects();

		if (this._node) {
			CameraWebXRARTrackMarkerSopOperation.updateObject({
				scene: this._node.scene(),
				objects,
				params,
				active: true,
			});
		}

		return this.createCoreGroupFromObjects(objects);
	}
	static updateObject(options: UpdateObjectOptions) {
		const {scene, objects, params, active} = options;

		scene.arjs.setControllerCreationFunction((options) => {
			return new CoreARjsController(options);
		});

		for (let object of objects) {
			CoreObject.addAttribute(object, CameraAttribute.WEBXR_AR_TRACK_MARKER, active);
			const barCodeType = ARJS_BAR_CODE_TYPES[params.barCodeType];
			if (barCodeType) {
				CoreObject.addAttribute(object, CameraAttribute.WEBXR_AR_TRACK_MARKER_BAR_CODE_TYPE, barCodeType);
				const barCodeValue = valueByBarCodeType(barCodeType, params);
				CoreObject.addAttribute(object, CameraAttribute.WEBXR_AR_TRACK_MARKER_BAR_CODE_VALUE, barCodeValue);
			}
			const transformMode = ARJS_TRANSFORM_MODES[params.transformMode];
			CoreObject.addAttribute(object, CameraAttribute.WEBXR_AR_TRACK_MARKER_TRANSFORM_MODE, transformMode);
		}
	}
}
