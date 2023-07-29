import type {QUnit} from '../../../helpers/QUnit';
import {CoreObject} from '../../../../src/core/geometry/Object';
import {CameraAttribute} from '../../../../src/core/camera/CoreCamera';
export function testenginenodessopCameraWebXRVR(qUnit: QUnit) {

qUnit.test('sop/cameraWebXRVR simple', async (assert) => {
	const geo1 = window.geo1;
	const camera1 = geo1.createNode('perspectiveCamera');
	const cameraWebXRVR1 = geo1.createNode('cameraWebXRVR');
	cameraWebXRVR1.setInput(0, camera1);
	const container = await cameraWebXRVR1.compute();
	const objects = container.coreContent()!.allObjects()!;
	assert.equal(objects.length, 1);

	assert.equal(CoreObject.attribValue(objects[0], CameraAttribute.WEBXR_VR), true);
});
qUnit.test('sop/cameraWebXRVR applyToChildren', async (assert) => {
	const geo1 = window.geo1;
	const camera1 = geo1.createNode('perspectiveCamera');
	const hierarchy1 = geo1.createNode('hierarchy');
	const cameraWebXRVR1 = geo1.createNode('cameraWebXRVR');
	hierarchy1.setInput(0, camera1);
	cameraWebXRVR1.setInput(0, hierarchy1);
	const container = await cameraWebXRVR1.compute();
	const objects = container.coreContent()!.allObjects()!;
	assert.equal(objects.length, 1);

	assert.equal(CoreObject.attribValue(objects[0], CameraAttribute.WEBXR_VR), true);
	assert.equal(CoreObject.attribValue(objects[0].children[0], CameraAttribute.WEBXR_VR), true);
});

}