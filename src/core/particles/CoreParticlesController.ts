import {Object3D} from 'three';
import {AbstractRenderer} from '../../engine/viewers/Common';
import {CoreParticlesAttribute} from './CoreParticlesAttribute';
import {CoreParticlesGpuComputeController} from './CoreParticlesGpuComputeController';
import {CoreParticlesRenderController} from './CoreParticlesRenderController';
import type {PolyScene} from '../../engine/scene/PolyScene';
import {ShaderName} from '../../engine/nodes/utils/shaders/ShaderName';
import {ParticlesSystemGpuSopNode} from '../../engine/nodes/sop/ParticlesSystemGpu';
import {TextureAllocationsController} from '../../engine/nodes/gl/code/utils/TextureAllocationsController';
import {GPUComputationConfigRef} from './gpuCompute/GPUComputationRenderer';
// import {CoreGroup} from '../geometry/Group';

export class CoreParticlesController {
	public readonly gpuController: CoreParticlesGpuComputeController;
	public readonly renderController: CoreParticlesRenderController;
	private _shadersByName: Map<ShaderName, string> = new Map();
	private _shaderNames: ShaderName[] = [];
	private _uniformNames: string[] = [];
	protected _object: Object3D | undefined;
	protected _renderer: AbstractRenderer | undefined;
	constructor(public readonly scene: PolyScene, private _node: ParticlesSystemGpuSopNode) {
		this.gpuController = new CoreParticlesGpuComputeController(this);
		this.renderController = new CoreParticlesRenderController(this);

		this._node.initCoreParticlesControllerFromPersistedConfig(this);
	}
	object() {
		return this._object;
	}
	renderer() {
		return this._renderer;
	}
	dispose() {
		this.gpuController.dispose();
		this.renderController.dispose();
	}
	async init(object: Object3D, renderer: AbstractRenderer) {
		this._object = object;
		this._renderer = renderer;
		this.setShadersByName(this._node.shadersByName());

		// const coreGroup = new CoreGroup();
		// coreGroup.setObjects([this.object]);

		// if (isOnStartFrame) {
		// this._coreGroupSet = false;
		this.gpuController.reset();
		// this.gpuController.resetParticleGroups();
		// }

		// if (!this.gpuController.initialized()) {
		// this.debugMessage('particles:this.gpuController.init(coreGroup) START');
		const configRef = this.gpuController.init();
		if (!configRef) {
			return;
		}
		// this.debugMessage('particles:this.gpuController.init(coreGroup) END');
		// }

		// if (!this.renderController.initialized()) {
		// this.renderController.init();
		// this.debugMessage('particles:this.renderController.initRenderMaterial() START');
		await this.renderController.init();
		// this.debugMessage('particles:this.renderController.initRenderMaterial() END');
		// }

		// this.gpuController.restartSimulationIfRequired();
		// this.gpuController.computeSimulationIfRequired(0);

		const preRollFramesCount = CoreParticlesAttribute.getPreRollFramesCount(this._object);

		for (let i = 0; i < preRollFramesCount; i++) {
			this.gpuController.computeSimulation(1 / 60, configRef);
		}
		return configRef;
	}
	stepSimulation(delta: number, configRef: GPUComputationConfigRef) {
		this.gpuController.computeSimulation(delta, configRef);
	}
	async reset() {
		this.gpuController.reset();
		this.renderController.reset();
		if (this._object && this._renderer) {
			return await this.init(this._object, this._renderer);
		}
	}
	setError(message: string) {
		this._node.states.error.set(message);
	}
	// assemblerController(){
	// 	return this._node.assemblerController()
	// }
	node() {
		return this._node;
	}

	setShadersByName(shadersByName: Map<ShaderName, string>) {
		this._shadersByName.clear();
		this._shaderNames.length = 0;
		this._uniformNames.length = 0;
		shadersByName.forEach((shader, shaderName) => {
			this._shadersByName.set(shaderName, shader);
			this._shaderNames.push(shaderName);
			this._uniformNames.push(`texture_${shaderName}`);
		});
	}
	shadersByName() {
		return this._shadersByName;
	}
	shaderNames() {
		return this._shaderNames;
	}
	uniformNames() {
		return this._uniformNames;
	}
	setPersistedTextureAllocationController(controller: TextureAllocationsController) {
		this.gpuController.setPersistedTextureAllocationController(controller);
	}
	private _debugCook = false;
	debugMessage(message: string) {
		if (!this._debugCook) {
			return;
		}
		console.log(message);
	}
}
