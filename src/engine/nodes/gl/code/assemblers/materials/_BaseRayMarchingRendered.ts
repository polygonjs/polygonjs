import {GlType} from './../../../../../poly/registers/nodes/types/Gl';
import {BackSide, UniformsUtils, ShaderMaterial, ShaderLib, Material} from 'three';
import {BaseShaderAssemblerRayMarchingAbstract} from './_BaseRayMarchingAbstract';
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
import {ShaderAssemblerRayMarchingApplyMaterial} from './RayMarchingApplyMaterial';

const INSERT_BODY_AFTER_MAP: Map<ShaderName, string> = new Map([
	// [ShaderName.VERTEX, '// start builder body code'],
	[ShaderName.FRAGMENT, '// start GetDist builder body code'],
]);
const INSERT_DEFINE_AFTER_MAP: Map<ShaderName, string> = new Map([
	// [ShaderName.VERTEX, '#include <common>'],
	[ShaderName.FRAGMENT, '// start raymarching builder define code'],
]);
const LINES_TO_REMOVE_MAP: Map<ShaderName, string[]> = new Map([[ShaderName.FRAGMENT, []]]);

const SDF_CONTEXT_INPUT_NAME = GlConnectionPointType.SDF_CONTEXT;

export class BaseShaderAssemblerRayMarchingRendered extends BaseShaderAssemblerRayMarchingAbstract {
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

		this._gl_parent_node.scene().sceneTraverser.addLightsRayMarchingUniform(material.uniforms);
		// CoreMaterial.addUserDataRenderHook(material, RayMarchingController.renderHook.bind(RayMarchingController));

		this._addCustomMaterials(material);
		return material;
	}
	protected override _raymarchingLightsWorldCoordsDependent() {
		return true;
	}

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
		return BaseShaderAssemblerRayMarchingRendered.create_globals_node_output_connections();
	}

	protected override insertBodyAfter(shaderName: ShaderName): string | undefined {
		return INSERT_BODY_AFTER_MAP.get(shaderName);
	}
	protected override insertDefineAfter(shaderName: ShaderName): string | undefined {
		return INSERT_DEFINE_AFTER_MAP.get(shaderName);
	}
	protected override linesToRemove(shaderName: ShaderName): string[] | undefined {
		return LINES_TO_REMOVE_MAP.get(shaderName);
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
		return BaseShaderAssemblerRayMarchingRendered.create_variable_configs();
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
