import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';
import type {CSS2DObject} from '../../../../src/core/render/CSSRenderers/CSS2DObject';
import type {CSS3DObject} from '../../../../src/core/render/CSSRenderers/CSS3DObject';

QUnit.test('js/setCSSObjectClass CSS2DObject', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const CSS2DObject1 = geo1.createNode('CSS2DObject');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, CSS2DObject1);
	actor1.flags.display.set(true);

	const onScenePlay1 = actor1.createNode('onScenePlay');
	const onScenePause1 = actor1.createNode('onScenePause');
	const setCSSObjectClass1 = actor1.createNode('setCSSObjectClass');
	const setCSSObjectClass2 = actor1.createNode('setCSSObjectClass');

	setCSSObjectClass1.setInput(JsConnectionPointType.TRIGGER, onScenePlay1);
	setCSSObjectClass2.setInput(JsConnectionPointType.TRIGGER, onScenePause1);

	setCSSObjectClass1.p.class.set('active');
	setCSSObjectClass2.p.class.set('active');
	setCSSObjectClass1.p.addRemove.set(true);
	setCSSObjectClass2.p.addRemove.set(false);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as CSS2DObject;

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		assert.notOk(object.element.classList.contains('active'), 'no active class');
		scene.play();
		assert.equal(scene.time(), 0);
		await CoreSleep.sleep(100);
		assert.ok(object.element.classList.contains('active'), 'active class added');

		scene.pause();
		await CoreSleep.sleep(100);
		assert.notOk(object.element.classList.contains('active'), 'active class removed');
	});
});

QUnit.test('js/setCSSObjectClass CSS3DObject', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const CSS3DObject1 = geo1.createNode('CSS3DObject');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, CSS3DObject1);
	actor1.flags.display.set(true);

	const onScenePlay1 = actor1.createNode('onScenePlay');
	const onScenePause1 = actor1.createNode('onScenePause');
	const setCSSObjectClass1 = actor1.createNode('setCSSObjectClass');
	const setCSSObjectClass2 = actor1.createNode('setCSSObjectClass');

	setCSSObjectClass1.setInput(JsConnectionPointType.TRIGGER, onScenePlay1);
	setCSSObjectClass2.setInput(JsConnectionPointType.TRIGGER, onScenePause1);

	setCSSObjectClass1.p.class.set('active');
	setCSSObjectClass2.p.class.set('active');
	setCSSObjectClass1.p.addRemove.set(true);
	setCSSObjectClass2.p.addRemove.set(false);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as CSS3DObject;

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		assert.notOk(object.element.classList.contains('active'), 'no active class');
		scene.play();
		assert.equal(scene.time(), 0);
		await CoreSleep.sleep(100);
		assert.ok(object.element.classList.contains('active'), 'active class added');

		scene.pause();
		await CoreSleep.sleep(100);
		assert.notOk(object.element.classList.contains('active'), 'active class removed');
	});
});
