import type {QUnit} from '../../../helpers/QUnit';
import {CorePoint} from '../../../../src/core/geometry/Point';
import {Vector3} from 'three';
const _normal = new Vector3();

export function testenginenodessopNormals(qUnit: QUnit) {
	qUnit.test('sop/normals simple', async (assert) => {
		const geo1 = window.geo1;

		const sphere1 = geo1.createNode('sphere');
		sphere1.p.resolution.set([8, 6]);
		const noise1 = geo1.createNode('noise');
		const normals1 = geo1.createNode('normals');

		noise1.setInput(0, sphere1);
		normals1.setInput(0, noise1);

		noise1.p.computeNormals.set(0);
		noise1.p.octaves.set(1);

		let container, normal;

		container = await noise1.compute();
		normal = container.coreContent()!.points()[0].normal(_normal).toArray();
		assert.in_delta(normal[0], 0, 0.05);
		assert.in_delta(normal[1], 1, 0.05);
		assert.in_delta(normal[2], 0, 0.05);

		container = await normals1.compute();
		normal = container.coreContent()!.points()[0].normal(_normal).toArray();
		assert.in_delta(normal[0], 0.05, 0.05);
		assert.in_delta(normal[1], -0.95, 0.05);
		assert.in_delta(normal[2], -0.4, 0.05);

		normals1.p.invert.set(1);
		container = await normals1.compute();
		normal = container.coreContent()!.points()[0].normal(_normal).toArray();
		assert.in_delta(normal[0], -0.05, 0.05);
		assert.in_delta(normal[1], 0.95, 0.05);
		assert.in_delta(normal[2], 0.4, 0.05);
	});

	qUnit.test('sop/normals with non entity dependent expression', async (assert) => {
		const geo1 = window.geo1;

		const sphere1 = geo1.createNode('sphere');
		const sphere2 = geo1.createNode('sphere');
		sphere1.p.resolution.set([8, 6]);
		const normals1 = geo1.createNode('normals');

		normals1.setInput(0, sphere1);

		async function _getFirstNormal() {
			const container = await normals1.compute();
			return container.coreContent()!.points()[0].normal(_normal);
		}

		normals1.p.edit.set(true);
		normals1.p.updateX.set(true);
		normals1.p.x.set(`ch('../${sphere2.name()}/radius')`);
		sphere2.p.radius.set(2);

		assert.in_delta((await _getFirstNormal()).x, 2, 0.001);
		sphere2.p.radius.set(4);
		assert.in_delta((await _getFirstNormal()).x, 4, 0.001);

		normals1.p.invert.set(1);
		assert.in_delta((await _getFirstNormal()).x, -4, 0.001);
	});

	qUnit.test('sop/normals with  entity dependent expression', async (assert) => {
		const geo1 = window.geo1;

		const sphere1 = geo1.createNode('sphere');
		const sphere2 = geo1.createNode('sphere');
		sphere1.p.resolution.set([8, 6]);
		const normals1 = geo1.createNode('normals');

		normals1.setInput(0, sphere1);

		async function _getNormals() {
			const container = await normals1.compute();
			return container
				.coreContent()!
				.points()
				.map((p: CorePoint) => p.normal(_normal).clone());
		}

		normals1.p.edit.set(true);
		normals1.p.updateX.set(true);
		normals1.p.x.set(`ch('../${sphere2.name()}/radius')+2*(1+@ptnum)`);
		sphere2.p.radius.set(2);

		assert.in_delta((await _getNormals())[0].x, 4, 0.001);
		assert.in_delta((await _getNormals())[1].x, 6, 0.001);

		sphere2.p.radius.set(0);
		assert.in_delta((await _getNormals())[0].x, 2, 0.001);
		assert.in_delta((await _getNormals())[1].x, 4, 0.001);
	});
}
