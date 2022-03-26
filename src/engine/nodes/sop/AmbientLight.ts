/**
 * Creates an ambient light.
 *
 * @remarks
 * This is very similar to the [object level AmbientLight](https://polygonjs.com/docs/nodes/obj/AmbientLight), but can be more useful if you want to instanciate it or process it using other SOP nodes.
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {AmbientLightParamConfig} from '../../../core/lights/AmbientLight';
import {AmbientLightSopOperation} from '../../operations/sop/AmbientLight';
class AmbientLightSopParamsConfig extends AmbientLightParamConfig(NodeParamsConfig) {}
const ParamsConfig = new AmbientLightSopParamsConfig();

export class AmbientLightSopNode extends TypedSopNode<AmbientLightSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'ambientLight';
	}

	override initializeNode() {
		this.io.inputs.setCount(0);
	}

	private _operation: AmbientLightSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new AmbientLightSopOperation(this._scene, this.states, this);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
