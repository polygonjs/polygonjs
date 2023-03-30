// import {Vector2, Vector3, Vector4} from 'three';
// import {NamedFunction2} from './_Base';

// type MathFunctionName='abs'|'acos'|'sin'

// type AvailableItem = Vector2 | Vector3 | Vector4;
// type AvailableItemClass = typeof Vector2 | typeof Vector3 | typeof Vector4;
// function MathVectorNArg1Factory(vectorClass: AvailableItemClass, functionName:MathFunctionName){
// 	const mathFunction = Math[functionName]

// 	function funcVector2(src:Vector2,dest:Vector2): Vector2 {
// 		dest.x = mathFunction(src.x)
// 		dest.y = mathFunction(src.y)
// 		return dest
// 	}
// 	function funcVector3(src:Vector3,dest:Vector3): Vector3 {
// 		dest.x = mathFunction(src.x)
// 		dest.y = mathFunction(src.y)
// 		dest.z = mathFunction(src.z)
// 		return dest
// 	}
// 	function funcVector4(src:Vector4,dest:Vector4): Vector4 {
// 		dest.x = mathFunction(src.x)
// 		dest.y = mathFunction(src.y)
// 		dest.z = mathFunction(src.z)
// 		dest.w = mathFunction(src.w)
// 		return dest
// 	}

// 	return class MathVectorNArg1<V extends AvailableItem> extends NamedFunction2<[V,V]> {
// 		static override type() {
// 			return functionName;
// 		}
// 		func = (vectorClass== Vector2 ? funcVector2 : vectorClass==Vector3 ? funcVector3:funcVector4) as any
// 	}

// }

// export const abs = MathVectorArg1Factory('abs')
// export const acos = MathVectorArg1Factory('acos')
// export const sin = MathVectorArg1Factory('sin')
