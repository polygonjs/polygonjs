import {ParamConfig} from '../../engine/nodes/utils/params/ParamsConfig';
import {Constructor, Number2, Number3} from '../../types/GlobalTypes';
import {ColorConversion} from '../Color';
import {Mesh} from 'three/src/objects/Mesh';
import {DefaultOperationParams} from '../operations/_Base';
import {Color} from 'three/src/math/Color';
import {Vector2} from 'three/src/math/Vector2';
import {SpotLight} from 'three/src/lights/SpotLight';
import {LineBasicMaterial} from 'three/src/materials/LineBasicMaterial';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Float32BufferAttribute} from 'three/src/core/BufferAttribute';
import {Group} from 'three/src/objects/Group';
import {LineSegments} from 'three/src/objects/LineSegments';
import {Object3D} from 'three/src/core/Object3D';
import {Vector3} from 'three/src/math/Vector3';
import {VolumetricSpotLight} from './spotlight/VolumetricSpotLight';
import {isBooleanTrue} from '../Type';

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
	tvolumetric: boolean;
	volAttenuation: number;
	volAnglePower: number;
}

export const DEFAULT_SPOT_LIGHT_PARAMS: SpotLightParams = {
	color: new Color(1, 1, 1),
	intensity: 1,
	angle: 45,
	penumbra: 0.1,
	decay: 0.1,
	distance: 100,
	//
	showHelper: false,
	helperSize: 1,
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
	//
	tvolumetric: false,
	volAttenuation: 5,
	volAnglePower: 10,
};
const DEFAULT = DEFAULT_SPOT_LIGHT_PARAMS;

export function SpotLightParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		light = ParamConfig.FOLDER();
		/** @param light color */
		color = ParamConfig.COLOR(DEFAULT.color.toArray() as Number3, {
			conversion: ColorConversion.SRGB_TO_LINEAR,
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
		decay = ParamConfig.FLOAT(DEFAULT.decay, {range: [0, 1]});
		/** @param distance */
		distance = ParamConfig.FLOAT(DEFAULT.distance, {range: [0, 100]});

		// helper
		/** @param toggle on to show helper */
		showHelper = ParamConfig.BOOLEAN(DEFAULT.showHelper);
		/** @param helper size */
		helperSize = ParamConfig.FLOAT(DEFAULT.helperSize, {visibleIf: {showHelper: 1}});

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
	private _target: Object3D;
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
		this._light = new SpotLight();
		this._target = this._light.target;

		// set light pos to 0,0,1
		// in order to have it face z axis
		this._light.position.set(0, 0, 1);
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
		this.position.copy(source.position);
		this.rotation.copy(source.rotation);
		this.scale.copy(source.scale);
		this.quaternion.copy(source.quaternion);
		this.matrix.copy(source.matrix);
		this.matrixWorld.copy(source.matrixWorld);

		this.updateParams(source.params);
		this.updateHelper();

		if (recursive) {
			this.updateVolumetric();
			this.add(this._light.target);
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

interface CoreSpotLightHelperParams {
	helperSize: number;
}
interface UpdateConeObjectOptions {
	distance: number;
	sizeMult: number;
	angle: number;
}

export class CoreSpotLightHelper {
	public object: Mesh = new Mesh();
	private _cone = new LineSegments();
	private _lineMaterial = new LineBasicMaterial({fog: false});
	constructor(public container: SpotLightContainer) {
		this.object.name = `CoreSpotLightHelper_${this.container.nodeName}`;
		this.createAndBuildObject({helperSize: 1});
	}

	createAndBuildObject(params: CoreSpotLightHelperParams) {
		this.buildHelper();
		this.update(params);
	}

	buildHelper() {
		this._cone.geometry = CoreSpotLightHelper._buildConeGeometry();
		this._cone.material = this._lineMaterial;
		this._cone.matrixAutoUpdate = false;
		this._cone.name = `CoreSpotLightHelperCone_${this.container.nodeName}`;

		this.object.add(this._cone);
	}

	update(params: CoreSpotLightHelperParams) {
		const light = this.container.light();
		CoreSpotLightHelper.transformObject(this._cone, {
			sizeMult: params.helperSize,
			distance: light.distance,
			angle: light.angle,
		});

		this._lineMaterial.color.copy(light.color);
	}

	private static _matrixScale = new Vector3();
	static transformObject(object: Object3D, options: UpdateConeObjectOptions) {
		const coneLength = (options.distance ? options.distance : 1000) * options.sizeMult;
		const coneWidth = coneLength * Math.tan(options.angle);

		this._matrixScale.set(coneWidth, coneWidth, coneLength);
		object.matrix.identity();
		object.matrix.makeRotationX(Math.PI * 1);
		object.matrix.scale(this._matrixScale);
	}
	private static _buildConeGeometry() {
		const geometry = new BufferGeometry();

		const positions = [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, -1, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, -1, 1];

		for (let i = 0, j = 1, l = 32; i < l; i++, j++) {
			const p1 = (i / l) * Math.PI * 2;
			const p2 = (j / l) * Math.PI * 2;

			positions.push(Math.cos(p1), Math.sin(p1), 1, Math.cos(p2), Math.sin(p2), 1);
		}

		geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
		return geometry;
	}
}
