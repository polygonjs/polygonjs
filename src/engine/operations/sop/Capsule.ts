import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {createCapsuleGeometry} from '../../../core/player/CapsuleGeometry';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {Vector3} from 'three';

interface CapsuleSopParams extends DefaultOperationParams {
	radius: number;
	height: number;
	divisions: number;
	center: Vector3;
}

export class CapsuleSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: CapsuleSopParams = {
		radius: 0.2,
		height: 1,
		divisions: 2,
		center: new Vector3(0, 0, 0),
	};
	static override type(): Readonly<'capsule'> {
		return 'capsule';
	}
	override cook(input_contents: CoreGroup[], params: CapsuleSopParams) {
		return this.createCoreGroupFromGeometry(createCapsuleGeometry(params));
	}
}
