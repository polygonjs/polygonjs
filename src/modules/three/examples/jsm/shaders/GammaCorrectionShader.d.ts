import { Uniform } from 'three';

export const GammaCorrectionShader: {
    uniforms: {
        tDiffuse: Uniform;
    };
    vertexShader: string;
    fragmentShader: string;
};
