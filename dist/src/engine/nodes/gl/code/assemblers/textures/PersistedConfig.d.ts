import { BasePersistedConfig } from '../../../../utils/PersistedConfig';
import { IUniform } from 'three/src/renderers/shaders/UniformsLib';
import { BuilderCopNode } from '../../../../cop/Builder';
declare type IUniforms = Dictionary<IUniform>;
export interface PersistedConfigBaseTextureData {
    fragment_shader: string;
    uniforms: IUniforms;
    param_uniform_pairs: [string, string][];
    uniforms_time_dependent?: boolean;
    uniforms_resolution_dependent?: boolean;
}
export declare class TexturePersistedConfig extends BasePersistedConfig {
    protected node: BuilderCopNode;
    constructor(node: BuilderCopNode);
    to_json(): PersistedConfigBaseTextureData | undefined;
    load(data: PersistedConfigBaseTextureData): void;
}
export {};
