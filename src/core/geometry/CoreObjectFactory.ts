import type {CoreObjectType, ObjectContent} from './ObjectContent';
import {BaseCoreObject} from './_BaseObject';
import {object3DFactory} from './three/ThreeModule';
import {CoreVertex} from './vertex/CoreVertex';
import {CorePrimitive} from './primitive/CorePrimitive';

// vertex return types
type BaseCoreVertexInstance = CoreVertex<CoreObjectType>;
abstract class BaseCoreVertexClass extends CoreVertex<CoreObjectType> {}
type BaseCoreVertexClassClass = typeof BaseCoreVertexClass;
// primitive return types
type BaseCorePrimitiveInstance = CorePrimitive<CoreObjectType>;
abstract class BaseCorePrimitiveClass extends CorePrimitive<CoreObjectType> {}
type BaseCorePrimitiveClassClass = typeof BaseCorePrimitiveClass;
// object return types
type BaseCoreObjectInstance = BaseCoreObject<CoreObjectType>;
class BaseCoreObjectClass extends BaseCoreObject<CoreObjectType> {}
type BaseCoreObjectClassClass = typeof BaseCoreObjectClass;

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

// vertex creation methods
export function coreVertexClassFactory(object: ObjectContent<CoreObjectType>): BaseCoreVertexClassClass {
	for (let factoryFunction of coreFactoryFunctions) {
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
	for (let factoryFunction of coreFactoryFunctions) {
		const result = factoryFunction.vertexInstance(object, index);
		if (result) {
			return result as CoreVertex<T>;
		}
	}
	return object3DFactory.vertexInstance(object, index) as CoreVertex<T>;
}
// primitive creation methods
export function corePrimitiveClassFactory(object: ObjectContent<CoreObjectType>): BaseCorePrimitiveClassClass {
	for (let factoryFunction of coreFactoryFunctions) {
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
	for (let factoryFunction of coreFactoryFunctions) {
		const result = factoryFunction.primitiveInstance(object, index);
		if (result) {
			return result as CorePrimitive<T>;
		}
	}
	return object3DFactory.primitiveInstance(object, index) as CorePrimitive<T>;
}

// object creation methods
export function coreObjectFactory(object: ObjectContent<CoreObjectType>): BaseCoreObjectClassClass {
	for (let factoryFunction of coreFactoryFunctions) {
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
	for (let factoryFunction of coreFactoryFunctions) {
		const result = factoryFunction.objectInstance(object, index);
		if (result) {
			return result as BaseCoreObject<T>;
		}
	}
	return object3DFactory.objectInstance(object, index) as any as BaseCoreObject<T>;
	// return new CoreObject(object as Object3D, index) as any as BaseCoreObject<T>;
}
