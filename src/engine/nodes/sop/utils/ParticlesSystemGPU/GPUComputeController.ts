import {Vector2} from 'three/src/math/Vector2';
import {MathUtils} from 'three/src/math/MathUtils';
import {InstancedBufferAttribute} from 'three/src/core/InstancedBufferAttribute';
import {DataTexture} from 'three/src/textures/DataTexture';
import {BufferAttribute} from 'three/src/core/BufferAttribute';
import {CoreGroup} from '../../../../../core/geometry/Group';
import {GlConstant} from '../../../../../core/geometry/GlConstant';
import {CoreMath} from '../../../../../core/math/_Module';
import {GlobalsTextureHandler} from '../../../gl/code/globals/Texture';
import {GPUComputationRenderer, GPUComputationRendererVariable} from './GPUComputationRenderer';
import {ParticlesSystemGpuSopNode} from '../../ParticlesSystemGpu';
import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {Poly} from '../../../../Poly';
import {CorePoint} from '../../../../../core/geometry/Point';
import {ShaderName} from '../../../utils/shaders/ShaderName';
import {TextureAllocationsController} from '../../../gl/code/utils/TextureAllocationsController';
import {GlParamConfig} from '../../../gl/code/utils/ParamConfig';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {CoreGraphNode} from '../../../../../core/graph/CoreGraphNode';
import {FloatType, HalfFloatType} from 'three/src/constants';
export enum ParticlesDataType {
	FLOAT = 'float',
	HALF_FLOAT = 'half',
}
export const PARTICLE_DATA_TYPES: ParticlesDataType[] = [ParticlesDataType.FLOAT, ParticlesDataType.HALF_FLOAT];
const DATA_TYPE_BY_ENUM = {
	[ParticlesDataType.FLOAT]: FloatType,
	[ParticlesDataType.HALF_FLOAT]: HalfFloatType,
};
export class ParticlesSystemGpuComputeController {
	protected _gpu_compute: GPUComputationRenderer | undefined;
	protected _simulation_restart_required: boolean = false;

	protected _renderer: WebGLRenderer | undefined;

	protected _particles_core_group: CoreGroup | undefined;
	protected _points: CorePoint[] = [];

	private variables_by_name: Map<ShaderName, GPUComputationRendererVariable> = new Map();
	private _all_variables: GPUComputationRendererVariable[] = [];
	private _created_textures_by_name: Map<ShaderName, DataTexture> = new Map();
	private _shaders_by_name: Map<ShaderName, string> | undefined;
	protected _last_simulated_frame: number | undefined;
	protected _last_simulated_time: number | undefined;
	protected _delta_time: number = 0;
	private _used_textures_size: Vector2 = new Vector2();
	private _persisted_texture_allocations_controller: TextureAllocationsController | undefined;

	constructor(private node: ParticlesSystemGpuSopNode) {}

	set_persisted_texture_allocation_controller(controller: TextureAllocationsController) {
		this._persisted_texture_allocations_controller = controller;
	}

	set_shaders_by_name(shaders_by_name: Map<ShaderName, string>) {
		this._shaders_by_name = shaders_by_name;
		this.reset_gpu_compute();
	}
	all_variables() {
		return this._all_variables;
	}

	async init(core_group: CoreGroup) {
		this.init_particle_group_points(core_group);
		await this.create_gpu_compute();
	}

	getCurrentRenderTarget(shader_name: ShaderName) {
		const variable = this.variables_by_name.get(shader_name);
		if (variable) {
			return this._gpu_compute?.getCurrentRenderTarget(variable);
		}
	}

	init_particle_group_points(core_group: CoreGroup) {
		this.reset_gpu_compute();

		if (!core_group) {
			return;
		}

		this._particles_core_group = core_group;

		this._points = this._get_points() || [];
	}

