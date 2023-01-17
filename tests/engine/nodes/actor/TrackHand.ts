import {Mesh, Vector3} from 'three';
import {AttribClass} from '../../../../src/core/geometry/Constant';
import {CoreObject} from '../../../../src/core/geometry/Object';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {CoreSleep} from '../../../../src/core/Sleep';
import {TransformTargetType} from '../../../../src/core/Transform';
import {GetTrackedHandPropertyActorNodeInputName} from '../../../../src/engine/nodes/actor/GetTrackedHandProperty';
import {SetGeometryPositionsInputName} from '../../../../src/engine/nodes/actor/SetGeometryPositions';
import {SetObjectAttributeActorNode} from '../../../../src/engine/nodes/actor/SetObjectAttribute';
import {TrackHandActorNodeOutput} from '../../../../src/engine/nodes/actor/TrackHand';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/trackHand', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const COP = window.COP;

	// lights
	scene.root().createNode('hemisphereLight');

	// hand
	const trackingLandmarksHand1 = geo1.createNode('trackingLandmarksHand');
	const trackingLandmarksHandAttributes1 = geo1.createNode('trackingLandmarksHandAttributes');
	const transform1 = geo1.createNode('transform');
	const actor1 = geo1.createNode('actor');
	trackingLandmarksHandAttributes1.setInput(0, trackingLandmarksHand1);
	transform1.setInput(0, trackingLandmarksHandAttributes1);
	actor1.setInput(0, transform1);
	transform1.setApplyOn(TransformTargetType.OBJECTS);
	transform1.p.t.set([0, -0.5, -2]);
	// transform1.p.r.set([0, 180, 0]);

	// object with direction attribute
	const directionAttribObjectName = 'directionAttribObject';
	const attribName = 'direction';
	const tube1 = geo1.createNode('tube');
	const attribCreate1 = geo1.createNode('attribCreate');
	const objectProperties1 = geo1.createNode('objectProperties');
	const merge1 = geo1.createNode('merge');
	attribCreate1.setInput(0, tube1);
	objectProperties1.setInput(0, attribCreate1);
	merge1.setInput(0, actor1);
	merge1.setInput(1, objectProperties1);
	attribCreate1.setAttribClass(AttribClass.OBJECT);
	attribCreate1.p.name.set(attribName);
	attribCreate1.p.size.set(3);
	attribCreate1.p.value3.set([0, 1, 0]);
	objectProperties1.p.tname.set(true);
	objectProperties1.p.name.set(directionAttribObjectName);

	//
	merge1.flags.display.set(true);

	// video
	const video1 = COP.createNode('video');
	video1.p.url.set(`${ASSETS_ROOT}/computerVision/tests/hand.mp4`);
	video1.p.tflipY.set(true);
	video1.p.flipY.set(true);
	await video1.compute();
	// const videoElement = video1.videoCurrentTime()

	// video debug
	function _addVideoDebug() {
		const geo2 = scene.root().createNode('geo');
		const plane1 = geo2.createNode('plane');
		const materialsNetwork1 = geo2.createNode('materialsNetwork');
		const material1 = geo2.createNode('material');
		const meshBasic1 = materialsNetwork1.createNode('meshBasic');
		meshBasic1.p.doubleSided.set(true);
		meshBasic1.p.useMap.set(true);
		meshBasic1.p.map.setNode(video1);
		material1.p.material.setNode(meshBasic1);
		material1.setInput(0, plane1);
		material1.flags.display.set(true);
		plane1.p.direction.set([0, 0, 1]);
		plane1.p.center.set([0, 0, -3]);
	}
	_addVideoDebug();

	// actor
	const onTick1 = actor1.createNode('onTick');
	const setGeometryPositions1 = actor1.createNode('setGeometryPositions');
	const trackHand1 = actor1.createNode('trackHand');
	const getTexture1 = actor1.createNode('getTexture');
	const getTrackedHandProperty1 = actor1.createNode('getTrackedHandProperty');
	const getObject1 = actor1.createNode('getObject');
	const setObjectAttribute1 = actor1.createNode('setObjectAttribute');

	getTexture1.p.node.setNode(video1);
	setGeometryPositions1.setInput(ActorConnectionPointType.TRIGGER, onTick1);
	setGeometryPositions1.setInput(
		SetGeometryPositionsInputName.values,
		trackHand1,
		TrackHandActorNodeOutput.WORLD_LANDMARKS
	);
	trackHand1.setInput(ActorConnectionPointType.TRIGGER, onTick1);
	trackHand1.setInput(ActorConnectionPointType.TEXTURE, getTexture1);
	getTrackedHandProperty1.setInput(0, trackHand1, TrackHandActorNodeOutput.NORMALIZED_LANDMARKS);
	setObjectAttribute1.setInput(ActorConnectionPointType.TRIGGER, onTick1);
	setObjectAttribute1.setInput(ActorConnectionPointType.OBJECT_3D, getObject1);
	setObjectAttribute1.setInput(
		SetObjectAttributeActorNode.INPUT_NAME_VAL,
		getTrackedHandProperty1,
		GetTrackedHandPropertyActorNodeInputName.indexDirection
	);

	getObject1.p.getCurrentObject.set(false);
	getObject1.p.mask.set(`*/${directionAttribObjectName}`);
	setObjectAttribute1.p.attribName.set(attribName);
	setObjectAttribute1.setAttribType(ActorConnectionPointType.VECTOR3);

	const container = await merge1.compute();
	const objects = container.coreContent()!.objects();
	const trackedObject = objects[0] as Mesh;
	const attributeObject = objects[1];

	const center = new Vector3();
	let minX = 100000;
	let maxX = -minX;
	let wasPointingXPositive = false;
	let wasPointingYNegative = false;
	let wasPointingYPositive = false;
	function checkBounds() {
		const geometry = trackedObject.geometry;
		geometry.computeBoundingBox();
		const bbox = geometry.boundingBox;
		bbox?.getCenter(center);
		if (!bbox) {
			console.warn('no bbox');
			return;
		}

		if (bbox.min.x < minX) {
			minX = bbox.min.x;
		}
		if (bbox.max.x > maxX) {
			maxX = bbox.max.x;
		}

		// check dir
		const dir = CoreObject.attribValue(attributeObject, attribName) as Vector3;
		if (dir.x > dir.y && dir.x > dir.z) {
			wasPointingXPositive = true;
		}
		if (dir.y > dir.x && dir.y > dir.z) {
			wasPointingYPositive = true;
		}
		if (dir.y < dir.x && dir.y < dir.z) {
			wasPointingYNegative = true;
		}
	}

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.registerOnAfterTick('checkCenter', checkBounds);

		scene.play();
		assert.equal(scene.time(), 0);

		await CoreSleep.sleep(15000);

		scene.unRegisterOnAfterTick('checkCenter');
		assert.in_delta(minX, -0.0711, 0.02);
		assert.in_delta(maxX, 0.07584, 0.02);
		assert.ok(wasPointingXPositive);
		assert.ok(wasPointingYPositive);
		assert.ok(wasPointingYNegative);
	});

	video1.dispose();
});
