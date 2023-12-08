import {Vector3, BufferAttribute} from 'three';
import {ObjectGeometryMap, CoreObjectType, ObjectContent} from '../../ObjectContent';
import {CorePoint} from '../../entities/point/CorePoint';
import {PointAttributesDict} from '../../entities/point/Common';
import {QuadObject} from './QuadObject';
import {Attribute} from '../../Attribute';
import {attributeNumericValues, AttributeNumericValuesOptions} from '../../entities/utils/Common';
import {NumericAttribValue} from '../../../../types/GlobalTypes';
import {pointsCountFromObject} from '../../entities/point/CorePointUtils';
import {QuadVertex} from './QuadVertex';
import {QuadGeometry} from './QuadGeometry';
import {quadGraphFromQuadObject} from './graph/QuadGraphUtils';
import {QuadPrimitive} from './QuadPrimitive';
import {QuadNode} from './graph/QuadNode';
import {pushOnArrayAtEntry} from '../../../MapUtils';
import {TraversedRelatedEntityData} from '../../entities/utils/TraversedRelatedEntities';
import {CoreEntityWithObject} from '../../CoreEntity';
const target: AttributeNumericValuesOptions = {
	attributeAdded: false,
	values: [],
};
const _quadNodesByPointIndex: Map<number, QuadNode[]> = new Map();
const _n = new Vector3();
const _tmp = new Vector3();

