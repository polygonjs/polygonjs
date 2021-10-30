import {NodeContext} from '../../../poly/NodeContext';
import {isBooleanTrue} from '../../../../core/BooleanValue';
import {Capsule} from 'three/examples/jsm/math/Capsule';
import {Vector3} from 'three/src/math/Vector3';
import {BaseCollisionHandler} from '../../../../modules/core/controls/BaseCollisionHandler';
import {TypedNodePathParamValue} from '../../../../core/Walker';
import {BaseSopNodeType} from '../../sop/_Base';

interface BaseColliderControlsEventNode2 {
	pv: {
		collideWithGeo: boolean;
		collidingGeo: TypedNodePathParamValue;
		playerHeight: number;
		playerRadius: number;
		playerMass: number;
		jumpDuration: number;
		jumpForce: number;
		useGravity: boolean;
		gravity: Vector3;
	};
}

const gravity = new Vector3();
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
					new Vector3(0, node.pv.playerRadius, 0),
					new Vector3(0, node.pv.playerHeight - 2 * node.pv.playerRadius, 0),
					node.pv.playerRadius
				)
			);
			controls.setJumpParams({
				force: node.pv.jumpForce,
				duration: node.pv.jumpDuration,
			});
			gravity.copy(node.pv.gravity);
			if (!isBooleanTrue(node.pv.useGravity)) {
				gravity.multiplyScalar(0);
			}
			controls.setGravity(gravity);
			controls.setPlayerMass(node.pv.playerMass);
		}
	} else {
		controls.setCheckCollisions();
	}
}
