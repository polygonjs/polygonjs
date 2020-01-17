import {CATEGORY_SOP} from './Category';

import {AddSopNode} from 'src/engine/nodes/sop/Add';
import {AnimationCopySopNode} from 'src/engine/nodes/sop/AnimationCopy';
import {AnimationMixerSopNode} from 'src/engine/nodes/sop/AnimationMixer';
import {AttribAddMultSopNode} from 'src/engine/nodes/sop/AttribAddMult';
import {AttribCopySopNode} from 'src/engine/nodes/sop/AttribCopy';
import {AttribCreateSopNode} from 'src/engine/nodes/sop/AttribCreate';
import {BboxScatterSopNode} from 'src/engine/nodes/sop/BboxScatter';
import {BoxSopNode} from 'src/engine/nodes/sop/Box';
import {ColorSopNode} from 'src/engine/nodes/sop/Color';
import {DataSopNode} from 'src/engine/nodes/sop/Data';
import {DataUrlSopNode} from 'src/engine/nodes/sop/DataUrl';
import {FileSopNode} from 'src/engine/nodes/sop/File';
import {HierarchySopNode} from 'src/engine/nodes/sop/Hierarchy';
import {MergeSopNode} from 'src/engine/nodes/sop/Merge';
import {PlaneSopNode} from 'src/engine/nodes/sop/Plane';
import {SphereSopNode} from 'src/engine/nodes/sop/Sphere';
import {TextSopNode} from 'src/engine/nodes/sop/Text';
import {TransformSopNode} from 'src/engine/nodes/sop/Transform';
import {TubeSopNode} from 'src/engine/nodes/sop/Tube';

export interface GeoNodeChildrenMap {
	add: AddSopNode;
	animation_copy: AnimationCopySopNode;
	animation_mixer: AnimationMixerSopNode;
	attrib_add_mult: AttribAddMultSopNode;
	attrib_copy: AttribCopySopNode;
	attrib_create: AttribCreateSopNode;
	bbox_scatter: BboxScatterSopNode;
	box: BoxSopNode;
	color: ColorSopNode;
	data: DataSopNode;
	data_url: DataUrlSopNode;
	file: FileSopNode;
	hierarchy: HierarchySopNode;
	merge: MergeSopNode;
	plane: PlaneSopNode;
	sphere: SphereSopNode;
	text: TextSopNode;
	transform: TransformSopNode;
	tube: TubeSopNode;
}

import {Poly} from 'src/engine/Poly';
export class SopRegister {
	static run(poly: Poly) {
		poly.register_node(AddSopNode, CATEGORY_SOP.INPUT);
		poly.register_node(AnimationCopySopNode, CATEGORY_SOP.ANIMATION);
		poly.register_node(AnimationMixerSopNode, CATEGORY_SOP.ANIMATION);
		poly.register_node(AttribAddMultSopNode, CATEGORY_SOP.ATTRIBUTE);
		poly.register_node(AttribCreateSopNode, CATEGORY_SOP.ATTRIBUTE);
		poly.register_node(AttribCopySopNode, CATEGORY_SOP.ATTRIBUTE);
		poly.register_node(BboxScatterSopNode, CATEGORY_SOP.MODIFIER);
		poly.register_node(BoxSopNode, CATEGORY_SOP.INPUT);
		poly.register_node(ColorSopNode, CATEGORY_SOP.MODIFIER);
		poly.register_node(DataSopNode, CATEGORY_SOP.INPUT);
		poly.register_node(DataUrlSopNode, CATEGORY_SOP.INPUT);
		poly.register_node(FileSopNode, CATEGORY_SOP.INPUT);
		poly.register_node(HierarchySopNode, CATEGORY_SOP.MISC);
		poly.register_node(MergeSopNode, CATEGORY_SOP.MISC);
		poly.register_node(PlaneSopNode, CATEGORY_SOP.INPUT);
		poly.register_node(SphereSopNode, CATEGORY_SOP.INPUT);
		poly.register_node(TextSopNode, CATEGORY_SOP.INPUT);
		poly.register_node(TransformSopNode, CATEGORY_SOP.MODIFIER);
		poly.register_node(TubeSopNode, CATEGORY_SOP.INPUT);
	}
}
