import {Mesh, Vector3} from 'three';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {ActorPointSopNode} from '../../../../src/engine/nodes/sop/ActorPoint';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {CoreSleep} from '../../../../src/core/Sleep';
import {Vector3Param} from '../../../../src/engine/params/Vector3';

const _center = new Vector3();

function onCreateHook(node: ActorPointSopNode) {
	const onTick = node.createNode('onTick');
	const setPointPosition = node.createNode('setPointPosition');
	const getPointProperty = node.createNode('getPointProperty');
	const add1 = node.createNode('add');

	setPointPosition.setInput(JsConnectionPointType.TRIGGER, onTick);
	setPointPosition.setInput('position', add1);
	add1.setInput(0, getPointProperty, 'position');
	(add1.params.get('add1')! as Vector3Param).set([0, 0.01, 0]);

	onTick.uiData.setPosition(-100, 0);
	setPointPosition.uiData.setPosition(400, 0);
	add1.uiData.setPosition(200, 100);
	getPointProperty.uiData.setPosition(0, 100);
}

QUnit.test('sop/actorPoint simple', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const perspective_camera1 = window.perspective_camera1;
	perspective_camera1.p.t.set([0, 1, 10]);
	const box1 = geo1.createNode('box');
	const actorPoint1 = geo1.createNode('actorPoint');

	actorPoint1.setInput(0, box1);
	actorPoint1.flags.display.set(true);
	onCreateHook(actorPoint1);

	const container = await actorPoint1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;
	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(50);

	const _getGeometryBoundingBoxCenterY = () => {
		object.geometry.computeBoundingBox();
		object.geometry.boundingBox!.getCenter(_center);
		return _center.y;
	};

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		assert.equal(_getGeometryBoundingBoxCenterY(), 0);
		scene.play();
		assert.equal(scene.time(), 0);
		await CoreSleep.sleep(200);
		assert.more_than(_getGeometryBoundingBoxCenterY(), 0.05, 'object moved up');
	});
});
