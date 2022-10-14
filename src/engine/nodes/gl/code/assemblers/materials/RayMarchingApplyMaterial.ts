import {GlType} from './../../../../../poly/registers/nodes/types/Gl';
import {BackSide, UniformsUtils, ShaderMaterial, ShaderLib} from 'three';
import {BaseShaderAssemblerRayMarchingAbstract} from './_BaseRayMarchingAbstract';
import {ShaderName} from '../../../../utils/shaders/ShaderName';
import {OutputGlNode} from '../../../Output';
import {GlConnectionPointType, GlConnectionPoint} from '../../../../utils/io/connections/Gl';
// import {CoreMaterial} from '../../../../../../core/geometry/Material';
// import {RayMarchingController} from '../../../../mat/utils/RayMarchingController';
import {ShaderConfig} from '../../configs/ShaderConfig';
import {VariableConfig} from '../../configs/VariableConfig';

import VERTEX from '../../../gl/raymarching/vert.glsl';
import FRAGMENT from '../../../gl/raymarching/fragApplyMaterial.glsl';
import {RAYMARCHING_UNIFORMS} from '../../../gl/raymarching/uniforms';

const INSERT_DEFINE_AFTER_MAP: Map<ShaderName, string> = new Map([
	// [ShaderName.VERTEX, '#include <common>'],
	[ShaderName.FRAGMENT, '// start applyMaterial builder define code'],
]);
const INSERT_BODY_AFTER_MAP: Map<ShaderName, string> = new Map([
	// [ShaderName.VERTEX, '// start builder body code'],
	[ShaderName.FRAGMENT, '// start applyMaterial builder body code'],
]);
const LINES_TO_REMOVE_MAP: Map<ShaderName, string[]> = new Map([[ShaderName.FRAGMENT, []]]);

const SDF_CONTEXT_INPUT_NAME = GlConnectionPointType.SDF_CONTEXT;

const REFLECTION_NOT_ALLOWED = {
	START: '// --- REFLECTION NOT ALLOWED - START',
	END: '// --- REFLECTION NOT ALLOWED - END',
};
const REFLECTION = {
	START: '// --- REFLECTION - START',
	END: '// --- REFLECTION - END',
};
const REFRACTION_NOT_ALLOWED = {
	START: '// --- REFRACTION NOT ALLOWED - START',
	END: '// --- REFRACTION NOT ALLOWED - END',
};
const REFRACTION = {
	START: '// --- REFRACTION - START',
	END: '// --- REFRACTION - END',
};

export class ShaderAssemblerRayMarchingApplyMaterial extends BaseShaderAssemblerRayMarchingAbstract {
	override templateShader() {
		return {
			vertexShader: VERTEX,
			fragmentShader: FRAGMENT,
			uniforms: UniformsUtils.clone(RAYMARCHING_UNIFORMS),
		};
	}
	override createMaterial() {
		const templateShader = this.templateShader();
		const material = new ShaderMaterial({
			vertexShader: templateShader.vertexShader,
			fragmentShader: templateShader.fragmentShader,
			side: BackSide,
			transparent: true,
			depthTest: true,
			alphaTest: 0.5,
			lights: true,
			uniforms: {
				...UniformsUtils.clone(ShaderLib.standard.uniforms),
				...UniformsUtils.clone(templateShader.uniforms),
			},
		});

		// CoreMaterial.addUserDataRenderHook(material, RayMarchingController.render_hook.bind(RayMarchingController));

		// this._addCustomMaterials(material);
		return material;
	}

