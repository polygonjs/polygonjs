import {BasePersistedConfig} from '../../../../utils/PersistedConfig';
import {ParticlesSystemGpuSopNode} from '../../../../sop/ParticlesSystemGpu';
import {TextureAllocationsController, TextureAllocationsControllerData} from '../../utils/TextureAllocationsController';
import {ShaderName} from '../../../../utils/shaders/ShaderName';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {Poly} from '../../../../../Poly';
import {PolyDictionary} from '../../../../../../types/GlobalTypes';

export interface PersistedConfigBaseParticlesData {
	shaders_by_name: PolyDictionary<string>;
	texture_allocations: TextureAllocationsControllerData;
	param_uniform_pairs: [string, string][];
	uniforms_owner: object;
}

export class ParticlesPersistedConfig extends BasePersistedConfig {
	private _loaded_data: PersistedConfigBaseParticlesData | undefined;

	constructor(protected node: ParticlesSystemGpuSopNode) {
		super(node);
	}
	toJSON(): PersistedConfigBaseParticlesData | undefined {
		if (!this.node.assembler_controller) {
			return;
		}
		const shaders_by_name: PolyDictionary<string> = {};
		const node_shaders_by_name = this.node.shaders_by_name();
		node_shaders_by_name.forEach((shader, shader_name) => {
			shaders_by_name[shader_name] = shader;
		});

		const texture_allocations_data = this.node.assembler_controller.assembler.texture_allocations_controller.toJSON(
			this.node.scene
		);

		// params updating uniforms
		const param_uniform_pairs: [string, string][] = [];
		const uniforms_owner = new ShaderMaterial();
		const param_configs = this.node.assembler_controller.assembler.param_configs();
		for (let param_config of param_configs) {
			param_uniform_pairs.push([param_config.name, param_config.uniform_name]);
			uniforms_owner.uniforms[param_config.uniform_name] = param_config.uniform;
		}

		return {
			shaders_by_name: shaders_by_name,
			texture_allocations: texture_allocations_data,
			param_uniform_pairs: param_uniform_pairs,
			uniforms_owner: this._material_to_json(uniforms_owner),
		};
	}
	load(data: PersistedConfigBaseParticlesData) {
		if (!Poly.instance().player_mode()) {
			return;
		}
		this._loaded_data = data;
		this.node.init_with_persisted_config();
	}
	loaded_data() {
		return this._loaded_data;
	}
	shaders_by_name() {
		if (this._loaded_data) {
			const shaders_by_name: Map<ShaderName, string> = new Map();
			const shader_names: ShaderName[] = Object.keys(this._loaded_data.shaders_by_name) as ShaderName[];
			for (let shader_name of shader_names) {
				shaders_by_name.set(shader_name, this._loaded_data.shaders_by_name[shader_name]);
			}
			return shaders_by_name;
		}
	}
	texture_allocations_controller() {
		if (this._loaded_data) {
			return TextureAllocationsController.from_json(this._loaded_data.texture_allocations);
		}
	}
	uniforms() {
		if (this._loaded_data) {
			const uniforms_owner = this._load_material(this._loaded_data.uniforms_owner);
			const uniforms = uniforms_owner?.uniforms || {};
			return uniforms;
		}
	}
}
