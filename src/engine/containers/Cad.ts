// import {TypedContainer} from './_Base';
// import {ContainableMap} from './utils/ContainableMap';
// import {NodeContext} from '../poly/NodeContext';
// // import {cadObjectType, CadObjectType} from '../../core/geometry/modules/cad/CadToObject3D';
// import {CadCoreGroup} from '../../core/geometry/modules/cad/CadCoreGroup';

// export class CadContainer extends TypedContainer<NodeContext.CAD> {
// 	override coreContentCloned(): CadCoreGroup | undefined {
// 		if (this._content) {
// 			return this._content.clone();
// 		}
// 	}

// 	override set_content(content: ContainableMap[NodeContext.CAD]) {
// 		super.set_content(content);
// 	}

// 	// objectTypes(): CadObjectType[] {
// 	// 	return this._content.objects().map((o) => cadObjectType(o));
// 	// }
// }
