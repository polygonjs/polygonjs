import type {QUnit} from '../../../helpers/QUnit';
import type {Mesh} from 'three';

export function testenginenodessopAdjacency(qUnit: QUnit) {
	qUnit.test('sop/adjacency simple', async (assert) => {
		const geo1 = window.geo1;

		const plane1 = geo1.createNode('plane');
		const adjacency1 = geo1.createNode('adjacency');
		adjacency1.setInput(0, plane1);

		async function compute() {
			const container = await adjacency1.compute();
			const coreGroup = container.coreContent()!;

			const object = coreGroup.threejsObjects()[0];
			const geometry = (object as Mesh).geometry;
			const attribNames = Object.keys(geometry.attributes);
			return {attribNames, geometry};
		}

		let data = await compute();
		let geometry = data.geometry;
		let attribNames = data.attribNames;

		assert.deepEqual(attribNames.sort(), [
			'adjacency0',
			'attribLookupId',
			'attribLookupUv',
			'normal',
			'position',
			'uv',
		]);
		assert.equal((geometry.attributes.adjacency0.array ).join(','), '2,-1,0,2,3,1,1,-1', 'adjacency0');
		assert.equal(
			(geometry.attributes.attribLookupUv.array ).join(','),
			'0.25,0.25,0.75,0.25,0.25,0.75,0.75,0.75',
			'attribLookupUv'
		);
		assert.equal((geometry.attributes.attribLookupId.array).join(','), '0,1,2,3', 'attribLookupId');

		// with sphere
		const sphere1 = geo1.createNode('sphere');
		adjacency1.setInput(0, sphere1);
		data = await compute();
		geometry = data.geometry;
		attribNames = data.attribNames;
		assert.deepEqual(attribNames.sort(), [
			'adjacency0',
			'adjacency1',
			'adjacency2',
			'attribLookupId',
			'attribLookupUv',
			'normal',
			'position',
			'uv',
		]);
		assert.equal(geometry.attributes.adjacency0.array.length, 1922, 'adjacency0');
		assert.equal(geometry.attributes.adjacency1.array.length, 1922, 'adjacency1');
		assert.equal(geometry.attributes.adjacency2.array.length, 1922, 'adjacency2');
	});
}
