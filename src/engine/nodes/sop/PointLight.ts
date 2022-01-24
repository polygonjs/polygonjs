/**
 * Creates a point light.
 *
 * @remarks
 * This is very similar to the [object level PointLight](https://polygonjs.com/docs/nodes/obj/PointLight), but can be more useful if you want to instanciate it or process it using other SOP nodes.
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {PointLightSopOperation} from '../../operations/sop/PointLight';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ColorConversion} from '../../../core/Color';
import {Number2, Number3} from '../../../types/GlobalTypes';
const DEFAULT = PointLightSopOperation.DEFAULT_PARAMS;
class PointLightSopParamsConfig extends NodeParamsConfig {
	light = ParamConfig.FOLDER();
	/** @param light color */
	color = ParamConfig.COLOR(DEFAULT.color.toArray() as Number3, {
		conversion: ColorConversion.SRGB_TO_LINEAR,
	});
	/** @param light intensity */
	intensity = ParamConfig.FLOAT(DEFAULT.intensity);
	/** @param light decay */
	decay = ParamConfig.FLOAT(DEFAULT.decay);
	/** @param light distance */
	distance = ParamConfig.FLOAT(DEFAULT.distance);
	// shadows
	/** @param toggle to cast shadows */
	castShadows = ParamConfig.BOOLEAN(DEFAULT.castShadows);
	/** @param shadow res */
	shadowRes = ParamConfig.VECTOR2(DEFAULT.shadowRes.toArray() as Number2, {visibleIf: {castShadows: 1}});
	/** @param shadow bias */
	shadowBias = ParamConfig.FLOAT(DEFAULT.shadowBias, {visibleIf: {castShadows: 1}});
	/** @param shadow camera near */
	shadowNear = ParamConfig.FLOAT(DEFAULT.shadowNear, {visibleIf: {castShadows: 1}});
	/** @param shadow camera far */
	shadowFar = ParamConfig.FLOAT(DEFAULT.shadowFar, {visibleIf: {castShadows: 1}});
}
const ParamsConfig = new PointLightSopParamsConfig();

export class PointLightSopNode extends TypedSopNode<PointLightSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'pointLight';
	}

	override initializeNode() {
		this.io.inputs.setCount(0);
	}

	private _operation: PointLightSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new PointLightSopOperation(this._scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
