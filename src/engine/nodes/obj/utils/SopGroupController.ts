// import {Mesh} from 'three/src/objects/Mesh';
// import {BaseObjNodeType} from '../_Base';

// /*
// creates the sop_group under some obj nodes
// and updates its name
// */
// export class ObjSopGroupController {
// 	// private _sop_group = this._create_sop_group();
// 	// private _create_sop_group() {
// 	// 	return new Mesh();
// 	// }
// 	// get sop_group() {
// 	// 	return this._sop_group;
// 	// }
// 	// set_sop_group_name() {
// 	// 	this._sop_group.name = `${this.node.name}:sop_group`;
// 	// }

// 	constructor(private node: BaseObjNodeType) {}

// 	initialize_node() {
// 		this.node.object.add(this.sop_group);
// 		this.node.name_controller.add_post_set_full_path_hook(this.set_sop_group_name.bind(this));
// 		this._create_sop_group();
// 	}
// }
