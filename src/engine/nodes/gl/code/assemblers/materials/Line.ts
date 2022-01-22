import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {ShaderLib} from 'three/src/renderers/shaders/ShaderLib';

import {ShaderAssemblerMaterial, CustomAssemblerMap, CustomMaterialName} from './_BaseMaterial';

import {ShaderConfig} from '../../configs/ShaderConfig';
import {VariableConfig} from '../../configs/VariableConfig';
import {GlobalsGeometryHandler} from '../../globals/Geometry';

import {ShaderAssemblerCustomLineDepth} from './custom/line/CustomLineDepth';
import {ShaderAssemblerCustomLineDistance} from './custom/line/CustomLineDistance';
// import {ShaderAssemblerCustomMeshDistance} from './CustomMeshDistance';
// import {ShaderAssemblerCustomLineDepthDOF} from './CustomLineDepthDOF';
import {ShaderName} from '../../../../utils/shaders/ShaderName';
import {OutputGlNode} from '../../../Output';
import {GlConnectionPointType, GlConnectionPoint} from '../../../../utils/io/connections/Gl';
import {VaryingWriteGlNode} from '../../../VaryingWrite';

const ASSEMBLER_MAP: CustomAssemblerMap = new Map([
	// [CustomMaterialName.DISTANCE, ShaderAssemblerCustomMeshDistance],
	// [CustomMaterialName.DEPTH, ShaderAssemblerCustomMeshDepth],
	// [CustomMaterialName.DEPTH_DOF, ShaderAssemblerCustomMeshDepthDOF],
]);
ASSEMBLER_MAP.set(CustomMaterialName.DISTANCE, ShaderAssemblerCustomLineDistance);
ASSEMBLER_MAP.set(CustomMaterialName.DEPTH, ShaderAssemblerCustomLineDepth);
// ASSEMBLER_MAP.set(CustomMaterialName.DEPTH_DOF, ShaderAssemblerCustomLineDepthDOF);
if (false) {
	// ASSEMBLER_MAP.set(CustomMaterialName.DISTANCE, ShaderAssemblerCustomMeshDistance);
	// ASSEMBLER_MAP.set(CustomMaterialName.DEPTH_DOF, ShaderAssemblerCustomLineDepthDOF);
}
const LINES_TO_REMOVE_MAP: Map<ShaderName, string[]> = new Map([
	[ShaderName.VERTEX, ['#include <begin_vertex>', '#include <project_vertex>']],
	[ShaderName.FRAGMENT, []],
]);

export class ShaderAssemblerLine extends ShaderAssemblerMaterial {
	// _color_declaration() { return 'diffuseColor' }
	templateShader() {
		const template = ShaderLib.dashed;
		return {
			vertexShader: template.vertexShader, //TemplateVertex,
			fragmentShader: template.fragmentShader, //TemplateFragment,
			uniforms: template.uniforms,
		};
	}
	createMaterial() {
		const template_shader = this.templateShader();

		const material = new ShaderMaterial({
			depthTest: true,
			alphaTest: 0.5,
			linewidth: 1,
			// isLineBasicMaterial: true,

			uniforms: UniformsUtils.clone(template_shader.uniforms),
			vertexShader: template_shader.vertexShader,
			fragmentShader: template_shader.fragmentShader,
		});
		this._addCustomMaterials(material);
		return material;
	}
	custom_assembler_class_by_custom_name(): CustomAssemblerMap {
		return ASSEMBLER_MAP;
	}
	create_shader_configs() {
		return [
			new ShaderConfig(ShaderName.VERTEX, ['position', 'uv', VaryingWriteGlNode.INPUT_NAME], []),
			new ShaderConfig(ShaderName.FRAGMENT, ['color', 'alpha'], [ShaderName.VERTEX]),
		];
	}
	static output_input_connection_points() {
		return [
			new GlConnectionPoint('position', GlConnectionPointType.VEC3),
			new GlConnectionPoint('color', GlConnectionPointType.VEC3),
			new GlConnectionPoint('alpha', GlConnectionPointType.FLOAT),
			new GlConnectionPoint('uv', GlConnectionPointType.VEC2),
		];

		// output_child.add_param(ParamType.VECTOR3, 'position', [0, 0, 0], {hidden: true});
		// // output_child.add_param( ParamType.VECTOR, 'normal', [0,0,0], {hidden: true} )
		// output_child.add_param(ParamType.COLOR, 'color', [1, 1, 1], {hidden: true});
		// output_child.add_param(ParamType.FLOAT, 'alpha', 1, {hidden: true});
		// output_child.add_param(ParamType.VECTOR2, 'uv', [0, 0], {hidden: true});
	}
	add_output_inputs(output_child: OutputGlNode) {
		output_child.io.inputs.setNamedInputConnectionPoints(ShaderAssemblerLine.output_input_connection_points());
	}
	static create_globals_node_output_connections() {
		return [
			new GlConnectionPoint('position', GlConnectionPointType.VEC3),
			// new Connection.Vec3('normal'),
			new GlConnectionPoint('color', GlConnectionPointType.VEC3),
			new GlConnectionPoint('uv', GlConnectionPointType.VEC2),
			new GlConnectionPoint('gl_FragCoord', GlConnectionPointType.VEC4),
			new GlConnectionPoint('resolution', GlConnectionPointType.VEC2),
			// new Connection.Vec2('gl_PointCoord'),
			// new TypedConnectionVec2('uv'),
			new GlConnectionPoint('time', GlConnectionPointType.FLOAT),
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
				suffix: ';vec4 mvPosition = vec4( transformed, 1.0 ); gl_Position = projectionMatrix * modelViewMatrix * mvPosition;',
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
