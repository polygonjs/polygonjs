/**
 * Updates objects with JS nodes
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {ObjectBuilderPersistedConfig} from '../js/code/assemblers/objectBuilder/ObjectBuilderPersistedConfig';
import {AssemblerName} from '../../poly/registers/assemblers/_BaseRegister';
import {JsAssemblerController} from '../js/code/Controller';
import {JsAssemblerObjectBuilder} from '../js/code/assemblers/objectBuilder/ObjectBuilderAssembler';
import {
	ObjectBuilderAssemblerConstant,
	ObjectContainer,
} from '../js/code/assemblers/objectBuilder/ObjectBuilderAssemblerCommon';
import {Poly} from '../../Poly';
import {NodeContext} from '../../poly/NodeContext';
import {JsNodeChildrenMap} from '../../poly/registers/nodes/Js';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {BaseJsNodeType} from '../js/_Base';
import {JsParamConfig} from '../js/code/utils/JsParamConfig';
import {ParamType} from '../../poly/ParamType';
import {SingleBodyFunctionData} from '../js/code/assemblers/_Base';
import {RegisterableVariable} from '../js/code/assemblers/_BaseJsPersistedConfigUtils';
import {Group, Object3D} from 'three';
import {JsNodeFinder} from '../js/code/utils/NodeFinder';
import {CoreType} from '../../../core/Type';
import {logBlue as _logBlue} from '../../../core/logger/Console';
import {PointBuilderEvaluator} from '../js/code/assemblers/pointBuilder/PointBuilderEvaluator';
import {CoreMask} from '../../../core/geometry/Mask';

type ObjectFunction = Function; //(object:Object3D)=>Object3D

const DUMMY = new Object3D();

class ObjectBuilderSopParamsConfig extends NodeParamsConfig {
	/** @param group to assign the material to */
	group = ParamConfig.STRING('', {
		objectMask: true,
	});
}
const ParamsConfig = new ObjectBuilderSopParamsConfig();

export class ObjectBuilderSopNode extends TypedSopNode<ObjectBuilderSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.OBJECT_BUILDER;
	}

	override readonly persisted_config: ObjectBuilderPersistedConfig = new ObjectBuilderPersistedConfig(this);
	assemblerController() {
		return this._assemblerController;
	}
	public override usedAssembler(): Readonly<AssemblerName.JS_OBJECT_BUILDER> {
		return AssemblerName.JS_OBJECT_BUILDER;
	}
	protected _assemblerController = this._createAssemblerController();
	private _createAssemblerController(): JsAssemblerController<JsAssemblerObjectBuilder> | undefined {
		return Poly.assemblersRegister.assembler(this, this.usedAssembler());
	}

	protected override _childrenControllerContext = NodeContext.JS;

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

	private _tmpParent = new Group();
	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];

		// compile
		this.compileIfRequired();

		// eval
		const _func = this._function;
		if (_func) {
			const args = this.functionEvalArgsWithParamConfigs();
			const evaluator = _func(...args) as PointBuilderEvaluator;
			const inputObjects = this._getObjects(coreGroup);

			// we add a temporary parent to the objects, so that nodes like getSiblings can work
			for (const inputObject of inputObjects) {
				if (inputObject.parent == null) {
					this._tmpParent.add(inputObject);
				}
			}
			let objnum = 0;
			for (const inputObject of inputObjects) {
				this._objectContainer.Object3D = inputObject;
				this._objectContainer.objnum = objnum;
				evaluator();
				inputObject.updateMatrix();
				objnum++;
			}
			const tmpChildren = [...this._tmpParent.children];
			for (const inputObject of tmpChildren) {
				this._tmpParent.remove(inputObject);
			}

			this.setCoreGroup(coreGroup);
		} else {
			this.setObjects([]);
		}
	}
	private _getObjects(coreGroup: CoreGroup) {
		return CoreMask.filterThreejsObjects(coreGroup, this.pv);
	}

	compileIfRequired() {
		if (this.assemblerController()?.compileRequired()) {
			this.compile();
		}
	}
	private _objectContainer: ObjectContainer = {Object3D: DUMMY, objnum: -1};
	private _paramConfigs: JsParamConfig<ParamType>[] = [];
	private _functionData: SingleBodyFunctionData | undefined;
	private _functionCreationArgs: string[] = [];
	private _functionEvalArgs: (ObjectContainer | Function | RegisterableVariable)[] = [];
	private _function: ObjectFunction | undefined;
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
		// if (outputNodes.length > 1) {
		// 	this.states.error.set('only one output node allowed');
		// 	return;
		// }
		const outputNode = outputNodes[0];
		if (outputNode) {
			const paramNodes = JsNodeFinder.findParamGeneratingNodes(this);
			const attributeExportNodes = JsNodeFinder.findAttributeExportNodes(this);
			const rootNodes = outputNodes.concat(paramNodes).concat(attributeExportNodes);
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
			ObjectBuilderAssemblerConstant.OBJECT_CONTAINER,
			'_setErrorFromError',
			...variableNames,
			...functionNames,
			...paramConfigNames,
			wrappedBody,
		];
		this._functionEvalArgs = [
			this._objectContainer,
			_setErrorFromError,
			...variables,
			...functions,
			// paramConfigs are added dynamically during cook
		];
		try {
			this._function = new Function(...this._functionCreationArgs) as ObjectFunction;
		} catch (e) {
			console.warn(e);
			this.states.error.set('failed to compile');
		}
	}

	functionEvalArgsWithParamConfigs() {
		const list: Array<ObjectContainer | Function | RegisterableVariable | number | boolean> = [
			...this._functionEvalArgs,
		];
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
