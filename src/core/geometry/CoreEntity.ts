import {AttribValue, Constructor, NumericAttribValue} from '../../types/GlobalTypes';
import {Vector2, Vector3, Vector4} from 'three';
import {CoreObjectType, ObjectBuilder, ObjectContent} from './ObjectContent';
import {AttribClass} from './Constant';
import type {CoreGroup} from './Group';
import {TraversedRelatedEntityData} from './entities/utils/TraversedRelatedEntities';
import {TypeAssert} from '../../engine/poly/Assert';

const _relatedPointIds: number[] = [];
const _relatedVertexIds: number[] = [];
const _relatedPrimitiveIds: number[] = [];

export abstract class CoreEntity {
	protected _index: number = 0;
	constructor(content?: any, index?: number) {
		if (index != null) {
			this._index = index;
		}
	}

	index() {
		return this._index;
	}
	setIndex(index: number) {
		this._index = index;
		return this;
	}

	abstract geometry(): any;
	abstract builder<T extends CoreObjectType>(): ObjectBuilder<T> | undefined;
	abstract setAttribValue(attribName: string, attribValue: NumericAttribValue | string): void;
	abstract attribValue(attribName: string, target?: Vector2 | Vector3 | Vector4): AttribValue | undefined;
	abstract stringAttribValue(attribName: string): string | null;
	abstract position(target: Vector3): Vector3;
	abstract relatedEntities(
		attribClass: AttribClass,
		coreGroup: CoreGroup,
		target: CoreEntity[],
		traversedRelatedEntityData?: TraversedRelatedEntityData
	): void;
}

export abstract class CoreEntityWithObject<T extends CoreObjectType> extends CoreEntity {
	protected _object: ObjectContent<T>;
	constructor(object: ObjectContent<T>, index?: number) {
		super(object, index);
		this._object = object;
	}
	object() {
		return this._object;
	}

	static relatedPrimitiveIds<T extends CoreObjectType>(
		object: ObjectContent<T>,
		index: number,
		target: number[],
		traversedRelatedEntityData?: TraversedRelatedEntityData
	): void {
		target.length = 0;
	}
	static relatedVertexIds<T extends CoreObjectType>(
		object: ObjectContent<T>,
		index: number,
		target: number[],
		traversedRelatedEntityData?: TraversedRelatedEntityData
	): void {
		target.length = 0;
	}
	static relatedPointIds<T extends CoreObjectType>(
		object: ObjectContent<T>,
		index: number,
		target: number[],
		traversedRelatedEntityData?: TraversedRelatedEntityData
	): void {
		target.length = 0;
	}

