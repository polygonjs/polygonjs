import {Vector3} from 'three/src/math/Vector3';
// import {Texture} from 'three/src/textures/Texture';
import {Raycaster} from 'three/src/core/Raycaster';
import {PlaneBufferGeometry} from 'three/src/geometries/PlaneGeometry';
import {Mesh} from 'three/src/objects/Mesh';
import {Color} from 'three/src/math/Color';
import {MeshBasicMaterial} from 'three/src/materials/MeshBasicMaterial';
// const THREE = {Color, Mesh, MeshBasicMaterial, PlaneBufferGeometry, Raycaster, Texture, Vector3}
// import lodash_isNaN from 'lodash/isNaN'
// import lodash_sum from 'lodash/sum'
// import {BaseParam} from 'src/Engine/Param/_Base'
// import {BaseNodePostProcess} from 'src/Engine/Node/PostProcess/_Base'
import {BaseCamera} from '../_BaseCamera';
// import {EffectComposer} from 'modules/three/examples/jsm/postprocessing/EffectComposer'
// import {RenderPass} from 'modules/three/examples/jsm/postprocessing/RenderPass'

// import {File} from 'src/Engine/Node/Cop/File'

// import {ScreenQuad} from '../Camera/ScreenQuad'

export function Background<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		protected self: BaseCamera = (<unknown>this) as BaseCamera;

		// private _param_use_background_color: boolean
		private _param_use_background: boolean;
		private _param_use_material: boolean;
		private _param_background_color: Color;
		private _param_background_material: string;
		private _param_background_ratio: number;
		// private _param_use_background_image: boolean
		// private _param_background_image: string
		// private _background_image_url: string
		// private _background_texture: Texture

		private _screen_quad: Mesh;
		private _screen_quad_flat_material: MeshBasicMaterial;

		private _bg_raycaster = new Raycaster();
		private _bg_corner = {
			bl: new Vector3(),
			br: new Vector3(),
			tl: new Vector3(),
			tr: new Vector3(),
		};
		private _bg_center = new Vector3();

		screen_quad() {
			return (this._screen_quad = this._screen_quad || this._create_screen_quad()); // new ScreenQuad()
		}
		private _create_screen_quad() {
			const size = 2; // better than 1 for color, as the edges can be visible if canvas ratio extreme
			const segments = 1;
			const geometry = new PlaneBufferGeometry(size, size, segments, segments);
			const quad = new Mesh(geometry);
			this.self._object.add(quad);
			return quad;
		}
		screen_quad_flat_material() {
			return (this._screen_quad_flat_material = this._screen_quad_flat_material || new MeshBasicMaterial());
		}

		add_background_params() {
			this.self.within_param_folder('background', () => {
				this.self.add_param(ParamType.BOOLEAN, 'use_background', 0);
				this.self.add_param(ParamType.BOOLEAN, 'use_material', 0, {
					visible_if: {use_background: true},
				});

				this.self.add_param(ParamType.COLOR, 'background_color', [0, 0, 0], {
					visible_if: {use_background: true, use_material: false},
				});

				this.self.add_param(ParamType.OPERATOR_PATH, 'background_material', '', {
					visible_if: {use_background: true, use_material: true},
					node_selection: {context: NodeContext.MAT},
					dependent_on_found_node: false,
				});

				this.self.add_param(ParamType.FLOAT, 'background_ratio', 1, {
					visible_if: {use_background: true, use_material: true},
				});
			});

			// this.self.add_param( ParamType.TOGGLE, 'use_background_color', 1 )
			// this.self.add_param( ParamType.COLOR, 'background_color', [0,0,0], {
			// 	visible_if: {use_background_color: 1}
			// })
			// this.self.add_param( ParamType.TOGGLE, 'use_background_image', 0 )
			// this.self.add_param( ParamType.OPERATOR_PATH, 'background_image', File.DEFAULT_NODE_PATH.UV, {
			// 	visible_if: {use_background_image: true},
			// 	node_selection: {context: NodeContext.COP}
			// } )
		}

		use_background(): boolean {
			return this._param_use_background;
		}
		use_background_color(): boolean {
			return this._param_use_background && !this._param_use_material;
		}
		use_background_material(): boolean {
			return this._param_use_background && this._param_use_material;
		}
		background_color(): Color {
			if (this.use_background_color()) {
				return this._param_background_color;
			}
		}
		// background_image_url(){
		// 	if(this._param_use_background_image){
		// 		// this.param('background_image').mark_as_referencing_asset(this._param_background_image)
		// 		// return this._param_background_image
		// 		return this._background_image_url
		// 	}
		// }
		// background_texture(){
		// 	if(this._param_use_background_image){
		// 		return this._background_texture
		// 	}
		// }
		_update_corner_vector(vector: Vector3, coord: Vector2Components) {
			this._bg_raycaster.setFromCamera(coord, this.self.object());
			vector
				.copy(this._bg_raycaster.ray.direction)
				.multiplyScalar(this._param_far)
				.add(this._bg_raycaster.ray.origin);
		}
		async update_background() {
			if (this.use_background()) {
				this.update_screen_quad();

				await this.update_background_color();
				if (this.use_background_material()) {
					await this.update_background_material();
				}
			} else {
				if (this._screen_quad) {
					this.self._object.remove(this._screen_quad);
				}
			}

			// if(this._param_use_background_image){
			// 	const bg_node = this.self.param('background_image').found_node();
			// 	if(bg_node){
			// 		const container = await bg_node.request_container();
			// 		this._background_texture = container.core_content()
			// 		// this._background_image_url = bg_node.resolved_url()
			// 	} else {
			// 		this._background_texture = null
			// 	}
			// } else {
			// 	this._background_texture = null
			// }
		}
		private async update_background_color() {
			this.screen_quad().material = this.screen_quad_flat_material();
			this.screen_quad().material.color = this._param_background_color;
		}

		private async update_background_material() {
			const bg_node = this.self.param('background_material').found_node();
			if (bg_node) {
				await bg_node.request_container_p();
				const material = bg_node.material();
				this.screen_quad().material = material;
				// this.screen_quad().material.uniforms.uTexture.value = texture
			} else {
				this.self.set_error('bg node not found');
			}
		}
	};
}
