/**
 * Create a soft body solver
 *
 *
 */
import {Object3D, Vector3} from 'three';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {NodeContext} from '../../poly/NodeContext';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {PolyScene} from '../../scene/PolyScene';
import {CoreType, isArray} from '../../../core/Type';
import {BaseNodeType} from '../_Base';
import {Poly} from '../../Poly';
import {ThreejsCoreObject} from '../../../core/geometry/modules/three/ThreejsCoreObject';
import {DEFAULT as DEFAULT_TESSELATION_PARAMS} from '../../../core/geometry/modules/tet/utils/TesselationParamsConfig';
import {CoreSoftBodyAttribute, SoftBodyIdAttribute} from '../../../core/softBody/SoftBodyAttribute';
import {
	createOrFindSoftBodyController,
	softBodyControllerNodeIdFromObject,
} from '../../../core/softBody/SoftBodyControllerRegister';
import {TetSopNode} from './_BaseTet';
import {TetEmbed} from '../../../core/softBody/Common';
import {SoftBodyPersistedConfig} from '../js/code/assemblers/softBody/SoftBodyPersistedConfig';
import {AssemblerName} from '../../poly/registers/assemblers/_BaseRegister';
import {JsAssemblerSoftBody} from '../js/code/assemblers/softBody/SoftBodyAssembler';
import {JsAssemblerController} from '../js/code/Controller';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
import {JsNodeChildrenMap} from '../../poly/registers/nodes/Js';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {BaseJsNodeType} from '../js/_Base';
import {JsParamConfig} from '../js/code/utils/JsParamConfig';
import {VelocityColliderFunctionData} from '../js/code/assemblers/_Base';
import {ParamType} from '../../poly/ParamType';
import {RegisterableVariable} from '../js/code/assemblers/_BaseJsPersistedConfigUtils';
import {JsNodeFinder} from '../js/code/utils/NodeFinder';
import {TetObject} from '../../../core/geometry/modules/tet/TetObject';
import {VelocityFunction, SDFFunction} from '../../../core/softBody/SoftBody';
import {BaseSopNodeType} from './_Base';

type FunctionArg = number | boolean | Function | RegisterableVariable;

type SoftBodyVelocityEvaluatorFunction = (...args: FunctionArg[]) => VelocityFunction;
type SoftBodyColliderEvaluatorFunction = (...args: FunctionArg[]) => SDFFunction;

interface FunctionCreationArgs {
	velocity: string[];
	collider: string[];
}

interface FunctionEvalArgs {
	args: FunctionArg[];
	argsCountBeforeParams: number;
}
interface MultiFunctionEvalArgs {
	velocity: FunctionEvalArgs;
	collider: FunctionEvalArgs;
}
export interface MultiFunctionPartial {
	velocity: SoftBodyVelocityEvaluatorFunction | undefined;
	collider: SoftBodyColliderEvaluatorFunction | undefined;
}
export interface MultiFunctionDefined {
	velocity: VelocityFunction;
	collider: SDFFunction;
}
export interface EvalArgsWithParamConfigs {
	velocity: FunctionArg[];
	collider: FunctionArg[];
}
type FunctionType = 'velocity' | 'collider';
interface EvaluationGlobals {
	position: Vector3;
	velocity: Vector3;
	time: number;
	delta: number;
}

class TetSoftBodySolverSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new TetSoftBodySolverSopParamsConfig();

