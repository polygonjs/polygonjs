import {Vector2, Vector3, Box3} from 'three';
import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';

interface ObjectsLayoutSopParams extends DefaultOperationParams {
	maxLayoutWidth: number;
	rowHeight: number;
	padding: Vector2;
}

const currentPos = new Vector2(0, 0);
const maxPos = new Vector2(0, 0);
const box = new Box3();
const boxSize = new Vector3(0, 0);

export class ObjectsLayoutSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: ObjectsLayoutSopParams = {
		maxLayoutWidth: 10,
		rowHeight: 1,
		padding: new Vector2(0, 0),
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'objectsLayout'> {
		return 'objectsLayout';
	}

	override cook(inputCoreGroups: CoreGroup[], params: ObjectsLayoutSopParams) {
		const objects = inputCoreGroups[0].objects();

		currentPos.set(0, 0);
		for (let object of objects) {
			// get size before scale adjustment
			object.updateMatrix();
			box.setFromObject(object);
			box.getSize(boxSize);

			// scale adjustment
			const scaleFactor = params.rowHeight / boxSize.y;
			object.scale.multiplyScalar(scaleFactor);
			object.updateMatrix();

			// get size after scale adjustment
			box.setFromObject(object);
			box.getSize(boxSize);

			// apply padding
			boxSize.x += params.padding.x;
			boxSize.y += params.padding.y;

			// move
			currentPos.x += boxSize.x;

			// change row if needed
			if (currentPos.x > params.maxLayoutWidth) {
				currentPos.x = boxSize.x;
				currentPos.y -= boxSize.y;
			}

			// move current object
			object.position.x = currentPos.x - boxSize.x * 0.5;
			object.position.y = currentPos.y - boxSize.y * 0.5;

			maxPos.x = Math.max(maxPos.x, object.position.x + boxSize.x * 0.5);
			maxPos.y = Math.min(maxPos.y, object.position.y - boxSize.y * 0.5);

			object.updateMatrix();
		}
		for (let object of objects) {
			object.position.x -= maxPos.x * 0.5;
			object.position.y -= maxPos.y * 0.5;
			object.updateMatrix();
		}

		return this.createCoreGroupFromObjects(objects);
	}
}
