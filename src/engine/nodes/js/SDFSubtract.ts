/**
 * Subtract 1 SDF from another
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions/](https://iquilezles.org/articles/distfunctions/)
 */

// import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPointType, JsConnectionPoint} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {TypedJsNode} from './_Base';
import {isBooleanTrue} from '../../../core/Type';
import {Poly} from '../../Poly';

const OUTPUT_NAME = 'subtract';

class SDFSubtractJsParamsConfig extends NodeParamsConfig {
	sdf0 = ParamConfig.FLOAT(1);
	sdf1 = ParamConfig.FLOAT(1);
	smooth = ParamConfig.BOOLEAN(1);
	smoothFactor = ParamConfig.FLOAT(1, {
		visibleIf: {smooth: 1},
	});
}
const ParamsConfig = new SDFSubtractJsParamsConfig();
export class SDFSubtractJsNode extends TypedJsNode<SDFSubtractJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFSubtract';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.FLOAT),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const sdf0 = this.variableForInputParam(shadersCollectionController, this.p.sdf0);
		const sdf1 = this.variableForInputParam(shadersCollectionController, this.p.sdf1);
		// const smooth = this.variableForInputParam(shadersCollectionController, this.p.smooth);
		const smoothFactor = this.variableForInputParam(shadersCollectionController, this.p.smoothFactor);

		const functionName = isBooleanTrue(this.pv.smooth) ? 'SDFSmoothSubtract' : 'SDFSubtract';
		const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
		const float = this.jsVarName(OUTPUT_NAME);
		const bodyLine = `const ${float} = ${func.asString(sdf0, sdf1, smoothFactor)}`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);
	}
}
