import {
	Uniform
} from 'three';

export const VerticalBlurShader: {
	uniforms: {
		tDiffuse: Uniform;
		v: Uniform;
	};
	vertexShader: string;
	fragmentShader: string;
};
