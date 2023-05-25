/**
 * executes the nodes inside it based on an input condition
 *
 *
 *
 */

import {TypedSubnetGlNode, TypedSubnetGlParamsConfigMixin} from './Subnet';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ThreeToGl} from '../../../core/ThreeToGl';
// import {SubnetInputGlNode} from './SubnetInput';
// import {ArrayUtils} from '../../../core/ArrayUtils';
import {SubnetInputGlNode} from './SubnetInput';

const CONDITION_INPUT_NAME = 'condition';

class IfThenGlParamsConfig extends TypedSubnetGlParamsConfigMixin(NodeParamsConfig) {}
const ParamsConfig = new IfThenGlParamsConfig();

export class IfThenGlNode extends TypedSubnetGlNode<IfThenGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<'ifThen'> {
		return 'ifThen';
	}

	// protected override _expectedInputsCount() {
	// 	const current_connections = this.io.connections.inputConnections();
	// 	return current_connections ? Math.max(ArrayUtils.compact(current_connections).length + 1, 2) : 2;
	// }

	protected override _expectedInputTypes(): GlConnectionPointType[] {
		return [GlConnectionPointType.BOOL, ...super._expectedInputTypes()];
	}

	protected override _expectedInputName(index: number) {
		if (index == 0) {
			return CONDITION_INPUT_NAME;
		} else {
			return super._expectedInputName(index - 1);
		}
	}
	override childExpectedInputConnectionPointTypes() {
		const subnetInputTypes = super.childExpectedInputConnectionPointTypes();
		const types: GlConnectionPointType[] = [];
		for (let i = 1; i < subnetInputTypes.length; i++) {
			types.push(subnetInputTypes[i]);
		}
		return types;
	}
	override childExpectedInputConnectionPointName(index: number) {
		return super.childExpectedInputConnectionPointName(index + 1);
	}

	//
	//
	// set_lines
	//
	//
	protected override _setLinesPreBlock(shadersCollectionController: ShadersCollectionController) {
		const body_lines: string[] = [];
		const connectionPoints = this.io.inputs.namedInputConnectionPoints();
		for (let i = 0; i < connectionPoints.length; i++) {
			const connectionPoint = connectionPoints[i];
			const connectionPointName = connectionPoint.name();
			if (connectionPointName != CONDITION_INPUT_NAME) {
				const gl_type = connectionPoint.type();
				const out = this.glVarName(connectionPointName);
				const in_value = ThreeToGl.any(this.variableForInput(connectionPointName));
				const body_line = `${gl_type} ${out} = ${in_value}`;
				body_lines.push(body_line);
			}
		}

		shadersCollectionController.addBodyLines(this, body_lines);
	}
	override setSubnetInputLines(
		shadersCollectionController: ShadersCollectionController,
		childNode: SubnetInputGlNode
	) {
		const connections = this.io.connections.inputConnections();
		if (!connections) {
			return;
		}
		const body_lines: string[] = [];
		for (let connection of connections) {
			if (connection) {
				const connectionPoint = connection.dest_connection_point();
				const connectionPointName = connectionPoint.name();
				if (connectionPointName != CONDITION_INPUT_NAME) {
					const in_value = ThreeToGl.any(this.variableForInput(connectionPointName));
					const gl_type = connectionPoint.type();
					const out = childNode.glVarName(connectionPointName);
					const body_line = `	${gl_type} ${out} = ${in_value}`;
					body_lines.push(body_line);
				}
			}
		}
		shadersCollectionController.addBodyLines(childNode, body_lines);
	}
	protected override setLinesBlockStart(shaders_collection_controller: ShadersCollectionController) {
		const body_lines: string[] = [];
		const condition_value = ThreeToGl.any(this.variableForInput(CONDITION_INPUT_NAME));
		const open_if_line = `if(${condition_value}){`;
		body_lines.push(open_if_line);

		shaders_collection_controller.addBodyLines(this, body_lines);
	}
}
