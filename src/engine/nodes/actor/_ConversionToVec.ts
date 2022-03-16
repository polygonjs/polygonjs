import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {
	ActorConnectionPointType,
	ActorConnectionPoint,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';
import {ParamType} from '../../poly/ParamType';
const tmpV2 = new Vector2();
const tmpV3 = new Vector3();
const tmpV4 = new Vector4();

//
//
// FLOAT TO VEC2
//
//
class FloatToVec2GlParamsConfig extends NodeParamsConfig {
	x = ParamConfig.FLOAT(0);
	y = ParamConfig.FLOAT(0);
}
const ParamsConfig2 = new FloatToVec2GlParamsConfig();
export class FloatToVec2ActorNode extends TypedActorNode<FloatToVec2GlParamsConfig> {
	override paramsConfig = ParamsConfig2;
	static override type() {
		return 'floatToVec2';
	}
	static readonly OUTPUT_NAME = 'vec2';

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(FloatToVec2ActorNode.OUTPUT_NAME, ActorConnectionPointType.VECTOR2),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: string = ''
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] {
		const x = this._inputValueFromParam<ParamType.FLOAT>(this.p.x, context);
		const y = this._inputValueFromParam<ParamType.FLOAT>(this.p.y, context);
		tmpV2.set(x, y);
		return tmpV2;
	}
}

//
//
// FLOAT TO VEC3
//
//
class FloatToVec3GlParamsConfig extends NodeParamsConfig {
	x = ParamConfig.FLOAT(0);
	y = ParamConfig.FLOAT(0);
	z = ParamConfig.FLOAT(0);
}
const ParamsConfig3 = new FloatToVec3GlParamsConfig();
export class FloatToVec3ActorNode extends TypedActorNode<FloatToVec3GlParamsConfig> {
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

//
//
// FLOAT TO VEC4
//
//
class FloatToVec4GlParamsConfig extends NodeParamsConfig {
	x = ParamConfig.FLOAT(0);
	y = ParamConfig.FLOAT(0);
	z = ParamConfig.FLOAT(0);
	w = ParamConfig.FLOAT(0);
}
const ParamsConfig4 = new FloatToVec4GlParamsConfig();
export class FloatToVec4ActorNode extends TypedActorNode<FloatToVec4GlParamsConfig> {
	override paramsConfig = ParamsConfig4;
	static override type() {
		return 'floatToVec4';
	}
	static readonly OUTPUT_NAME = 'vec4';

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(FloatToVec4ActorNode.OUTPUT_NAME, ActorConnectionPointType.VECTOR4),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: string = ''
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] {
		const x = this._inputValueFromParam<ParamType.FLOAT>(this.p.x, context);
		const y = this._inputValueFromParam<ParamType.FLOAT>(this.p.y, context);
		const z = this._inputValueFromParam<ParamType.FLOAT>(this.p.z, context);
		const w = this._inputValueFromParam<ParamType.FLOAT>(this.p.w, context);
		tmpV4.set(x, y, z, w);
		return tmpV4;
	}
}
