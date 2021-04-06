/**
 * Updates the param of specific node
 *
 *
 *
 */
import {Number2, Number3, Number4} from '../../../types/GlobalTypes';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypedEventNode} from './_Base';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {TypeAssert} from '../../poly/Assert';
import {BaseParamType} from '../../params/_Base';
import {ParamType} from '../../poly/ParamType';
import {FloatParam} from '../../params/Float';
import {Vector2Param} from '../../params/Vector2';
import {Vector3Param} from '../../params/Vector3';
import {Vector4Param} from '../../params/Vector4';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {BaseNodeType} from '../_Base';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';
import {IntegerParam} from '../../params/Integer';
import {isBooleanTrue} from '../../../core/BooleanValue';

enum SetParamParamType {
	BOOLEAN = 'boolean',
	BUTTON = 'button',
	NUMBER = 'number',
	VECTOR2 = 'vector2',
	VECTOR3 = 'vector3',
	VECTOR4 = 'vector4',
	STRING = 'string',
}
const SET_PARAM_PARAM_TYPE: Array<SetParamParamType> = [
	SetParamParamType.BOOLEAN,
	SetParamParamType.BUTTON,
	SetParamParamType.NUMBER,
	SetParamParamType.VECTOR2,
	SetParamParamType.VECTOR3,
	SetParamParamType.VECTOR4,
	SetParamParamType.STRING,
];
const TYPE_BOOLEAN = SET_PARAM_PARAM_TYPE.indexOf(SetParamParamType.BOOLEAN);
// const TYPE_BUTTON = SET_PARAM_PARAM_TYPE.indexOf(SetParamParamType.BUTTON);
const TYPE_NUMBER = SET_PARAM_PARAM_TYPE.indexOf(SetParamParamType.NUMBER);
const TYPE_VECTOR2 = SET_PARAM_PARAM_TYPE.indexOf(SetParamParamType.VECTOR2);
const TYPE_VECTOR3 = SET_PARAM_PARAM_TYPE.indexOf(SetParamParamType.VECTOR3);
const TYPE_VECTOR4 = SET_PARAM_PARAM_TYPE.indexOf(SetParamParamType.VECTOR4);
const TYPE_STRING = SET_PARAM_PARAM_TYPE.indexOf(SetParamParamType.STRING);

const OUTPUT_NAME = 'output';
class SetParamParamsConfig extends NodeParamsConfig {
	/** @param the parameter to update */
	param = ParamConfig.PARAM_PATH('', {
		paramSelection: true,
		computeOnDirty: true,
	});
	// param = ParamConfig.STRING('display');
	/** @param type of the parameter to update */
	type = ParamConfig.INTEGER(TYPE_NUMBER, {
		menu: {
			entries: SET_PARAM_PARAM_TYPE.map((name, value) => {
				return {name, value};
			}),
		},
	});
	/** @param for a boolean parameter, sets to toggle its value */
	toggle = ParamConfig.BOOLEAN(0, {
		visibleIf: {type: TYPE_BOOLEAN},
	});
	/** @param if toggle is set to off, this will set the value of the parameter */
	boolean = ParamConfig.BOOLEAN(0, {
		visibleIf: {
			type: TYPE_BOOLEAN,
			toggle: 0,
		},
	});
	/** @param param value for a float parameter */
	number = ParamConfig.FLOAT(0, {
		visibleIf: {type: TYPE_NUMBER},
	});
	/** @param param value for a vector2 parameter */
	vector2 = ParamConfig.VECTOR2([0, 0], {
		visibleIf: {type: TYPE_VECTOR2},
	});
	/** @param param value for a vector3 parameter */
	vector3 = ParamConfig.VECTOR3([0, 0, 0], {
		visibleIf: {type: TYPE_VECTOR3},
	});
	/** @param param value for a vector4 parameter */
	vector4 = ParamConfig.VECTOR4([0, 0, 0, 0], {
		visibleIf: {type: TYPE_VECTOR4},
	});
	/** @param if on, the value will be incremented by the value, as opposed to be set to the value */
	increment = ParamConfig.BOOLEAN(0, {
		visibleIf: [{type: TYPE_NUMBER}, {type: TYPE_VECTOR2}, {type: TYPE_VECTOR3}, {type: TYPE_VECTOR4}],
	});
	/** @param param value for a string parameter */
	string = ParamConfig.STRING('', {
		visibleIf: {type: TYPE_STRING},
	});
	/** @param execute button to test the node */
	execute = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			SetParamEventNode.PARAM_CALLBACK_execute(node as SetParamEventNode);
		},
	});
}
const ParamsConfig = new SetParamParamsConfig();

