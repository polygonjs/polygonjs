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
import {PolyDictionary} from '../../../types/GlobalTypes';
import SDF_ENV_MAP from './gl/raymarching/sdfEnvMap.glsl';
import SDF_REFLECTION from './gl/raymarching/sdfReflection.glsl';

// interface ReplacementOptions{
// 	content:string, varName:string, replacement:string
// }
// function _replaceVar(options:ReplacementOptions){
// 	return options.content.replace(`__${options.varName}__`,options.replacement)
// }
class BodyLine {
	constructor(private _content: string) {}
	lines() {
		return this._content.split('\n');
	}
	replaceVars(vars: PolyDictionary<string>) {
		const varNames = Object.keys(vars);
		for (let varName of varNames) {
			this._replaceVar(varName, vars[varName]);
		}
	}
	addTabs(tabsCount: number) {
		const lines = this._content.split('\n');
		const newLines: string[] = [];
		for (let line of lines) {
			const prefix = '\t'.repeat(tabsCount);
			newLines.push(`${prefix}${line}`);
		}
		this._content = newLines.join('\n');
	}
	private _replaceVar(varName: string, replacement: string) {
		const regex = new RegExp(`__${varName}__`, 'g');
		this._content = this._content.replace(regex, replacement);
	}
}

const OUTPUT_NAME = GlType.SDF_MATERIAL;
class SDFMaterialGlParamsConfig extends NodeParamsConfig {
	color = ParamConfig.COLOR([1, 1, 1]);
	useLights = ParamConfig.BOOLEAN(1, {
		separatorBefore: true,
	});
	useEnvMap = ParamConfig.BOOLEAN(0, {
		separatorBefore: true,
	});
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
	useReflection = ParamConfig.BOOLEAN(0, {
		separatorBefore: true,
	});
	reflectivity = ParamConfig.FLOAT(0.5, {
		visibleIf: {useReflection: 1},
		range: [0, 1],
		rangeLocked: [true, false],
	});
	reflectionDepth = ParamConfig.INTEGER(3, {
		visibleIf: {useReflection: 1},
		range: [0, 10],
		rangeLocked: [true, false],
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
		this.io.connection_points.spare_params.setInputlessParamNames(['useEnvMap', 'useReflection']);
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
		const matId = this.graphNodeId();
		const matIdName = this.materialIdName();
		// const matIdVarName = this.glVarName(OUTPUT_NAME);
		// const functionName = `applySDFMaterial_${matIdName}`;

		// const functionDeclaration = `vec3 ${functionName}(){
		// 	return ${color};
		// }`;
		const defineDeclaration = `const int ${matIdName} = ${matId};`;
		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, defineDeclaration)]);

		const definitions: BaseGLDefinition[] = [];
		const bodyLines: string[] = [`if(mat == ${matIdName}){`];
		bodyLines.push(`	col = ${color};`);

		/**
		 *
		 * LIGHTS
		 *
		 */
		const useLights = isBooleanTrue(this.pv.useLights);
		if (useLights) {
			bodyLines.push(`	vec3 diffuse = GetLight(p, n);`);
			bodyLines.push(`	col *= diffuse;`);
		}

		/**
		 *
		 * ENV MAP
		 *
		 */
		const useEnvMap = isBooleanTrue(this.pv.useEnvMap);
		if (useEnvMap) {
			const envMapTint = ThreeToGl.vector3(this.variableForInputParam(this.p.envMapTint));
			const envMapIntensity = ThreeToGl.float(this.variableForInputParam(this.p.envMapIntensity));
			const envMapFresnel = ThreeToGl.float(this.variableForInputParam(this.p.envMapFresnel));
			const envMapFresnelPower = ThreeToGl.float(this.variableForInputParam(this.p.envMapFresnelPower));
			const envMap = this.uniformName();
			definitions.push(new UniformGLDefinition(this, GlConnectionPointType.SAMPLER_2D, envMap));
			const lineEnvMap = new BodyLine(SDF_ENV_MAP);
			lineEnvMap.replaceVars({envMapTint, envMapIntensity, envMapFresnel, envMapFresnelPower, envMap});
			lineEnvMap.addTabs(1);
			bodyLines.push(...lineEnvMap.lines());
		}
		/**
		 *
		 * REFLECTION
		 *
		 */
		const useReflection = isBooleanTrue(this.pv.useReflection);
		if (useReflection) {
			const reflectivity = ThreeToGl.float(this.variableForInputParam(this.p.reflectivity));
			const reflectionDepth = ThreeToGl.integer(this.variableForInputParam(this.p.reflectionDepth));
			const lineReflection = new BodyLine(SDF_REFLECTION);
			lineReflection.replaceVars({reflectivity, reflectionDepth});
			lineReflection.addTabs(1);
			bodyLines.push(...lineReflection.lines());
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
		const useEnvMap = isBooleanTrue(this.pv.useEnvMap);
		if (useEnvMap) {
			const paramConfig = new GlParamConfig(
				ParamType.NODE_PATH,
				this.pv.envMapParam,
				'', //this.pv.defaultValue,
				this.uniformName()
			);
			this._param_configs_controller.push(paramConfig);
		}
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
