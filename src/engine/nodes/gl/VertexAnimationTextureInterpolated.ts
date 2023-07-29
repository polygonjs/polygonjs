import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../core/ThreeToGl';
import VERTEX_ANIMATION_TEXTURE from './gl/vertexAnimationTexture.glsl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {FunctionGLDefinition, UniformGLDefinition} from './utils/GLDefinition';
import {GlConnectionPoint, GlConnectionPointType} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ParamConfigsController} from '../utils/code/controllers/ParamConfigsController';
import {GlParamConfig} from './code/utils/GLParamConfig';
import {ParamType} from '../../poly/ParamType';
import {GlType} from '../../poly/registers/nodes/types/Gl';

const OUTPUT = {
	P: 'position',
	N: 'normal',
};
class VertexAnimationTextureInterpolatedGlParamsConfig extends NodeParamsConfig {
	frame = ParamConfig.FLOAT(0);
	framesCount = ParamConfig.FLOAT(100);
	uv = ParamConfig.VECTOR2([0, 0]);
	paddedRatio = ParamConfig.VECTOR2([1, 1]);
	textureP = ParamConfig.STRING('textureP');
	textureP2 = ParamConfig.STRING('textureP2');
	textureN = ParamConfig.STRING('textureN');
	speed = ParamConfig.FLOAT(0.2);
	boundMin = ParamConfig.FLOAT(0);
	boundMax = ParamConfig.FLOAT(1);
	Poffset = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new VertexAnimationTextureInterpolatedGlParamsConfig();
export class VertexAnimationTextureInterpolatedGlNode extends TypedGlNode<VertexAnimationTextureInterpolatedGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return GlType.VERTEX_ANIMATION_TEXTURE_INTERPOLATED;
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT.P, GlConnectionPointType.VEC3),
			new GlConnectionPoint(OUTPUT.N, GlConnectionPointType.VEC3),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const function_declaration_lines = [];
		const body_lines = [];

		function_declaration_lines.push(new FunctionGLDefinition(this, VERTEX_ANIMATION_TEXTURE));

		const frame = ThreeToGl.float(this.variableForInputParam(this.p.frame));
		const framesCount = ThreeToGl.float(this.variableForInputParam(this.p.framesCount));
		const uv = ThreeToGl.vector2(this.variableForInputParam(this.p.uv));
		const paddedRatio = ThreeToGl.vector2(this.variableForInputParam(this.p.paddedRatio));
		const speed = ThreeToGl.float(this.variableForInputParam(this.p.speed));
		const Poffset = ThreeToGl.vector3(this.variableForInputParam(this.p.Poffset));
		const boundMin = ThreeToGl.float(this.variableForInputParam(this.p.boundMin));
		const boundMax = ThreeToGl.float(this.variableForInputParam(this.p.boundMax));

		const mapP = this._uniformName(this.pv.textureP);
		const mapP2 = this._uniformName(this.pv.textureP2);
		const mapN = this._uniformName(this.pv.textureN);

		const PBound = this.glVarName('PBound');
		const VATInfoBasic = this.glVarName('VATInfoBasic');
		const VATDataInfoInterpolated = this.glVarName('VATDataInfoInterpolated');
		const VATDataResult = this.glVarName('VATDataResultTmp');
		const outP = this.glVarName(OUTPUT.P);
		const outN = this.glVarName(OUTPUT.N);
		body_lines.push(`BoundingBox ${PBound} = BoundingBox(${boundMin}, ${boundMax});`);
		body_lines.push(
			`VATDataInfoBasic ${VATInfoBasic} = VATDataInfoBasic(${frame}, ${framesCount}, ${paddedRatio}, ${uv});`
		);
		body_lines.push(
			`VATDataInfoInterpolated ${VATDataInfoInterpolated} = VATDataInfoInterpolated(${speed}, ${PBound}, ${Poffset}, ${VATInfoBasic});`
		);
		body_lines.push(
			`VATDataResult ${VATDataResult} = VATDataInterpolated(${VATDataInfoInterpolated}, ${mapP}, ${mapP2}, ${mapN})`
		);
		body_lines.push(`vec3 ${outP} = ${VATDataResult}.P;`);
		body_lines.push(`vec3 ${outN} = ${VATDataResult}.N;`);

		shadersCollectionController.addDefinitions(this, function_declaration_lines);
		shadersCollectionController.addBodyLines(this, body_lines);

		// add uniforms
		const definitionP = new UniformGLDefinition(
			this,
			GlConnectionPointType.SAMPLER_2D,
			this._uniformName(this.pv.textureP)
		);
		const definitionP2 = new UniformGLDefinition(
			this,
			GlConnectionPointType.SAMPLER_2D,
			this._uniformName(this.pv.textureP2)
		);
		const definitionN = new UniformGLDefinition(
			this,
			GlConnectionPointType.SAMPLER_2D,
			this._uniformName(this.pv.textureN)
		);
		shadersCollectionController.addDefinitions(this, [definitionP, definitionP2, definitionN]);
	}
	override paramsGenerating() {
		return true;
	}
	override setParamConfigs() {
		this._param_configs_controller = this._param_configs_controller || new ParamConfigsController();
		this._param_configs_controller.reset();

		const paramConfigP = new GlParamConfig(
			ParamType.NODE_PATH,
			this.pv.textureP,
			'',
			this._uniformName(this.pv.textureP)
		);
		const paramConfigP2 = new GlParamConfig(
			ParamType.NODE_PATH,
			this.pv.textureP2,
			'',
			this._uniformName(this.pv.textureP2)
		);
		const paramConfigN = new GlParamConfig(
			ParamType.NODE_PATH,
			this.pv.textureN,
			'',
			this._uniformName(this.pv.textureN)
		);
		this._param_configs_controller.push(paramConfigP);
		this._param_configs_controller.push(paramConfigP2);
		this._param_configs_controller.push(paramConfigN);
	}
	private _uniformName(name: string) {
		return this.glVarName(name);
	}
}
