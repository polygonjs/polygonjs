import {
	Vector2,
	Camera,
	Scene,
	WebGLRenderer,
	BufferGeometry,
	BufferAttribute,
	Mesh,
	WebGLRenderTarget,
	ClampToEdgeWrapping,
	NearestFilter,
	RGBAFormat,
	HalfFloatType,
	DataTexture,
	Vector3,
	Texture,
	Material,
} from 'three';
import {ClothController} from '../ClothController';
import {Ref} from '@vue/reactivity';
import {
	adjacencyTexture,
	distancesTexture,
	positionTexture,
	viscositySpringTexture,
	createTexturesFromAllocation,
} from './ClothAttributeToTexture';

export interface ClothMaterialUniformConfigRef {
	tSize: Ref<Vector2>;
	tPosition0: Ref<Texture>;
	tPosition1: Ref<Texture>;
	tNormal: Ref<Texture>;
	//
	tOriginalRT: Ref<Texture>;
	tViscositySpringT: Ref<Texture>;
	tPreviousRT0: Ref<Texture>;
	tPreviousRT1: Ref<Texture>;
	tTargetRT0: Ref<Texture>;
	tTargetRT1: Ref<Texture>;
	tNormalsRT: Ref<Texture>;
	tPositionRT0: Ref<Texture>;
	tPositionRT1: Ref<Texture>;
	tAdjacentsRT0: Ref<Texture>;
	tAdjacentsRT1: Ref<Texture>;
	tDistanceRT0: Ref<Texture>;
	tDistanceRT1: Ref<Texture>;
	//
	integrationMat: Ref<Material>;
}
export type ClothMaterialUniformConfigRefString = Record<keyof ClothMaterialUniformConfigRef, string>;
export function clothMaterialCopyConfigRef(
	src: ClothMaterialUniformConfigRef,
	target: ClothMaterialUniformConfigRef
): void {
	target.tSize.value.copy(src.tSize.value);
}
export interface ClothMaterialUniformConfig {
	tSize: Vector2;
	tPosition0: Texture;
	tPosition1: Texture;
	tNormal: Texture;
}
export interface ClothMaterialUniformNameConfig {
	tSize: string;
	tPosition0: string;
	tPosition1: string;
	tNormal: string;
}

interface TextureContainer {
	texture: DataTexture | null;
}
function textureContainerToRef(src: TextureContainer, ref: Ref<Texture>) {
	if (src.texture) {
		ref.value = src.texture;
	}
}

export class ClothFBOController {
	public readonly tSize = new Vector2();
	public readonly fboScene = new Scene();
	public readonly fboCamera = new Camera();
	public readonly fboMesh: Mesh;

	public RESOLUTION = -1;
	public originalRT: TextureContainer = {texture: null};
	public viscositySpringT: TextureContainer = {texture: null};
	public readonly previousRT: [WebGLRenderTarget, WebGLRenderTarget] = new Array(2) as [
		WebGLRenderTarget,
		WebGLRenderTarget
	];
	public readonly targetRT: [WebGLRenderTarget, WebGLRenderTarget] = new Array(2) as [
		WebGLRenderTarget,
		WebGLRenderTarget
	];
	public normalsRT: WebGLRenderTarget;
	public readonly positionRT: [WebGLRenderTarget, WebGLRenderTarget] = new Array(2) as [
		WebGLRenderTarget,
		WebGLRenderTarget
	];
	public readonly adjacentsRT: [TextureContainer, TextureContainer] = new Array(2) as [
		TextureContainer,
		TextureContainer
	];
	public readonly distancesRT: [TextureContainer, TextureContainer] = new Array(2) as [
		TextureContainer,
		TextureContainer
	];

	public renderer: WebGLRenderer | undefined;

