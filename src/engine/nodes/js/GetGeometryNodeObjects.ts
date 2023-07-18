/**
 * get objects from a geometry node
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {Poly} from '../../Poly';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
// import {NodeContext} from '../../poly/NodeContext';
import {ConstantJsDefinition} from './utils/JsDefinition';
import {inputNode} from './_BaseObject3D';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class GetGeometryNodeObjectsJsParamsConfig extends NodeParamsConfig {
	/** @param geometry node */
	// Node = ParamConfig.NODE_PATH('', {
	// 	nodeSelection: {
	// 		context: NodeContext.SOP,
	// 	},
	// 	dependentOnFoundNode: false,
	// 	computeOnDirty: true,
	// });
}
const ParamsConfig = new GetGeometryNodeObjectsJsParamsConfig();

export class GetGeometryNodeObjectsJsNode extends TypedJsNode<GetGeometryNodeObjectsJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'getGeometryNodeObjects';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.TRIGGER, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.NODE, JsConnectionPointType.NODE, CONNECTION_OPTIONS),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.TRIGGER, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D_ARRAY, JsConnectionPointType.OBJECT_3D_ARRAY),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const usedOutputNames = this.io.outputs.used_output_names();
		if (usedOutputNames.includes(JsConnectionPointType.OBJECT_3D_ARRAY)) {
			this._addObjectsRef(linesController);

			if (!usedOutputNames.includes(JsConnectionPointType.TRIGGER)) {
				this.setTriggeringLines(linesController, '');
			}
		}
	}
	override setTriggerableLines(linesController: JsLinesCollectionController): void {
		const node = inputNode(this, linesController);

		const outObjects = this._addObjectsRef(linesController);

		const func = Poly.namedFunctionsRegister.getFunction('getGeometryNodeObjects', this, linesController);
		const bodyLine = func.asString(node, `this.${outObjects}.value`);
		linesController.addTriggerableLines(this, [bodyLine], {async: true});
	}

	private _addObjectsRef(linesController: JsLinesCollectionController) {
		const outObjects = this.jsVarName(JsConnectionPointType.OBJECT_3D_ARRAY);
		linesController.addDefinitions(this, [
			// do not use a ref, as it makes the object reactive
			new ConstantJsDefinition(this, linesController, JsConnectionPointType.OBJECT_3D_ARRAY, outObjects, `[]`),
		]);
		return outObjects;
	}
}
