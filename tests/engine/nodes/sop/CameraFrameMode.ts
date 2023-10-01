import type {QUnit} from '../../../helpers/QUnit';
import {ThreejsCoreObject} from '../../../../src/core/geometry/modules/three/ThreejsCoreObject';
import {CameraAttribute} from '../../../../src/core/camera/CoreCamera';
import {CameraFrameMode, CAMERA_FRAME_MODES} from '../../../../src/core/camera/CoreCameraFrameMode';
export function testenginenodessopCameraFrameMode(qUnit: QUnit) {
	qUnit.test('sop/cameraFrameMode simple', async (assert) => {
		const geo1 = window.geo1;
		const camera1 = geo1.createNode('perspectiveCamera');
		const cameraFrameMode1 = geo1.createNode('cameraFrameMode');
		cameraFrameMode1.setInput(0, camera1);
		const container = await cameraFrameMode1.compute();
		const objects = container.coreContent()!.allObjects()!;
		assert.equal(objects.length, 1);

		assert.equal(
			ThreejsCoreObject.attribValue(objects[0], CameraAttribute.FRAME_MODE),
			CAMERA_FRAME_MODES.indexOf(CameraFrameMode.DEFAULT)
		);
		assert.equal(ThreejsCoreObject.attribValue(objects[0], CameraAttribute.FRAME_MODE_EXPECTED_ASPECT_RATIO), 16 / 9);
	});
	qUnit.test('sop/cameraFrameMode applyToChildren', async (assert) => {
		const geo1 = window.geo1;
		const camera1 = geo1.createNode('perspectiveCamera');
		const hierarchy1 = geo1.createNode('hierarchy');
		const cameraFrameMode1 = geo1.createNode('cameraFrameMode');
		hierarchy1.setInput(0, camera1);
		cameraFrameMode1.setInput(0, hierarchy1);
		const container = await cameraFrameMode1.compute();
		const objects = container.coreContent()!.allObjects()!;
		assert.equal(objects.length, 1);

		assert.equal(
			ThreejsCoreObject.attribValue(objects[0], CameraAttribute.FRAME_MODE),
			CAMERA_FRAME_MODES.indexOf(CameraFrameMode.DEFAULT)
		);
		assert.equal(ThreejsCoreObject.attribValue(objects[0], CameraAttribute.FRAME_MODE_EXPECTED_ASPECT_RATIO), 16 / 9);
		assert.equal(
			ThreejsCoreObject.attribValue(objects[0].children[0], CameraAttribute.FRAME_MODE),
			CAMERA_FRAME_MODES.indexOf(CameraFrameMode.DEFAULT)
		);
		assert.equal(
			ThreejsCoreObject.attribValue(objects[0].children[0], CameraAttribute.FRAME_MODE_EXPECTED_ASPECT_RATIO),
			16 / 9
		);
	});
}
