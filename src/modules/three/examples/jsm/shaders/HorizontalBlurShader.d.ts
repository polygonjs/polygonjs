import { Uniform } from 'three';

export const HorizontalBlurShader: {
    uniforms: {
        tDiffuse: Uniform;
        h: Uniform;
    };
    vertexShader: string;
    fragmentShader: string;
};
