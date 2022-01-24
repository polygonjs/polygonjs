import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {createPlayerGeometry} from '../../../core/player/PlayerGeometry';
import {DefaultOperationParams} from '../../../core/operations/_Base';

interface PlayerCapsuleSopParams extends DefaultOperationParams {
	radius: number;
	height: number;
}

export class PlayerCapsuleSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: PlayerCapsuleSopParams = {
		radius: 0.5,
		height: 1,
	};
	static override type(): Readonly<'playerCapsule'> {
		return 'playerCapsule';
	}
	override cook(input_contents: CoreGroup[], params: PlayerCapsuleSopParams) {
		return this.createCoreGroupFromGeometry(createPlayerGeometry(params));
	}
}
