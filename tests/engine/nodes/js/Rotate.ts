import type {QUnit} from '../../../helpers/QUnit';
import {Vector3, BufferAttribute} from 'three';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {JsRotateMode, JsRotateInputNameAxisMode} from '../../../../src/engine/nodes/js/Rotate';
export function testenginenodesjsRotate(qUnit: QUnit) {
	qUnit.test('js/rotate with quat', async (assert) => {
		const geo1 = window.geo1;
		const sphere1 = geo1.createNode('sphere');
		const pointBuilder1 = geo1.createNode('pointBuilder');

		pointBuilder1.setInput(0, sphere1);

		const globals = pointBuilder1.createNode('globals');
		const output = pointBuilder1.createNode('output');
		const rotate1 = pointBuilder1.createNode('rotate');
		const quaternion1 = pointBuilder1.createNode('quaternion');

		output.setInput('position', rotate1);
		rotate1.setMode(JsRotateMode.QUAT);
		rotate1.setInput(JsConnectionPointType.VECTOR3, globals, 'position');
		rotate1.setInput(JsConnectionPointType.QUATERNION, quaternion1);
		quaternion1.p.angle.set(0);

		const midNormal = new Vector3();
		const _compute = async () => {
			const container = await pointBuilder1.compute();
			const errorMessage = pointBuilder1.states.error.message();
			const pointsCount = container.pointsCount();
			midNormal.fromBufferAttribute(
				container.coreContent()!.threejsObjectsWithGeo()[0].geometry.getAttribute('normal') as BufferAttribute,
				Math.floor(pointsCount / 2)
			);
			return {errorMessage, pointsCount, midNormal};
		};
		function precision(num: number, digits: number) {
			return Math.round(num * Math.pow(10, digits)) / Math.pow(10, digits);
		}
		const _precision = (num: number) => precision(num, 3);

		assert.deepEqual((await _compute()).midNormal.toArray().map(_precision), [1, 0, 0], 'mid normal default');
		quaternion1.p.angle.set(0.5 * Math.PI);
		assert.deepEqual((await _compute()).midNormal.toArray().map(_precision), [0, 0, -1], 'mid normal updated');

		pointBuilder1.p.updateNormals.set(0);
		assert.deepEqual((await _compute()).midNormal.toArray().map(_precision), [1, 0, 0], 'mid normal not updated');

		pointBuilder1.p.updateNormals.set(1);
		assert.deepEqual((await _compute()).midNormal.toArray().map(_precision), [0, 0, -1], 'mid normal updated');

		// for update normals
		const constant1 = pointBuilder1.createNode('constant');
		constant1.setJsType(JsConnectionPointType.VECTOR3);
		constant1.p.vector3.set([0, 1, 0]);
		output.setInput('normal', constant1);
		assert.deepEqual((await _compute()).midNormal.toArray().map(_precision), [0, 1, 0], 'mid normal up');
	});

	qUnit.test('js/rotate with axis/angle', async (assert) => {
		const geo1 = window.geo1;
		const sphere1 = geo1.createNode('sphere');
		const pointBuilder1 = geo1.createNode('pointBuilder');

		pointBuilder1.setInput(0, sphere1);

		const globals = pointBuilder1.createNode('globals');
		const output = pointBuilder1.createNode('output');
		const rotate1 = pointBuilder1.createNode('rotate');
		const constantAxis = pointBuilder1.createNode('constant');
		const constantAngle = pointBuilder1.createNode('constant');

		output.setInput('position', rotate1);
		rotate1.setMode(JsRotateMode.AXIS);
		rotate1.setInput(JsConnectionPointType.VECTOR3, globals, 'position');
		rotate1.setInput(JsRotateInputNameAxisMode.AXIS, constantAxis);
		rotate1.setInput(JsRotateInputNameAxisMode.ANGLE, constantAngle);
		constantAxis.setJsType(JsConnectionPointType.VECTOR3);
		constantAxis.p.vector3.set([0, 1, 0]);
		constantAngle.setJsType(JsConnectionPointType.FLOAT);
		constantAngle.p.float.set(0);

		const midNormal = new Vector3();
		const _compute = async () => {
			const container = await pointBuilder1.compute();
			const errorMessage = pointBuilder1.states.error.message();
			const pointsCount = container.pointsCount();
			midNormal.fromBufferAttribute(
				container.coreContent()!.threejsObjectsWithGeo()[0].geometry.getAttribute('normal') as BufferAttribute,
				Math.floor(pointsCount / 2)
			);
			return {errorMessage, pointsCount, midNormal};
		};
		function precision(num: number, digits: number) {
			return Math.round(num * Math.pow(10, digits)) / Math.pow(10, digits);
		}
		const _precision = (num: number) => precision(num, 3);

		assert.deepEqual((await _compute()).midNormal.toArray().map(_precision), [1, 0, 0], 'mid normal default');
		constantAngle.p.float.set(0.5 * Math.PI);
		assert.deepEqual((await _compute()).midNormal.toArray().map(_precision), [0, 0, -1], 'mid normal updated');

		pointBuilder1.p.updateNormals.set(0);
		assert.deepEqual((await _compute()).midNormal.toArray().map(_precision), [1, 0, 0], 'mid normal not updated');

		pointBuilder1.p.updateNormals.set(1);
		assert.deepEqual((await _compute()).midNormal.toArray().map(_precision), [0, 0, -1], 'mid normal updated');

		// for update normals
		const constant1 = pointBuilder1.createNode('constant');
		constant1.setJsType(JsConnectionPointType.VECTOR3);
		constant1.p.vector3.set([0, 1, 0]);
		output.setInput('normal', constant1);
		assert.deepEqual((await _compute()).midNormal.toArray().map(_precision), [0, 1, 0], 'mid normal up');
	});
}
