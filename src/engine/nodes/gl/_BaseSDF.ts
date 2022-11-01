import {FunctionGLDefinition} from './utils/GLDefinition';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {TypedGlNode, BaseGlNodeType} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import SDFMethodsCommon from './gl/raymarching/sdfCommon.glsl';
import SDFMethods from './gl/raymarching/sdf.glsl';

const VARS = {
	position: 'p',
};
class BaseSDFGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0]);
}

export class BaseSDFGlNode<K extends BaseSDFGlParamsConfig> extends TypedGlNode<K> {
	protected position() {
		const inputPosition = this.io.inputs.named_input(this.p.position.name());
		const position = inputPosition
			? ThreeToGl.vector3(this.variableForInputParam(this.p.position))
			: this._defaultPosition();
		return position;
	}
	private _defaultPosition(): string {
		return VARS.position;
	}

	protected _addSDFMethods(shadersCollectionController: ShadersCollectionController) {
		BaseSDFGlNode.addSDFMethods(shadersCollectionController, this);
	}
	static addSDFMethods(shadersCollectionController: ShadersCollectionController, node: BaseGlNodeType) {
		shadersCollectionController.addDefinitions(node, [new FunctionGLDefinition(node, SDFMethodsCommon)]);
		shadersCollectionController.addDefinitions(node, [new FunctionGLDefinition(node, SDFMethods)]);
	}
}
