import {ColorRepresentation, PerspectiveCamera, RectAreaLight, SpotLight} from 'three';
import {ObjectType, registerObjectType} from './geometry/Constant';

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
		perspectiveCamera: (fov: number, aspect: number, near: number, far: number) => {
			registerObjectType({
				type: ObjectType.PERSPECTIVE_CAMERA,
				ctor: PerspectiveCamera,
				humanName: 'PerspectiveCamera',
			});
			return new PerspectiveCamera(fov, aspect, near, far);
		},
		areaLight: (color: ColorRepresentation, intensity: number, width: number, height: number) => {
			registerObjectType({type: ObjectType.AREA_LIGHT, ctor: RectAreaLight, humanName: 'AreaLight'});
			return new RectAreaLight(color, intensity, width, height);
		},
		spotLight: () => {
			registerObjectType({type: ObjectType.SPOT_LIGHT, ctor: SpotLight, humanName: ObjectType.SPOT_LIGHT});
			return new SpotLight();
		},
		spotLightUpdate: (spotLight, textureName) => {},
	};
}
