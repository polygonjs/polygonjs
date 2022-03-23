import {Material} from 'three/src/materials/Material';
import {Mesh} from 'three/src/objects/Mesh';
import {AttribClass} from '../../../../src/core/geometry/Constant';
import {CoreObject} from '../../../../src/core/geometry/Object';
import {CoreSleep} from '../../../../src/core/Sleep';
import {OnEventObjectAttributeUpdatedActorNode} from '../../../../src/engine/nodes/actor/OnEventObjectAttributeUpdated';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/GetMaterial', async (assert) => {
	const MAT = window.MAT;
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const attributeCreate1 = geo1.createNode('attribCreate');
	const actor1 = geo1.createNode('actor');

	const meshBasic1 = MAT.createNode('meshBasic');
	const meshBasic2 = MAT.createNode('meshBasic');

	attributeCreate1.setAttribClass(AttribClass.OBJECT);
	attributeCreate1.p.name.set('selected');

	attributeCreate1.setInput(0, box1);
	actor1.setInput(0, attributeCreate1);
	actor1.flags.display.set(true);

	const onEventObjectAttributeUpdated1 = actor1.createNode('onEventObjectAttributeUpdated');
	const setObjectMaterial1 = actor1.createNode('setObjectMaterial');
	const twoWaySwitch1 = actor1.createNode('twoWaySwitch');
	const getMaterial1 = actor1.createNode('getMaterial');
	const getMaterial2 = actor1.createNode('getMaterial');

	onEventObjectAttributeUpdated1.p.attribName.set('selected');
	onEventObjectAttributeUpdated1.setAttribType(ActorConnectionPointType.BOOLEAN);

	getMaterial1.p.node.setNode(meshBasic1);
	getMaterial2.p.node.setNode(meshBasic2);

	twoWaySwitch1.setInput(0, onEventObjectAttributeUpdated1, OnEventObjectAttributeUpdatedActorNode.OUTPUT_NEW_VAL);
	twoWaySwitch1.setInput(1, getMaterial1);
	twoWaySwitch1.setInput(2, getMaterial2);

	setObjectMaterial1.setInput(ActorConnectionPointType.TRIGGER, onEventObjectAttributeUpdated1);
	setObjectMaterial1.setInput(ActorConnectionPointType.MATERIAL, twoWaySwitch1);

	const container = await actor1.compute();
	const object = container.coreContent()!.objects()[0] as Mesh;
	const initialMaterial = object.material as Material;

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.position.y, 0);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 0.5, 0.25, 'time is 0.5 sec');
		assert.equal((object.material as Material).uuid, initialMaterial.uuid, 'mat is same as initial');

		new CoreObject(object, 0).setAttribValue('selected', 1);
		await CoreSleep.sleep(100);
		assert.notEqual((object.material as Material).uuid, initialMaterial.uuid, 'mat is not same as initial one');
		assert.equal((object.material as Material).uuid, meshBasic1.material.uuid, 'mat switched to basic1');

		new CoreObject(object, 0).setAttribValue('selected', 0);
		await CoreSleep.sleep(100);
		assert.equal((object.material as Material).uuid, meshBasic2.material.uuid, 'mat switched to basic2');
	});
});
