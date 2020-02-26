import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {ShaderLib} from 'three/src/renderers/shaders/ShaderLib';

import {ShaderAssemblerRender, CustomAssemblerMap, CustomMaterialName} from './_BaseRender';

import {ShaderConfig} from '../configs/ShaderConfig';
import {VariableConfig} from '../configs/VariableConfig';
import {GlobalsGeometryHandler} from '../globals/Geometry';

// import {ShaderAssemblerCustomMeshDepth} from './CustomMeshDepth'
// import {ShaderAssemblerCustomMeshDistance} from './CustomMeshDistance'
import {ShaderAssemblerCustomLineDepthDOF} from './CustomLineDepthDOF';
import {ShaderName} from '../../../utils/shaders/ShaderName';
import {OutputGlNode} from '../../Output';
import {ParamType} from '../../../../poly/ParamType';
import {TypedNamedConnectionPoint} from '../../../utils/connections/NamedConnectionPoint';
import {ConnectionPointType} from '../../../utils/connections/ConnectionPointType';

const ASSEMBLER_MAP: CustomAssemblerMap = new Map([
	// [CustomMaterialName.DISTANCE, ShaderAssemblerCustomMeshDistance],
	// [CustomMaterialName.DEPTH, ShaderAssemblerCustomMeshDepth],
	// [CustomMaterialName.DEPTH_DOF, ShaderAssemblerCustomMeshDepthDOF],
]);
ASSEMBLER_MAP.set(CustomMaterialName.DEPTH_DOF, ShaderAssemblerCustomLineDepthDOF);
const LINES_TO_REMOVE_MAP: Map<ShaderName, string[]> = new Map([
	[ShaderName.VERTEX, ['#include <begin_vertex>', 'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );']],
	[ShaderName.FRAGMENT, []],
]);

export class ShaderAssemblerLine extends ShaderAssemblerRender {
	// _color_declaration() { return 'diffuseColor' }
	get _template_shader() {
		const template = ShaderLib.dashed;
		return {
			vertexShader: template.vertexShader, //TemplateVertex,
			fragmentShader: template.fragmentShader, //TemplateFragment,
			uniforms: template.uniforms,
		};
	}
	_create_material() {
		const template_shader = this._template_shader;

		// const uniforms = UniformsUtils.clone( template_shader.uniforms )
		// uniforms.size.value = 10

		return new ShaderMaterial({
			// vertexColors: VertexColors,
			// side: FrontSide,
			// transparent: true,
			// fog: true,
			// lights: false,

			// size: 10,
			// //vertexColors: VertexColors
			// //blending: AdditiveBlending
			depthTest: true,
			alphaTest: 0.5,
			linewidth: 100,
			// isLineBasicMaterial: true,

			uniforms: UniformsUtils.clone(template_shader.uniforms),
			vertexShader: template_shader.vertexShader,
			fragmentShader: template_shader.fragmentShader,
		});
		// material.uniforms.size.value = 10
		// return material
	}

	custom_assembler_class_by_custom_name(): CustomAssemblerMap {
		return ASSEMBLER_MAP;
		// return {
		// 	// customDepthMaterial: ShaderAssemblerCustomMeshDepth,
		// 	// customDistanceMaterial: ShaderAssemblerCustomMeshDistance,
		// 	customDepthDOFMaterial: ShaderAssemblerCustomLineDepthDOF,
		// };
	}
	create_shader_configs() {
		return [
			new ShaderConfig(ShaderName.VERTEX, ['position', 'uv'], []),
			new ShaderConfig(ShaderName.FRAGMENT, ['color', 'alpha'], [ShaderName.VERTEX]),
		];
	}
	static add_output_params(output_child: OutputGlNode) {
		output_child.add_param(ParamType.VECTOR3, 'position', [0, 0, 0], {hidden: true});
		// output_child.add_param( ParamType.VECTOR, 'normal', [0,0,0], {hidden: true} )
		output_child.add_param(ParamType.COLOR, 'color', [1, 1, 1], {hidden: true});
		output_child.add_param(ParamType.FLOAT, 'alpha', 1, {hidden: true});
		output_child.add_param(ParamType.VECTOR2, 'uv', [0, 0], {hidden: true});
	}
	add_output_params(output_child: OutputGlNode) {
		ShaderAssemblerLine.add_output_params(output_child);
	}
	static create_globals_node_output_connections() {
		return [
			new TypedNamedConnectionPoint('position', ConnectionPointType.VEC3),
			// new Connection.Vec3('normal'),
			new TypedNamedConnectionPoint('color', ConnectionPointType.VEC3),
			new TypedNamedConnectionPoint('uv', ConnectionPointType.VEC2),
			new TypedNamedConnectionPoint('gl_FragCoord', ConnectionPointType.VEC4),
			new TypedNamedConnectionPoint('resolution', ConnectionPointType.VEC2),
			// new Connection.Vec2('gl_PointCoord'),
			// new TypedConnectionVec2('uv'),
			new TypedNamedConnectionPoint('frame', ConnectionPointType.FLOAT),
		];
	}
	create_globals_node_output_connections() {
		return ShaderAssemblerLine.create_globals_node_output_connections();
	}
	create_variable_configs() {
		return [
			new VariableConfig('position', {
				default: 'vec3( position )',
				prefix: 'vec3 transformed = ',
				suffix: ';vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 )',
			}),
			// new VariableConfig('normal', {
			// 	prefix: 'objectNormal = '
			// }),
			new VariableConfig('color', {
				prefix: 'diffuseColor.xyz = ',
			}),
			new VariableConfig('alpha', {
				prefix: 'diffuseColor.w = ',
			}),
			new VariableConfig('uv', {
				// default_from_attribute: true,
				prefix: 'vUv = ',
				if: GlobalsGeometryHandler.IF_RULE.uv,
			}),
		];
	}
	protected lines_to_remove(shader_name: ShaderName) {
		return LINES_TO_REMOVE_MAP.get(shader_name);
	}
}
