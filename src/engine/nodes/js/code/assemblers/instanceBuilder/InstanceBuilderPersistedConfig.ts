import {InstanceBuilderSopNode} from '../../../../sop/InstanceBuilder';
import {BasePointBuilderPersistedConfig} from '../pointBuilder/_BasePointBuilderPersistedConfig';

export class InstanceBuilderPersistedConfig extends BasePointBuilderPersistedConfig {
	constructor(protected override node: InstanceBuilderSopNode) {
		super(node);
	}
}
