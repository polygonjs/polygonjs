import {CoreObjectType} from '../../../../src/core/geometry/ObjectContent';
import {CorePoint} from '../../../../src/core/geometry/entities/point/CorePoint';
import type {QUnit} from '../../../helpers/QUnit';
import {Vector3} from 'three';

const _p = new Vector3();
const _points: CorePoint<CoreObjectType>[] = [];

export function testenginenodessopData(qUnit: QUnit) {
	async function with_data(data_json?: object) {
		const geo1 = window.geo1;
		const data1 = geo1.createNode('data');
		if (data_json) {
			data1.p.data.set(JSON.stringify(data_json));
		}
		const container = await data1.compute();
		return {geo1, data1, container};
	}

	qUnit.test('sop/data default', async (assert) => {
		const {geo1, data1, container} = await with_data();
		assert.equal(container.coreContent()!.pointsCount(), 13);
		assert.equal((container.coreContent()!.points(_points)[0].attribValue('position') as Vector3).x, 0);
		assert.equal((container.coreContent()!.points(_points)[0].attribValue('position') as Vector3).y, 0);
		assert.equal((container.coreContent()!.points(_points)[0].attribValue('position') as Vector3).z, 0);
		assert.equal((container.coreContent()!.points(_points)[1].attribValue('position') as Vector3).x, 0);
		assert.equal((container.coreContent()!.points(_points)[2].attribValue('position') as Vector3).y, 0);
		assert.equal((container.coreContent()!.points(_points)[3].attribValue('position') as Vector3).z, 0);
		assert.equal(container.coreContent()!.points(_points)[0].attribValue('value'), -40);

		const point1 = geo1.createNode('point');
		point1.setInput(0, data1);
		point1.p.updateX.set(1);
		point1.p.x.set('@value / 100');

		const container2 = await point1.compute();
		assert.in_delta(
			(container2.coreContent()!.points(_points)[0].attribValue('position') as Vector3).x,
			-0.4,
			0.001
		);
		assert.equal((container2.coreContent()!.points(_points)[0].attribValue('position') as Vector3).y, 0);
		assert.equal((container2.coreContent()!.points(_points)[0].attribValue('position') as Vector3).z, 0);
	});

	qUnit.test('sop/data with position', async (assert) => {
		const data = [
			{value: 1, position: [-1, 0, 1]},
			{value: 2, position: [-2, 0, 1]},
		];
		const {container} = await with_data(data);
		assert.equal(container.coreContent()!.pointsCount(), 2);
		container.coreContent()!.points(_points);
		assert.equal(_points[0].attribValue('value'), 1);
		assert.equal(_points[1].attribValue('value'), 2);
		assert.deepEqual(_points[0].position(_p).toArray(), [-1, 0, 1]);
		assert.deepEqual(_points[1].position(_p).toArray(), [-2, 0, 1]);
	});

	qUnit.test('sop/data with position remaped', async (assert) => {
		const data = [
			{value: 1, P: [-1, 0, 1]},
			{value: 2, P: [-2, 0, 1]},
		];
		const {container} = await with_data(data);
		assert.equal(container.coreContent()!.pointsCount(), 2);
		container.coreContent()!.points(_points);
		assert.equal(_points[0].attribValue('value'), 1);
		assert.equal(_points[1].attribValue('value'), 2);
		assert.deepEqual(_points[0].position(_p).toArray(), [-1, 0, 1]);
		assert.deepEqual(_points[1].position(_p).toArray(), [-2, 0, 1]);
	});
}
