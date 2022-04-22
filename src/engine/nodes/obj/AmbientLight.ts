/**
 * Creates an ambient light.
 *
 * @remarks
 * An ambient light will add a uniform light to every object. This can be useful to elevate the shadows slightly.
 *
 */
import {AmbientLight} from 'three';
import {TypedLightObjNode} from './_BaseLight';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {AmbientLightParamConfig} from '../../../core/lights/AmbientLight';
import {AmbientLightSopOperation} from '../../operations/sop/AmbientLight';
class AmbientLightObjParamsConfig extends AmbientLightParamConfig(NodeParamsConfig) {}
const ParamsConfig = new AmbientLightObjParamsConfig();

export class AmbientLightObjNode extends TypedLightObjNode<AmbientLight, AmbientLightObjParamsConfig> {
	override paramsConfig = ParamsConfig;

	static override type() {
		return 'ambientLight';
	}
	override initializeNode() {
		this.io.inputs.setCount(0, 1);
	}

	private __operation__: AmbientLightSopOperation | undefined;
	private _operation() {
		return (this.__operation__ =
			this.__operation__ || new AmbientLightSopOperation(this._scene, this.states, this));
	}
	createLight() {
		return this._operation().createLight();
	}

	protected override updateLightParams() {
		this._operation().updateLightParams(this.light, this.pv);
	}
}
