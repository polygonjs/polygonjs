import {Vector3, Box3} from 'three';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {TransformTargetType} from '../../../../src/core/Transform';
const tmpBox3 = new Box3();
const tmpV3 = new Vector3();

QUnit.test('expression bbox works with path', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	assert.equal(box1.name(), 'box1');
	const box2 = geo1.createNode('box');

	box2.p.size.set(`3*bbox('../${box1.name()}', 'max', 'x')`);

	await box2.p.size.compute();
	assert.equal(box2.p.size.value, 1.5);
});

QUnit.test('expression bbox works with index', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	box1.p.size.set(10);
	assert.equal(box1.name(), 'box1');
	const box2 = geo1.createNode('box');
	box2.setInput(0, box1);

	box2.p.divisions.set(`2*bbox(0, 'max', 'x')`);

	await box2.p.divisions.compute();
	assert.equal(box2.p.divisions.value, 10);
});

QUnit.test('expression bbox works without component', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	box1.p.size.set(25);
	assert.equal(box1.name(), 'box1');
	const box2 = geo1.createNode('box');
	box2.setInput(0, box1);

	box2.p.divisions.set(`2*bbox(0, 'max').x`);

	await box2.p.divisions.compute();
	assert.equal(box2.p.divisions.value, 25);
});

QUnit.test('expression bbox works without vector name', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	box1.p.size.set(15);
	assert.equal(box1.name(), 'box1');
	const box2 = geo1.createNode('box');
	box2.setInput(0, box1);

	box2.p.divisions.set(`2*bbox(0).max.x`);

	await box2.p.divisions.compute();
	assert.equal(box2.p.divisions.value, 15);
});

function _url(path: string) {
	return `${ASSETS_ROOT}${path}`;
}
QUnit.test('expression bbox works on hierarchy', async (assert) => {
	const geo1 = window.geo1;

	const fileNode = geo1.createNode('fileGLTF');
	fileNode.p.url.set(_url('models/car.glb'));
	fileNode.p.draco.set(1);

	const transform1 = geo1.createNode('transform');
	transform1.setInput(0, fileNode);
	transform1.setApplyOn(TransformTargetType.GEOMETRY);
	transform1.p.scale.set(`1 / bbox(0,"size").x`);

	await transform1.p.scale.compute();
	assert.in_delta(transform1.pv.scale, 0.24, 0.001, 'scale');

	async function getSize() {
		const container = await transform1.compute();
		container.coreContent()?.boundingBox(tmpBox3);
		tmpBox3.getSize(tmpV3);
		return tmpV3;
	}
	assert.in_delta((await getSize()).x, 1, 0.001, 'bbox');

	transform1.setApplyOn(TransformTargetType.OBJECT);
	assert.in_delta((await getSize()).x, 1, 0.0001, 'bbox');
});
