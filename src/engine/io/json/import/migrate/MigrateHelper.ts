import {BaseNodeType} from '../../../../nodes/_Base';
import {NodeContext} from '../../../../poly/NodeContext';

export class JsonImporterMigrateHelper {
	static migrateNodeType(parentNode: BaseNodeType, nodeType: string) {
		if (parentNode.childrenControllerContext() == NodeContext.GL && nodeType == 'substract') {
			return 'subtract';
		}
		return nodeType;
	}
}
