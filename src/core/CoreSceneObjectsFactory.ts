import {ColorRepresentation, PerspectiveCamera, RectAreaLight, SpotLight} from 'three';
import {ObjectType, registerObjectType} from './geometry/Constant';

export interface PerspectiveCameraOptions {
	fov: number;
	aspect: number;
	near: number;
	far: number;
}
type PerspectiveCameraConstructor = (options: PerspectiveCameraOptions) => PerspectiveCamera;
export interface AreaLightOptions {
	color: ColorRepresentation;
	intensity: number;
	width: number;
	height: number;
}
type AreaLightConstructor = (options: AreaLightOptions) => RectAreaLight;
type SpotLightConstructor = () => SpotLight;
export interface SpotLightUpdateOptions<L extends SpotLight> {
	spotLight: L;
	textureName: string;
}
type SpotLightUpdateIESTexture<L extends SpotLight> = (options: SpotLightUpdateOptions<L>) => void;

// interface Generators {
// 	perspectiveCamera: PerspectiveCameraContructor;
// 	areaLight: AreaLightContructor;
// 	spotLight: SpotLightContructor;
// 	spotLightUpdate: SpotLightUpdateIESTexture<SpotLight>;
// }
export enum GeneratorName {
	PERSPECTIVE_CAMERA = 'perspectiveCamera',
	AREA_LIGHT = 'areaLight',
	SPOT_LIGHT = 'spotLight',
	SPOT_LIGHT_UPDATE = 'spotLightUpdate',
}
type GeneratorMap = {
	[GeneratorName.PERSPECTIVE_CAMERA]: PerspectiveCameraConstructor;
	[GeneratorName.AREA_LIGHT]: AreaLightConstructor;
	[GeneratorName.SPOT_LIGHT]: SpotLightConstructor;
	[GeneratorName.SPOT_LIGHT_UPDATE]: SpotLightUpdateIESTexture<SpotLight>;
};
const DEFAULT_PERSPECTIVE_CAMERA_CONSTRUCTOR: PerspectiveCameraConstructor = (options: PerspectiveCameraOptions) => {
	registerObjectType({
		type: ObjectType.PERSPECTIVE_CAMERA,
		ctor: PerspectiveCamera,
		humanName: 'PerspectiveCamera',
	});
	const {fov, aspect, near, far} = options;
	return new PerspectiveCamera(fov, aspect, near, far);
};
const DEFAULT_AREA_LIGHT_CONSTRUCTOR: AreaLightConstructor = (options: AreaLightOptions) => {
	registerObjectType({type: ObjectType.AREA_LIGHT, ctor: RectAreaLight, humanName: 'AreaLight'});
	const {color, intensity, width, height} = options;
	return new RectAreaLight(color, intensity, width, height);
};
const DEFAULT_SPOT_LIGHT_CONSTRUCTOR: SpotLightConstructor = () => {
	registerObjectType({type: ObjectType.SPOT_LIGHT, ctor: SpotLight, humanName: ObjectType.SPOT_LIGHT});
	return new SpotLight();
};
const DEFAULT_SPOT_LIGHT_UPDATE: SpotLightUpdateIESTexture<SpotLight> = <L extends SpotLight>(
	options: SpotLightUpdateOptions<L>
) => {};

class CoreSceneObjectsFactoryClass {
	private constructor() {}
	private static _instance: CoreSceneObjectsFactoryClass | undefined;
	static instance() {
		return (this._instance = this._instance || new CoreSceneObjectsFactoryClass());
	}
	private _generators: GeneratorMap = {
		[GeneratorName.PERSPECTIVE_CAMERA]: DEFAULT_PERSPECTIVE_CAMERA_CONSTRUCTOR,
		[GeneratorName.AREA_LIGHT]: DEFAULT_AREA_LIGHT_CONSTRUCTOR,
		[GeneratorName.SPOT_LIGHT]: DEFAULT_SPOT_LIGHT_CONSTRUCTOR,
		[GeneratorName.SPOT_LIGHT_UPDATE]: DEFAULT_SPOT_LIGHT_UPDATE,
	};
	generator<G extends GeneratorName>(generatorName: G): GeneratorMap[G] {
		return this._generators[generatorName];
	}
	registerGenerator<G extends GeneratorName>(generatorName: G, generator: GeneratorMap[G]) {
		this._generators[generatorName] = generator;
	}
	// static generators: Generators = {
	// 	perspectiveCamera: (options:PerspectiveCameraOptions) => {
	// 		registerObjectType({
	// 			type: ObjectType.PERSPECTIVE_CAMERA,
	// 			ctor: PerspectiveCamera,
	// 			humanName: 'PerspectiveCamera',
	// 		});
	// 		const {fov, aspect, near, far}= options
	// 		return new PerspectiveCamera(fov, aspect, near, far);
	// 	},
	// 	areaLight: (options:AreaLightOptions) => {
	// 		registerObjectType({type: ObjectType.AREA_LIGHT, ctor: RectAreaLight, humanName: 'AreaLight'});
	// 		const  {color, intensity, width, height}=options
	// 		return new RectAreaLight(color, intensity, width, height);
	// 	},
	// 	spotLight: () => {
	// 		registerObjectType({type: ObjectType.SPOT_LIGHT, ctor: SpotLight, humanName: ObjectType.SPOT_LIGHT});
	// 		return new SpotLight();
	// 	},
	// 	spotLightUpdate: <L extends SpotLight>(options:SpotLightUpdateOptions<L>) => {},
	// };
}

export const CoreSceneObjectsFactory = CoreSceneObjectsFactoryClass.instance();
