/**
 * Returns false when viewing the scene in the editor, and true otherwise.
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {JsConnectionPointType, JsConnectionPoint} from '../utils/io/connections/Js';
import {Poly} from '../../Poly';

class PlayerModeJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new PlayerModeJsParamsConfig();
export class PlayerModeJsNode extends TypedJsNode<PlayerModeJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'playerMode';
	}
	static readonly OUTPUT_NAME = 'mode';
	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(PlayerModeJsNode.OUTPUT_NAME, JsConnectionPointType.BOOLEAN),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const func = Poly.namedFunctionsRegister.getFunction('playerMode', this, linesController);

		const varName = this.jsVarName(PlayerModeJsNode.OUTPUT_NAME);
		linesController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.BOOLEAN,
				varName,
				value: func.asString(),
			},
		]);
	}
}
