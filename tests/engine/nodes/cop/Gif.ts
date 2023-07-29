import type {QUnit} from '../../../helpers/QUnit';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
export function testenginenodescopGif(qUnit: QUnit) {

qUnit.test('COP gif simple', async (assert) => {
	const COP = window.COP;

	const file1 = COP.createNode('gif');
	file1.p.url.set(`${ASSETS_ROOT}/textures/horses.gif`);

	let container, texture;

	container = await file1.compute();
	assert.ok(!file1.states.error.message());
	texture = container.texture();
	assert.equal(texture.image.width, 402);
	assert.equal(texture.image.height, 280);
	assert.deepEqual(container.resolution(), [402, 280]);
});

}