export class SetParamEventNode extends TypedEventNode<SetParamParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'setParam';
	}
	initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new EventConnectionPoint('trigger', EventConnectionPointType.BASE),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new EventConnectionPoint(OUTPUT_NAME, EventConnectionPointType.BASE),
		]);

		this.scene().dispatchController.onAddListener(() => {
			this.params.onParamsCreated('params_label', () => {
				this.params.label.init([this.p.param]);
			});
		});
	}
	async processEvent(event_context: EventContext<Event>) {
		if (this.p.param.isDirty()) {
			// TODO: investigate occasions
			// where the referenced param is recomputed
			// (such as in a material builder)
			// and this node refers to an old param
			await this.p.param.compute();
		}
		const param = this.p.param.value.param();

		if (param) {
			const new_value = await this._new_param_value(param);
			if (new_value != null) {
				param.set(new_value);
			}
		} else {
			this.states.error.set('target param not found');
		}

		this.dispatchEventToOutput(OUTPUT_NAME, event_context);
	}

	private _tmp_vector2 = new Vector2();
	private _tmp_vector3 = new Vector3();
	private _tmp_vector4 = new Vector4();
	private _tmp_array2: Number2 = [0, 0];
	private _tmp_array3: Number3 = [0, 0, 0];
	private _tmp_array4: Number4 = [0, 0, 0, 0];
	private async _new_param_value(param: BaseParamType) {
		const type = SET_PARAM_PARAM_TYPE[this.pv.type];
		switch (type) {
			case SetParamParamType.BOOLEAN: {
				await this._compute_params_if_dirty([this.p.toggle]);
				// use 1 and 0, so we can also use it on integer params, such as for a switch node
				if (isBooleanTrue(this.pv.toggle)) {
					return param.value ? 0 : 1;
				} else {
					return isBooleanTrue(this.pv.boolean) ? 1 : 0;
				}
			}
			case SetParamParamType.BUTTON: {
				return param.options.executeCallback();
			}
			case SetParamParamType.NUMBER: {
				await this._compute_params_if_dirty([this.p.increment, this.p.number]);
				if (isBooleanTrue(this.pv.increment)) {
					if (param.type() == ParamType.FLOAT) {
						return (param as FloatParam).value + this.pv.number;
					} else {
						return (param as IntegerParam).value;
					}
				} else {
					return this.pv.number;
				}
			}
			case SetParamParamType.VECTOR2: {
				await this._compute_params_if_dirty([this.p.increment, this.p.vector2]);
				if (isBooleanTrue(this.pv.increment)) {
					if (param.type() == ParamType.VECTOR2) {
						this._tmp_vector2.copy((param as Vector2Param).value);
						this._tmp_vector2.add(this.pv.vector2);
						this._tmp_vector2.toArray(this._tmp_array2);
					} else {
						(param as Vector2Param).value.toArray(this._tmp_array2);
					}
				} else {
					this.pv.vector2.toArray(this._tmp_array2);
				}
				return this._tmp_array2;
			}
			case SetParamParamType.VECTOR3: {
				await this._compute_params_if_dirty([this.p.increment, this.p.vector3]);
				if (isBooleanTrue(this.pv.increment)) {
					if (param.type() == ParamType.VECTOR3) {
						this._tmp_vector3.copy((param as Vector3Param).value);
						this._tmp_vector3.add(this.pv.vector3);
						this._tmp_vector3.toArray(this._tmp_array3);
					} else {
						(param as Vector3Param).value.toArray(this._tmp_array3);
					}
				} else {
					this.pv.vector3.toArray(this._tmp_array3);
				}
				return this._tmp_array3;
			}
			case SetParamParamType.VECTOR4: {
				await this._compute_params_if_dirty([this.p.increment, this.p.vector4]);
				if (isBooleanTrue(this.pv.increment)) {
					if (param.type() == ParamType.VECTOR4) {
						this._tmp_vector4.copy((param as Vector4Param).value);
						this._tmp_vector4.add(this.pv.vector4);
						this._tmp_vector4.toArray(this._tmp_array4);
					} else {
						(param as Vector4Param).value.toArray(this._tmp_array4);
					}
				} else {
					this.pv.vector4.toArray(this._tmp_array4);
				}
				return this._tmp_array4;
			}
			case SetParamParamType.STRING: {
				await this._compute_params_if_dirty([this.p.string]);
				return this.pv.string;
			}
		}
		TypeAssert.unreachable(type);
	}

	static PARAM_CALLBACK_execute(node: SetParamEventNode) {
		node.processEvent({});
	}

	private async _compute_params_if_dirty(params: BaseParamType[]) {
		const dirty_params = [];
		for (let param of params) {
			if (param.isDirty()) {
				dirty_params.push(param);
			}
		}
		const promises: Promise<void>[] = [];
		for (let param of dirty_params) {
			promises.push(param.compute());
		}
		return await Promise.all(promises);
	}
}