export class QuadPoint extends CorePoint<CoreObjectType.QUAD> {
	protected _geometry?: ObjectGeometryMap[CoreObjectType.QUAD];
	protected override _object: QuadObject;
	constructor(object: QuadObject, index: number) {
		super(object, index);
		this._object = object;
		this._updateGeometry();
	}
	override object() {
		return this._object;
	}
	override setIndex(index: number, object?: QuadObject) {
		this._index = index;
		if (object) {
			this._object = object;
			this._updateGeometry();
		}
		return this;
	}
	private _updateGeometry() {
		const geometry = this._object.geometry;
		if (geometry) {
			this._geometry = geometry;
		}
	}
	geometry() {
		return this._geometry;
	}
	static override addAttribute<T extends CoreObjectType>(
		object: ObjectContent<T>,
		attribName: string,
		attribute: BufferAttribute
	) {
		const attributes = this.attributes(object);
		if (!attributes) {
			return;
		}
		attributes[attribName] = attribute;
	}
	static override addNumericAttribute<T extends CoreObjectType>(
		object: ObjectContent<T>,
		attribName: string,
		size: number = 1,
		defaultValue: NumericAttribValue = 0
	) {
		const geometry = (object as any as QuadObject).geometry;
		if (!geometry) {
			return;
		}
		attributeNumericValues(object, pointsCountFromObject, size, defaultValue, target);

		if (target.attributeAdded) {
			// if (markedAsInstance(geometry)) {
			// 	const valuesAsTypedArray = new Float32Array(target.values);
			// 	geometry.setAttribute(attribName.trim(), new InstancedBufferAttribute(valuesAsTypedArray, size));
			// } else {
			geometry.setAttribute(attribName.trim(), new BufferAttribute(new Float32Array(target.values), size));
			// }
		} else {
			console.warn(defaultValue);
			throw `QuadPoint.addNumericAttrib error: no other default value allowed for now (default given: ${defaultValue})`;
		}
	}
	static override attributes<T extends CoreObjectType>(object: ObjectContent<T>): PointAttributesDict | undefined {
		const geometry = (object as any as QuadObject).geometry;
		if (!geometry) {
			return;
		}
		return geometry.attributes;
	}
	static override entitiesCount<T extends CoreObjectType>(object: ObjectContent<T>): number {
		const positionAttribute = this.attribute(object, Attribute.POSITION);
		if (!positionAttribute) {
			return 0;
		}
		return positionAttribute.count;
	}
	static position<T extends CoreObjectType>(
		quadObject: ObjectContent<T> | undefined,
		pointIndex: number,
		target: Vector3
	): Vector3 {
		if (!(quadObject && quadObject.geometry)) {
			return target;
		}
		const attribute = (quadObject.geometry as QuadGeometry).attributes[Attribute.POSITION] as
			| BufferAttribute
			| undefined;
		if (!attribute) {
			return target;
		}
		return target.fromArray(attribute.array, pointIndex * 3);
	}
	override position(target: Vector3): Vector3 {
		return (this.constructor as typeof QuadPoint).position(this._object, this._index, target);
	}
	static normal<T extends CoreObjectType>(
		quadObject: ObjectContent<T> | undefined,
		pointIndex: number,
		target: Vector3
	): Vector3 {
		if (!(quadObject && quadObject.geometry)) {
			return target;
		}
		const attribute = (quadObject.geometry as QuadGeometry).attributes[Attribute.NORMAL] as
			| BufferAttribute
			| undefined;
		if (!attribute) {
			return target;
		}
		return target.fromArray(attribute.array, pointIndex * 3);
	}
	override normal(target: Vector3) {
		return (this.constructor as typeof QuadPoint).normal(this._object, this._index, target);
	}
	static override computeNormals<T extends CoreObjectType>(object: ObjectContent<T>) {
		if (!object.geometry) {
			return;
		}
		const graph = quadGraphFromQuadObject(object as any as QuadObject);
		const pointsCount = this.entitiesCount(object);
		const primitivesCount = QuadPrimitive.entitiesCount(object);
		_quadNodesByPointIndex.clear();
		for (let i = 0; i < primitivesCount; i++) {
			const quadNode = graph.quadNode(i);
			if (!quadNode) {
				continue;
			}
			const indices = quadNode.indices;
			for (const index of indices) {
				pushOnArrayAtEntry(_quadNodesByPointIndex, index, quadNode);
			}
		}
		const normals: number[] = new Array(pointsCount * 3);
		for (let i = 0; i < pointsCount; i++) {
			const quadNodes = _quadNodesByPointIndex.get(i);
			if (!quadNodes) {
				continue;
			}
			_n.set(0, 0, 0);
			for (const quadNode of quadNodes) {
				QuadPrimitive.normal(object, quadNode.id, _tmp);
				_n.add(_tmp);
			}
			_n.divideScalar(quadNodes.length);
			_n.toArray(normals, i * 3);
		}

		// set attribute
		const geometry = (object as any as QuadObject).geometry;
		const position = new BufferAttribute(new Float32Array(normals), 3);
		geometry.setAttribute(Attribute.NORMAL, position);
	}
	static override markAttribAsNeedsUpdate<T extends CoreObjectType>(object: ObjectContent<T>, attribName: string) {}

	//
	//
	//
	//
	//
	static override userDataAttribs<T extends CoreObjectType>(object: ObjectContent<T>) {
		return {};
	}
	static override setIndexedAttribute<T extends CoreObjectType>(
		object: ObjectContent<T>,
		attribName: string,
		values: string[],
		indices: number[]
	) {}
	static override attribValueIndex<T extends CoreObjectType>(
		object: ObjectContent<T>,
		index: number,
		attribName: string
	): number {
		return -1;
	}
	//
	//
	//
	//
	//

	//
	//
	// RELATED ENTITIES
	//
	//
	static override relatedVertexIds<T extends CoreObjectType>(
		object: ObjectContent<T>,
		pointIndex: number,
		target: number[],
		traversedRelatedEntityData?: TraversedRelatedEntityData
	): void {
		const geometry = (object as any as QuadObject).geometry as QuadGeometry | undefined;
		if (!geometry) {
			return;
		}
		const indexArray = geometry.index;
		let i = 0;
		for (const indexValue of indexArray) {
			if (indexValue == pointIndex) {
				target.push(i);
			}
			i++;
		}
	}
	static override relatedVertexClass<T extends CoreObjectType>(object: ObjectContent<T>) {
		return QuadVertex as any as typeof CoreEntityWithObject<T>;
	}
}
