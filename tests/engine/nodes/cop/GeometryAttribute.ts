import type {QUnit} from '../../../helpers/QUnit';
import {DataTexture} from 'three';
export function testenginenodescopGeometryAttribute(qUnit: QUnit) {

qUnit.test('cop/geometryAttribute simple', async (assert) => {
	const COP = window.COP;
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');

	const geometryAttribute1 = COP.createNode('geometryAttribute');
	geometryAttribute1.p.node.setNode(box1);

	async function compute() {
		const container = await geometryAttribute1.compute();
		assert.notOk(geometryAttribute1.states.error.message());
		const texture = container.texture() as DataTexture;
		const width = texture.image.width;
		const height = texture.image.height;
		const data = texture.source.data.data as number[];
		return {
			texture,
			width,
			height,
			data,
		};
	}

	assert.equal((await compute()).width, 8);
	assert.equal((await compute()).height, 8);
	const data = (await compute()).data;
	assert.equal(data[0], 0.5);
	assert.equal(data[1], 0.5);
	assert.equal(data[2], 0.5);
	assert.equal(data[3], 0);
	assert.equal(data[4], 0.5);
	assert.equal(data[5], 0.5);
	assert.equal(data[6], -0.5);
	assert.equal(data[7], 0);
});

qUnit.test('cop/geometryAttribute with multiple attributes', async (assert) => {
	const COP = window.COP;
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const attribCreate1 = geo1.createNode('attribCreate');
	attribCreate1.setInput(0, box1);
	attribCreate1.p.name.set('test');
	attribCreate1.p.value1.set(`(@ptnum + 1) * 2`);

	const geometryAttribute1 = COP.createNode('geometryAttribute');
	geometryAttribute1.p.node.setNode(attribCreate1);
	geometryAttribute1.p.attribute.set('P test');

	async function compute() {
		const container = await geometryAttribute1.compute();
		assert.notOk(geometryAttribute1.states.error.message());
		const texture = container.texture() as DataTexture;
		const width = texture.image.width;
		const height = texture.image.height;
		const data = texture.source.data.data as number[];
		return {
			texture,
			width,
			height,
			data,
		};
	}

	assert.equal((await compute()).width, 8);
	assert.equal((await compute()).height, 8);
	const data = (await compute()).data;
	assert.equal(data[0], 0.5);
	assert.equal(data[1], 0.5);
	assert.equal(data[2], 0.5);
	assert.equal(data[3], 2, 'test 0');
	assert.equal(data[4], 0.5);
	assert.equal(data[5], 0.5);
	assert.equal(data[6], -0.5);
	assert.equal(data[7], 4, 'test 1');
	assert.equal(data[11], 6, 'test 2');
});

qUnit.test('cop/geometryAttribute errors with too many attributes', async (assert) => {
	const COP = window.COP;
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const attribCreate1 = geo1.createNode('attribCreate');
	attribCreate1.setInput(0, box1);
	attribCreate1.p.name.set('test');
	attribCreate1.p.value1.set(`(@ptnum + 1) * 2`);

	const attribCreate2 = geo1.createNode('attribCreate');
	attribCreate2.setInput(0, attribCreate1);
	attribCreate2.p.name.set('test2');
	attribCreate2.p.value1.set(`(@ptnum + 1) * 2`);

	const geometryAttribute1 = COP.createNode('geometryAttribute');
	geometryAttribute1.p.node.setNode(attribCreate2);
	geometryAttribute1.p.attribute.set('P test test2');

	await geometryAttribute1.compute();
	assert.equal(geometryAttribute1.states.error.message(), 'total size of attributes is 5, but maximum is 4');
});

}