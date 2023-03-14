import {PerspectiveCamera} from 'three';
import {
	PhysicalCamera,
	ShapedAreaLight,
	PhysicalSpotLight,
	IESLoader,
	// @ts-ignore
} from 'three-gpu-pathtracer';
import {PathTracingRendererRopNode} from '../../../engine/nodes/rop/PathTracingRenderer';
import {PolyEngine} from '../../../engine/Poly';
import {ViewerCallbackOptions} from '../../../engine/poly/registers/cameras/PolyCamerasRegister';
import {PathTracingViewer} from '../../../engine/viewers/PathTracingViewer';
import {ThreejsViewer} from '../../../engine/viewers/Threejs';
import {CoreCameraRendererController} from '../../camera/CoreCameraRendererController';
import {CoreCameraPerspectiveFrameMode} from '../../camera/frameMode/CoreCameraPerspectiveFrameMode';

import {
	CoreSceneObjectsFactory,
	GeneratorName,
	PerspectiveCameraOptions,
	AreaLightOptions,
	SpotLightUpdateOptions,
} from '../../CoreSceneObjectsFactory';
import {IES_PROFILE_LM_63_1995} from '../../lights/spotlight/ies/lm_63_1995';

export function onPBRModuleRegister(poly: PolyEngine) {
	CoreSceneObjectsFactory.registerGenerator(GeneratorName.PERSPECTIVE_CAMERA, (options: PerspectiveCameraOptions) => {
		const {fov, aspect, near, far} = options;
		return new PhysicalCamera(fov, aspect, near, far);
	});
	CoreSceneObjectsFactory.registerGenerator(GeneratorName.AREA_LIGHT, (options: AreaLightOptions) => {
		const {color, intensity, width, height} = options;
		return new ShapedAreaLight(color, intensity, width, height);
	});
	CoreSceneObjectsFactory.registerGenerator(GeneratorName.SPOT_LIGHT, () => {
		return new PhysicalSpotLight();
	});
	CoreSceneObjectsFactory.registerGenerator(
		GeneratorName.SPOT_LIGHT_UPDATE,
		(options: SpotLightUpdateOptions<PhysicalSpotLight>) => {
			const {spotLight} = options;
			spotLight.iesTexture = new IESLoader().parse(IES_PROFILE_LM_63_1995);
		}
	);

	poly.registerCamera<PhysicalCamera | PerspectiveCamera>(
		PhysicalCamera,
		(options: ViewerCallbackOptions<PhysicalCamera | PerspectiveCamera>) => {
			const {camera, scene, canvas} = options;

			const rendererConfig = canvas
				? CoreCameraRendererController.rendererConfig({
						camera,
						scene,
						canvas,
				  })
				: undefined;
			const rendererNode = rendererConfig?.rendererNode;

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
