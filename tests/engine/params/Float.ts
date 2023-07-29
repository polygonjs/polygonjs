import type {QUnit} from '../../helpers/QUnit';
import {ASSETS_ROOT} from '../../../src/core/loader/AssetsUtils';
export function testengineparamsFloat(qUnit: QUnit) {

qUnit.test('float eval correctly when set to different values', async (assert) => {
	const geo1 = window.geo1;

	const scale = geo1.p.scale;

	scale.set(2);
	await scale.compute();
	assert.equal(scale.value, 2);

	scale.set('2+1');
	await scale.compute();
	assert.equal(scale.value, 3);

	scale.set('(2+1) * 0.5');
	await scale.compute();
	assert.equal(scale.value, 1.5);
});

qUnit.test('float hasExpression() returns false when removing the expression', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const param = box1.p.center.y;

	param.set(2);
	assert.notOk(param.hasExpression());

	param.set('2+2');
	assert.ok(param.hasExpression());

	param.set(2);
	assert.notOk(param.hasExpression());

	param.set('-2.5');
	assert.notOk(param.hasExpression());
	assert.equal(param.value, -2.5);

	param.set('-2.5*$F');
	assert.ok(param.hasExpression());
});

qUnit.test('float param can take an expression returning a boolean', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const param = box1.p.size;

	param.set('1+1');
	await param.compute();
	assert.equal(param.value, 2);

	scene.setFrame(1);
	param.set('$F>10');
	await param.compute();
	assert.equal(param.value, 0);

	scene.setFrame(11);
	await param.compute();
	assert.equal(param.value, 1);
});

qUnit.test('serialized value is float if numerical value entered as a string', async (assert) => {
	const geo1 = window.geo1;

	const attrib_create1 = geo1.createNode('attribCreate');
	const param = attrib_create1.p.value1;

	param.set('12.5');
	// this is important when saving nodes,
	// as there was an issue with the icosahedron being saved with details='44' as a string
	// and that created a much larger points count
	// for optimized nodes, as the string was not converted to an int
	assert.equal(param.rawInputSerialized(), 12.5);
});

qUnit.test('a float param can clear its error when missing ref is solved', async (assert) => {
	const geo1 = window.geo1;
	const COP = window.COP;
	const text1 = geo1.createNode('text');
	const param = text1.p.size;

	await param.compute();
	assert.equal(param.value, 1);

	param.set(`copRes('/COP/video1','x')`);
	const videoPath = '/COP/video1';
	await param.compute();
	assert.equal(param.value, 1);
	assert.ok(param.states.error.active());
	assert.equal(
		param.states.error.message(),
		"expression error: \"copRes('/COP/video1','x')\" (invalid input (/COP/video1))"
	);

	const video1 = COP.createNode('video');
	assert.equal(video1.path(), videoPath);
	video1.p.url1.set(`${ASSETS_ROOT}/textures/sintel.mp4`);
	video1.p.url2.set(`${ASSETS_ROOT}/textures/sintel.ogv`);
	// await video1.compute();

	assert.ok(param.isDirty());
	await param.compute();
	assert.equal(param.value, 480);
	assert.notOk(param.states.error.active());
	assert.notOk(param.states.error.message());

	setTimeout(() => video1.dispose(), 100);
});

qUnit.test('a float param can clear its error when expression resolves', async (assert) => {
	const geo1 = window.geo1;
	const COP = window.COP;
	const text1 = geo1.createNode('text');
	const param = text1.p.size;

	const videoPath = '/COP/video1';
	const video1 = COP.createNode('video');
	assert.equal(video1.path(), videoPath);

	await param.compute();
	assert.equal(param.value, 1);

	param.set(`copRes('/COP/video1','x')`);

	await param.compute();
	assert.equal(param.value, 1);
	assert.ok(param.states.error.active());
	assert.equal(
		param.states.error.message(),
		"expression error: \"copRes('/COP/video1','x')\" (referenced node invalid: /COP/video1)"
	);

	video1.p.url1.set(`${ASSETS_ROOT}/textures/sintel.mp4`);
	video1.p.url2.set(`${ASSETS_ROOT}/textures/sintel.mp4`);
	// await video1.compute();

	assert.ok(param.isDirty());
	await param.compute();
	assert.equal(param.value, 480);
	assert.notOk(param.states.error.active());
	assert.notOk(param.states.error.message());

	setTimeout(() => video1.dispose(), 100);
});

}