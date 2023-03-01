import {CATEGORY_CAD} from './Category';

import {BezierCadNode} from '../../../nodes/cad/Bezier';
import {Bezier2DCadNode} from '../../../nodes/cad/Bezier2D';
import {BooleanCadNode} from '../../../nodes/cad/Boolean';
import {BoxCadNode} from '../../../nodes/cad/Box';
import {ChamferCadNode} from '../../../nodes/cad/Chamfer';
import {Circle2DCadNode} from '../../../nodes/cad/Circle2D';
import {CircleCadNode} from '../../../nodes/cad/Circle';
import {Circle3PointsCadNode} from '../../../nodes/cad/Circle3Points';
import {CylinderCadNode} from '../../../nodes/cad/Cylinder';
import {FilletCadNode} from '../../../nodes/cad/Fillet';
import {MergeCadNode} from '../../../nodes/cad/Merge';
import {MirrorCadNode} from '../../../nodes/cad/Mirror';
import {NullCadNode} from '../../../nodes/cad/Null';
import {PointCadNode} from '../../../nodes/cad/Point';
import {Point2DCadNode} from '../../../nodes/cad/Point2D';
import {PrismCadNode} from '../../../nodes/cad/Prism';
// import {RevolutionCadNode} from '../../../nodes/cad/Revolution';
import {SegmentCadNode} from '../../../nodes/cad/Segment';
import {SphereCadNode} from '../../../nodes/cad/Sphere';
// import {Spline2DCadNode} from '../../../nodes/cad/Spline2D';
import {SwitchCadNode} from '../../../nodes/cad/Switch';
import {TransformCadNode} from '../../../nodes/cad/Transform';

export interface CadNodeChildrenMap {
	bezier: BezierCadNode;
	bezier2D: Bezier2DCadNode;
	boolean: BooleanCadNode;
	box: BoxCadNode;
	chamfer: ChamferCadNode;
	circle2D: Circle2DCadNode;
	circle: CircleCadNode;
	circle3Points: Circle3PointsCadNode;
	cylinder: CylinderCadNode;
	fillet: FilletCadNode;
	merge: MergeCadNode;
	mirror: MirrorCadNode;
	null: NullCadNode;
	point: PointCadNode;
	point2D: Point2DCadNode;
	prism: PrismCadNode;
	// revolution: RevolutionCadNode;
	segment: SegmentCadNode;
	sphere: SphereCadNode;
	// spline2D: Spline2DCadNode;
	switch: SwitchCadNode;
	transform: TransformCadNode;
}

import {PolyEngine} from '../../../Poly';
export class CadRegister {
	static run(poly: PolyEngine) {
		poly.registerNode(BezierCadNode, CATEGORY_CAD.PRIMITIVES_3D);
		poly.registerNode(Bezier2DCadNode, CATEGORY_CAD.PRIMITIVES_2D);
		poly.registerNode(BooleanCadNode, CATEGORY_CAD.MODIFIER);
		poly.registerNode(BoxCadNode, CATEGORY_CAD.PRIMITIVES_3D);
		poly.registerNode(ChamferCadNode, CATEGORY_CAD.MODIFIER);
		poly.registerNode(Circle2DCadNode, CATEGORY_CAD.PRIMITIVES_2D);
		poly.registerNode(CircleCadNode, CATEGORY_CAD.PRIMITIVES_3D);
		poly.registerNode(Circle3PointsCadNode, CATEGORY_CAD.PRIMITIVES_3D);
		poly.registerNode(CylinderCadNode, CATEGORY_CAD.PRIMITIVES_3D);
		poly.registerNode(FilletCadNode, CATEGORY_CAD.MODIFIER);
		poly.registerNode(MergeCadNode, CATEGORY_CAD.FLOW);
		poly.registerNode(MirrorCadNode, CATEGORY_CAD.MODIFIER);
		poly.registerNode(NullCadNode, CATEGORY_CAD.FLOW);
		poly.registerNode(PointCadNode, CATEGORY_CAD.PRIMITIVES_3D);
		poly.registerNode(Point2DCadNode, CATEGORY_CAD.PRIMITIVES_2D);
		poly.registerNode(PrismCadNode, CATEGORY_CAD.MODIFIER);
		// poly.registerNode(RevolutionCadNode, CATEGORY_CAD.MODIFIER);
		poly.registerNode(SegmentCadNode, CATEGORY_CAD.PRIMITIVES_3D);
		poly.registerNode(SphereCadNode, CATEGORY_CAD.PRIMITIVES_3D);
		// poly.registerNode(Spline2DCadNode, CATEGORY_CAD.PRIMITIVES_2D);
		poly.registerNode(SwitchCadNode, CATEGORY_CAD.FLOW);
		poly.registerNode(TransformCadNode, CATEGORY_CAD.MODIFIER);
	}
}
