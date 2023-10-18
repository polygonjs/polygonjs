import {TypeAssert} from './../../poly/Assert';
import {AttribClass, ATTRIBUTE_CLASSES_WITHOUT_CORE_GROUP} from './../../../core/geometry/Constant';
import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
// import {Attribute} from '../../../core/geometry/Attribute';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {BufferAttribute} from 'three';
import {isBooleanTrue} from '../../../core/Type';
// import {BaseCoreObject} from '../../../core/geometry/entities/object/BaseCoreObject';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';
import {CoreEntity} from '../../../core/geometry/CoreEntity';
import {
	corePointClassFactory,
	corePrimitiveClassFactory,
	coreVertexClassFactory,
} from '../../../core/geometry/CoreObjectFactory';
import {PrimitiveNumberAttribute} from '../../../core/geometry/entities/primitive/PrimitiveAttribute';
import {primitivesFromObject} from '../../../core/geometry/entities/primitive/CorePrimitiveUtils';
import {CorePoint} from '../../../core/geometry/entities/point/CorePoint';
import {CorePrimitive} from '../../../core/geometry/entities/primitive/CorePrimitive';
import {pointsFromObject} from '../../../core/geometry/entities/point/CorePointUtils';
import {CoreVertex} from '../../../core/geometry/entities/vertex/CoreVertex';
import {verticesFromObject} from '../../../core/geometry/entities/vertex/CoreVertexUtils';
import {VertexNumberAttribute} from '../../../core/geometry/entities/vertex/VertexAttribute';

interface AttribIdSopParams extends DefaultOperationParams {
	class: number;
	id: boolean;
	idName: string;
	idn: boolean;
	idnName: string;
}
const _points: CorePoint<CoreObjectType>[] = [];
const _vertices: CoreVertex<CoreObjectType>[] = [];
const _primitives: CorePrimitive<CoreObjectType>[] = [];

