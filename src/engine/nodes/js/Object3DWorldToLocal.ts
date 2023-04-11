/**
 * Converts the vector from this object's local space to world space.
 *
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {inputObject3D} from './_BaseObject3D';
import {createVariable} from './code/assemblers/_BaseJsPersistedConfigUtils';
import {Poly} from '../../Poly';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

const OUTPUT_NAME = 'local';
class Object3DWorldToLocalJsParamsConfig extends NodeParamsConfig {
	/** @param vector3 */
	Vector3 = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new Object3DWorldToLocalJsParamsConfig();
export class Object3DWorldToLocalJsNode extends TypedJsNode<Object3DWorldToLocalJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'object3DWorldToLocal';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
			// new JsConnectionPoint(JsConnectionPointType.VECTOR3, JsConnectionPointType.VECTOR3, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.VECTOR3),
		]);
	}
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const position = this.variableForInputParam(shadersCollectionController, this.p.Vector3);
		const varName = this.jsVarName(OUTPUT_NAME);

		const variable = createVariable(JsConnectionPointType.VECTOR3);
		if (variable) {
			shadersCollectionController.addVariable(this, varName, variable);
		}

		const func = Poly.namedFunctionsRegister.getFunction('object3DWorldToLocal', this, shadersCollectionController);
		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.PLANE, varName, value: func.asString(object3D, position, varName)},
		]);
	}
}