export class TetSoftBodySolverSopNode extends TetSopNode<TetSoftBodySolverSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type(): SopType.TET_SOFT_BODY_SOLVER {
		return SopType.TET_SOFT_BODY_SOLVER;
	}

	private _nextId = 0;
	private _tetEmbedByThreejsObjectEphemeralId: Map<number, TetEmbed> = new Map();

	override readonly persisted_config: SoftBodyPersistedConfig = new SoftBodyPersistedConfig(this);
	assemblerController() {
		return this._assemblerController;
	}
	public override usedAssembler(): Readonly<AssemblerName.JS_SOFT_BODY> {
		return AssemblerName.JS_SOFT_BODY;
	}
	protected _assemblerController = this._createAssemblerController();
	private _createAssemblerController(): JsAssemblerController<JsAssemblerSoftBody> | undefined {
		return Poly.assemblersRegister.assembler(this, this.usedAssembler());
	}

	protected override _childrenControllerContext = NodeContext.JS;

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		// set to always clone, so that we reset the solver
		// by simply setting this node to dirty
		this.io.inputs.initInputsClonedState(InputCloneMode.ALWAYS);
	}

	override createNode<S extends keyof JsNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): JsNodeChildrenMap[S];
	override createNode<K extends valueof<JsNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<JsNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BaseJsNodeType[];
	}
	override nodesByType<K extends keyof JsNodeChildrenMap>(type: K): JsNodeChildrenMap[K][] {
		return super.nodesByType(type) as JsNodeChildrenMap[K][];
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

		const inputTetObjects = inputCoreGroups[0].tetObjects();
		if (inputTetObjects) {
			const newThreejsObjects: Object3D[] = [];
			for (const tetObject of inputTetObjects) {
				const highResObject = await this._highResObject(tetObject);
				const threejsObjectsFromTetObject = tetObject.toObject3D({
					...DEFAULT_TESSELATION_PARAMS,
					displayTetMesh: false,
					displayOuterMesh: true,
				});
				if (threejsObjectsFromTetObject) {
					const lowResObject = isArray(threejsObjectsFromTetObject)
						? threejsObjectsFromTetObject[0]
						: threejsObjectsFromTetObject;
					const displayedObject = highResObject ? highResObject : lowResObject;
					ThreejsCoreObject.addAttribute(
						displayedObject,
						SoftBodyIdAttribute.SOLVER_NODE,
						this.graphNodeId()
					);
					const nextId = this._nextId++;
					ThreejsCoreObject.addAttribute(displayedObject, SoftBodyIdAttribute.EPHEMERAL_ID, nextId);

					const tetEmbed: TetEmbed = {
						tetObject,
						lowResObject,
						highResObject,
					};
					this._tetEmbedByThreejsObjectEphemeralId.set(nextId, tetEmbed);
					Poly.onObjectsAddRemoveHooks.assignOnAddHookHandler(displayedObject, this);
					newThreejsObjects.push(displayedObject);
				}
			}
			this.setObjects(newThreejsObjects);
		} else {
			this.states.error.set(`no tet objects found in input`);
			this.setObjects([]);
		}
	}
	private async _highResObject(tetObject: TetObject): Promise<Object3D | undefined> {
		const highResNodeId = CoreSoftBodyAttribute.getTetEmbedHighResNodeId(tetObject);
		if (highResNodeId == null) {
			return;
		}
		const node = this.scene().graph.nodeFromId(highResNodeId) as BaseSopNodeType;
		if (!node) {
			return;
		}
		const container = await node.compute();
		if (!container) {
			return;
		}
		const threejsObjects = container.coreContent()?.threejsObjects();
		if (!threejsObjects) {
			return;
		}
		return threejsObjects[0];
	}

	public override updateObjectOnAdd(object: Object3D, parent: Object3D) {
		//
		const solverNodeId = ThreejsCoreObject.attribValue(object, SoftBodyIdAttribute.SOLVER_NODE);
		if (solverNodeId != null) {
			if (solverNodeId != this.graphNodeId()) {
				return;
			}
			const ephemeralId = ThreejsCoreObject.attribValue(object, SoftBodyIdAttribute.EPHEMERAL_ID) as number;
			if (ephemeralId == null) {
				console.error('no ephemeralId found on object', object);
			}
			const tetEmbed = this._tetEmbedByThreejsObjectEphemeralId.get(ephemeralId);
			if (!tetEmbed) {
				console.error('no tetObject found from object', object);
				return;
			}
			createOrFindSoftBodyController(this.scene(), this, {
				tetEmbed,
				threejsObjectInSceneTree: object,
			});
		}
	}

	compileIfRequired() {
		if (this.assemblerController()?.compileRequired()) {
			this.compile();
		}
	}
	private _evaluationGlobals: EvaluationGlobals = {
		position: new Vector3(),
		velocity: new Vector3(),
		time: 0,
		delta: 0,
	};
	private _paramConfigs: JsParamConfig<ParamType>[] = [];
	// private _paramConfigNames: string[] = [];
	private _functionData: VelocityColliderFunctionData | undefined;
	private _functionCreationArgs: FunctionCreationArgs = {
		velocity: [],
		collider: [],
	};
	private _functionEvalArgs: MultiFunctionEvalArgs = {
		velocity: {args: [], argsCountBeforeParams: 0},
		collider: {args: [], argsCountBeforeParams: 0},
	};
	private _function: MultiFunctionPartial = {
		velocity: undefined,
		collider: undefined,
	};
	private _functionArgsWithParams: EvalArgsWithParamConfigs = {
		velocity: [],
		collider: [],
	};
	updateSceneGlobals(stepsCount: number, dt: number) {
		this._evaluationGlobals.time = this.scene().time() + stepsCount * dt;
		this._evaluationGlobals.delta = dt; //this.scene().timeController.delta();
		this._functionArgsWithParams.velocity[2] = this._evaluationGlobals.time;
		this._functionArgsWithParams.collider[2] = this._evaluationGlobals.time;
		this._functionArgsWithParams.velocity[3] = this._evaluationGlobals.delta;
		this._functionArgsWithParams.collider[3] = this._evaluationGlobals.delta;
	}
	setPositionGlobals(position: Vector3) {
		this._evaluationGlobals.position.copy(position);
	}
	setPointGlobals(position: Vector3, velocity: Vector3) {
		this._evaluationGlobals.position.copy(position);
		this._evaluationGlobals.velocity.copy(velocity);
	}
	function() {
		return this._function;
	}
	functionData() {
		return this._functionData;
	}
	compile() {
		const assemblerController = this.assemblerController();
		if (!assemblerController) {
			return;
		}
		const outputNodes: BaseJsNodeType[] = JsNodeFinder.findOutputNodes(this);
		if (outputNodes.length == 0) {
			this.states.error.set('one output node is required');
			return;
		}
		if (outputNodes.length > 1) {
			this.states.error.set('only one output node allowed');
			return;
		}
		const outputNode = outputNodes[0];
		if (outputNode) {
			const paramNodes = JsNodeFinder.findParamGeneratingNodes(this);
			const rootNodes = outputNodes.concat(paramNodes);
			assemblerController.assembler.set_root_nodes(rootNodes);

			// main compilation
			assemblerController.assembler.updateFunction();

			// get functionData
			const functionData = assemblerController.assembler.functionData();
			if (!functionData) {
				this.states.error.set('failed to compile ');
				return;
			}
			this.updateFromFunctionData(functionData);
		}

		assemblerController.post_compile();
	}
	updateFromFunctionData(functionData: VelocityColliderFunctionData) {
		this._functionData = functionData;

		const {functionBody, variableNames, variablesByName, functionNames, functionsByName, paramConfigs} =
			this._functionData;

		const _createFunctionArgs = (functionBody: string, type: FunctionType) => {
			const wrappedBody = `
			try {
				${functionBody}
			} catch(e) {
				_setErrorFromError(e)
				return 0;
			}`;
			const _setErrorFromError = (e: Error) => {
				this.states.error.set(e.message);
			};
			const variables: RegisterableVariable[] = [];
			const functions: Function[] = [];
			for (const variableName of variableNames) {
				const variable = variablesByName[variableName];
				variables.push(variable);
			}
			for (const functionName of functionNames) {
				const _func = functionsByName[functionName];
				functions.push(_func);
			}
			this._paramConfigs = [...paramConfigs]; //[...paramConfigs];
			const paramConfigNames: string[] = paramConfigs.map((pc) => pc.uniformName());

			paramConfigs.forEach((p) => p.applyToNode(this));

			this._functionCreationArgs[type] = [
				'position',
				'velocity',
				'time',
				'delta',
				'_setErrorFromError',
				...variableNames,
				...functionNames,
				...paramConfigNames,
				wrappedBody,
			];
			this._functionEvalArgs[type].args = [
				this._evaluationGlobals.position,
				this._evaluationGlobals.velocity,
				this._evaluationGlobals.time,
				this._evaluationGlobals.delta,
				_setErrorFromError,
				...variables,
				...functions,
				// paramConfigs are added dynamically during cook
			];
			this._functionEvalArgs[type].argsCountBeforeParams = this._functionEvalArgs[type].args.length;
			try {
				this._function[type] = new Function(...this._functionCreationArgs[type]) as any;
			} catch (e) {
				console.warn(e);
				this.states.error.set('failed to compile');
			}
		};
		_createFunctionArgs(functionBody.velocity, 'velocity');
		_createFunctionArgs(functionBody.collider, 'collider');
	}

	functionEvalArgsWithParamConfigs() {
		const _args = (type: FunctionType) => {
			const argsData = this._functionEvalArgs[type];
			const list = argsData.args;
			let i = argsData.argsCountBeforeParams;
			// const list: Array<Function | RegisterableVariable | number | boolean> = [...this._functionEvalArgs[type]];
			for (const paramConfig of this._paramConfigs) {
				const paramName = paramConfig.name();
				const spareParam = this.params.get(paramName);
				if (spareParam && spareParam.value != null) {
					if (
						CoreType.isBoolean(spareParam.value) ||
						CoreType.isNumberValid(spareParam.value) ||
						CoreType.isColor(spareParam.value) ||
						CoreType.isVector(spareParam.value)
					) {
						list[i] = spareParam.value;
						i++;
					} else {
						console.warn(`spareParam not found but type not yet copied to function args:'${paramName}'`);
					}
				} else {
					console.warn(`spareParam not found:'${paramName}'`);
				}
			}
			return list;
		};
		this._functionArgsWithParams.velocity = _args('velocity');
		this._functionArgsWithParams.collider = _args('collider');
		return this._functionArgsWithParams;
	}
}

export function getSoftBodyControllerNodeFromSolverObject(
	solverObject: Object3D,
	scene: PolyScene
): TetSoftBodySolverSopNode | undefined {
	const nodeId = softBodyControllerNodeIdFromObject(solverObject);
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
	if (node.type() != SopType.TET_SOFT_BODY_SOLVER) {
		return;
	}
	return node as TetSoftBodySolverSopNode;
}
