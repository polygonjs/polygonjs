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
import {isFunction} from '../../../core/Type';
import {BaseNodeType} from '../_Base';
import {Poly} from '../../Poly';
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
import {coreObjectClassFactory} from '../../../core/geometry/CoreObjectFactory';
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

		const objects = coreGroup.allObjects();
		const object = objects[0];
		const existingActorIds = this.scene().actorsManager.objectActorNodeIds(object);
		if (existingActorIds == null || existingActorIds.length == 0) {
			this.states.error.set(`the input objects requires an actor node assigned to it`);
		}

		coreObjectClassFactory(object).addAttribute(object, ClothIdAttribute.OBJECT, this.graphNodeId());
		Poly.onObjectsAddRemoveHooks.assignOnAddHookHandler(object, this);

		this.setObject(object);
	}
	public override updateObjectOnAdd(object: Object3D) {
		//
		const clothSolverNodeId = coreObjectClassFactory(object).attribValue(object, ClothIdAttribute.OBJECT);
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
	}

	init_with_persisted_config() {
		const shaders_by_name = this.persisted_config.shaders_by_name();
		const texture_allocations_controller = this.persisted_config.texture_allocations_controller();
		if (shaders_by_name && texture_allocations_controller) {
			this._setShaderNames(shaders_by_name);
		}
	}
	initCoreClothControllerFromPersistedConfig(coreClothController: ClothController) {
		const shaders_by_name = this.persisted_config.shaders_by_name();
		const texture_allocations_controller = this.persisted_config.texture_allocations_controller();
		if (shaders_by_name && texture_allocations_controller) {
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
	const node: BaseNodeType | null = isFunction((graphNode as BaseNodeType).context)
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
