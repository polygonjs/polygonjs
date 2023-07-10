/**
 * removes an object from the hierarchy
 *
 *
 */
import {BaseTriggerAndObjectJsNode} from './_BaseTriggerAndObject';
import {inputObject3D} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';

class DeleteObjectJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new DeleteObjectJsParamsConfig();

export class DeleteObjectJsNode extends BaseTriggerAndObjectJsNode<DeleteObjectJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'deleteObject';
	}

	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);

		const func = Poly.namedFunctionsRegister.getFunction('objectDelete', this, linesController);

		const bodyLine = func.asString(object3D);
		linesController.addTriggerableLines(this, [bodyLine]);
	}
}
