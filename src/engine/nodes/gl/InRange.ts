/**
 * compares if a number is within a range.
 *
 * @remarks
 *
 * Using this node is similar to using 2 [gl/compare](/docs/nodes/gl/compare) and a [gl/and](/docs/nodes/gl/and).
 *
 *
 *
 */

import {ThreeToGl} from '../../../core/ThreeToGl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {NodeParamsConfig /*, ParamConfig*/} from '../utils/params/ParamsConfig';
import {TypedGlNode} from './_Base';
class InRangeGlParamsConfig extends NodeParamsConfig {
	// input = ParamConfig.FLOAT(0.5);
	// min = ParamConfig.FLOAT(0);
	// max = ParamConfig.FLOAT(1);
}
const ParamsConfig = new InRangeGlParamsConfig();

export class InRangeGlNode extends TypedGlNode<InRangeGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'inRange';
	}
	static OUTPUT = 'out';
	static INPUT = 'input';
	static INPUT_MIN = 'min';
	static INPUT_MAX = 'max';

	override initializeNode() {
		super.initializeNode();

		this.io.connection_points.set_input_name_function(
			(i) => [InRangeGlNode.INPUT, InRangeGlNode.INPUT_MIN, InRangeGlNode.INPUT_MAX][i]
		);
		this.io.connection_points.set_output_name_function(() => InRangeGlNode.OUTPUT);
		this.io.connection_points.set_expected_input_types_function(this._expected_input_types.bind(this));
		this.io.connection_points.set_expected_output_types_function(() => [GlConnectionPointType.BOOL]);
	}
	private _expected_input_types() {
		const type = GlConnectionPointType.FLOAT;
		return [type, type, type];
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const glOutType = GlConnectionPointType.BOOL;
		const input = ThreeToGl.float(this.variableForInput(InRangeGlNode.INPUT));
		const inputMin = ThreeToGl.float(this.variableForInput(InRangeGlNode.INPUT_MIN));
		const inputMax = ThreeToGl.float(this.variableForInput(InRangeGlNode.INPUT_MAX));
		const out = this.glVarName(this.io.connection_points.output_name(0));
		const bodyLine = `${glOutType} ${out} = ${input} > ${inputMin} && ${input} < ${inputMax}`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);
	}
}
