import {ASSETS_ROOT} from './../../../../src/core/loader/AssetsUtils';
QUnit.test('expression/len with node path', async (assert) => {
	const geo1 = window.geo1;

	const url = `${ASSETS_ROOT}/models/resources/quaternius/animals/Alpaca.gltf`;
	const fileGLTF1 = geo1.createNode('fileGLTF');
	fileGLTF1.p.url.set(url);

	const text1 = geo1.createNode('text');

	const param = text1.p.text;
	param.set(`\`len(animationNames('${fileGLTF1.path()}'))\``);

	await param.compute();
	assert.equal(param.value, '13');
});
