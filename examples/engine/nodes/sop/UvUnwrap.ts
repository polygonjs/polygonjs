import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function SopUvUnwrap() {
	// create a scene
	const scene = new PolyScene();
	const root = scene.root();
	const geo = root.createNode('geo');

	const MAT = geo.createNode('materialsNetwork');
	const meshBasic = MAT.createNode('meshBasic');
	meshBasic.p.wireframe.set(1);

	// create an add node
	const sphere = geo.createNode('sphere');
	const plane = geo.createNode('plane');
	const merge = geo.createNode('merge');
	const uvUnwrap = geo.createNode('uvUnwrap');
	const point = geo.createNode('point');
	const material = geo.createNode('material');

	merge.setInput(0, sphere);
	merge.setInput(1, plane);
	merge.p.compact.set(1);
	uvUnwrap.setInput(0, merge);
	point.setInput(0, uvUnwrap);
	point.p.updateX.set(1);
	point.p.updateY.set(1);
	point.p.updateZ.set(1);
	point.p.x.set('@uv.x');
	point.p.y.set('@uv.y');
	point.p.z.set('0');
	material.setInput(0, point);
	material.p.material.setNode(meshBasic);
	material.flags.display.set(true);

	// create a camera
	const perspectiveCamera1 = root.createNode('perspectiveCamera');
	perspectiveCamera1.p.t.set([5, 5, 5]);
	// add orbitControls
	const events1 = perspectiveCamera1.createNode('eventsNetwork');
	const orbitsControls = events1.createNode('cameraOrbitControls');
	perspectiveCamera1.p.controls.setNode(orbitsControls);

	// EXPORT
	const nodes = [plane];
	const camera = perspectiveCamera1;
	return {scene, camera, nodes};
}
