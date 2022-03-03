import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {BufferAttribute} from 'three/src/core/BufferAttribute';
import {ObjectType} from '../../../core/geometry/Constant';

interface BboxScatterSopParams extends DefaultOperationParams {
	stepSize: number;
}

export class BboxScatterSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: BboxScatterSopParams = {
		stepSize: 1,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'bboxScatter'> {
		return 'bboxScatter';
	}
	override cook(inputCoreGroups: CoreGroup[], params: BboxScatterSopParams) {
		const inputCoreGroup = inputCoreGroups[0];
		const stepSize = params.stepSize;
		const bbox = inputCoreGroup.boundingBox();
		const min = bbox.min;
		const max = bbox.max;

		const positions: number[] = [];
		for (let x = min.x; x <= max.x; x += stepSize) {
			for (let y = min.y; y <= max.y; y += stepSize) {
				for (let z = min.z; z <= max.z; z += stepSize) {
					positions.push(x);
					positions.push(y);
					positions.push(z);
				}
			}
		}

		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));

		return this.createCoreGroupFromGeometry(geometry, ObjectType.POINTS);
	}
}