	relatedPrimitiveIds(target: number[], traversedRelatedEntityData?: TraversedRelatedEntityData): void {
		(this.constructor as typeof CoreEntityWithObject).relatedPrimitiveIds(
			this._object,
			this._index,
			target,
			traversedRelatedEntityData
		);
	}
	relatedVertexIds(target: number[], traversedRelatedEntityData?: TraversedRelatedEntityData): void {
		(this.constructor as typeof CoreEntityWithObject).relatedVertexIds(
			this._object,
			this._index,
			target,
			traversedRelatedEntityData
		);
	}
	relatedPointIds(target: number[], traversedRelatedEntityData?: TraversedRelatedEntityData): void {
		(this.constructor as typeof CoreEntityWithObject).relatedPointIds(
			this._object,
			this._index,
			target,
			traversedRelatedEntityData
		);
	}
	static relatedPointClass<T extends CoreObjectType>(object: ObjectContent<T>): typeof CoreEntityWithObject<T> {
		return this.constructor as typeof CoreEntityWithObject<T>;
	}
	static relatedVertexClass<T extends CoreObjectType>(object: ObjectContent<T>): typeof CoreEntityWithObject<T> {
		return this.constructor as typeof CoreEntityWithObject<T>;
	}
	static relatedPrimitiveClass<T extends CoreObjectType>(object: ObjectContent<T>): typeof CoreEntityWithObject<T> {
		return this.constructor as typeof CoreEntityWithObject<T>;
	}
	static relatedObjectClass<T extends CoreObjectType>(object: ObjectContent<T>): typeof CoreEntityWithObject<T> {
		return this.constructor as typeof CoreEntityWithObject<T>;
	}
	static relatedEntityClass<T extends CoreObjectType>(
		object: ObjectContent<T>,
		entityClass: AttribClass.POINT | AttribClass.VERTEX | AttribClass.PRIMITIVE | AttribClass.OBJECT
	): typeof CoreEntityWithObject<T> {
		switch (entityClass) {
			case AttribClass.POINT: {
				return this.relatedPointClass(object);
			}
			case AttribClass.VERTEX: {
				return this.relatedVertexClass(object);
			}
			case AttribClass.PRIMITIVE: {
				return this.relatedPrimitiveClass(object);
			}
			case AttribClass.OBJECT: {
				return this.relatedObjectClass(object);
			}
		}
		TypeAssert.unreachable(entityClass);
	}
	//
	static relatedPoints<T extends CoreObjectType>(
		object: ObjectContent<T>,
		entityIndex: number,
		target: CoreEntityWithObject<T>[],
		traversedRelatedEntityData?: TraversedRelatedEntityData
	): void {
		this.relatedPointIds(object, entityIndex, _relatedPointIds, traversedRelatedEntityData);
		target.length = _relatedPointIds.length;
		let i = 0;
		const entityClass = this.relatedPointClass(object) as any as Constructor<CoreEntityWithObject<T>>;
		for (const id of _relatedPointIds) {
			target[i] = new entityClass(object, id);
			i++;
		}
	}
	static relatedVertices<T extends CoreObjectType>(
		object: ObjectContent<T>,
		entityIndex: number,
		target: CoreEntityWithObject<T>[],
		traversedRelatedEntityData?: TraversedRelatedEntityData
	): void {
		this.relatedVertexIds(object, entityIndex, _relatedVertexIds, traversedRelatedEntityData);
		target.length = _relatedVertexIds.length;
		let i = 0;
		const entityClass = this.relatedVertexClass(object) as any as Constructor<CoreEntityWithObject<T>>;
		for (const id of _relatedVertexIds) {
			target[i] = new entityClass(object, id);
			i++;
		}
	}
	static relatedPrimitives<T extends CoreObjectType>(
		object: ObjectContent<T>,
		entityIndex: number,
		target: CoreEntityWithObject<T>[],
		traversedRelatedEntityData?: TraversedRelatedEntityData
	): void {
		this.relatedPrimitiveIds(object, entityIndex, _relatedPrimitiveIds, traversedRelatedEntityData);
		target.length = _relatedPrimitiveIds.length;
		let i = 0;
		const entityClass = this.relatedPrimitiveClass(object) as any as Constructor<CoreEntityWithObject<T>>;
		for (const id of _relatedPrimitiveIds) {
			target[i] = new entityClass(object, id);
			i++;
		}
	}
	static relatedObjects<T extends CoreObjectType>(
		object: ObjectContent<T>,
		entityIndex: number,
		target: CoreEntityWithObject<T>[],
		traversedRelatedEntityData?: TraversedRelatedEntityData
	): void {
		target.length = 1;
		const entityClass = this.relatedObjectClass(object) as any as Constructor<CoreEntityWithObject<T>>;
		target[0] = new entityClass(object);
	}
	relatedPoints(target: CoreEntityWithObject<T>[], traversedRelatedEntityData?: TraversedRelatedEntityData): void {
		(this.constructor as typeof CoreEntityWithObject<T>).relatedPoints(
			this._object,
			this._index,
			target,
			traversedRelatedEntityData
		);
	}
	relatedVertices(target: CoreEntityWithObject<T>[], traversedRelatedEntityData?: TraversedRelatedEntityData): void {
		(this.constructor as typeof CoreEntityWithObject<T>).relatedVertices(
			this._object,
			this._index,
			target,
			traversedRelatedEntityData
		);
	}
	relatedPrimitives(
		target: CoreEntityWithObject<T>[],
		traversedRelatedEntityData?: TraversedRelatedEntityData
	): void {
		(this.constructor as typeof CoreEntityWithObject<T>).relatedPrimitives(
			this._object,
			this._index,
			target,
			traversedRelatedEntityData
		);
	}
	relatedObjects(target: CoreEntityWithObject<T>[], traversedRelatedEntityData?: TraversedRelatedEntityData): void {
		(this.constructor as typeof CoreEntityWithObject<T>).relatedObjects(
			this._object,
			this._index,
			target,
			traversedRelatedEntityData
		);
	}
}
