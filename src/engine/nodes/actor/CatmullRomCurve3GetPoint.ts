/**
 * returns the point of a CatmullRomCurve3 at the t position
 *
 * @remarks
 *
 *
 */

import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {Vector3} from 'three';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {ParamType} from '../../poly/ParamType';
const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class CatmullRomCurve3GetPointActorParamsConfig extends NodeParamsConfig {
	t = ParamConfig.FLOAT(0, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new CatmullRomCurve3GetPointActorParamsConfig();

const T_NAME = 't';
const OUTPUT_NAME = 'position';
export class CatmullRomCurve3GetPointActorNode extends TypedActorNode<CatmullRomCurve3GetPointActorParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'catmullRomCurve3GetPoint';
	}
	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(
				ActorConnectionPointType.CATMULL_ROM_CURVE3,
				ActorConnectionPointType.CATMULL_ROM_CURVE3,
				CONNECTION_OPTIONS
			),
			new ActorConnectionPoint(T_NAME, ActorConnectionPointType.FLOAT, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(OUTPUT_NAME, ActorConnectionPointType.VECTOR3),
		]);
	}

	private _curvePos = new Vector3();
	public override outputValue(context: ActorNodeTriggerContext) {
		const curve = this._inputValue<ActorConnectionPointType.CATMULL_ROM_CURVE3>(
			ActorConnectionPointType.CATMULL_ROM_CURVE3,
			context
		);
		if (!curve) {
			return this._curvePos;
		}
		const t = this._inputValueFromParam<ParamType.FLOAT>(this.p.t, context);
		curve.getPoint(t, this._curvePos);
		return this._curvePos;
	}
}
