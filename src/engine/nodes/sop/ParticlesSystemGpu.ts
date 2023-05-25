/**
 * Allows to create particle systems that will run on the GPU using gl nodes.
 *
 * @remarks
 * TBD
 *
 *
 */

// SPECS:
// - simulation shaders should update the particles at any frame, and resimulate accordingly when at later frames
// - render material should update at any frame, without having to resimulate
// - changing the input will recompute, when on first frame only (otherwise an animated geo could make it recompute all the time)
import {Object3D, MathUtils} from 'three';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {TypedSopNode} from './_Base';
import {GlobalsTextureHandler, GlobalsTextureHandlerPurpose} from '../gl/code/globals/Texture';

import {InputCloneMode} from '../../poly/InputCloneMode';
import {NodeContext} from '../../poly/NodeContext';
import {CoreGroup} from '../../../core/geometry/Group';
import {CoreParticlesAttribute} from '../../../core/particles/CoreParticlesAttribute';
import {
	createOrFindParticlesController,
	disposeParticlesFromNode,
	setParticleRenderer,
} from '../../../core/particles/CoreParticles';
import {CoreParticlesController} from '../../../core/particles/CoreParticlesController';
import {
	PARTICLE_DATA_TYPES,
	coreParticlesGpuComputeControllerPointsCount,
} from '../../../core/particles/CoreParticlesGpuComputeController';

import {GlNodeChildrenMap} from '../../poly/registers/nodes/Gl';
import {BaseGlNodeType} from '../gl/_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ShaderName} from '../utils/shaders/ShaderName';
import {GlNodeFinder} from '../gl/code/utils/NodeFinder';
import {AssemblerName} from '../../poly/registers/assemblers/_BaseRegister';
import {Poly} from '../../Poly';
import {ParticlesPersistedConfig} from '../gl/code/assemblers/particles/ParticlesPersistedConfig';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {GlAssemblerController} from '../gl/code/Controller';
import {ShaderAssemblerParticles} from '../gl/code/assemblers/particles/Particles';
import {isBooleanTrue} from '../../../core/Type';
class ParticlesSystemGpuSopParamsConfig extends NodeParamsConfig {
	/** @param auto sets the resolution of the textures used by the GPU shaders */
	autoTexturesSize = ParamConfig.BOOLEAN(1);
	/** @param max texture size. This is important to set a limit, as some systems may not handle large textures for particle sims */
	maxTexturesSize = ParamConfig.VECTOR2([1024, 1024], {visibleIf: {autoTexturesSize: 1}});
	/** @param sets the texture size manually */
	texturesSize = ParamConfig.VECTOR2([64, 64], {visibleIf: {autoTexturesSize: 0}});
	/** @param data type used by the solver */
	dataType = ParamConfig.INTEGER(0, {
		menu: {
			entries: PARTICLE_DATA_TYPES.map((value, index) => {
				return {value: index, name: value};
			}),
		},
	});
	/** @param number of frames to run before scene plays */
	preRollFramesCount = ParamConfig.INTEGER(0, {
		range: [0, 100],
		rangeLocked: [true, false],
	});

