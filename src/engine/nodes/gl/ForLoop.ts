/**
 * creates a for loop, executing the nodes inside it on each loop
 *
 *
 *
 */

import {TypedSubnetGlNode, TypedSubnetGlParamsConfigMixin} from './Subnet';
// import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {SubnetInputGlNode} from './SubnetInput';
import {PolyDictionary} from '../../../types/GlobalTypes';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {isBooleanTrue} from '../../../core/Type';
import {GlType} from '../../poly/registers/nodes/types/Gl';
// import {ArrayUtils} from '../../../core/ArrayUtils';

enum ForLoopInput {
	START = 'start',
	MAX = 'max',
	STEP = 'step',
	I = 'i',
}
const DEFAULT_VALUES: PolyDictionary<number> = {
	[ForLoopInput.START]: 0,
	[ForLoopInput.MAX]: 10,
	[ForLoopInput.STEP]: 1,
};
const OFFSET = 0;

class ForLoopGlParamsConfig extends TypedSubnetGlParamsConfigMixin(NodeParamsConfig) {
	start = ParamConfig.FLOAT(0);
	max = ParamConfig.FLOAT(10, {
		range: [0, 100],
		rangeLocked: [false, false],
	});
	step = ParamConfig.FLOAT(1);
	asFloat = ParamConfig.BOOLEAN(0, {
		separatorAfter: true,
		// hide the param until I can find a way for the subnet outputs
		// to change type when asFloat is true
		hidden: true,
	});
}
const ParamsConfig = new ForLoopGlParamsConfig();

