import {Mesh} from 'three/src/objects/Mesh';
import {Material} from 'three/src/materials/Material';

QUnit.test('materials simple', async (assert) => {
	const geo1 = window.geo1;
	const MAT = window.MAT;

	const plane1 = geo1.create_node('plane');
	const material1 = geo1.create_node('material');
	const lambert1 = MAT.create_node('mesh_lambert');

	material1.set_input(0, plane1);
	material1.p.material.set(lambert1.full_path());

	let container;

	container = await material1.request_container();
	const first_object = container.core_content()!.objects()[0] as Mesh;
	const material = first_object.material as Material;
	assert.equal(material.uuid, lambert1.material.uuid);
});
