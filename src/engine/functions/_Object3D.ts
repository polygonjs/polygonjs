import {Object3D} from 'three';
import {NamedFunction2, ObjectNamedFunction0, ObjectNamedFunction1} from './_Base';
import {removeFromParent, addToParent} from '../poly/PolyOnObjectsAddRemoveHooksController';
import {dummyReadRefVal} from './_Param';
import {getOrCreateNodeRef} from '../../core/reactivity/NodeReactivity';
import {NodeContext} from '../poly/NodeContext';
import {BaseSopNodeType} from '../nodes/sop/_Base';

export class getGeometryNodeObjects extends NamedFunction2<[BaseSopNodeType, Object3D[]]> {
	static override type() {
		return 'getGeometryNodeObjects';
	}
	public override async = true;
	async func(node: BaseSopNodeType, objects: Object3D[]): Promise<void> {
		dummyReadRefVal(getOrCreateNodeRef(node.path()).value);
		dummyReadRefVal(this.scene.timeController.timeUniform().value);

		if (node && node.context() == NodeContext.SOP) {
			const geometryNode = node as BaseSopNodeType;
			const container = await geometryNode.compute();
			const nodeObjects = container.coreContent()?.threejsObjects() || [];
			objects.length = 0;
			for (let object of nodeObjects) {
				objects.push(object);
			}
		}
	}
}

export class createObject extends ObjectNamedFunction1<[Object3D | undefined]> {
	static override type() {
		return 'createObject';
	}
	func(parent: Object3D, child: Object3D | undefined): void {
		if (child) {
			addToParent(this.scene, parent, child);
		}
	}
}
export class createObjects extends ObjectNamedFunction1<[Object3D[]]> {
	static override type() {
		return 'createObjects';
	}
	func(parent: Object3D, children: Object3D[]): void {
		for (let child of children) {
			if (child) {
				addToParent(this.scene, parent, child);
			}
		}
	}
}

//
//
//
//
//
export class objectDelete extends ObjectNamedFunction0 {
	static override type() {
		return 'objectDelete';
	}
	func(object3D: Object3D): void {
		removeFromParent(this.scene, object3D);
	}
}
