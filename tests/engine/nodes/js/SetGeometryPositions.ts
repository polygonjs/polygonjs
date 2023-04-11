import {BufferAttribute, Mesh, Vector3} from 'three';
import {Attribute} from '../../../../src/core/geometry/Attribute';
import {CoreSleep} from '../../../../src/core/Sleep';
import {SetGeometryPositionsInputName} from '../../../../src/engine/nodes/actor/SetGeometryPositions';
import {ConstantJsNode} from '../../../../src/engine/nodes/js/Constant';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('js/setGeometryPositions', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const plane1 = geo1.createNode('plane');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, plane1);
	actor1.flags.display.set(true);
	// actor1.io.inputs.overrideClonedState(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setGeometryPositions1 = actor1.createNode('setGeometryPositions');
	const constant1 = actor1.createNode('constant');
	const constant2 = actor1.createNode('constant');
	const elementsToArray1 = actor1.createNode('elementsToArray');

	setGeometryPositions1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	setGeometryPositions1.setInput(SetGeometryPositionsInputName.values, elementsToArray1);
	elementsToArray1.setInput(0, constant1);
	elementsToArray1.setInput(1, constant2);
	const constants = [constant1, constant2];
	for (let constantNode of constants) {
		constantNode.setJsType(JsConnectionPointType.VECTOR3);
	}
	constant1.p.vector3.set([1, 2, 3]);
	constant2.p.vector3.set([2, 4, 6]);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;

	const _positions: [Vector3, Vector3, Vector3] = [new Vector3(), new Vector3(), new Vector3()];
	function _vector3Ceil(v: Vector3) {
		v.x = Math.ceil(v.x);
		v.y = Math.ceil(v.y);
		v.z = Math.ceil(v.z);
	}
	function readPositions() {
		const geometry = object.geometry;
		const positionArray = (geometry.getAttribute(Attribute.POSITION) as BufferAttribute).array;
		_positions[0].fromArray(positionArray, 0);
		_positions[1].fromArray(positionArray, 3);
		_positions[2].fromArray(positionArray, 6);

		_positions.forEach(_vector3Ceil);
	}

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		readPositions();
		assert.deepEqual(_positions[0].toArray(), [0, 1, 0], '0');
		assert.deepEqual(_positions[1].toArray(), [1, 1, 0], '0');
		assert.deepEqual(_positions[2].toArray(), [0, 0, 1], '0');
		scene.play();
		assert.equal(scene.time(), 0);

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(50);
		readPositions();
		assert.deepEqual(_positions[0].toArray(), [1, 2, 3], '1');
		assert.deepEqual(_positions[1].toArray(), [2, 4, 6], '1');
		assert.deepEqual(_positions[2].toArray(), [0, 0, 1], '1');

		constant2.p.vector3.set([-1, -2, -6]);
		await CoreSleep.sleep(50);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(50);
		readPositions();
		assert.deepEqual(_positions[0].toArray(), [1, 2, 3], '2');
		assert.deepEqual(_positions[1].toArray(), [-1, -2, -6], '2');
		assert.deepEqual(_positions[2].toArray(), [0, 0, 1], '2');

		// lerp via param
		scene.batchUpdates(() => {
			constant2.p.vector3.set([2, 4, 12]);
			setGeometryPositions1.params.get('lerp')!.set(0.5);
		});
		await CoreSleep.sleep(50);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(50);
		readPositions();
		assert.deepEqual(_positions[0].toArray(), [1, 2, 3], '3');
		assert.deepEqual(_positions[1].toArray(), [1, 1, 3], '3');
		assert.deepEqual(_positions[2].toArray(), [0, 0, 1], '3');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		readPositions();
		assert.deepEqual(_positions[0].toArray(), [1, 2, 3], '4');
		assert.deepEqual(_positions[1].toArray(), [2, 3, 8], '4');
		assert.deepEqual(_positions[2].toArray(), [0, 0, 1], '4');

		// lerp via constant
		let constant3: ConstantJsNode;
		scene.batchUpdates(() => {
			constant3 = actor1.createNode('constant');
			constant3.setJsType(JsConnectionPointType.FLOAT);
			constant3.p.float.set(1);
			constant2.p.vector3.set([0, 0, 0]);
			setGeometryPositions1.setInput(SetGeometryPositionsInputName.lerp, constant3);
		});
		await CoreSleep.sleep(50);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(50);
		readPositions();
		assert.deepEqual(_positions[0].toArray(), [1, 2, 3], '5');
		assert.deepEqual(_positions[1].toArray(), [0, 0, 0], '5');
		assert.deepEqual(_positions[2].toArray(), [0, 0, 1], '5');

		//
		scene.batchUpdates(() => {
			constant3!.p.float.set(0.5);
			constant2.p.vector3.set([2, 4, 14]);
		});
		await CoreSleep.sleep(50);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(50);
		readPositions();
		assert.deepEqual(_positions[0].toArray(), [1, 2, 3], '6');
		assert.deepEqual(_positions[1].toArray(), [1, 2, 7], '6');
		assert.deepEqual(_positions[2].toArray(), [0, 0, 1], '6');
	});
});
