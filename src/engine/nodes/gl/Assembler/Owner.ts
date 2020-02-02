import lodash_merge from 'lodash/merge';
import lodash_intersection from 'lodash/intersection';
import lodash_difference from 'lodash/difference';
import {VertexColors} from 'three/src/constants';
import {Vector2} from 'three/src/math/Vector2';
import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {ShaderLib} from 'three/src/renderers/shaders/ShaderLib';
import {FrontSide} from 'three/src/constants';
const THREE = {FrontSide, ShaderLib, ShaderMaterial, UniformsUtils, Vector2, VertexColors};
import {BaseNode} from 'src/Engine/Node/_Base';
// import {ParamType} from 'src/Engine/Param/_Module'

import {NodeContext} from 'src/Engine/Poly';
import {BaseNodeSop} from 'src/Engine/Node/Sop/_Base';
import {BaseShaderAssembler} from './_Base';
import {GlobalsBaseController} from './Globals/_Base';
import {GlobalsGeometryHandler} from './Globals/Geometry';

import {JsonImporterVisitor} from 'src/Engine/IO/Json/Import/Visitor';
import {JsonExporterVisitor} from 'src/Engine/IO/Json/Export/Visitor';

interface BaseShaderAssemblerConstructor {
	new (): BaseShaderAssembler;
}
// interface GlobalsBaseControllerConstructor {
// 	new (): GlobalsBaseController;
// }

