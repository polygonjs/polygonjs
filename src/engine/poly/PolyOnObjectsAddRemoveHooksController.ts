import {BaseSopNodeType} from '../nodes/sop/_Base';
import {PolyScene} from '../scene/PolyScene';
import {CoreObjectType, ObjectContent} from '../../core/geometry/ObjectContent';
import {Object3D} from 'three';
import {Poly} from '../Poly';

enum HandlerName {
	ADD = 'onObjectAddHookHandlerNodeIds',
	REMOVE = 'onObjectRemoveHookHandlerNodeIds',
}
interface HookHandler {
	graphNodeId(): number;
	updateObjectOnAdd(object: ObjectContent<CoreObjectType>, parent: ObjectContent<CoreObjectType>): void;
	updateObjectOnRemove(object: ObjectContent<CoreObjectType>, parent: ObjectContent<CoreObjectType>): void;
}
function assignHookHandler(object: ObjectContent<CoreObjectType>, node: HookHandler, handleName: HandlerName) {
	let ids = hookHandlers(object, handleName);
	if (!ids) {
		ids = [];
		object.userData[handleName] = ids;
	}
	const id = node.graphNodeId();
	if (!ids.includes(id)) {
		ids.push(id);
	}
}

// function assignOnAddHookHandler(object: ObjectContent<CoreObjectType>, node: BaseSopNodeType) {
// 	assignHookHandler(object, node, HandlerName.ADD)
// }
// function assignOnRemoveHookHandler(object: ObjectContent<CoreObjectType>, node: BaseSopNodeType) {
// 	assignHookHandler(object, node, HandlerName.REMOVE)
// }
function hookHandlers(object: ObjectContent<CoreObjectType>, handlerName: HandlerName) {
	return object.userData[handlerName] as number[] | undefined;
}
function runHooks(scene: PolyScene, parent: ObjectContent<CoreObjectType>, handlerName: HandlerName) {
	const children = parent.children;
	for (let child of children) {
		child.traverse((grandChild) => {
			runHookOnObject(grandChild, scene, handlerName);
		});
	}
}
function runHookOnObject(object: ObjectContent<CoreObjectType>, scene: PolyScene, handlerName: HandlerName) {
	if (object.parent) {
		const ids = hookHandlers(object, handlerName);
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
				// newObject.parent = parent;
				switch (handlerName) {
					case HandlerName.ADD: {
						node.updateObjectOnAdd(object, object.parent);
						break;
					}
					case HandlerName.REMOVE: {
						node.updateObjectOnRemove(object, object.parent);
						break;
					}
				}
			}
		}
	}
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
export function removeFromParent(scene: PolyScene, object: ObjectContent<CoreObjectType>) {
	const parent = object.parent;
	if (!parent) {
		return;
	}
	Poly.onObjectsAddRemoveHooks.runOnRemoveHookOnObject(scene, object);
	object.parent?.remove(object);
}
export function addToParent(
	scene: PolyScene,
	parent: ObjectContent<CoreObjectType>,
	child: ObjectContent<CoreObjectType>
) {
	parent.add(child);
	Poly.onObjectsAddRemoveHooks.runOnAddHookOnObject(scene, child);
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

export class PolyOnObjectsAddRemoveHooksController {
	assignOnAddHookHandler(object: ObjectContent<CoreObjectType>, node: HookHandler) {
		assignHookHandler(object, node, HandlerName.ADD);
	}
	assignOnRemoveHookHandler(object: ObjectContent<CoreObjectType>, node: HookHandler) {
		assignHookHandler(object, node, HandlerName.REMOVE);
	}

	runOnAddHooks(scene: PolyScene, parent: ObjectContent<CoreObjectType>) {
		runHooks(scene, parent, HandlerName.ADD);
	}
	runOnRemoveHooks(scene: PolyScene, parent: ObjectContent<CoreObjectType>) {
		runHooks(scene, parent, HandlerName.REMOVE);
	}
	runOnAddHookOnObject(scene: PolyScene, object: ObjectContent<CoreObjectType>) {
		runHookOnObject(object, scene, HandlerName.ADD);
	}
	runOnRemoveHookOnObject(scene: PolyScene, object: ObjectContent<CoreObjectType>) {
		runHookOnObject(object, scene, HandlerName.REMOVE);
	}
}
