import type {QUnit} from '../../../helpers/QUnit';
import {Mesh} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';
export function testenginenodesjsSetObjectScale(qUnit: QUnit) {

qUnit.test('js/setObjectScale', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onScenePlay1 = actor1.createNode('onScenePlay');
	const onScenePause1 = actor1.createNode('onScenePause');
	const setObjectScale1 = actor1.createNode('setObjectScale');
	const setObjectScale2 = actor1.createNode('setObjectScale');
	const getObjectProperty1 = actor1.createNode('getObjectProperty');

	setObjectScale1.setInput(JsConnectionPointType.TRIGGER, onScenePlay1);
	setObjectScale2.setInput(JsConnectionPointType.TRIGGER, onScenePause1);
	setObjectScale2.setInput('scale', getObjectProperty1, 'scale');

	setObjectScale1.p.scale.set([1, 2, 3]);
	setObjectScale2.p.mult.set(2);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		assert.equal(object.position.y, 0);
		scene.play();
		assert.equal(scene.time(), 0);
		await CoreSleep.sleep(200);
		assert.deepEqual(object.scale.toArray(), [1, 2, 3], 'object scale up');

		scene.pause();
		await CoreSleep.sleep(200);
		assert.deepEqual(object.scale.toArray(), [2, 4, 6], 'object scale up again');
	});
});

}