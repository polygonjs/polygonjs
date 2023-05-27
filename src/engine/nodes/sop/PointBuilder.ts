/**
 * Updates points with JS nodes
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {
	PointBuilderFunctionData,
	PointBuilderPersistedConfig,
} from '../js/code/assemblers/pointBuilder/PointBuilderPersistedConfig';
import {AssemblerName} from '../../poly/registers/assemblers/_BaseRegister';
import {JsAssemblerController} from '../js/code/Controller';
import {JsAssemblerPointBuilder} from '../js/code/assemblers/pointBuilder/PointBuilderAssembler';
import {
	PointContainer,
	PointBuilderAssemblerConstant,
} from '../js/code/assemblers/pointBuilder/PointBuilderAssemblerCommon';
import {Poly} from '../../Poly';
import {NodeContext} from '../../poly/NodeContext';
import {JsNodeChildrenMap} from '../../poly/registers/nodes/Js';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {BaseJsNodeType} from '../js/_Base';
import {JsParamConfig} from '../js/code/utils/JsParamConfig';
import {ParamType} from '../../poly/ParamType';
import {RegisterableVariable, createVariable} from '../js/code/assemblers/_BaseJsPersistedConfigUtils';
import {JsNodeFinder} from '../js/code/utils/NodeFinder';
import {CoreType, isColor, isVector, isNumber} from '../../../core/Type';
import {BufferAttribute, BufferGeometry, Color, Vector2, Vector3, Vector4} from 'three';
import {CoreGeometry} from '../../../core/geometry/Geometry';
import {Attribute} from '../../../core/geometry/Attribute';
import {JsConnectionPointComponentsCountMap, JsConnectionPointType} from '../utils/io/connections/Js';
import {logBlue as _logBlue} from '../../../core/logger/Console';
import {PointBuilderEvaluator} from '../js/code/assemblers/pointBuilder/PointBuilderEvaluator';
import {CoreMask} from '../../../core/geometry/Mask';
import {object3DHasGeometry} from '../../../core/geometry/GeometryUtils';

function _debug() {
	return !Poly.playerMode();
}
function logBlue(message: string) {
	if (!_debug()) {
		return;
	}
	_logBlue(message);
}
function logDefault(message: string) {
	if (!_debug()) {
		return;
	}
	console.log(message);
}

type PointFunction = Function; //(object:Object3D)=>Object3D
type AttributeItem = boolean | number | string | Color | Vector2 | Vector3 | Vector4;
type AttributesDict = Map<string, AttributeItem>;

class PointBuilderSopParamsConfig extends NodeParamsConfig {
	/** @param group to assign the material to */
	group = ParamConfig.STRING('', {
		objectMask: true,
	});
	/** @param toggle on to apply recursively to children */
	applyToChildren = ParamConfig.BOOLEAN(0);
}
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

			const evaluator = _func(...args) as PointBuilderEvaluator;

			const inputObjects = this._getObjects(coreGroup);

			let objnum = 0;
			for (const inputObject of inputObjects) {
				this._pointIndexContainer.objnum = objnum;
				const geometry = inputObject.geometry;
				const readAttributeOptions = this._checkRequiredReadAttributes(geometry);
				const writeAttributeOptions = this._checkRequiredWriteAttributes(geometry);
				const readAttribNames = readAttributeOptions ? readAttributeOptions.attribNames : [];
				const readAttributeByName = readAttributeOptions ? readAttributeOptions.attributeByName : new Map();
				const attribTypeByName = readAttributeOptions ? readAttributeOptions.attribTypeByName : new Map();
				const writeAttribNames = writeAttributeOptions ? writeAttributeOptions.attribNames : [];
				const writeAttributeByName = writeAttributeOptions ? writeAttributeOptions.attributeByName : new Map();
				this._resetRequiredAttributes();
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
					// read attributes
					if (hasPosition) {
						this._pointIndexContainer.position.fromBufferAttribute(positionAttrib, ptnum);
					}
					if (hasNormal) {
						this._pointIndexContainer.normal.fromBufferAttribute(normalAttrib, ptnum);
					}
					this._readRequiredAttributes(ptnum, readAttribNames, readAttributeByName, attribTypeByName);
					// eval function
					evaluator();
					// write back
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
					this._writeRequiredAttributes(ptnum, writeAttribNames, writeAttributeByName);
				}
				objnum++;
			}

			this.setObjects(inputObjects);
		} else {
			this.setObjects([]);
		}
	}
	private _getObjects(coreGroup: CoreGroup): Object3DWithGeometry[] {
		return CoreMask.filterObjects(coreGroup, this.pv).filter(object3DHasGeometry);
	}
	private _resetRequiredAttributes() {
		this._attributesDict.clear();
	}
	private _checkRequiredReadAttributes(geometry: BufferGeometry) {
		const readAttributesData = this._functionData?.attributesData.read;
		if (!readAttributesData) {
			return;
		}
		for (const attribData of readAttributesData) {
			const attribute = geometry.getAttribute(attribData.attribName);
			if (!attribute) {
				this.states.error.set(`attribute ${attribData.attribName} is missing`);
				throw 'error';
			} else {
				const expectedAttribSize = JsConnectionPointComponentsCountMap[attribData.attribType];
				if (attribute.itemSize != expectedAttribSize) {
					this.states.error.set('attribute size mismatch');
				}
			}
		}

		const attribNames: string[] = [];
		const attributeByName = new Map<string, BufferAttribute>();
		const attribTypeByName = new Map<string, JsConnectionPointType>();
		for (const attribData of readAttributesData) {
			const attribName = attribData.attribName;
			const attribute = geometry.getAttribute(attribName) as BufferAttribute;
			if (attribute) {
				attribNames.push(attribName);
				attributeByName.set(attribName, attribute);
				attribTypeByName.set(attribName, attribData.attribType);
			}
		}
		return {attribNames, attributeByName, attribTypeByName};
	}
	private _checkRequiredWriteAttributes(geometry: BufferGeometry) {
		const writeAttributesData = this._functionData?.attributesData.write;
		if (!writeAttributesData) {
			return;
		}
		for (const attribData of writeAttributesData) {
			let attribute = geometry.getAttribute(attribData.attribName);
			const expectedAttribSize = JsConnectionPointComponentsCountMap[attribData.attribType];
			if (!attribute) {
				const pointsCount = geometry.getAttribute(Attribute.POSITION).count;
				const newArray: number[] = new Array(pointsCount * expectedAttribSize).fill(0);
				attribute = new BufferAttribute(new Float32Array(newArray), expectedAttribSize);
				geometry.setAttribute(attribData.attribName, attribute);
			}
			if (attribute.itemSize != expectedAttribSize) {
				this.states.error.set('attribute size mismatch');
			}
		}

		const attribNames: string[] = [];
		const attributeByName = new Map<string, BufferAttribute>();
		const attribTypeByName = new Map<string, JsConnectionPointType>();
		for (const attribData of writeAttributesData) {
			const attribName = attribData.attribName;
			const attribute = geometry.getAttribute(attribName) as BufferAttribute;
			if (attribute) {
				attribNames.push(attribName);
				attributeByName.set(attribName, attribute);
				attribTypeByName.set(attribName, attribData.attribType);
			}
		}
		return {attribNames, attributeByName, attribTypeByName};
	}
	private _readRequiredAttributes(
		ptnum: number,
		attribNames: string[],
		attributeByName: Map<string, BufferAttribute>,
		attribTypeByName: Map<string, JsConnectionPointType>
	) {
		for (const attribName of attribNames) {
			const attribute = attributeByName.get(attribName)!;
			const attribType = attribTypeByName.get(attribName)!;
			const variable = createVariable(attribType);
			if (!variable) {
				const attribValue = attribute.array[ptnum * attribute.itemSize];
				this._attributesDict.set(attribName, attribValue);
			} else if (isVector(variable) || isColor(variable)) {
				variable.fromBufferAttribute(attribute, ptnum);
				this._attributesDict.set(attribName, variable);
			}
		}
	}
	private _writeRequiredAttributes(
		ptnum: number,
		attribNames: string[],
		attributeByName: Map<string, BufferAttribute>
	) {
		for (const attribName of attribNames) {
			const attribute = attributeByName.get(attribName)!;
			const variable = this._attributesDict.get(attribName);
			if (isVector(variable) || isColor(variable)) {
				variable.toArray(attribute.array, ptnum * attribute.itemSize);
			} else {
				if (isNumber(variable)) {
					(attribute.array as number[])[ptnum] = variable;
				}
			}
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
	private _functionData: PointBuilderFunctionData | undefined;
	private _functionCreationArgs: string[] = [];
	private _functionEvalArgs: (PointContainer | Function | RegisterableVariable | AttributesDict)[] = [];
	private _function: PointFunction | undefined;
	private _attributesDict: AttributesDict = new Map();
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
	updateFromFunctionData(functionData: PointBuilderFunctionData) {
		this._functionData = functionData;

		const {functionBody, variableNames, variablesByName, functionNames, functionsByName, paramConfigs} =
			this._functionData;

		logBlue('*****************');

		const wrappedBody = `
		try {
			${functionBody}
		} catch(e) {
			_setErrorFromError(e)
			return 0;
		}`;
		logDefault(wrappedBody);
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
			PointBuilderAssemblerConstant.POINT_CONTAINER,
			'_setErrorFromError',
			...variableNames,
			...functionNames,
			PointBuilderAssemblerConstant.ATTRIBUTES_DICT,
			...paramConfigNames,
			wrappedBody,
		];
		this._functionEvalArgs = [
			this._pointIndexContainer,
			_setErrorFromError,
			...variables,
			...functions,
			this._attributesDict,
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
		const list: Array<PointContainer | Function | RegisterableVariable | number | boolean | AttributesDict> = [
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
