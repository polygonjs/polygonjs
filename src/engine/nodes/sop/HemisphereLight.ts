/**
 * Creates a hemisphere light.
 *
 * @remarks
 * This is very similar to the [object level HemisphereLight](https://polygonjs.com/docs/nodes/obj/HemisphereLight), but can be more useful if you want to instanciate it or process it using other SOP nodes.
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {HemisphereLightParamConfig} from '../../../core/lights/HemisphereLight';
import {HemisphereLightSopOperation} from '../../operations/sop/HemisphereLight';
class HemisphereLightSopParamsConfig extends HemisphereLightParamConfig(NodeParamsConfig) {}
const ParamsConfig = new HemisphereLightSopParamsConfig();

export class HemisphereLightSopNode extends TypedSopNode<HemisphereLightSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'hemisphereLight';
	}

	override initializeNode() {
		this.io.inputs.setCount(0);
	}

	private _operation: HemisphereLightSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new HemisphereLightSopOperation(this._scene, this.states, this);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
