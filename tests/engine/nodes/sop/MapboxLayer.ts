import {CoreSleep} from './../../../../src/core/Sleep';
import {Poly} from '../../../../src/engine/Poly';
import {PolyScene} from '../../../../src/engine/scene/PolyScene';
import {BaseParamType} from '../../../../src/engine/params/_Base';
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

QUnit.test('sop/mapboxLayer simple', async (assert) => {
	const scene = window.scene;

	const {camera, mapboxCamera1} = await createCameraNodes(scene);
	const geo1 = window.geo1;
	const mapboxLayer1 = geo1.createNode('mapboxLayer');
	const mapboxTransform1 = geo1.createNode('mapboxTransform');
	mapboxTransform1.setInput(0, mapboxLayer1);
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
		assert.equal(container1.totalPointsCount(), 0, 'no points yet');

		assert.equal(mapboxLayer1.params.spare.length, 0, 'no layers');
		await mapboxLayer1.p.updateLayers.pressButton();
		assert.equal(mapboxLayer1.params.spare.length, 83, 'some layers spare params');
		assert.deepEqual(mapboxLayer1.params.spare.map((param: BaseParamType) => param.name()).sort(), [
			'admin-0-boundary',
			'admin-0-boundary-bg',
			'admin-0-boundary-disputed',
			'admin-1-boundary',
			'admin-1-boundary-bg',
			'aeroway-line',
			'aeroway-polygon',
			'airport-label',
			'bridge-construction',
			'bridge-major-link',
			'bridge-major-link-2',
			'bridge-major-link-2-case',
			'bridge-major-link-case',
			'bridge-motorway-trunk',
			'bridge-motorway-trunk-2',
			'bridge-motorway-trunk-2-case',
			'bridge-motorway-trunk-case',
			'bridge-path',
			'bridge-pedestrian',
			'bridge-pedestrian-case',
			'bridge-primary-secondary-tertiary',
			'bridge-primary-secondary-tertiary-case',
			'bridge-rail',
			'bridge-steps',
			'bridge-street-minor',
			'bridge-street-minor-case',
			'bridge-street-minor-low',
			'building',
			'building-outline',
			'country-label',
			'hillshade',
			'land',
			'land-structure-line',
			'land-structure-polygon',
			'landcover',
			'landuse',
			'national-park',
			'natural-line-label',
			'natural-point-label',
			'poi-label',
			'road-construction',
			'road-label',
			'road-major-link',
			'road-major-link-case',
			'road-minor',
			'road-minor-case',
			'road-minor-low',
			'road-motorway-trunk',
			'road-motorway-trunk-case',
			'road-path',
			'road-pedestrian',
			'road-pedestrian-case',
			'road-primary',
			'road-primary-case',
			'road-rail',
			'road-secondary-tertiary',
			'road-secondary-tertiary-case',
			'road-steps',
			'road-street',
			'road-street-case',
			'road-street-low',
			'settlement-label',
			'settlement-subdivision-label',
			'state-label',
			'tunnel-construction',
			'tunnel-major-link',
			'tunnel-major-link-case',
			'tunnel-motorway-trunk',
			'tunnel-motorway-trunk-case',
			'tunnel-path',
			'tunnel-pedestrian',
			'tunnel-primary-secondary-tertiary',
			'tunnel-primary-secondary-tertiary-case',
			'tunnel-steps',
			'tunnel-street-minor',
			'tunnel-street-minor-case',
			'tunnel-street-minor-low',
			'water',
			'water-line-label',
			'water-point-label',
			'water-shadow',
			'waterway',
			'waterway-label',
		]);

		mapboxLayer1.params.get('road-path')!.set(true);
		const container2 = await mapboxTransform1.compute();
		assert.ok(container2.coreContent());
		assert.more_than(container2.totalPointsCount(), 1000, 'more than 1000 points created');
		await CoreSleep.sleep(500);
	});
});
