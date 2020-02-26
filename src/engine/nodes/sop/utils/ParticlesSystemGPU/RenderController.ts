import lodash_cloneDeep from 'lodash/cloneDeep';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
// import {BaseNodeSop} from '../_Base'
import {Object3D} from 'three/src/core/Object3D';
import {BaseBuilderMatNodeType} from '../../../mat/_BaseBuilder';

// import computeShaderPosition from 'src/Engine/Node/Gl/Assembler/Template/Particle/Position.glsl'
// import computeShaderVelocity from 'src/Engine/Node/Gl/Assembler/Template/Particle/Particle.v.glsl'
// import particleVertexShader from 'src/Engine/Node/Gl/Assembler/Template/Particle/Particle.vert.glsl'
// import particleFragmentShader from 'src/Engine/Node/Gl/Assembler/Template/Particle/Particle.frag.glsl'
import {GlobalsTextureHandler} from '../../../gl/code/globals/Texture';

import {ParticlesSystemGpuSopNode} from '../../ParticlesSystemGpu';
import {CoreMaterial, ShaderMaterialWithCustomMaterials} from '../../../../../core/geometry/Material';
import {CoreGroup} from '../../../../../core/geometry/Group';
import {Mesh} from 'three/src/objects/Mesh';
import {ShaderName} from '../../../utils/shaders/ShaderName';
import {TextureAllocationsControllerData} from '../../../gl/code/utils/TextureAllocationsController';

export class ParticlesSystemGpuRenderController {
	private _render_material: ShaderMaterial | undefined;
	protected _particles_group_objects: Object3D[] = [];
	private _shaders_by_name: Map<ShaderName, string> | undefined;
	private _texture_allocations_json: TextureAllocationsControllerData | undefined;

	constructor(private node: ParticlesSystemGpuSopNode) {}

	// _create_render_params() {
	// 	this.self.within_param_folder("setup", () => {
	// 		this.self.add_param(ParamType.OPERATOR_PATH, "material", "", {
	// 			node_selection: {
	// 				context: NodeContext.MAT
	// 			},
	// 			dependent_on_found_node: false
	// 		});
	// 	});
	// }
	set_shaders_by_name(shaders_by_name: Map<ShaderName, string>) {
		this._shaders_by_name = shaders_by_name;
		this.reset_render_material();
	}

	assign_render_material() {
		if (!this._render_material) {
			// throw 'cannot assign non existing material';
			return;
		}
		for (let object3d of this._particles_group_objects) {
			const object = object3d as Mesh;
			if (object.geometry) {
				object.material = this._render_material;
				CoreMaterial.apply_custom_materials(object, this._render_material as ShaderMaterialWithCustomMaterials);
				object.matrixAutoUpdate = false;
				object.updateMatrix();
			}
		}
		// if this material is recomputed on a frame after the frame_start
		// we need to:
		// - mark the material as needsUpdate (to ensure it gets recompiled by the renderer)
		// - update the uniforms (to ensure the material gets the right values, as the uniforms have been reset)
		this._render_material.needsUpdate = true;
		this.update_render_material_uniforms();
	}
	update_render_material_uniforms() {
		if (!this._render_material) {
			return;
		}
		// if (!this.self._gpu_compute) {
		// 	return;
		// }

		// for (let shader_name of Object.keys(this._shaders_by_name)) {
		this._shaders_by_name?.forEach((string, shader_name) => {
			const texture = this.node.gpu_controller.getCurrentRenderTarget(shader_name)?.texture;
			if (texture) {
				const uniform_name = `texture_${shader_name}`;
				if (this._render_material) {
					this._render_material.uniforms[uniform_name].value = texture;
					CoreMaterial.assign_custom_uniforms(this._render_material, uniform_name, texture);
				}
			}
		});
	}

	reset_render_material() {
		this._render_material = undefined;
		this._particles_group_objects = []; //this._particles_core_group.objects()
	}
	get initialized(): boolean {
		return this._render_material != null;
	}

	init_core_group(core_group: CoreGroup) {
		for (let child of core_group.objects()) {
			this._particles_group_objects.push(child);
		}
	}
	async init_render_material() {
		// if (this.self.compile_required()) {
		// 	return;
		// }
		if (this._render_material) {
			return;
		}

		// const uniforms_particles = {
		// 	"texture_position": { value: null },
		// 	// "debugX": { value: 0 },
		// 	// "textureVelocity": { value: null },
		// 	// "cameraConstant": { value: 1 }, //( camera ) },
		// 	// "density": { value: 1.0 }
		// };

		// ShaderMaterial
		const mat_node = this.node.p.material.found_node() as BaseBuilderMatNodeType; // TODO: typescript - ensure node selection is safe, as it would currently crash with a non builder mat selected
		if (mat_node) {
			const new_texture_allocations_json: TextureAllocationsControllerData = this.node.assembler_controller.assembler.texture_allocations_controller.to_json(
				this.node.scene
			);

			const globals_handler = new GlobalsTextureHandler(GlobalsTextureHandler.UV_VARYING);
			globals_handler.set_texture_allocations_controller(
				this.node.assembler_controller.assembler.texture_allocations_controller
			);
			mat_node.assembler_controller.set_assembler_globals_handler(globals_handler);
			if (
				!this._texture_allocations_json ||
				JSON.stringify(this._texture_allocations_json) != JSON.stringify(new_texture_allocations_json)
			) {
				// we need to set the node to dirty if a recompile is needed
				// otherwise it won't cook
				// but we also need to check if the texture_allocation has changed,
				// otherwise we'll have an infinite loop
				this._texture_allocations_json = lodash_cloneDeep(new_texture_allocations_json);
				mat_node.set_dirty();
			}
			// set compilation required in case the texture allocation has changed
			// but not needed as it is done by set_assembler_globals_handler
			//found_node.set_compilation_required() //_and_dirty()
			const container = await mat_node.request_container();
			this._render_material = container.material() as ShaderMaterial; //.clone()
			// this._render_material.needsUpdate = true
			// this.self._assembler.texture_allocations_controller().print()
			// throw "DEBUGGIN..."
		} else {
			this.node.states.error.set('render material not valid');
			// this._render_material = this._render_material || new ShaderMaterial( {
			// 	uniforms: {},
			// 	vertexShader: particleVertexShader,
			// 	fragmentShader: particleFragmentShader
			// } );
		}

		// add uniforms
		if (this._render_material) {
			const uniforms = this._render_material.uniforms;
			// for (let shader_name of Object.keys(this._shaders_by_name)) {
			this._shaders_by_name?.forEach((shader, shader_name) => {
				const uniform_name = `texture_${shader_name}`;
				const uniform_value = {value: null};
				uniforms[uniform_name] = uniform_value;
				if (this._render_material) {
					CoreMaterial.init_custom_material_uniforms(this._render_material, uniform_name, uniform_value);
				}
			});
		}

		// this._render_material.extensions.drawBuffers = true;
		this.assign_render_material();
	}
}
