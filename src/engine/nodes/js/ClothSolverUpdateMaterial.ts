/**
 * Updates the material of a cloth object, after a ClothSolverStepSimulation
 *
 *
 */
import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {inputObject3D} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {ClothSolverUniformName} from '../../../core/cloth/ClothAttribute';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

enum ClothSolverUpdateMaterialInput {
	TEXTURE_SIZE = 'tSize',
	TEXTURE_POSITION0 = 'tPosition0',
	TEXTURE_POSITION1 = 'tPosition1',
	TEXTURE_NORMAL = 'tNormal',
}
class ClothSolverUpdateMaterialJsParamsConfig extends NodeParamsConfig {
	tSizeName = ParamConfig.STRING(ClothSolverUniformName.SIZE);
	tPosition0Name = ParamConfig.STRING(ClothSolverUniformName.POSITION0);
	tPosition1Name = ParamConfig.STRING(ClothSolverUniformName.POSITION1);
	tNormalName = ParamConfig.STRING(ClothSolverUniformName.NORMAL);
}
const ParamsConfig = new ClothSolverUpdateMaterialJsParamsConfig();
export class ClothSolverUpdateMaterialJsNode extends TypedJsNode<ClothSolverUpdateMaterialJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'clothSolverUpdateMaterial';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
			new JsConnectionPoint(
				ClothSolverUpdateMaterialInput.TEXTURE_SIZE,
				JsConnectionPointType.VECTOR2,
				CONNECTION_OPTIONS
			),
			new JsConnectionPoint(
				ClothSolverUpdateMaterialInput.TEXTURE_POSITION0,
				JsConnectionPointType.TEXTURE,
				CONNECTION_OPTIONS
			),
			new JsConnectionPoint(
				ClothSolverUpdateMaterialInput.TEXTURE_POSITION1,
				JsConnectionPointType.TEXTURE,
				CONNECTION_OPTIONS
			),
			new JsConnectionPoint(
				ClothSolverUpdateMaterialInput.TEXTURE_NORMAL,
				JsConnectionPointType.TEXTURE,
				CONNECTION_OPTIONS
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D),
		]);
	}

	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);

		const tSizeName = this.variableForInputParam(linesController, this.p.tSizeName);
		const tPosition0Name = this.variableForInputParam(linesController, this.p.tPosition0Name);
		const tPosition1Name = this.variableForInputParam(linesController, this.p.tPosition1Name);
		const tNormalName = this.variableForInputParam(linesController, this.p.tNormalName);

		const tSize = this.variableForInput(linesController, ClothSolverUpdateMaterialInput.TEXTURE_SIZE);
		const tPosition0 = this.variableForInput(linesController, ClothSolverUpdateMaterialInput.TEXTURE_POSITION0);
		const tPosition1 = this.variableForInput(linesController, ClothSolverUpdateMaterialInput.TEXTURE_POSITION1);
		const tNormal = this.variableForInput(linesController, ClothSolverUpdateMaterialInput.TEXTURE_NORMAL);

		const func = Poly.namedFunctionsRegister.getFunction('clothSolverUpdateMaterial', this, linesController);

		const bodyLine = func.asString(
			object3D,
			tSizeName,
			tPosition0Name,
			tPosition1Name,
			tNormalName,
			tSize,
			tPosition0,
			tPosition1,
			tNormal
		);
		linesController.addTriggerableLines(this, [bodyLine]);
	}
}
