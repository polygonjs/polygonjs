import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { ShaderAssemblerMesh } from './_BaseMesh';
export declare class ShaderAssemblerBasic extends ShaderAssemblerMesh {
    get _template_shader(): {
        vertexShader: string;
        fragmentShader: string;
        uniforms: {
            [uniform: string]: import("three").IUniform;
        };
    };
    create_material(): ShaderMaterial;
}
