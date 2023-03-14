import {ParamConfig} from '../../engine/nodes/utils/params/ParamsConfig';
import {Constructor, Number2, Number3} from '../../types/GlobalTypes';
// import {ColorConversion} from '../Color';
import {DefaultOperationParams} from '../operations/_Base';
import {Object3D, Group, Vector2, Color, SpotLight} from 'three';
import {VolumetricSpotLight} from './spotlight/VolumetricSpotLight';
import {isBooleanTrue} from '../Type';
import {CoreSpotLightHelper, CoreSpotLightHelperParams} from './spotlight/CoreSpotLightHelper';
import {CoreSceneObjectsFactory, GeneratorName} from '../CoreSceneObjectsFactory';

export interface SpotLightParams extends DefaultOperationParams {
	color: Color;
	intensity: number;
	angle: number;
	penumbra: number;
	decay: number;
	distance: number;
	//
	showHelper: boolean;
	helperSize: number;
	name: string;
	//
	castShadow: boolean;
	shadowAutoUpdate: boolean;
	shadowUpdateOnNextRender: boolean;
	shadowRes: Vector2;
	// shadowSize: Vector2;
	shadowBias: number;
	shadowNear: number;
	shadowFar: number;
	shadowRadius: number;
	//
	// debugShadow is temporarily removed,
	// as it only works for obj lights if toggled after the shadow has been created
	// it does not work for sop lights at all.
	// maybe there is a better way to generate those via actor nodes?
	// debugShadow: boolean;
	//
	tvolumetric: boolean;
	volAttenuation: number;
	volAnglePower: number;
	//
	raymarchingPenumbra: number;
}

export const DEFAULT_SPOT_LIGHT_PARAMS: SpotLightParams = {
	color: new Color(1, 1, 1),
	intensity: 2,
	angle: 45,
	penumbra: 0.1,
	decay: 2,
	distance: 100,
	//
	showHelper: false,
	helperSize: 1,
	name: 'pointLight',
	//
	castShadow: false,
	shadowAutoUpdate: true,
	shadowUpdateOnNextRender: false,
	shadowRes: new Vector2(1024, 1024), // used to be 256 for performance, but is now higher to start with a better look dev
	// shadowSize: new Vector2(2, 2),
	shadowBias: 0.0001,
	shadowNear: 0.1,
	shadowFar: 100,
	shadowRadius: 0,
	// debugShadow: false,
	//
	tvolumetric: false,
	volAttenuation: 5,
	volAnglePower: 10,
	//
	raymarchingPenumbra: 0, // keep as 0 by default since it's more performant
};
const DEFAULT = DEFAULT_SPOT_LIGHT_PARAMS;

export function SpotLightParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		light = ParamConfig.FOLDER();
		/** @param light color */
		color = ParamConfig.COLOR(DEFAULT.color.toArray() as Number3, {
			// conversion: ColorConversion.SRGB_TO_LINEAR,
		});
		/** @param light intensity */
		intensity = ParamConfig.FLOAT(DEFAULT.intensity, {
			range: [0, 10],
			rangeLocked: [true, false],
		});
		/** @param angle */
		angle = ParamConfig.FLOAT(DEFAULT.angle, {range: [0, 180]});
		/** @param penumbra */
		penumbra = ParamConfig.FLOAT(DEFAULT.penumbra);
		/** @param decay */
		decay = ParamConfig.FLOAT(DEFAULT.decay, {range: [0, 10]});
		/** @param distance */
		distance = ParamConfig.FLOAT(DEFAULT.distance, {range: [0, 100]});

		// helper
		/** @param toggle on to show helper */
		showHelper = ParamConfig.BOOLEAN(DEFAULT.showHelper);
		/** @param helper size */
		helperSize = ParamConfig.FLOAT(DEFAULT.helperSize, {visibleIf: {showHelper: 1}});
		/** @param light name */
		name = ParamConfig.STRING('`$OS`');

		// shadows
		shadow = ParamConfig.FOLDER();
		/** @param toggle on to cast shadows */
		castShadow = ParamConfig.BOOLEAN(DEFAULT.castShadow);
		/** @param toggle off if the shadows do not need to be regenerated */
		shadowAutoUpdate = ParamConfig.BOOLEAN(DEFAULT.shadowAutoUpdate, {
			visibleIf: {castShadow: 1},
		});
		/** @param press button to update the shadows on next render */
		shadowUpdateOnNextRender = ParamConfig.BOOLEAN(DEFAULT.shadowUpdateOnNextRender, {
			visibleIf: {castShadow: 1, shadowAutoUpdate: 0},
		});
		/** @param shadows res */
		shadowRes = ParamConfig.VECTOR2(DEFAULT.shadowRes.toArray() as Number2, {
			visibleIf: {castShadow: 1},
		});
		/** @param shadows bias */
		shadowBias = ParamConfig.FLOAT(DEFAULT.shadowBias, {
			visibleIf: {castShadow: 1},
			range: [-0.01, 0.01],
			rangeLocked: [false, false],
		});
		/** @param shadows near */
		shadowNear = ParamConfig.FLOAT(DEFAULT.shadowNear, {
			visibleIf: {castShadow: 1},
			range: [0, 100],
			rangeLocked: [true, false],
		});
		/** @param shadows far */
		shadowFar = ParamConfig.FLOAT(DEFAULT.shadowFar, {
			visibleIf: {castShadow: 1},
			range: [0, 100],
			rangeLocked: [true, false],
		});
		/** @param shadows radius. This only has effect when setting the ROP/WebGLRenderer's shadowMapType to VSM */
		shadowRadius = ParamConfig.FLOAT(DEFAULT.shadowRadius, {
			visibleIf: {castShadow: 1},
			range: [0, 10],
			rangeLocked: [true, false],
		});
		/** @param display shadow on a plane behind the light */
		// debugShadow = ParamConfig.BOOLEAN(DEFAULT.debugShadow, {
		// 	visibleIf: {castShadow: 1},
		// });

		// shadows
		volumetric = ParamConfig.FOLDER();
		/** @param toggle on to add a volumetric effect to the spotlight */
		tvolumetric = ParamConfig.BOOLEAN(DEFAULT.tvolumetric);
		/** @param volumetric attenuation */
		volAttenuation = ParamConfig.FLOAT(DEFAULT.volAttenuation, {
			range: [0, 10],
			rangeLocked: [true, false],
		});
		/** @param volumetric angle power */
		volAnglePower = ParamConfig.FLOAT(DEFAULT.volAnglePower, {
			range: [0, 20],
			rangeLocked: [true, false],
		});

		// raymarching
		raymarching = ParamConfig.FOLDER();
		/** @param this affects the shadows cast inside raymarchingBuilder materials */
		raymarchingPenumbra = ParamConfig.FLOAT(DEFAULT.raymarchingPenumbra);
	};
}

