import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Vector3, Box3} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {BoxLineGeometry} from 'three/examples/jsm/geometries/BoxLineGeometry';
import {ObjectType} from '../../../core/geometry/Constant';
const tmpBox = new Box3();
const tmpSize = new Vector3();
const tmpCenter = new Vector3();
interface BoxLinesSopParams extends DefaultOperationParams {
	size: number;
	sizes: Vector3;
	divisions: Vector3;
	center: Vector3;
}

// const _sizes = new Vector3();
// const _center = new Vector3();
export class BoxLinesSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: BoxLinesSopParams = {
		size: 1,
		sizes: new Vector3(1, 1, 1),
		divisions: new Vector3(1, 1, 1),
		center: new Vector3(0, 0, 0),
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'boxLines'> {
		return 'boxLines';
	}
	override cook(inputCoreGroups: CoreGroup[], params: BoxLinesSopParams) {
		const inputCoreGroup = inputCoreGroups[0];
		const object = inputCoreGroup ? this._cookWithInput(inputCoreGroup, params) : this._cookWithoutInput(params);

		if (this._node) {
			object.name = this._node.name();
		}

		return this.createCoreGroupFromObjects([object]);
	}
	private _cookWithoutInput(params: BoxLinesSopParams) {
		return this._createLines(params);
	}

	private _cookWithInput(coreGroup: CoreGroup, params: BoxLinesSopParams) {
		coreGroup.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);
		tmpBox.getCenter(tmpCenter);

		return this._createLines({
			size: 1,
			sizes: tmpSize,
			divisions: params.divisions,
			center: tmpCenter,
		});
	}

	private _createLines(params: BoxLinesSopParams) {
		const geometry = new BoxLineGeometry(
			params.sizes.x * params.size,
			params.sizes.y * params.size,
			params.sizes.z * params.size,
			Math.max(1, Math.floor(params.divisions.x)),
			Math.max(1, Math.floor(params.divisions.y)),
			Math.max(1, Math.floor(params.divisions.z))
		);
		geometry.translate(params.center.x, params.center.y, params.center.z);
		return this.createObject(geometry, ObjectType.LINE_SEGMENTS);
	}
}
