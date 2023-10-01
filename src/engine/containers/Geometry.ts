import {TypedContainer} from './_Base';
import type {CoreGroup} from '../../core/geometry/Group';
import {ContainableMap} from './utils/ContainableMap';
import {NodeContext} from '../poly/NodeContext';

export class GeometryContainer extends TypedContainer<NodeContext.SOP> {
	override coreContentCloned(): CoreGroup | undefined {
		if (this._content) {
			return this._content.clone();
		}
	}

	override set_content(content: ContainableMap[NodeContext.SOP]) {
		super.set_content(content);
	}

	// pointsCount(): number {
	// 	if (this._content) {
	// 		return this._content.pointsCount();
	// 	} else {
	// 		return 0;
	// 	}
	// }
}
