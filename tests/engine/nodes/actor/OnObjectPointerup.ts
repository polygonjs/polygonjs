import {CoreSleep} from '../../../../src/core/Sleep';
import {TransformTargetType} from '../../../../src/core/Transform';
import {GetIntersectionPropertyActorNodeOutputName} from '../../../../src/engine/nodes/actor/GetIntersectionProperty';
import {SetParamActorNode} from '../../../../src/engine/nodes/actor/SetParam';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {triggerPointerupAside, triggerPointerupInMiddle, triggerPointerup} from '../../../helpers/EventsHelper';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/onObjectPointerup', async (assert) => {
	const scene = window.scene;
	const MAT = window.MAT;
	const perspective_camera1 = window.perspective_camera1;

	perspective_camera1.p.t.set([0, 0, 5]);

	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	const material1 = geo1.createNode('material');
	const actor1 = geo1.createNode('actor');
	//
	const geo2 = scene.root().createNode('geo');
	const sphere1 = geo2.createNode('sphere');

	const meshBasic1 = MAT.createNode('meshBasic');
	meshBasic1.p.color.set([1, 0, 0]);
	material1.p.material.setNode(meshBasic1);

	transform1.setApplyOn(TransformTargetType.OBJECTS);
	transform1.p.t.set([0, 0, 0.5]);

	actor1.setInput(0, material1);
	material1.setInput(0, transform1);
	transform1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onObjectPointerup1 = actor1.createNode('onObjectPointerup');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const getObjectProperty1 = actor1.createNode('getObjectProperty');
	const negate1 = actor1.createNode('negate');
	const getIntersectionProperty1 = actor1.createNode('getIntersectionProperty');
	const setParam1 = actor1.createNode('setParam');

	setObjectPosition1.setInput(ActorConnectionPointType.TRIGGER, onObjectPointerup1);
	// setObjectPosition1.p.position.set([0, 0, 1]);
	setObjectPosition1.setInput('position', negate1);
	negate1.setInput(0, getObjectProperty1);
	//
	getIntersectionProperty1.setInput(0, onObjectPointerup1, ActorConnectionPointType.INTERSECTION);
	setParam1.setInput(ActorConnectionPointType.TRIGGER, onObjectPointerup1);
	setParam1.setInput(
		SetParamActorNode.INPUT_NAME_VAL,
		getIntersectionProperty1,
		GetIntersectionPropertyActorNodeOutputName.distance
	);
	setParam1.setParamType(ActorConnectionPointType.FLOAT);
	setParam1.p.param.setParam(geo2.p.scale);

	const container = await actor1.compute();
	const object = container.coreContent()!.objects()[0];

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		const {viewer} = args;
		const canvas = viewer.canvas();
		scene.play();
		assert.equal(scene.time(), 0);
		assert.deepEqual(object.position.toArray(), [0, 0, 0.5], 'position 0');
		assert.equal(geo2.p.scale.value, 1, 'scale');

		triggerPointerupInMiddle(canvas);
		await CoreSleep.sleep(100);
		assert.deepEqual(object.position.toArray(), [0, 0, -0.5], 'pos set');
		assert.in_delta(geo2.p.scale.value, 4, 0.001, 'scale');

		triggerPointerupAside(canvas);
		await CoreSleep.sleep(100);
		assert.deepEqual(object.position.toArray(), [0, 0, -0.5], 'position unset');
		assert.in_delta(geo2.p.scale.value, 4, 0.001, 'scale');

		triggerPointerupInMiddle(canvas);
		await CoreSleep.sleep(100);
		assert.deepEqual(object.position.toArray(), [0, 0, 0.5], 'pos set');
		assert.in_delta(geo2.p.scale.value, 5, 0.001, 'scale');

		// test intersection: point
		setParam1.setInput(
			SetParamActorNode.INPUT_NAME_VAL,
			getIntersectionProperty1,
			GetIntersectionPropertyActorNodeOutputName.point
		);
		setParam1.setParamType(ActorConnectionPointType.VECTOR3);
		setParam1.p.param.setParam(geo2.p.s);
		triggerPointerup(canvas, {x: 0.01, y: 0.01});
		await CoreSleep.sleep(200);
		assert.deepEqual(object.position.toArray(), [0, 0, -0.5]);
		const tmpV3 = geo2.p.s.value.toArray();

		assert.in_delta(tmpV3[0], 0.0373046126523999, 0.001, 's');
		assert.in_delta(tmpV3[1], -0.03730461265239991, 0.001, 's');
		assert.in_delta(tmpV3[2], 1, 0.001, 's');
		object.position.set(0, 0, 0);

		// test intersection: uv
		setParam1.setInput(
			SetParamActorNode.INPUT_NAME_VAL,
			getIntersectionProperty1,
			GetIntersectionPropertyActorNodeOutputName.uv
		);
		setParam1.setParamType(ActorConnectionPointType.VECTOR2);
		setParam1.p.param.setParam(sphere1.p.resolution);
		triggerPointerup(canvas, {x: 0.01, y: 0.01});
		await CoreSleep.sleep(200);
		assert.deepEqual(object.position.toArray(), [0, 0, 0]);
		const tmpV2 = sphere1.p.resolution.value.toArray();
		assert.in_delta(tmpV2[0], 0.5466307658154999, 0.001, 'uv');
		assert.in_delta(tmpV2[1], 0.4533692341845001, 0.001, 'uv');
		object.position.set(0, 0, 0);
	});
});
