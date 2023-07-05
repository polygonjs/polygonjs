import {BaseSopNodeType} from '../nodes/sop/_Base';
import {PolyScene} from '../scene/PolyScene';
import {CoreObjectType, ObjectContent} from '../../core/geometry/ObjectContent';
import {Object3D} from 'three';

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

export function replaceChild(parent: Object3D, oldObject: Object3D, newObject: Object3D) {
	// new object replaces old Object directly,
	// and not using .remove and .add,
	// as this would make traversing the scenes from the hooks handler
	// unpredictable.
	const index = parent.children.indexOf(oldObject);
	if (index < 0) {
		console.warn('could not find object to replace');
		return;
	}
	parent.children[index] = newObject;
	newObject.parent = parent;
	// parent.remove(object);
	// parent.add(CSSObject);
}
// export function replaceChildWithCallbackObject(
// 	parent: Object3D,
// 	oldObject: Object3D,
// 	newObjectCallback: () => Object3D
// ) {
// 	const index = parent.children.indexOf(oldObject);
// 	const newObject = newObjectCallback();
// 	parent.children[index] = newObject;
// 	newObject.parent = parent;
// }
export function copyBasicObjectProperties(srcObject: Object3D, destObject: Object3D) {
	destObject.name = srcObject.name;
	destObject.matrixAutoUpdate = srcObject.matrixAutoUpdate;
	destObject.frustumCulled = srcObject.frustumCulled;
	destObject.layers = srcObject.layers;
	destObject.position.copy(srcObject.position);
	destObject.quaternion.copy(srcObject.quaternion);
	destObject.scale.copy(srcObject.scale);
	destObject.matrix.copy(srcObject.matrix);
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
