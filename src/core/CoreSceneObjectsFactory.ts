import {ColorRepresentation, PerspectiveCamera, RectAreaLight, SpotLight} from 'three';

type PerspectiveCameraContructor = (fov: number, aspect: number, near: number, far: number) => PerspectiveCamera;
type AreaLightContructor = (
	color: ColorRepresentation,
	intensity: number,
	width: number,
	height: number
) => RectAreaLight;
type SpotLightContructor = () => SpotLight;
type SpotLightUpdateIESTexture<L extends SpotLight> = (spotLight: L, textureName: string) => void;

interface Generators {
	perspectiveCamera: PerspectiveCameraContructor;
	areaLight: AreaLightContructor;
	spotLight: SpotLightContructor;
	spotLightUpdate: SpotLightUpdateIESTexture<SpotLight>;
}

export class CoreSceneObjectsFactory {
	static generators: Generators = {
		perspectiveCamera: (fov: number, aspect: number, near: number, far: number) =>
			new PerspectiveCamera(fov, aspect, near, far),
		areaLight: (color: ColorRepresentation, intensity: number, width: number, height: number) =>
			new RectAreaLight(color, intensity, width, height),
		spotLight: () => new SpotLight(),
		spotLightUpdate: (spotLight, textureName) => {},
	};
}
