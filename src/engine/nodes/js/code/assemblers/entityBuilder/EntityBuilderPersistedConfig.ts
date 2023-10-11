import {EntityBuilderSopNode} from '../../../../sop/EntityBuilder';
import {BaseEntityBuilderPersistedConfig} from './_BaseEntityBuilderPersistedConfig';

export class EntityBuilderPersistedConfig extends BaseEntityBuilderPersistedConfig {
	constructor(protected override node: EntityBuilderSopNode) {
		super(node);
	}
}
