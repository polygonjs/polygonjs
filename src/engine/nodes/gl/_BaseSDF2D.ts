import {FunctionGLDefinition} from './utils/GLDefinition';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import SDFMethodsCommon from './gl/raymarching/sdfCommon.glsl';
import SDFMethods2D from './gl/raymarching/sdf2D.glsl';

const VARS = {
	position: 'p.xy',
};
class BaseSDF2DGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR2([0, 0]);
}

export class BaseSDF2DGlNode<K extends BaseSDF2DGlParamsConfig> extends TypedGlNode<K> {
	protected position() {
		const inputPosition = this.io.inputs.named_input(this.p.position.name());
		const position = inputPosition
			? ThreeToGl.vector2(this.variableForInputParam(this.p.position))
			: this._defaultPosition();
		return position;
	}
	private _defaultPosition(): string {
		return VARS.position;
	}

	protected _addSDF2DMethods(shadersCollectionController: ShadersCollectionController) {
		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, SDFMethodsCommon)]);
		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, SDFMethods2D)]);
	}
}
