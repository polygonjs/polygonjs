import type {QUnit} from '../../../helpers/QUnit';
import {Vector3} from 'three';
import {CoreObjectType} from '../../../../src/core/geometry/ObjectContent';
import {CorePoint} from '../../../../src/core/geometry/entities/point/CorePoint';

const _points: CorePoint<CoreObjectType>[] = [];

const _p = new Vector3();

export function testenginenodessopCurveGetPoint(qUnit: QUnit) {
	qUnit.test('sop/curveGetPoint simple', async (assert) => {
		const geo1 = window.geo1;

		const add1 = geo1.createNode('add');
		const add2 = geo1.createNode('add');
		const add3 = geo1.createNode('add');
		const add4 = geo1.createNode('add');
		const merge1 = geo1.createNode('merge');
		const curveFromPoints1 = geo1.createNode('curveFromPoints');
		const curveGetPoint1 = geo1.createNode('curveGetPoint');

		add1.p.position.set([0, 0, 0]);
		add2.p.position.set([2, 1, 3]);
		add3.p.position.set([12, 41, 62]);
		add4.p.position.set([-20, 120, -10]);

		merge1.setInput(0, add1);
		merge1.setInput(1, add2);
		merge1.setInput(2, add3);
		merge1.setInput(3, add4);
		merge1.setCompactMode(true);

		curveFromPoints1.setInput(0, merge1);
		curveGetPoint1.setInput(0, curveFromPoints1);

		let container = await curveGetPoint1.compute();
		let coreGroup = container.coreContent()!;
		assert.equal(coreGroup.pointsCount(), 1);
		let point = coreGroup.points(_points)[0];
		point.position(_p);
		assert.in_delta(_p.x, 0, 0.1);
		assert.in_delta(_p.y, 0, 0.1);
		assert.in_delta(_p.z, 0, 0.1);

		curveGetPoint1.p.t.set(0.5);
		container = await curveGetPoint1.compute();
		coreGroup = container.coreContent()!;
		assert.equal(coreGroup.pointsCount(), 1);
		point = coreGroup.points(_points)[0];
		point.position(_p);
		assert.in_delta(_p.x, 9.125, 0.1);
		assert.in_delta(_p.y, 16.125, 0.1);
		assert.in_delta(_p.z, 37.1875, 0.1);
	});
}
