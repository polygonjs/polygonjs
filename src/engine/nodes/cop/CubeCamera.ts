// // import NodeBase from '../_Base'

// import {BaseNodeCop} from './_Base';
// import {CubeCameraObj} from '../obj/CubeCamera';
// // import {BaseParam} from '../../../Engine/Param/_Base'
// // import {CoreTextureLoader} from '../../../Core/Loader/Texture'
// // import {CoreScriptLoader} from '../../../Core/Loader/Script'

// // import {PMREMGenerator} from 'three/src/extras/PMREMGenerator'
// // const THREE = {PMREMGenerator}

// export class CubeCamera extends BaseNodeCop {
// 	@ParamS('cube_camera') _param_cube_camera: string;
// 	static type() {
// 		return 'cube_camera';
// 	}

// 	// private _texture_loader: CoreTextureLoader

// 	create_params() {
// 		this.add_param(ParamType.OPERATOR_PATH, 'cube_camera', '/cube_camera1', {
// 			nodeSelection: {
// 				context: NodeContext.OBJ,
// 			},
// 			dependentOnFoundNode: true,
// 		});
// 		this.add_param(ParamType.BUTTON, 'update', null, {
// 			callback: this.cook.bind(this),
// 		});
// 	}

// 	async cook() {
// 		const cube_camera_node = this.params.get_operator_path('cube_camera').found_node();
// 		if (cube_camera_node != null) {
// 			const render_target = (cube_camera_node as CubeCameraObj).render_target();

// 			this.set_texture(render_target.texture);
// 		} else {
// 			this.states.error.set(`cube camera linked to non existing node '${this._param_cube_camera}'`);
// 		}
// 	}
// }
