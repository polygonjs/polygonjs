/**
 * Updates points with JS nodes
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {EntityBuilderFunctionData} from '../js/code/assemblers/entityBuilder/_BaseEntityBuilderPersistedConfig';

import {AssemblerName} from '../../poly/registers/assemblers/_BaseRegister';
import {JsAssemblerController} from '../js/code/Controller';
import type {JsAssemblerEntityBuilder} from '../js/code/assemblers/entityBuilder/EntityBuilderAssembler';
import {
	EntityContainer,
	EntityBuilderAssemblerConstant,
} from '../js/code/assemblers/entityBuilder/EntityBuilderAssemblerCommon';
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
import {BufferAttribute, Color, InterleavedBufferAttribute, Vector2, Vector3, Vector4} from 'three';
import {JsConnectionPointComponentsCountMap, JsConnectionPointType} from '../utils/io/connections/Js';
import {logBlue as _logBlue} from '../../../core/logger/Console';
import {EntityBuilderEvaluator} from '../js/code/assemblers/entityBuilder/EntityBuilderEvaluator';
import {primitivesCountFromObject} from '../../../core/geometry/entities/primitive/CorePrimitiveUtils';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';
import {
	corePointClassFactory,
	corePrimitiveClassFactory,
	coreVertexClassFactory,
} from '../../../core/geometry/CoreObjectFactory';
import {filterObjectsFromCoreGroup} from '../../../core/geometry/Mask';
import {AttribClass} from '../../../core/geometry/Constant';
import {pointsCountFromObject} from '../../../core/geometry/entities/point/CorePointUtils';
import {verticesCountFromObject} from '../../../core/geometry/entities/vertex/CoreVertexUtils';
import {BaseVertexAttribute} from '../../../core/geometry/entities/vertex/VertexAttribute';
import {BasePrimitiveAttribute} from '../../../core/geometry/entities/primitive/PrimitiveAttribute';
import {CorePoint} from '../../../core/geometry/entities/point/CorePoint';
import {CorePrimitive} from '../../../core/geometry/entities/primitive/CorePrimitive';
import {CoreVertex} from '../../../core/geometry/entities/vertex/CoreVertex';

type EntityFunction = Function; //(object:Object3D)=>Object3D
type AttributeItem = boolean | number | string | Color | Vector2 | Vector3 | Vector4;
type AttributesDict = Map<string, AttributeItem>;

type AvailableEntity = AttribClass.POINT | AttribClass.VERTEX | AttribClass.PRIMITIVE;
export const AVAILABLE_ENTITIES: AvailableEntity[] = [AttribClass.POINT, AttribClass.VERTEX, AttribClass.PRIMITIVE];
type EntityAttribute = BufferAttribute | InterleavedBufferAttribute | BaseVertexAttribute | BasePrimitiveAttribute;

export class BaseEntityBuilderSopParamsConfig extends NodeParamsConfig {
	/** @param group to assign the material to */
	group = ParamConfig.STRING('', {
		objectMask: true,
	});
	entity = ParamConfig.INTEGER(AVAILABLE_ENTITIES.indexOf(AttribClass.POINT), {
		menu: {
			entries: AVAILABLE_ENTITIES.map((entity, i) => {
				return {name: entity, value: i};
			}),
		},
	});
}

