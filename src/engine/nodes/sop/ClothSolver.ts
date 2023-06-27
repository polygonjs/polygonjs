/**
 * Create a cloth solver
 *
 *
 */
import {Object3D, WebGLRenderer} from 'three';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {NodeContext} from '../../poly/NodeContext';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {PolyScene} from '../../scene/PolyScene';
import {CoreType} from '../../../core/Type';
import {BaseNodeType} from '../_Base';
import {Poly} from '../../Poly';
import {CoreObject} from '../../../core/geometry/Object';
import {ClothIdAttribute} from '../../../core/cloth/ClothAttribute';
import {
	createOrFindClothController,
	clothControllerNodeIdFromObject,
} from '../../../core/cloth/ClothControllerRegister';
import {TypedSopNode} from './_Base';
import {AssemblerName} from '../../poly/registers/assemblers/_BaseRegister';
import {GlAssemblerController} from '../gl/code/Controller';
import {ShaderAssemblerCloth} from '../gl/code/assemblers/cloth/ClothAssembler';
import {ClothPersistedConfig} from '../gl/code/assemblers/cloth/ClothPersistedConfig';
import {GlNodeChildrenMap} from '../../poly/registers/nodes/Gl';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {BaseGlNodeType} from '../gl/_Base';
import {ShaderName} from '../utils/shaders/ShaderName';
import {GlobalsTextureHandler, GlobalsTextureHandlerPurpose} from '../gl/code/globals/Texture';
import {GlNodeFinder} from '../gl/code/utils/NodeFinder';
import {ClothController} from '../../../core/cloth/ClothController';
class ClothSolverSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new ClothSolverSopParamsConfig();

