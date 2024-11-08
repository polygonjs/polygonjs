import type {QUnit} from '../../../helpers/QUnit';
import {TransformTargetType} from '../../../../src/core/Transform';
import {Vector3} from 'three';
import { CorePoint } from '../../../../src/core/geometry/entities/point/CorePoint';
import { CoreObjectType } from '../../../../src/core/geometry/ObjectContent';

const _p = new Vector3();
const _points:CorePoint<CoreObjectType>[]=[]

export function testenginenodessopPolarTransform(qUnit: QUnit) {
	qUnit.test('sop/polarTransform simple', async (assert) => {
		const geo1 = window.geo1;

		const add1 = geo1.createNode('add');
		const polarTransform1 = geo1.createNode('polarTransform');
		polarTransform1.setInput(0, add1);

		polarTransform1.setApplyOn(TransformTargetType.GEOMETRY);

		let container, core_group;
		container = await polarTransform1.compute();
		core_group = container.coreContent();
		let geometry = core_group?.threejsObjectsWithGeo()[0].geometry;
		assert.ok(geometry);

		assert.equal(container.coreContent()!.pointsCount(), 1);
		container.coreContent()!.points(_points);
		assert.equal(_points[0].position(_p).x, 0);
		assert.equal(_points[0].position(_p).y, 0);
		assert.equal(_points[0].position(_p).z, 1);

		polarTransform1.p.latitude.set(90);

		container = await polarTransform1.compute();
		core_group = container.coreContent();
		geometry = core_group?.threejsObjectsWithGeo()[0].geometry;
		assert.ok(geometry);

		assert.equal(container.coreContent()!.pointsCount(), 1);
		container.coreContent()!.points(_points);
		assert.equal(_points[0].position(_p).x, 0);
		assert.in_delta(_points[0].position(_p).y, 1, 0.001);
		assert.in_delta(_points[0].position(_p).z, 0, 0.001);
	});
}
