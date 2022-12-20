/**
 * creates a plane
 *
 * @remarks
 *
 *
 */
import {ParamType} from './../../poly/ParamType';
import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
import {Plane} from 'three';
// import {BaseNodeType} from '../_Base';

const OUTPUT_NAME = ActorConnectionPointType.PLANE;
class PlaneActorParamsConfig extends NodeParamsConfig {
	/** @param a unit length vector defining the normal of the plane */
	normal = ParamConfig.VECTOR3([0, 1, 0]);
	/** @param the signed distance from the origin to the plane */
	constant = ParamConfig.FLOAT(0, {
		range: [-1, 1],
		rangeLocked: [false, false],
	});
}
const ParamsConfig = new PlaneActorParamsConfig();
export class PlaneActorNode extends TypedActorNode<PlaneActorParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'plane';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(OUTPUT_NAME, ActorConnectionPointType.PLANE),
		]);
	}

	private _plane = new Plane();
	public override outputValue(context: ActorNodeTriggerContext) {
		const normal = this._inputValueFromParam<ParamType.VECTOR3>(this.p.normal, context);
		const constant = this._inputValueFromParam<ParamType.FLOAT>(this.p.constant, context);

		this._plane.normal.copy(normal);
		this._plane.constant = constant;

		return this._plane;
	}
}
