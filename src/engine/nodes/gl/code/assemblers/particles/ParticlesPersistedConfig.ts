import {BasePersistedConfig} from '../../../../utils/BasePersistedConfig';
import {ParticlesSystemGpuSopNode} from '../../../../sop/ParticlesSystemGpu';
import {TextureAllocationsController, TextureAllocationsControllerData} from '../../utils/TextureAllocationsController';
import {ShaderName} from '../../../../utils/shaders/ShaderName';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {PolyDictionary} from '../../../../../../types/GlobalTypes';

export interface PersistedConfigBaseParticlesData {
	shaders_by_name: PolyDictionary<string>;
	texture_allocations: TextureAllocationsControllerData;
	param_uniform_pairs: [string, string][];
	uniforms_owner: object;
}

export class ParticlesPersistedConfig extends BasePersistedConfig {
	private _loaded_data: PersistedConfigBaseParticlesData | undefined;

	constructor(protected override node: ParticlesSystemGpuSopNode) {
		super(node);
	}
	override toJSON(): PersistedConfigBaseParticlesData | undefined {
		const assemblerController = this.node.assemblerController();
		if (!assemblerController) {
			return;
		}
		const shaders_by_name: PolyDictionary<string> = {};
		const node_shaders_by_name = this.node.shaders_by_name();
		node_shaders_by_name.forEach((shader, shader_name) => {
			shaders_by_name[shader_name] = shader;
		});

		const texture_allocations_data = assemblerController.assembler
			.textureAllocationsController()
			.toJSON(this.node.scene());

		// params updating uniforms
		const param_uniform_pairs: [string, string][] = [];
		const uniforms_owner = new ShaderMaterial();
		const param_configs = assemblerController.assembler.param_configs();
		for (let param_config of param_configs) {
			param_uniform_pairs.push([param_config.name(), param_config.uniformName()]);
			uniforms_owner.uniforms[param_config.uniformName()] = param_config.uniform();
		}

		const material_data = this._materialToJson(uniforms_owner, {
			node: this.node,
			suffix: 'main',
		});
		const data = {
			shaders_by_name: shaders_by_name,
			texture_allocations: texture_allocations_data,
			param_uniform_pairs: param_uniform_pairs,
			uniforms_owner: material_data || {},
		};

		return data;
	}
	override load(data: PersistedConfigBaseParticlesData) {
		const assemblerController = this.node.assemblerController();
		if (assemblerController) {
			return;
		}
		this._loaded_data = data;
		//
		// for now, unlike the texture and material persistedconfigs,
		// the callbacks are created in the GPUController
		//
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
			return TextureAllocationsController.fromJSON(this._loaded_data.texture_allocations);
		}
	}
	uniforms() {
		if (this._loaded_data) {
			const uniforms_owner = this._loadMaterial(this._loaded_data.uniforms_owner);
			const uniforms = uniforms_owner?.uniforms || {};
			return uniforms;
		}
	}
}
