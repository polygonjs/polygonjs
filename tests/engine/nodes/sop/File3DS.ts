import type {QUnit} from '../../../helpers/QUnit';
import type {Mesh, MeshPhongMaterial} from 'three';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
// import {CoreSleep} from '../../../../src/core/Sleep';
// import {RendererUtils} from '../../../helpers/RendererUtils';
export function testenginenodessopFile3DS(qUnit: QUnit) {
	function _url(path: string) {
		return `${ASSETS_ROOT}${path}`;
	}

	async function withFile3DS(path: string) {
		const geo1 = window.geo1;
		const fileNode = geo1.createNode('file3DS');
		fileNode.p.url.set(_url(path));

		const container = await fileNode.compute();
		return {container, fileNode};
	}

	qUnit.test('sop/file3DS portalgun', async (assert) => {
		// const cameraNode = window.perspective_camera1;
		const {container} = await withFile3DS('models/3ds/portalgun/portalgun.3ds');
		assert.equal(container.pointsCount(), 0);

		const objects1 = container.coreContent()?.threejsObjects()!;
		assert.equal(objects1?.length, 1);
		const child = objects1[0].children[0] as Mesh;
		const geometry = child.geometry;
		const position = geometry.attributes.position;
		assert.equal(position.count, 3870, 'pos');
		const material = child.material as MeshPhongMaterial;
		const map = material.map!;
		assert.ok(map, 'map');

		// I'm not quite sure yet how to test the presence and size of the source image
		// await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
		// 	for (const c of objects1) {
		// 		c.traverse((cc: Object3D) => (cc.frustumCulled = false));
		// 	}
		// 	// textures are currently assigned async inside threejs TDSLoader,
		// 	// so we sleep before testing the image
		// 	CoreSleep.sleep(500);
		// 	const img = map.source.data as HTMLImageElement;
		// 	console.log('map', map, map.source, map.source.data);
		// 	assert.ok(img, 'img');
		// 	assert.equal(img.width, 512);
		// 	assert.equal(img.height, 512);
		// });
	});
}
