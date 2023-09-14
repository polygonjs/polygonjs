import type {QUnit} from '../../../helpers/QUnit';
import {ThreejsObject} from '../../../../src/core/geometry/modules/three/ThreejsObject';
import {CameraAttribute} from '../../../../src/core/camera/CoreCamera';
export function testenginenodessopCameraPostProcess(qUnit: QUnit) {
	qUnit.test('sop/cameraPostProcess simple', async (assert) => {
		const geo1 = window.geo1;
		const camera1 = geo1.createNode('perspectiveCamera');
		const cameraPostProcess1 = geo1.createNode('cameraPostProcess');
		cameraPostProcess1.createNode('bloom');
		// cameraPostProcess1.p.node.setNode(null1);
		cameraPostProcess1.setInput(0, camera1);
		const container = await cameraPostProcess1.compute();
		const objects = container.coreContent()!.allObjects()!;
		assert.equal(objects.length, 1);

		assert.equal(
			ThreejsObject.attribValue(objects[0], CameraAttribute.POST_PROCESS_NODE_ID),
			cameraPostProcess1.graphNodeId()
		);
	});
	qUnit.test('sop/cameraPostProcess applyToChildren', async (assert) => {
		const geo1 = window.geo1;
		const camera1 = geo1.createNode('perspectiveCamera');
		const hierarchy1 = geo1.createNode('hierarchy');
		const cameraPostProcess1 = geo1.createNode('cameraPostProcess');
		cameraPostProcess1.createNode('bloom');
		// cameraPostProcess1.p.node.setNode(null1);
		hierarchy1.setInput(0, camera1);
		cameraPostProcess1.setInput(0, hierarchy1);
		const container = await cameraPostProcess1.compute();
		const objects = container.coreContent()!.allObjects()!;
		assert.equal(objects.length, 1);

		assert.equal(
			ThreejsObject.attribValue(objects[0], CameraAttribute.POST_PROCESS_NODE_ID),
			cameraPostProcess1.graphNodeId()
		);
		assert.equal(
			ThreejsObject.attribValue(objects[0].children[0], CameraAttribute.POST_PROCESS_NODE_ID),
			cameraPostProcess1.graphNodeId()
		);
	});
}
