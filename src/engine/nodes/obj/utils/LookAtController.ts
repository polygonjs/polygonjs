// import {CameraController} from 'src/core/CameraController';
// import {TransformedObjNode} from './TransformController';
// import {Object3D} from 'three/src/core/Object3D';
// import {OperatorPathParam} from 'src/engine/params/OperatorPath';
// import {ParamType} from 'src/engine/poly/ParamType';
// // import {BaseTransformedObjNodeType} from '../_BaseTransformed';
// import {BaseObjNodeClass} from '../_Base';

// export class LookAtController {
// 	private _camera_controller = new CameraController(this._update_from_look_at_target.bind(this));
// 	constructor(private node: TransformedObjNode) {}

// 	get active(): boolean {
// 		return this.param.value != '';
// 	}
// 	get param(): OperatorPathParam {
// 		return this.node.p.look_at;
// 	}

// 	compute() {
// 		const look_at_node = this.param.found_node();
// 		//@_look_at_target_object = null

// 		if (look_at_node) {
// 			if (look_at_node instanceof BaseObjNodeClass) {
// 				// TODO: typescript
// 				this._camera_controller.set_target(look_at_node.object);
// 			} else {
// 				this.node.states.error.set('look_at node is not an obj');
// 			}
// 			//@_look_at_target_object = look_at_node.object()

// 			//this._look_at_position_with_up( @_look_at_target_object.position, @_param_up )

// 			//this._add_camera_event()
// 		} else {
// 			//this._remove_camera_event()
// 			this._camera_controller.remove_target();

// 			this.node.transform_controller.update_transform_with_matrix();
// 		}
// 	}

// 	// _look_at_position_with_up: (position, up)->
// 	// 	if (object = this.object())?

// 	// 		object.matrixAutoUpdate = true
// 	// 		object.up.copy( up )
// 	// 		object.lookAt( position )

// 	// 	else
// 	// 		console.log("no object yet", this.full_path(), @_object)

// 	_update_from_look_at_target(look_at_target: Object3D) {
// 		// TODO: should that set the node to dirty?
// 		// that doesn't seem required if it's the display node
// 		//if @_look_at_target_object?
// 		//this._look_at_position_with_up( position, @_param_up )

// 		const object = this.node.object;
// 		if (object != null) {
// 			// const target_matrix = look_at_target;

// 			object.matrixAutoUpdate = true;
// 			object.up.copy(this.node.params.value_with_type('up', ParamType.VECTOR3));
// 			object.lookAt(look_at_target.position);
// 		} else {
// 			console.log('no object yet', this.node.full_path());
// 		}
// 	}
// }
