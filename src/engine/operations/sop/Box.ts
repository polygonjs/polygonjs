import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Vector3} from 'three';
import {CoreTransform} from '../../../core/Transform';
import {BoxBufferGeometry} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';

interface BoxSopParams extends DefaultOperationParams {
	sizes: Vector3;
	size: number;
	divisions: number;
	center: Vector3;
}

export class BoxSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: BoxSopParams = {
		sizes: new Vector3(1, 1, 1),
		size: 1,
		divisions: 1,
		center: new Vector3(0, 0, 0),
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'box'> {
		return 'box';
	}
	private _core_transform = new CoreTransform();
	override cook(inputCoreGroups: CoreGroup[], params: BoxSopParams) {
		const inputCoreGroup = inputCoreGroups[0];
		const geometry = inputCoreGroup ? this._cookWithInput(inputCoreGroup, params) : this._cookWithoutInput(params);

		return this.createCoreGroupFromGeometry(geometry);
	}
	private _cookWithoutInput(params: BoxSopParams) {
		const {divisions, size, sizes} = params;
		const geometry = new BoxBufferGeometry(
			size * sizes.x,
			size * sizes.y,
			size * sizes.z,
			divisions,
			divisions,
			divisions
		);
		geometry.translate(params.center.x, params.center.y, params.center.z);
		geometry.computeVertexNormals();
		return geometry;
	}

	private _cookWithInput(core_group: CoreGroup, params: BoxSopParams) {
		const divisions = params.divisions;

		const bbox = core_group.boundingBox();
		const size = bbox.max.clone().sub(bbox.min);
		const center = bbox.max.clone().add(bbox.min).multiplyScalar(0.5);

		const geometry = new BoxBufferGeometry(size.x, size.y, size.z, divisions, divisions, divisions);
		const matrix = this._core_transform.translationMatrix(center);
		geometry.applyMatrix4(matrix);
		return geometry;
	}
}
