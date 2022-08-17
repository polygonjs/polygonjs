/**
 * clamps the input value between a min and a max
 *
 *
 *
 */
import {PolyDictionary} from '../../../types/GlobalTypes';
import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {Vector2, Vector3, Vector4} from 'three';
import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {CoreType} from '../../../core/Type';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CoreMath} from '../../../core/math/_Module';

const {fit, fitClamp} = CoreMath;
const {isNumber, isVector} = CoreType;

enum FitActorNodeInputName {
	VALUE = 'val',
	SRC_MIN = 'srcMin',
	SRC_MAX = 'srcMax',
	DEST_MIN = 'destMin',
	DEST_MAX = 'destMax',
	CLAMP_TO_DEST_RANGE = 'clampToDestRange',
}
const DefaultValues: PolyDictionary<number> = {
	[FitActorNodeInputName.VALUE]: 0,
	[FitActorNodeInputName.SRC_MIN]: 0,
	[FitActorNodeInputName.SRC_MAX]: 1,
	[FitActorNodeInputName.DEST_MIN]: 0,
	[FitActorNodeInputName.DEST_MAX]: 1,
	[FitActorNodeInputName.CLAMP_TO_DEST_RANGE]: 0,
};

const ALLOWED_INPUT_TYPES: ActorConnectionPointType[] = [
	ActorConnectionPointType.FLOAT,
	ActorConnectionPointType.VECTOR2,
	ActorConnectionPointType.VECTOR3,
	ActorConnectionPointType.VECTOR4,
];

type MixedVector =
	| ActorConnectionPointType.VECTOR2
	| ActorConnectionPointType.VECTOR3
	| ActorConnectionPointType.VECTOR4;
type MixedType = ActorConnectionPointType.FLOAT | MixedVector;

interface Vectors {
	v2: Vector2;
	v3: Vector3;
	v4: Vector4;
}
function _createVectors(): Vectors {
	return {
		v2: new Vector2(),
		v3: new Vector3(),
		v4: new Vector4(),
	};
}

class FitActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new FitActorParamsConfig();

export class FitActorNode extends TypedActorNode<FitActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'fit';
	}
	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
	}

	protected _expectedInputTypes() {
		const firstType = this.io.connection_points.first_input_connection_type();
		const type = firstType && ALLOWED_INPUT_TYPES.includes(firstType) ? firstType : ActorConnectionPointType.FLOAT;
		return [type, type, type, type, type, ActorConnectionPointType.BOOLEAN];
	}
	protected _expectedInputName(index: number) {
		return [
			FitActorNodeInputName.VALUE,
			FitActorNodeInputName.SRC_MIN,
			FitActorNodeInputName.SRC_MAX,
			FitActorNodeInputName.DEST_MIN,
			FitActorNodeInputName.DEST_MAX,
			FitActorNodeInputName.CLAMP_TO_DEST_RANGE,
		][index];
	}
	protected _expectedOutputTypes() {
		return [this._expectedInputTypes()[0]];
	}
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}

	private _valTmp = _createVectors();
	public override outputValue(context: ActorNodeTriggerContext) {
		const inputValue = this._inputValue<MixedType>(FitActorNodeInputName.VALUE, context);
		const srcMin = this._inputValue<MixedType>(FitActorNodeInputName.SRC_MIN, context);
		const srcMax = this._inputValue<MixedType>(FitActorNodeInputName.SRC_MAX, context);
		const destMin = this._inputValue<MixedType>(FitActorNodeInputName.DEST_MIN, context);
		const destMax = this._inputValue<MixedType>(FitActorNodeInputName.DEST_MAX, context);
		const clampToDestRange = this._inputValue<ActorConnectionPointType.BOOLEAN>(
			FitActorNodeInputName.CLAMP_TO_DEST_RANGE,
			context
		);
		const fitFunction = (clampToDestRange ? fitClamp : fit).bind(CoreMath);

		if (isNumber(inputValue) && isNumber(srcMin) && isNumber(srcMax) && isNumber(destMin) && isNumber(destMax)) {
			return fitFunction(inputValue, srcMin, srcMax, destMin, destMax);
		}
		if (isVector(inputValue)) {
			if (
				inputValue instanceof Vector2 &&
				srcMin instanceof Vector2 &&
				srcMax instanceof Vector2 &&
				destMin instanceof Vector2 &&
				destMax instanceof Vector2
			) {
				this._valTmp.v2.x = fitFunction(inputValue.x, srcMin.x, srcMax.x, destMin.x, destMax.x);
				this._valTmp.v2.y = fitFunction(inputValue.y, srcMin.y, srcMax.y, destMin.y, destMax.y);
				return this._valTmp.v2;
			}
			if (
				inputValue instanceof Vector3 &&
				srcMin instanceof Vector3 &&
				srcMax instanceof Vector3 &&
				destMin instanceof Vector3 &&
				destMax instanceof Vector3
			) {
				this._valTmp.v3.x = fitFunction(inputValue.x, srcMin.x, srcMax.x, destMin.x, destMax.x);
				this._valTmp.v3.y = fitFunction(inputValue.y, srcMin.y, srcMax.y, destMin.y, destMax.y);
				this._valTmp.v3.z = fitFunction(inputValue.z, srcMin.z, srcMax.z, destMin.z, destMax.z);
				return this._valTmp.v3;
			}
			if (
				inputValue instanceof Vector4 &&
				srcMin instanceof Vector4 &&
				srcMax instanceof Vector4 &&
				destMin instanceof Vector4 &&
				destMax instanceof Vector4
			) {
				this._valTmp.v4.x = fitFunction(inputValue.x, srcMin.x, srcMax.x, destMin.x, destMax.x);
				this._valTmp.v4.y = fitFunction(inputValue.y, srcMin.y, srcMax.y, destMin.y, destMax.y);
				this._valTmp.v4.z = fitFunction(inputValue.z, srcMin.z, srcMax.z, destMin.z, destMax.z);
				this._valTmp.v4.w = fitFunction(inputValue.w, srcMin.w, srcMax.w, destMin.w, destMax.w);
				return this._valTmp.v4;
			}
		}

		return 0;
	}
}
