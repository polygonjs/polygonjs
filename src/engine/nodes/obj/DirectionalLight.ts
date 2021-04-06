/**
 * Creates a directional light.
 *
 *
 */
import {Constructor} from '../../../types/GlobalTypes';
import {DirectionalLight} from 'three/src/lights/DirectionalLight';
import {DirectionalLightHelper} from './utils/helpers/DirectionalLightHelper';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Object3D} from 'three/src/core/Object3D';
import {Mesh} from 'three/src/objects/Mesh';
import {HelperController, HelperConstructor} from './utils/HelperController';
import {BaseLightTransformedObjNode} from './_BaseLightTransformed';
import {TransformedParamConfig} from './utils/TransformController';
import {ColorConversion} from '../../../core/Color';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {LightType} from '../../poly/registers/nodes/types/Light';

export function DirectionalLightParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		light = ParamConfig.FOLDER();
		/** @param light color */
		color = ParamConfig.COLOR([1, 1, 1], {
			conversion: ColorConversion.SRGB_TO_LINEAR,
		});
		/** @param light intensity */
		intensity = ParamConfig.FLOAT(1);
		/** @param light distance */
		distance = ParamConfig.FLOAT(100, {range: [0, 100]});

		// shadows
		shadow = ParamConfig.FOLDER();
		/** @param toggle on to cast shadows */
		castShadow = ParamConfig.BOOLEAN(1);
		/** @param shadow resolution */
		shadowRes = ParamConfig.VECTOR2([1024, 1024], {
			visibleIf: {castShadow: true},
		});
		/** @param shadow bias */
		shadowBias = ParamConfig.FLOAT(0.001, {
			visibleIf: {castShadow: true},
		});
		/** @param shadows radius. This only has effect when setting the ROP/WebGLRenderer's shadowMapType to VSM */
		shadowRadius = ParamConfig.FLOAT(0, {
			visibleIf: {castShadow: 1},
			range: [0, 10],
			rangeLocked: [true, false],
		});

		// helper
		/** @param toggle to show helper */
		showHelper = ParamConfig.BOOLEAN(0);
		/** @param helper size */
		helperSize = ParamConfig.FLOAT(1, {visibleIf: {showHelper: 1}});
	};
}

class DirectionalLightObjParamsConfig extends DirectionalLightParamConfig(TransformedParamConfig(NodeParamsConfig)) {}
const ParamsConfig = new DirectionalLightObjParamsConfig();

export class DirectionalLightObjNode extends BaseLightTransformedObjNode<
	DirectionalLight,
	DirectionalLightObjParamsConfig
> {
	paramsConfig = ParamsConfig;
	static type() {
		return LightType.DIRECTIONAL;
	}
	private _target_target!: Object3D;
	private _helperController = new HelperController<Mesh, DirectionalLight>(
		this,
		(<unknown>DirectionalLightHelper) as HelperConstructor<Mesh, DirectionalLight>,
		'DirectionalLightHelper'
	);
	initializeNode() {
		// this.io.inputs.setCount(0, 1);
		// this.io.inputs.set_depends_on_inputs(false);

		this._helperController.initializeNode();
	}

	createLight() {
		const light = new DirectionalLight();
		light.matrixAutoUpdate = false;

		light.castShadow = true;
		light.shadow.bias = -0.001;
		light.shadow.mapSize.x = 1024;
		light.shadow.mapSize.y = 1024;
		light.shadow.camera.near = 0.1;

		this._target_target = light.target;
		this._target_target.name = 'DirectionalLight Default Target';
		this.object.add(this._target_target);

		return light;
	}
	// addObjectToParent(parent: Object3D) {
	// 	super.addObjectToParent(parent);
	// 	parent.add(this._target_target);
	// }
	// removeObjectFromParent() {
	// 	super.removeObjectFromParent();
	// 	const parent = this._target_target.parent;
	// 	if (parent) {
	// 		parent.remove(this._target_target);
	// 	}
	// }

	protected updateLightParams() {
		// this.light.position.copy(this.pv.t);
		this.light.color = this.pv.color;
		this.light.intensity = this.pv.intensity;
		this.light.shadow.camera.far = this.pv.distance;

		this._helperController.update();
	}
	protected updateShadowParams() {
		this.light.castShadow = isBooleanTrue(this.pv.castShadow);
		this.light.shadow.mapSize.copy(this.pv.shadowRes);
		// object.shadow.camera.near = this.pv.shadow_near
		// object.shadow.camera.far = this.pv.shadow_far
		this.light.shadow.bias = this.pv.shadowBias;
		this.light.shadow.radius = this.pv.shadowRadius;

		// updating the camera matrix is not necessary for point light
		// so probably should not for this
		this.light.shadow.camera.updateProjectionMatrix();
	}
}
