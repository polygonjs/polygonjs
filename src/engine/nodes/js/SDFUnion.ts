/**
 * union of 2 SDFs
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
import {SDFUnion, SDFSmoothUnion} from './js/sdf/sdf';
import {isBooleanTrue} from '../../../core/Type';

const OUTPUT_NAME = 'union';

class SDFUnionJsParamsConfig extends NodeParamsConfig {
	sdf0 = ParamConfig.FLOAT(1);
	sdf1 = ParamConfig.FLOAT(1);
	smooth = ParamConfig.BOOLEAN(1);
	smoothFactor = ParamConfig.FLOAT(1, {
		visibleIf: {smooth: 1},
	});
}
const ParamsConfig = new SDFUnionJsParamsConfig();
export class SDFUnionJsNode extends TypedJsNode<SDFUnionJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFUnion';
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

		const _func = isBooleanTrue(this.pv.smooth) ? SDFSmoothUnion : SDFUnion;
		const float = this.jsVarName(OUTPUT_NAME);
		const bodyLine = `const ${float} = ${_func.name}(${sdf0}, ${sdf1}, ${smoothFactor})`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);
		shadersCollectionController.addFunction(this, _func);
	}
}
