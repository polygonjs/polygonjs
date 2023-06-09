/**
 * loads an SDF texture, which is used in raymarching materials.
 *
 *
 *
 *
 */
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {BaseGLDefinition, PrecisionGLDefinition, UniformGLDefinition} from './utils/GLDefinition';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ParamConfigsController} from '../utils/code/controllers/ParamConfigsController';
import {ParamType} from '../../poly/ParamType';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlParamConfig} from './code/utils/GLParamConfig';
import {BaseSDFGlNode} from './_BaseSDF';
import {isBooleanTrue} from '../../../core/Type';
import { GlType } from '../../poly/registers/nodes/types/Gl';

class TextureSDFGlParamsConfig extends NodeParamsConfig {
	paramName = ParamConfig.STRING('texture1');
	position = ParamConfig.VECTOR3([0, 0, 0], {hidden: true});
	center = ParamConfig.VECTOR3([0, 0, 0]);
	boundMin = ParamConfig.VECTOR3([0, 0, 0]);
	boundMax = ParamConfig.VECTOR3([1, 1, 1]);
	boundScale = ParamConfig.VECTOR3([1, 1, 1]);
	bias = ParamConfig.FLOAT(0.01);
	tblur = ParamConfig.BOOLEAN(0);
	blurDist = ParamConfig.FLOAT(0.01, {
		visibleIf: {tblur: 1},
	});
	// voxelSizes = ParamConfig.VECTOR3([1, 1, 1]);
}
const ParamsConfig = new TextureSDFGlParamsConfig();
export class TextureSDFGlNode extends BaseSDFGlNode<TextureSDFGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<GlType.TEXTURE_SDF> {
		return GlType.TEXTURE_SDF;
	}
	static readonly OUTPUT_NAME = 'd';
	override initializeNode() {
		this.addPostDirtyHook('_setMatToRecompile', this._setMatToRecompile.bind(this));
		this.lifecycle.onAfterAdded(this._setMatToRecompile.bind(this));
		this.lifecycle.onBeforeDeleted(this._setMatToRecompile.bind(this));
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(TextureSDFGlNode.OUTPUT_NAME, GlConnectionPointType.FLOAT),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const position = this.position();
		const center = ThreeToGl.vector3(this.variableForInputParam(this.p.center));
		const boundMin = ThreeToGl.vector3(this.variableForInputParam(this.p.boundMin));
		const boundMax = ThreeToGl.vector3(this.variableForInputParam(this.p.boundMax));
		const boundScale = ThreeToGl.vector3(this.variableForInputParam(this.p.boundScale));
		const bias = ThreeToGl.float(this.variableForInputParam(this.p.bias));
		// const voxelSizes = ThreeToGl.vector3(this.variableForInputParam(this.p.voxelSizes));

		const d = this.glVarName(TextureSDFGlNode.OUTPUT_NAME);
		const boundCenter = this.glVarName('boundCenter');
		const boundSize = this.glVarName('boundSize');
		const sdBox = this.glVarName('sdBox');
		const positionNormalised = this.glVarName('positionNormalised');
		const map = this.uniformName();
		const definitions: BaseGLDefinition[] = [
			new PrecisionGLDefinition(this, GlConnectionPointType.SAMPLER_3D, 'highp'),
			new UniformGLDefinition(this, GlConnectionPointType.SAMPLER_3D, map),
		];
		const bodyLines: string[] = [
			`vec3 ${boundCenter} = (${boundMax} + ${boundMin})*0.5`,
			`vec3 ${boundSize} = (${boundMax} - ${boundMin})`,
			// `vec3 ${positionRefit} = ((${position} - (${boundMin} + (${voxelSizes}*0.0))) / ${boundSize})`,
			`vec3 ${positionNormalised} = ((${position} - ${boundMin}) / ${boundSize})`,
			`float ${sdBox} = sdBox(${position}-${boundCenter}, ${boundSize}*${boundScale})`,
		];
		if (isBooleanTrue(this.pv.tblur)) {
			const blurDist = ThreeToGl.float(this.variableForInputParam(this.p.blurDist));
			const offsets: number[] = [-1, 0, 1];
			const textureBlurLines: string[] = [];
			for (let z of offsets) {
				for (let y of offsets) {
					for (let x of offsets) {
						const offset = `vec3(${ThreeToGl.float(x)}*${ThreeToGl.float(blurDist)},${ThreeToGl.float(
							y
						)}*${ThreeToGl.float(blurDist)},${ThreeToGl.float(z)}*${ThreeToGl.float(blurDist)})`;
						const line = `texture(${map}, ${positionNormalised} - ${center}+${offset}).r`;
						textureBlurLines.push(line);
					}
				}
			}
			bodyLines.push(
				`float ${d} = ${sdBox} < ${bias} ? ((
					${textureBlurLines.join(' +\n')}
				)/27.0) : ${sdBox}`
			);
		} else {
			bodyLines.push(
				`float ${d} = ${sdBox} < ${bias} ? texture(${map}, ${positionNormalised} - ${center}).r : ${sdBox}`
			);
		}

		shadersCollectionController.addDefinitions(this, definitions);
		shadersCollectionController.addBodyLines(this, bodyLines);
		this._addSDFMethods(shadersCollectionController);
	}
	override paramsGenerating() {
		return true;
	}

	override setParamConfigs() {
		this._param_configs_controller = this._param_configs_controller || new ParamConfigsController();
		this._param_configs_controller.reset();

		const param_config = new GlParamConfig(
			ParamType.NODE_PATH,
			this.pv.paramName,
			'', //this.pv.defaultValue,
			this.uniformName()
		);
		this._param_configs_controller.push(param_config);
	}
	// override glVarName(name?: string) {
	// 	if (name) {
	// 		return super.glVarName(name);
	// 	}
	// 	return `v_POLY_texture_${this.pv.paramName}`;
	// }
	uniformName() {
		return `v_POLY_textureSDF_${this.pv.paramName}`;
	}
}
