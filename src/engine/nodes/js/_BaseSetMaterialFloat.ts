import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {Mesh,Material} from 'three';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
// import {ParamType} from '../../poly/ParamType';
// import {CoreType} from '../../../core/Type';
import {inputObject3D} from './_BaseObject3D';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

// https://stackoverflow.com/questions/46583883/typescript-pick-properties-with-a-defined-type
// type KeysOfType<T, U, B = false> = {
// 	[P in keyof T]: B extends true
// 		? T[P] extends U
// 			? U extends T[P]
// 				? P
// 				: never
// 			: never
// 		: T[P] extends U
// 		? P
// 		: never;
// }[keyof T];

// type PickByType<T, U, B = false> = Pick<T, KeysOfType<T, U, B>>;

class BaseSetMaterialFloatJsParamsConfig extends NodeParamsConfig {
	/** @param float */
	float = ParamConfig.FLOAT(1);
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
}
const ParamsConfig = new BaseSetMaterialFloatJsParamsConfig();

export abstract class BaseSetMaterialFloatJsNode extends TypedJsNode<BaseSetMaterialFloatJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.MATERIAL, JsConnectionPointType.MATERIAL, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
			new JsConnectionPoint(JsConnectionPointType.MATERIAL, JsConnectionPointType.MATERIAL, CONNECTION_OPTIONS),
		]);
	}
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const float = this.variableForInputParam(shadersCollectionController, this.p.float);
		const lerp = this.variableForInputParam(shadersCollectionController, this.p.lerp);

		const func = Poly.namedFunctionsRegister.getFunction(this._functionName(), this, shadersCollectionController);
		const bodyLine = func.asString(object3D, float, lerp);
		shadersCollectionController.addActionBodyLines(this, [bodyLine]);
	}
	abstract _functionName(): 'setMaterialOpacity';
}
