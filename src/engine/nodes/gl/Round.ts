/**
 * rounds an input value to the nearest integer
 *
 *
 *
 */

import {BaseNodeGlMathFunctionArg1GlNode} from './_BaseMathFunction';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {GlConnectionPointComponentsCountMap} from '../utils/io/connections/Gl';

const ALL_COMPONENTS = ['x', 'y', 'z', 'w'];

export class RoundGlNode extends BaseNodeGlMathFunctionArg1GlNode {
	static override type() {
		return 'round';
	}

	// https://hub.jmonkeyengine.org/t/round-with-glsl/8186/6
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const inputConnection = this.io.inputs.namedInputConnectionPoints()[0];
		const value = ThreeToGl.vector2(this.variableForInput(inputConnection.name()));

		const outputConnection = this.io.outputs.namedOutputConnectionPoints()[0];
		const outputType = outputConnection.type();
		const varName = this.glVarName(outputConnection.name());

		const bodyLines: string[] = [];
		const linesCount = GlConnectionPointComponentsCountMap[outputType];
		if (linesCount == 1) {
			bodyLines.push(`${outputType} ${varName} = ${this._singleLine(value)}`);
		} else {
			const singleLines: string[] = ALL_COMPONENTS.slice(0, linesCount).map((c) => {
				return this._singleLine(`${value}.${c}`);
			});
			bodyLines.push(`${outputType} ${varName} = ${outputType}(${singleLines.join(',')})`);
		}
		shadersCollectionController.addBodyLines(this, bodyLines);
	}

	private _singleLine(value: string) {
		return `sign(${value})*floor(abs(${value})+0.5)`;
	}
}
