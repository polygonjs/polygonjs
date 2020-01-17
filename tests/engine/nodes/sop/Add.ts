import {CoreConstant} from 'src/Core/Geometry/Constant';
import GeometryContainer from 'src/Engine/Container/Geometry';
import {CoreGroup} from 'src/Core/Geometry/Group';

QUnit.test('add simple', async (assert) => {
	const geo1 = window.geo1;
	const add1 = geo1.create_node('add');

	const container = await add1.request_container_p();
	const core_group = container.core_content();
	assert.equal(core_group.points().length, 1);
});
