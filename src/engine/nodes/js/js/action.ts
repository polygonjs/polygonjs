// import {Object3D, Quaternion, Vector3} from 'three';
// import {CoreLookAt} from '../../../../core/LookAt';
// import {isBooleanTrue} from '../../../../core/Type';
// import {ObjectNamedFunction3, ObjectNamedFunction4, ObjectNamedFunction5} from '../code/assemblers/NamedFunction';

// export class setObjectPosition extends ObjectNamedFunction3<[Vector3, number, boolean]> {
// 	type = 'setObjectPosition';
// 	func(object3D: Object3D, position: Vector3, lerp: number, updateMatrix: boolean): void {
// 		console.log(object3D, object3D.position.toArray(), position.toArray());
// 		if (lerp >= 1) {
// 			object3D.position.copy(position);
// 		} else {
// 			object3D.position.lerp(position, lerp);
// 		}
// 		console.log(object3D.position.toArray());
// 		if (updateMatrix) {
// 			object3D.updateMatrix();
// 		}
// 	}
// }

// const _scale = new Vector3();
// export class setObjectScale extends ObjectNamedFunction4<[Vector3, number, number, boolean]> {
// 	type = 'setObjectScale';
// 	func(object3D: Object3D, scale: Vector3, mult: number, lerp: number, updateMatrix: boolean): void {
// 		if (lerp >= 1) {
// 			object3D.scale.copy(scale).multiplyScalar(mult);
// 		} else {
// 			_scale.copy(scale).multiplyScalar(mult);
// 			object3D.scale.lerp(_scale, lerp);
// 		}
// 		if (updateMatrix) {
// 			object3D.updateMatrix();
// 		}
// 	}
// }

// const q1 = new Quaternion();
// const q2 = new Quaternion();
// export class setObjectLookAt extends ObjectNamedFunction5<[Vector3, Vector3, number, boolean, boolean]> {
// 	type = 'setObjectLookAt';
// 	func(
// 		object3D: Object3D,
// 		targetPosition: Vector3,
// 		up: Vector3,
// 		lerp: number,
// 		invertDirection: boolean,
// 		updateMatrix: boolean
// 	): void {
// 		object3D.up.copy(up);

// 		if (lerp >= 1) {
// 			CoreLookAt.applyLookAt(object3D, targetPosition, invertDirection);
// 		} else {
// 			q1.copy(object3D.quaternion);
// 			CoreLookAt.applyLookAt(object3D, targetPosition, invertDirection);
// 			q2.copy(object3D.quaternion);
// 			q1.slerp(q2, lerp);
// 			object3D.quaternion.copy(q1);
// 		}

// 		if (isBooleanTrue(updateMatrix)) {
// 			object3D.updateMatrix();
// 		}
// 	}
// }
