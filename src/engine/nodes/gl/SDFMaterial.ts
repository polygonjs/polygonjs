/**
 * Creates an SDF material
 *
 */
import {ParamType} from './../../poly/ParamType';
import {GlParamConfig} from './code/utils/GLParamConfig';
import {GlType} from './../../poly/registers/nodes/types/Gl';
import {ParamConfig} from './../utils/params/ParamsConfig';
import {FunctionGLDefinition, BaseGLDefinition, UniformGLDefinition} from './utils/GLDefinition';
import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPoint, GlConnectionPointType} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ParamConfigsController} from '../utils/code/controllers/ParamConfigsController';
import {isBooleanTrue} from '../../../core/Type';

// const INPUT_NAME = {
// 	COLOR: 'color',
// };
const OUTPUT_NAME = GlType.SDF_MATERIAL;
class SDFMaterialGlParamsConfig extends NodeParamsConfig {
	color = ParamConfig.COLOR([1, 1, 1]);
	useEnvMap = ParamConfig.BOOLEAN(0);
	envMapParam = ParamConfig.STRING('envTexture1', {
		visibleIf: {useEnvMap: 1},
	});
	envMapTint = ParamConfig.COLOR([1, 1, 1], {
		visibleIf: {useEnvMap: 1},
	});
	envMapIntensity = ParamConfig.FLOAT(1, {
		visibleIf: {useEnvMap: 1},
	});
	envMapFresnel = ParamConfig.FLOAT(0, {
		visibleIf: {useEnvMap: 1},
	});
	envMapFresnelPower = ParamConfig.FLOAT(5, {
		range: [0, 10],
		rangeLocked: [true, false],
		visibleIf: {useEnvMap: 1},
	});
}
const ParamsConfig = new SDFMaterialGlParamsConfig();
export class SDFMaterialGlNode extends TypedGlNode<SDFMaterialGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return GlType.SDF_MATERIAL;
	}

	override initializeNode() {
		super.initializeNode();
		// this.io.connection_points.spare_params.setInputlessParamNames(['color']);
		// this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		// this.io.connection_points.set_input_name_function(this._glInputNames.bind(this));
		// this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		// this.io.connection_points.set_output_name_function(this._glOutputNames.bind(this));
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.SDF_MATERIAL),
		]);
	}
	// private _expectedInputTypes() {
	// 	return [GlConnectionPointType.VEC3];
	// }
	// private _expectedOutputTypes() {
	// 	return [GlConnectionPointType.SDF_MATERIAL];
	// }
	// private _glInputNames(i: number) {
	// 	return [INPUT_NAME.COLOR][i];
	// }
	// private _glOutputNames(i: number) {
	// 	return [OUTPUT_NAME][i];
	// }
	materialIdName() {
		return this.path().replace(/\//g, '_').toUpperCase();
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const color = ThreeToGl.vector3(this.variableForInputParam(this.p.color));
		const useEnvMap = isBooleanTrue(this.pv.useEnvMap);
		const envMapTint = ThreeToGl.vector3(this.variableForInputParam(this.p.envMapTint));
		const envMapIntensity = ThreeToGl.float(this.variableForInputParam(this.p.envMapIntensity));
		const envMapFresnel = ThreeToGl.float(this.variableForInputParam(this.p.envMapFresnel));
		const envMapFresnelPower = ThreeToGl.float(this.variableForInputParam(this.p.envMapFresnelPower));
		const envMap = this.uniformName();
		const definitions: BaseGLDefinition[] = [
			new UniformGLDefinition(this, GlConnectionPointType.SAMPLER_2D, envMap),
		];
		const matId = this.graphNodeId();
		const matIdName = this.materialIdName();
		// const matIdVarName = this.glVarName(OUTPUT_NAME);
		// const functionName = `applySDFMaterial_${matIdName}`;

		// const functionDeclaration = `vec3 ${functionName}(){
		// 	return ${color};
		// }`;
		const defineDeclaration = `const int ${matIdName} = ${matId};`;

		// shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, functionDeclaration)]);
		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, defineDeclaration)]);

		const bodyLines: string[] = [`if(mat == ${matIdName}){`];
		bodyLines.push(`	col *= ${color};`);
		if (useEnvMap) {
			bodyLines.push(`	vec3 r = normalize(reflect(rayDir, n));
		// http://www.pocketgl.com/reflections/
		vec2 uv = vec2( atan( -r.z, -r.x ) * RECIPROCAL_PI2 + 0.5, r.y * 0.5 + 0.5 );
		float fresnel = pow(1.-dot(normalize(cameraPosition), n), ${envMapFresnelPower});
		float fresnelFactor = (1.-${envMapFresnel}) + ${envMapFresnel}*fresnel;
		vec3 env = texture2D(${envMap}, uv).rgb * ${envMapTint} * ${envMapIntensity} * fresnelFactor;
		col += env;`);
		}
		bodyLines.push(`}`);

		shadersCollectionController.addBodyLines(this, bodyLines);
		shadersCollectionController.addDefinitions(this, definitions);
	}

	//
	//
	// ENV TEXTURE
	//
	//
	override paramsGenerating() {
		return true;
	}

	override setParamConfigs() {
		this._param_configs_controller = this._param_configs_controller || new ParamConfigsController();
		this._param_configs_controller.reset();

		const param_config = new GlParamConfig(
			ParamType.NODE_PATH,
			this.pv.envMapParam,
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
		return `v_POLY_texture_${this.pv.envMapParam}`;
	}
}
