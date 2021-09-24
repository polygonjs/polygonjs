import {NodeContext} from '../../../poly/NodeContext';
import {isBooleanTrue} from '../../../../core/BooleanValue';
import {Capsule} from 'three/examples/jsm/math/Capsule';
import {Vector3} from 'three/src/math/Vector3';
import {BaseCollisionHandler} from '../../../../modules/core/controls/BaseCollisionHandler';
import {TypedNodePathParamValue} from '../../../../core/Walker';
import {Vector2} from 'three/src/math/Vector2';
import {BaseSopNodeType} from '../../sop/_Base';

interface BaseColliderControlsEventNode2 {
	pv: {
		collideWithGeo: boolean;
		collidingGeo: TypedNodePathParamValue;
		capsuleHeightRange: Vector2;
		capsuleRadius: number;
	};
}

export async function setupCollision(controls: BaseCollisionHandler, node: BaseColliderControlsEventNode2) {
	if (isBooleanTrue(node.pv.collideWithGeo)) {
		const objNode = node.pv.collidingGeo.nodeWithContext(NodeContext.OBJ);
		if (objNode) {
			await objNode.compute();
			const displayNode = (await objNode.displayNodeController?.displayNode()) as BaseSopNodeType;
			const container = await displayNode?.compute();
			const coreGroup = container.coreContent();
			if (!coreGroup) {
				console.error('obj node contains invalid sop');
				return;
			}
			const object = coreGroup.objectsWithGeo()[0];
			controls.setCheckCollisions(object);
			controls.setCollisionCapsule(
				new Capsule(
					new Vector3(0, node.pv.capsuleHeightRange.x, 0),
					new Vector3(node.pv.capsuleHeightRange.y),
					node.pv.capsuleRadius
				)
			);
		}
	} else {
		controls.setCheckCollisions();
	}
}
