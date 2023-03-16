// import {FunctionGLDefinition} from './utils/JsDefinition';
// import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {TypedJsNode} from './_Base';
// import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import SDFMethodsCommon from './gl/raymarching/sdfCommon.glsl';
// import SDFMethods2D from './gl/raymarching/sdf2D.glsl';

// const VARS = {
// 	position: 'p.xy',
// };
class BaseSDF2DJsParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR2([0, 0]);
}

export class BaseSDF2DJsNode<K extends BaseSDF2DJsParamsConfig> extends TypedJsNode<K> {
	// protected position(shadersCollectionController: ShadersCollectionController) {
	// 	const inputPosition = this.io.inputs.named_input(this.p.position.name());
	// 	const position = inputPosition
	// 		? this.variableForInputParam(shadersCollectionController, this.p.position)
	// 		: this._defaultPosition(shadersCollectionController);
	// 	return position;
	// }
	// private _defaultPosition(shadersCollectionController: ShadersCollectionController): string {
	// 	const sanitizedNodePath = CoreString.sanitizeName(this.path());
	// 	const varName = `${sanitizedNodePath}_${this.p.position.name()}`;
	// 	shadersCollectionController.addVariable(this, varName, new Vector3());
	// 	return `${varName}.copy(${VARS.position})`;
	// }
	// protected _addSDF2DMethods(shadersCollectionController: ShadersCollectionController) {
	// 	shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, SDFMethodsCommon)]);
	// 	shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, SDFMethods2D)]);
	// }
}