	compute_similation_if_required() {
		const frame = this.node.scene.frame;
		const start_frame: number = this.node.pv.startFrame;
		if (frame >= start_frame) {
			if (this._last_simulated_frame == null) {
				this._last_simulated_frame = start_frame - 1;
			}
			if (this._last_simulated_time == null) {
				this._last_simulated_time = this.node.scene.time;
			}
			if (frame > this._last_simulated_frame) {
				this._compute_simulation(frame - this._last_simulated_frame);
			}
		}
	}

	private _compute_simulation(iterations_count = 1) {
		if (!this._gpu_compute || this._last_simulated_time == null) {
			return;
		}

		this.update_simulation_material_uniforms();

		for (let i = 0; i < iterations_count; i++) {
			this._gpu_compute.compute();
		}
		this.node.render_controller.update_render_material_uniforms();
		this._last_simulated_frame = this.node.scene.frame;

		const time = this.node.scene.time;
		this._delta_time = time - this._last_simulated_time;
		this._last_simulated_time = time;
	}

	private _data_type() {
		const data_type_name = PARTICLE_DATA_TYPES[this.node.pv.dataType];
		return DATA_TYPE_BY_ENUM[data_type_name];
	}

	async create_gpu_compute() {
		if (this.node.pv.auto_textures_size) {
			const nearest_power_of_two = CoreMath.nearestPower2(Math.sqrt(this._points.length));
			this._used_textures_size.x = Math.min(nearest_power_of_two, this.node.pv.maxTexturesSize.x);
			this._used_textures_size.y = Math.min(nearest_power_of_two, this.node.pv.maxTexturesSize.y);
		} else {
			if (
				!(
					MathUtils.isPowerOfTwo(this.node.pv.texturesSize.x) &&
					MathUtils.isPowerOfTwo(this.node.pv.texturesSize.y)
				)
			) {
				this.node.states.error.set('texture size must be a power of 2');
				return;
			}

			const max_particles_count = this.node.pv.texturesSize.x * this.node.pv.texturesSize.y;
			if (this._points.length > max_particles_count) {
				this.node.states.error.set(
					`max particles is set to (${this.node.pv.texturesSize.x}x${this.node.pv.texturesSize.y}=) ${max_particles_count}`
				);
				return;
			}
			this._used_textures_size.copy(this.node.pv.texturesSize);
		}

		this._force_time_dependent();
		this._init_particles_uvs();
		// we need to recreate the material if the texture allocation changes
		this.node.render_controller.reset_render_material();

		const renderer = await Poly.instance().renderers_controller.wait_for_renderer();
		if (renderer) {
			this._renderer = renderer;
		} else {
			this.node.states.error.set('no renderer found');
		}
		if (!this._renderer) {
			return;
		}

		const compute = new GPUComputationRenderer(
			this._used_textures_size.x,
			this._used_textures_size.y,
			this._renderer
		);

		compute.setDataType(this._data_type());
		this._gpu_compute = (<unknown>compute) as GPUComputationRenderer;

		if (!this._gpu_compute) {
			this.node.states.error.set('failed to create the GPUComputationRenderer');
			return;
		}

		this._last_simulated_frame = undefined;

		// document.body.style = ''
		// document.body.appendChild( renderer.domElement );

		this.variables_by_name.forEach((variable, shader_name) => {
			variable.renderTargets[0].dispose();
			variable.renderTargets[1].dispose();
			this.variables_by_name.delete(shader_name);
		});
		// for (let shader_name of Object.keys(this._shaders_by_name)) {
		this._all_variables = [];
		this._shaders_by_name?.forEach((shader, shader_name) => {
			if (this._gpu_compute) {
				const variable = this._gpu_compute.addVariable(
					`texture_${shader_name}`,
					shader,
					this._created_textures_by_name.get(shader_name)!
				);
				this.variables_by_name.set(shader_name, variable);
				this._all_variables.push(variable);
			}
		});

		this.variables_by_name?.forEach((variable, shader_name) => {
			if (this._gpu_compute) {
				this._gpu_compute.setVariableDependencies(
					variable,
					this._all_variables // currently all depend on all
				);
			}
		});

		this._create_texture_render_targets();
		this._fill_textures();
		this.create_simulation_material_uniforms();

		var error = this._gpu_compute.init();

		if (error !== null) {
			console.error(error);
			this.node.states.error.set(error);
		}
	}

