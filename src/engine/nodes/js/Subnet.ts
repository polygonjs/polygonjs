/**
 * a subnet can contain many nodes and is very useful to organise other nodes
 *
 *
 *
 */
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {TypedJsNode, BaseJsNodeType} from './_Base';
import {JsConnectionPointType, JS_CONNECTION_POINT_TYPES} from '../utils/io/connections/Js';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {NetworkNodeType, NodeContext} from '../../poly/NodeContext';
import {JsNodeChildrenMap} from '../../poly/registers/nodes/Js';
import {SubnetOutputJsNode} from './SubnetOutput';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
import {ArrayUtils} from '../../../core/ArrayUtils';
import {IntegerParam} from '../../params/Integer';
import {StringParam} from '../../params/String';

function visibleIfInputsCountAtLeast(index: number) {
	return {
		visibleIf: ArrayUtils.range(index + 1, 10).map((i) => ({inputsCount: i})),
	};
}

function inputTypeParam(index: number) {
	return ParamConfig.INTEGER(JS_CONNECTION_POINT_TYPES.indexOf(JsConnectionPointType.FLOAT), {
		menu: {
			entries: JS_CONNECTION_POINT_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
		separatorBefore: true,
		...visibleIfInputsCountAtLeast(index),
	});
}

function inputNameParam(index: number) {
	return ParamConfig.STRING(`input${index}`, {
		...visibleIfInputsCountAtLeast(index),
	});
}

export function TypedSubnetJsParamsConfigMixin<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		main = ParamConfig.FOLDER();
		time = ParamConfig.FLOAT(0, {
			step: 0.001,
		});
		inputs = ParamConfig.FOLDER();
		inputsCount = ParamConfig.INTEGER(1, {
			range: [0, 10],
			rangeLocked: [true, true],
		});
		inputType0 = inputTypeParam(0);
		inputName0 = inputNameParam(0);
		inputType1 = inputTypeParam(1);
		inputName1 = inputNameParam(1);
		inputType2 = inputTypeParam(2);
		inputName2 = inputNameParam(2);
		inputType3 = inputTypeParam(3);
		inputName3 = inputNameParam(3);
		inputType4 = inputTypeParam(4);
		inputName4 = inputNameParam(4);
		inputType5 = inputTypeParam(5);
		inputName5 = inputNameParam(5);
		inputType6 = inputTypeParam(6);
		inputName6 = inputNameParam(6);
		inputType7 = inputTypeParam(7);
		inputName7 = inputNameParam(7);
		inputType8 = inputTypeParam(8);
		inputName8 = inputNameParam(8);
		inputType9 = inputTypeParam(9);
		inputName9 = inputNameParam(9);
		spare = ParamConfig.FOLDER();
	};
}
class TypedSubnetJsParamsConfig extends TypedSubnetJsParamsConfigMixin(NodeParamsConfig) {}
export class AbstractTypedSubnetJsNode<K extends NodeParamsConfig> extends TypedJsNode<K> {
	protected override _childrenControllerContext = NodeContext.JS;

	override initializeNode() {
		this.childrenController?.setOutputNodeFindMethod(() => {
			return this.nodesByType(SubnetOutputJsNode.type())[0];
		});

		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
	}
	protected _expectedInputTypes(): JsConnectionPointType[] {
		return [];
	}
	protected _expectedInputName(index: number) {
		return 'default';
	}

	protected _expectedOutputTypes() {
		return this._expectedInputTypes();
	}

	protected _expectedOutputName(index: number) {
		return this._expectedInputName(index);
	}
	//
	//
	// defines the outputs for the child subnet input
	//
	//
	childExpectedInputConnectionPointTypes() {
		return this._expectedInputTypes();
	}
	childExpectedOutputConnectionPointTypes() {
		return this._expectedOutputTypes();
	}
	childExpectedInputConnectionPointName(index: number) {
		return this._expectedInputName(index);
	}
	childExpectedOutputConnectionPointName(index: number) {
		return this._expectedOutputName(index);
	}