export class AttribIdSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: AttribIdSopParams = {
		class: ATTRIBUTE_CLASSES_WITHOUT_CORE_GROUP.indexOf(AttribClass.POINT),
		id: true,
		idName: 'id',
		idn: true,
		idnName: 'idn',
	};
	static override type(): Readonly<'attribId'> {
		return 'attribId';
	}

	override cook(inputCoreGroups: CoreGroup[], params: AttribIdSopParams) {
		const coreGroup = inputCoreGroups[0];

		const attribClass = ATTRIBUTE_CLASSES_WITHOUT_CORE_GROUP[params.class];
		this._addAttribute(attribClass, coreGroup, params);
		return coreGroup;
	}
	private async _addAttribute(attribClass: AttribClass, coreGroup: CoreGroup, params: AttribIdSopParams) {
		const objects = coreGroup.allObjects();
		switch (attribClass) {
			case AttribClass.POINT:
				return this._addPointAttributesToObjects(objects, params);
			case AttribClass.VERTEX: {
				this._addVertexAttributesToObjects(objects, params);
				return;
			}
			case AttribClass.PRIMITIVE: {
				this._addPrimitiveAttributesToObjects(objects, params);
				return;
			}

			case AttribClass.OBJECT:
				return this._addAttributesToEntities(coreGroup.allCoreObjects(), params);
			case AttribClass.CORE_GROUP:
				// no effect
				return;
		}
		TypeAssert.unreachable(attribClass);
	}

	// private _addObjectAttributes(coreObjects: BaseCoreObject<CoreObjectType>[], params: AttribIdSopParams) {
	// 	const objectsCount = coreObjects.length;
	// 	if (objectsCount > 1) {
	// 		let i = 0;
	// 		for (const coreObject of coreObjects) {
	// 			if (isBooleanTrue(params.id)) {
	// 				coreObject.addAttribute(params.idName, i);
	// 			}
	// 			if (isBooleanTrue(params.idn)) {
	// 				coreObject.addAttribute(params.idnName, i / (objectsCount - 1));
	// 			}

	// 			i++;
	// 		}
	// 	} else {
	// 		coreObjects[0].addAttribute(params.idName, 0);
	// 		coreObjects[0].addAttribute(params.idnName, 0);
	// 	}
	// }

	private _addPointAttributesToObjects(objects: ObjectContent<CoreObjectType>[], params: AttribIdSopParams) {
		for (const object of objects) {
			this._addPointAttributesToObject(object, params);
		}
	}
	private _addVertexAttributesToObjects(objects: ObjectContent<CoreObjectType>[], params: AttribIdSopParams) {
		for (const object of objects) {
			this._addVertexAttributes(object, params);
		}
	}
	private _addPrimitiveAttributesToObjects(objects: ObjectContent<CoreObjectType>[], params: AttribIdSopParams) {
		for (const object of objects) {
			this._addPrimitiveAttributes(object, params);
		}
	}

	private _addPointAttributesToObject(object: ObjectContent<CoreObjectType>, params: AttribIdSopParams) {
		const pointClass = corePointClassFactory(object);
		pointsFromObject(object, _points);
		const entitiesCount = _points.length;

		if (isBooleanTrue(params.id)) {
			const idValues = new Array(entitiesCount);
			for (let i = 0; i < entitiesCount; i++) {
				idValues[i] = i;
			}
			const idArray = new Float32Array(idValues);
			const attrib = new BufferAttribute(idArray, 1);
			pointClass.addAttribute(object, params.idName, attrib);
		}
		if (isBooleanTrue(params.idn)) {
			const idnValues = new Array(entitiesCount);
			const pointsCountMinus1 = entitiesCount - 1;
			if (pointsCountMinus1 == 0) {
				for (let i = 0; i < entitiesCount; i++) {
					idnValues[i] = 0;
				}
			} else {
				for (let i = 0; i < entitiesCount; i++) {
					idnValues[i] = i / (entitiesCount - 1);
				}
			}
			const idnArray = new Float32Array(idnValues);
			const attrib = new BufferAttribute(idnArray, 1);
			pointClass.addAttribute(object, params.idnName, attrib);
		}
	}
	private _addVertexAttributes(object: ObjectContent<CoreObjectType>, params: AttribIdSopParams) {
		const vertexClass = coreVertexClassFactory(object);
		verticesFromObject(object, _vertices);
		if (isBooleanTrue(params.id)) {
			const attribute: VertexNumberAttribute = {
				isString: false,
				array: new Array(_vertices.length),
				itemSize: 1,
			};
			vertexClass.addAttribute(object, params.idName, attribute);
		}
		if (isBooleanTrue(params.idn)) {
			const attribute: VertexNumberAttribute = {
				isString: false,
				array: new Array(_vertices.length),
				itemSize: 1,
			};
			vertexClass.addAttribute(object, params.idnName, attribute);
		}
		this._addAttributesToEntities(_vertices, params);
	}
	private _addPrimitiveAttributes(object: ObjectContent<CoreObjectType>, params: AttribIdSopParams) {
		const primitiveClass = corePrimitiveClassFactory(object);
		primitivesFromObject(object, _primitives);
		if (isBooleanTrue(params.id)) {
			const attribute: PrimitiveNumberAttribute = {
				isString: false,
				array: new Array(_primitives.length),
				itemSize: 1,
			};
			primitiveClass.addAttribute(object, params.idName, attribute);
		}
		if (isBooleanTrue(params.idn)) {
			const attribute: PrimitiveNumberAttribute = {
				isString: false,
				array: new Array(_primitives.length),
				itemSize: 1,
			};
			primitiveClass.addAttribute(object, params.idnName, attribute);
		}
		this._addAttributesToEntities(_primitives, params);
	}

	private _addAttributesToEntities(entities: CoreEntity[], params: AttribIdSopParams) {
		const entitiesCount = entities.length;
		if (isBooleanTrue(params.id)) {
			let i = 0;
			for (const entity of entities) {
				entity.setAttribValue(params.idName, i);
				i++;
			}
		}
		if (isBooleanTrue(params.idn)) {
			const pointsCountMinus1 = entitiesCount - 1;
			if (pointsCountMinus1 == 0) {
				let i = 0;
				for (const entity of entities) {
					entity.setAttribValue(params.idnName, 0);
					i++;
				}
			} else {
				let i = 0;
				for (const entity of entities) {
					entity.setAttribValue(params.idnName, i / (entitiesCount - 1));
					i++;
				}
			}
		}
	}
}
