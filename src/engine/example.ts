import {AllRegister} from './poly/registers/All';
AllRegister.run();

// mat
import {MatMeshBasic} from '../../examples/engine/nodes/mat/MeshBasic';
import {MatMeshLambert} from '../../examples/engine/nodes/mat/MeshLambert';
// sop
import {SopAdd} from '../../examples/engine/nodes/sop/Add';
import {SopAttribAddMult} from '../../examples/engine/nodes/sop/AttribAddMult';
import {SopBox} from '../../examples/engine/nodes/sop/Box';
import {SopFile} from '../../examples/engine/nodes/sop/File';
import {SopSphere} from '../../examples/engine/nodes/sop/Sphere';
import {SopTorus} from '../../examples/engine/nodes/sop/Torus';
import {SopTorusKnot} from '../../examples/engine/nodes/sop/TorusKnot';

if (0 + 0) {
	console.log(MatMeshBasic, MatMeshLambert);
	console.log(SopAdd, SopAttribAddMult, SopBox, SopFile, SopSphere, SopTorus, SopTorusKnot);
}

const {camera} = SopAttribAddMult();

camera.createViewer(document.getElementById('app')!);
