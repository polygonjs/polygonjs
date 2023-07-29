import type {QUnit} from '../../../helpers/QUnit';
export function testenginenodessopAttribRename(qUnit: QUnit) {
	qUnit.test('sop/attribRename simple', async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');
		const attrib_create1 = geo1.createNode('attribCreate');
		const attrib_rename1 = geo1.createNode('attribRename');
		attrib_create1.setInput(0, plane1);
		attrib_rename1.setInput(0, attrib_create1);

		attrib_create1.p.name.set('test');
		attrib_create1.p.value1.set('@ptnum');
		attrib_rename1.p.oldName.set('test');
		attrib_rename1.p.newName.set('test2');

		let container, core_group, geometry;
		container = await attrib_create1.compute();
		core_group = container.coreContent()!;
		geometry = core_group.threejsObjectsWithGeo()[0].geometry;
		assert.ok(geometry.getAttribute('test'));
		assert.notOk(geometry.getAttribute('test2'));

		container = await attrib_rename1.compute();
		core_group = container.coreContent()!;
		geometry = core_group.threejsObjectsWithGeo()[0].geometry;
		assert.notOk(geometry.getAttribute('test'));
		assert.ok(geometry.getAttribute('test2'));
	});

	qUnit.test('sop/attribRename multiple', async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');
		const attribCreate1 = geo1.createNode('attribCreate');
		const attribCreate2 = geo1.createNode('attribCreate');
		const attribCreate3 = geo1.createNode('attribCreate');
		const attribRename1 = geo1.createNode('attribRename');
		attribCreate1.setInput(0, plane1);
		attribCreate2.setInput(0, attribCreate1);
		attribCreate3.setInput(0, attribCreate2);
		attribRename1.setInput(0, attribCreate3);

		attribCreate1.p.name.set('_a');
		attribCreate2.p.name.set('_b');
		attribCreate3.p.name.set('_c');
		attribRename1.p.oldName.set('_a _b _c');
		attribRename1.p.newName.set('a b c');

		const container = await attribRename1.compute();
		const coreGroup = container.coreContent()!;
		const geometry = coreGroup.threejsObjectsWithGeo()[0].geometry;
		assert.notOk(geometry.getAttribute('_a'));
		assert.ok(geometry.getAttribute('a'));
		assert.notOk(geometry.getAttribute('_b'));
		assert.ok(geometry.getAttribute('b'));
		assert.notOk(geometry.getAttribute('_c'));
		assert.ok(geometry.getAttribute('c'));
	});
}
