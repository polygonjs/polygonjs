import {PolyDictionary} from '../../../../../types/GlobalTypes';
import {BaseNodeType} from '../../../../nodes/_Base';
import {NodeContext} from '../../../../poly/NodeContext';

const ACTOR_NEW_TYPES: PolyDictionary<string> = {
	onEventchildattributeupdated: 'OnChildAttributeUpdate',
	onEventmanualtrigger: 'OnManualTrigger',
	onEventobjectattributeupdated: 'OnObjectAttributeUpdate',
	oneventobjectclicked: 'OnObjectClick',
	oneventobjecthovered: 'OnObjectHover',
	oneventtick: 'OnTick',
};
const GL_NEW_TYPES: PolyDictionary<string> = {
	substract: 'subtract',
};
export class JsonImporterMigrateHelper {
	static migrateNodeType(parentNode: BaseNodeType, nodeType: string) {
		switch (parentNode.childrenControllerContext()) {
			case NodeContext.ACTOR: {
				return ACTOR_NEW_TYPES[nodeType] || nodeType;
			}
			case NodeContext.GL: {
				return GL_NEW_TYPES[nodeType] || nodeType;
			}
		}
		return nodeType;
	}
}
