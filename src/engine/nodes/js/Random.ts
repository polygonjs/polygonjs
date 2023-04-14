/**
 * returns the math function random() (which returns a different value every time)
 *
 *
 */
import {Poly} from '../../Poly';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {TypedJsNode} from './_Base';

const OUTPUT_NAME = 'random';

class RandomJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new RandomJsParamsConfig();
export class RandomJsNode extends TypedJsNode<RandomJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'random';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.FLOAT),
		]);
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const varName = this.jsVarName(OUTPUT_NAME);

		const _func = Poly.namedFunctionsRegister.getFunction('random', this, shadersCollectionController).asString();

		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.FLOAT, varName, value: _func},
		]);
	}
}

// import {MathFunctionArg2OperationFactory} from './_Math_Arg1Operation';

// const FUNCTION_NAME = 'random';
// export class RandomJsNode extends MathFunctionArg2OperationFactory('random', {
// 	inputPrefix: 'in',
// 	out: 'random',
// }) {
// 	protected _coreFunction(shadersCollectionController: ShadersCollectionController) {
// 		Poly.namedFunctionsRegister.getFunction(FUNCTION_NAME, this, shadersCollectionController).asString();

// 		return FUNCTION_NAME;
// 	}

// 	protected override _expectedInputName(index: number): string {
// 		return [][index];
// 	}

// 	protected override _expectedInputTypes() {
// 		return [];
// 	}
// }
