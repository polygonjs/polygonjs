import type {OpenCascadeInstance, TopoDS_Face} from './CadCommon';
import type {FaceData} from './CadCommon';
enum FaceOrientation {
	BACKWARD = 0,
	FORWARD = 1,
}
function faceOrientation(oc: OpenCascadeInstance, face: TopoDS_Face): FaceOrientation {
	return face.Orientation_1() === oc.TopAbs_Orientation.TopAbs_FORWARD
		? FaceOrientation.FORWARD
		: FaceOrientation.BACKWARD;
}
const STRIDE = 3;
export function faceData(oc: OpenCascadeInstance, face: TopoDS_Face, index0 = 0): FaceData | void {
	const aLocation = new oc.TopLoc_Location_1();
	const triangulation = oc.BRep_Tool.Triangulation(face, aLocation, 0);

	if (triangulation.IsNull()) {
		return;
	}

	const transformation = aLocation.Transformation();
	const tri = triangulation.get();
	const nbNodes = tri.NbNodes();

	// init
	const normalsArray = new oc.TColgp_Array1OfDir_2(1, nbNodes);
	const pc = new oc.Poly_Connect_2(triangulation);
	oc.StdPrs_ToolTriangulatedShape.Normal(face, pc, normalsArray);
	const nbTriangles = tri.NbTriangles();

	const faceData: FaceData = {
		positions: new Array(nbNodes * 3),
		normals: new Array(normalsArray.Length() * 3),
		indices: new Array(nbTriangles * 3),
	};

	// positions
	for (let i = 1; i <= nbNodes; i++) {
		const p = tri.Node(i).Transformed(transformation);
		const index = (i - 1) * STRIDE;
		faceData.positions[index] = p.X();
		faceData.positions[index + 1] = p.Y();
		faceData.positions[index + 2] = p.Z();
	}

	// normals
	for (let i = normalsArray.Lower(); i <= normalsArray.Upper(); i++) {
		const d = normalsArray.Value(i).Transformed(transformation);
		const index = (i - 1) * STRIDE;
		faceData.normals[index] = d.X();
		faceData.normals[index + 1] = d.Y();
		faceData.normals[index + 2] = d.Z();
	}

	// indices
	let trisCount = 0;
	const orientation = faceOrientation(oc, face);
	for (let nt = 1; nt <= nbTriangles; nt++) {
		const t = tri.Triangle(nt);
		let n1 = t.Value(1);
		let n2 = t.Value(2);
		const n3 = t.Value(3);
		if (orientation == FaceOrientation.BACKWARD) {
			const tmp = n1;
			n1 = n2;
			n2 = tmp;
		}
		const index = trisCount * STRIDE;
		faceData.indices[index] = n1 - 1 + index0;
		faceData.indices[index + 1] = n2 - 1 + index0;
		faceData.indices[index + 2] = n3 - 1 + index0;
		trisCount++;
	}
	return faceData;
}
