import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Vector3} from 'three';
import {ObjectType} from '../../../core/geometry/Constant';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {BufferAttribute} from 'three';
import {BufferGeometry} from 'three';
import {DefaultOperationParams} from '../../../core/operations/_Base';

interface CenterSopParams extends DefaultOperationParams {}

export class CenterSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: CenterSopParams = {};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'center'> {
		return 'center';
	}

	private _geo_center: Vector3 = new Vector3();
	override cook(input_contents: CoreGroup[], params: CenterSopParams) {
		const core_group = input_contents[0];
		const src_objects = core_group.objectsWithGeo();

		const positions = new Array(src_objects.length * 3);
		positions.fill(0);
		for (let i = 0; i < src_objects.length; i++) {
			const src_object = src_objects[i];
			const src_geometry = src_object.geometry;
			src_geometry.computeBoundingBox();
			if (src_geometry.boundingBox) {
				src_geometry.boundingBox?.getCenter(this._geo_center);
				src_object.updateMatrixWorld();
				this._geo_center.applyMatrix4(src_object.matrixWorld);
				this._geo_center.toArray(positions, i * 3);
			}
		}
		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
		const object = this.createObject(geometry, ObjectType.POINTS);
		return this.createCoreGroupFromObjects([object]);
	}
}
