import type {QUnit} from '../../../helpers/QUnit';
import {pointsFromObject} from '../../../../src/core/geometry/entities/point/CorePointUtils';
import {GeometryContainer} from '../../../../src/engine/containers/Geometry';
import {ShearMode} from '../../../../src/engine/operations/sop/Shear';
import {Vector3} from 'three';
import { CoreObjectType } from '../../../../src/core/geometry/ObjectContent';
import { CorePoint } from '../../../../src/core/geometry/entities/point/CorePoint';
export function testenginenodessopShear(qUnit: QUnit) {
	const _position = new Vector3();
	function getMinMaxPointYPos(container: GeometryContainer) {
		const object = container.coreContent()!.threejsObjectsWithGeo()[0];
		object.geometry.computeBoundingBox();
		const points:CorePoint<CoreObjectType>[]=[]
		pointsFromObject(object, points);
		const posYs = points
			.map((point) => {
				point.position(_position);
				return _position.y;
			})
			.sort();
		return {
			min: posYs[0],
			max: posYs[posYs.length - 1],
		};
	}

	qUnit.test('shear simple', async (assert) => {
		const geo1 = window.geo1;

		const box1 = geo1.createNode('box');
		const shear = geo1.createNode('shear');
		shear.setInput(0, box1);

		// matrix mode
		shear.setMode(ShearMode.MATRIX);
		let container = await shear.compute();
		assert.deepEqual(getMinMaxPointYPos(container), {min: -0.5, max: 0.5});

		shear.p.xy.set(1);
		shear.p.xz.set(0);
		container = await shear.compute();
		assert.deepEqual(getMinMaxPointYPos(container), {min: -1, max: 1});

		shear.p.xy.set(0);
		shear.p.xz.set(4);
		container = await shear.compute();
		assert.deepEqual(getMinMaxPointYPos(container), {min: -0.5, max: 0.5});

		// axis mode
		shear.setMode(ShearMode.AXIS);
		container = await shear.compute();
		assert.deepEqual(getMinMaxPointYPos(container), {min: -0.5, max: 0.5});

		shear.p.axisAmount.set(1.5);
		container = await shear.compute();
		assert.deepEqual(getMinMaxPointYPos(container), {min: -0.25, max: 1.25});

		shear.p.axisAmount.set(-3);
		container = await shear.compute();
		assert.deepEqual(getMinMaxPointYPos(container), {min: -1, max: 2});
	});
}
