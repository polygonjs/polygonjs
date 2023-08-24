/**
 * Deforms a geometry with a lattice
 *
 *
 */
import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {inputObject3D} from './_BaseObject3D';
import {Poly} from '../../Poly';
import {DEFAULT_POSITIONS} from '../../../core/geometry/operation/CubeLatticeDeform';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class DeformGeometryCubeLatticeJsParamsConfig extends NodeParamsConfig {
	p0 = ParamConfig.VECTOR3(DEFAULT_POSITIONS[0]);
	p1 = ParamConfig.VECTOR3(DEFAULT_POSITIONS[1]);
	p2 = ParamConfig.VECTOR3(DEFAULT_POSITIONS[2]);
	p3 = ParamConfig.VECTOR3(DEFAULT_POSITIONS[3]);
	p4 = ParamConfig.VECTOR3(DEFAULT_POSITIONS[4]);
	p5 = ParamConfig.VECTOR3(DEFAULT_POSITIONS[5]);
	p6 = ParamConfig.VECTOR3(DEFAULT_POSITIONS[6]);
	p7 = ParamConfig.VECTOR3(DEFAULT_POSITIONS[7]);
}
const ParamsConfig = new DeformGeometryCubeLatticeJsParamsConfig();

export class DeformGeometryCubeLatticeJsNode extends TypedJsNode<DeformGeometryCubeLatticeJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'deformGeometryCubeLattice';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
		]);
	}
	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const p0 = this.variableForInputParam(shadersCollectionController, this.p.p0);
		const p1 = this.variableForInputParam(shadersCollectionController, this.p.p1);
		const p2 = this.variableForInputParam(shadersCollectionController, this.p.p2);
		const p3 = this.variableForInputParam(shadersCollectionController, this.p.p3);
		const p4 = this.variableForInputParam(shadersCollectionController, this.p.p4);
		const p5 = this.variableForInputParam(shadersCollectionController, this.p.p5);
		const p6 = this.variableForInputParam(shadersCollectionController, this.p.p6);
		const p7 = this.variableForInputParam(shadersCollectionController, this.p.p7);

		const pointsStr: string[] = [p0, p1, p2, p3, p4, p5, p6, p7];

		const pointsJSON = JSON.stringify(pointsStr);

		const func = Poly.namedFunctionsRegister.getFunction('cubeLatticeDeform', this, shadersCollectionController);
		const bodyLine = func.asString(object3D, pointsJSON);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}
