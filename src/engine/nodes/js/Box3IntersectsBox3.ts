/**
 * returns true if a box contains a point
 *
 * @remarks
 *
 *
 */

import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export enum Box3IntersectsBox3InputName {
	BOX3a = 'Box3a',
	BOX3b = 'Box3b',
}
export enum Box3IntersectsBox3OutputName {
	INTERSECTS = 'intersects',
}

class Box3IntersectsBox3JsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new Box3IntersectsBox3JsParamsConfig();
export class Box3IntersectsBox3JsNode extends TypedJsNode<Box3IntersectsBox3JsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'box3IntersectsBox3';
	}
	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(Box3IntersectsBox3InputName.BOX3a, JsConnectionPointType.BOX3, CONNECTION_OPTIONS),
			new JsConnectionPoint(Box3IntersectsBox3InputName.BOX3b, JsConnectionPointType.BOX3, CONNECTION_OPTIONS),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(
				Box3IntersectsBox3OutputName.INTERSECTS,
				JsConnectionPointType.BOOLEAN,
				CONNECTION_OPTIONS
			),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const box3a = this.variableForInput(linesController, Box3IntersectsBox3InputName.BOX3a);
		const box3b = this.variableForInput(linesController, Box3IntersectsBox3InputName.BOX3b);
		const out = this.jsVarName(Box3IntersectsBox3OutputName.INTERSECTS);

		const func = Poly.namedFunctionsRegister.getFunction('box3IntersectsBox3', this, linesController);
		const bodyLine = func.asString(box3a, box3b);
		linesController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.PLANE, varName: out, value: bodyLine},
		]);
	}
}
