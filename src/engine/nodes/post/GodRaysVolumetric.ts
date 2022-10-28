/**
 * Adds volumetric god rays from a light source.
 *
 *
 */
import {TypeAssert} from './../../poly/Assert';
import {PerspectiveCamera} from 'three';
import {PolyScene} from './../../scene/PolyScene';
import {Vector2, PointLight, DirectionalLight, Object3D} from 'three';
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {GodraysPass} from 'three-good-godrays/src/index';
import {GodraysPass} from './utils/GodRaysVolumetric/GodRaysPass';
import {GodRaysVolumetricAcceptedLightType} from './utils/GodRaysVolumetric/utils/AcceptedLightType';

const tmpPointLight = new PointLight();
const tmpDirectionalLight = new DirectionalLight();
for (let l of [tmpPointLight, tmpDirectionalLight]) {
	l.intensity = 0.0001;
	l.castShadow = true;
	l.shadow.mapSize.width = 1024;
	l.shadow.mapSize.height = 1024;
	l.shadow.autoUpdate = true;
	l.shadow.camera.near = 0.1;
	l.shadow.camera.far = 1000;
	l.shadow.camera.updateProjectionMatrix();
}

enum LightType {
	POINT = 'point',
	DIRECTIONAL = 'directional',
}
const LIGHT_TYPES: LightType[] = [LightType.DIRECTIONAL, LightType.POINT];

function _findLightSource(scene: PolyScene, objectMask: string, lightType: LightType) {
	let foundLigthObject: GodRaysVolumetricAcceptedLightType | undefined = undefined;
	const objects: Object3D[] = scene.objectsByMask(objectMask);

	function _isExpectedLightType(object: Object3D): boolean {
		switch (lightType) {
			case LightType.POINT: {
				return (object as PointLight as any).isPointLight;
			}
			case LightType.DIRECTIONAL: {
				return (object as DirectionalLight as any).isDirectionalLight;
			}
		}
		TypeAssert.unreachable(lightType);
	}

	for (let object of objects) {
		if (_isExpectedLightType(object)) {
			foundLigthObject = object as PointLight;
			break;
		}
	}
	return foundLigthObject;
}

class GodRaysVolumetricPostParamsConfig extends NodeParamsConfig {
	/** @param light type */
	lightType = ParamConfig.INTEGER(LIGHT_TYPES.indexOf(LightType.POINT), {
		menu: {
			entries: LIGHT_TYPES.map((name, value) => ({name, value})),
		},
	});
	/** @param light to emit godrays from. Note that while the mask can resolve multiple objects, only the first light will be used */
	lightMask = ParamConfig.STRING('*Light*', {
		objectMask: true,
		...PostParamOptions,
	});
	/** @param color */
	color = ParamConfig.COLOR([1, 1, 1], {
		...PostParamOptions,
	});
	/** @param density */
	density = ParamConfig.FLOAT(0.006, {
		range: [0, 1],
		rangeLocked: [true, true],
		...PostParamOptions,
	});
	/** @param maxDensity */
	maxDensity = ParamConfig.FLOAT(0.67, {
		range: [0, 1],
		rangeLocked: [true, true],
		...PostParamOptions,
	});
	/** @param distanceAttenuation */
	distanceAttenuation = ParamConfig.FLOAT(2, {
		range: [0, 10],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param edgeStrength */
	edgeStrength = ParamConfig.INTEGER(2, {
		range: [0, 10],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param edgeRadius */
	edgeRadius = ParamConfig.INTEGER(2, {
		range: [0, 10],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
}
const ParamsConfig = new GodRaysVolumetricPostParamsConfig();
export class GodRaysVolumetricPostNode extends TypedPostProcessNode<GodraysPass, GodRaysVolumetricPostParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'godRaysVolumetric';
	}

	private _rendererSize = new Vector2();
	override createPass(context: TypedPostNodeContext) {
		context.renderer.getSize(this._rendererSize);
		this.scene().threejsScene().add(this._tmpLightSource());

		const pass = new GodraysPass(this._tmpLightSource(), context.camera as PerspectiveCamera, {
			color: this.pv.color,
			density: this.pv.density,
			maxDensity: this.pv.maxDensity,
			distanceAttenuation: this.pv.distanceAttenuation,
			edgeStrength: this.pv.edgeStrength,
			edgeRadius: this.pv.edgeRadius,
		});
		this.updatePass(pass);
		return pass;
	}
	override updatePass(pass: GodraysPass) {
		pass.setParams({
			color: this.pv.color,
			density: this.pv.density,
			maxDensity: this.pv.maxDensity,
			distanceAttenuation: this.pv.distanceAttenuation,
			edgeStrength: this.pv.edgeStrength,
			edgeRadius: this.pv.edgeRadius,
		});

		// this._tmpLightSource().position.copy(this.pv.center);

		const lightType = LIGHT_TYPES[this.pv.lightType];
		const lightSource = _findLightSource(this.scene(), this.pv.lightMask, lightType);

		if (lightSource) {
			lightSource.add(this._tmpLightSource());
			// (pass as any).light = lightSource;
		} else {
			(pass as any).light = this._tmpLightSource();
		}
	}
	private _tmpLightSource() {
		const lightType = LIGHT_TYPES[this.pv.lightType];
		switch (lightType) {
			case LightType.POINT: {
				return tmpPointLight;
			}
			case LightType.DIRECTIONAL: {
				return tmpDirectionalLight;
			}
		}
		TypeAssert.unreachable(lightType);
	}
}
