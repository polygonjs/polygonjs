import type {
	OpenCascadeInstance,
	gp_Pnt2d,
	gp_Vec2d,
	gp_Quaternion,
	gp_Vec,
	gp_Trsf,
	gp_Pnt,
	gp_Ax1,
	gp_Ax2,
	gp_Dir,
	gp_XYZ,
	gp_Pln,
	Bnd_Box,
	TopLoc_Location,
	Message_ProgressRange,
	TopTools_ListOfShape,
	GProp_GProps,
} from './CadCommon';

let _oc: OpenCascadeInstance | undefined;
export class CadLoaderSync {
	static __setOC(oc: OpenCascadeInstance) {
		_oc = oc;
		// set globals
		this.gp_Ax1 = new oc.gp_Ax1_1();
		this.gp_Ax2 = new oc.gp_Ax2_1();
		this.gp_Dir = new oc.gp_Dir_1();
		this.gp_Pnt2d = new oc.gp_Pnt2d_1();
		this.gp_Vec2d = new oc.gp_Vec2d_1();
		this.gp_Pln = new oc.gp_Pln_1();
		this.gp_Pnt = new oc.gp_Pnt_1();
		this.gp_Quaternion = new oc.gp_Quaternion_1();
		this.gp_Trsf = new oc.gp_Trsf_1();
		this.gp_TrsfT = new oc.gp_Trsf_1();
		this.gp_TrsfR = new oc.gp_Trsf_1();
		this.gp_TrsfS = new oc.gp_Trsf_1();
		// this.gp_GTrsf = new oc.gp_GTrsf_1();
		this.gp_Vec = new oc.gp_Vec_1();
		this.gp_XYZ = new oc.gp_XYZ_1();
		this.Bnd_Box = new oc.Bnd_Box_1();
		this.TopLoc_Location = new oc.TopLoc_Location_1();
		this.Message_ProgressRange = new oc.Message_ProgressRange_1();
		this.TopTools_ListOfShape = new oc.TopTools_ListOfShape_1();
		this.GProp_GProps = new oc.GProp_GProps_1();
	}
	static oc() {
		return _oc!;
	}

	static gp_Ax1: gp_Ax1;
	static gp_Ax2: gp_Ax2;
	static gp_Dir: gp_Dir;
	static gp_Pln: gp_Pln;
	static gp_Pnt2d: gp_Pnt2d;
	static gp_Pnt: gp_Pnt;
	static gp_Vec2d: gp_Vec2d;
	static gp_Quaternion: gp_Quaternion;
	static gp_Trsf: gp_Trsf;
	static gp_TrsfT: gp_Trsf;
	static gp_TrsfR: gp_Trsf;
	static gp_TrsfS: gp_Trsf;
	static gp_Vec: gp_Vec;
	static gp_XYZ: gp_XYZ;
	static Bnd_Box: Bnd_Box;
	static TopLoc_Location: TopLoc_Location;
	static Message_ProgressRange: Message_ProgressRange;
	static TopTools_ListOfShape: TopTools_ListOfShape;
	static GProp_GProps: GProp_GProps;
	// static TopLoc_Location:TopLoc_Location
}