	//
	//
	// CHILDREN
	//
	//
	override createNode<S extends keyof JsNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): JsNodeChildrenMap[S];
	override createNode<K extends valueof<JsNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<JsNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BaseJsNodeType[];
	}
	override nodesByType<K extends keyof JsNodeChildrenMap>(type: K): JsNodeChildrenMap[K][] {
		return super.nodesByType(type) as JsNodeChildrenMap[K][];
	}
}

export class TypedSubnetJsNode<K extends TypedSubnetJsParamsConfig> extends AbstractTypedSubnetJsNode<K> {
	override initializeNode() {
		super.initializeNode();

		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));

		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
	}
	protected _inputTypeParams(): IntegerParam[] {
		return [
			this.p.inputType0,
			this.p.inputType1,
			this.p.inputType2,
			this.p.inputType3,
			this.p.inputType4,
			this.p.inputType5,
			this.p.inputType6,
			this.p.inputType7,
			this.p.inputType8,
			this.p.inputType9,
		];
	}
	protected _inputNameParams(): StringParam[] {
		return [
			this.p.inputName0,
			this.p.inputName1,
			this.p.inputName2,
			this.p.inputName3,
			this.p.inputName4,
			this.p.inputName5,
			this.p.inputName6,
			this.p.inputName7,
			this.p.inputName8,
			this.p.inputName9,
		];
	}

	setInputType(index: number, type: JsConnectionPointType) {
		const param = this._inputTypeParams()[index];
		if (!param) {
			return;
		}
		param.set(JS_CONNECTION_POINT_TYPES.indexOf(type));
	}
	setInputName(index: number, inputName: string) {
		const param = this._inputNameParams()[index];
		if (!param) {
			return;
		}
		param.set(inputName);
	}

	protected _expectedInputsCount(): number {
		return this.pv.inputsCount;
	}

	protected override _expectedInputTypes(): JsConnectionPointType[] {
		const count = this.pv.inputsCount;
		const params: IntegerParam[] = this._inputTypeParams();
		return ArrayUtils.range(0, count).map((value, i) => JS_CONNECTION_POINT_TYPES[params[i].value]);
	}
	protected override _expectedInputName(index: number) {
		const params: StringParam[] = this._inputNameParams();
		const param = params[index];
		return param ? param.value : JsConnectionPointType.FLOAT;
	}

	protected override _expectedOutputTypes() {
		const count = this.pv.inputsCount;
		const params: IntegerParam[] = this._inputTypeParams();
		return ArrayUtils.range(0, count).map((value, i) => JS_CONNECTION_POINT_TYPES[params[i].value]);
	}

	protected override _expectedOutputName(index: number) {
		// return this._expected_input_name(index);
		const params: StringParam[] = this._inputNameParams();
		return params[index].value;
	}
}

class SubnetJsParamsConfig extends TypedSubnetJsParamsConfigMixin(NodeParamsConfig) {}
const ParamsConfig = new SubnetJsParamsConfig();

export class SubnetJsNode extends TypedSubnetJsNode<SubnetJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return NetworkNodeType.SUBNET;
	}

	// public override outputValue(context: JsNodeTriggerContext, outputName: string) {
	// 	const subnetOutput = this.nodesByType(NetworkChildNodeType.OUTPUT)[0];
	// 	if (subnetOutput) {
	// 		return subnetOutput.outputValue(context, outputName);
	// 	} else {
	// 		return 0;
	// 	}
	// }
	// inputValueForSubnetInput(context: JsNodeTriggerContext, outputName: string) {
	// 	return this._inputValue<JsConnectionPointType>(outputName, context) || 0;
	// }
	inputNameForSubnetInput(index: number) {
		return this._expectedInputName(index);
	}
	outputNameForSubnetOutput(index: number) {
		return this._expectedOutputName(index);
	}
}
