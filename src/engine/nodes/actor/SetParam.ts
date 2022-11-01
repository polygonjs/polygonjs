/**
 * Updates the param of specific node
 *
 *
 */
import {IntegerParam} from './../../params/Integer';
import {FloatParam} from './../../params/Float';
import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
	PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {BaseParamType} from '../../params/_Base';
import {ParamType} from '../../poly/ParamType';
import {CoreType} from '../../../core/Type';
import {Number2, Number3, Number4} from '../../../types/GlobalTypes';
import {Color, Vector2, Vector3, Vector4} from 'three';
import {ColorParam} from '../../params/Color';
import {Vector3Param} from '../../params/Vector3';
import {Vector2Param} from '../../params/Vector2';
import {Vector4Param} from '../../params/Vector4';
const tmpColor = new Color();
const tmpV2 = new Vector2();
const tmpV3 = new Vector3();
const tmpV4 = new Vector4();
const tmpV2Array: Number2 = [0, 0];
const tmpV3Array: Number3 = [0, 0, 0];
const tmpV4Array: Number4 = [0, 0, 0, 0];

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class SetParamActorParamsConfig extends NodeParamsConfig {
	/** @param the parameter to update */
	param = ParamConfig.PARAM_PATH('', {
		dependentOnFoundParam: false,
		paramSelection: true,
		computeOnDirty: true,
	});
	/** @param type of the parameter to update */
	type = ParamConfig.INTEGER(PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.indexOf(ActorConnectionPointType.FLOAT), {
		menu: {
			entries: PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.map((name, value) => {
				return {name, value};
			}),
		},
	});
	/** @param lerp factor */
	// lerp = ParamConfig.FLOAT(1);
}
const ParamsConfig = new SetParamActorParamsConfig();

export class SetParamActorNode extends TypedActorNode<SetParamActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setParam';
	}
	static INPUT_NAME_VAL = 'val';

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new ActorConnectionPoint<ActorConnectionPointType.FLOAT>('lerp', ActorConnectionPointType.FLOAT, {
				...CONNECTION_OPTIONS,
				init_value: 1,
			}),
		]);

		// this.io.outputs.setNamedOutputConnectionPoints([
		// 	new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		// ]);

		this.io.connection_points.set_input_name_function(() => SetParamActorNode.INPUT_NAME_VAL);
		this.io.connection_points.set_expected_input_types_function(() => [this._currentConnectionType()]);
		this.io.connection_points.set_output_name_function(() => TRIGGER_CONNECTION_NAME);
		this.io.connection_points.set_expected_output_types_function(() => [ActorConnectionPointType.TRIGGER]);
	}
	private _currentConnectionType() {
		if (this.pv.type == null) {
			console.warn(`${this.type()} actor node type not valid`);
		}
		const connectionType = PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES[this.pv.type];
		if (connectionType == null) {
			console.warn(`${this.type()} actor node type not valid`);
		}
		return connectionType || ActorConnectionPointType.FLOAT;
	}
	setParamType(paramType: ActorConnectionPointType) {
		const index = PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.indexOf(paramType);
		if (index < 0) {
			console.warn(
				`only the following types are accepted: ${PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.join(', ')}`
			);
			return;
		}
		this.p.type.set(index);
	}

	public override async receiveTrigger(context: ActorNodeTriggerContext) {
		if (this.p.param.isDirty()) {
			// TODO: investigate occasions
			// where the referenced param is recomputed
			// (such as in a material builder)
			// and this node refers to an old param
			await this.p.param.compute();
		}
		const param = this.p.param.value.param();

		if (param) {
			const value = this._inputValue(SetParamActorNode.INPUT_NAME_VAL, context);
			const lerp = this._inputValue('lerp', context) as number;
			if (value != null) {
				this._setParam(value, param, lerp);
			}
		} else {
			this.states.error.set('target param not found');
		}

		this.runTrigger(context);
	}
	private _setParam<T extends ActorConnectionPointType>(
		val: ReturnValueTypeByActorConnectionPointType[T],
		param: BaseParamType,
		lerp: number
	) {
		const paramType = param.type();
		switch (paramType) {
			case ParamType.BOOLEAN: {
				if (CoreType.isBoolean(val)) {
					return param.set(val);
				}
			}
			case ParamType.COLOR: {
				if (CoreType.isColor(val)) {
					if (lerp == 1) {
						val.toArray(tmpV3Array);
					} else {
						tmpColor.copy((param as ColorParam).value);
						tmpColor.lerp(val, lerp);
						tmpColor.toArray(tmpV3Array);
					}
					return param.set(tmpV3Array);
				}
			}
			case ParamType.FLOAT: {
				if (CoreType.isNumber(val)) {
					return (param as FloatParam).set(val * lerp + (1 - lerp) * (param as FloatParam).value);
				}
			}
			case ParamType.INTEGER: {
				if (CoreType.isNumber(val)) {
					return (param as IntegerParam).set(val * lerp + (1 - lerp) * (param as IntegerParam).value);
				}
			}
			case ParamType.STRING: {
				if (CoreType.isString(val)) {
					return param.set(val);
				}
			}
			case ParamType.VECTOR2: {
				if (val instanceof Vector2) {
					if (lerp == 1) {
						val.toArray(tmpV2Array);
					} else {
						tmpV2.copy((param as Vector2Param).value);
						tmpV2.lerp(val, lerp);
						tmpV2.toArray(tmpV2Array);
					}
					return param.set(tmpV2Array);
				}
			}
			case ParamType.VECTOR3: {
				if (val instanceof Vector3) {
					if (lerp == 1) {
						val.toArray(tmpV3Array);
					} else {
						tmpV3.copy((param as Vector3Param).value);
						tmpV3.lerp(val, lerp);
						tmpV3.toArray(tmpV3Array);
					}
					return param.set(tmpV3Array);
				}
			}
			case ParamType.VECTOR4: {
				if (val instanceof Vector4) {
					if (lerp == 1) {
						val.toArray(tmpV4Array);
					} else {
						tmpV4.copy((param as Vector4Param).value);
						tmpV4.lerp(val, lerp);
						tmpV4.toArray(tmpV4Array);
					}
					return param.set(tmpV4Array);
				}
			}
		}
	}
}
