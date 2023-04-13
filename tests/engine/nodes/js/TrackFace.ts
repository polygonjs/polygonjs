import {Mesh, Vector3} from 'three';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {CoreSleep} from '../../../../src/core/Sleep';
import {TransformTargetType} from '../../../../src/core/Transform';
import {SetGeometryPositionsInputName} from '../../../../src/engine/nodes/js/SetGeometryPositions';
import {TrackFaceJsNodeOutput} from '../../../../src/engine/nodes/js/TrackFace';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('js/trackFace', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const COP = window.COP;

	// lights
	scene.root().createNode('hemisphereLight');

	// face
	const trackingLandmarksFace1 = geo1.createNode('trackingLandmarksFace');
	const trackingLandmarksFaceAttributes1 = geo1.createNode('trackingLandmarksFaceAttributes');
	const transform1 = geo1.createNode('transform');
	const actor1 = geo1.createNode('actor');
	trackingLandmarksFaceAttributes1.setInput(0, trackingLandmarksFace1);
	transform1.setInput(0, trackingLandmarksFaceAttributes1);
	actor1.setInput(0, transform1);
	actor1.flags.display.set(true);
	transform1.setApplyOn(TransformTargetType.OBJECT);
	transform1.p.t.set([0, -0.5, -2]);
	transform1.p.r.set([0, 180, 0]);

	// video
	const video1 = COP.createNode('video');
	video1.p.urlsCount.set(1);
	video1.p.url1.set(`${ASSETS_ROOT}/computerVision/tests/face.mp4`);
	video1.p.tflipY.set(true);
	video1.p.flipY.set(true);

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
	const trackFace1 = actor1.createNode('trackFace');
	const getTexture1 = actor1.createNode('getTexture');

	getTexture1.p.node.setNode(video1);
	setGeometryPositions1.setInput(JsConnectionPointType.TRIGGER, onTick1);
	setGeometryPositions1.setInput(SetGeometryPositionsInputName.values, trackFace1, TrackFaceJsNodeOutput.LANDMARKS);
	trackFace1.setInput(JsConnectionPointType.TRIGGER, onTick1);
	trackFace1.setInput(JsConnectionPointType.TEXTURE, getTexture1);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;

	const center = new Vector3();
	let minX = 100000;
	let maxX = -minX;
	function checkBounds() {
		const geometry = object.geometry;
		geometry.computeBoundingBox();
		const bbox = geometry.boundingBox;
		bbox?.getCenter(center);
		if (!bbox) {
			console.warn('no bbox');
			return;
		}

		if (bbox.min.x > 0 && bbox.min.x < minX) {
			minX = bbox.min.x;
		}
		if (bbox.max.x > maxX) {
			maxX = bbox.max.x;
		}
	}

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.registerOnAfterTick('checkCenter', checkBounds);

		scene.play();
		assert.equal(scene.time(), 0);

		await CoreSleep.sleep(10000);

		scene.unRegisterOnAfterTick('checkCenter');
		assert.in_delta(minX, 0.3166, 0.1);
		assert.in_delta(maxX, 0.8258, 0.1);
	});

	video1.dispose();
});
