import type {QUnit} from '../../../helpers/QUnit';
import {Mesh} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';
export function testenginenodesjsDeformGeometryCubeLattice(qUnit: QUnit) {
	qUnit.test('js/deformGeometryCubeLattice', async (assert) => {
		const scene = window.scene;
		const perspective_camera1 = window.perspective_camera1;
		const geo1 = window.geo1;
		const box1 = geo1.createNode('box');
		const actor1 = geo1.createNode('actor');

		box1.p.center.set([0.5, 0.5, 0.5]);
		actor1.setInput(0, box1);
		actor1.flags.display.set(true);

		const onManualTrigger1 = actor1.createNode('onManualTrigger');
		const deformGeometryCubeLattice1 = actor1.createNode('deformGeometryCubeLattice');

		deformGeometryCubeLattice1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
		deformGeometryCubeLattice1.p.p4.y.set(2);

		const container = await actor1.compute();
		const object = container.coreContent()!.threejsObjects()[0] as Mesh;

		// wait to make sure objects are mounted to the scene
		await CoreSleep.sleep(150);

		await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
			assert.equal(object.position.y, 0);
			scene.play();
			assert.equal(scene.time(), 0);
			assert.equal(object.geometry.getAttribute('position').array[13], 1);

			onManualTrigger1.p.trigger.pressButton();
			await CoreSleep.sleep(200);
			assert.equal(object.geometry.getAttribute('position').array[13], 2);
		});
	});
}
