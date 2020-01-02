import {InterleavedBufferAttribute} from 'three/src/core/InterleavedBufferAttribute'
const THREE = {InterleavedBufferAttribute}

export class MonkeyPatcher {
	// this allows cloning of geometries containing InterleavedBufferAttribute such as soldier.glb
	static patch(attribute: THREE.InterleavedBufferAttribute) {
		Object.assign(attribute, 'clone', function() {
			return new THREE.InterleavedBufferAttribute(
				this.data.clone(),
				this.itemSize,
				this.offset,
				this.normalized
			)
		})
	}
}
