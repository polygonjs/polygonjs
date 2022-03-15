/**
 * Creates a point light.
 *
 * @remarks
 * This is very similar to the [object level PointLight](https://polygonjs.com/docs/nodes/obj/PointLight), but can be more useful if you want to instanciate it or process it using other SOP nodes.
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {PointLightParamConfig} from '../../../core/lights/PointLight';
import {PointLightSopOperation} from '../../operations/sop/PointLight';
import {LightType} from '../../poly/registers/nodes/types/Light';
class PointLightSopParamsConfig extends PointLightParamConfig(NodeParamsConfig) {}
const ParamsConfig = new PointLightSopParamsConfig();

export class PointLightSopNode extends TypedSopNode<PointLightSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return LightType.POINT;
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
