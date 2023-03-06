import {Mesh} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/Subnet', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const vector3_1 = actor1.createNode('vector3');
	const subnet1 = actor1.createNode('subnet');
	const multAdd1 = subnet1.createNode('multAdd');
	const subnetInput1 = subnet1.createNode('subnetInput');
	const subnetOutput1 = subnet1.createNode('subnetOutput');

	setObjectPosition1.setInput(ActorConnectionPointType.TRIGGER, onManualTrigger1);
	setObjectPosition1.setInput('position', subnet1);

	subnet1.p.inputsCount.set(1);
	subnet1.setInputType(0, ActorConnectionPointType.VECTOR3);

	subnet1.setInput(0, vector3_1);
	subnetOutput1.setInput(0, multAdd1);
	multAdd1.setInput(0, subnetInput1);

	vector3_1.p.Vector3.set([1, 2, 3]);
	multAdd1.params.get('mult')!.set([2, 3, -4]);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		assert.equal(object.position.y, 0);
		scene.play();
		assert.equal(scene.time(), 0);
		assert.deepEqual(object.position.toArray(), [0, 0, 0]);

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(200);
		assert.deepEqual(object.position.toArray(), [2, 6, -12]);
	});
});
