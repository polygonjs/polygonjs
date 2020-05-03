import {Vector2} from 'three/src/math/Vector2';

import {MathUtils} from 'three/src/math/MathUtils';
import {InstancedBufferAttribute} from 'three/src/core/InstancedBufferAttribute';
import {DataTexture} from 'three/src/textures/DataTexture';
import {BufferAttribute} from 'three/src/core/BufferAttribute';

// import {BaseNodeSop} from '../_Base'

// import {CoreConstant} from '../../../../../Core/Geometry/Constant'

import {CoreGroup} from '../../../../../core/geometry/Group';
import {CoreMath} from '../../../../../core/math/_Module';

// import computeShaderPosition from 'src/Engine/Node/Gl/Assembler/Template/Particle/Position.glsl'
// import computeShaderVelocity from 'src/Engine/Node/Gl/Assembler/Template/Particle/Particle.v.glsl'
// import particleVertexShader from 'src/Engine/Node/Gl/Assembler/Template/Particle/Particle.vert.glsl'
// import particleFragmentShader from 'src/Engine/Node/Gl/Assembler/Template/Particle/Particle.frag.glsl'
import {GlobalsTextureHandler} from '../../../gl/code/globals/Texture';
import {GPUComputationRenderer, GPUComputationRendererVariable} from './GPUComputationRenderer';
import {ParticlesSystemGpuSopNode} from '../../ParticlesSystemGpu';
import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {Poly} from '../../../../Poly';
import {CorePoint} from '../../../../../core/geometry/Point';
import {ShaderName} from '../../../utils/shaders/ShaderName';

export class ParticlesSystemGpuComputeController {
	protected _gpu_compute: GPUComputationRenderer | undefined;
	protected _simulation_restart_required: boolean = false;

	protected _renderer: WebGLRenderer | undefined;
	// private _particles_group: CoreGroup

	protected _particles_core_group: CoreGroup | undefined;
	protected _points: CorePoint[] = [];

	private variables_by_name: Map<ShaderName, GPUComputationRendererVariable> = new Map();
	private _created_textures_by_name: Map<ShaderName, DataTexture> = new Map();
	private _shaders_by_name: Map<ShaderName, string> | undefined;
	protected _last_simulated_frame: number | undefined;
	// private _use_instancing: boolean = false

	// private _param_auto_textures_size: boolean;
	// private _param_max_textures_size: Vector2;
	// private _param_textures_sizes: Vector2;
	private _used_textures_size: Vector2 = new Vector2();

	constructor(private node: ParticlesSystemGpuSopNode) {}

	// protected _create_gpu_compute_params() {
	// 	this.self.within_param_folder('setup', () => {
	// 		this.self.add_param(ParamType.INTEGER, 'start_frame', 1, {
	// 			range: [1, 100],
	// 		});
	// 		this.self.add_param(ParamType.TOGGLE, 'auto_textures_size', 1);
	// 		this.self.add_param(ParamType.VECTOR2, 'max_textures_size', [1024, 1024], {
	// 			visible_if: {auto_textures_size: 1},
	// 		});
	// 		this.self.add_param(ParamType.VECTOR2, 'textures_size', [64, 64], {
	// 			visible_if: {auto_textures_size: 0},
	// 		});
	// 		this.self.add_param(ParamType.BUTTON, 'reset', '', {
	// 			callback: this._reset_gpu_compute_and_set_dirty.bind(this),
	// 		});
	// 	});
	// 	// this.self.add_param(ParamType.BUTTON, 'force_compute', '', {callback: this._force_compute.bind(this)})
	// }

	set_shaders_by_name(shaders_by_name: Map<ShaderName, string>) {
		this._shaders_by_name = shaders_by_name;
		this.reset_gpu_compute();
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
		// this._particles_group_objects = []; //this._particles_core_group.objects()

		// in order to have proper copy on each children, I need to do .push for each
		// and not just my_array = group.children, as the array would then be empty
		// after have done .set_group(group)
		// I may need to rethink the whole
		// for (let child of this._particles_core_group.objects()) {
		// 	this._particles_group_objects.push(child);
		// }
		// this._particles_core_group = new CoreGroup(this._particles_group)
		this._points = this._get_points() || [];
	}

	compute_similation_if_required() {
		const frame = this.node.scene.frame;
		const start_frame: number = this.node.pv.start_frame;
		if (frame >= start_frame) {
			if (this._last_simulated_frame == null) {
				this._last_simulated_frame = start_frame - 1;
			}
			if (frame > this._last_simulated_frame) {
				this._compute_simulation(frame - this._last_simulated_frame);
			}
		}
	}

	private _compute_simulation(count = 1) {
		if (!this._gpu_compute) {
			return;
		}

		this.update_simulation_material_uniforms();

		for (let i = 0; i < count; i++) {
			this._gpu_compute.compute();
		}
		this.node.render_controller.update_render_material_uniforms();
		this._last_simulated_frame = this.node.scene.frame;

		// this._renderer.render(this._gpu_scene, this._gpu_camera)
	}

