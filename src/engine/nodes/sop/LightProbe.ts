/**
 * Creates a light probe.
 *
 * @remarks
 * This is very similar to the [object level LightProbe](https://polygonjs.com/docs/nodes/obj/LightProbe), but can be more useful if you want to instanciate it or process it using other SOP nodes.
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {LightProbeParamConfig} from '../../../core/lights/LightProbe';
import {LightProbeSopOperation} from '../../operations/sop/LightProbe';
class LightProbeSopParamsConfig extends LightProbeParamConfig(NodeParamsConfig) {}
const ParamsConfig = new LightProbeSopParamsConfig();

export class LightProbeSopNode extends TypedSopNode<LightProbeSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'lightProbe';
	}

	override initializeNode() {
		this.io.inputs.setCount(0);
	}

	private _operation: LightProbeSopOperation | undefined;
	override async cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new LightProbeSopOperation(this._scene, this.states, this);
		const coreGroup = await this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
