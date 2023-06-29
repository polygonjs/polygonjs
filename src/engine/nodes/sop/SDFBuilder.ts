/**
 * Creates a mesh from an SDF function.
 *
 *
 */
import {Constructor, Number3, valueof} from '../../../types/GlobalTypes';
import {NodeContext} from '../../poly/NodeContext';
import {CoreGroup} from '../../../core/geometry/Group';
import {JsNodeChildrenMap} from '../../poly/registers/nodes/Js';
import {BaseJsNodeType} from '../js/_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {AssemblerName} from '../../poly/registers/assemblers/_BaseRegister';
import {Poly} from '../../Poly';
import {JsAssemblerController} from '../js/code/Controller';
import {JsAssemblerSDF} from '../js/code/assemblers/sdf/SDF';
import {JsNodeFinder} from '../js/code/utils/NodeFinder';
import {Box3, Vector3} from 'three';
import {SingleBodyFunctionData} from '../js/code/assemblers/_Base';
import {RegisterableVariable} from '../js/code/assemblers/_BaseJsPersistedConfigUtils';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {SDFLoader} from '../../../core/geometry/sdf/SDFLoader';
import {Box} from '../../../core/geometry/sdf/SDFCommon';
import {TypedSopNode} from './_Base';
import {ModuleName} from '../../poly/registers/modules/Common';
import {SDFObject} from '../../../core/geometry/sdf/SDFObject';
import {CoreType} from '../../../core/Type';
import {SDFPersistedConfig} from '../js/code/assemblers/sdf/SDFPersistedConfig';
import {ParamType} from '../../poly/ParamType';
import {JsParamConfig} from '../js/code/utils/JsParamConfig';
const _box3 = new Box3();
const box: Box = {min: [-1, -1, -1], max: [1, 1, 1]};
type SDFFunction = Function; //(p: any) => number;

class SDFBuilderSopParamsConfig extends NodeParamsConfig {
	/** @param stepSize */
	stepSize = ParamConfig.FLOAT(0.1, {
		range: [0.01, 1],
		rangeLocked: [true, false],
	});
	/** @param level */
	level = ParamConfig.FLOAT(0, {
		range: [-1, 1],
		rangeLocked: [false, false],
	});
	/** @param min bound */
	min = ParamConfig.VECTOR3([-1, -1, -1]);
	/** @param max bound */
	max = ParamConfig.VECTOR3([1, 1, 1]);
	/** @param linear Tolerance */
	facetAngle = ParamConfig.FLOAT(45, {
		range: [0.01, 180],
		rangeLocked: [true, false],
	});
	/** @param meshes color */
	meshesColor = ParamConfig.COLOR([1, 1, 1]);
	/** @param wireframe */
	wireframe = ParamConfig.BOOLEAN(false, {
		// we need the separator for spare params
		separatorAfter: true,
	});
}
const ParamsConfig = new SDFBuilderSopParamsConfig();
export class SDFBuilderSopNode extends TypedSopNode<SDFBuilderSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.SDF_BUILDER;
	}
	override requiredModules() {
		return [ModuleName.SDF];
	}
	override readonly persisted_config: SDFPersistedConfig = new SDFPersistedConfig(this);
	assemblerController() {
		return this._assemblerController;
	}
	public override usedAssembler(): Readonly<AssemblerName.JS_SDF> {
		return AssemblerName.JS_SDF;
	}
	protected _assemblerController = this._createAssemblerController();
	private _createAssemblerController(): JsAssemblerController<JsAssemblerSDF> | undefined {
		return Poly.assemblersRegister.assembler(this, this.usedAssembler());
	}

	// static PARAM_CALLBACK_reset(node: ParticlesSystemGpuSopNode) {
	// 	node.PARAM_CALLBACK_reset();
	// }
	// PARAM_CALLBACK_reset() {
	// 	// this.gpu_controller.reset_gpu_compute_and_set_dirty();
	// }

	// private _reset_material_if_dirty_bound = this._reset_material_if_dirty.bind(this);
	protected override _childrenControllerContext = NodeContext.JS;
	// private _on_create_prepare_material_bound = this._on_create_prepare_material.bind(this);
	override initializeNode() {
		this.io.inputs.setCount(0, 1);
		// set to never at the moment
		// otherwise the input is cloned on every frame inside cook_main()
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);

		// this.addPostDirtyHook('_reset_material_if_dirty', this._reset_material_if_dirty_bound);

		// this.lifecycle.onCreated(this.assembler_controller.on_create.bind(this.assembler_controller));
		// this.lifecycle.onCreated(this._on_create_prepare_material_bound);
		// this.children_controller?.init({dependent: false});
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
		const manifold = await SDFLoader.core();

		// bbox
		const coreGroup = inputCoreGroups[0];
		if (coreGroup) {
			coreGroup.boundingBox(_box3);
			_box3.min.toArray(box.min);
			_box3.max.toArray(box.max);
		} else {
			this.pv.min.toArray(box.min);
			this.pv.max.toArray(box.max);
		}

		// compile
		this.compileIfRequired();

		// eval
		const _func = this._function;
		if (_func) {
			const args = this.functionEvalArgsWithParamConfigs();
			const convertedFunction = (p: Number3) => {
				this._position.fromArray(p);
				return -1 * _func(...args);
			};
			const geometry = manifold.levelSet(convertedFunction, box, this.pv.stepSize, this.pv.level);
			const sdfObject = new SDFObject(geometry);
			const results = sdfObject.toObject3D(this.pv);
			if (results) {
				if (CoreType.isArray(results)) {
					this.setObjects(results);
				} else {
					this.setObjects([results]);
				}
			} else {
				this.setObjects([]);
			}
		} else {
			this.setObjects([]);
		}
	}
	compileIfRequired() {
		if (this.assemblerController()?.compileRequired()) {
			this.compile();
		}
	}
	private _position = new Vector3();
	private _paramConfigs: JsParamConfig<ParamType>[] = [];
	// private _paramConfigNames: string[] = [];
	private _functionData: SingleBodyFunctionData | undefined;
	private _functionCreationArgs: string[] = [];
	private _functionEvalArgs: (Function | RegisterableVariable)[] = [];
	private _function: SDFFunction | undefined;
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
	updateFromFunctionData(functionData: SingleBodyFunctionData) {
		this._functionData = functionData;

		const {functionBody, variableNames, variablesByName, functionNames, functionsByName, paramConfigs} =
			this._functionData;
		console.log(functionBody);

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

		this._functionCreationArgs = [
			'position',
			'_setErrorFromError',
			...variableNames,
			...functionNames,
			...paramConfigNames,
			wrappedBody,
		];
		this._functionEvalArgs = [
			this._position,
			_setErrorFromError,
			...variables,
			...functions,
			// paramConfigs are added dynamically during cook
		];
		try {
			this._function = new Function(...this._functionCreationArgs) as SDFFunction;
		} catch (e) {
			console.warn(e);
			this.states.error.set('failed to compile');
		}
	}

	functionEvalArgsWithParamConfigs() {
		const list: Array<Function | RegisterableVariable | number | boolean> = [...this._functionEvalArgs];
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
					list.push(spareParam.value);
				} else {
					console.warn(`spareParam not found but type not yet copied to function args:'${paramName}'`);
				}
			} else {
				console.warn(`spareParam not found:'${paramName}'`);
			}
		}
		return list;
	}
}
