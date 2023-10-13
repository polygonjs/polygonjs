import type {QUnit} from '../../../helpers/QUnit';
import type {BaseCorePoint, CorePoint} from '../../../../src/core/geometry/entities/point/CorePoint';
import {CoreObjectType} from '../../../../src/core/geometry/ObjectContent';

const _points: CorePoint<CoreObjectType>[] = [];

export function testengineexpressionsmethodsopdigits(qUnit: QUnit) {
	qUnit.test('expression opdigits works', async (assert) => {
		const geo1 = window.geo1;

		const line1 = geo1.createNode('line');
		const attrib_create1 = geo1.createNode('attribCreate');
		attrib_create1.p.name.set('ptid');
		attrib_create1.p.value1.set('opdigits(".")');
		attrib_create1.setInput(0, line1);

		let container = await attrib_create1.compute();
		assert.deepEqual(
			container
				.coreContent()!
				.points(_points)
				.map((p: BaseCorePoint) => p.attribValue('ptid')),
			[1, 1]
		);

		attrib_create1.setName('bla12');
		container = await attrib_create1.compute();
		assert.deepEqual(
			container
				.coreContent()!
				.points(_points)
				.map((p: BaseCorePoint) => p.attribValue('ptid')),
			[12, 12]
		);
	});
}
