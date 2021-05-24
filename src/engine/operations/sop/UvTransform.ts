import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {Vector2} from 'three/src/math/Vector2';
import {InputCloneMode} from '../../poly/InputCloneMode';

interface UvTransformSopParams extends DefaultOperationParams {
	attribName: string;
	t: Vector2;
	s: Vector2;
	pivot: Vector2;
}

export class UvTransformSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: UvTransformSopParams = {
		attribName: 'uv',
		t: new Vector2(0, 0),
		s: new Vector2(1, 1),
		pivot: new Vector2(0, 0),
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static type(): Readonly<SopType.UV_TRANSFORM> {
		return SopType.UV_TRANSFORM;
	}

	cook(input_contents: CoreGroup[], params: UvTransformSopParams): CoreGroup {
		const objects = input_contents[0].objectsWithGeo();
		for (let object of objects) {
			const geometry = object.geometry;
			const attrib = geometry.getAttribute(params.attribName);
			const array = attrib.array as number[];
			const ptsCount = array.length / 2;
			for (let i = 0; i < ptsCount; i++) {
				array[i * 2 + 0] = params.s.x * (array[i * 2 + 0] - params.pivot.x + params.t.x);
				array[i * 2 + 1] = params.s.y * (array[i * 2 + 1] - params.pivot.y + params.t.y);
			}
			attrib.needsUpdate = true;
		}
		return input_contents[0];
	}
}
