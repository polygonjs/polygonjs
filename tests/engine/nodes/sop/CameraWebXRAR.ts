import type {QUnit} from '../../../helpers/QUnit';
import {ThreejsCoreObject} from '../../../../src/core/geometry/modules/three/ThreejsCoreObject';
import {CameraAttribute} from '../../../../src/core/camera/CoreCamera';
export function testenginenodessopCameraWebXRAR(qUnit: QUnit) {
	qUnit.test('sop/cameraWebXRAR simple', async (assert) => {
		const geo1 = window.geo1;
		const camera1 = geo1.createNode('perspectiveCamera');
		const cameraWebXRAR1 = geo1.createNode('cameraWebXRAR');
		cameraWebXRAR1.setInput(0, camera1);
		const container = await cameraWebXRAR1.compute();
		const objects = container.coreContent()!.allObjects()!;
		assert.equal(objects.length, 1);

		assert.equal(ThreejsCoreObject.attribValue(objects[0], CameraAttribute.WEBXR_AR), true);
	});
	qUnit.test('sop/cameraWebXRAR applyToChildren', async (assert) => {
		const geo1 = window.geo1;
		const camera1 = geo1.createNode('perspectiveCamera');
		const hierarchy1 = geo1.createNode('hierarchy');
		const cameraWebXRAR1 = geo1.createNode('cameraWebXRAR');
		hierarchy1.setInput(0, camera1);
		cameraWebXRAR1.setInput(0, hierarchy1);
		const container = await cameraWebXRAR1.compute();
		const objects = container.coreContent()!.allObjects()!;
		assert.equal(objects.length, 1);

		assert.equal(ThreejsCoreObject.attribValue(objects[0], CameraAttribute.WEBXR_AR), true);
		assert.equal(ThreejsCoreObject.attribValue(objects[0].children[0], CameraAttribute.WEBXR_AR), true);
	});
}
