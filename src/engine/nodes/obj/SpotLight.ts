/**
 * Creates a spot light.
 *
 *
 */
import {BaseLightTransformedObjNode} from './_BaseLightTransformed';
import {TransformedParamConfig} from './utils/TransformController';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {LightType} from '../../poly/registers/nodes/types/Light';
import {SpotLightContainer, SpotLightParamConfig} from '../../../core/lights/SpotLight';
import {SpotLightSopOperation} from '../../operations/sop/SpotLight';
class SpotLightObjParamsConfig extends SpotLightParamConfig(TransformedParamConfig(NodeParamsConfig)) {}
const ParamsConfig = new SpotLightObjParamsConfig();

export class SpotLightObjNode extends BaseLightTransformedObjNode<SpotLightContainer, SpotLightObjParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return LightType.SPOT;
	}
	private __operation__: SpotLightSopOperation | undefined;
	private _operation() {
		return (this.__operation__ = this.__operation__ || new SpotLightSopOperation(this._scene, this.states, this));
	}
	createLight() {
		return this._operation().createLight(this.pv);
	}

	protected override updateLightParams() {
		this._operation().updateLightParams(this.light, this.pv);
	}
	protected override updateShadowParams() {
		this.light.updateParams(this.pv);
		this.light.updateHelper();
		this.light.updateVolumetric();

		this._operation().updateShadowParams(this.light, this.pv);
	}
}
