/**
 * Updates points with JS nodes
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {PointBuilderPersistedConfig} from '../js/code/assemblers/pointBuilder/PointBuilderPersistedConfig';
import {AssemblerName} from '../../poly/registers/assemblers/_BaseRegister';
import {JsAssemblerController} from '../js/code/Controller';
import {
	JsAssemblerPointBuilder,
	PointContainer,
	FunctionConstant,
} from '../js/code/assemblers/pointBuilder/PointBuilderAssembler';
import {Poly} from '../../Poly';
import {NodeContext} from '../../poly/NodeContext';
import {JsNodeChildrenMap} from '../../poly/registers/nodes/Js';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {BaseJsNodeType} from '../js/_Base';
import {JsParamConfig} from '../js/code/utils/JsParamConfig';
import {ParamType} from '../../poly/ParamType';
import {FunctionData} from '../js/code/assemblers/_Base';
import {RegisterableVariable} from '../js/code/assemblers/_BaseJsPersistedConfigUtils';
import {JsNodeFinder} from '../js/code/utils/NodeFinder';
import {CoreType} from '../../../core/Type';
import {BufferAttribute, Object3D, Vector3} from 'three';
import {CoreGeometry} from '../../../core/geometry/Geometry';
import {Attribute} from '../../../core/geometry/Attribute';

type PointFunction = Function; //(object:Object3D)=>Object3D

class PointBuilderSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new PointBuilderSopParamsConfig();

export class PointBuilderSopNode extends TypedSopNode<PointBuilderSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.POINT_BUILDER;
	}

	override readonly persisted_config: PointBuilderPersistedConfig = new PointBuilderPersistedConfig(this);
	assemblerController() {
		return this._assemblerController;
	}
	public override usedAssembler(): Readonly<AssemblerName.JS_POINT_BUILDER> {
		return AssemblerName.JS_POINT_BUILDER;
	}
	protected _assemblerController = this._createAssemblerController();
	private _createAssemblerController(): JsAssemblerController<JsAssemblerPointBuilder> | undefined {
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
			const inputObjects = coreGroup.threejsObjectsWithGeo();
			// const convertedFunction = () => {
			// 	return _func(...args);
			// };
			const newObjects: Object3D[] = [];
			let objnum = 0;
			for (const inputObject of inputObjects) {
				this._pointIndexContainer.objnum = objnum;
				const geometry = inputObject.geometry;
				const pointsCount = CoreGeometry.pointsCount(geometry);
				const positionAttrib = geometry.getAttribute(Attribute.POSITION) as BufferAttribute;
				const normalAttrib = geometry.getAttribute(Attribute.NORMAL) as BufferAttribute;
				const hasPosition = positionAttrib != null;
				const hasNormal = normalAttrib != null;
				if (!hasPosition) {
					this._pointIndexContainer.position.set(0, 0, 0);
				}
				if (!hasNormal) {
					this._pointIndexContainer.normal.set(0, 1, 0);
				}
				for (let ptnum = 0; ptnum < pointsCount; ptnum++) {
					this._pointIndexContainer.ptnum = ptnum;
					if (hasPosition) {
						this._pointIndexContainer.position.fromBufferAttribute(positionAttrib, ptnum);
					}
					if (hasNormal) {
						this._pointIndexContainer.normal.fromBufferAttribute(normalAttrib, ptnum);
					}
					_func(...args);
					if (hasPosition) {
						positionAttrib.setXYZ(
							ptnum,
							this._pointIndexContainer.position.x,
							this._pointIndexContainer.position.y,
							this._pointIndexContainer.position.z
						);
					}
					if (hasNormal) {
						normalAttrib.setXYZ(
							ptnum,
							this._pointIndexContainer.normal.x,
							this._pointIndexContainer.normal.y,
							this._pointIndexContainer.normal.z
						);
					}
					// convertedFunction(inputObject, i);
				}
				newObjects.push(inputObject);
				objnum++;
			}

			this.setObjects(newObjects);
		} else {
			this.setObjects([]);
		}
	}

	compileIfRequired() {
		if (this.assemblerController()?.compileRequired()) {
			this.compile();
		}
	}
	private _pointIndexContainer: PointContainer = {
		position: new Vector3(),
		normal: new Vector3(),
		ptnum: -1,
		objnum: -1,
	};
	private _paramConfigs: JsParamConfig<ParamType>[] = [];
	private _functionData: FunctionData | undefined;
	private _functionCreationArgs: string[] = [];
	private _functionEvalArgs: (PointContainer | Function | RegisterableVariable)[] = [];
	private _function: PointFunction | undefined;
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
	updateFromFunctionData(functionData: FunctionData) {
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
			FunctionConstant.POINT_CONTAINER,
			'_setErrorFromError',
			...variableNames,
			...functionNames,
			...paramConfigNames,
			wrappedBody,
		];
		this._functionEvalArgs = [
			this._pointIndexContainer,
			_setErrorFromError,
			...variables,
			...functions,
			// paramConfigs are added dynamically during cook
		];
		try {
			this._function = new Function(...this._functionCreationArgs) as PointFunction;
		} catch (e) {
			console.warn(e);
			this.states.error.set('failed to compile');
		}
	}

	functionEvalArgsWithParamConfigs() {
		const list: Array<PointContainer | Function | RegisterableVariable | number | boolean> = [
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
