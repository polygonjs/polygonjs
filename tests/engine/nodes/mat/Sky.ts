import type {QUnit} from '../../../helpers/QUnit';
import {Mesh, Material} from 'three';
export function testenginenodesmatSky(qUnit: QUnit) {

qUnit.test('mat sky simple', async (assert) => {
	const MAT = window.MAT;
	const geo1 = window.geo1;
	const sky1 = MAT.createNode('sky');
	const sphere1 = geo1.createNode('sphere');
	const material1 = geo1.createNode('material');

	material1.setInput(0, sphere1);

	sphere1.p.radius.set(100000);
	material1.p.material.set(sky1.path());

	const container = await material1.compute();
	const core_group = container.coreContent()!;
	const objects = core_group.threejsObjectsWithGeo();
	const material = (objects[0] as Mesh).material as Material;

	assert.equal(material.uuid, (await sky1.material()).uuid);
});

}