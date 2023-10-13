import {Object3D} from 'three';
import {objectContentCopyProperties} from '../../ObjectContent';
export function copyObject3DProperties(srcObject: Object3D, destObject: Object3D) {
	objectContentCopyProperties(srcObject, destObject);
	destObject.position.copy(srcObject.position);
	destObject.quaternion.copy(srcObject.quaternion);
	destObject.scale.copy(srcObject.scale);
	destObject.matrix.copy(srcObject.matrix);
}
