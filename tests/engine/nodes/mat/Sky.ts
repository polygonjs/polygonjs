import {Mesh} from 'three/src/objects/Mesh';
import {Material} from 'three/src/materials/Material';

QUnit.test('mat sky simple', async (assert) => {
	const MAT = window.MAT;
	const geo1 = window.geo1;
	const sky1 = MAT.createNode('sky');
	const sphere1 = geo1.createNode('sphere');
	const material1 = geo1.createNode('material');

	material1.setInput(0, sphere1);

	sphere1.p.radius.set(100000);
	material1.p.material.set(sky1.fullPath());

	const container = await material1.request_container();
	const core_group = container.core_content()!;
	const objects = core_group.objects_with_geo();
	const material = (objects[0] as Mesh).material as Material;

	assert.equal(material.uuid, sky1.material.uuid);
});
