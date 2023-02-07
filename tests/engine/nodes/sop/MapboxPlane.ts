import {CoreSleep} from './../../../../src/core/Sleep';
import {Poly} from '../../../../src/engine/Poly';
import {PolyScene} from '../../../../src/engine/scene/PolyScene';
import {BackgroundMode} from '../../../../src/engine/nodes/manager/utils/Scene/Background';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {CorePath} from '../../../../src/core/geometry/CorePath';
import {Camera} from 'three';
async function createCameraNodes(scene: PolyScene) {
	const cameras = scene.createNode('geo');
	cameras.setName('cameras');
	const mapboxCamera1 = cameras.createNode('mapboxCamera');

	const container = await mapboxCamera1.compute();
	const camera = container.coreContent()?.objects()[0]! as Camera;
	const objectPath = CorePath.objectPath(camera);
	scene.root().mainCameraController.setCameraPath(objectPath);
	scene.root().sceneBackgroundController.setMode(BackgroundMode.NONE);
	return {camera, mapboxCamera1};
}

QUnit.test('sop/mapboxPlane simple', async (assert) => {
	const scene = window.scene;

	const {camera, mapboxCamera1} = await createCameraNodes(scene);
	const geo1 = window.geo1;
	const mapboxPlane1 = geo1.createNode('mapboxPlane');
	const mapboxTransform1 = geo1.createNode('mapboxTransform');
	mapboxTransform1.setInput(0, mapboxPlane1);
	mapboxTransform1.flags.display.set(true);
	mapboxTransform1.p.longitude.set(mapboxCamera1.p.longitude.value);
	mapboxTransform1.p.latitude.set(mapboxCamera1.p.latitude.value);

	const viewer = Poly.camerasRegister.createViewer({camera, scene})!;
	assert.ok(viewer, 'viewer');
	await RendererUtils.withViewer({viewer, mount: true}, async ({viewer, element}) => {
		scene.play();
		await CoreSleep.sleep(2000);

		const container1 = await mapboxTransform1.compute();
		assert.ok(container1.coreContent());
		assert.more_than(container1.totalPointsCount(), 5000);
	});
});
