import {TypedContainer} from './_Base';
import {ContainableMap} from './utils/ContainableMap';
import {NodeContext} from '../poly/NodeContext';
import {csgObjectType, CsgObjectType} from '../../core/geometry/csg/CsgToObject3D';
import {CsgCoreGroup} from '../../core/geometry/csg/CsgCoreGroup';

export class CsgContainer extends TypedContainer<NodeContext.CSG> {
	override coreContentCloned(): CsgCoreGroup | undefined {
		if (this._content) {
			return this._content.clone();
		}
	}

	override set_content(content: ContainableMap[NodeContext.CSG]) {
		super.set_content(content);
	}

	objectTypes(): CsgObjectType[] {
		return this._content.objects().map((o) => csgObjectType(o));
	}
}
