import {CoreObject} from '../../../../src/core/geometry/Object';
import {CameraAttribute} from '../../../../src/core/camera/CoreCamera';

QUnit.test('sop/cameraWebXRARMArkerTracking simple', async (assert) => {
	const geo1 = window.geo1;
	const camera1 = geo1.createNode('perspectiveCamera');
	const cameraWebXRARMarkerTracking1 = geo1.createNode('cameraWebXRARMarkerTracking');
	cameraWebXRARMarkerTracking1.setInput(0, camera1);
	const container = await cameraWebXRARMarkerTracking1.compute();
	const objects = container.coreContent()!.allObjects()!;
	assert.equal(objects.length, 1);

	assert.equal(CoreObject.attribValue(objects[0], CameraAttribute.WEBXR_AR_MARKER_TRACKING), undefined);
	assert.equal(
		cameraWebXRARMarkerTracking1.states.error.message(),
		'This node requires the plugin-marker-tracking. See [https://github.com/polygonjs/plugin-marker-tracking](https://github.com/polygonjs/plugin-marker-tracking)'
	);
});
QUnit.test('sop/cameraWebXRARMArkerTracking applyToChildren', async (assert) => {
	const geo1 = window.geo1;
	const camera1 = geo1.createNode('perspectiveCamera');
	const hierarchy1 = geo1.createNode('hierarchy');
	const cameraWebXRARMarkerTracking1 = geo1.createNode('cameraWebXRARMarkerTracking');
	hierarchy1.setInput(0, camera1);
	cameraWebXRARMarkerTracking1.setInput(0, hierarchy1);
	const container = await cameraWebXRARMarkerTracking1.compute();
	const objects = container.coreContent()!.allObjects()!;
	assert.equal(objects.length, 1);

	assert.equal(CoreObject.attribValue(objects[0], CameraAttribute.WEBXR_AR_MARKER_TRACKING), undefined);
	assert.equal(CoreObject.attribValue(objects[0].children[0], CameraAttribute.WEBXR_AR_MARKER_TRACKING), undefined);

	assert.equal(
		cameraWebXRARMarkerTracking1.states.error.message(),
		'This node requires the plugin-marker-tracking. See [https://github.com/polygonjs/plugin-marker-tracking](https://github.com/polygonjs/plugin-marker-tracking)'
	);
});
