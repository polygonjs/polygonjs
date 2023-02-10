import {Mesh, Object3D, Vector3, Raycaster} from 'three';
import {_getRBD} from '../PhysicsRBD';
import {PhysicsLib} from '../CorePhysics';
import {ThreeMeshBVHHelper} from '../../../engine/operations/sop/utils/Bvh/ThreeMeshBVHHelper';
import {CoreMath} from '../../math/_Module';
import {CorePhysicsAttribute} from '../PhysicsAttribute';

const bboxSize = new Vector3();
const bboxCenter = new Vector3();
const scale = new Vector3();
function _createRaycaster() {
	const raycaster = new Raycaster();
	ThreeMeshBVHHelper.updateRaycaster(raycaster);
	return raycaster;
}
const raycaster = _createRaycaster();
export function createPhysicsHeightField(PhysicsLib: PhysicsLib, object: Object3D) {
	const geometry = (object as Mesh).geometry;
	if (!geometry) {
		return;
	}

	ThreeMeshBVHHelper.assignDefaultBVHIfNone(object as Mesh);
	geometry.computeBoundingBox();
	const boundingBox = geometry.boundingBox;
	if (!boundingBox) {
		return;
	}
	boundingBox.getSize(bboxSize);
	boundingBox.getCenter(bboxCenter);

	const nrows = CorePhysicsAttribute.getHeightFieldRows(object);
	const ncols = CorePhysicsAttribute.getHeightFieldCols(object);
	const arraySize = (nrows + 1) * (ncols + 1);
	const array = new Array(arraySize);
	raycaster.ray.direction.set(0, -1, 0);
	raycaster.ray.origin.y = boundingBox.max.y + 1;
	let i = 0;
	const maxMult = 0.99;
	const minMult = 1 - maxMult;
	for (let col = 0; col <= ncols; col++) {
		const coln = CoreMath.clamp(col / ncols, minMult, maxMult);
		for (let row = 0; row <= nrows; row++) {
			const rown = CoreMath.clamp(row / nrows, minMult, maxMult);
			raycaster.ray.origin.x = boundingBox.min.x + bboxSize.x * coln;
			raycaster.ray.origin.z = boundingBox.min.z + bboxSize.z * rown;
			const intersections = raycaster.intersectObject(object);
			let value = boundingBox.min.y;
			if (intersections) {
				const firstIntersect = intersections[0];
				if (firstIntersect) {
					value = raycaster.ray.origin.y - firstIntersect.distance;
				}
			}
			array[i] = value;
			i++;
		}
	}
	const heights = new Float32Array(array);
	scale.set(bboxSize.x, 1, bboxSize.z);

	const desc = PhysicsLib.ColliderDesc.heightfield(nrows, ncols, heights, scale);
	desc.setTranslation(bboxCenter.x, 0, bboxCenter.z);
	return desc;
}
