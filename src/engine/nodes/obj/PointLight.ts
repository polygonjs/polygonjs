/**
 * Creates a point light.
 *
 *
 */
import {PointLight} from 'three/src/lights/PointLight';
import {PointLightHelper} from './utils/helpers/PointLightHelper';
import {BaseLightTransformedObjNode} from './_BaseLightTransformed';
import {TransformedParamConfig} from './utils/TransformController';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {HelperController, HelperConstructor} from './utils/HelperController';
import {ColorConversion} from '../../../core/Color';
import {Mesh} from 'three/src/objects/Mesh';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {LightType} from '../../poly/registers/nodes/types/Light';
class PointLightObjParamsConfig extends TransformedParamConfig(NodeParamsConfig) {
	light = ParamConfig.FOLDER();
	/** @param light color */
	color = ParamConfig.COLOR([1, 1, 1], {
		conversion: ColorConversion.SRGB_TO_LINEAR,
	});
	/** @param light intensity */
	intensity = ParamConfig.FLOAT(1);
	/** @param light decay */
	decay = ParamConfig.FLOAT(0.1);
	/** @param light distance */
	distance = ParamConfig.FLOAT(100);
	// shadows
	/** @param toggle to cast shadows */
	castShadows = ParamConfig.BOOLEAN(1);
	/** @param shadow res */
	shadowRes = ParamConfig.VECTOR2([1024, 1024], {visibleIf: {castShadows: 1}});
	/** @param shadow bias */
	shadowBias = ParamConfig.FLOAT(0.001, {visibleIf: {castShadows: 1}});
	/** @param shadow camera near */
	shadowNear = ParamConfig.FLOAT(1, {visibleIf: {castShadows: 1}});
	/** @param shadow camera far */
	shadowFar = ParamConfig.FLOAT(100, {visibleIf: {castShadows: 1}});

	// helper
	/** @param toggle to show helper */
	showHelper = ParamConfig.BOOLEAN(0);
	/** @param helper size */
	helperSize = ParamConfig.FLOAT(1, {visibleIf: {showHelper: 1}});
}
const ParamsConfig = new PointLightObjParamsConfig();

export class PointLightObjNode extends BaseLightTransformedObjNode<PointLight, PointLightObjParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return LightType.POINT;
	}
	private _helper_controller = new HelperController<Mesh, PointLight>(
		this,
		(<unknown>PointLightHelper) as HelperConstructor<Mesh, PointLight>,
		'PointLightHelper'
	);
	initializeNode() {
		this._helper_controller.initializeNode();
	}

	create_light() {
		const light = new PointLight();
		light.matrixAutoUpdate = false;

		light.castShadow = true;
		light.shadow.bias = -0.001;
		light.shadow.mapSize.x = 1024;
		light.shadow.mapSize.y = 1024;
		light.shadow.camera.near = 0.1;

		return light;
	}

	update_light_params() {
		this.light.color = this.pv.color;
		this.light.intensity = this.pv.intensity;
		this.light.decay = this.pv.decay;

		this.light.distance = this.pv.distance;

		this._helper_controller.update();
	}
	update_shadow_params() {
		this.light.castShadow = isBooleanTrue(this.pv.castShadows);
		this.light.shadow.mapSize.copy(this.pv.shadowRes);
		this.light.shadow.camera.near = this.pv.shadowNear;
		this.light.shadow.camera.far = this.pv.shadowFar;
		this.light.shadow.bias = this.pv.shadowBias;
	}
}