	constructor(public readonly mainController: ClothController) {
		this.RESOLUTION = this.mainController.geometryInit.resolution;
		this.tSize.set(this.RESOLUTION, this.RESOLUTION);
		// geometry
		const geometry = new BufferGeometry();
		const positions = new Float32Array([-1.0, -1.0, 3.0, -1.0, -1.0, 3.0]);

		geometry.setAttribute('position', new BufferAttribute(positions, 2));
		// mesh
		this.fboMesh = new Mesh(geometry, this.mainController.materials.copyShader);
		this.fboMesh.frustumCulled = false;
		this.fboScene.add(this.fboMesh);
		this.fboScene.updateMatrixWorld = function () {};

		this.normalsRT = createRenderTarget(this.RESOLUTION);
	}
	private _initialized: boolean = false;
	init(renderer: WebGLRenderer) {
		if (this._initialized) {
			return;
		}
		this._initialized = true;
		this.renderer = renderer;
		// save renderer state
		const originalRenderTarget = renderer.getRenderTarget();
		// prepare
		this.createPositionTexture();
		this.createViscositySpringTexture();
		this.createTexturesFromAllocation();

		// setup relaxed vertices conditions
		for (let i = 0; i < 2; i++) {
			this.createAdjacentsTexture(i);
			this.createDistancesTexture(i);

			this.positionRT[i] = createRenderTarget(this.RESOLUTION);
			this.previousRT[i] = createRenderTarget(this.RESOLUTION);
			this.targetRT[i] = createRenderTarget(this.RESOLUTION);

			this.copyTexture(this.originalRT, this.positionRT[i], !i, renderer);
			this.copyTexture(this.originalRT, this.previousRT[i], !i, renderer);
		}

		// restore renderer
		renderer.setRenderTarget(originalRenderTarget);

		// update once, to have the geometry properly display the normals.
		// UPDATE: this doesn't work anymore since the material first needs to be rendered and compiled.
		// this.update(1 / 60);
	}

	private copyTexture(input: TextureContainer, output: WebGLRenderTarget, order: boolean, renderer: WebGLRenderer) {
		const copyShader = this.mainController.materials.copyShader;
		this.fboMesh.material = copyShader;
		copyShader.uniforms.order.value = order ? 1 : -1;
		copyShader.uniforms.tSize.value = this.tSize;
		copyShader.uniforms.texture.value = input.texture;

		renderer.setRenderTarget(output);
		renderer.render(this.fboScene, this.fboCamera);
	}

	//
	//
	// create textures
	//
	//
	private createPositionTexture() {
		this.originalRT = {
			texture: positionTexture(
				this.mainController.geometryInit.geometry,
				this.mainController.geometryInit.vertices,
				this.RESOLUTION
			),
		};
	}
	private createViscositySpringTexture() {
		this.viscositySpringT = {
			texture: viscositySpringTexture(this.mainController.geometryInit.geometry, this.RESOLUTION),
		};
	}
	private createTexturesFromAllocation() {
		const allocation = this.mainController.textureAllocationsController();
		if (!allocation) {
			return;
		}
		const textures = createTexturesFromAllocation(
			this.mainController.geometryInit.geometry,
			this.RESOLUTION,
			allocation
		);
		this.mainController.assignReadonlyTextures(this.mainController.materials.integrateShader, textures);
	}
	private createAdjacentsTexture(k: number) {
		this.adjacentsRT[k] = {
			texture: adjacencyTexture(
				this.mainController.geometryInit.geometry,
				this.RESOLUTION,
				this.mainController.geometryInit.adjacency,
				k
			),
		};
	}
	private createDistancesTexture(k: number) {
		this.distancesRT[k] = {
			texture: distancesTexture(
				this.mainController.geometryInit.geometry,
				this.mainController.geometryInit.vertices,
				this.RESOLUTION,
				this.mainController.geometryInit.adjacency,
				k
			),
		};
	}

