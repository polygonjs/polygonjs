// import {FunctionJsDefinition} from './utils/JsDefinition';
// import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {TypedJsNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
// import SDFMethodsCommon from './js/sdf/sdfCommon.ts';
// const SDFMethodsCommon = `console.log('SDFMethodsCommon not implemented')`;
// const SDFMethods = `console.log('SDFMethods not implemented')`;

const VARS = {
	position: 'p',
};
class BaseSDFJsParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0]);
}

export class BaseSDFJsNode<K extends BaseSDFJsParamsConfig> extends TypedJsNode<K> {
	protected position(shadersCollectionController: ShadersCollectionController) {
		const inputPosition = this.io.inputs.named_input(this.p.position.name());
		const position = inputPosition
			? ThreeToGl.vector3(this.variableForInputParam(shadersCollectionController, this.p.position))
			: this._defaultPosition();
		return position;
	}
	private _defaultPosition(): string {
		return VARS.position;
	}

	// protected _addSDFMethods(shadersCollectionController: ShadersCollectionController) {
	// 	BaseSDFJsNode.addSDFMethods(shadersCollectionController, this);
	// }
	// static addSDFMethods(shadersCollectionController: ShadersCollectionController, node: BaseJsNodeType) {
	// 	shadersCollectionController.addDefinitions(node, [new FunctionJsDefinition(node, SDFMethodsCommon)]);
	// 	shadersCollectionController.addDefinitions(node, [new FunctionJsDefinition(node, SDFMethods)]);
	// }
}
