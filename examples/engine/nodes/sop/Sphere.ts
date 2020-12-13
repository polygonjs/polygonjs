import {PolyScene} from '../../../../src/engine/scene/PolyScene';

// create a scene
const scene = new PolyScene();

// create a Box
const geo = scene.root.createNode('geo');
const sphere = geo.createNode('sphere');

// add a light
scene.root.createNode('hemisphere_light');

// create a camera
const perspective_camera1 = scene.root.createNode('perspective_camera');
perspective_camera1.p.t.set([5, 5, 5]);
// add orbit_controls
const events1 = perspective_camera1.createNode('events');
const orbits_controls = events1.createNode('camera_orbit_controls');
perspective_camera1.p.controls.set(orbits_controls.full_path());

// EXPORT
const nodes = [sphere];
const camera = perspective_camera1;
export {scene, camera, nodes};
