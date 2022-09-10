import {GlType} from './../../../../../poly/registers/nodes/types/Gl';
import {ShaderAssemblerRayMarchingApplyMaterial} from './RayMarchingApplyMaterial';
import {BackSide, UniformsUtils, ShaderMaterial, ShaderLib, Material} from 'three';
import {BaseShaderAssemblerRayMarching} from './_BaseRayMarching';
import {ShaderName} from '../../../../utils/shaders/ShaderName';
import {OutputGlNode} from '../../../Output';
import {GlConnectionPointType, GlConnectionPoint} from '../../../../utils/io/connections/Gl';
// import {CoreMaterial} from '../../../../../../core/geometry/Material';
// import {RayMarchingController} from '../../../../mat/utils/RayMarchingController';
import {ShaderConfig} from '../../configs/ShaderConfig';
import {VariableConfig} from '../../configs/VariableConfig';

import VERTEX from '../../../gl/raymarching/vert.glsl';
import FRAGMENT from '../../../gl/raymarching/frag.glsl';
import {RAYMARCHING_UNIFORMS} from '../../../gl/raymarching/uniforms';
import {AssemblerControllerNode} from '../../Controller';

const INSERT_BODY_AFTER_MAP: Map<ShaderName, string> = new Map([
	// [ShaderName.VERTEX, '// start builder body code'],
	[ShaderName.FRAGMENT, '// start GetDist builder body code'],
]);
const LINES_TO_REMOVE_MAP: Map<ShaderName, string[]> = new Map([[ShaderName.FRAGMENT, []]]);

const SDF_CONTEXT_INPUT_NAME = GlConnectionPointType.SDF_CONTEXT;

export class ShaderAssemblerRayMarching extends BaseShaderAssemblerRayMarching {
	constructor(protected override _gl_parent_node: AssemblerControllerNode) {
		super(_gl_parent_node);

		this._addFilterFragmentShaderCallback('applyMaterialAssembler', (fragmentShader) =>
			this.applyMaterialAssemblerFilterFragmentShader(fragmentShader)
		);
	}
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

		this._gl_parent_node.scene().sceneTraverser.addlightsRayMarchingUniform(material.uniforms);
		// CoreMaterial.addUserDataRenderHook(material, RayMarchingController.renderHook.bind(RayMarchingController));

		this._addCustomMaterials(material);
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
			new GlConnectionPoint(SDF_CONTEXT_INPUT_NAME, GlConnectionPointType.SDF_CONTEXT, 'SDFContext(0.0, 0)'),
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
		return ShaderAssemblerRayMarching.create_globals_node_output_connections();
	}

	protected override insertBodyAfter(shader_name: ShaderName): string | undefined {
		return INSERT_BODY_AFTER_MAP.get(shader_name);
	}
	protected override linesToRemove(shader_name: ShaderName): string[] | undefined {
		return LINES_TO_REMOVE_MAP.get(shader_name);
	}
	override create_shader_configs(): ShaderConfig[] {
		return [
			new ShaderConfig(ShaderName.VERTEX, [], []),
			new ShaderConfig(ShaderName.FRAGMENT, [/*'color', */ SDF_CONTEXT_INPUT_NAME], [ShaderName.VERTEX]),
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
		return ShaderAssemblerRayMarching.create_variable_configs();
	}

	//
	//
	//
	//
	//
	private _applyMaterialAssembler: ShaderAssemblerRayMarchingApplyMaterial =
		new ShaderAssemblerRayMarchingApplyMaterial(this._gl_parent_node);
	private _applyMaterialMaterial = new ShaderMaterial();
	override setGlParentNode(gl_parent_node: AssemblerControllerNode) {
		super.setGlParentNode(gl_parent_node);
		this._applyMaterialAssembler.setGlParentNode(gl_parent_node);
	}
	override compileMaterial(material: Material) {
		this._applyMaterialAssembler.updateShaders();
		this._applyMaterialAssembler.prepareOnBeforeCompileData(this._applyMaterialMaterial);

		this.codeBuilder().nodeTraverser().setBlockedInputNames(GlType.SDF_CONTEXT, ['material']);
		super.compileMaterial(material, {
			otherFragmentShaderCollectionController: this._applyMaterialAssembler
				.codeBuilder()
				.shadersCollectionController(),
		});
	}
	applyMaterialAssemblerFilterFragmentShader(fragmentShader: string) {
		const applyMaterial = this._applyMaterialAssembler.onBeforeCompileData()?.fragmentShader;
		if (applyMaterial) {
			const elements = applyMaterial.split('// --- applyMaterial SPLIT ---');
			// const applyMaterialConstants = elements[0];
			const applyMaterialFunctionDefinition = elements[1];
			// fragmentShader = fragmentShader.replace(
			// 	'// --- applyMaterial constants definition',
			// 	applyMaterialConstants
			// );
			fragmentShader = fragmentShader.replace(
				'// --- applyMaterial function definition',
				applyMaterialFunctionDefinition
			);
		}
		if (this._applyMaterialAssembler.uniformsTimeDependent()) {
			this.setUniformsTimeDependent();
		}
		if (this._applyMaterialAssembler.uniformsResolutionDependent()) {
			this.setUniformsResolutionDependent();
		}

		return fragmentShader;
	}
}