export abstract class BaseEntityBuilderSopNode<P extends BaseEntityBuilderSopParamsConfig> extends TypedSopNode<P> {
	assemblerController() {
		return this._assemblerController;
	}
	public override usedAssembler(): Readonly<AssemblerName.JS_ENTITY_BUILDER> {
		return AssemblerName.JS_ENTITY_BUILDER;
	}
	protected _assemblerController = this._createAssemblerController();
	private _createAssemblerController(): JsAssemblerController<JsAssemblerEntityBuilder> | undefined {
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

			const evaluator = _func(...args) as EntityBuilderEvaluator;

			const objects = filterObjectsFromCoreGroup(coreGroup, this.pv);

			let objnum = 0;
			for (const object of objects) {
				this._processObject(object, objnum, evaluator);

				objnum++;
			}

			this.setObjects(objects);
		} else {
			this.setObjects([]);
		}
	}

	protected abstract _processObject<T extends CoreObjectType>(
		object: ObjectContent<T>,
		objnum: number,
		evaluator: EntityBuilderEvaluator
	): void;

	protected _resetRequiredAttributes() {
		this._attributesDict.clear();
	}
	protected _checkRequiredReadAttributes<T extends CoreObjectType>(object: ObjectContent<T>) {
		// no need to check if there are no points in the geometry
		const entitiesCount = this.entitiesCount(object);
		if (entitiesCount == 0) {
			return;
		}
		const entityClass = this.entityClass(object);

		const readAttributesData = this._functionData?.attributesData.read;
		if (!readAttributesData) {
			return;
		}
		for (const attribData of readAttributesData) {
			const attribute = entityClass.attribute(object, attribData.attribName);
			if (!attribute) {
				const message = `attribute ${attribData.attribName} is missing`;
				this.states.error.set(message);
				throw message;
				return;
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
			const attribute = entityClass.attribute(object, attribName) as BufferAttribute;
			if (attribute) {
				attribNames.push(attribName);
				attributeByName.set(attribName, attribute);
				attribTypeByName.set(attribName, attribData.attribType);
			}
		}
		return {attribNames, attributeByName, attribTypeByName};
	}
	protected _checkRequiredWriteAttributes<T extends CoreObjectType>(object: ObjectContent<T>) {
		const writeAttributesData = this._functionData?.attributesData.write;
		if (!writeAttributesData) {
			return;
		}
		const entityClass = this.entityClass(object);
		for (const attribData of writeAttributesData) {
			let attribute = entityClass.attribute(object, attribData.attribName);
			const expectedAttribSize = JsConnectionPointComponentsCountMap[attribData.attribType];
			if (!attribute) {
				const pointsCount = entityClass.entitiesCount(object);
				const newArray: number[] = new Array(pointsCount * expectedAttribSize).fill(0);
				attribute = this._createAttribute(object, attribData.attribName, newArray, expectedAttribSize);
			}
			if (attribute.itemSize != expectedAttribSize) {
				this.states.error.set('attribute size mismatch');
			}
		}

		const attribNames: string[] = [];
		const attributeByName = new Map<string, EntityAttribute>();
		const attribTypeByName = new Map<string, JsConnectionPointType>();
		for (const attribData of writeAttributesData) {
			const attribName = attribData.attribName;
			const attribute: EntityAttribute | undefined = entityClass.attribute(object, attribName);
			if (attribute) {
				attribNames.push(attribName);
				attributeByName.set(attribName, attribute);
				attribTypeByName.set(attribName, attribData.attribType);
			}
		}
		return {attribNames, attributeByName, attribTypeByName};
	}
	protected _readRequiredAttributes(
		index: number,
		attribNames: string[],
		attributeByName: Map<string, BufferAttribute>,
		attribTypeByName: Map<string, JsConnectionPointType>
	) {
		for (const attribName of attribNames) {
			const attribute = attributeByName.get(attribName)!;
			const attribType = attribTypeByName.get(attribName)!;
			const variable = createVariable(attribType);
			if (!variable) {
				const attribValue = attribute.array[index * attribute.itemSize];
				this._attributesDict.set(attribName, attribValue);
			} else if (isVector(variable) || isColor(variable)) {
				variable.fromBufferAttribute(attribute, index);
				this._attributesDict.set(attribName, variable);
			}
		}
	}
	protected _writeRequiredAttributes(
		index: number,
		attribNames: string[],
		attributeByName: Map<string, BufferAttribute>
	) {
		for (const attribName of attribNames) {
			const attribute = attributeByName.get(attribName)!;
			const variable = this._attributesDict.get(attribName);
			if (isVector(variable) || isColor(variable)) {
				variable.toArray(attribute.array, index * attribute.itemSize);
			} else {
				if (isNumber(variable)) {
					(attribute.array as number[])[index] = variable;
				}
			}
		}
	}

	compileIfRequired() {
		if (this.assemblerController()?.compileRequired()) {
			this.compile();
		}
	}

	protected abstract _entityContainer: EntityContainer;
	private _paramConfigs: JsParamConfig<ParamType>[] = [];
	private _functionData: EntityBuilderFunctionData | undefined;
	private _functionCreationArgs: string[] = [];
	private _functionEvalArgs: (EntityContainer | Function | RegisterableVariable | AttributesDict)[] = [];
	private _function: EntityFunction | undefined;
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
		// if (outputNodes.length == 0) {
		// 	this.states.error.set('one output node is required');
		// 	return;
		// }
		if (outputNodes.length > 1) {
			this.states.error.set('only one output node allowed');
			return;
		}
		// const outputNode = outputNodes[0];
		// if (outputNode) {
		const paramNodes = JsNodeFinder.findParamGeneratingNodes(this);
		const attributeExportNodes = JsNodeFinder.findAttributeExportNodes(this);
		const rootNodes = outputNodes.concat(paramNodes).concat(attributeExportNodes);
		if (rootNodes.length == 0) {
			this.states.error.set('at least one output, param or attribute node is required');
			return;
		}
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
		// }

		assemblerController.post_compile();
	}
	updateFromFunctionData(functionData: EntityBuilderFunctionData) {
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
			EntityBuilderAssemblerConstant.ENTITY_CONTAINER,
			'_setErrorFromError',
			...variableNames,
			...functionNames,
			EntityBuilderAssemblerConstant.ATTRIBUTES_DICT,
			...paramConfigNames,
			wrappedBody,
		];
		this._functionEvalArgs = [
			this._entityContainer,
			_setErrorFromError,
			...variables,
			...functions,
			this._attributesDict,
			// paramConfigs are added dynamically during cook
		];
		try {
			this._function = new Function(...this._functionCreationArgs) as EntityFunction;
		} catch (e) {
			console.warn(e);
			this.states.error.set('failed to compile');
		}
	}

	functionEvalArgsWithParamConfigs() {
		const list: Array<EntityContainer | Function | RegisterableVariable | number | boolean | AttributesDict> = [
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

	setEntity(attribClass: AvailableEntity) {
		this.p.entity.set(AVAILABLE_ENTITIES.indexOf(attribClass));
	}
	entity(): AvailableEntity {
		return AVAILABLE_ENTITIES[this.pv.entity];
	}
	entitiesCount(object: ObjectContent<CoreObjectType>): number {
		const entity = this.entity();
		switch (entity) {
			case AttribClass.POINT: {
				return pointsCountFromObject(object);
			}
			case AttribClass.VERTEX: {
				return verticesCountFromObject(object);
			}
			case AttribClass.PRIMITIVE: {
				return primitivesCountFromObject(object);
			}
		}
	}
	entityClass(
		object: ObjectContent<CoreObjectType>
	): typeof CorePoint<CoreObjectType> | typeof CoreVertex<CoreObjectType> | typeof CorePrimitive<CoreObjectType> {
		const entity = this.entity();
		switch (entity) {
			case AttribClass.POINT: {
				return corePointClassFactory(object);
			}
			case AttribClass.VERTEX: {
				return coreVertexClassFactory(object);
			}
			case AttribClass.PRIMITIVE: {
				return corePrimitiveClassFactory(object);
			}
		}
	}
	private _createAttribute(
		object: ObjectContent<CoreObjectType>,
		attribName: string,
		values: number[],
		attribSize: number
	) {
		const entity = this.entity();
		switch (entity) {
			case AttribClass.POINT: {
				const attribute = new BufferAttribute(new Float32Array(values), attribSize);
				corePointClassFactory(object).addAttribute(object, attribName, attribute);
				return attribute;
			}
			case AttribClass.VERTEX: {
				const attribute: BaseVertexAttribute = {
					isString: false,
					itemSize: attribSize,
					array: values,
				};
				coreVertexClassFactory(object).addAttribute(object, attribName, attribute);
				return attribute;
			}
			case AttribClass.PRIMITIVE: {
				const attribute: BasePrimitiveAttribute = {
					isString: false,
					itemSize: attribSize,
					array: values,
				};
				corePrimitiveClassFactory(object).addAttribute(object, attribName, attribute);
				return attribute;
			}
		}
	}
}
