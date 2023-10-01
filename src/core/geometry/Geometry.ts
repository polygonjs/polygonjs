import {BufferGeometry} from 'three';
import {ObjectUtils} from '../ObjectUtils';

export function cloneBufferGeometry(srcGeometry: BufferGeometry): BufferGeometry {
	const clonedGeometry = srcGeometry.clone();
	if (srcGeometry.userData) {
		clonedGeometry.userData = ObjectUtils.cloneDeep(srcGeometry.userData);
	}
	return clonedGeometry;
}
