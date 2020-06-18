import { TypedPostProcessNode, TypedPostNodeContext } from './_Base';
import { Pass } from '../../../../modules/three/examples/jsm/postprocessing/Pass';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { EffectComposer } from '../../../../modules/three/examples/jsm/postprocessing/EffectComposer';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { WebGLRenderTarget } from 'three/src/renderers/WebGLRenderTarget';
declare class LayerPass extends Pass {
    private _composer1;
    private _composer2;
    private material;
    private uniforms;
    private fsQuad;
    constructor(_composer1: EffectComposer, _composer2: EffectComposer);
    render(renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget): void;
}
declare class LayerPostParamsConfig extends NodeParamsConfig {
}
export declare class LayerPostNode extends TypedPostProcessNode<LayerPass, LayerPostParamsConfig> {
    params_config: LayerPostParamsConfig;
    static type(): string;
    initialize_node(): void;
    setup_composer(context: TypedPostNodeContext): void;
    update_pass(pass: LayerPass): void;
}
export {};
