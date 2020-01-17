import 'src/engine/Poly';
import {PolyScene} from 'src/engine/scene/PolyScene';
const scene = new PolyScene();
scene.root.create_node('ambient_light');

const perspective_camera1 = scene.root.create_node('perspective_camera');
perspective_camera1.p.t.z.set(5);

const geo1 = scene.root.create_node('geo');
geo1.create_node('box');
geo1.p.r.y.set('$F');
