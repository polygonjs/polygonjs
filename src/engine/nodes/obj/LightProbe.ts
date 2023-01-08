/**
 * Creates a light probe.
 *
 *
 */
import {LightProbe} from 'three';
import {TypedLightObjNode} from './_BaseLight';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {LightType} from '../../poly/registers/nodes/types/Light';
import {LightProbeParamConfig} from '../../../core/lights/LightProbe';
import {LightProbeSopOperation} from '../../operations/sop/LightProbe';

class LightProbeObjParamsConfig extends LightProbeParamConfig(NodeParamsConfig) {}
const ParamsConfig = new LightProbeObjParamsConfig();

export class LightProbeObjNode extends TypedLightObjNode<LightProbe, LightProbeObjParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return LightType.PROBE;
	}

	private __operation__: LightProbeSopOperation | undefined;
	private _operation() {
		return (this.__operation__ = this.__operation__ || new LightProbeSopOperation(this._scene, this.states, this));
	}
	override createLight() {
		return this._operation().createLight();
	}

	protected override updateLightParams() {
		this._operation().updateLightParams(this.light, this.pv);
	}
}
