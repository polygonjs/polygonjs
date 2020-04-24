import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { ShaderAssemblerMaterial } from './_BaseMaterial';
import { ShaderName } from '../../../../utils/shaders/ShaderName';
export declare class ShaderAssemblerCustomMeshDepthDOF extends ShaderAssemblerMaterial {
    get _template_shader(): {
        vertexShader: string;
        fragmentShader: string;
        uniforms: {
            mNear: {
                value: number;
            };
            mFar: {
                value: number;
            };
        };
    };
    protected insert_define_after(shader_name: ShaderName): string | undefined;
    protected insert_body_after(shader_name: ShaderName): string | undefined;
    create_material(): ShaderMaterial;
}