	async create_gpu_compute() {
		if (this.node.pv.auto_textures_size) {
			const nearest_power_of_two = CoreMath.nearestPower2(Math.sqrt(this._points.length));
			this._used_textures_size.x = Math.min(nearest_power_of_two, this.node.pv.max_textures_size.x);
			this._used_textures_size.y = Math.min(nearest_power_of_two, this.node.pv.max_textures_size.y);
		} else {
			if (
				!(
					MathUtils.isPowerOfTwo(this.node.pv.textures_size.x) &&
					MathUtils.isPowerOfTwo(this.node.pv.textures_size.y)
				)
			) {
				this.node.states.error.set('texture size must be a power of 2');
				return;
			}

			const max_particles_count = this.node.pv.textures_size.x * this.node.pv.textures_size.y;
			if (this._points.length > max_particles_count) {
				this.node.states.error.set(
					`max particles is set to (${this.node.pv.textures_size.x}x${this.node.pv.textures_size.y}=) ${max_particles_count}`
				);
				return;
			}
			this._used_textures_size.copy(this.node.pv.textures_size);
		}

		this.node.states.time_dependent.force_time_dependent();
		this._init_particles_uvs();
		// we need to recreate the material if the texture allocation changes
		this.node.render_controller.reset_render_material();
		// await this.node.render_controller.init_render_material();

		const renderer = await Poly.instance().renderers_controller.wait_for_renderer(); //new WebGLRenderer();
		if (renderer) {
			this._renderer = renderer;
		} else {
			this.node.states.error.set('no renderer found');
		}
		if (!this._renderer) {
			return;
		}
		// console.log(this._renderer.extensions, this._renderer.capabilities)
		// if(!this._renderer.extensions.get( 'WEBGL_draw_buffers' )){
		// 	this.self.set_error("this operator requires the browser extension WEBGL_draw_buffers")
		// 	alert("no extension found")
		// 	return
		// }
		// this._renderer = new WebGLRenderer();
		// this._gpu_scene = new Scene()
		// this._gpu_camera = new Camera()
		// this._renderer.setPixelRatio( window.devicePixelRatio );
		// this._renderer.setSize( this.node.pv.textures_size.x, this.node.pv.textures_size.y );

		const compute = new GPUComputationRenderer(
			this._used_textures_size.x,
			this._used_textures_size.y,
			this._renderer
		);
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
		const all_variables: GPUComputationRendererVariable[] = [];
		this._shaders_by_name?.forEach((shader, shader_name) => {
			if (this._gpu_compute) {
				const variable = this._gpu_compute.addVariable(
					`texture_${shader_name}`,
					shader,
					this._created_textures_by_name.get(shader_name)!
				);
				this.variables_by_name.set(shader_name, variable);
				all_variables.push(variable);
			}
		});

		// this._gpu_compute.setVariableDependencies( this.var_v, [ this.var_P, this.var_v ] );
		// for (let shader_name of Object.keys(this._shaders_by_name)) {
		this.variables_by_name?.forEach((variable, shader_name) => {
			if (this._gpu_compute) {
				this._gpu_compute.setVariableDependencies(
					variable,
					all_variables // currently all depend on all
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

	private create_simulation_material_uniforms() {
		this.variables_by_name.forEach((variable, shader_name) => {
			const uniforms = variable.material.uniforms;
			uniforms['frame'] = {value: this.node.scene.frame};

			for (let param_config of this.node.assembler_controller.assembler.param_configs()) {
				uniforms[param_config.uniform_name] = param_config.uniform;
			}
		});
	}
	private update_simulation_material_uniforms() {
		this.variables_by_name.forEach((variable, shader_name) => {
			variable.material.uniforms['frame'].value = this.node.scene.frame;
		});
	}

	private _init_particles_uvs() {
		// var uvs = new Float32Array( this.node.pv.textures_size.x * this.node.pv.textures_size.y * 2 );
		var uvs = new Float32Array(this._points.length * 2);
		// const rows_count = Math.ceil(Math.min(
		// 	this.node.pv.textures_size.y, (points.length / this.node.pv.textures_size.y)
		// ))
		// const columns_count = Math.ceil(Math.min(
		// 	this.node.pv.textures_size.x, (points.length / rows_count)
		// ))
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
			for (let core_geometry of this._particles_core_group.core_geometries()) {
				// geometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) );
				const geometry = core_geometry.geometry();
				const attribute_constructor = core_geometry.marked_as_instance()
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
		this._created_textures_by_name.forEach((texture, shader_name) => {
			const assembler = this.node.assembler_controller.assembler;
			const texture_allocations_controller = assembler.texture_allocations_controller;

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
				// if(this._use_instancing){
				// 	variable_name = GlobalsTextureHandler.variable_name_to_instance_attrib(variable_name)
				// }

				const first_point = this._points[0];
				if (first_point) {
					const has_attrib = first_point.has_attrib(variable_name);
					if (has_attrib) {
						const attrib_size = first_point.attrib_size(variable_name);
						let cmptr = texture_position;
						for (let point of this._points) {
							if (attrib_size == 1) {
								const val: number = point.attrib_value(variable_name) as number;
								array[cmptr] = val;
							} else {
								(point.attrib_value(variable_name) as Vector2).toArray(array, cmptr);
							}
							cmptr += 4;
						}
					}
				}
			}
		});

		// var posArray = texture_P.image.data;
		// var velArray = texture_v.image.data;

		// let cmptr = 0
		// for(let point of points){
		// 	point.position().toArray(posArray, cmptr)
		// 	posArray[ cmptr + 3 ] = 1;
		// 	cmptr += 4
		// }
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
		// this._particles_group = null
		// this._particles_group_objects = [];
		this._particles_core_group = undefined;
	}
	get initialized(): boolean {
		return this._particles_core_group != null && this._gpu_compute != null;
	}
	// private _force_compute(){
	// 	this.self.run_assembler()
	// }

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
		this._last_simulated_frame = undefined;

		this._create_texture_render_targets();
		const points = this._get_points(); // TODO: typescript - not sure that's right
		if (!points) {
			return;
		}

		this._fill_textures();

		// for (let variable_name of Object.keys(this.variables_by_name)) {
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

		let geometries = this._particles_core_group.core_geometries();
		const first_geometry = geometries[0];
		if (first_geometry) {
			const type = first_geometry.marked_as_instance();
			// this._use_instancing = type
			const selected_geometries = [];
			for (let geometry of geometries) {
				if (geometry.marked_as_instance() == type) {
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