	private _graph_node: CoreGraphNode | undefined;
	private _force_time_dependent() {
		// using force_time_dependent would force the whole node to recook,
		// but that would also trigger the obj geo node to update its display node.
		// A better way is to just recompute the sim only, outside of the cook method.
		// But we need to be sure that on first frame, we are still recooking the whole node
		// this.node.states.time_dependent.force_time_dependent();
		if (!this._graph_node) {
			this._graph_node = new CoreGraphNode(this.node.scene, 'gpu_compute');
			this._graph_node.add_graph_input(this.node.scene.timeController.graph_node);
			this._graph_node.add_post_dirty_hook('on_time_change', this._on_graph_node_dirty.bind(this));
		}
	}
	private _on_graph_node_dirty() {
		if (this.node.is_on_frame_start()) {
			this.node.set_dirty();
			return;
		} else {
			this.compute_similation_if_required();
		}
	}

	private create_simulation_material_uniforms() {
		const assembler = this.node.assembler_controller?.assembler;
		if (!assembler && !this._persisted_texture_allocations_controller) {
			return;
		}
		const all_materials: ShaderMaterial[] = [];
		this.variables_by_name.forEach((variable, shader_name) => {
			// const uniforms = variable.material.uniforms;
			all_materials.push(variable.material);
		});
		for (let material of all_materials) {
			material.uniforms[GlConstant.TIME] = {value: this.node.scene.time};
			material.uniforms[GlConstant.DELTA_TIME] = {value: this.node.scene.time};
		}

		if (assembler) {
			for (let material of all_materials) {
				for (let param_config of assembler.param_configs()) {
					material.uniforms[param_config.uniform_name] = param_config.uniform;
				}
			}
		} else {
			const persisted_data = this.node.persisted_config.loaded_data();
			if (persisted_data) {
				const persisted_uniforms = this.node.persisted_config.uniforms();
				if (persisted_uniforms) {
					const param_uniform_pairs = persisted_data.param_uniform_pairs;
					for (let pair of param_uniform_pairs) {
						const param_name = pair[0];
						const uniform_name = pair[1];
						const param = this.node.params.get(param_name);
						const uniform = persisted_uniforms[uniform_name];
						for (let material of all_materials) {
							material.uniforms[uniform_name] = uniform;
						}
						if (param && uniform) {
							param.options.set_option('callback', () => {
								for (let material of all_materials) {
									GlParamConfig.callback(param, material.uniforms[uniform_name]);
								}
							});
						}
					}
				}
			}
		}
	}
	private update_simulation_material_uniforms() {
		for (let variable of this._all_variables) {
			variable.material.uniforms[GlConstant.TIME].value = this.node.scene.time;
			variable.material.uniforms[GlConstant.DELTA_TIME].value = this._delta_time;
		}
	}

	private _init_particles_uvs() {
		var uvs = new Float32Array(this._points.length * 2);

		let p = 0;
		var cmptr = 0;
		for (var j = 0; j < this._used_textures_size.x; j++) {
			for (var i = 0; i < this._used_textures_size.y; i++) {
				uvs[p++] = i / (this._used_textures_size.x - 1);
				uvs[p++] = j / (this._used_textures_size.y - 1);

				cmptr += 2;
				if (cmptr >= uvs.length) {
					break;
				}
			}
		}

		const uv_attrib_name = GlobalsTextureHandler.UV_ATTRIB;
		if (this._particles_core_group) {
			for (let core_geometry of this._particles_core_group.coreGeometries()) {
				const geometry = core_geometry.geometry();
				const attribute_constructor = core_geometry.markedAsInstance()
					? InstancedBufferAttribute
					: BufferAttribute;
				geometry.setAttribute(uv_attrib_name, new attribute_constructor(uvs, 2));
			}
		}
	}

