import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';

QUnit.test('expression cosRes works', async (assert) => {
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
