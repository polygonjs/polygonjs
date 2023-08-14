import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CoreObject} from '../../../core/geometry/Object';
import {CameraAttribute} from '../../../core/camera/CoreCamera';
import {CameraSopNodeType} from '../../poly/NodeContext';
import {Camera, WebGLRenderer} from 'three';
import {PolyScene} from '../../scene/PolyScene';
import {CoreWebXRARController} from '../../../core/webXR/webXRAR/CoreWebXRARController';
import {CoreWebXRARControllerOptions, WebXRARFeature} from '../../../core/webXR/webXRAR/CommonAR';
import {
	WebXRFeatureStatus,
	WEBXR_FEATURE_STATUSES,
	WEBXR_FEATURE_STATUS_OPTIONAL_INDEX,
	DEFAULT_WEBXR_REFERENCE_SPACE_TYPE,
	WEBXR_REFERENCE_SPACE_TYPES,
} from '../../../core/webXR/Common';
import {TypeAssert} from '../../poly/Assert';
import {isBooleanTrue} from '../../../core/Type';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';
import {CoreMask} from '../../../core/geometry/Mask';

interface CameraWebXRARSopParams extends DefaultOperationParams {
	group: string;
	hitTest: number;
	lightEstimation: number;
	cameraAccess: number;
	overrideReferenceSpaceType: boolean;
	referenceSpaceType: number;
}

interface UpdateObjectOptions {
	scene: PolyScene;
	objects: ObjectContent<CoreObjectType>[];
	params: CameraWebXRARSopParams;
	active: boolean;
}

export class CameraWebXRARSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: CameraWebXRARSopParams = {
		group: '*',
		hitTest: WEBXR_FEATURE_STATUS_OPTIONAL_INDEX,
		lightEstimation: WEBXR_FEATURE_STATUS_OPTIONAL_INDEX,
		cameraAccess: WEBXR_FEATURE_STATUS_OPTIONAL_INDEX,
		overrideReferenceSpaceType: false,
		referenceSpaceType: WEBXR_REFERENCE_SPACE_TYPES.indexOf(DEFAULT_WEBXR_REFERENCE_SPACE_TYPE),
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<CameraSopNodeType.WEBXR_AR> {
		return CameraSopNodeType.WEBXR_AR;
	}
	override cook(inputCoreGroups: CoreGroup[], params: CameraWebXRARSopParams) {
		const coreGroup = inputCoreGroups[0];
		const objects = CoreMask.filterObjects(coreGroup, {
			group: params.group,
		});

		if (this._node) {
			CameraWebXRARSopOperation.updateObject({scene: this._node.scene(), objects, params, active: true});
		}

		return coreGroup;
	}
	static updateObject(options: UpdateObjectOptions) {
		const {scene, objects, params, active} = options;
		scene.webXR.setARControllerCreationFunction(function (
			renderer: WebGLRenderer,
			camera: Camera,
			canvas: HTMLCanvasElement,
			options: CoreWebXRARControllerOptions
		) {
			return new CoreWebXRARController(scene, renderer, camera, canvas, options);
		});

		const optionalFeatures: WebXRARFeature[] = [];
		const requiredFeatures: WebXRARFeature[] = [];
		function assignFeatureByStatus(feature: WebXRARFeature, featureStatusIndex: number) {
			const featureStatus = WEBXR_FEATURE_STATUSES[featureStatusIndex] || WebXRFeatureStatus.NOT_USED;
			switch (featureStatus) {
				case WebXRFeatureStatus.NOT_USED: {
					return;
				}
				case WebXRFeatureStatus.OPTIONAL: {
					optionalFeatures.push(feature);
					return;
				}
				case WebXRFeatureStatus.REQUIRED: {
					requiredFeatures.push(feature);
					return;
				}
			}
			TypeAssert.unreachable(featureStatus);
		}
		assignFeatureByStatus(WebXRARFeature.HIT_TEST, params.hitTest);
		assignFeatureByStatus(WebXRARFeature.LIGHT_ESTIMATION, params.lightEstimation);
		// assignFeatureByStatus(WebXRARFeature.CAMERA_ACCESS, params.cameraAccess);

		const optionalFeaturesStr = optionalFeatures.join(' ');
		const requiredFeaturesStr = requiredFeatures.join(' ');
		for (let object of objects) {
			CoreObject.addAttribute(object, CameraAttribute.WEBXR_AR, active);
			CoreObject.addAttribute(object, CameraAttribute.WEBXR_AR_FEATURES_OPTIONAL, optionalFeaturesStr);
			CoreObject.addAttribute(object, CameraAttribute.WEBXR_AR_FEATURES_REQUIRED, requiredFeaturesStr);
			CoreObject.addAttribute(
				object,
				CameraAttribute.WEBXR_AR_OVERRIDE_REFERENCE_SPACE_TYPE,
				isBooleanTrue(params.overrideReferenceSpaceType)
			);
			if (isBooleanTrue(params.overrideReferenceSpaceType)) {
				CoreObject.addAttribute(
					object,
					CameraAttribute.WEBXR_AR_REFERENCE_SPACE_TYPE,
					WEBXR_REFERENCE_SPACE_TYPES[params.referenceSpaceType]
				);
			}
		}
	}
}
