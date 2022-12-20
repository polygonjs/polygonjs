/**
 * creates a Vector2
 *
 * @remarks
 *
 *
 */
import {ParamType} from './../../poly/ParamType';
import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
import {Vector2} from 'three';

const OUTPUT_NAME = ActorConnectionPointType.VECTOR3;
class Vector2ActorParamsConfig extends NodeParamsConfig {
	/** @param vector value */
	Vector2 = ParamConfig.VECTOR2([0, 0]);
}
const ParamsConfig = new Vector2ActorParamsConfig();
export class Vector2ActorNode extends TypedActorNode<Vector2ActorParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'vector2';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(OUTPUT_NAME, ActorConnectionPointType.VECTOR2),
		]);
	}

	private _tmpV2 = new Vector2();
	public override outputValue(context: ActorNodeTriggerContext) {
		const Vector2 = this._inputValueFromParam<ParamType.VECTOR2>(this.p.Vector2, context);

		this._tmpV2.copy(Vector2);

		return this._tmpV2;
	}
}
