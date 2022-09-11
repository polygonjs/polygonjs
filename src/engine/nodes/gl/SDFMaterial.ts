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
import SDF_ENV_MAP_SAMPLE from './gl/raymarching/sdfEnvMapSample.glsl';
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
	content() {
		return this._content;
	}
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
	// globals
	globals = ParamConfig.FOLDER();
	color = ParamConfig.COLOR([1, 1, 1]);
	useLights = ParamConfig.BOOLEAN(1);
	useEnvMap = ParamConfig.BOOLEAN(0);
	useReflection = ParamConfig.BOOLEAN(0);
	useRefraction = ParamConfig.BOOLEAN(0);
	envMapParam = ParamConfig.STRING('envTexture1', {
		visibleIf: [{useEnvMap: true}, {useReflection: true}, {useRefraction: true}],
	});
	// envMap
	envMap = ParamConfig.FOLDER();
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
	// reflection
	reflection = ParamConfig.FOLDER();
	reflectionTint = ParamConfig.COLOR([1, 1, 1], {
		visibleIf: {useReflection: 1},
	});
	reflectionDepth = ParamConfig.INTEGER(3, {
		visibleIf: {useReflection: 1},
		range: [0, 10],
		rangeLocked: [true, false],
	});
	reflectivity = ParamConfig.FLOAT(0.5, {
		visibleIf: {useReflection: 1},
		range: [0, 1],
		rangeLocked: [true, false],
	});
	reflectionBiasMult = ParamConfig.FLOAT(2, {
		visibleIf: {useReflection: 1},
		range: [0, 10],
		rangeLocked: [true, false],
	});
	// refraction
	refraction = ParamConfig.FOLDER();
	refractionTint = ParamConfig.COLOR([1, 1, 1], {
		visibleIf: {useRefraction: 1},
	});
	ior = ParamConfig.FLOAT(1.45, {
		visibleIf: {useRefraction: 1},
		range: [0, 2],
		rangeLocked: [true, false],
	});
	splitRGB = ParamConfig.BOOLEAN(0, {
		visibleIf: {useRefraction: 1},
	});
	iorOffset = ParamConfig.VECTOR3([0, 0, 0], {
		visibleIf: {useRefraction: 1, splitRGB: 1},
	});
	transmission = ParamConfig.FLOAT(0.5, {
		visibleIf: {useRefraction: 1},
		range: [0, 1],
		rangeLocked: [true, false],
	});
	absorbtion = ParamConfig.FLOAT(0.5, {
		visibleIf: {useRefraction: 1},
		range: [0, 1],
		rangeLocked: [false, false],
	});
	refractionDepth = ParamConfig.INTEGER(3, {
		visibleIf: {useRefraction: 1},
		range: [0, 10],
		rangeLocked: [true, false],
		separatorBefore: true,
	});
	refractionBiasMult = ParamConfig.FLOAT(2, {
		visibleIf: {useRefraction: 1},
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
		this.io.connection_points.spare_params.setInputlessParamNames([
			'useLights',
			'useEnvMap',
			'useReflection',
			'reflectionDepth',
			'useRefraction',
			'refractionDepth',
			'splitRGB',
		]);
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
		const definitions: BaseGLDefinition[] = [];
		const useEnvMap = isBooleanTrue(this.pv.useEnvMap);
		const useReflection = isBooleanTrue(this.pv.useReflection);
		const useRefraction = isBooleanTrue(this.pv.useRefraction);
		const envMap = this.uniformName();

		const defineDeclaration = `const int ${matIdName} = ${matId};`;
		definitions.push(new FunctionGLDefinition(this, defineDeclaration));
		definitions.push(new FunctionGLDefinition(this, SDF_ENV_MAP_SAMPLE));

		if (this._paramRequired()) {
			definitions.push(new UniformGLDefinition(this, GlConnectionPointType.SAMPLER_2D, envMap));
		}

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

		if (useEnvMap) {
			const envMapTint = ThreeToGl.vector3(this.variableForInputParam(this.p.envMapTint));
			const envMapIntensity = ThreeToGl.float(this.variableForInputParam(this.p.envMapIntensity));
			const envMapFresnel = ThreeToGl.float(this.variableForInputParam(this.p.envMapFresnel));
			const envMapFresnelPower = ThreeToGl.float(this.variableForInputParam(this.p.envMapFresnelPower));

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

		if (useReflection) {
			const reflectionDepth = `${this.pv.reflectionDepth}`;
			const reflectionTint = ThreeToGl.vector3(this.variableForInputParam(this.p.reflectionTint));
			const reflectivity = ThreeToGl.float(this.variableForInputParam(this.p.reflectivity));
			const reflectionBiasMult = ThreeToGl.float(this.variableForInputParam(this.p.reflectionBiasMult));
			const lineReflection = new BodyLine(SDF_REFLECTION);
			lineReflection.replaceVars({reflectionTint, reflectionDepth, reflectivity, reflectionBiasMult, envMap});
			lineReflection.addTabs(1);
			bodyLines.push(...lineReflection.lines());
			definitions.push(new FunctionGLDefinition(this, '#define RAYMARCHED_REFLECTIONS 1'));
		}
		/**
		 *
		 * REFRACTION
		 *
		 */

		if (useRefraction) {
			const refractionTint = ThreeToGl.vector3(this.variableForInputParam(this.p.refractionTint));
			const refractionDepth = this.pv.refractionDepth;
			const ior = ThreeToGl.float(this.variableForInputParam(this.p.ior));
			const transmission = ThreeToGl.float(this.variableForInputParam(this.p.transmission));
			const absorbtion = ThreeToGl.float(this.variableForInputParam(this.p.absorbtion));
			const refractionBiasMult = ThreeToGl.float(this.variableForInputParam(this.p.refractionBiasMult));
			const splitRGB = isBooleanTrue(this.pv.splitRGB);
			const iorOffset = ThreeToGl.vector3(this.variableForInputParam(this.p.iorOffset));

			bodyLines.push(`
		// --- REFRACTION - START
		vec3 refractedColor = vec3(0.);
		float ior = ${ior};
		float biasMult = ${refractionBiasMult};
		vec3 tint = ${refractionTint};
		float absorbtion = ${absorbtion};
			`);
			if (splitRGB) {
				bodyLines.push(`
		vec3 offset = ${iorOffset};
		vec4 refractedDataR = GetRefractedData(p, n, rayDir, ior+offset.x, biasMult, ${envMap}, ${refractionDepth});
		vec4 refractedDataG = GetRefractedData(p, n, rayDir, ior+offset.y, biasMult, ${envMap}, ${refractionDepth});
		vec4 refractedDataB = GetRefractedData(p, n, rayDir, ior+offset.z, biasMult, ${envMap}, ${refractionDepth});
		refractedColor.r = applyRefractionAbsorbtion(refractedDataR, tint, absorbtion).r;
		refractedColor.g = applyRefractionAbsorbtion(refractedDataG, tint, absorbtion).g;
		refractedColor.b = applyRefractionAbsorbtion(refractedDataB, tint, absorbtion).b;
				`);
			} else {
				bodyLines.push(`
		vec4 refractedData = GetRefractedData(p, n, rayDir, ior, biasMult, ${envMap}, ${refractionDepth});
		refractedColor = applyRefractionAbsorbtion(refractedData, tint, absorbtion);
				`);
			}
			bodyLines.push(`
		col += refractedColor * ${transmission};
		// --- REFRACTION - END
	`);
			definitions.push(new FunctionGLDefinition(this, '#define RAYMARCHED_REFRACTIONS 1'));
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
		if (this._paramRequired()) {
			this._param_configs_controller = this._param_configs_controller || new ParamConfigsController();
			this._param_configs_controller.reset();
			const paramConfig = new GlParamConfig(
				ParamType.NODE_PATH,
				this.pv.envMapParam,
				'', //this.pv.defaultValue,
				this.uniformName()
			);
			this._param_configs_controller.push(paramConfig);
		}
	}
	private _paramRequired() {
		const useEnvMap = isBooleanTrue(this.pv.useEnvMap);
		const useReflection = isBooleanTrue(this.pv.useReflection);
		const useRefraction = isBooleanTrue(this.pv.useRefraction);
		return useEnvMap || useReflection || useRefraction;
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