export class ForLoopGlNode extends TypedSubnetGlNode<ForLoopGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return GlType.FOR_LOOP;
	}

	override paramDefaultValue(name: string) {
		return DEFAULT_VALUES[name];
	}

	override childExpectedInputConnectionPointTypes() {
		const {glType} = this._typesData();
		const forLoopInputTypes: GlConnectionPointType[] = [glType, glType, glType, glType];
		return forLoopInputTypes.concat(super._expectedInputTypes());
	}
	override childExpectedInputConnectionPointName(index: number) {
		const forLoopInputNames: string[] = ['start', 'end', 'step', 'i'];
		if (index <= 3) {
			return forLoopInputNames[index];
		} else {
			return super._expectedInputName(index - 4);
		}
	}

	// protected override _expectedInputsCount() {
	// 	const current_connections = this.io.connections.inputConnections();
	// 	return current_connections ? ArrayUtils.compact(current_connections).length + 1 : 1;
	// }

	// protected override _expectedInputTypes(): GlConnectionPointType[] {
	// 	const types: GlConnectionPointType[] = [
	// 		// GlConnectionPointType.FLOAT,
	// 		// GlConnectionPointType.FLOAT,
	// 		// GlConnectionPointType.FLOAT,
	// 	];

	// 	const default_type = GlConnectionPointType.FLOAT;
	// 	const current_connections = this.io.connections.inputConnections();

	// 	const expected_count = this._expectedInputsCount();
	// 	for (let i = OFFSET; i < expected_count; i++) {
	// 		if (current_connections) {
	// 			const connection = current_connections[i];
	// 			if (connection) {
	// 				const type = connection.src_connection_point().type();
	// 				types.push(type);
	// 			} else {
	// 				types.push(default_type);
	// 			}
	// 		} else {
	// 			types.push(default_type);
	// 		}
	// 	}
	// 	return types;
	// }

	// protected override _expectedOutputTypes() {
	// 	const types: GlConnectionPointType[] = [];
	// 	const input_types = this._expectedInputTypes();
	// 	for (let i = OFFSET; i < input_types.length; i++) {
	// 		types.push(input_types[i]);
	// 	}
	// 	return types;
	// }
	// protected override _expectedInputName(index: number) {
	// 	// switch (index) {
	// 	// 	case 0:
	// 	// 		return ForLoopInput.START_INDEX;
	// 	// 	case 1:
	// 	// 		return ForLoopInput.MAX;
	// 	// 	case 2:
	// 	// 		return ForLoopInput.STEP;
	// 	// 	default: {
	// 	const connection = this.io.connections.inputConnection(index);
	// 	if (connection) {
	// 		const name = connection.src_connection_point().name();
	// 		return name;
	// 	} else {
	// 		return `in${index}`;
	// 	}
	// 	// }
	// 	// }
	// }
	// protected override _expectedOutputName(index: number) {
	// 	return this._expectedInputName(index + OFFSET);
	// }

	//
	//
	// set_lines
	//
	//
	protected override setLinesBlockStart(shaders_collection_controller: ShadersCollectionController) {
		const body_lines: string[] = [];
		// const connection_points = this.io.inputs.namedInputConnectionPoints();
		// for (let i = OFFSET; i < connection_points.length; i++) {
		// 	const connection_point = connection_points[i];
		// 	const gl_type = connection_point.type();
		// 	const out = this.glVarName(connection_point.name());
		// 	const in_value = ThreeToGl.any(this.variableForInput(connection_point.name()));
		// 	const body_line = `${gl_type} ${out} = ${in_value}`;
		// 	body_lines.push(body_line);
		// }
		// const connections = this.io.connections.inputConnections();
		// if (connections) {
		// 	for (let connection of connections) {
		// 		if (connection) {
		// 			if (connection.input_index >= OFFSET) {
		// 				const connection_point = connection.dest_connection_point();
		// 				const in_value = ThreeToGl.any(this.variableForInput(connection_point.name()));
		// 				const gl_type = connection_point.type();
		// 				const out = this.glVarName(connection_point.name());
		// 				const body_line = `${gl_type} ${out} = ${in_value}`;
		// 				body_lines.push(body_line);
		// 			}
		// 		}
		// 	}
		// }

		const start: number = this.pv.start;
		const max: number = this.pv.max;
		const step: number = this.pv.step;
		const {glType, convertMethod} = this._typesData();
		const start_str = convertMethod(start);
		const max_str = convertMethod(max);
		const step_str = convertMethod(step);
		const iterator_name = this.glVarName(ForLoopInput.I);
		const open_for_loop_line = `for(${glType} ${iterator_name} = ${start_str}; ${iterator_name} < ${max_str}; ${iterator_name}+= ${step_str}){`;
		body_lines.push(open_for_loop_line);

		shaders_collection_controller.addBodyLines(this, body_lines);
	}
	override setSubnetInputLines(
		shadersCollectionController: ShadersCollectionController,
		childNode: SubnetInputGlNode
	) {
		const {glType, convertMethod} = this._typesData();

		const body_lines: string[] = [];

		// i
		const iterator_name = this.glVarName(ForLoopInput.I);
		const i = childNode.glVarName(ForLoopInput.I);
		body_lines.push(`	${glType} ${i} = ${iterator_name}`);
		// start
		const start = childNode.glVarName(ForLoopInput.START);
		body_lines.push(`	${glType} ${start} = ${convertMethod(this.pv.start)}`);
		// end
		const max = childNode.glVarName(ForLoopInput.MAX);
		body_lines.push(`	${glType} ${max} = ${convertMethod(this.pv.max)}`);
		// step
		const step = childNode.glVarName(ForLoopInput.STEP);
		body_lines.push(`	${glType} ${step} = ${convertMethod(this.pv.step)}`);

		const connections = this.io.connections.inputConnections();
		if (connections) {
			for (const connection of connections) {
				if (connection) {
					if (connection.inputIndex() >= OFFSET) {
						const connection_point = connection.destConnectionPoint();
						const in_value = this.glVarName(connection_point.name());
						const gl_type = connection_point.type();
						const out = childNode.glVarName(connection_point.name());
						const body_line = `	${gl_type} ${out} = ${in_value}`;
						body_lines.push(body_line);
					}
				}
			}
		}

		shadersCollectionController.addBodyLines(childNode, body_lines);
	}

	private _typesData() {
		const asFloat = isBooleanTrue(this.pv.asFloat);
		const convertMethod = asFloat ? ThreeToGl.float : ThreeToGl.integer;
		const glType = asFloat ? GlConnectionPointType.FLOAT : GlConnectionPointType.INT;
		return {convertMethod, glType};
	}

	// override setLines(shaders_collection_controller: ShadersCollectionController) {}
}
