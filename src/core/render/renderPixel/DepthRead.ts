import {
	WebGLRenderTarget,
	Camera,
	OrthographicCamera,
	PerspectiveCamera,
	Scene,
	ShaderMaterial,
	Texture,
	PlaneGeometry,
	Mesh,
} from 'three';
import VERTEX from './depthRead/DepthRead.vert.glsl';
import FRAGMENT from './depthRead/DepthRead.frag.glsl';

export interface DepthReadMaterial extends ShaderMaterial {
	unifoms: {
		cameraNear: {value: number};
		cameraFar: {value: number};
		tDiffuse: {value: Texture | null};
		tDepth: {value: Texture | null};
	};
}
export interface DepthSetup {
	scene: Scene;
	camera: OrthographicCamera;
	material: DepthReadMaterial;
}

export function setupDepthReadScene(): DepthSetup {
	// Setup post processing stage
	const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
	const material = new ShaderMaterial({
		vertexShader: VERTEX,
		fragmentShader: FRAGMENT,
		uniforms: {
			cameraNear: {value: camera.near},
			cameraFar: {value: camera.far},
			tDiffuse: {value: null},
			tDepth: {value: null},
		},
	}) as DepthReadMaterial;
	const postPlane = new PlaneGeometry(2, 2);
	const postQuad = new Mesh(postPlane, material);
	const scene = new Scene();
	scene.add(postQuad);

	return {scene, camera, material};
}
export function updateDepthSetup(setup: DepthSetup, camera: Camera, renderTarget: WebGLRenderTarget) {
	if ((camera as PerspectiveCamera).isPerspectiveCamera || (camera as OrthographicCamera).isOrthographicCamera) {
		setup.material.uniforms.cameraNear.value = (camera as PerspectiveCamera | OrthographicCamera).near;
		setup.material.uniforms.cameraFar.value = (camera as PerspectiveCamera | OrthographicCamera).far;
		setup.material.uniforms.tDiffuse.value = renderTarget.texture;
		setup.material.uniforms.tDepth.value = renderTarget.depthTexture;
	} else {
		console.warn('camera is not a PerspectiveCamera or OrthographicCamera');
	}
}
