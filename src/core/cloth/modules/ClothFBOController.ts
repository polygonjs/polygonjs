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
	FloatType,
	DataTexture,
	Vector3,
} from 'three';
import {ClothController} from '../ClothController';

interface TextureContainer {
	texture: DataTexture | null;
}

export class ClothFBOController {
	public readonly tSize = new Vector2();
	public readonly scene = new Scene();
	public readonly camera = new Camera();

	public RESOLUTION = -1;
	public originalRT: TextureContainer = {texture: null};
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
	public readonly mesh: Mesh;
	public renderer: WebGLRenderer | undefined;

	constructor(public readonly mainController: ClothController) {
		this.RESOLUTION = this.mainController.geometryInit.resolution;
		this.tSize.set(this.RESOLUTION, this.RESOLUTION);
		// geometry
		const geometry = new BufferGeometry();
		const positions = new Float32Array([-1.0, -1.0, 3.0, -1.0, -1.0, 3.0]);

		geometry.setAttribute('position', new BufferAttribute(positions, 2));
		// mesh
		// TODO: check what I should do in a larger scene here
		this.mesh = new Mesh(geometry, this.mainController.materials.copyShader);
		this.mesh.frustumCulled = false;
		this.scene.add(this.mesh);
		// TODO: can I still patch the scene, or should I have a sub scene?
		this.scene.updateMatrixWorld = function () {};

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

		// update once, to have the geometry properly display the normals
		this.update();
	}

	private copyTexture(input: TextureContainer, output: WebGLRenderTarget, order: boolean, renderer: WebGLRenderer) {
		const copyShader = this.mainController.materials.copyShader;
		this.mesh.material = copyShader;
		copyShader.uniforms.order.value = order ? 1 : -1;
		copyShader.uniforms.tSize.value = this.tSize;
		copyShader.uniforms.texture.value = input.texture;

		renderer.setRenderTarget(output);
		renderer.render(this.scene, this.camera);
	}
	private createPositionTexture() {
		const data = new Float32Array(this.RESOLUTION * this.RESOLUTION * 4);
		const geoVertices = this.mainController.geometryInit.vertices;
		const length = geoVertices.length;

		for (let i = 0; i < length; i++) {
			const i4 = i * 4;

			data[i4 + 0] = geoVertices[i].x;
			data[i4 + 1] = geoVertices[i].y;
			data[i4 + 2] = geoVertices[i].z;
		}

		const tmp: TextureContainer = {texture: null};
		tmp.texture = new DataTexture(data, this.RESOLUTION, this.RESOLUTION, RGBAFormat, FloatType);
		tmp.texture.needsUpdate = true;

		this.originalRT = tmp;
	}

	update() {
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
			this.solveConstraints(renderer);
		}

		this.computeVertexNormals(renderer);

