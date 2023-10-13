/**
 * sets a WFC constraint
 *
 *
 */

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {Poly} from '../../Poly';
import {inputObject3D, integerOutputFromParam, stringOutputFromParam} from './_BaseObject3D';
import {BaseTriggerAndObjectJsNode} from './_BaseTriggerAndObject';
import {JS_CONNECTION_POINT_IN_NODE_DEF, JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
class SetWFCSoftConstraintJsParamsConfig extends NodeParamsConfig {
	/** @param floorId */
	floorId = ParamConfig.INTEGER(0);
	/** @param quadId */
	quadId = ParamConfig.INTEGER(0);
	/** @param tileId */
	tileId = ParamConfig.STRING('');
	/** @param rotation */
	rotation = ParamConfig.INTEGER(0, {
		range: [0, 3],
		rangeLocked: [true, true],
	});
	/** @param quadId */
	quadSeed = ParamConfig.INTEGER(0);
	/** @param quadId */
	configSeed = ParamConfig.INTEGER(0);
}
const ParamsConfig = new SetWFCSoftConstraintJsParamsConfig();

export class SetWFCSoftConstraintJsNode extends BaseTriggerAndObjectJsNode<SetWFCSoftConstraintJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.SET_WFC_SOFT_CONSTRAINT;
	}

	protected override _additionalOutputs(): JsConnectionPoint<JsConnectionPointType>[] {
		return [
			new JsConnectionPoint('floorId', JsConnectionPointType.INT, CONNECTION_OPTIONS),
			new JsConnectionPoint('quadId', JsConnectionPointType.INT, CONNECTION_OPTIONS),
			new JsConnectionPoint('tileId', JsConnectionPointType.STRING, CONNECTION_OPTIONS),
			new JsConnectionPoint('rotation', JsConnectionPointType.INT, CONNECTION_OPTIONS),
			new JsConnectionPoint('quadSeed', JsConnectionPointType.INT, CONNECTION_OPTIONS),
			new JsConnectionPoint('configSeed', JsConnectionPointType.INT, CONNECTION_OPTIONS),
		];
	}

	override setLines(linesController: JsLinesCollectionController) {
		super.setLines(linesController);

		integerOutputFromParam(this, this.p.floorId, linesController);
		integerOutputFromParam(this, this.p.quadId, linesController);
		stringOutputFromParam(this, this.p.tileId, linesController);
		integerOutputFromParam(this, this.p.rotation, linesController);
		integerOutputFromParam(this, this.p.quadSeed, linesController);
		integerOutputFromParam(this, this.p.configSeed, linesController);
	}

	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);
		const floorId = this.variableForInputParam(linesController, this.p.floorId);
		const quadId = this.variableForInputParam(linesController, this.p.quadId);
		const tileId = this.variableForInputParam(linesController, this.p.tileId);
		const rotation = this.variableForInputParam(linesController, this.p.rotation);
		const quadSeed = this.variableForInputParam(linesController, this.p.quadSeed);
		const configSeed = this.variableForInputParam(linesController, this.p.configSeed);

		const func = Poly.namedFunctionsRegister.getFunction('setWFCSoftConstraint', this, linesController);
		const bodyLine = func.asString(object3D, floorId, quadId, tileId, rotation, quadSeed, configSeed);
		linesController.addTriggerableLines(this, [bodyLine]);
	}
}
