import {Poly} from '../../../../src/engine/Poly';
import {PolyScene} from '../../../../src/engine/scene/PolyScene';
import {PerspectiveCameraObjNode} from '../../../../src/engine/nodes/obj/PerspectiveCamera';
import {GeoObjNode} from '../../../../src/engine/nodes/obj/Geo';
import {FileSopNode} from '../../../../src/engine/nodes/sop/File';

Poly.instance().register_node(GeoObjNode);
Poly.instance().register_node(FileSopNode);

const scene = new PolyScene();
const perspective_camera1 = scene.root.createNode(PerspectiveCameraObjNode);
const geo1 = scene.root.createNode(GeoObjNode);
const file1 = geo1.create_node('file');
file1.p.url.set('/examples/models/male03.obj');
const element = document.getElementById('app');
if (element) {
	perspective_camera1.create_viewer(element);
}
