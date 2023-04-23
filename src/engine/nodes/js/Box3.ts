/**
 * created a 3D box
 *
 * @remarks
 *
 *
 */

import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Box3} from 'three';
import {Poly} from '../../Poly';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
// import {Box3} from 'three';
// import {BaseNodeType} from '../_Base';

// const OUTPUT_NAME = 'box3';
class Box3JsParamsConfig extends NodeParamsConfig {
	/** @param position representing the lower bound of the box */
	min = ParamConfig.VECTOR3([-1, -1, -1]);
	/** @param position representing the upper bound of the box */
	max = ParamConfig.VECTOR3([1, 1, 1]);
}
const ParamsConfig = new Box3JsParamsConfig();
export class Box3JsNode extends TypedJsNode<Box3JsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'box3';
	}
	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.BOX3, JsConnectionPointType.BOX3, CONNECTION_OPTIONS),
		]);
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const min = this.variableForInputParam(shadersCollectionController, this.p.min);
		const max = this.variableForInputParam(shadersCollectionController, this.p.max);
		const out = this.jsVarName(JsConnectionPointType.BOX3);

		const tmpVarName = shadersCollectionController.addVariable(this, new Box3());
		const func = Poly.namedFunctionsRegister.getFunction('box3Set', this, shadersCollectionController);
		const bodyLine = func.asString(min, max, tmpVarName);
		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.PLANE, varName: out, value: bodyLine},
		]);
	}
	// override initializeNode() {
	// 	super.initializeNode();

	// 	this.io.connection_points.initializeNode();
	// 	// this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
	// 	this.io.connection_points.set_output_name_function((index: number) => OUTPUT_NAME);
	// 	this.io.connection_points.set_expected_input_types_function(() => []);
	// 	this.io.connection_points.set_expected_output_types_function(() => [ActorConnectionPointType.BOX3]);
	// }

	// private _box3 = new Box3();
	// private _box3Updated = false;
	// public override outputValue(context: ActorNodeTriggerContext) {
	// 	if (!this._box3Updated) {
	// 		this._updateBox3();
	// 		this._box3Updated = true;
	// 	}
	// 	return this._box3;
	// }

	// static PARAM_CALLBACK_updateBox3(node: Box3ActorNode) {
	// 	node._updateBox3();
	// }
	// private _updateBox3() {
	// 	this._box3.min.copy(this.pv.min);
	// 	this._box3.max.copy(this.pv.max);
	// }
}
