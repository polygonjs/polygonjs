import lodash_cloneDeep from 'lodash/cloneDeep';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {Object3D} from 'three/src/core/Object3D';
import {BaseBuilderMatNodeType} from '../../../mat/_BaseBuilder';
import {ParticlesSystemGpuSopNode} from '../../ParticlesSystemGpu';
import {CoreMaterial, ShaderMaterialWithCustomMaterials} from '../../../../../core/geometry/Material';
import {CoreGroup} from '../../../../../core/geometry/Group';
import {Mesh} from 'three/src/objects/Mesh';
import {ShaderName} from '../../../utils/shaders/ShaderName';
import {TextureAllocationsControllerData} from '../../../gl/code/utils/TextureAllocationsController';
import {GlobalsTextureHandler} from '../../../gl/code/globals/Texture';

export class ParticlesSystemGpuRenderController {
	private _render_material: ShaderMaterial | undefined;
	protected _particles_group_objects: Object3D[] = [];
	private _shaders_by_name: Map<ShaderName, string> | undefined;
	private _all_shader_names: ShaderName[] = [];
	private _all_uniform_names: string[] = [];
	private _texture_allocations_json: TextureAllocationsControllerData | undefined;
	private globals_handler = new GlobalsTextureHandler(GlobalsTextureHandler.UV_VARYING);

	constructor(private node: ParticlesSystemGpuSopNode) {}

	set_shaders_by_name(shaders_by_name: Map<ShaderName, string>) {
		this._shaders_by_name = shaders_by_name;
		this._all_shader_names = [];
		this._all_uniform_names = [];
		this._shaders_by_name.forEach((shader, name) => {
			this._all_shader_names.push(name);
			this._all_uniform_names.push(`texture_${name}`);
		});

		this.reset_render_material();
	}

	assign_render_material() {
		if (!this._render_material) {
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

		let uniform_name: string;
		let shader_name: ShaderName;
		for (let i = 0; i < this._all_shader_names.length; i++) {
			shader_name = this._all_shader_names[i];
			uniform_name = this._all_uniform_names[i];
			const texture = this.node.gpu_controller.getCurrentRenderTarget(shader_name)?.texture;
			if (texture) {
				// Setting needsUpdate to true was an attempt at fixing the bug
				// where a particle system with no output on scene load
				// fails to render when adding outputs later.
				// At least until the scene is fully reloaded
				// texture.needsUpdate = true;
				this._render_material.uniforms[uniform_name].value = texture;
				CoreMaterial.assign_custom_uniforms(this._render_material, uniform_name, texture);
			}
		}
	}

	reset_render_material() {
		this._render_material = undefined;
		this._particles_group_objects = [];
	}
	render_material() {
		return this._render_material;
	}
	get initialized(): boolean {
		return this._render_material != null;
	}

	init_core_group(core_group: CoreGroup) {
		for (let child of core_group.objects_with_geo()) {
			this._particles_group_objects.push(child);
		}
	}
	async init_render_material() {
		const assembler = this.node.assembler_controller?.assembler;

		if (this._render_material) {
			return;
		}

		if (this.node.p.material.is_dirty) {
			await this.node.p.material.compute();
		}
		const mat_node = this.node.p.material.found_node() as BaseBuilderMatNodeType;

		if (mat_node) {
			if (assembler) {
				const new_texture_allocations_json: TextureAllocationsControllerData = assembler.texture_allocations_controller.to_json(
					this.node.scene
				);

				if (mat_node.assembler_controller) {
					this.globals_handler.set_texture_allocations_controller(assembler.texture_allocations_controller);
					mat_node.assembler_controller.set_assembler_globals_handler(this.globals_handler);
				}

				if (
					!this._texture_allocations_json ||
					JSON.stringify(this._texture_allocations_json) != JSON.stringify(new_texture_allocations_json)
				) {
					// we need to set the node to dirty if a recompile is needed
					// otherwise it won't cook
					// but we also need to check if the texture_allocation has changed,
					// otherwise we'll have an infinite loop
					this._texture_allocations_json = lodash_cloneDeep(new_texture_allocations_json);
					// setting the material to dirty is not enough. We need to make it clear a recompile is required.
					// This is necessary since if inputs of output or any export note are changed, the texture allocation will change. If the mat node was to not recompile, it would fetch attributes such as position from an incorrect or non existing texture.
					if (mat_node.assembler_controller) {
						mat_node.assembler_controller.set_compilation_required_and_dirty();
					}
				}
			}
			const container = await mat_node.request_container();
			this._render_material = container.material() as ShaderMaterial;
		} else {
			this.node.states.error.set('render material not valid');
		}

		// add uniforms
		if (this._render_material) {
			const uniforms = this._render_material.uniforms;
			for (let uniform_name of this._all_uniform_names) {
				const uniform_value = {value: null};
				uniforms[uniform_name] = uniform_value;
				if (this._render_material) {
					CoreMaterial.init_custom_material_uniforms(this._render_material, uniform_name, uniform_value);
				}
			}
		}

		this.assign_render_material();
	}
}
