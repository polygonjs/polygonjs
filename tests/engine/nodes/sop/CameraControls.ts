import type {QUnit} from '../../../helpers/QUnit';
import {CoreObject} from '../../../../src/core/geometry/Object';
import {CameraAttribute} from '../../../../src/core/camera/CoreCamera';
export function testenginenodessopCameraControls(qUnit: QUnit) {

qUnit.test('sop/cameraControls simple', async (assert) => {
	const geo1 = window.geo1;
	const camera1 = geo1.createNode('perspectiveCamera');
	const cameraControls1 = geo1.createNode('cameraControls');
	const cameraOrbitControls1 = cameraControls1.createNode('cameraOrbitControls');
	cameraControls1.p.node.setNode(cameraOrbitControls1);
	cameraControls1.setInput(0, camera1);
	const container = await cameraControls1.compute();
	const objects = container.coreContent()!.allObjects()!;
	assert.equal(objects.length, 1);

	assert.equal(
		CoreObject.attribValue(objects[0], CameraAttribute.CONTROLS_NODE_ID),
		cameraOrbitControls1.graphNodeId()
	);
});
qUnit.test('sop/cameraControls applyToChildren', async (assert) => {
	const geo1 = window.geo1;
	const camera1 = geo1.createNode('perspectiveCamera');
	const hierarchy1 = geo1.createNode('hierarchy');
	const cameraControls1 = geo1.createNode('cameraControls');
	const cameraOrbitControls1 = cameraControls1.createNode('cameraOrbitControls');
	cameraControls1.p.node.setNode(cameraOrbitControls1);
	hierarchy1.setInput(0, camera1);
	cameraControls1.setInput(0, hierarchy1);
	const container = await cameraControls1.compute();
	const objects = container.coreContent()!.allObjects()!;
	assert.equal(objects.length, 1);

	assert.equal(
		CoreObject.attribValue(objects[0], CameraAttribute.CONTROLS_NODE_ID),
		cameraOrbitControls1.graphNodeId()
	);
	assert.equal(
		CoreObject.attribValue(objects[0].children[0], CameraAttribute.CONTROLS_NODE_ID),
		cameraOrbitControls1.graphNodeId()
	);
});

}