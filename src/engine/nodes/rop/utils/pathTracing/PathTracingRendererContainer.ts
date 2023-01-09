import {WebGLCapabilities, WebGLMultipleRenderTargets, WebGLRenderer, WebGLRenderTarget} from 'three';
import {Scene, Camera, MeshBasicMaterial} from 'three';
import {FullScreenQuad} from 'three/examples/jsm/postprocessing/Pass';
import {AbstractRenderer} from '../../../../viewers/Common';
// @ts-ignore
import type {PathTracingRenderer} from 'three-gpu-pathtracer';
// @ts-ignore
import {PathTracingSceneWorker} from 'three-gpu-pathtracer/src/workers/PathTracingSceneWorker.js';

export class PathTracingRendererContainer implements AbstractRenderer {
	public samplesPerFrame = 1;
	public resolutionScale = 0.5;
	public domElement: HTMLCanvasElement;
	private _generated = false;
	private _generating = false;
	public readonly isPathTracingRendererContainer = true;
	constructor(
		public webGLRenderer: WebGLRenderer,
		public pathTracingRenderer: PathTracingRenderer,
		public blitQuad: FullScreenQuad,
		public blitQuadMat: MeshBasicMaterial
	) {
		this.domElement = this.webGLRenderer.domElement;
	}
	render(scene: Scene, camera: Camera) {
		if (this._generating) {
			this.webGLRenderer.render(scene, camera);
			return;
		}
		if (!this._generated) {
			this.generate(scene);
			this.webGLRenderer.render(scene, camera);
		}
		this.pathTracingRenderer.camera = camera;

		camera.updateMatrixWorld();
		// console.log(this.samplesPerFrame);
		for (let i = 0, l = this.samplesPerFrame; i < l; i++) {
			this.pathTracingRenderer.update();
		}

		if (this.pathTracingRenderer.samples < 1) {
			this.webGLRenderer.render(scene, camera);
		}

		this.webGLRenderer.autoClear = false;
		this.blitQuadMat = this.pathTracingRenderer.target.texture;
		this.blitQuad.render(this.webGLRenderer);
		this.webGLRenderer.autoClear = true;
		// console.log('samples:', Math.floor(this.pathTracingRenderer.samples));
	}
	getPixelRatio() {
		return this.webGLRenderer.getPixelRatio();
	}
	compile(scene: Scene, camera: Camera) {
		return this.webGLRenderer.compile(scene, camera);
	}
	dispose(): void {
		this.webGLRenderer.dispose();
		this.pathTracingRenderer.dispose();
		this.blitQuadMat.dispose();
	}
	setSize(w: number, h: number, setStyle: boolean) {
		this.webGLRenderer.setSize(w, h, setStyle);

		this.pathTracingRenderer.setSize(
			w * this.resolutionScale * window.devicePixelRatio,
			h * this.resolutionScale * window.devicePixelRatio
		);
		this.pathTracingRenderer.reset();
	}
	setRenderTarget(
		renderTarget: WebGLRenderTarget | WebGLMultipleRenderTargets | null,
		activeCubeFace?: number | undefined,
		activeMipmapLevel?: number | undefined
	) {
		this.webGLRenderer.setRenderTarget(renderTarget, activeCubeFace, activeMipmapLevel);
	}
	readRenderTargetPixels(
		renderTarget: WebGLRenderTarget | WebGLMultipleRenderTargets,
		x: number,
		y: number,
		width: number,
		height: number,
		buffer: Float32Array,
		activeCubeFaceIndex?: number | undefined
	) {
		return this.webGLRenderer.readRenderTargetPixels(
			renderTarget,
			x,
			y,
			width,
			height,
			buffer,
			activeCubeFaceIndex
		);
	}
	get capabilities(): WebGLCapabilities {
		return this.webGLRenderer.capabilities;
	}

	private _generator = new PathTracingSceneWorker();
	async generate(scene: Scene) {
		// if (this._generating) {
		// 	return;
		// }
		this._generated = false;
		this._generating = true;
		this.reset();

		const bgTexture = scene.environment;
		if (bgTexture) {
			this.pathTracingRenderer.material.envMapInfo.updateFrom(bgTexture);
		}

		try {
			// scene.traverse((object) => {
			// 	const nonMeshes: Object3D[] = [];
			// 	for (let child of object.children) {
			// 		if ((child as Light).isLight) {
			// 			nonMeshes.push(child);
			// 		}
			// 	}
			// 	for (let nonMesh of nonMeshes) {
			// 		object.remove(nonMesh);
			// 	}
			// });

			const result = await this._generator.generate(scene);
			console.log('result', result);
			const {bvh, textures, materials, lights} = result;
			const geometry = bvh.geometry;
			const material = this.pathTracingRenderer.material;

			material.bvh.updateFrom(bvh);
			material.attributesArray.updateFrom(
				geometry.attributes.normal,
				geometry.attributes.tangent,
				geometry.attributes.uv,
				geometry.attributes.color
			);
			material.materialIndexAttribute.updateFrom(geometry.attributes.materialIndex);
			material.textures.setTextures(this.webGLRenderer, 2048, 2048, textures);
			material.materials.updateFrom(materials, textures);
			// lights
			const iesTextures = lights.map((light: any) => light.iesTexture);
			console.log(lights, iesTextures);
			material.iesProfiles.updateFrom(this.webGLRenderer, iesTextures);
			material.lights.updateFrom(lights, iesTextures);

			// generator.dispose();
			console.log('updated');
			this._generated = true;
		} catch (err) {
			console.log(err);
		}
		this._generating = false;
	}
	reset() {
		this.pathTracingRenderer.reset();
	}
}