export interface SpotLightContainerParams extends CoreSpotLightHelperParams {
	showHelper: boolean;
	tvolumetric: boolean;
	volAnglePower: number;
	volAttenuation: number;
}

export class SpotLightContainer extends Group {
	private _light: SpotLight;
	private _target: Object3D = new Object3D();
	public override matrixAutoUpdate = false;
	public params: SpotLightContainerParams = {
		showHelper: false,
		helperSize: 1,
		tvolumetric: false,
		volAnglePower: 1,
		volAttenuation: 1,
	};
	constructor(params: Partial<SpotLightContainerParams>, public readonly nodeName: string) {
		super();

		if (params.showHelper != null) {
			this.params.showHelper = params.showHelper;
		}
		if (params.tvolumetric != null) {
			this.params.tvolumetric = params.tvolumetric;
		}
		if (params.volAnglePower != null) {
			this.params.volAnglePower = params.volAnglePower;
		}
		if (params.volAttenuation != null) {
			this.params.volAttenuation = params.volAttenuation;
		}
		this._light = CoreSceneObjectsFactory.generator(GeneratorName.SPOT_LIGHT)();
		CoreSceneObjectsFactory.generator(GeneratorName.SPOT_LIGHT_UPDATE)({
			spotLight: this._light,
			textureName: 'IES_PROFILE_LM_63_1995',
		});
		this._target.copy(this._light.target, false);
		this._light.target = this._target;

		// set light pos to 0,0,1
		// in order to have it face z axis
		// update: set z to 0.01 so that the spotlight volume can appear to be in the same position
		// update: move target to 0,0,-1 so that the spotlight can be used with lookAt
		this._light.position.set(0, 0, 0.01);
		this._light.target.position.set(0, 0, -1);
		this._light.updateMatrix();
		this._target.updateMatrix();
		this._light.matrixAutoUpdate = false;
		this._target.matrixAutoUpdate = false;

		this.name = `SpotLightContainer_${this.nodeName}`;
		this._light.name = `SpotLight_${this.nodeName}`;
		this._target.name = `SpotLightDefaultTarget_${this.nodeName}`;

		this.add(this._light);
		this.add(this._target);
		this.updateHelper();
	}

	updateParams(params: Partial<SpotLightContainerParams>) {
		if (params.showHelper != null) {
			this.params.showHelper = params.showHelper;
		}
		if (params.helperSize != null) {
			this.params.helperSize = params.helperSize;
		}
		if (params.tvolumetric != null) {
			this.params.tvolumetric = params.tvolumetric;
		}
		if (params.volAnglePower != null) {
			this.params.volAnglePower = params.volAnglePower;
		}
		if (params.volAttenuation != null) {
			this.params.volAttenuation = params.volAttenuation;
		}
	}

	light() {
		return this._light;
	}
	override copy(source: this, recursive?: boolean): this {
		const srcLight = source.light();
		this._light.copy(srcLight);
		super.copy(source, false);

		this.updateParams(source.params);
		this.updateHelper();

		this._light.target = this._target;

		if (recursive) {
			this.updateVolumetric();
		}
		return this as this;
	}

	override clone(recursive?: boolean): this {
		const cloned = new SpotLightContainer(this.params, this.nodeName);
		cloned.copy(this);

		return cloned as this;
	}

	private __helper__: CoreSpotLightHelper | undefined;
	updateHelper() {
		if (isBooleanTrue(this.params.showHelper)) {
			this.__helper__ = this.__helper__ || new CoreSpotLightHelper(this);
			this.add(this.__helper__.object);
			this.__helper__.update({helperSize: this.params.helperSize});
		} else {
			if (this.__helper__) {
				this.remove(this.__helper__.object);
			}
		}
	}

	private __volumetric__: VolumetricSpotLight | undefined;
	updateVolumetric() {
		if (isBooleanTrue(this.params.tvolumetric)) {
			this.__volumetric__ = this.__volumetric__ || new VolumetricSpotLight(this);
			this.__volumetric__.update(this.params);
		} else {
			if (this.__volumetric__) {
				this.__volumetric__.update(this.params);
			}
		}
	}
}
