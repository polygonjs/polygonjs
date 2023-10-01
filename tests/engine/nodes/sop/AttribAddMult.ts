import type {QUnit} from '../../../helpers/QUnit';
import type {CorePoint} from '../../../../src/core/geometry/entities/point/CorePoint';
export function testenginenodessopAttribAddMult(qUnit: QUnit) {
	qUnit.test('sop/attribAddMult simple', async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');
		const attrib_create1 = geo1.createNode('attribCreate');
		const attrib_add_mult1 = geo1.createNode('attribAddMult');
		attrib_create1.setInput(0, plane1);
		attrib_add_mult1.setInput(0, attrib_create1);

		attrib_create1.p.name.set('test');
		attrib_create1.p.value1.set('@ptnum');
		attrib_add_mult1.p.name.set('test');
		attrib_add_mult1.p.mult.set(0.5);

		let container, core_group, values;
		container = await attrib_create1.compute();
		core_group = container.coreContent()!;
		values = core_group.points().map((p: CorePoint) => p.attribValue('test'));
		assert.deepEqual(values, [0, 1, 2, 3]);

		container = await attrib_add_mult1.compute();
		core_group = container.coreContent()!;
		values = core_group.points().map((p: CorePoint) => p.attribValue('test'));
		assert.deepEqual(values, [0, 0.5, 1, 1.5]);
	});
}
