import {PointBuilderSopNode} from '../../../../sop/PointBuilder';
import {BasePointBuilderPersistedConfig} from './_BasePointBuilderPersistedConfig';

export class PointBuilderPersistedConfig extends BasePointBuilderPersistedConfig {
	constructor(protected override node: PointBuilderSopNode) {
		super(node);
	}
}
