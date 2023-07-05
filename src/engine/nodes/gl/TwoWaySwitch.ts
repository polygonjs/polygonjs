/**
 * outputs 1 of the 2 inputs based on a boolean input
 *
 * @remarks
 *
 * This node is frequently used with the [gl/Compare](/docs/nodes/gl/Compare).
 *
 * For more involved use cases where you'd like to switch between more than 2 values, use the [gl/Switch](/docs/nodes/gl/Switch) instead.
 *
 */

import {ParamlessTypedGlNode} from './_Base';
import {ThreeToGl} from '../../../core/ThreeToGl';
// import {GlConnectionsController} from './utils/GLConnectionsController';

const OUTPUT_NAME = 'val';
enum TwoWaySwitchGlNodeInputName {
	CONDITION = 'condition',
	IF_TRUE = 'ifTrue',
	IF_FALSE = 'ifFalse',
}
const InputNames: Array<TwoWaySwitchGlNodeInputName> = [
	TwoWaySwitchGlNodeInputName.CONDITION,
	TwoWaySwitchGlNodeInputName.IF_TRUE,
	TwoWaySwitchGlNodeInputName.IF_FALSE,
];

import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
export class TwoWaySwitchGlNode extends ParamlessTypedGlNode {
	static override type() {
		return 'twoWaySwitch';
	}

	// public readonly gl_connections_controller: GlConnectionsController = new GlConnectionsController(this);
	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.initializeNode();

		this.io.connection_points.set_expected_input_types_function(this._expected_input_types.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expected_output_types.bind(this));
		this.io.connection_points.set_input_name_function(this._gl_input_name.bind(this));
		this.io.connection_points.set_output_name_function(this._gl_output_name.bind(this));
	}

	protected _gl_input_name(index: number) {
		return InputNames[index];
	}
	protected _gl_output_name() {
		return OUTPUT_NAME;
	}
	protected _expected_input_types(): GlConnectionPointType[] {
		const second_or_third_connection =
			this.io.connections.inputConnection(1) || this.io.connections.inputConnection(2);
		const type: GlConnectionPointType = second_or_third_connection
			? second_or_third_connection.srcConnectionPoint().type()
			: GlConnectionPointType.FLOAT;
		return [GlConnectionPointType.BOOL, type, type];
	}
	protected _expected_output_types() {
		const type = this._expected_input_types()[1];
		return [type];
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const value = this.glVarName(OUTPUT_NAME);
		const condition = ThreeToGl.bool(this.variableForInput(TwoWaySwitchGlNodeInputName.CONDITION));
		const ifTrue = ThreeToGl.any(this.variableForInput(TwoWaySwitchGlNodeInputName.IF_TRUE));
		const ifFalse = ThreeToGl.any(this.variableForInput(TwoWaySwitchGlNodeInputName.IF_FALSE));

		const glType = this._expected_output_types()[0];
		const bodyLines: string[] = [];
		bodyLines.push(`${glType} ${value}`);
		bodyLines.push(`if(${condition}){`);
		bodyLines.push(`${value} = ${ifTrue}`);
		bodyLines.push(`} else {`);
		// TODO: why is this second line skipped, if both the true and false lines are the same?
		bodyLines.push(`${value} = ${ifFalse}`);
		bodyLines.push(`}`);
		shaders_collection_controller.addBodyLines(this, bodyLines);
	}
}
