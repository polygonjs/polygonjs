import {Camera, WebGLRenderer} from 'three';
import {PolyScene} from '../../../engine/scene/PolyScene';
import {CameraAttribute} from '../CoreCamera';
import {
	WebXRControllerMountFunction,
	WebXRControllerUnmountFunction,
	WEBXR_REFERENCE_SPACE_TYPES,
} from '../../webXR/Common';
import {WebXRVRFeature, WEBXR_VR_FEATURES} from '../../webXR/webXRVR/CommonVR';
import {BaseCoreWebXRController} from '../../webXR/_BaseCoreWebXRController';
import {WebXRARFeature, WEBXR_AR_FEATURES} from '../../webXR/webXRAR/CommonAR';
import {coreObjectClassFactory} from '../../geometry/CoreObjectFactory';

interface WebXRControllerOptions {
	camera: Camera;
	scene: PolyScene;
	renderer: WebGLRenderer;
	canvas: HTMLCanvasElement;
}

export interface CoreCameraWebXRControllerConfig {
	mountFunction: WebXRControllerMountFunction;
	unmountFunction: WebXRControllerUnmountFunction;
}

function getFeatures<F extends WebXRARFeature | WebXRVRFeature>(
	camera: Camera,
	attribName: string,
	existingFeatures: F[]
): F[] {
	const features: F[] = [];
	const featuresStr = coreObjectClassFactory(camera).attribValue(camera, attribName) as string | null;
	const featuresStrings = featuresStr?.split(' ');
	if (featuresStrings) {
		for (let featuresString of featuresStrings) {
			if (existingFeatures.includes(featuresString as F)) {
				features.push(featuresString as F);
			}
		}
	}
	return features;
}
interface FeatureAttribNames {
	optional: CameraAttribute;
	required: CameraAttribute;
}
function _getRequiredAndOptionalFeatures<E extends WebXRARFeature | WebXRVRFeature>(
	camera: Camera,
	existingFeatures: E[],
	attribNames: FeatureAttribNames
) {
	// features
	const optionalFeatures = getFeatures<E>(camera, attribNames.optional, existingFeatures);
	const requiredFeatures = getFeatures<E>(camera, attribNames.required, existingFeatures);

	return {requiredFeatures, optionalFeatures};
}

interface SpaceTypeAttribNames {
	type: CameraAttribute;
	override: CameraAttribute;
}
function _getReferenceSpaceType(camera: Camera, options: SpaceTypeAttribNames) {
	// referenceSpaceType
	const coreObjectClass = coreObjectClassFactory(camera);

	let overrideReferenceSpaceType = coreObjectClass.attribValue(camera, options.override) as boolean | null;
	let referenceSpaceType: string | null | undefined = coreObjectClass.attribValue(camera, options.type) as
		| string
		| null;

	if (!(referenceSpaceType && WEBXR_REFERENCE_SPACE_TYPES.includes(referenceSpaceType as XRReferenceSpaceType))) {
		overrideReferenceSpaceType = false;
		referenceSpaceType = undefined;
	}

	return {overrideReferenceSpaceType, referenceSpaceType};
}

export class CoreCameraWebXRController {
	static process(options: WebXRControllerOptions): CoreCameraWebXRControllerConfig {
		const {camera, scene, renderer, canvas} = options;

		const controllers: BaseCoreWebXRController[] = [];
		const subMountFunctions: WebXRControllerMountFunction[] = [];
		const subUnmountFunctions: WebXRControllerUnmountFunction[] = [];
		const mountFunction: WebXRControllerMountFunction = () => {
			for (let subFunc of subMountFunctions) {
				subFunc();
			}
		};
		const unmountFunction: WebXRControllerUnmountFunction = () => {
			for (let subFunc of subUnmountFunctions) {
				subFunc();
			}
		};
		const coreObjectClass = coreObjectClassFactory(camera);
		//
		// AR
		//
		const isWebAR = coreObjectClass.attribValue(camera, CameraAttribute.WEBXR_AR) as boolean | null;
		if (isWebAR == true) {
			const createFunction = scene.webXR.ARControllerCreateFunction();
			if (createFunction) {
				const {overrideReferenceSpaceType, referenceSpaceType} = _getReferenceSpaceType(camera, {
					type: CameraAttribute.WEBXR_AR_OVERRIDE_REFERENCE_SPACE_TYPE,
					override: CameraAttribute.WEBXR_AR_REFERENCE_SPACE_TYPE,
				});

				const {requiredFeatures, optionalFeatures} = _getRequiredAndOptionalFeatures<WebXRARFeature>(
					camera,
					WEBXR_AR_FEATURES,
					{
						optional: CameraAttribute.WEBXR_AR_FEATURES_OPTIONAL,
						required: CameraAttribute.WEBXR_AR_FEATURES_REQUIRED,
					}
				);

				// createFunction
				const controller = createFunction(renderer, camera, canvas, {
					overrideReferenceSpaceType: overrideReferenceSpaceType || false,
					referenceSpaceType: referenceSpaceType as XRReferenceSpaceType | undefined,
					requiredFeatures,
					optionalFeatures,
				});
				controllers.push(controller);
			}
		}
		//
		// VR
		//
		const isWebVR = coreObjectClass.attribValue(camera, CameraAttribute.WEBXR_VR) as boolean | null;
		if (isWebVR == true) {
			const createFunction = scene.webXR.VRControllerCreateFunction();
			if (createFunction) {
				const {overrideReferenceSpaceType, referenceSpaceType} = _getReferenceSpaceType(camera, {
					type: CameraAttribute.WEBXR_VR_OVERRIDE_REFERENCE_SPACE_TYPE,
					override: CameraAttribute.WEBXR_VR_REFERENCE_SPACE_TYPE,
				});

				const {requiredFeatures, optionalFeatures} = _getRequiredAndOptionalFeatures<WebXRVRFeature>(
					camera,
					WEBXR_VR_FEATURES,
					{
						optional: CameraAttribute.WEBXR_VR_FEATURES_OPTIONAL,
						required: CameraAttribute.WEBXR_VR_FEATURES_REQUIRED,
					}
				);

				// createFunction
				const controller = createFunction(renderer, camera, canvas, {
					overrideReferenceSpaceType: overrideReferenceSpaceType || false,
					referenceSpaceType: referenceSpaceType as XRReferenceSpaceType | undefined,
					requiredFeatures,
					optionalFeatures,
				});
				controllers.push(controller);
			}
		}

		//
		//
		//
		for (let controller of controllers) {
			subMountFunctions.push(() => controller.mount());
			subUnmountFunctions.push(() => controller.unmount());
		}

		return {mountFunction, unmountFunction};
	}
}
