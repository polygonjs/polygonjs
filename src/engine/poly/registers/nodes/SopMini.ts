// for dynamic imports, use
// https://wanago.io/2018/08/20/webpack-4-course-part-eight-dynamic-imports-with-prefetch-and-preload/
// with webpackExclude to not bundle files like _Base.ts or what is under utils/
// with webpackChunkName and [request] to ensure meaningful name
// more on https://webpack.js.org/api/module-methods/
import {CATEGORY_SOP} from './Category';

// import {AddSopNode} from '../../../nodes/sop/Add';
// import {AttribCreateSopNode} from '../../../nodes/sop/AttribCreate';
import {BoxSopNode} from '../../../nodes/sop/Box';
import {BVHSopNode} from '../../../nodes/sop/BVH';
import {BVHVisualizerSopNode} from '../../../nodes/sop/BVHVisualizer';
import {CopySopNode} from '../../../nodes/sop/Copy';
// import {ExporterSopNode} from '../../../nodes/sop/Exporter';
import {FileSopNode} from '../../../nodes/sop/File';
// import {HierarchySopNode} from '../../../nodes/sop/Hierarchy';
// import {LineSopNode} from '../../../nodes/sop/Line';
import {MaterialSopNode} from '../../../nodes/sop/Material';
import {MergeSopNode} from '../../../nodes/sop/Merge';
import {NullSopNode} from '../../../nodes/sop/Null';
import {PlaneSopNode} from '../../../nodes/sop/Plane';
// import {RaySopNode} from '../../../nodes/sop/Ray';
import {SphereSopNode} from '../../../nodes/sop/Sphere';
// import {SwitchSopNode} from '../../../nodes/sop/Switch';
import {TransformSopNode} from '../../../nodes/sop/Transform';

// networks
// import {AnimationsNetworkSopNode} from '../../../nodes/sop/AnimationsNetwork';
// import {CopNetworkSopNode} from '../../../nodes/sop/CopNetwork';
import {EventsNetworkSopNode} from '../../../nodes/sop/EventsNetwork';
import {MaterialsNetworkSopNode} from '../../../nodes/sop/MaterialsNetwork';
// import {PostProcessNetworkSopNode} from '../../../nodes/sop/PostProcessNetwork';
// import {RenderersNetworkSopNode} from '../../../nodes/sop/RenderersNetwork';

export interface GeoNodeChildrenMap {
	// add: AddSopNode;
	// attribCreate: AttribCreateSopNode;
	box: BoxSopNode;
	BVH: BVHSopNode;
	BVHVisualizer: BVHVisualizerSopNode;
	copy: CopySopNode;
	file: FileSopNode;
	// exporter: ExporterSopNode;
	// hierarchy: HierarchySopNode;
	// line: LineSopNode;
	material: MaterialSopNode;
	merge: MergeSopNode;
	null: NullSopNode;
	plane: PlaneSopNode;
	// ray: RaySopNode;
	sphere: SphereSopNode;
	// switch: SwitchSopNode;
	// torus: TorusSopNode;
	// torusKnot: TorusKnotSopNode;
	transform: TransformSopNode;

	// networks
	// animationsNetwork: AnimationsNetworkSopNode;
	// copNetwork: CopNetworkSopNode;
	eventsNetwork: EventsNetworkSopNode;
	materialsNetwork: MaterialsNetworkSopNode;
	// postProcessNetwork: PostProcessNetworkSopNode;
	// renderersNetwork: RenderersNetworkSopNode;
}

import {PolyEngine} from '../../../Poly';
export class SopRegister {
	static run(poly: PolyEngine) {
		// poly.registerNode(AddSopNode, CATEGORY_SOP.INPUT);

		// poly.registerNode(AttribCreateSopNode, CATEGORY_SOP.ATTRIBUTE);

		poly.registerNode(BoxSopNode, CATEGORY_SOP.PRIMITIVES);
		poly.registerNode(BVHSopNode, CATEGORY_SOP.ADVANCED);
		poly.registerNode(BVHVisualizerSopNode, CATEGORY_SOP.ADVANCED);
		poly.registerNode(CopySopNode, CATEGORY_SOP.MODIFIER);

		// poly.registerNode(ExporterSopNode, CATEGORY_SOP.ADVANCED);
		poly.registerNode(FileSopNode, CATEGORY_SOP.INPUT);

		// poly.registerNode(HierarchySopNode, CATEGORY_SOP.MISC);

		// poly.registerNode(LineSopNode, CATEGORY_SOP.PRIMITIVES);
		poly.registerNode(MaterialSopNode, CATEGORY_SOP.RENDER);
		// poly.registerNode(MediapipeFaceMeshSopNode, CATEGORY_SOP.ADVANCED);
		poly.registerNode(MergeSopNode, CATEGORY_SOP.MISC);
		poly.registerNode(NullSopNode, CATEGORY_SOP.MISC);

		poly.registerNode(PlaneSopNode, CATEGORY_SOP.PRIMITIVES);
		// poly.registerNode(RaySopNode, CATEGORY_SOP.MODIFIER);
		poly.registerNode(SphereSopNode, CATEGORY_SOP.PRIMITIVES);

		// poly.registerNode(SwitchSopNode, CATEGORY_SOP.MISC);
		// poly.registerNode(TorusSopNode, CATEGORY_SOP.PRIMITIVES);
		// poly.registerNode(TorusKnotSopNode, CATEGORY_SOP.PRIMITIVES);
		poly.registerNode(TransformSopNode, CATEGORY_SOP.MODIFIER);
		// networks
		// poly.registerNode(AnimationsNetworkSopNode, CATEGORY_SOP.NETWORK);
		// poly.registerNode(CopNetworkSopNode, CATEGORY_SOP.NETWORK);
		poly.registerNode(EventsNetworkSopNode, CATEGORY_SOP.NETWORK);
		poly.registerNode(MaterialsNetworkSopNode, CATEGORY_SOP.NETWORK);
		// poly.registerNode(PostProcessNetworkSopNode, CATEGORY_SOP.NETWORK);
		// poly.registerNode(RenderersNetworkSopNode, CATEGORY_SOP.NETWORK);
	}
}
