import {MapUtils} from './../../../core/MapUtils';
import {CoreObject} from './../../../core/geometry/Object';
import {Vector2, Vector3, Box3, Object3D} from 'three';
import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {isBooleanTrue} from '../../../core/Type';

interface ObjectsLayoutSopParams extends DefaultOperationParams {
	maxLayoutWidth: number;
	rowHeight: number;
	padding: Vector2;
	addAttribs: boolean;
	addRowAttrib: boolean;
	addRowWidthInner: boolean;
	addRowWidthOuter: boolean;
}

const currentPos = new Vector2(0, 0);
const maxPos = new Vector2(0, 0);
const box = new Box3();
const boxSize = new Vector3(0, 0);

const objectsByRow: Map<number, Object3D[]> = new Map();
export class ObjectsLayoutSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: ObjectsLayoutSopParams = {
		maxLayoutWidth: 10,
		rowHeight: 1,
		padding: new Vector2(0, 0),
		addAttribs: false,
		addRowAttrib: false,
		addRowWidthInner: false,
		addRowWidthOuter: false,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'objectsLayout'> {
		return 'objectsLayout';
	}

	override cook(inputCoreGroups: CoreGroup[], params: ObjectsLayoutSopParams) {
		const objects = inputCoreGroups[0].objects();
		currentPos.set(0, 0);
		maxPos.set(0, 0);
		objectsByRow.clear();
		let rowIndex = 0;
		const addRowWidth = isBooleanTrue(params.addRowWidthInner) || isBooleanTrue(params.addRowWidthOuter);
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
				rowIndex++;
			}

			// move current object
			object.position.x = currentPos.x - boxSize.x * 0.5;
			object.position.y = currentPos.y - boxSize.y * 0.5;
			if (isBooleanTrue(params.addAttribs)) {
				if (addRowWidth) {
					MapUtils.pushOnArrayAtEntry(objectsByRow, rowIndex, object);
				}

				if (isBooleanTrue(params.addRowAttrib)) {
					CoreObject.addAttribute(object, 'row', rowIndex);
				}
			}

			maxPos.x = Math.max(maxPos.x, object.position.x + boxSize.x * 0.5);
			maxPos.y = Math.min(maxPos.y, object.position.y - boxSize.y * 0.5);
		}
		// center all objects together
		for (let object of objects) {
			object.position.x -= maxPos.x * 0.5;
			object.position.y -= maxPos.y * 0.5;
			object.updateMatrix();
		}
		// add attribs
		if (isBooleanTrue(params.addAttribs)) {
			if (addRowWidth) {
				objectsByRow.forEach((objects, _) => {
					if (isBooleanTrue(params.addRowWidthInner)) {
						const xs = objects.map((o) => o.position.x);
						const minX = Math.min(...xs);
						const maxX = Math.max(...xs);
						const width = maxX - minX;
						for (let object of objects) {
							CoreObject.addAttribute(object, 'rowWidthInner', width);
						}
					}
					if (isBooleanTrue(params.addRowWidthOuter)) {
						const minX = Math.min(
							...objects.map((o) => {
								box.setFromObject(o);
								box.getSize(boxSize);
								return o.position.x - boxSize.x * 0.5;
							})
						);
						const maxX = Math.max(
							...objects.map((o) => {
								box.setFromObject(o);
								box.getSize(boxSize);
								return o.position.x + boxSize.x * 0.5;
							})
						);
						const width = maxX - minX;
						for (let object of objects) {
							CoreObject.addAttribute(object, 'rowWidthOuter', width);
						}
					}
				});
			}
		}

		return this.createCoreGroupFromObjects(objects);
	}
}
