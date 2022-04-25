import {Mesh} from 'three';
import {Material} from 'three';
import {FrontSide, BackSide, DoubleSide} from 'three';
import {BaseNodeType} from '../../../../src/engine/nodes/_Base';

async function getMaterial(node: BaseNodeType) {
	const container = await node.compute();
	const object = container.coreContent()!.objects()[0] as Mesh;
	return object.material as Material;
}

QUnit.test('materialProperties simple', async (assert) => {
	const geo1 = window.geo1;
	const plane = geo1.createNode('plane');

	const material1 = await getMaterial(plane);
	assert.equal(material1.side, FrontSide);

	const materialProperties = geo1.createNode('materialProperties');
	materialProperties.setInput(0, plane);

	const material2 = await getMaterial(materialProperties);
	assert.equal(material2.side, FrontSide);

	materialProperties.p.tside.set(1);
	materialProperties.p.front.set(0);
	const material3 = await getMaterial(materialProperties);
	assert.equal(material3.side, BackSide);

	materialProperties.p.doubleSided.set(1);
	const material4 = await getMaterial(materialProperties);
	assert.equal(material4.side, DoubleSide);
});