	//
	//
	// update
	//
	//
	update(config?: ClothMaterialUniformConfigRef) {
		const renderer = this.renderer;
		if (!(renderer && this._initialized)) {
			return;
		}
		// save renderer state
		const originalRenderTarget = renderer.getRenderTarget();

		// start update
		this.integrate(renderer);

		// const mouseUpdating = this.mainController.inputs.updating(camera);
		const selectedVertexIndex = this.mainController.selectedVertexIndex();

		const steps = this.mainController.stepsCount;
		for (let i = 0; i < steps; i++) {
			if (selectedVertexIndex >= 0 && i < steps - 5) {
				this.mouseOffset(renderer);
			}
			this.solveConstraints(renderer, i == steps - 1 ? 1 : 0);
		}

		this.computeVertexNormals(renderer);

		// restore renderer
		renderer.setRenderTarget(originalRenderTarget);

		if (config) {
			this._updateTextureRefs(config);
		}
	}
	private _updateTextureRefs(config: ClothMaterialUniformConfigRef) {
		config.tSize.value = this.mainController.fbo.tSize;
		config.tPosition0.value = this.positionRT[0].texture;
		config.tPosition1.value = this.positionRT[1].texture;
		config.tNormal.value = this.normalsRT.texture;
		//
		textureContainerToRef(this.originalRT, config.tOriginalRT);
		textureContainerToRef(this.viscositySpringT, config.tViscositySpringT);

		config.tPreviousRT0.value = this.previousRT[0].texture;
		config.tPreviousRT1.value = this.previousRT[1].texture;
		config.tTargetRT0.value = this.targetRT[0].texture;
		config.tTargetRT1.value = this.targetRT[1].texture;

		config.tNormalsRT.value = this.normalsRT.texture;

		config.tPositionRT0.value = this.positionRT[0].texture;
		config.tPositionRT1.value = this.positionRT[1].texture;

		textureContainerToRef(this.adjacentsRT[0], config.tAdjacentsRT0);
		textureContainerToRef(this.adjacentsRT[1], config.tAdjacentsRT1);
		textureContainerToRef(this.distancesRT[0], config.tDistanceRT0);
		textureContainerToRef(this.distancesRT[1], config.tDistanceRT1);

		config.integrationMat.value = this.mainController.materials.integrateShader;
	}

	private integrate(renderer: WebGLRenderer) {
		const integrateShader = this.mainController.materials.integrateShader;

		this.fboMesh.material = integrateShader;
		// integrateShader.uniforms.timeDelta.value = delta;
		integrateShader.uniforms.viscosity.value = this.mainController.viscosity;
		integrateShader.uniforms.spring.value = this.mainController.spring;
		integrateShader.uniforms.tSize.value.copy(this.tSize);
		integrateShader.uniforms.tOriginal.value = this.originalRT.texture;
		integrateShader.uniforms.tPrevious0.value = this.previousRT[0].texture;
		integrateShader.uniforms.tPrevious1.value = this.previousRT[1].texture;
		integrateShader.uniforms.tPosition0.value = this.positionRT[0].texture;
		integrateShader.uniforms.tPosition1.value = this.positionRT[1].texture;
		integrateShader.uniforms.tViscositySpring.value = this.viscositySpringT.texture;

		// integer-part
		integrateShader.uniforms.order.value = 1;
		renderer.setRenderTarget(this.targetRT[0]);
		renderer.render(this.fboScene, this.fboCamera);

		// fraction-part
		integrateShader.uniforms.order.value = -1;
		renderer.setRenderTarget(this.targetRT[1]);
		renderer.render(this.fboScene, this.fboCamera);

		// swap framebuffers
		let tmp = this.previousRT[0];
		this.previousRT[0] = this.positionRT[0];
		this.positionRT[0] = this.targetRT[0];
		this.targetRT[0] = tmp;

		tmp = this.previousRT[1];
		this.previousRT[1] = this.positionRT[1];
		this.positionRT[1] = this.targetRT[1];
		this.targetRT[1] = tmp;
	}

	protected solveConstraints(renderer: WebGLRenderer, secondaryMotionMult: number) {
		const constraintsShader = this.mainController.materials.constraintsShader;
		this.fboMesh.material = constraintsShader;
		constraintsShader.uniforms.selectedVertexInfluence.value = this.mainController.selectedVertexInfluence;
		constraintsShader.uniforms.tSize.value.copy(this.tSize);
		constraintsShader.uniforms.tPosition0.value = this.positionRT[0].texture;
		constraintsShader.uniforms.tPosition1.value = this.positionRT[1].texture;
		constraintsShader.uniforms.tAdjacentsA.value = this.adjacentsRT[0].texture;
		constraintsShader.uniforms.tAdjacentsB.value = this.adjacentsRT[1].texture;
		constraintsShader.uniforms.tDistancesA.value = this.distancesRT[0].texture;
		constraintsShader.uniforms.tDistancesB.value = this.distancesRT[1].texture;
		constraintsShader.uniforms.secondaryMotionMult.value = secondaryMotionMult;

		// integer-part
		constraintsShader.uniforms.order.value = 1;
		renderer.setRenderTarget(this.targetRT[0]);
		renderer.render(this.fboScene, this.fboCamera);

		// fraction-part
		constraintsShader.uniforms.order.value = -1;
		renderer.setRenderTarget(this.targetRT[1]);
		renderer.render(this.fboScene, this.fboCamera);

		// swap framebuffers
		let tmp = this.positionRT[0];
		this.positionRT[0] = this.targetRT[0];
		this.targetRT[0] = tmp;

		tmp = this.positionRT[1];
		this.positionRT[1] = this.targetRT[1];
		this.targetRT[1] = tmp;
	}

