import type {QUnit} from '../../../helpers/QUnit';
import {Mesh, ShaderMaterial} from 'three';
export function testenginenodesmatCode(qUnit: QUnit) {

qUnit.test('mat/code simple', async (assert) => {
	const MAT = window.MAT;
	const geo1 = window.geo1;
	const code1 = MAT.createNode('code');

	const box1 = geo1.createNode('box');
	const material1 = geo1.createNode('material');

	material1.setInput(0, box1);
	material1.p.material.setNode(code1);

	const container = await material1.compute();
	const object = container.coreContent()!.allObjects()[0];
	const material = (object as Mesh).material as ShaderMaterial;
	assert.equal(
		material.vertexShader,
		`
varying vec3 vWorldPosition;

void main() {

	vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
	vWorldPosition = worldPosition.xyz;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}`
	);
	assert.equal(
		material.fragmentShader,
		`
varying vec3 vWorldPosition;

void main() {

	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );

}`
	);
});

}