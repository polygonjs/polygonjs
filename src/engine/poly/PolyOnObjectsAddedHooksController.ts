import {BaseSopNodeType} from '../nodes/sop/_Base';
import {PolyScene} from '../scene/PolyScene';
import {CoreObjectType, ObjectContent} from '../../core/geometry/ObjectContent';

const ON_OBJECT_ADD_HOOK_HANDLER_NODE_IDS_KEY = 'onObjectAddHookHandlerNodeIds';

function assignHookHandler(object: ObjectContent<CoreObjectType>, node: BaseSopNodeType) {
	let ids = hookHandlers(object);
	if (!ids) {
		ids = [];
		object.userData[ON_OBJECT_ADD_HOOK_HANDLER_NODE_IDS_KEY] = ids;
	}
	const id = node.graphNodeId();
	if (!ids.includes(id)) {
		ids.push(id);
	}
}
function hookHandlers(object: ObjectContent<CoreObjectType>) {
	return object.userData[ON_OBJECT_ADD_HOOK_HANDLER_NODE_IDS_KEY] as number[] | undefined;
}

export class PolyOnObjectsAddedHooksController {
	assignHookHandler(object: ObjectContent<CoreObjectType>, node: BaseSopNodeType) {
		assignHookHandler(object, node);
	}

	runHooks(scene: PolyScene, parent: ObjectContent<CoreObjectType>) {
		const children = parent.children;
		for (let child of children) {
			child.traverse((grandChild) => {
				if (grandChild.parent) {
					const ids = hookHandlers(grandChild);
					if (!ids) {
						return;
					}
					for (const id of ids) {
						const node = scene.graph.nodeFromId(id) as BaseSopNodeType | undefined;
						if (node) {
							// when traversing the scene to run the hooks
							// we must be very careful to note update the hierarchy
							// with .add and .remove, as this will make .traverse unpredictable.
							// Instead, children must be replaced directly with:
							//
							// const index = parent.children.indexOf(oldObject);
							// parent.children[index] = newObject;
							node.updateObjectOnAdd(grandChild, grandChild.parent);
						}
					}
				}
			});
		}
	}
}
