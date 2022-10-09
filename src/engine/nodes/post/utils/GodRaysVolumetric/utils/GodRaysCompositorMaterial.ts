import {Vector2, ShaderMaterial} from 'three';
import {Resizable} from 'postprocessing';

import GodraysCompositorShader from '../gl/compositor.frag.glsl';
import GodraysCompositorVertexShader from '../gl/compositor.vert.glsl';

export interface GodraysCompositorMaterialProps {
	godrays: THREE.Texture;
	edgeStrength: number;
	edgeRadius: number;
	color: THREE.Color;
	camera: THREE.PerspectiveCamera;
}

export class GodraysCompositorMaterial extends ShaderMaterial implements Resizable {
	constructor({godrays, edgeStrength, edgeRadius, color, camera}: GodraysCompositorMaterialProps) {
		const uniforms = {
			godrays: {value: godrays},
			sceneDiffuse: {value: null},
			sceneDepth: {value: null},
			edgeStrength: {value: edgeStrength},
			edgeRadius: {value: edgeRadius},
			near: {value: 0.1},
			far: {value: 1000.0},
			color: {value: color},
			resolution: {value: new Vector2(1, 1)},
		};

		super({
			name: 'GodraysCompositorMaterial',
			uniforms,
			depthWrite: false,
			depthTest: false,
			fragmentShader: GodraysCompositorShader,
			vertexShader: GodraysCompositorVertexShader,
		});

		this.updateUniforms(edgeStrength, edgeRadius, color, camera.near, camera.far);
	}

	public updateUniforms(
		edgeStrength: number,
		edgeRadius: number,
		color: THREE.Color,
		near: number,
		far: number
	): void {
		this.uniforms.edgeStrength.value = edgeStrength;
		this.uniforms.edgeRadius.value = edgeRadius;
		this.uniforms.color.value = color;
		this.uniforms.near.value = near;
		this.uniforms.far.value = far;
	}

	setSize(width: number, height: number): void {
		this.uniforms.resolution.value.set(width, height);
	}
}
