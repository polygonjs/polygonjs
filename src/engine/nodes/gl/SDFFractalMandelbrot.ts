/**
 * Generates the SDF for a Mandelbrot fractal
 *
 * @remarks
 *
 * based on [https://www.shadertoy.com/view/XsXXWS](https://www.shadertoy.com/view/XsXXWS)
 *
 * Learn more: [https://en.wikipedia.org/wiki/Mandelbrot_set](https://en.wikipedia.org/wiki/Mandelbrot_set)
 */
import {BaseSDFGlNode} from './_BaseSDF';
import {ThreeToGl} from '../../../core/ThreeToGl';
import Mandelbrot from './gl/fractal/mandelbrot.glsl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPoint, GlConnectionPointType} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';

enum OutputName {
	D = 'd',
	AO = 'ao',
}
class SDFFractalMandelbrotGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0]);
	center = ParamConfig.VECTOR3([0, 0, 0]);
	power = ParamConfig.FLOAT(8, {
		range: [0, 10],
		rangeLocked: [false, false],
	});
	QPreMult = ParamConfig.VECTOR3([1, 1, 1]);
	QPostMult = ParamConfig.VECTOR3([1, 1, 1]);
	thetaMult = ParamConfig.FLOAT(1, {
		range: [-2, 2],
		rangeLocked: [true, false],
	});
	iterations = ParamConfig.INTEGER(8, {
		range: [1, 32],
		rangeLocked: [true, false],
	});
	externalBoundingRadius = ParamConfig.FLOAT(1.2, {
		range: [0, 2],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new SDFFractalMandelbrotGlParamsConfig();
export class SDFFractalMandelbrotGlNode extends BaseSDFGlNode<SDFFractalMandelbrotGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFFractalMandelbrot';
	}

	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OutputName.D, GlConnectionPointType.FLOAT),
			new GlConnectionPoint(OutputName.AO, GlConnectionPointType.FLOAT),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const position = this.position();
		const center = ThreeToGl.vector3(this.variableForInputParam(this.p.center));
		const power = ThreeToGl.float(this.variableForInputParam(this.p.power));
		const externalBoundingRadius = ThreeToGl.float(this.variableForInputParam(this.p.externalBoundingRadius));
		const thetaMult = ThreeToGl.float(this.variableForInputParam(this.p.thetaMult));
		const QPreMult = ThreeToGl.vector3(this.variableForInputParam(this.p.QPreMult));
		const QPostMult = ThreeToGl.vector3(this.variableForInputParam(this.p.QPostMult));

		const d = this.glVarName(OutputName.D);
		const ao = this.glVarName(OutputName.AO);
		// const bodyLine = `float ${ao}; float ${d} = mandelbrot(${position} - ${center}, ${ao}, MandelbrotArgs(${power}, ${externalBoundingRadius}))`;
		// const bodyLine =
		// bodyLines.push(bodyLine);
		const mandelbrotStructArgs = [power, QPreMult, QPostMult, thetaMult, externalBoundingRadius];
		const mandelbrotStruct = `MandelbrotArgs(${mandelbrotStructArgs.join(', ')})`;
		const bodyLines: string[] = [
			`float ${ao}`,
			`float ${d} = mandelbrot(${position} - ${center}, ${ao}, ${mandelbrotStruct})`,
		];

		shadersCollectionController.addBodyLines(this, bodyLines);
		shadersCollectionController.addDefinitions(this, [
			new FunctionGLDefinition(this, Mandelbrot.replace('___ITERATIONS___', `${this.pv.iterations}`)),
		]);
	}
}