	private _coordinate = new Vector3();
	// private _coordinates = [this._coordinate];
	protected mouseOffset(renderer: WebGLRenderer) {
		const mouseShader = this.mainController.materials.mouseShader;
		// const inputs = this.mainController.inputs;

		this.mainController.selectedVertexPosition(this._coordinate);

		this.fboMesh.material = mouseShader;
		mouseShader.uniforms.tSize.value.copy(this.tSize);
		mouseShader.uniforms.vertex.value = this.mainController.selectedVertexIndex(); //inputs.vertices;
		this.mainController.selectedVertexPosition(mouseShader.uniforms.coordinates.value);
		// .copythis._coordinate]; //inputs.coordinates;
		mouseShader.uniforms.tOriginal.value = this.originalRT.texture;
		mouseShader.uniforms.tPosition0.value = this.positionRT[0].texture;
		mouseShader.uniforms.tPosition1.value = this.positionRT[1].texture;

		// integer-part
		mouseShader.uniforms.order.value = 1;
		renderer.setRenderTarget(this.targetRT[0]);
		renderer.render(this.fboScene, this.fboCamera);

		// fraction-part
		mouseShader.uniforms.order.value = -1;
		renderer.setRenderTarget(this.targetRT[1]);
		renderer.render(this.fboScene, this.fboCamera);

		// swap framebuffers
		let tmp = this.positionRT[0];
		this.positionRT[0] = this.targetRT[0];
		this.targetRT[0] = tmp;

		tmp = this.positionRT[1];
		this.positionRT[1] = this.targetRT[1];
		this.targetRT[1] = tmp;
	}

	protected computeVertexNormals(renderer: WebGLRenderer) {
		const normalsShader = this.mainController.materials.normalsShader;
		this.fboMesh.material = normalsShader;
		normalsShader.uniforms.tSize.value.copy(this.tSize);
		normalsShader.uniforms.tPosition0.value = this.positionRT[0].texture;
		normalsShader.uniforms.tPosition1.value = this.positionRT[1].texture;
		normalsShader.uniforms.tAdjacentsA.value = this.adjacentsRT[0].texture;
		normalsShader.uniforms.tAdjacentsB.value = this.adjacentsRT[1].texture;

		renderer.setRenderTarget(this.normalsRT);
		renderer.render(this.fboScene, this.fboCamera);
	}
}

function createRenderTarget(resolution: number) {
	return new WebGLRenderTarget(resolution, resolution, {
		wrapS: ClampToEdgeWrapping,
		wrapT: ClampToEdgeWrapping,
		minFilter: NearestFilter,
		magFilter: NearestFilter,
		format: RGBAFormat,
		type: HalfFloatType,
		// depthTest: false,
		// depthWrite: false,
		depthBuffer: false,
		stencilBuffer: false,
	});
}

// function analyzeData(dataName: string, data: Float32Array) {
// 	let min = 10000;
// 	let max = -10000;
// 	let i = 0;
// 	const minThreshold = 2 * 0.0076568;
// 	const indicesWithZero = new Set<number>();
// 	const indicesBelowThreshold = new Set<number>();
// 	for (let elem of data) {
// 		if (elem < min && elem > -1) {
// 			min = elem;
// 		} else if (elem > max) {
// 			max = elem;
// 		}
// 		if (elem == 0) {
// 			indicesWithZero.add(i);
// 		}
// 		if (elem < minThreshold) {
// 			indicesBelowThreshold.add(i);
// 		}
// 		i++;
// 	}
// 	// console.log(dataName, {min, max, indicesWithZero, indicesBelowThreshold});
// }
