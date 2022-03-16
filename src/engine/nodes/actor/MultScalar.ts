/**
 * convenient node to multiply a vector by a scalar
 *
 *
 *
 */
import {BaseMathFunctionArg2ActorNode} from './_BaseMathFunction';
import {PolyDictionary} from '../../../types/GlobalTypes';
import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';
import {ActorNodeTriggerContext} from './_Base';

const DefaultValues: PolyDictionary<number> = {
	value: 1,
	mult: 1,
};

enum MultScalarActorNodeInputName {
	VALUE = 'value',
	MULT = 'mult',
}

export class MultScalarActorNode extends BaseMathFunctionArg2ActorNode {
	static override type() {
		return 'multScalar';
	}

	protected override _expectedInputTypes() {
		const type = this.io.connection_points.first_input_connection_type() || ActorConnectionPointType.VECTOR3;
		return [type, ActorConnectionPointType.FLOAT];
	}
	protected override _expectedInputName(index: number) {
		return [MultScalarActorNodeInputName.VALUE, MultScalarActorNodeInputName.MULT][index];
	}
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}

	private _tmpVec2 = new Vector2();
	private _tmpVec3 = new Vector3();
	private _tmpVec4 = new Vector4();
	public override outputValue(context: ActorNodeTriggerContext) {
		const vector = this._vectorInput(context);
		if (!vector) {
			return this._tmpVec3;
		}
		const mult = this._inputValue<ActorConnectionPointType.FLOAT>(MultScalarActorNodeInputName.MULT, context);
		vector.multiplyScalar(mult);
		return vector;
	}
	private _vectorInput(context: ActorNodeTriggerContext) {
		const firstInputType = this._expectedInputTypes()[0];
		switch (firstInputType) {
			case ActorConnectionPointType.VECTOR2: {
				return this._tmpVec2.copy(
					this._inputValue<ActorConnectionPointType.VECTOR2>(MultScalarActorNodeInputName.VALUE, context)
				);
			}
			case ActorConnectionPointType.VECTOR3: {
				return this._tmpVec3.copy(
					this._inputValue<ActorConnectionPointType.VECTOR3>(MultScalarActorNodeInputName.VALUE, context)
				);
			}
			case ActorConnectionPointType.VECTOR4: {
				return this._tmpVec4.copy(
					this._inputValue<ActorConnectionPointType.VECTOR4>(MultScalarActorNodeInputName.VALUE, context)
				);
			}
		}
	}
}