	created_textures_by_name() {
		return this._created_textures_by_name;
	}

	private _fill_textures() {
		const assembler = this.node.assembler_controller?.assembler;
		const texture_allocations_controller = assembler
			? assembler.texture_allocations_controller
			: this._persisted_texture_allocations_controller;
		if (!texture_allocations_controller) {
			return;
		}
		this._created_textures_by_name.forEach((texture, shader_name) => {
			const texture_allocation = texture_allocations_controller.allocation_for_shader_name(shader_name);
			if (!texture_allocation) {
				return;
			}
			const texture_variables = texture_allocation.variables;
			if (!texture_variables) {
				return;
			}

			const array = texture.image.data;

			for (let texture_variable of texture_variables) {
				const texture_position = texture_variable.position;
				let variable_name = texture_variable.name;

				const first_point = this._points[0];
				if (first_point) {
					const has_attrib = first_point.hasAttrib(variable_name);
					if (has_attrib) {
						const attrib_size = first_point.attribSize(variable_name);
						let cmptr = texture_position;
						for (let point of this._points) {
							if (attrib_size == 1) {
								const val: number = point.attribValue(variable_name) as number;
								array[cmptr] = val;
							} else {
								(point.attribValue(variable_name) as Vector2).toArray(array, cmptr);
							}
							cmptr += 4;
						}
					}
				}
			}
		});
	}

	reset_gpu_compute() {
		this._gpu_compute = undefined;
		this._simulation_restart_required = true;
	}
	set_restart_not_required() {
		this._simulation_restart_required = false;
	}
	reset_gpu_compute_and_set_dirty() {
		this.reset_gpu_compute();
		this.node.set_dirty();
	}
	reset_particle_groups() {
		this._particles_core_group = undefined;
	}
	get initialized(): boolean {
		return this._particles_core_group != null && this._gpu_compute != null;
	}

	private _create_texture_render_targets() {
		this._created_textures_by_name.forEach((texture, shader_name) => {
			texture.dispose();
		});

		this._created_textures_by_name.clear();
		this.variables_by_name.forEach((texture_variable, shader_name) => {
			if (this._gpu_compute) {
				this._created_textures_by_name.set(shader_name, this._gpu_compute.createTexture());
			}
		});
	}
	restart_simulation_if_required() {
		if (this._simulation_restart_required) {
			this._restart_simulation();
		}
	}
	private _restart_simulation() {
		this._last_simulated_time = undefined;

		this._create_texture_render_targets();
		const points = this._get_points(); // TODO: typescript - not sure that's right
		if (!points) {
			return;
		}

		this._fill_textures();

		this.variables_by_name.forEach((variable, shader_name) => {
			const texture = this._created_textures_by_name.get(shader_name);
			if (this._gpu_compute && texture) {
				this._gpu_compute.renderTexture(texture, variable.renderTargets[0]);
				this._gpu_compute.renderTexture(texture, variable.renderTargets[1]);
			}
		});
	}

	// if we have a mix of marked_as_instance and non marked_as_instance
	// we take all geos that are the type that comes first
	private _get_points() {
		if (!this._particles_core_group) {
			return;
		}

		let geometries = this._particles_core_group.coreGeometries();
		const first_geometry = geometries[0];
		if (first_geometry) {
			const type = first_geometry.markedAsInstance();
			const selected_geometries = [];
			for (let geometry of geometries) {
				if (geometry.markedAsInstance() == type) {
					selected_geometries.push(geometry);
				}
			}
			const points = [];
			for (let geometry of selected_geometries) {
				for (let point of geometry.points()) {
					points.push(point);
				}
			}
			return points;
		} else {
			return [];
		}
	}
}