		// restore renderer
		renderer.setRenderTarget(originalRenderTarget);
	}

	private createAdjacentsTexture(k: number) {
		const data = new Float32Array(this.RESOLUTION * this.RESOLUTION * 4);
		const geoVertices = this.mainController.geometryInit.vertices;
		const adjacency = this.mainController.geometryInit.adjacency;
		const length = geoVertices.length;

		for (let i = 0; i < length; i++) {
			const i4 = i * 4;
			const adj = adjacency[i];
			// const len = adj.length - 1;

			// for (let j = 0; j < 4; j++) data[i4 + j] = len < k * 4 + j ? -1 : adj[k * 4 + j];
			for (let j = 0; j < 4; j++) {
				const adjacentIndex = adj[k * 4 + j];
				if (adjacentIndex != null) {
					data[i4 + j] = adjacentIndex;
				} else {
					data[i4 + j] = -1;
				}
			}
		}

		// console.log('createAdjacentsTexture', k, data);
		const tmp: TextureContainer = {texture: null};
		tmp.texture = new DataTexture(data, this.RESOLUTION, this.RESOLUTION, RGBAFormat, FloatType);
		tmp.texture.needsUpdate = true;

		this.adjacentsRT[k] = tmp;
	}

	private createDistancesTexture(k: number) {
		const data = new Float32Array(this.RESOLUTION * this.RESOLUTION * 4).fill(-1);
		const geoVertices = this.mainController.geometryInit.vertices;
		const adjacency = this.mainController.geometryInit.adjacency;
		const length = geoVertices.length;

		for (let i = 0; i < length; i++) {
			const i4 = i * 4;
			const adj = adjacency[i];
			const len = adj.length - 1;

			const v = geoVertices[i];

			// for (let j = 0; j < 4; j++) data[i4 + j] = len < k * 4 + j ? -1 : v.distanceTo(geoVertices[adj[k * 4 + j]]);
			for (let j = 0; j < 4; j++) {
				if (len < k * 4 + j) {
					data[i4 + j] = -1;
				} else {
					const adjacentIndex = adj[k * 4 + j];
					if (adjacentIndex < 0) {
						data[i4 + j] = -1;
					} else {
						const neighbourPosition = geoVertices[adjacentIndex];
						const dist = v.distanceTo(neighbourPosition);
						data[i4 + j] = dist;
						if (dist < 0.0001) {
							console.log('bad dist');
						}
					}
				}
			}
		}

		const tmp: TextureContainer = {texture: null};
		tmp.texture = new DataTexture(data, this.RESOLUTION, this.RESOLUTION, RGBAFormat, FloatType);
		tmp.texture.needsUpdate = true;

		this.distancesRT[k] = tmp;
		analyzeData(`distance: ${k}:`, data);
		// console.log('data:', data);
	}

	private integrate(renderer: WebGLRenderer) {
		const integrateShader = this.mainController.materials.integrateShader;

		this.mesh.material = integrateShader;
		integrateShader.uniforms.tSize.value.copy(this.tSize);
		integrateShader.uniforms.tOriginal.value = this.originalRT.texture;
		integrateShader.uniforms.tPrevious0.value = this.previousRT[0].texture;
		integrateShader.uniforms.tPrevious1.value = this.previousRT[1].texture;
		integrateShader.uniforms.tPosition0.value = this.positionRT[0].texture;
		integrateShader.uniforms.tPosition1.value = this.positionRT[1].texture;

		// integer-part
		integrateShader.uniforms.order.value = 1;
		renderer.setRenderTarget(this.targetRT[0]);
		renderer.render(this.scene, this.camera);

		// fraction-part
		integrateShader.uniforms.order.value = -1;
		renderer.setRenderTarget(this.targetRT[1]);
		renderer.render(this.scene, this.camera);

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

	protected solveConstraints(renderer: WebGLRenderer) {
		const constraintsShader = this.mainController.materials.constraintsShader;
		this.mesh.material = constraintsShader;
		constraintsShader.uniforms.tSize.value.copy(this.tSize);
		constraintsShader.uniforms.tPosition0.value = this.positionRT[0].texture;
		constraintsShader.uniforms.tPosition1.value = this.positionRT[1].texture;
		constraintsShader.uniforms.tAdjacentsA.value = this.adjacentsRT[0].texture;
		constraintsShader.uniforms.tAdjacentsB.value = this.adjacentsRT[1].texture;
		constraintsShader.uniforms.tDistancesA.value = this.distancesRT[0].texture;
		constraintsShader.uniforms.tDistancesB.value = this.distancesRT[1].texture;

		// integer-part
		constraintsShader.uniforms.order.value = 1;
		renderer.setRenderTarget(this.targetRT[0]);
		renderer.render(this.scene, this.camera);

		// fraction-part
		constraintsShader.uniforms.order.value = -1;
		renderer.setRenderTarget(this.targetRT[1]);
		renderer.render(this.scene, this.camera);

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

		this.mesh.material = mouseShader;
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
		renderer.render(this.scene, this.camera);

		// fraction-part
		mouseShader.uniforms.order.value = -1;
		renderer.setRenderTarget(this.targetRT[1]);
		renderer.render(this.scene, this.camera);

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
		this.mesh.material = normalsShader;
		normalsShader.uniforms.tSize.value.copy(this.tSize);
		normalsShader.uniforms.tPosition0.value = this.positionRT[0].texture;
		normalsShader.uniforms.tPosition1.value = this.positionRT[1].texture;
		normalsShader.uniforms.tAdjacentsA.value = this.adjacentsRT[0].texture;
		normalsShader.uniforms.tAdjacentsB.value = this.adjacentsRT[1].texture;

		renderer.setRenderTarget(this.normalsRT);
		renderer.render(this.scene, this.camera);
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

function analyzeData(dataName: string, data: Float32Array) {
	let min = 10000;
	let max = -10000;
	let i = 0;
	const minThreshold = 2 * 0.0076568;
	const indicesWithZero = new Set<number>();
	const indicesBelowThreshold = new Set<number>();
	for (let elem of data) {
		if (elem < min && elem > -1) {
			min = elem;
		} else if (elem > max) {
			max = elem;
		}
		if (elem == 0) {
			indicesWithZero.add(i);
		}
		if (elem < minThreshold) {
			indicesBelowThreshold.add(i);
		}
		i++;
	}
	// console.log(dataName, {min, max, indicesWithZero, indicesBelowThreshold});
}
