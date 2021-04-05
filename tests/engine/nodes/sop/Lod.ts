import {Mesh} from 'three/src/objects/Mesh';
import {LOD} from 'three/src/objects/LOD';
import {BufferGeometry} from 'three';

QUnit.test('LOD simple', async (assert) => {
	const geo1 = window.geo1;
	const camera_node = window.perspective_camera1;
	const camera_object = camera_node.object;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const box0 = geo1.createNode('box');
	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');
	const LOD1 = geo1.createNode('lod');

	box0.p.divisions.set(10);
	box1.p.divisions.set(5);
	box2.p.divisions.set(2);
	LOD1.p.distance0.set(5);
	LOD1.p.distance1.set(10);

	LOD1.setInput(0, box0);
	LOD1.setInput(1, box1);
	LOD1.setInput(2, box2);

	let container = await box0.compute();
	let core_group = container.coreContent()!;
	const box0_pts_count = ((core_group.objects()[0] as Mesh).geometry as BufferGeometry).getAttribute('position').array
		.length;

	container = await box1.compute();
	core_group = container.coreContent()!;
	const box1_pts_count = ((core_group.objects()[0] as Mesh).geometry as BufferGeometry).getAttribute('position').array
		.length;

	container = await box2.compute();
	core_group = container.coreContent()!;
	const box2_pts_count = ((core_group.objects()[0] as Mesh).geometry as BufferGeometry).getAttribute('position').array
		.length;

	assert.equal(box0_pts_count, 2178);
	assert.equal(box1_pts_count, 648);
	assert.equal(box2_pts_count, 162);

	container = await LOD1.compute();
	core_group = container.coreContent()!;
	const lod = core_group.objects()[0] as LOD;

	lod.autoUpdate = false;

	camera_object.position.x = 20;
	camera_object.updateMatrix();
	camera_object.updateMatrixWorld();
	camera_object.updateProjectionMatrix();
	lod.update(camera_object);
	let visible_object = lod.children.filter((o) => o.visible)[0] as Mesh;
	assert.equal((visible_object.geometry as BufferGeometry).getAttribute('position').array.length, box2_pts_count);

	camera_object.position.x = 9;
	camera_object.updateMatrix();
	camera_object.updateMatrixWorld();
	camera_object.updateProjectionMatrix();
	lod.update(camera_object);
	visible_object = lod.children.filter((o) => o.visible)[0] as Mesh;
	assert.equal((visible_object.geometry as BufferGeometry).getAttribute('position').array.length, box1_pts_count);

	camera_object.position.x = 2;
	camera_object.updateMatrix();
	camera_object.updateMatrixWorld();
	camera_object.updateProjectionMatrix();
	lod.update(camera_object);
	visible_object = lod.children.filter((o) => o.visible)[0] as Mesh;
	assert.equal((visible_object.geometry as BufferGeometry).getAttribute('position').array.length, box0_pts_count);
});
