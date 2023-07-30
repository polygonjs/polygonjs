import {Color, Scene, Camera} from 'three';
import {Pass} from 'postprocessing';

export class N8AOPostPass extends Pass {
	configuration: {
		aoSamples: number;
		aoRadius: number;
		distanceFalloff: number;
		intensity: number;
		color: Color;
		denoiseSamples: number;
		denoiseRadius: number;
		denoiseIterations: number;
		logarithmicDepthBuffer: boolean;
		screenSpaceRadius: boolean;
		halfRef: boolean;
		depthAwareUpsampling: boolean;
	};
	constructor(scene: Scene, camera: Camera);
	setDisplayMode: (mode: string) => void;
}
