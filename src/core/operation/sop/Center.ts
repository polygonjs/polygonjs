import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';
import {Vector3} from 'three/src/math/Vector3';
import {ObjectType} from '../../geometry/Constant';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {BufferAttribute} from 'three/src/core/BufferAttribute';
import {BufferGeometry} from 'three/src/core/BufferGeometry';

interface CenterSopParams extends DefaultOperationParams {}

export class CenterSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: CenterSopParams = {};
	static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static type(): Readonly<'center'> {
		return 'center';
	}

	private _geo_center: Vector3 = new Vector3();
	cook(input_contents: CoreGroup[], params: CenterSopParams) {
		const core_group = input_contents[0];
		const src_object = core_group.objects_with_geo()[0];

		const new_object = this._create_object(src_object);
		if (new_object) {
			return this.create_core_group_from_objects([new_object]);
		} else {
			return this.create_core_group_from_objects([]);
		}
	}
	private _create_object(src_object: Object3DWithGeometry) {
		const src_geometry = src_object.geometry;
		src_geometry.computeBoundingBox();
		if (src_geometry.boundingBox) {
			src_geometry.boundingBox?.getCenter(this._geo_center);
			src_object.updateMatrixWorld();
			this._geo_center.applyMatrix4(src_object.matrixWorld);
			const geometry = new BufferGeometry();
			const positions: number[] = this._geo_center.toArray();
			geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
			return this.create_object(geometry, ObjectType.POINTS);
		}
	}
}