export class ClothSolverSopNode extends TypedSopNode<ClothSolverSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type(): SopType.CLOTH_SOLVER {
		return SopType.CLOTH_SOLVER;
	}

	assemblerController() {
		return this._assemblerController;
	}
	public override usedAssembler(): Readonly<AssemblerName.GL_CLOTH> {
		return AssemblerName.GL_CLOTH;
	}
	protected _assemblerController = this._createAssemblerController();
	private _createAssemblerController(): GlAssemblerController<ShaderAssemblerCloth> | undefined {
		return Poly.assemblersRegister.assembler(this, this.usedAssembler());
	}
	public override readonly persisted_config: ClothPersistedConfig = new ClothPersistedConfig(this);
	private _globalsHandler = new GlobalsTextureHandler(
		GlobalsTextureHandler.PARTICLE_SIM_UV,
		GlobalsTextureHandlerPurpose.PARTICLES_SHADER
	);
	private _shadersByName: Map<ShaderName, string> = new Map();
	shadersByName() {
		return this._shadersByName;
	}

	protected override _childrenControllerContext = NodeContext.GL;
	protected override initializeNode() {
		this.io.inputs.setCount(1);
		// set to always clone, so that we reset the solver
		// by simply setting this node to dirty
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
		this.compileIfRequired();

		const coreGroup = inputCoreGroups[0];

		const objects = coreGroup.threejsObjects();
		const object = objects[0];

		// get texture size
		// if (!isBooleanTrue(this.pv.autoTexturesSize)) {
		// 	// const nearest_power_of_two = CoreMath.nearestPower2(Math.sqrt(pointsCount));
		// 	// _usedTexturesSize.x = Math.min(nearest_power_of_two, this.pv.maxTexturesSize.x);
		// 	// _usedTexturesSize.y = Math.min(nearest_power_of_two, this.pv.maxTexturesSize.y);
		// 	// } else {
		// 	if (!(MathUtils.isPowerOfTwo(this.pv.texturesSize.x) && MathUtils.isPowerOfTwo(this.pv.texturesSize.y))) {
		// 		this.states.error.set('texture size must be a power of 2');
		// 		return;
		// 	}

		// 	const pointsCount = coreParticlesGpuComputeControllerPointsCount(object);
		// 	const maxParticlesCount = this.pv.texturesSize.x * this.pv.texturesSize.y;
		// 	if (pointsCount > maxParticlesCount) {
		// 		this.states.error.set(
		// 			`max particles is set to (${this.pv.texturesSize.x}x${this.pv.texturesSize.y}=) ${maxParticlesCount}`
		// 		);
		// 		return;
		// 	}
		// }

		const existingActorIds = this.scene().actorsManager.objectActorNodeIds(object);
		if (existingActorIds == null || existingActorIds.length == 0) {
			this.states.error.set(`the input objects requires an actor node assigned to it`);
		}
		// const renderer = await this.scene().renderersRegister.waitForRenderer();
		CoreObject.addAttribute(object, ClothIdAttribute.OBJECT, this.graphNodeId());
		Poly.onObjectsAddedHooks.assignHookHandler(object, this);
		// setParticleRenderer(this.graphNodeId(), renderer);
		// CoreParticlesAttribute.setParticlesNodeId(object, this.graphNodeId());
		// CoreParticlesAttribute.setDataType(object, this.pv.dataType);
		// CoreParticlesAttribute.setAutoTextureSize(object, this.pv.autoTexturesSize);
		// CoreParticlesAttribute.setMaxTextureSize(object, this.pv.maxTexturesSize);
		// CoreParticlesAttribute.setTextureSize(object, this.pv.texturesSize);
		// CoreParticlesAttribute.setPreRollFramesCount(object, this.pv.preRollFramesCount);

		// const matNode = this.pv.material.nodeWithContext(NodeContext.MAT, this.states?.error);
		// if (matNode) {
		// 	const material = await matNode.material();
		// 	// const baseBuilderMatNode = materialNode as BaseBuilderMatNodeType;
		// 	// if (baseBuilderMatNode.assemblerController) {
		// 	// 	baseBuilderMatNode.assemblerController()?.setAssemblerGlobalsHandler(this._globalsHandler);
		// 	// }
		// 	CoreParticlesAttribute.setMaterialNodeId(object, matNode.graphNodeId());

		// 	if (!material) {
		// 		this.states?.error.set(`material invalid. (error: '${matNode.states.error.message()}')`);
		// 	}
		// } else {
		// 	this.states?.error.set(`no material node found`);
		// }
		// if (node.p.material.isDirty()) {
		// 	this.mainController.debugMessage('renderController: this.node.p.material.compute() START');
		// 	await node.p.material.compute();
		// 	this.mainController.debugMessage('renderController: this.node.p.material.compute() END');
		// }
		// const matNode = node.pv.material.nodeWithContext(NodeContext.MAT, node.states.error) as BaseBuilderMatNodeType;
		this.setObject(object);

		// this.compilationController.compileIfRequired();
		// //
		// Poly.onObjectsAddedHooks.registerHook(this.type(), this.traverseObjectOnSopGroupAdd.bind(this));
		// const coreGroup = inputCoreGroups[0];

		// const objects: Object3D[] = coreGroup.threejsObjects();

		// const actorNode = this._findActorNode();
		// for (let object of objects) {
		// 	CoreObject.addAttribute(object, ClothIdAttribute.OBJECT, this.graphNodeId());
		// 	// CoreObject.addAttribute(object, ClothSolverAttribute.STEPS_COUNT, this.pv.steps);
		// 	this.scene().actorsManager.assignActorBuilder(object, actorNode);
		// }

		// this.setObjects(objects);
	}
	public override updateObjectOnAdd(object: Object3D) {
		//
		const clothSolverNodeId = CoreObject.attribValue(object, ClothIdAttribute.OBJECT);
		if (clothSolverNodeId != null) {
			if (clothSolverNodeId != this.graphNodeId()) {
				return;
			}
			const clothObject = object;
			const result = createOrFindClothController(this.scene(), this, clothObject);
			if (!result) {
				return;
			}
			const {controller} = result;

			this.scene()
				.renderersRegister.waitForRenderer()
				.then((renderer) => {
					if (!renderer) {
						console.warn('no renderer');
						return;
					}
					if (!(renderer instanceof WebGLRenderer)) {
						console.warn('not a WebGLRenderer');
						return;
					}
					controller.init(renderer);
				});
		}
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
			assemblerController.setAssemblerGlobalsHandler(this._globalsHandler);
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
	initCoreClothControllerFromPersistedConfig(coreClothController: ClothController) {
		const shaders_by_name = this.persisted_config.shaders_by_name();
		const texture_allocations_controller = this.persisted_config.texture_allocations_controller();
		if (shaders_by_name && texture_allocations_controller) {
			// this._setShaderNames(shaders_by_name);
			coreClothController.setPersistedTextureAllocationController(texture_allocations_controller);
		}
	}

	private _findExportNodes() {
		const nodes: BaseGlNodeType[] = []; //GlNodeFinder.findAttributeExportNodes(this);
		const outputNodes = GlNodeFinder.findOutputNodes(this);
		if (outputNodes.length == 0) {
			this.states.error.set('one output node is required');
		}
		if (outputNodes.length > 1) {
			this.states.error.set('only one output node is allowed');
			return [];
		}
		const outputNode = outputNodes[0];
		if (outputNode) {
			nodes.push(outputNode);
		}
		return nodes;
	}

	// private _findActorNode() {
	// 	// if (isBooleanTrue(this.pv.useThisNode)) {
	// 	return this;
	// 	// } else {
	// 	// 	return this.pv.node.node() as ActorBuilderNode | undefined;
	// 	// }
	// }
}

export function getClothControllerNodeFromWorldObject(
	clothObject: Object3D,
	scene: PolyScene
): ClothSolverSopNode | undefined {
	const nodeId = clothControllerNodeIdFromObject(clothObject);
	if (nodeId == null) {
		return;
	}
	const graphNode = scene.graph.nodeFromId(nodeId);
	if (!graphNode) {
		return;
	}
	const node: BaseNodeType | null = CoreType.isFunction((graphNode as BaseNodeType).context)
		? (graphNode as BaseNodeType)
		: null;
	if (!node) {
		return;
	}
	if (node.context() != NodeContext.SOP) {
		return;
	}
	if (node.type() != SopType.CLOTH_SOLVER) {
		return;
	}
	return node as ClothSolverSopNode;
}
