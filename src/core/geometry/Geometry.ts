import {BufferGeometry} from 'three';
import {objectCloneDeep} from '../ObjectUtils';

export function cloneBufferGeometry(srcGeometry: BufferGeometry): BufferGeometry {
	const clonedGeometry = srcGeometry.clone();
	if (srcGeometry.userData) {
		clonedGeometry.userData = objectCloneDeep(srcGeometry.userData);
	}
	return clonedGeometry;
}
