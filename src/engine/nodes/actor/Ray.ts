/**
 * creates a ay
 *
 * @remarks
 *
 *
 */
import {ParamType} from './../../poly/ParamType';
import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {Ray} from 'three';

const OUTPUT_NAME = ActorConnectionPointType.PLANE;
class RayActorParamsConfig extends NodeParamsConfig {
	/** @param ray origin */
	origin = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param ray direction */
	direction = ParamConfig.VECTOR3([0, 0, 1]);
}
const ParamsConfig = new RayActorParamsConfig();
export class RayActorNode extends TypedActorNode<RayActorParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'ray';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(OUTPUT_NAME, ActorConnectionPointType.RAY),
		]);
	}

	private _ray = new Ray();
	public override outputValue(
		context: ActorNodeTriggerContext
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType.RAY] {
		const origin = this._inputValueFromParam<ParamType.VECTOR3>(this.p.origin, context);
		const direction = this._inputValueFromParam<ParamType.VECTOR3>(this.p.direction, context);

		this._ray.origin.copy(origin);
		this._ray.direction.copy(direction);

		return this._ray;
	}
}
