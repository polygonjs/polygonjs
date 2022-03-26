/**
 * Creates a directional light.
 *
 * @remarks
 * This is very similar to the [object level DirectionalLight](https://polygonjs.com/docs/nodes/obj/DirectionalLight), but can be more useful if you want to instanciate it or process it using other SOP nodes.
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {DirectionalLightParamConfig} from '../../../core/lights/DirectionalLight';
import {DirectionalLightSopOperation} from '../../operations/sop/DirectionalLight';
import {LightType} from '../../poly/registers/nodes/types/Light';
class DirectionalLightSopParamsConfig extends DirectionalLightParamConfig(NodeParamsConfig) {}
const ParamsConfig = new DirectionalLightSopParamsConfig();

export class DirectionalLightSopNode extends TypedSopNode<DirectionalLightSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return LightType.DIRECTIONAL;
	}

	override initializeNode() {
		this.io.inputs.setCount(0);
	}

	private _operation: DirectionalLightSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new DirectionalLightSopOperation(this._scene, this.states, this);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
