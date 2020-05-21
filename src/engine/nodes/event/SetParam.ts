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
	node = ParamConfig.OPERATOR_PATH('/geo1');
	param = ParamConfig.STRING('display');
	type = ParamConfig.INTEGER(TYPE_NUMBER, {
		menu: {
			entries: SET_PARAM_PARAM_TYPE.map((name, value) => {
				return {name, value};
			}),
		},
	});
	toggle = ParamConfig.BOOLEAN(0, {
		visible_if: {type: TYPE_BOOLEAN},
	});
	boolean = ParamConfig.BOOLEAN(0, {
		visible_if: {
			type: TYPE_BOOLEAN,
			toggle: 0,
		},
	});
	number = ParamConfig.FLOAT(0, {
		visible_if: {type: TYPE_NUMBER},
	});
	vector2 = ParamConfig.VECTOR2([0, 0], {
		visible_if: {type: TYPE_VECTOR2},
	});
	vector3 = ParamConfig.VECTOR3([0, 0, 0], {
		visible_if: {type: TYPE_VECTOR3},
	});
	vector4 = ParamConfig.VECTOR4([0, 0, 0, 0], {
		visible_if: {type: TYPE_VECTOR4},
	});
	increment = ParamConfig.BOOLEAN(0, {
		visible_if: [{type: TYPE_NUMBER}, {type: TYPE_VECTOR2}, {type: TYPE_VECTOR3}, {type: TYPE_VECTOR4}],
	});
	string = ParamConfig.STRING('', {
		visible_if: {type: TYPE_STRING},
	});
	execute = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			SetParamEventNode.PARAM_CALLBACK_execute(node as SetParamEventNode);
		},
	});
}
const ParamsConfig = new SetParamParamsConfig();

export class SetParamEventNode extends TypedEventNode<SetParamParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'set_param';
	}
	initialize_node() {
		this.io.inputs.set_named_input_connection_points([
			new EventConnectionPoint('trigger', EventConnectionPointType.BASE),
		]);
		this.io.outputs.set_named_output_connection_points([
			new EventConnectionPoint(OUTPUT_NAME, EventConnectionPointType.BASE),
		]);
	}
	async process_event(event_context: EventContext<Event>) {
		if (this.p.node.is_dirty) {
			await this.p.node.compute();
		}
		const node = this.p.node.found_node();
		if (node) {
			const param = node.params.get(this.pv.param);
			if (param) {
				const new_value = this._new_param_value(param);
				if (new_value != null) {
					param.set(new_value);
				}
			}
		}

		this.dispatch_event_to_output(OUTPUT_NAME, event_context);
	}

	private _new_param_value(param: BaseParamType) {
		const type = SET_PARAM_PARAM_TYPE[this.pv.type];
		switch (type) {
			case SetParamParamType.BOOLEAN: {
				if (this.pv.toggle) {
					return !param.value;
				} else {
					return this.pv.boolean;
				}
			}
			case SetParamParamType.BUTTON: {
				return param.options.execute_callback();
			}
			case SetParamParamType.NUMBER: {
				if (this.pv.increment) {
					if (param.type == ParamType.FLOAT) {
						return (param as FloatParam).value + this.pv.number;
					} else {
						return param.value;
					}
				} else {
					return this.pv.number;
				}
			}
			case SetParamParamType.VECTOR2: {
				if (this.pv.increment) {
					if (param.type == ParamType.VECTOR2) {
						return (param as Vector2Param).value.clone().add(this.pv.vector2);
					} else {
						return param.value;
					}
				} else {
					return this.pv.vector2;
				}
			}
			case SetParamParamType.VECTOR3: {
				if (this.pv.increment) {
					if (param.type == ParamType.VECTOR3) {
						return (param as Vector3Param).value.clone().add(this.pv.vector3);
					} else {
						return param.value;
					}
				} else {
					return this.pv.vector3;
				}
			}
			case SetParamParamType.VECTOR4: {
				if (this.pv.increment) {
					if (param.type == ParamType.VECTOR4) {
						return (param as Vector4Param).value.clone().add(this.pv.vector4);
					} else {
						return param.value;
					}
				} else {
					return this.pv.vector4;
				}
			}
			case SetParamParamType.STRING: {
				return this.pv.string;
			}
		}
		TypeAssert.unreachable(type);
	}

	static PARAM_CALLBACK_execute(node: SetParamEventNode) {
		node.process_event({});
	}
}