	// static add_output_inputs(output_child: OutputGlNode) {
	// 	// adding the color here would require to understand how to have the color affect the light in raymarch_light
	// 	// output_child.params.add_param(ParamType.COLOR, 'color', [1, 1, 1], {hidden: true});
	// 	// output_child.params.add_param(ParamType.VECTOR3, 'position', [0, 0, 0], {hidden: true});
	// 	// output_child.params.add_param(ParamType.FLOAT, 'density', 1, {hidden: true});
	// }
	override add_output_inputs(output_child: OutputGlNode) {
		output_child.io.inputs.setNamedInputConnectionPoints([
			new GlConnectionPoint(
				SDF_CONTEXT_INPUT_NAME,
				GlConnectionPointType.SDF_CONTEXT,
				'SDFContext(0.0, 0, 0, 0, 0.)'
			),
		]);
	}
	static override create_globals_node_output_connections() {
		return [
			new GlConnectionPoint('position', GlConnectionPointType.VEC3),
			new GlConnectionPoint('time', GlConnectionPointType.FLOAT),
			new GlConnectionPoint('cameraPosition', GlConnectionPointType.VEC3),
		];
	}
	override create_globals_node_output_connections() {
		return ShaderAssemblerRayMarchingApplyMaterial.create_globals_node_output_connections();
	}
	protected override insertDefineAfter(shaderName: ShaderName): string | undefined {
		return INSERT_DEFINE_AFTER_MAP.get(shaderName);
	}
	protected override insertBodyAfter(shaderName: ShaderName): string | undefined {
		return INSERT_BODY_AFTER_MAP.get(shaderName);
	}
	protected override linesToRemove(shaderName: ShaderName): string[] | undefined {
		return LINES_TO_REMOVE_MAP.get(shaderName);
	}
	override create_shader_configs(): ShaderConfig[] {
		return [
			new ShaderConfig(ShaderName.VERTEX, [], []),
			new ShaderConfig(
				ShaderName.FRAGMENT,
				[
					/*'color', */ 'color',
					/*env map*/
					'envMapTint',
					'envMapIntensity',
					'envMapFresnel',
					'envMapFresnelPower',
					/*reflection*/
					'reflectionTint',
					'reflectionDepth',
					'reflectivity',
					'reflectionBiasMult',
					/*refraction*/
					'refractionTint',
					'refractionDepth',
					'ior',
					'iorOffset',
					'transmission',
					'absorption',
					'refractionBiasMult',
				],
				[]
			),
		];
	}
	static override create_variable_configs() {
		return [
			// new VariableConfig('position', {
			// 	// default_from_attribute: true,
			// 	// prefix: 'vec3 transformed = ',
			// }),
			// new VariableConfig('cameraPosition', {
			// 	// default_from_attribute: true,
			// 	// prefix: 'vec3 transformed = ',
			// }),
			// new VariableConfig('color', {
			// 	prefix: 'BUILDER_color.xyz = ',
			// }),
			new VariableConfig(SDF_CONTEXT_INPUT_NAME, {
				prefix: 'sdfContext = ',
			}),
		];
	}
	override create_variable_configs(): VariableConfig[] {
		return ShaderAssemblerRayMarchingApplyMaterial.create_variable_configs();
	}

	//
	//
	//
	//
	//
	override updateShaders() {
		this._shaders_by_name.clear();
		this._lines.clear();
		for (let shaderName of this.shaderNames()) {
			const template = this._template_shader_for_shader_name(shaderName);
			if (template) {
				this._lines.set(shaderName, template.split('\n'));
			}
		}

		const rootNodes = this.currentGlParentNode().nodesByType(GlType.SDF_MATERIAL);
		if (rootNodes.length > 0) {
			this.buildCodeFromNodes(rootNodes);

			this._buildLines();
		}
		for (let shaderName of this.shaderNames()) {
			const lines = this._lines.get(shaderName);
			if (lines) {
				this._shaders_by_name.set(shaderName, lines.join('\n'));
			}
		}
		this._removeNestedReflection();
		this._removeNestedRefraction();
	}

	private _removeNestedReflection() {
		const fragmentShader = this._shaders_by_name.get(ShaderName.FRAGMENT);
		if (!fragmentShader) {
			return;
		}
		const lines = fragmentShader.split('\n');
		const newLines: string[] = [];
		let inNotAllowed = false;
		let inAllowed = false;

		for (let line of lines) {
			if (line.includes(REFLECTION_NOT_ALLOWED.START)) {
				inNotAllowed = true;
			}
			if (line.includes(REFLECTION_NOT_ALLOWED.END)) {
				inNotAllowed = false;
			}
			if (line.includes(REFLECTION.START)) {
				inAllowed = true;
			}
			if (line.includes(REFLECTION.END)) {
				inAllowed = false;
			}
			if (
				!(inNotAllowed && inAllowed) &&
				!line.includes(REFLECTION_NOT_ALLOWED.START) &&
				!line.includes(REFLECTION_NOT_ALLOWED.END) &&
				!line.includes(REFLECTION.START) &&
				!line.includes(REFLECTION.END)
			) {
				newLines.push(line);
			}
		}
		const newFragmentShader = newLines.join('\n');
		this._shaders_by_name.set(ShaderName.FRAGMENT, newFragmentShader);
	}
	private _removeNestedRefraction() {
		const fragmentShader = this._shaders_by_name.get(ShaderName.FRAGMENT);
		if (!fragmentShader) {
			return;
		}
		const lines = fragmentShader.split('\n');
		const newLines: string[] = [];
		let inNotAllowed = false;
		let inAllowed = false;

		for (let line of lines) {
			if (line.includes(REFRACTION_NOT_ALLOWED.START)) {
				inNotAllowed = true;
			}
			if (line.includes(REFRACTION_NOT_ALLOWED.END)) {
				inNotAllowed = false;
			}
			if (line.includes(REFRACTION.START)) {
				inAllowed = true;
			}
			if (line.includes(REFRACTION.END)) {
				inAllowed = false;
			}
			if (
				!(inNotAllowed && inAllowed) &&
				!line.includes(REFRACTION_NOT_ALLOWED.START) &&
				!line.includes(REFRACTION_NOT_ALLOWED.END) &&
				!line.includes(REFRACTION.START) &&
				!line.includes(REFRACTION.END)
			) {
				newLines.push(line);
			}
		}
		const newFragmentShader = newLines.join('\n');
		this._shaders_by_name.set(ShaderName.FRAGMENT, newFragmentShader);
	}
}
