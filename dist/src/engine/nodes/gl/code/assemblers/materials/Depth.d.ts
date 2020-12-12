import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { ShaderAssemblerMaterial } from './_BaseMaterial';
import { ShaderName } from '../../../../utils/shaders/ShaderName';
export declare class ShaderAssemblerDepth extends ShaderAssemblerMaterial {
    get _template_shader(): {
        vertexShader: string;
        fragmentShader: string;
        uniforms: {
            [uniform: string]: import("three").IUniform;
        };
    };
    protected insert_body_after(shader_name: ShaderName): string | undefined;
    create_material(): ShaderMaterial;
}
