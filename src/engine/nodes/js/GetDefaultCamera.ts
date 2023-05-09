/**
 * get a the camera default scene
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';

class GetDefaultCameraJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new GetDefaultCameraJsParamsConfig();

export class GetDefaultCameraJsNode extends TypedJsNode<GetDefaultCameraJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'getDefaultCamera';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.CAMERA, JsConnectionPointType.CAMERA),
		]);
	}
	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const varName = this.jsVarName(JsConnectionPointType.CAMERA);
		const func = Poly.namedFunctionsRegister.getFunction('getDefaultCamera', this, shadersCollectionController);
		shadersCollectionController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.CAMERA,
				varName,
				value: func.asString(),
			},
		]);
	}
}
