import type {QUnit} from '../../../helpers/QUnit';
// import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
export function testenginenodescopImageSequence(qUnit: QUnit) {

// qUnit.test('cop/imageSequence simple default', async (assert) => {
// 	const COP = window.COP;

// 	const imageSequence1 = COP.createNode('imageSequence');

// 	imageSequence1.p.frameRange.set([1, 9]);
// 	imageSequence1.p.url.set(`${ASSETS_ROOT}/textures/sequence/pano.%05d.jpg`);

// 	const container = await imageSequence1.compute();
// 	assert.ok(!imageSequence1.states.error.message());
// 	const texture = container.texture();
// 	assert.equal(texture.image.width, 1920);
// 	assert.deepEqual(container.resolution(), [1920, 1080]);
// });

// qUnit.test('cop/imageSequence simple with bad frame range', async (assert) => {
// 	const COP = window.COP;

// 	const imageSequence1 = COP.createNode('imageSequence');

// 	imageSequence1.p.frameRange.set([1, 10]);
// 	imageSequence1.p.url.set(`${ASSETS_ROOT}/textures/sequence/pano.%05d.jpg`);

// 	await imageSequence1.compute();
// 	assert.equal(
// 		imageSequence1.states.error.message(),
// 		`failed to load url 'https://raw.githubusercontent.com/polygonjs/polygonjs-assets/master//textures/sequence/pano.00010.jpg' (at frame 10)`
// 	);
// });

}