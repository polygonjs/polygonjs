import type {QUnit} from '../../../helpers/QUnit';
import {Mesh} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {OnPerformanceChangeJsNode} from '../../../../src/engine/nodes/js/OnPerformanceChange';
import {GeoObjNode} from '../../../../src/engine/nodes/obj/Geo';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';
export function testenginenodesjsOnPerformanceChange(qUnit: QUnit) {

function setupGeo2(geo1: GeoObjNode) {
	const box1 = geo1.createNode('box');
	const plane1 = geo1.createNode('plane');
	const copy1 = geo1.createNode('copy');

	copy1.flags.display.set(true);
	copy1.setInput(0, box1);
	copy1.setInput(1, plane1);
	// copy1.p.t.z.set(-0.1)

	return {plane1};
}

qUnit.test('js/onPerformanceChange', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const geo2 = scene.createNode('geo');
	const {plane1} = setupGeo2(geo2);
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);
	actor1.io.inputs.overrideClonedState(true);

	const onPerformanceChange1 = actor1.createNode('onPerformanceChange');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const setObjectPosition2 = actor1.createNode('setObjectPosition');

	setObjectPosition1.setInput(
		JsConnectionPointType.TRIGGER,
		onPerformanceChange1,
		OnPerformanceChangeJsNode.OUTPUT_NAME_BELOW
	);
	setObjectPosition2.setInput(
		JsConnectionPointType.TRIGGER,
		onPerformanceChange1,
		OnPerformanceChangeJsNode.OUTPUT_NAME_ABOVE
	);

	setObjectPosition1.p.position.set([0, 1, 0]);
	setObjectPosition2.p.position.set([0, -1, 0]);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		assert.equal(object.position.y, 0);
		scene.play();
		assert.equal(scene.time(), 0);
		await CoreSleep.sleep(100);
		assert.equal(object.position.y, 0, 'object not moved');

		plane1.p.size.set([100, 100]);
		await CoreSleep.sleep(1900);
		assert.equal(object.position.y, 1, 'object moved to 1');

		plane1.p.size.set([5, 5]);
		await CoreSleep.sleep(2000);
		assert.equal(object.position.y, -1, 'object moved to -1');
	});
});

}