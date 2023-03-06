import {CoreGeometry} from '../../../../src/core/geometry/Geometry';
import {GeometryContainer} from '../../../../src/engine/containers/Geometry';
import {ShearMode} from '../../../../src/engine/operations/sop/Shear';

function getMinMaxPointYPos(container: GeometryContainer) {
	let geometry = container.coreContent()!.threejsObjectsWithGeo()[0].geometry;
	geometry.computeBoundingBox();
	const coreGeo = new CoreGeometry(geometry);
	const points = coreGeo.points();
	const posYs = points.map((point) => point.position().y).sort();
	return {
		min: posYs[0],
		max: posYs[posYs.length - 1],
	};
}

QUnit.test('shear simple', async (assert) => {
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
