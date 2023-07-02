/**
 * creates a waves pattern
 *
 */

import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import WAVES from './gl/waves.glsl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {TypedGlNode} from './_Base';

const OUTPUT_NAME = 'h';
class WavesGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR2([0, 0]);
	time = ParamConfig.FLOAT(0);
	freq = ParamConfig.FLOAT(6, {
		range: [0, 10],
		rangeLocked: [false, false],
	});
	freqMult = ParamConfig.FLOAT(1.18, {
		range: [0, 2],
		rangeLocked: [false, false],
	});
	speedMult = ParamConfig.FLOAT(1.07, {
		range: [0, 2],
		rangeLocked: [false, false],
	});
}
const ParamsConfig = new WavesGlParamsConfig();
export class WavesGlNode extends TypedGlNode<WavesGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'waves';
	}

	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.FLOAT),
		]);
	}

	override setLines(linesController: ShadersCollectionController) {
		const position = ThreeToGl.vector3(this.variableForInputParam(this.p.position));
		const time = ThreeToGl.float(this.variableForInputParam(this.p.time));
		const freq = ThreeToGl.float(this.variableForInputParam(this.p.freq));
		const freqMult = ThreeToGl.float(this.variableForInputParam(this.p.freqMult));
		const speedMult = ThreeToGl.float(this.variableForInputParam(this.p.speedMult));

		const float = this.glVarName(OUTPUT_NAME);
		const args = [position, time, freq, freqMult, speedMult];
		const bodyLine = `float ${float} = getwaves(${args.join(',')})`;
		linesController.addBodyLines(this, [bodyLine]);

		linesController.addDefinitions(this, [new FunctionGLDefinition(this, WAVES)]);
	}
}
