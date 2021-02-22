import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function SopInstance() {
	// create a scene
	const scene = new PolyScene();
	const root = scene.root();

	// create a box and a sphere
	const geo = root.createNode('geo');

	// import dolphin geo
	const file = geo.createNode('file');
	file.p.url.set('https://raw.githubusercontent.com/polygonjs/polygonjs-assets/master/models/dolphin.obj');

	// hierarchy to remove the parent and only keep the object with a geometry
	const hierarchy = geo.createNode('hierarchy');
	hierarchy.setInput(0, file);
	hierarchy.p.mode.set(1);

	// scale and rotate the dolphin
	const transform = geo.createNode('transform');
	transform.setInput(0, hierarchy);
	transform.p.scale.set(0.05);
	transform.p.r.y.set(90);

	// create a sphere to instanciate the dolphins onto
	const sphere = geo.createNode('sphere');
	const scatter = geo.createNode('scatter');
	scatter.setInput(0, sphere);
	scatter.p.pointsCount.set(5000);

	// add some jitter
	const jitter = geo.createNode('jitter');
	jitter.setInput(0, scatter);

	// create the instance node
	const instance = geo.createNode('instance');
	instance.setInput(0, transform);
	instance.setInput(1, jitter);
	instance.flags.display.set(true);

	// create a material to render the instance.
	// We only have to extend the existing materials
	const MAT = root.createNode('materials');
	const material = MAT.createNode('meshLambertBuilder');
	const output = material.createNode('output');
	// all we have to do in the material is to plug an instanceTransform node into the output
	const instanceTransform = material.createNode('instanceTransform');
	output.setInput('position', instanceTransform, 'position');
	output.setInput('normal', instanceTransform, 'normal');
	instance.p.material.setNode(material);

	// add a light
	root.createNode('hemisphereLight');

	// create a camera
	const perspectiveCamera1 = root.createNode('perspectiveCamera');
	perspectiveCamera1.p.t.set([5, 5, 5]);
	// add orbitControls
	const events1 = perspectiveCamera1.createNode('events');
	const orbitsControls = events1.createNode('cameraOrbitControls');
	perspectiveCamera1.p.controls.setNode(orbitsControls);

	// EXPORT
	const nodes = [instance];
	const htmlNodes = {scatter};
	const camera = perspectiveCamera1;
	return {scene, camera, nodes, htmlNodes};
}
