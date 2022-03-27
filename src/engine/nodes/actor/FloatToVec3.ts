import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {
	ActorConnectionPointType,
	ActorConnectionPoint,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Vector3} from 'three/src/math/Vector3';
import {ParamType} from '../../poly/ParamType';
const tmpV3 = new Vector3();

class FloatToVec3ActorParamsConfig extends NodeParamsConfig {
	x = ParamConfig.FLOAT(0);
	y = ParamConfig.FLOAT(0);
	z = ParamConfig.FLOAT(0);
}
const ParamsConfig3 = new FloatToVec3ActorParamsConfig();
export class FloatToVec3ActorNode extends TypedActorNode<FloatToVec3ActorParamsConfig> {
	override paramsConfig = ParamsConfig3;
	static override type() {
		return 'floatToVec3';
	}
	static readonly OUTPUT_NAME = 'vec3';

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(FloatToVec3ActorNode.OUTPUT_NAME, ActorConnectionPointType.VECTOR3),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: string = ''
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] {
		const x = this._inputValueFromParam<ParamType.FLOAT>(this.p.x, context);
		const y = this._inputValueFromParam<ParamType.FLOAT>(this.p.y, context);
		const z = this._inputValueFromParam<ParamType.FLOAT>(this.p.z, context);
		tmpV3.set(x, y, z);
		return tmpV3;
	}
}
