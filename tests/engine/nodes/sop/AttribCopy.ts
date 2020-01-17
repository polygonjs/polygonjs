import {CoreConstant} from 'src/Core/Geometry/Constant';
import {GeometryContainer} from 'src/Engine/Container/Geometry';
import {CoreGroup} from 'src/Core/Geometry/Group';

QUnit.test('attribcopy latitude to position', async (assert) => {
	const geo1 = window.geo1;
	const plane1 = geo1.create_node('plane');

	const attrib_create1 = geo1.create_node('attrib_create');
	attrib_create1.param('name').set('latitude');
	attrib_create1.param('size').set(1);
	attrib_create1.param('valuex').set_expression('@ptnum');
	attrib_create1.set_input(0, plane1);

	const attrib_create2 = geo1.create_node('attrib_create');
	attrib_create2.param('name').set('longitude');
	attrib_create2.param('size').set(1);
	attrib_create2.param('valuex').set_expression('2*@ptnum+1');
	attrib_create2.set_input(0, attrib_create1);

	const attrib_copy1 = geo1.create_node('attrib_copy');
	attrib_copy1.set_input(0, attrib_create2);
	attrib_copy1.set_input(1, attrib_create2);

	attrib_copy1.param('name').set('latitude');
	attrib_copy1.param('on_new_name').set(1);
	attrib_copy1.param('new_name').set('position');
	attrib_copy1.param('to_all_components').set(0);
	attrib_copy1.param('src_component').set(0);
	attrib_copy1.param('dest_component').set(0);

	let container = (await attrib_copy1.request_container_p()) as GeometryContainer;
	assert.notOk(attrib_copy1.error_message());
	let core_group = container.core_content();
	let geometry = core_group.objects()[0].geometry;
	assert.ok(core_group);
	assert.ok(geometry);

	let {array} = geometry.getAttribute('position');
	assert.equal(array.length, container.points_count() * 3);
	assert.equal(array[0], 0);
	assert.equal(array[3], 1);
	assert.equal(array[6], 2);
	assert.equal(array[2], -0.5);
	assert.equal(array[5], -0.5);
	assert.equal(array[8], +0.5);

	const attrib_copy2 = geo1.create_node('attrib_copy');
	attrib_copy2.set_input(0, attrib_copy1);
	attrib_copy2.set_input(1, attrib_copy1);

	attrib_copy2.param('name').set('longitude');
	attrib_copy2.param('on_new_name').set(1);
	attrib_copy2.param('new_name').set('position');
	attrib_copy2.param('to_all_components').set(0);
	attrib_copy2.param('src_component').set(0);
	attrib_copy2.param('dest_component').set(2);

	container = (await attrib_copy2.request_container_p()) as GeometryContainer;
	assert.notOk(attrib_copy2.error_message());
	core_group = container.core_content();
	geometry = core_group.objects()[0].geometry;
	assert.ok(core_group);
	assert.ok(geometry);

	array = geometry.getAttribute('position').array;
	assert.equal(array.length, container.points_count() * 3);
	assert.equal(array[0], 0);
	assert.equal(array[3], 1);
	assert.equal(array[6], 2);
	assert.equal(array[2], 1);
	assert.equal(array[5], 3);
	assert.equal(array[8], 5);
});
