import {ObjectType} from './../../../core/geometry/Constant';
import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Vector3, BoxGeometry} from 'three';
import {CoreTransform} from '../../../core/Transform';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';

interface BoxSopParams extends DefaultOperationParams {
	sizes: Vector3;
	size: number;
	divisions: number;
	center: Vector3;
}

const _size = new Vector3();
const _center = new Vector3();

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
	private _coreTransform = new CoreTransform();
	override cook(inputCoreGroups: CoreGroup[], params: BoxSopParams) {
		const inputCoreGroup = inputCoreGroups[0];
		const geometry = inputCoreGroup ? this._cookWithInput(inputCoreGroup, params) : this._cookWithoutInput(params);

		const object = BaseSopOperation.createObject(geometry, ObjectType.MESH);
		if (this._node) {
			object.name = this._node.name();
		}

		return this.createCoreGroupFromObjects([object]);
	}
	private _cookWithoutInput(params: BoxSopParams) {
		const {divisions, size, sizes} = params;
		const geometry = new BoxGeometry(
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

	private _cookWithInput(coreGroup: CoreGroup, params: BoxSopParams) {
		const divisions = params.divisions;

		const bbox = coreGroup.boundingBox();
		_size.copy(bbox.max).sub(bbox.min);
		_center.copy(bbox.max).add(bbox.min).multiplyScalar(0.5);

		const geometry = new BoxGeometry(_size.x, _size.y, _size.z, divisions, divisions, divisions);
		const matrix = this._coreTransform.translationMatrix(_center);
		geometry.applyMatrix4(matrix);
		return geometry;
	}
}
