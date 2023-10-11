import type {CoreObjectType, ObjectContent} from './ObjectContent';
import {object3DFactory} from './modules/three/ThreeModule';
import type {CorePoint} from './entities/point/CorePoint';
import type {CoreVertex} from './entities/vertex/CoreVertex';
import type {BaseCoreObject} from './entities/object/BaseCoreObject';
import type {CorePrimitive} from './entities/primitive/CorePrimitive';
import {AttribClass} from './Constant';

// point return types
type BaseCorePointInstance = CorePoint<CoreObjectType>;
type BaseCorePointClassClass = typeof CorePoint<CoreObjectType>;
// vertex return types
type BaseCoreVertexInstance = CoreVertex<CoreObjectType>;
type BaseCoreVertexClassClass = typeof CoreVertex<CoreObjectType>;
// primitive return types
type BaseCorePrimitiveInstance = CorePrimitive<CoreObjectType>;
type BaseCorePrimitiveClassClass = typeof CorePrimitive<CoreObjectType>;
// object return types
type BaseCoreObjectInstance = BaseCoreObject<CoreObjectType>;
type BaseCoreObjectClassClass = typeof BaseCoreObject<CoreObjectType>;

// point methods
export type CorePointClassFactoryCheckFunction = (
	object: ObjectContent<CoreObjectType>
) => BaseCorePointClassClass | undefined;
export type CorePointInstanceFactoryCheckFunction = (
	object: ObjectContent<CoreObjectType>,
	index: number
) => BaseCorePointInstance | undefined;
// vertex methods
export type CoreVertexClassFactoryCheckFunction = (
	object: ObjectContent<CoreObjectType>
) => BaseCoreVertexClassClass | undefined;
export type CoreVertexInstanceFactoryCheckFunction = (
	object: ObjectContent<CoreObjectType>,
	index: number
) => BaseCoreVertexInstance | undefined;
// primitive methods
export type CorePrimitiveClassFactoryCheckFunction = (
	object: ObjectContent<CoreObjectType>
) => BaseCorePrimitiveClassClass | undefined;
export type CorePrimitiveInstanceFactoryCheckFunction = (
	object: ObjectContent<CoreObjectType>,
	index: number
) => BaseCorePrimitiveInstance | undefined;
// object methods
export type CoreObjectClassFactoryCheckFunction = (
	object: ObjectContent<CoreObjectType>
) => BaseCoreObjectClassClass | undefined;
export type CoreObjectInstanceFactoryCheckFunction = (
	object: ObjectContent<CoreObjectType>,
	index: number
) => BaseCoreObjectInstance | undefined;

export interface CoreFactoryFunctions {
	// point
	pointClass: CorePointClassFactoryCheckFunction;
	pointInstance: CorePointInstanceFactoryCheckFunction;
	// vertex
	vertexClass: CoreVertexClassFactoryCheckFunction;
	vertexInstance: CoreVertexInstanceFactoryCheckFunction;
	// primitive
	primitiveClass: CorePrimitiveClassFactoryCheckFunction;
	primitiveInstance: CorePrimitiveInstanceFactoryCheckFunction;
	// object
	objectClass: CoreObjectClassFactoryCheckFunction;
	objectInstance: CoreObjectInstanceFactoryCheckFunction;
}

const coreFactoryFunctions: CoreFactoryFunctions[] = [object3DFactory];

export function registerFactoryFunctions(checkFunctions: CoreFactoryFunctions) {
	coreFactoryFunctions.push(checkFunctions);
}

// point creation methods
export function corePointClassFactory(object: ObjectContent<CoreObjectType>): BaseCorePointClassClass {
	for (const factoryFunction of coreFactoryFunctions) {
		const result = factoryFunction.pointClass(object);
		if (result) {
			return result;
		}
	}
	return object3DFactory.pointClass(object) as BaseCorePointClassClass;
}

export function corePointInstanceFactory<T extends CoreObjectType>(object: ObjectContent<T>, index = 0): CorePoint<T> {
	for (const factoryFunction of coreFactoryFunctions) {
		const result = factoryFunction.pointInstance(object, index);
		if (result) {
			return result as CorePoint<T>;
		}
	}
	return object3DFactory.pointInstance(object, index) as CorePoint<T>;
}
// vertex creation methods
export function coreVertexClassFactory(object: ObjectContent<CoreObjectType>): BaseCoreVertexClassClass {
	for (const factoryFunction of coreFactoryFunctions) {
		const result = factoryFunction.vertexClass(object);
		if (result) {
			return result;
		}
	}
	return object3DFactory.vertexClass(object) as BaseCoreVertexClassClass;
}

export function coreVertexInstanceFactory<T extends CoreObjectType>(
	object: ObjectContent<T>,
	index = 0
): CoreVertex<T> {
	for (const factoryFunction of coreFactoryFunctions) {
		const result = factoryFunction.vertexInstance(object, index);
		if (result) {
			return result as CoreVertex<T>;
		}
	}
	return object3DFactory.vertexInstance(object, index) as CoreVertex<T>;
}
// primitive creation methods
export function corePrimitiveClassFactory(object: ObjectContent<CoreObjectType>): BaseCorePrimitiveClassClass {
	for (const factoryFunction of coreFactoryFunctions) {
		const result = factoryFunction.primitiveClass(object);
		if (result) {
			return result;
		}
	}
	return object3DFactory.primitiveClass(object) as BaseCorePrimitiveClassClass;
}

export function corePrimitiveInstanceFactory<T extends CoreObjectType>(
	object: ObjectContent<T>,
	index = 0
): CorePrimitive<T> {
	for (const factoryFunction of coreFactoryFunctions) {
		const result = factoryFunction.primitiveInstance(object, index);
		if (result) {
			return result as CorePrimitive<T>;
		}
	}
	return object3DFactory.primitiveInstance(object, index) as CorePrimitive<T>;
}

// object creation methods
export function coreObjectClassFactory(object: ObjectContent<CoreObjectType>): BaseCoreObjectClassClass {
	for (const factoryFunction of coreFactoryFunctions) {
		const result = factoryFunction.objectClass(object);
		if (result) {
			return result;
		}
	}
	return object3DFactory.objectClass(object) as BaseCoreObjectClassClass;
}

export function coreObjectInstanceFactory<T extends CoreObjectType>(
	object: ObjectContent<T>,
	index = 0
): BaseCoreObject<T> {
	for (const factoryFunction of coreFactoryFunctions) {
		const result = factoryFunction.objectInstance(object, index);
		if (result) {
			return result as BaseCoreObject<T>;
		}
	}
	return object3DFactory.objectInstance(object, index) as any as BaseCoreObject<T>;
	// return new CoreObject(object as Object3D, index) as any as BaseCoreObject<T>;
}

export const ENTITY_CLASS_FACTORY = {
	[AttribClass.POINT]: corePointClassFactory,
	[AttribClass.VERTEX]: coreVertexClassFactory,
	[AttribClass.PRIMITIVE]: corePrimitiveClassFactory,
	[AttribClass.OBJECT]: coreObjectClassFactory,
	[AttribClass.CORE_GROUP]: null,
};
export const ENTITY_INSTANCE_FACTORY = {
	[AttribClass.POINT]: corePointInstanceFactory,
	[AttribClass.VERTEX]: coreVertexInstanceFactory,
	[AttribClass.PRIMITIVE]: corePrimitiveInstanceFactory,
	[AttribClass.OBJECT]: coreObjectInstanceFactory,
	[AttribClass.CORE_GROUP]: null,
};
