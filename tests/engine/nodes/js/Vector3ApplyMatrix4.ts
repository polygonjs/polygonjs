import type {QUnit} from '../../../helpers/QUnit';
import {Vector3} from 'three';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
export function testenginenodesjsVector3ApplyMatrix4(qUnit: QUnit) {
	qUnit.test('js/vector3ApplyMatrix4', async (assert) => {
		const geo1 = window.geo1;
		const add1 = geo1.createNode('add');
		const pointBuilder1 = geo1.createNode('pointBuilder');

		pointBuilder1.setInput(0, add1);

		const globals = pointBuilder1.createNode('globals');
		const output = pointBuilder1.createNode('output');
		const polarTransform1 = pointBuilder1.createNode('polarTransform');
		const vector3ApplyMatrix4_1 = pointBuilder1.createNode('vector3ApplyMatrix4');

		output.setInput('position', vector3ApplyMatrix4_1);
		vector3ApplyMatrix4_1.setInput(JsConnectionPointType.VECTOR3, globals, 'position');
		vector3ApplyMatrix4_1.setInput(JsConnectionPointType.MATRIX4, polarTransform1);

		const _compute = async () => {
			const container = await pointBuilder1.compute();
			const position = new Vector3();
			const geometry = container.coreContent()!.threejsObjectsWithGeo()[0].geometry;
			position.fromBufferAttribute(geometry.attributes.position, 0);
			return {position: position.toArray().map(_precision)};
		};
		function precision(num: number, digits: number) {
			return Math.round(num * Math.pow(10, digits)) / Math.pow(10, digits);
		}
		const _precision = (num: number) => precision(num, 3);

		assert.deepEqual((await _compute()).position, [0, 0, 1], 'default');

		polarTransform1.p.longitude.set(90);
		assert.deepEqual((await _compute()).position, [1, 0, 0], 'lng 90');
		polarTransform1.p.longitude.set(180);
		assert.deepEqual((await _compute()).position, [0, 0, -1], 'lng 190');
		polarTransform1.p.longitude.set(270);
		assert.deepEqual((await _compute()).position, [-1, 0, 0], 'lng 270');
	});
}
