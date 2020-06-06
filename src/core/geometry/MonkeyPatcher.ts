// import {InterleavedBufferAttribute} from 'three/src/core/InterleavedBufferAttribute'

// export class MonkeyPatcher {
// 	// this allows cloning of geometries containing InterleavedBufferAttribute such as soldier.glb
// 	static patch(attribute: InterleavedBufferAttribute) {
// 		Object.assign(attribute, {
// 			clone: function() {
// 				return new InterleavedBufferAttribute(
// 					attribute.data.clone(),
// 					attribute.itemSize,
// 					attribute.offset,
// 					attribute.normalized
// 				)
// 			},
// 		})
// 	}
// }
