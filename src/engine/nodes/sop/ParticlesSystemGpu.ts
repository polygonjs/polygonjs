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
import {Object3D} from 'three';
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
import {PARTICLE_DATA_TYPES} from '../../../core/particles/CoreParticlesGpuComputeController';
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
import {ParticlesSystemGpuAttributesSopOperation} from '../../operations/sop/ParticlesSystemGpuAttributes';
import {ParticlesSystemGpuMaterialSopOperation} from '../../operations/sop/ParticlesSystemGpuMaterial';
import {CoreMask} from '../../../core/geometry/Mask';

interface OperationContainer {
	attributes: ParticlesSystemGpuAttributesSopOperation;
	material: ParticlesSystemGpuMaterialSopOperation;
}
const DEFAULT = ParticlesSystemGpuAttributesSopOperation.DEFAULT_PARAMS;

class ParticlesSystemGpuSopParamsConfig extends NodeParamsConfig {
	/** @param group to assign the material to */
	group = ParamConfig.STRING(DEFAULT.group, {
		objectMask: true,
	});
	/** @param toggle on to also assign the material to children */
	applyToChildren = ParamConfig.BOOLEAN(DEFAULT.applyToChildren, {
		separatorAfter: true,
	});
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

	private _operation: OperationContainer | undefined;
	override async cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || {
			attributes: new ParticlesSystemGpuAttributesSopOperation(this._scene, this.states, this),
			material: new ParticlesSystemGpuMaterialSopOperation(this._scene, this.states, this),
		};

		Poly.onObjectsAddedHooks.registerHook(this.type(), this.traverseObjectOnSopGroupAdd.bind(this));

		this.compileIfRequired();

		const coreGroup = inputCoreGroups[0];

		const selectedObjects = CoreMask.filterObjects(coreGroup, this.pv);
		for (let object of selectedObjects) {
			const existingActorIds = this.scene().actorsManager.objectActorNodeIds(object);
			if (existingActorIds == null || existingActorIds.length == 0) {
				this.states.error.set(`the input objects requires an actor node assigned to it`);
				return;
			}
		}
		const renderer = await this.scene().renderersRegister.waitForRenderer();
		if (!renderer) {
			this.states.error.set(`no renderer found`);
			return;
		}
		for (let object of selectedObjects) {
			setParticleRenderer(this.graphNodeId(), renderer);
			CoreParticlesAttribute.setParticlesNodeId(object, this.graphNodeId());
			CoreParticlesAttribute.setDataType(object, this.pv.dataType);
			CoreParticlesAttribute.setPreRollFramesCount(object, this.pv.preRollFramesCount);
		}

		this._operation.attributes.cook(inputCoreGroups, this.pv);
		await this._operation.material.cook(inputCoreGroups, this.pv);
		this.setObjects(selectedObjects);
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
		const exportNodes = this._findExportNodes();
		if (exportNodes.length > 0) {
			const rootNodes = exportNodes.concat(GlNodeFinder.findAjacencyNodes(this));
			assemblerController.setAssemblerGlobalsHandler(this._particlesGlobalsHandler);
			assemblerController.assembler.set_root_nodes(rootNodes);

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
}
