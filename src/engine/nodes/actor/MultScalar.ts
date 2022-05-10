/**
 * convenient node to multiply a vector by a scalar
 *
 *
 *
 */
import {BaseMathFunctionArg2ActorNode} from './_BaseMathFunction';
import {PolyDictionary} from '../../../types/GlobalTypes';
import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {Vector2} from 'three';
import {Vector3} from 'three';
import {Vector4} from 'three';
import {ActorNodeTriggerContext} from './_Base';

const DefaultValues: PolyDictionary<number> = {
	value: 1,
	mult: 1,
};

enum MultScalarActorNodeInputName {
	VALUE = 'value',
	MULT = 'mult',
}

const ALLOWED_INPUT_TYPES: ActorConnectionPointType[] = [
	ActorConnectionPointType.VECTOR2,
	ActorConnectionPointType.VECTOR3,
	ActorConnectionPointType.VECTOR4,
];

export class MultScalarActorNode extends BaseMathFunctionArg2ActorNode {
	static override type() {
		return 'multScalar';
	}

	protected override _expectedInputTypes() {
		const firstType = this.io.connection_points.first_input_connection_type();
		const type =
			firstType && ALLOWED_INPUT_TYPES.includes(firstType) ? firstType : ActorConnectionPointType.VECTOR3;
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
		let mult = this._inputValue<ActorConnectionPointType.FLOAT>(MultScalarActorNodeInputName.MULT, context);
		if (mult == null) {
			mult = 1;
		}
		vector.multiplyScalar(mult);
		return vector;
	}
	private _defaultVector = {
		v2: new Vector2(),
		v3: new Vector3(),
		v4: new Vector4(),
	};
	private _vectorInput(context: ActorNodeTriggerContext) {
		const firstInputType = this._expectedInputTypes()[0];
		switch (firstInputType) {
			case ActorConnectionPointType.VECTOR2: {
				return this._tmpVec2.copy(
					this._inputValue<ActorConnectionPointType.VECTOR2>(MultScalarActorNodeInputName.VALUE, context) ||
						this._defaultVector.v2
				);
			}
			case ActorConnectionPointType.VECTOR3: {
				return this._tmpVec3.copy(
					this._inputValue<ActorConnectionPointType.VECTOR3>(MultScalarActorNodeInputName.VALUE, context) ||
						this._defaultVector.v3
				);
			}
			case ActorConnectionPointType.VECTOR4: {
				return this._tmpVec4.copy(
					this._inputValue<ActorConnectionPointType.VECTOR4>(MultScalarActorNodeInputName.VALUE, context) ||
						this._defaultVector.v4
				);
			}
		}
	}
}
