/**
 * Creates a hemisphere light.
 *
 *
 */
import {HemisphereLight} from 'three/src/lights/HemisphereLight';
import {TypedLightObjNode} from './_BaseLight';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {LightType} from '../../poly/registers/nodes/types/Light';
import {HemisphereLightParamConfig} from '../../../core/lights/HemisphereLight';
import {HemisphereLightSopOperation} from '../../operations/sop/HemisphereLight';

class HemisphereLightObjParamsConfig extends HemisphereLightParamConfig(NodeParamsConfig) {}
const ParamsConfig = new HemisphereLightObjParamsConfig();

export class HemisphereLightObjNode extends TypedLightObjNode<HemisphereLight, HemisphereLightObjParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return LightType.HEMISPHERE;
	}

	private __operation__: HemisphereLightSopOperation | undefined;
	private _operation() {
		return (this.__operation__ =
			this.__operation__ || new HemisphereLightSopOperation(this._scene, this.states, this));
	}
	override createLight() {
		return this._operation().createLight();
	}

	protected override updateLightParams() {
		this._operation().updateLightParams(this.light, this.pv);
	}
}
