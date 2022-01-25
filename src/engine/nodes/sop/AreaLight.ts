/**
 * Creates an area light.
 *
 * @remarks
 * This is very similar to the [object level AreaLight](https://polygonjs.com/docs/nodes/obj/AreaLight), but can be more useful if you want to instanciate it or process it using other SOP nodes.
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {AreaLightParamConfig} from '../../../core/lights/AreaLight';
import {AreaLightSopOperation} from '../../operations/sop/AreaLight';
class AreaLightSopParamsConfig extends AreaLightParamConfig(NodeParamsConfig) {}
const ParamsConfig = new AreaLightSopParamsConfig();

export class AreaLightSopNode extends TypedSopNode<AreaLightSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'areaLight';
	}

	override initializeNode() {
		this.io.inputs.setCount(0);
	}

	private _operation: AreaLightSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new AreaLightSopOperation(this._scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
