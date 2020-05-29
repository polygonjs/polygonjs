import {PersistedConfig} from '../../../../utils/PersistedConfig';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';
import {BuilderCopNode} from '../../../../cop/Builder';

type IUniforms = Dictionary<IUniform>;

export interface PersistedConfigBaseParticlesData {
	fragment_shader: string;
	uniforms: IUniforms;
	param_uniform_pairs: [string, string][];
	uniforms_time_dependent?: boolean;
	uniforms_resolution_dependent?: boolean;
}

export class BaseParticlesPersistedConfig extends PersistedConfig {
	constructor(protected node: BuilderCopNode) {
		super(node);
	}
	to_json(): PersistedConfigBaseParticlesData | undefined {
		if (!this.node.assembler_controller) {
			return;
		}

		return;
	}
	load(data: PersistedConfigBaseParticlesData) {
		console.log('load', data);
	}
}
