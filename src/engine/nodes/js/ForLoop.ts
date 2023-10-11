/**
 * creates a for loop, executing the nodes inside it on each loop
 *
 *
 *
 */

import {TypedSubnetJsNode, TypedSubnetJsParamsConfigMixin} from './Subnet';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {SubnetInputJsNode} from './SubnetInput';
import {PolyDictionary} from '../../../types/GlobalTypes';
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';

export enum ForLoopJsInputName {
	START = 'start',
	MAX = 'max',
	STEP = 'step',
	I = 'i',
}
const DEFAULT_VALUES: PolyDictionary<number> = {
	[ForLoopJsInputName.START]: 0,
	[ForLoopJsInputName.MAX]: 10,
	[ForLoopJsInputName.STEP]: 1,
};
// const OFFSET = 0;
// enum ForLoopJsInputName {
// 	START = 'start',
// 	END = 'end',
// 	STEP = 'step',
// 	I='i'
// }
const FOR_LOOP_INPUT_NAMES: ForLoopJsInputName[] = [
	ForLoopJsInputName.START,
	ForLoopJsInputName.MAX,
	ForLoopJsInputName.STEP,
	ForLoopJsInputName.I,
];

class ForLoopJsParamsConfig extends TypedSubnetJsParamsConfigMixin(NodeParamsConfig) {
	start = ParamConfig.FLOAT(0);
	max = ParamConfig.FLOAT(10, {
		range: [0, 100],
		rangeLocked: [false, false],
	});
	step = ParamConfig.FLOAT(1);
}
const ParamsConfig = new ForLoopJsParamsConfig();

export class ForLoopJsNode extends TypedSubnetJsNode<ForLoopJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return JsType.FOR_LOOP;
	}

	override paramDefaultValue(name: string) {
		return DEFAULT_VALUES[name];
	}

	protected override _expectedInputTypes(): JsConnectionPointType[] {
		const type = JsConnectionPointType.INT;
		const forLoopInputTypes: JsConnectionPointType[] = [type, type, type]; // start, end, step (no i)
		return forLoopInputTypes.concat(super._expectedInputTypes());
	}
	protected override _expectedInputName(index: number) {
		if (index <= 2) {
			return FOR_LOOP_INPUT_NAMES[index];
		} else {
			return super._expectedInputName(index - 3);
		}
	}

	override childExpectedInputConnectionPointTypes() {
		// return this._expectedInputTypes();
		const type = JsConnectionPointType.INT;
		const forLoopInputTypes: JsConnectionPointType[] = [type, type, type, type]; // start, end, step, i (yes i)
		return forLoopInputTypes.concat(super._expectedInputTypes());
	}
	override childExpectedInputConnectionPointName(index: number) {
		// return this._expectedInputName(index);
		if (index <= 3) {
			return FOR_LOOP_INPUT_NAMES[index];
		} else {
			return super._expectedInputName(index - 4);
		}
	}
	override inputNameForSubnetInput(index: number) {
		return this.childExpectedInputConnectionPointName(index);
	}

	//
	//
	// set_lines
	//
	//
	protected override setLinesBlockStart(linesController: JsLinesCollectionController) {
		// const start = this.variableForInputParam(linesController, this.p.start);
		// const max = this.variableForInputParam(linesController, this.p.max);
		// const step = this.variableForInputParam(linesController, this.p.step);
		const start = this.jsVarName(ForLoopJsInputName.START);
		const max = this.jsVarName(ForLoopJsInputName.MAX);
		const step = this.jsVarName(ForLoopJsInputName.STEP);
		const i = this.jsVarName(ForLoopJsInputName.I);

		const bodyLine = `for( ${i} = ${start}; ${i} < ${max}; ${i}+= ${step}){`;

		linesController._addBodyLines(this, [bodyLine]);
	}
	override setSubnetInputLines(linesController: JsLinesCollectionController, childNode: SubnetInputJsNode) {
		const outputTypes = childNode.expectedOutputTypes();
		let i = 0;

		for (const _ of outputTypes) {
			const inputName = this.inputNameForSubnetInput(i);
			const inputValue = this.jsVarName(inputName);
			// const dataType = outputTypes[0];
			const varName = childNode.jsVarName(inputName);
			linesController._addBodyLines(childNode, [`${varName}=${inputValue}`]);
			i++;
		}
	}
	// override setSubnetInputLines(linesController: JsLinesCollectionController, childNode: SubnetInputJsNode) {
	// 	const start = this.variableForInputParam(linesController, this.p.start);
	// 	const max = this.variableForInputParam(linesController, this.p.max);
	// 	const step = this.variableForInputParam(linesController, this.p.step);

	// 	const body_lines: string[] = [];

	// 	// i
	// 	const iterator_name = this.jsVarName(ForLoopInput.I);
	// 	const i = childNode.jsVarName(ForLoopInput.I);
	// 	body_lines.push(`	const ${i} = ${iterator_name}`);
	// 	// start
	// 	const startVar = childNode.jsVarName(ForLoopInput.START);
	// 	body_lines.push(`	const ${startVar} = ${start}`);
	// 	// end
	// 	const maxVar = childNode.jsVarName(ForLoopInput.MAX);
	// 	body_lines.push(`	const ${maxVar} = ${max}`);
	// 	// step
	// 	const stepVar = childNode.jsVarName(ForLoopInput.STEP);
	// 	body_lines.push(`	const ${stepVar} = ${step}`);

	// 	const connections = this.io.connections.inputConnections();
	// 	if (connections) {
	// 		for (const connection of connections) {
	// 			if (connection) {
	// 				if (connection.inputIndex() >= OFFSET) {
	// 					const connection_point = connection.destConnectionPoint();
	// 					if (connection_point) {
	// 						const in_value = this.jsVarName(connection_point.name());
	// 						const gl_type = connection_point.type();
	// 						const out = childNode.jsVarName(connection_point.name());
	// 						const body_line = `	${gl_type} ${out} = ${in_value}`;
	// 						body_lines.push(body_line);
	// 					}
	// 				}
	// 			}
	// 		}
	// 	}

	// 	linesController._addBodyLines(childNode, body_lines);
	// }
}
