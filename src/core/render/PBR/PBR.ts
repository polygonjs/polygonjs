import {PerspectiveCamera} from 'three';
import {PhysicalCamera, ShapedAreaLight, PhysicalSpotLight, IESLoader} from './three-gpu-pathtracer';
import {PathTracingRendererRopNode} from '../../../engine/nodes/rop/PathTracingRenderer';
import {PolyEngine} from '../../../engine/Poly';
import {ViewerCallbackOptions} from '../../../engine/poly/registers/cameras/PolyCamerasRegister';
import {PathTracingViewer} from '../../../engine/viewers/PathTracingViewer';
import {ThreejsViewer} from '../../../engine/viewers/Threejs';
import {CoreCameraRendererController} from '../../camera/CoreCameraRendererController';
import {CoreCameraPerspectiveFrameMode} from '../../camera/frameMode/CoreCameraPerspectiveFrameMode';
import {monkeyPatchSpotLight} from '../../monkeyPath/SpotLight';
import {
	CoreSceneObjectsFactory,
	GeneratorName,
	PerspectiveCameraOptions,
	PerspectiveCameraUpdateOptions,
	PerspectiveCameraUpdate,
	AreaLightOptions,
	SpotLightUpdateOptions,
	SpotLightUpdate,
} from '../../CoreSceneObjectsFactory';
import {IES_PROFILE_LM_63_1995} from '../../lights/spotlight/ies/lm_63_1995';

// type PhysicalSpotLightUpdateOptions = SpotLightUpdateOptions<PhysicalSpotLight>
const PHYSICAL_CAMERA_UPDATE: PerspectiveCameraUpdate<PhysicalCamera> = (
	options: PerspectiveCameraUpdateOptions<PhysicalCamera>
) => {
	const {camera, params} = options;
	const {apertureBlades, fStop, focusDistance, apertureRotation, anamorphicRatio} = params;
	camera.apertureBlades = apertureBlades;
	camera.fStop = fStop;
	camera.focusDistance = focusDistance;
	camera.apertureRotation = apertureRotation;
	camera.anamorphicRatio = anamorphicRatio;
};
const PHYSICAL_SPOT_LIGHT_UPDATE: SpotLightUpdate<PhysicalSpotLight> = (
	options: SpotLightUpdateOptions<PhysicalSpotLight>
) => {
	const {spotLight} = options;
	spotLight.iesTexture = new IESLoader().parse(IES_PROFILE_LM_63_1995);
};

export function onPBRModuleRegister(poly: PolyEngine) {
	CoreSceneObjectsFactory.registerGenerator(GeneratorName.PERSPECTIVE_CAMERA, (options: PerspectiveCameraOptions) => {
		const {fov, aspect, near, far} = options;
		return new PhysicalCamera(fov, aspect, near, far);
	});
	CoreSceneObjectsFactory.registerGenerator(GeneratorName.PERSPECTIVE_CAMERA_UPDATE, PHYSICAL_CAMERA_UPDATE as any);
	CoreSceneObjectsFactory.registerGenerator(GeneratorName.AREA_LIGHT, (options: AreaLightOptions) => {
		const {color, intensity, width, height} = options;
		return new ShapedAreaLight(color, intensity, width, height);
	});
	CoreSceneObjectsFactory.registerGenerator(GeneratorName.SPOT_LIGHT, () => {
		const physicalSpotLight = new PhysicalSpotLight();
		monkeyPatchSpotLight(physicalSpotLight);
		return physicalSpotLight;
	});
	CoreSceneObjectsFactory.registerGenerator(GeneratorName.SPOT_LIGHT_UPDATE, PHYSICAL_SPOT_LIGHT_UPDATE as any);

	poly.registerCamera<PhysicalCamera | PerspectiveCamera>(
		PhysicalCamera,
		(options: ViewerCallbackOptions<PhysicalCamera | PerspectiveCamera>) => {
			const {camera, scene, canvas} = options;

			// calling .rendererNode() is preferred to
			// .rendererConfig() as this would create the renderer
			// which in some conditions leads to 2 renderers being created
			// (one now, and one in the viewwer).
			// And this can create issues as an env map may pick up the first renderer
			// and therefore not be available in the second renderer.
			const rendererNode = canvas
				? CoreCameraRendererController.rendererNode({
						camera,
						scene,
				  })
				: undefined;

			if (rendererNode instanceof PathTracingRendererRopNode) {
				const viewer = new PathTracingViewer<PhysicalCamera>({
					...options,
					updateCameraAspect: (aspect) => {
						CoreCameraPerspectiveFrameMode.updateCameraAspect(options.camera, aspect);
					},
				});
				return viewer;
			} else {
				const viewer = new ThreejsViewer<PerspectiveCamera>({
					...options,
					updateCameraAspect: (aspect) => {
						CoreCameraPerspectiveFrameMode.updateCameraAspect(options.camera, aspect);
					},
				});
				return viewer;
			}
		}
	);
	// CoreSceneObjectsFactory.generators.perspectiveCamera = (fov, aspect, near, far) =>
	// 	new PhysicalCamera(fov, aspect, near, far);
	// CoreSceneObjectsFactory.generators.areaLight = (color, intensity, width, height) =>
	// 	new ShapedAreaLight(color, intensity, width, height);
	// CoreSceneObjectsFactory.generators.spotLight = () => new PhysicalSpotLight();
	// CoreSceneObjectsFactory.generators.spotLightUpdate = (options:SpotLightUpdateOptions<SpotLight>) => {
	// 	const {spotLight}=options
	// 	spotLight.iesTexture = new IESLoader().parse(IES_PROFILE_LM_63_1995);
	// };
}