	/** @param material used to render the particles */
	material = ParamConfig.NODE_PATH('', {
		// separatorBefore: true,
		nodeSelection: {
			context: NodeContext.MAT,
		},
		dependentOnFoundNode: false,
		separatorAfter: true,
	});
}
const ParamsConfig = new ParticlesSystemGpuSopParamsConfig();
export class ParticlesSystemGpuSopNode extends TypedSopNode<ParticlesSystemGpuSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.PARTICLES_SYSTEM_GPU;
	}

	override dispose() {
		disposeParticlesFromNode(this);
		super.dispose();
	}

	assemblerController() {
		return this._assemblerController;
	}
	public override usedAssembler(): Readonly<AssemblerName.GL_PARTICLES> {
		return AssemblerName.GL_PARTICLES;
	}
	protected _assemblerController = this._createAssemblerController();
	private _createAssemblerController(): GlAssemblerController<ShaderAssemblerParticles> | undefined {
		return Poly.assemblersRegister.assembler(this, this.usedAssembler());
	}
	public override readonly persisted_config: ParticlesPersistedConfig = new ParticlesPersistedConfig(this);
	private _particlesGlobalsHandler = new GlobalsTextureHandler(
		GlobalsTextureHandler.PARTICLE_SIM_UV,
		GlobalsTextureHandlerPurpose.PARTICLES_SHADER
	);
	private _shadersByName: Map<ShaderName, string> = new Map();
	shadersByName() {
		return this._shadersByName;
	}

	static override require_webgl2() {
		return true;
	}

	static override displayedInputNames(): string[] {
		return ['points to emit particles from'];
	}

	protected override _childrenControllerContext = NodeContext.GL;
	override initializeNode() {
		this.io.inputs.setCount(1);
		// set to never at the moment
		// otherwise the input is cloned on every frame inside cook_main()
		this.io.inputs.initInputsClonedState(InputCloneMode.ALWAYS);
	}

	override createNode<S extends keyof GlNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): GlNodeChildrenMap[S];
	override createNode<K extends valueof<GlNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<GlNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BaseGlNodeType[];
	}
	override nodesByType<K extends keyof GlNodeChildrenMap>(type: K): GlNodeChildrenMap[K][] {
		return super.nodesByType(type) as GlNodeChildrenMap[K][];
	}
	override childrenAllowed() {
		if (this.assemblerController()) {
			return super.childrenAllowed();
		}
		return false;
	}
	override sceneReadonly() {
		return this.assemblerController() == null;
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		Poly.onObjectsAddedHooks.registerHook(this.type(), this.traverseObjectOnSopGroupAdd.bind(this));

		this.compileIfRequired();

		const coreGroup = inputCoreGroups[0];

		const objects = coreGroup.threejsObjects();
		const object = objects[0];

		// get texture size
		if (!isBooleanTrue(this.pv.autoTexturesSize)) {
			// const nearest_power_of_two = CoreMath.nearestPower2(Math.sqrt(pointsCount));
			// _usedTexturesSize.x = Math.min(nearest_power_of_two, this.pv.maxTexturesSize.x);
			// _usedTexturesSize.y = Math.min(nearest_power_of_two, this.pv.maxTexturesSize.y);
			// } else {
			if (!(MathUtils.isPowerOfTwo(this.pv.texturesSize.x) && MathUtils.isPowerOfTwo(this.pv.texturesSize.y))) {
				this.states.error.set('texture size must be a power of 2');
				return;
			}

			const pointsCount = coreParticlesGpuComputeControllerPointsCount(object);
			const maxParticlesCount = this.pv.texturesSize.x * this.pv.texturesSize.y;
			if (pointsCount > maxParticlesCount) {
				this.states.error.set(
					`max particles is set to (${this.pv.texturesSize.x}x${this.pv.texturesSize.y}=) ${maxParticlesCount}`
				);
				return;
			}
		}

		const existingActorIds = this.scene().actorsManager.objectActorNodeIds(object);
		if (existingActorIds == null || existingActorIds.length == 0) {
			this.states.error.set(`the input objects requires an actor node assigned to it`);
		}
		const renderer = await this.scene().renderersRegister.waitForRenderer();
		setParticleRenderer(this.graphNodeId(), renderer);
		CoreParticlesAttribute.setParticlesNodeId(object, this.graphNodeId());
		CoreParticlesAttribute.setDataType(object, this.pv.dataType);
		CoreParticlesAttribute.setAutoTextureSize(object, this.pv.autoTexturesSize);
		CoreParticlesAttribute.setMaxTextureSize(object, this.pv.maxTexturesSize);
		CoreParticlesAttribute.setTextureSize(object, this.pv.texturesSize);
		CoreParticlesAttribute.setPreRollFramesCount(object, this.pv.preRollFramesCount);

		const matNode = this.pv.material.nodeWithContext(NodeContext.MAT, this.states?.error);
		if (matNode) {
			const material = await matNode.material();
			// const baseBuilderMatNode = materialNode as BaseBuilderMatNodeType;
			// if (baseBuilderMatNode.assemblerController) {
			// 	baseBuilderMatNode.assemblerController()?.setAssemblerGlobalsHandler(this._globalsHandler);
			// }
			CoreParticlesAttribute.setMaterialNodeId(object, matNode.graphNodeId());

			if (!material) {
				this.states?.error.set(`material invalid. (error: '${matNode.states.error.message()}')`);
			}
		} else {
			this.states?.error.set(`no material node found`);
		}
		// if (node.p.material.isDirty()) {
		// 	this.mainController.debugMessage('renderController: this.node.p.material.compute() START');
		// 	await node.p.material.compute();
		// 	this.mainController.debugMessage('renderController: this.node.p.material.compute() END');
		// }
		// const matNode = node.pv.material.nodeWithContext(NodeContext.MAT, node.states.error) as BaseBuilderMatNodeType;
		this.setObject(object);

		// // const isOnStartFrame = this.isOnStartFrame();

		// // if (isOnStartFrame) {
		// this._coreGroupSet = false;
		// this.gpuController.resetParticleGroups();
		// // }

		// if (!this.gpuController.initialized()) {
		// 	this.debugMessage('particles:this.gpuController.init(coreGroup) START');
		// 	await this.gpuController.init(coreGroup);
		// 	this.debugMessage('particles:this.gpuController.init(coreGroup) END');
		// }

		// if (!this.renderController.initialized()) {
		// 	this.renderController.initCoreGroup(coreGroup);
		// 	this.debugMessage('particles:this.renderController.initRenderMaterial() START');
		// 	await this.renderController.initRenderMaterial();
		// 	this.debugMessage('particles:this.renderController.initRenderMaterial() END');
		// }

		// console.warn('cook');
		// this.gpuController.restartSimulationIfRequired();
		// // this.gpuController.computeSimulationIfRequired(0);
		// if (!this._coreGroupSet) {
		// 	this._coreGroupSet = true;
		// 	this.debugMessage('particles:setCoreGroup');
		// 	this.setCoreGroup(coreGroup);
		// } else {
		// 	this.cookController.endCook();
		// }
	}
	traverseObjectOnSopGroupAdd(object: Object3D) {
		const particlesNodeId = CoreParticlesAttribute.getParticlesNodeId(object);
		if (particlesNodeId == null) {
			return;
		}
		if (particlesNodeId != this.graphNodeId()) {
			return;
		}
		createOrFindParticlesController(object, this.scene());
	}

	compileIfRequired() {
		if (this.assemblerController()?.compileRequired()) {
			// this.debugMessage('particles:this.run_assembler() START');
			try {
				this.run_assembler();
			} catch (err) {
				const message = (err as any).message || 'failed to compile';
				this.states.error.set(message);
			}
			// this.debugMessage('particles:this.run_assembler() END');
		}
	}
	run_assembler() {
		const assemblerController = this.assemblerController();
		if (!assemblerController) {
			return;
		}
		const export_nodes = this._findExportNodes();
		if (export_nodes.length > 0) {
			const root_nodes = export_nodes;
			assemblerController.setAssemblerGlobalsHandler(this._particlesGlobalsHandler);
			assemblerController.assembler.set_root_nodes(root_nodes);

			assemblerController.assembler.compile();
			assemblerController.post_compile();
		}

		const shadersByName = assemblerController.assembler.shaders_by_name();
		this._setShaderNames(shadersByName);
	}

	private _setShaderNames(shadersByName: Map<ShaderName, string>) {
		this._shadersByName = shadersByName;

		// this.gpuController.setShadersByName(this._shaders_by_name);
		// this.renderController.setShadersByName(this._shaders_by_name);

		// this.gpuController.resetGpuCompute();
		// this.gpuController.resetParticleGroups();
	}

	init_with_persisted_config() {
		const shaders_by_name = this.persisted_config.shaders_by_name();
		const texture_allocations_controller = this.persisted_config.texture_allocations_controller();
		if (shaders_by_name && texture_allocations_controller) {
			this._setShaderNames(shaders_by_name);
			// this.gpuController.setPersistedTextureAllocationController(texture_allocations_controller);
		}
	}
	initCoreParticlesControllerFromPersistedConfig(coreParticlesController: CoreParticlesController) {
		const shaders_by_name = this.persisted_config.shaders_by_name();
		const texture_allocations_controller = this.persisted_config.texture_allocations_controller();
		if (shaders_by_name && texture_allocations_controller) {
			// this._setShaderNames(shaders_by_name);
			coreParticlesController.setPersistedTextureAllocationController(texture_allocations_controller);
		}
	}

	private _findExportNodes() {
		const nodes: BaseGlNodeType[] = GlNodeFinder.findAttributeExportNodes(this);
		const output_nodes = GlNodeFinder.findOutputNodes(this);
		if (output_nodes.length == 0) {
			this.states.error.set('one output node is required');
		}
		if (output_nodes.length > 1) {
			this.states.error.set('only one output node is allowed');
			return [];
		}
		const output_node = output_nodes[0];
		if (output_node) {
			nodes.push(output_node);
		}
		return nodes;
	}

	// private _findActorNode() {
	// 	// if (isBooleanTrue(this.pv.useThisNode)) {
	// 	// 	return this;
	// 	// } else {
	// 	return this.pv.actor.node() as ActorBuilderNode | undefined;
	// 	// }
	// }
}
