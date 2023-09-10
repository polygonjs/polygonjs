import type {QUnit} from '../../../helpers/QUnit';
import {CoreObject} from '../../../../src/core/geometry/modules/three/CoreObject';
import {CameraAttribute} from '../../../../src/core/camera/CoreCamera';
export function testenginenodessopCameraFPS(qUnit: QUnit) {
	qUnit.test('sop/cameraFPS simple', async (assert) => {
		const geo1 = window.geo1;
		const camera1 = geo1.createNode('perspectiveCamera');
		const cameraFPS1 = geo1.createNode('cameraFPS');
		cameraFPS1.setInput(0, camera1);

		async function getAttribute() {
			const container = await cameraFPS1.compute();
			const objects = container.coreContent()!.allObjects()!;
			assert.equal(objects.length, 1);

			return CoreObject.attribValue(objects[0], CameraAttribute.MAX_FPS);
		}

		assert.equal(await getAttribute(), 60);

		cameraFPS1.p.maxFPS.set(30);
		assert.equal(await getAttribute(), 30);
	});
}
