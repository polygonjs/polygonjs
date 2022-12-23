/**
 * Vector3ProjectActorParamsConfig
 *
 *
 *
 */
import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
import {Vector3} from 'three';
import {ParamType} from '../../poly/ParamType';

const OUTPUT_NAME = 'position';
const tmpV3 = new Vector3();
class Vector3ProjectOnPlaneActorParamsConfig extends NodeParamsConfig {
	/** @param vector3 */
	Vector3 = ParamConfig.VECTOR3([1, 0, 0]);
	/** @param planeNormal */
	planeNormal = ParamConfig.VECTOR3([0, 1, 0]);
}
const ParamsConfig = new Vector3ProjectOnPlaneActorParamsConfig();
export class Vector3ProjectOnPlaneActorNode extends TypedActorNode<Vector3ProjectOnPlaneActorParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'vector3ProjectOnPlane';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(OUTPUT_NAME, ActorConnectionPointType.VECTOR3),
		]);
	}

	public override outputValue(context: ActorNodeTriggerContext) {
		const v3 = this._inputValueFromParam<ParamType.VECTOR3>(this.p.Vector3, context);
		const planeNormal = this._inputValueFromParam<ParamType.VECTOR3>(this.p.planeNormal, context);
		tmpV3.copy(v3);
		tmpV3.projectOnPlane(planeNormal);
		return tmpV3;
	}
}
