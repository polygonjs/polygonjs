import type {QUnit} from '../../../helpers/QUnit';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
export function testengineexpressionsmethodscopRes(qUnit: QUnit) {

qUnit.test('expression cosRes works', async (assert) => {
	const geo1 = window.geo1;
	const COP = window.COP;

	const image1 = COP.createNode('image');
	image1.p.url.set(`${ASSETS_ROOT}/textures/uv.jpg`);

	const tx = geo1.p.t.x;

	tx.set(2);
	await tx.compute();
	assert.equal(tx.value, 2);

	tx.set(`copRes('${image1.path()}', 'x')`);
	await tx.compute();
	assert.equal(tx.value, 512);

	tx.set(`copRes('${image1.path()}', 'y')`);
	await tx.compute();
	assert.equal(tx.value, 512);

	tx.set(`copRes('${image1.path()}').x`);
	await tx.compute();
	assert.equal(tx.value, 512);

	tx.set(`copRes('${image1.path()}').y`);
	await tx.compute();
	assert.equal(tx.value, 512);
});

qUnit.test('expression cosRes updates if referenced cop updates', async (assert) => {
	const geo1 = window.geo1;
	const COP = window.COP;

	const image1 = COP.createNode('image');

	const tx = geo1.p.t.x;

	tx.set(2);
	await tx.compute();
	assert.equal(tx.value, 2);

	tx.set(`copRes('${image1.path()}', 'x')`);
	await tx.compute();
	assert.equal(tx.value, 512);

	image1.p.url.set(
		`${ASSETS_ROOT}/textures/resources/artvee.com/Bouquet-of-Flowers-in-a-Blue-Porcelain-Vase-by-Anne-Vallayer-Coster.jpg`
	);
	tx.set(`copRes('${image1.path()}', 'x')`);
	await tx.compute();
	assert.equal(tx.value, 2128);
});

qUnit.test('expression cosRes updates if referenced video updates', async (assert) => {
	const geo1 = window.geo1;
	const COP = window.COP;

	const tx = geo1.p.t.x;

	tx.set(2);
	await tx.compute();
	assert.equal(tx.value, 2);

	const videoPath = '/COP/video1';
	tx.set(`copRes('${videoPath}', 'x')`);
	await tx.compute();
	assert.equal(tx.value, 2);
	assert.ok(tx.states.error.active());
	assert.equal(
		tx.states.error.message(),
		"expression error: \"copRes('/COP/video1', 'x')\" (invalid input (/COP/video1))"
	);

	const video = COP.createNode('video');
	assert.equal(video.path(), videoPath);
	video.p.url1.set(`${ASSETS_ROOT}/textures/sintel.mp4`);
	video.p.url2.set(`${ASSETS_ROOT}/textures/sintel.ogv`);
	tx.set(`copRes('${videoPath}', 'x')`);
	await tx.compute();
	assert.equal(tx.value, 480);
	assert.notOk(tx.states.error.active());
	assert.notOk(tx.states.error.message());
});

}