/**
 * Creates an SDF material
 *
 */
import {NodeContext} from './../../poly/NodeContext';
import {GlType} from './../../poly/registers/nodes/types/Gl';
import {ParamConfig} from './../utils/params/ParamsConfig';
import {FunctionGLDefinition, BaseGLDefinition} from './utils/GLDefinition';
import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPoint, GlConnectionPointType} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {isBooleanTrue} from '../../../core/Type';
import {PolyDictionary} from '../../../types/GlobalTypes';
import SDF_ENV_MAP_SAMPLE from './gl/raymarching/sdfEnvMapSample.glsl';
import SDF_ENV_MAP from './gl/raymarching/sdfEnvMap.glsl';
import SDF_REFLECTION from './gl/raymarching/sdfReflection.glsl';
import Quaternion from './gl/quaternion.glsl';

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
	useEnvMap = ParamConfig.BOOLEAN(0);
	useReflection = ParamConfig.BOOLEAN(0);
	useRefraction = ParamConfig.BOOLEAN(0);
	// lighting
	lighting = ParamConfig.FOLDER();
	useLights = ParamConfig.BOOLEAN(1);
	diffuse = ParamConfig.COLOR([1, 1, 1], {
		visibleIf: {useLights: 1},
	});
	emissive = ParamConfig.COLOR([0, 0, 0]);
	// envMap
	envMap = ParamConfig.FOLDER();
	envMapTint = ParamConfig.COLOR([1, 1, 1], {
		visibleIf: {useEnvMap: 1},
	});
	envMapIntensity = ParamConfig.FLOAT(1, {
		visibleIf: {useEnvMap: 1},
	});
	envMapRoughness = ParamConfig.FLOAT(0, {
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
	iorOffset = ParamConfig.VECTOR3([-0.01, 0, 0.01], {
		visibleIf: {useRefraction: 1, splitRGB: 1},
	});
	transmission = ParamConfig.FLOAT(0.5, {
		visibleIf: {useRefraction: 1},
		range: [0, 1],
		rangeLocked: [true, false],
	});
	absorption = ParamConfig.FLOAT(0.5, {
		visibleIf: {useRefraction: 1},
		range: [0, 5],
		rangeLocked: [false, false],
	});
	refractionDepth = ParamConfig.INTEGER(3, {
		visibleIf: {useRefraction: 1},
		range: [0, 10],
		rangeLocked: [true, false],
		separatorBefore: true,
	});
	refractionMaxDist = ParamConfig.FLOAT(100, {
		visibleIf: {useRefraction: 1},
		range: [0, 100],
		rangeLocked: [true, false],
		step: 0.0001,
	});
	refractionBiasMult = ParamConfig.FLOAT(2, {
		visibleIf: {useRefraction: 1},
		range: [0, 10],
		rangeLocked: [true, false],
	});
	sampleEnvMapOnLastRefractionRay = ParamConfig.BOOLEAN(1, {
		visibleIf: {useRefraction: 1},
	});
	refractionStartOutsideMedium = ParamConfig.BOOLEAN(1, {
		visibleIf: {useRefraction: 1},
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
			'sampleEnvMapOnLastRefractionRay',
			'refractionStartOutsideMedium',
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.SDF_MATERIAL),
		]);
	}

	materialIdName(): string {
		return this.path().replace(/\//g, '_').toUpperCase();
	}
	private _materialId(): number {
		const parentMatNode = this.parentController.firstAncestorWithContext(NodeContext.MAT);
		if (!parentMatNode) {
			return 0;
		}
		if (!parentMatNode.childrenController) {
			return 0;
		}
		let i = 0;
		let matId = 0;
		parentMatNode.childrenController.traverseChildren((childNode) => {
			if (childNode.context() == NodeContext.GL && childNode.type() == SDFMaterialGlNode.type()) {
				i++;
				if (childNode.graphNodeId() == this.graphNodeId()) {
					matId = i;
				}
			}
		});
		return matId;
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const matId = this._materialId();
		const matIdName = this.materialIdName();
		const definitions: BaseGLDefinition[] = [];
		const useEnvMap = isBooleanTrue(this.pv.useEnvMap);
		const useReflection = isBooleanTrue(this.pv.useReflection);
		const useRefraction = isBooleanTrue(this.pv.useRefraction);
		const envMapRoughness = ThreeToGl.float(this.variableForInputParam(this.p.envMapRoughness));

		const defineDeclaration = `const int ${matIdName} = ${matId};`;
		definitions.push(new FunctionGLDefinition(this, defineDeclaration));
		definitions.push(new FunctionGLDefinition(this, Quaternion));
		definitions.push(new FunctionGLDefinition(this, SDF_ENV_MAP_SAMPLE));

		const color = ThreeToGl.vector3(this.variableForInputParam(this.p.color));
		const diffuse = ThreeToGl.vector3(this.variableForInputParam(this.p.diffuse));
		const emissive = ThreeToGl.vector3(this.variableForInputParam(this.p.emissive));

		const bodyLines: string[] = [`if(mat == ${matIdName}){`];
		bodyLines.push(`	col = vec3(0., 0., 0.);`);

		/**
		 *
		 * LIGHTS
		 *
		 */
		const useLights = isBooleanTrue(this.pv.useLights);
		if (useLights) {
			bodyLines.push(`	vec3 diffuse = ${color} * ${diffuse} * GetLight(p, n, sdfContext);`);
			bodyLines.push(`	col += diffuse;`);
		}
		bodyLines.push(`	col += ${emissive};`);

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
			lineEnvMap.replaceVars({
				envMapTint,
				envMapIntensity,
				envMapRoughness,
				envMapFresnel,
				envMapFresnelPower,
			});
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
			lineReflection.replaceVars({
				reflectionTint,
				reflectionDepth,
				reflectivity,
				reflectionBiasMult,
				envMapRoughness,
			});
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
			const absorption = ThreeToGl.float(this.variableForInputParam(this.p.absorption));
			const refractionBiasMult = ThreeToGl.float(this.variableForInputParam(this.p.refractionBiasMult));
			const refractionMaxDist = ThreeToGl.float(this.variableForInputParam(this.p.refractionMaxDist));
			const splitRGB = isBooleanTrue(this.pv.splitRGB);
			const iorOffset = ThreeToGl.vector3(this.variableForInputParam(this.p.iorOffset));

			bodyLines.push(`
		// --- REFRACTION - START
		vec3 refractedColor = vec3(0.);
		float ior = ${ior};
		float biasMult = ${refractionBiasMult};
		vec3 baseValue = ${color};
		vec3 tint = ${refractionTint};
		float absorption = ${absorption};
			`);
			if (splitRGB) {
				bodyLines.push(`
		vec3 offset = ${iorOffset};
		vec4 refractedDataR = GetRefractedData(p, n, rayDir, ior+offset.x, biasMult, ${envMapRoughness}, ${refractionMaxDist}, ${refractionDepth}, sdfContext);
		vec4 refractedDataG = GetRefractedData(p, n, rayDir, ior+offset.y, biasMult, ${envMapRoughness}, ${refractionMaxDist}, ${refractionDepth}, sdfContext);
		vec4 refractedDataB = GetRefractedData(p, n, rayDir, ior+offset.z, biasMult, ${envMapRoughness}, ${refractionMaxDist}, ${refractionDepth}, sdfContext);
		refractedColor.r = applyRefractionAbsorption(refractedDataR.r, baseValue.r, tint.r, refractedDataR.w, absorption);
		refractedColor.g = applyRefractionAbsorption(refractedDataG.g, baseValue.g, tint.g, refractedDataG.w, absorption);
		refractedColor.b = applyRefractionAbsorption(refractedDataB.b, baseValue.b, tint.b, refractedDataB.w, absorption);
				`);
			} else {
				bodyLines.push(`
		vec4 refractedData = GetRefractedData(p, n, rayDir, ior, biasMult, ${envMapRoughness}, ${refractionMaxDist}, ${refractionDepth}, sdfContext);
		refractedColor = applyRefractionAbsorption(refractedData.rgb, baseValue, tint, refractedData.w, absorption);
				`);
			}
			bodyLines.push(`
		col += refractedColor * ${transmission};
		// --- REFRACTION - END
	`);
			definitions.push(new FunctionGLDefinition(this, '#define RAYMARCHED_REFRACTIONS 1'));
			if (isBooleanTrue(this.pv.sampleEnvMapOnLastRefractionRay)) {
				definitions.push(
					new FunctionGLDefinition(this, '#define RAYMARCHED_REFRACTIONS_SAMPLE_ENV_MAP_ON_LAST 1')
				);
			}
			if (isBooleanTrue(this.pv.refractionStartOutsideMedium)) {
				definitions.push(
					new FunctionGLDefinition(this, '#define RAYMARCHED_REFRACTIONS_START_OUTSIDE_MEDIUM 1')
				);
			}
		}

		bodyLines.push(`}`);
		shadersCollectionController.addBodyLines(this, bodyLines);
		shadersCollectionController.addDefinitions(this, definitions);
	}
}
