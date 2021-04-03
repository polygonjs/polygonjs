import { Uniform } from 'three';

export const AfterimageShader: {
    uniforms: {
        damp: Uniform;
        tOld: Uniform;
        tNew: Uniform;
    };
    vertexShader: string;
    fragmentShader: string;
};
