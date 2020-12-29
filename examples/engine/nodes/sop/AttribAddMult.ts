import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function SopAttribAddMult() {
	// create a scene
	const scene = new PolyScene();

	// build a geometry that will use an attribute called 'height'
	const geo = scene.root.createNode('geo');
	const plane = geo.createNode('plane');
	plane.p.size.set([4, 4]);
	//let's increase the resolution of the plane
	plane.p.step_size.set(0.05);

	// create an attrib create
	const attribCreate = geo.createNode('attribCreate');
	attribCreate.setInput(0, plane);
	attribCreate.p.name.set('height');
	// here we set the attribute value with an expression
	// that depends on the z position of each point
	attribCreate.p.value1.set('sin(2*@P.z)');

	// create the attribAddMult
	const attribAddMult = geo.createNode('attribAddMult');
	attribAddMult.setInput(0, attribCreate);
	attribAddMult.p.name.set('height');
	attribAddMult.p.mult.set(0.5);

	// create a point SOP to use the height attribute to deform the plane
	const point = geo.createNode('point');
	point.setInput(0, attribAddMult);
	point.p.update_y.set(1);
	// by setting another expression,
	// we set the y position to equal the height attribute
	point.p.y.set('@height');
	point.flags.display.set(true);

	// add a light
	scene.root.createNode('hemisphereLight');

	// create a camera
	const perspectiveCamera1 = scene.root.createNode('perspectiveCamera');
	perspectiveCamera1.p.t.set([5, 5, 5]);
	// add orbitControls
	const events1 = perspectiveCamera1.createNode('events');
	const orbitsControls = events1.createNode('cameraOrbitControls');
	perspectiveCamera1.p.controls.set(orbitsControls.fullPath());

	// EXPORT
	const nodes = [attribAddMult];
	const camera = perspectiveCamera1;
	const htmlNodes = {attribAddMult};
	return {scene, camera, nodes, htmlNodes};
}
