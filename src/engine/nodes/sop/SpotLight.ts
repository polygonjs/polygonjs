/**
 * Creates a spot light.
 *
 * @remarks
 * This is very similar to the [object level SpotLight](https://polygonjs.com/docs/nodes/obj/SpotLight), but can be more useful if you want to instanciate it or process it using other SOP nodes.
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {SpotLightParamConfig} from '../../../core/lights/SpotLight';
import {SpotLightSopOperation} from '../../operations/sop/SpotLight';
import {LightType} from '../../poly/registers/nodes/types/Light';
class SpotLightSopParamsConfig extends SpotLightParamConfig(NodeParamsConfig) {}
const ParamsConfig = new SpotLightSopParamsConfig();

export class SpotLightSopNode extends TypedSopNode<SpotLightSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return LightType.SPOT;
	}

	override initializeNode() {
		this.io.inputs.setCount(0);
	}

	private _operation: SpotLightSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new SpotLightSopOperation(this._scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
