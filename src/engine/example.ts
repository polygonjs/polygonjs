import {PolyScene} from './index_all';
import {BaseNodeType} from './nodes/_Base';
import {PerspectiveCameraObjNode} from './nodes/obj/PerspectiveCamera';

import {AllRegister} from './poly/registers/All';
AllRegister.run();

// mat
import {MatMeshBasic} from '../../examples/engine/nodes/mat/MeshBasic';
import {MatMeshLambert} from '../../examples/engine/nodes/mat/MeshLambert';
// sop
import {SopAdd} from '../../examples/engine/nodes/sop/Add';
import {SopAdd_create_line} from '../../examples/engine/nodes/sop/Add.create_line';
import {SopAttribAddMult} from '../../examples/engine/nodes/sop/AttribAddMult';
import {SopAttribCopy} from '../../examples/engine/nodes/sop/AttribCopy';
import {SopAttribCreate} from '../../examples/engine/nodes/sop/AttribCreate';
import {SopBlend} from '../../examples/engine/nodes/sop/Blend';
import {SopBox} from '../../examples/engine/nodes/sop/Box';
import {SopFile} from '../../examples/engine/nodes/sop/File';
import {SopSphere} from '../../examples/engine/nodes/sop/Sphere';
import {SopSubdivide} from '../../examples/engine/nodes/sop/Subdivide';
import {SopTetrahedron} from '../../examples/engine/nodes/sop/Tetrahedron';
import {SopTorus} from '../../examples/engine/nodes/sop/Torus';
import {SopTorusKnot} from '../../examples/engine/nodes/sop/TorusKnot';

const MAT = [MatMeshBasic, MatMeshLambert];
const SOP = [
	SopAdd,
	SopAdd_create_line,
	SopAttribAddMult,
	SopAttribCopy,
	SopAttribCreate,
	SopBlend,
	SopBox,
	SopFile,
	SopSphere,
	SopSubdivide,
	SopTetrahedron,
	SopTorus,
	SopTorusKnot,
];
console.log('MAT', MAT.length);
console.log('SOP', SOP.length);

interface SceneBuilderResult {
	scene: PolyScene;
	camera: PerspectiveCameraObjNode;
	nodes: BaseNodeType[];
	html_nodes?: Dictionary<BaseNodeType>;
}

const result: SceneBuilderResult = SopTetrahedron();
(window as any).scene = result.scene;

const html_nodes = result.html_nodes;
if (html_nodes) {
	for (let k of Object.keys(html_nodes)) {
		(window as any)[k] = html_nodes[k];
	}
}

result.camera.createViewer(document.getElementById('app')!);