export function AssemblerOwner<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		protected self: BaseNode = (<unknown>this) as BaseNode;
		children_context() {
			return NodeContext.GL;
		}

		protected _assembler: BaseShaderAssembler;
		private _globals_handler: GlobalsBaseController = new GlobalsGeometryHandler(this);
		private _compile_required: boolean = true;
		private _requester: BaseNodeSop;
		private _recompiled: boolean = false;
		private _shaders_by_name = {};

		private _deleted_params_data = {};

		set_assembler_globals_handler(globals_handler: GlobalsBaseController) {
			const current_id = this._globals_handler ? this._globals_handler.id() : null;
			const new_id = globals_handler ? globals_handler.id() : null;

			if (current_id != new_id) {
				this._globals_handler = globals_handler;
				this.set_compilation_required_and_dirty();
				this._assembler.reset_configs();
			}
		}
		assembler() {
			return this._assembler;
		}
		shaders_by_name() {
			return this._shaders_by_name;
		}
		globals_handler() {
			return this._globals_handler;
		}
		_init_common_shader_builder(assembler_class?: BaseShaderAssemblerConstructor, options = {}) {
			if (assembler_class) {
				this._assembler = new assembler_class(this);
			}
			// this._shadow_depth_assembler = new ShaderAssemblerDepth()
			// this._shadow_distance_assembler = new ShaderAssemblerDistance()

			this.self._init_hierarchy_children_owner();

			let has_display_flag = false;
			if (options['has_display_flag']) {
				has_display_flag = options['has_display_flag'];
			}

			this.self._init_display_flag({
				has_display_flag: has_display_flag,
				multiple_display_flags_allowed: false,
				affects_hierarchy: true,
			});

			// this ensures that material re evaluate their uniforms
			// without having the SOP/Material recook
			// which can be a killer in an animation
			// But this should be tweaked so that it can recook all params of a node
			// this.self.add_post_dirty_hook(this.eval_params_and_assign_uniform_values.bind(this))
			// - UPDATE: this seems to work at the moment. The only issue is that
			// the particle system now updates 2x when recreating the shaders
			// but that's fixed with update_on_dirty
			if (options['update_on_dirty'] != false) {
				this.self.add_post_dirty_hook(this.cook_main_if_scene_loaded.bind(this));
			}
		}
		gltf_supported_material() {
			return this._assembler.constructor.convert_material_to_gltf_supported(this._material);
		}

		add_output_params(output_child) {
			this._assembler.add_output_params(output_child);
		}
		add_globals_params(globals_node) {
			this._assembler.add_globals_params(globals_node);
		}
		allow_attribute_exports() {
			return this._assembler.allow_attribute_exports();
		}

		on_create() {
			const globals = this.self.create_node('globals');
			const output = this.self.create_node('output');

			globals.ui_data().set_position(new Vector2(-200, 0));
			output.ui_data().set_position(new Vector2(200, 0));
		}

		async compile_if_required() {
			this._recompiled = false;
			if (this.compile_required()) {
				// && !this._param_locked){
				const new_material = await this.run_assembler();
				if (new_material) {
					await this.self.eval_params(this._new_params);
					this._material = new_material;
					this._recompiled = true;
				} else {
					console.error(`${this.self.full_path()} failed to generate a material`);
				}
			}
			await this.assign_uniform_values();
		}
		set_compilation_required() {
			this._compile_required = true;
		}
		set_compilation_required_and_dirty() {
			this.set_compilation_required();
			this.self.set_dirty();
		}
		protected compile_required(): boolean {
			return this._compile_required;
		}
		private async run_assembler() {
			let material;
			const output_node = this._find_output_node();
			if (output_node) {
				this._assembler.set_root_nodes([output_node]);
			}
			material = await this._assembler.get_material();

			this._shaders_by_name['vertex'] = material.vertexShader;
			this._shaders_by_name['fragment'] = material.fragmentShader;
			material.custom_materials = await this._assembler.get_custom_materials();
			material.needsUpdate = true;

			this.create_spare_parameters();

			this._compile_required = false;
			return material;
		}

		protected _find_output_node() {
			const nodes = this.self.nodes_by_type('output');
			if (nodes.length > 1) {
				this.self.set_error('only one output node allowed');
			}
			return nodes[0];
		}
		// add_output_body_line(output_node, shader_name: ShaderName, input_name: string){
		// 	const input = output_node.named_input(input_name)
		// 	const var_input = output_node.variable_for_input(input_name)
		// 	const variable_config = this.variable_config(input_name)
		// 	const default_value = variable_config.default()
		// 	const prefix = variable_config.prefix()
		// 	const suffix = variable_config.suffix()
		// 	const new_var = input ? ThreeToGl.vector3(var_input) : default_value
		// 	if(new_var){
		// 		output_node.add_body_lines([`${prefix}${new_var}${suffix}`], shader_name)
		// 	}
		// }
		// set_output_node_lines(output_node){
		// 	for(let shader_name of this.shader_names()){
		// 		const body_lines = []
		// 		const input_names = this.shader_config(shader_name).input_names()
		// 		output_node.set_body_lines([], shader_name)
		// 		if(input_names){
		// 			for(let input_name of input_names){
		// 				this.add_output_body_line(output_node, shader_name, input_name)

		// 			}
		// 		}
		// 	}

		// 	// const vertex_body_lines = []
		// 	// const fragment_body_lines = []

		// 	// const named_input_position = this.named_input('position')
		// 	// const named_input_point_size = this.named_input('gl_PointSize')
		// 	// const named_input_normal = this.named_input('normal')

		// 	// const var_position = this.variable_for_input('position')
		// 	// const var_normal = this.variable_for_input('normal')
		// 	// const color = this.variable_for_input('color')
		// 	// const alpha = this.variable_for_input('alpha')
		// 	// const var_point_size = this.variable_for_input('gl_PointSize')

		// 	// fragment_body_lines.push( `${this._color_declaration} = ${ThreeToGl.vector3_float(color, alpha)}` )
		// 	// this.set_fragment_body_lines(fragment_body_lines)

		// 	// const new_position_var = named_input_position ? ThreeToGl.vector3(var_position) : 'vec3( position )'
		// 	// vertex_body_lines.push( `vec3 transformed = ${new_position_var}` )

		// 	// if(this.parent().is_point_material()){
		// 	// 	const new_point_size_var = named_input_point_size ? ThreeToGl.float(var_point_size) : '1.0'
		// 	// 	vertex_body_lines.push( `float size2 = size * ${new_point_size_var}` )
		// 	// }

		// 	// if(named_input_normal){
		// 	// 	const new_normal_var = ThreeToGl.vector3(var_normal)
		// 	// 	vertex_body_lines.push(`objectNormal = ${new_normal_var}`)
		// 	// }

		// 	// this.set_vertex_body_lines(vertex_body_lines)
		// 	// this.set_fragment_body_lines(fragment_body_lines)
		// }
		private async eval_params_and_assign_uniform_values() {
			if (!this.self.scene().loaded()) {
				return;
			}

			if (this._assembler) {
				await this.self.eval_all_params();
				await this.assign_uniform_values();
			}
		}
		private async cook_main_if_scene_loaded() {
			if (!this.self.scene().loaded()) {
				return;
			}
			if (this.self.params_referree().length > 0) {
				await this.self.cook_main();
			}
			// this.cook_main_without_inputs()
		}
		private async assign_uniform_values() {
			if (this._assembler) {
				for (let param_config of this._assembler.param_configs()) {
					await param_config.set_uniform_value(this.self);
				}
			}
		}

		// process_uniforms(renderer, display_scene, camera, geometry, material, group) {
		// 	const scene_frame = this.scene().frame()

		// 	const material_frame = material.uniforms.frame
		// 	if(material_frame){ // check needed in case this method is given a post process material
		// 		material.uniforms.frame.value = scene_frame
		// 	}

		// 	const custom_materials = material.custom_materials
		// 	if(custom_materials){
		// 		for(let custom_material_name of Object.keys(custom_materials)){
		// 			const custom_material = custom_materials[custom_material_name]
		// 			custom_material.uniforms.frame.value = scene_frame
		// 		}
		// 	}
		// }

		// create_material(){
		// 	const template_shader = THREE.ShaderLib.basic

		// 	const uniforms = THREE.UniformsUtils.clone( template_shader.uniforms )
		// 	// uniforms['frame'] = {
		// 	// 	type: '1f',
		// 	// 	value: 1
		// 	// }

		// 	const material = new THREE.ShaderMaterial({
		// 		// vertexColors: THREE.VertexColors,
		// 		// side: THREE.FrontSide,
		// 		// transparent: true,
		// 		// fog: true,
		// 		// lights: false,
		// 		uniforms: uniforms,
		// 		vertexShader: template_shader.vertexShader,
		// 		fragmentShader: template_shader.fragmentShader
		// 	})
		// 	throw "wtf"
		// 	return material
		// }
		create_spare_parameters() {
			const current_spare_param_names: string[] = this.self.spare_param_names();
			const param_configs = this._assembler.param_configs();
			const assembler_param_names = param_configs.map((c) => c.name());
			// TODO: also remove the params that change type
			const spare_param_names_to_add = lodash_difference(assembler_param_names, current_spare_param_names);
			const spare_param_names_to_remove = lodash_difference(current_spare_param_names, assembler_param_names);
			this._new_params = [];

			// check that param_names_to_add does not include any currently existing param names (that are not spare)
			const current_param_names = this.self.param_names();
			const spare_params_with_same_name_as_params = lodash_intersection(
				spare_param_names_to_add,
				current_param_names
			);
			if (spare_params_with_same_name_as_params.length > 0) {
				const error_message = `${this.self.full_path()} attempts to create spare params called '${spare_params_with_same_name_as_params.join(
					', '
				)}' with same name as params`;
				console.warn(error_message);
				this.self.set_error(error_message);
			}

			spare_param_names_to_remove.forEach((param_name) => {
				// store the param data, in case it gets recreated later
				// this allows expressions to be kept in memory
				const param = this.self.param(param_name);
				if (param) {
					const param_exporter = param.visit(JsonExporterVisitor);
					if (param_exporter.required()) {
						const params_data = param_exporter.data();
						this._deleted_params_data[param.name()] = params_data;
					}
				}

				this.self.delete_param(param_name);
			});

			this.within_param_folder('spare_params', () => {
				for (let param_config of param_configs) {
					if (spare_param_names_to_add.indexOf(param_config.name()) >= 0) {
						// TODO: shouldn't it be cook: false ??
						// as there is no need to cook the node if I'm only changing the uniform
						// unless maybe for textures?
						// but if cook is false, there is no reason for it to be updated
						const options = lodash_merge(param_config.param_options(), {spare: true, cook: true});

						const param = this.self.add_param(
							param_config.type(),
							param_config.name(),
							param_config.default_value(),
							options
						);

						// restore saved state, like expressions
						const param_data = this._deleted_params_data[param.name()];
						if (param_data) {
							param.visit(JsonImporterVisitor).process_data(param_data);
							// looks like there are still some cases where the expression are not recreated
							// so commenting this out now
							// delete this._deleted_params_data[param.name()]
						}

						this._new_params.push(param);
					}
				}
			});

			// updating params can be super slow (around 50ms easily - only tested in development environement)
			// so we only do it if new params where added or removed
			if (spare_param_names_to_add.length > 0 || spare_param_names_to_remove.length > 0) {
				this.emit('params_updated');
			}
		}
	};
}
