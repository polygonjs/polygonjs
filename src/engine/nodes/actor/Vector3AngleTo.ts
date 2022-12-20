/**
 * Computes the angle in radians between 2 vectors
 *
 * @remarks
 *
 *
 */
import {ParamType} from './../../poly/ParamType';
import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';

const OUTPUT_NAME = 'radians';
class Vector3AngleToActorParamsConfig extends NodeParamsConfig {
	/** @param vector 1 */
	v1 = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param vector 2 */
	v2 = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new Vector3AngleToActorParamsConfig();
export class Vector3AngleToActorNode extends TypedActorNode<Vector3AngleToActorParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'vector3AngleTo';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(OUTPUT_NAME, ActorConnectionPointType.FLOAT),
		]);
	}

	public override outputValue(context: ActorNodeTriggerContext) {
		const v1 = this._inputValueFromParam<ParamType.VECTOR3>(this.p.v1, context);
		const v2 = this._inputValueFromParam<ParamType.VECTOR3>(this.p.v2, context);

		return v1.angleTo(v2);
	}
}
