import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {createCapsuleGeometry} from '../../../core/player/CapsuleGeometry';
import {DefaultOperationParams} from '../../../core/operations/_Base';

interface CapsuleSopParams extends DefaultOperationParams {
	radius: number;
	height: number;
	divisions: number;
}

export class CapsuleSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: CapsuleSopParams = {
		radius: 0.5,
		height: 1,
		divisions: 2,
	};
	static override type(): Readonly<'capsule'> {
		return 'capsule';
	}
	override cook(input_contents: CoreGroup[], params: CapsuleSopParams) {
		return this.createCoreGroupFromGeometry(createCapsuleGeometry(params));
	}
}
