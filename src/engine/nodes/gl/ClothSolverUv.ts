/**
 * reads the position from the cloth solver
 *
 *
 *
 */

import {TypedGlNode} from './_Base';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {BaseGLDefinition, FunctionGLDefinition, UniformGLDefinition} from './utils/GLDefinition';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ParamConfigsController} from '../utils/code/controllers/ParamConfigsController';
import {ParamType} from '../../poly/ParamType';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlParamConfig} from './code/utils/GLParamConfig';
import {UNIFORM_PARAM_PREFIX} from '../../../core/material/uniform';
import GET_UV from '../../../core/cloth/glsl/common/getUV.glsl';
import CLOTH_SOLVER_POSITION from '../../../core/cloth/glsl/render/ClothSolverPosition.glsl';
import {ClothSolverUniformName} from '../../../core/cloth/ClothAttribute';

enum ClothSolverUvOutputName {
	UV = 'uv',
}

class ClothSolverUvGlParamsConfig extends NodeParamsConfig {
	id = ParamConfig.FLOAT(0);
	size = ParamConfig.STRING(ClothSolverUniformName.SIZE);
}
const ParamsConfig = new ClothSolverUvGlParamsConfig();
export class ClothSolverUvGlNode extends TypedGlNode<ClothSolverUvGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<'clothSolverUv'> {
		return 'clothSolverUv';
	}
	override initializeNode() {
		this.addPostDirtyHook('_setMatToRecompile', this._setMatToRecompile.bind(this));
		this.lifecycle.onAfterAdded(this._setMatToRecompile.bind(this));
		this.lifecycle.onBeforeDeleted(this._setMatToRecompile.bind(this));
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(ClothSolverUvOutputName.UV, GlConnectionPointType.VEC2),
		]);
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const id = ThreeToGl.vector2(this.variableForInputParam(this.p.id));

		// const uv = this.glVarName('clothSolverUv');
		const uv = this.glVarName(ClothSolverUvOutputName.UV);
		// const normal = this.glVarName(ClothSolverPositionOutputName.NORMAL);
		const uniformSize = this.uniformNameSize();
		// const uniformPosition0 = this.uniformNamePosition0();
		// const uniformPosition1 = this.uniformNamePosition1();
		// const uniformNormal = this.uniformNameNormal();
		const definitions: BaseGLDefinition[] = [
			new UniformGLDefinition(this, GlConnectionPointType.VEC2, uniformSize),
			// new UniformGLDefinition(this, GlConnectionPointType.SAMPLER_2D, uniformPosition0),
			// new UniformGLDefinition(this, GlConnectionPointType.SAMPLER_2D, uniformPosition1),
			// new UniformGLDefinition(this, GlConnectionPointType.SAMPLER_2D, uniformNormal),
			new FunctionGLDefinition(this, GET_UV),
			new FunctionGLDefinition(this, CLOTH_SOLVER_POSITION),
		];

		const bodyLines: string[] = [];
		bodyLines.push(`vec2 ${uv} = getClothSolverUV(${id}, ${uniformSize})`);
		// bodyLines.push(`vec3 ${position} = clothSolverPosition(${uniformPosition0}, ${uniformPosition1}, ${uv})`);
		// bodyLines.push(`vec3 ${normal} = clothSolverNormal(${uniformNormal}, ${uv})`);

		shaders_collection_controller.addDefinitions(this, definitions);
		shaders_collection_controller.addBodyLines(this, bodyLines);
	}
	override paramsGenerating() {
		return true;
	}

	override setParamConfigs() {
		this._param_configs_controller = this._param_configs_controller || new ParamConfigsController();
		this._param_configs_controller.reset();

		const size = new GlParamConfig(ParamType.VECTOR2, this.pv.size, [1, 1], this.uniformNameSize());
		// const position0 = new GlParamConfig(ParamType.NODE_PATH, this.pv.position0, '', this.uniformNamePosition0());
		// const position1 = new GlParamConfig(ParamType.NODE_PATH, this.pv.position1, '', this.uniformNamePosition1());
		// const normal = new GlParamConfig(ParamType.NODE_PATH, this.pv.normal, '', this.uniformNameNormal());
		this._param_configs_controller.push(size);
		// this._param_configs_controller.push(position0);
		// this._param_configs_controller.push(position1);
		// this._param_configs_controller.push(normal);
	}
	uniformNameSize() {
		return `${UNIFORM_PARAM_PREFIX}${this.pv.size}`;
	}
	// uniformNamePosition0() {
	// 	return `${UNIFORM_TEXTURE_PREFIX}${this.pv.position0}`;
	// }
	// uniformNamePosition1() {
	// 	return `${UNIFORM_TEXTURE_PREFIX}${this.pv.position1}`;
	// }
	// uniformNameNormal() {
	// 	return `${UNIFORM_TEXTURE_PREFIX}${this.pv.normal}`;
	// }
}
