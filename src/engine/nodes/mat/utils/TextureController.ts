// import {BaseController} from './_BaseController';

// import {FrontSide} from 'three/src/constants';
// import {DoubleSide} from 'three/src/constants';
// import {BackSide} from 'three/src/constants';

// export class TextureController extends BaseController {
// 	add_params() {}

// 	update() {}
// }

// // import * as Loader from 'src/Core/Loader/Texture'
// import { Texture } from "three/src/textures/Texture";
// import { RepeatWrapping } from "three/src/constants";
// const THREE = { RepeatWrapping, Texture };
// import lodash_camelCase from "lodash/camelCase";
// import { BaseNodeMat } from "../_Base";
// import { BaseNode } from "../../_Base";
// import { BaseParam } from "src/Engine/Param/_Base";
// import { ParamType } from "src/Engine/Param/_Module";
// import { File } from "src/Engine/Node/Cop/File";

// import { CoreWalker } from "src/Core/Walker";
// import { CoreTextureLoader } from "src/Core/Loader/Texture";
// import { NodeContext } from "src/Engine/Poly";

// interface CoreTextureLoaderByString {
// 	[propName: string]: CoreTextureLoader;
// }

// export function TextureMixin<TBase extends Constructor>(Base: TBase) {
// 	return class Mixin extends Base {
// 		protected self: BaseNodeMat = (<unknown>this) as BaseNodeMat;

// 		private _texture_loaders_by_param_name: CoreTextureLoaderByString = {};

// 		__has_uniforms(): boolean {
// 			return this._material.uniforms != null;
// 		}

// 		_add_params_texture_alpha_map() {
// 			this._add_texture_params("alpha_map", File.DEFAULT_NODE_PATH.UV);
// 		}
// 		_add_params_texture_map() {
// 			this._add_texture_params("map", File.DEFAULT_NODE_PATH.UV);
// 		}

// 		_update_texture_alpha_map() {
// 			return this._update_texture("alpha_map", "alphaMap");
// 		}
// 		_update_texture_map() {
// 			return this._update_texture("map");
// 		}

// 		_add_texture_params(
// 			name: string,
// 			default_url: string = File.DEFAULT_NODE_PATH.UV,
// 			texture_options: object = {}
// 		) {
// 			if (default_url == null) {
// 				default_url = "";
// 			}
// 			if (texture_options == null) {
// 				texture_options = {};
// 			}
// 			const toggle_param_name = `use_${name}`;
// 			const visible_options = {};
// 			visible_options[toggle_param_name] = true;
// 			this.self.add_param(ParamType.TOGGLE, toggle_param_name, 0);
// 			this.self.add_param(
// 				ParamType.OPERATOR_PATH,
// 				`${name}`,
// 				default_url,
// 				{
// 					texture: texture_options,
// 					visible_if: visible_options,
// 					node_selection: { context: NodeContext.COP }
// 				}
// 			);

// 			// this.self.add_update_method(this._update_texture, name);
// 		}
// 		_add_params_env_texture(options = {}) {
// 			const name = "env_map";
// 			const toggle_param_name = `use_${name}`;
// 			const visible_options = {};
// 			visible_options[toggle_param_name] = true;
// 			this.self.add_param(ParamType.TOGGLE, toggle_param_name, 0);
// 			this.self.add_param(
// 				ParamType.OPERATOR_PATH,
// 				`${name}`,
// 				File.DEFAULT_NODE_PATH.ENV_MAP,
// 				{
// 					visible_if: visible_options,
// 					node_selection: { context: NodeContext.COP }
// 				}
// 			);

// 			this._env_map_multiplier = options["env_map_multiplier"];
// 			if (this._env_map_multiplier) {
// 				this.self.add_param(
// 					ParamType.FLOAT,
// 					this._env_map_multiplier,
// 					1,
// 					{
// 						visible_if: visible_options
// 					}
// 				);
// 			}
// 		}

// 		// _load_texture(url, callback: TextureCallback){
// 		// 	if (url) {

// 		// 		CoreTextureLoader.load_url(url).then(texture=>{
// 		// 			if(texture){
// 		// 				callback(texture)
// 		// 			} else {
// 		// 				this.self.set_error(`could not load texture ${url}`);
// 		// 			}
// 		// 		}).catch((error)=>{
// 		// 			this.self.set_error(`could not load texture ${url} (${error})`);
// 		// 		})

// 		// 	} else {
// 		// 		callback()
// 		// 		this.self.set_error(`not a valid url`);
// 		// 	}
// 		// }

// 		async _update_texture(attrib: string, uniform_name?: string) {
// 			uniform_name = uniform_name || attrib;

// 			const use_param_name = `use_${attrib}`;
// 			const cache_name = this.self.param_cache_name(use_param_name);
// 			const use_param = this[cache_name];
// 			let texture_assigned = false;
// 			const uniform = this.self._material.uniforms[uniform_name];
// 			const defines = [`USE_${attrib.toUpperCase()}`, "USE_UV"];

// 			if (use_param) {
// 				const map_node = this.self.param(attrib).found_node();
// 				if (map_node != null) {
// 					const map_container = await map_node.request_container();
// 					const map_texture = map_container.core_content();
// 					if (map_texture) {
// 						// UPDATE on 28/12/2019
// 						// instead of setting the defines
// 						// I now have to update the material attributes
// 						// such as material.map = <texture>
// 						// on top of updating the uniforms.
// 						// The reason is that due to changes in threejs internals,
// 						// the material would work on first generation,
// 						// but would not compile when updated,
// 						// as three now derivates the defines from attributes like .map
// 						// and therefore the previous method would conflict.
// 						// for(let define of defines){
// 						// 	this.self._material.defines[define] = 1
// 						// }
// 						if (uniform.value != map_texture) {
// 							uniform.value = map_texture;
// 							this.self._material[uniform_name] = map_texture;
// 							this.self._material.needsUpdate = true;
// 						}
// 						texture_assigned = true;
// 					}
// 				}
// 			}

// 			if (!texture_assigned) {
// 				if (uniform.value != null) {
// 					this.self._material.needsUpdate = true;
// 				}
// 				uniform.value = null;
// 				for (let define of defines) {
// 					delete this.self._material.defines[define];
// 				}
// 			}
// 		}
// 		async _update_env_texture() {
// 			const use_param_name = `use_env_map`;
// 			const cache_name = this.self.param_cache_name(use_param_name);
// 			const use_param = this[cache_name];
// 			let texture_assigned = false;
// 			const define = `USE_ENV_MAP`;
// 			const uniform = this._material.uniforms["envMap"];

// 			if (use_param) {
// 				const env_map_node = this.param("env_map").found_node();
// 				if (env_map_node != null) {
// 					const env_map_container = await env_map_node.request_container();
// 					const env_map_texture = env_map_container.core_content();
// 					if (env_map_texture) {
// 						if (uniform.value != env_map_texture) {
// 							this._material.needsUpdate = true;
// 							uniform.value = env_map_texture;
// 							this._material.envMap = env_map_texture;
// 						}
// 						this._material.defines[define] = 1;
// 						texture_assigned = true;
// 						// this._material.defines["ENVMAP_TYPE_CUBE"] = 1
// 						// this._material.defines["ENVMAP_MODE_REFLECTION"] = 1
// 						// this._material.defines["ENVMAP_BLENDING_ADD"] = 1
// 					}
// 				}
// 			}
// 			if (!texture_assigned) {
// 				if (uniform.value != null) {
// 					this.self._material.needsUpdate = true;
// 				}
// 				uniform.value = null;
// 				delete this._material.defines[define];
// 			}

// 			// gets
// 			// - envMapIntensity for MeshStandard
// 			// - reflectivity for MeshLambert
// 			if (this._env_map_multiplier) {
// 				const env_map_multiplier_cache_name = this.param_cache_name(
// 					this._env_map_multiplier
// 				);
// 				const intensity_uniform_name = lodash_camelCase(
// 					this._env_map_multiplier
// 				);
// 				const intensity_uniform = this._material.uniforms[
// 					intensity_uniform_name
// 				];
// 				if (intensity_uniform && this[env_map_multiplier_cache_name]) {
// 					intensity_uniform.value = this[
// 						env_map_multiplier_cache_name
// 					];
// 				}
// 			}
// 		}

// 		// async _update_texture(attrib: string){
// 		// 	const use_param_name = `use_texture_${attrib}`;
// 		// 	// const material_attr = this.__material_attr(attrib);

// 		// 	const texture_url_param_name = `texture_${attrib}`;
// 		// 	const texture_url_param = this.self.param(texture_url_param_name);

// 		// 	const use_texture = this[`_param_${use_param_name}`]
// 		// 	const url = this[`_param_${texture_url_param_name}`];

// 		// 	const use_texture_cache_name = `_texture_concerns_${texture_url_param_name}_use_texture_cache`
// 		// 	const url_cache_name = `_texture_concerns_${texture_url_param_name}_url_cache`
// 		// 	const texture_cache_name = `_texture_concerns_${texture_url_param_name}_texture_cache`

// 		// 	const previous_use_texture = this[use_texture_cache_name]
// 		// 	const previous_url = this[url_cache_name]
// 		// 	let texture = this[texture_cache_name]

// 		// 	// we should still re-evaluate if:
// 		// 	// - the texture is a video
// 		// 	// - the texture comes from a node
// 		// 	// so for now, it is always active
// 		// 	let re_evaluate = true //(previous_url != url) || (previous_use_texture != use_texture)

// 		// 	if(re_evaluate){

// 		// 		this._texture_loaders_by_param_name[texture_url_param] = this._texture_loaders_by_param_name[texture_url_param] || new CoreTextureLoader(this, texture_url_param)

// 		// 		if (use_texture) {
// 		// 			texture = await this._texture_loaders_by_param_name[texture_url_param].load_texture_from_url_or_op(url);
// 		// 			if(texture){
// 		// 				this._assign_texture(attrib, texture)
// 		// 			}
// 		// 		} else {
// 		// 			texture_url_param.graph_disconnect_predecessors()
// 		// 			this.remove_texture(attrib)
// 		// 		}
// 		// 	}
// 		// 	this[texture_cache_name] = texture
// 		// 	this[url_cache_name] = url
// 		// 	this[use_texture_cache_name] = use_texture
// 		// 	return texture
// 		// }

// 		__material_attr(attrib: string) {
// 			return lodash_camelCase(attrib);
// 		}

// 		// _load_texture_from_url_or_op(
// 		// 	texture_url_param: BaseParam,
// 		// 	url: string,
// 		// ){
// 		// 	return CoreTextureLoader.load_texture_from_url_or_op(
// 		// 		this,
// 		// 		texture_url_param,
// 		// 		url,
// 		// 	)
// 		// texture_url_param.graph_disconnect_predecessors()
// 		// // const material_attr = this.__material_attr(attrib);

// 		// if (url.substring(0,3) == 'op:'){
// 		// 	const node = this._find_node(url.substring(3))
// 		// 	this._load_texture_from_node(node).then(texture=> {
// 		// 		if(texture_url_param){
// 		// 			texture_url_param.add_graph_input(node)
// 		// 		}
// 		// 		// this._material[material_attr] = texture;
// 		// 		this._assign_texture(attrib, texture)
// 		// 		callback(texture)
// 		// 	})
// 		// } else {
// 		// 	console.log("load url", url)
// 		// 	CoreTextureLoader.load_url(url).then(texture=> {
// 		// 		console.log("texture")
// 		// 		if(texture){

// 		// 			texture_url_param.mark_as_referencing_asset(url)

// 		// 			if(texture_url_param.texture_as_env()){
// 		// 				texture = CoreTextureLoader.set_texture_for_env(texture, this)
// 		// 			} else {
// 		// 				texture = CoreTextureLoader.set_texture_for_mapping(texture);
// 		// 			}
// 		// 			// this._material[material_attr] = texture;
// 		// 			this._assign_texture(attrib, texture)
// 		// 			callback(texture);
// 		// 		} else {
// 		// 			this.self.set_error(`could not load texture ${url} (${error})`);
// 		// 			// callback() // not sure this is necessary since set_error will call end_cook()
// 		// 		}

// 		// 	}).catch(error=>{
// 		// 		this.self.set_error(`could not load texture ${url} (${error})`);
// 		// 	})
// 		// }
// 		// }

// 		remove_texture(attrib) {
// 			this._assign_texture(attrib, null);
// 		}

// 		_assign_texture(attrib: string, texture?: THREE.Texture) {
// 			const material_attr = this.__material_attr(attrib);
// 			// if(texture){
// 			// console.log("assign tex", attrib, material_attr, texture)
// 			// }

// 			if (this.__has_uniforms()) {
// 				this._material.uniforms[material_attr].value = texture;
// 				const define = `USE_${attrib.toUpperCase().replace(/_/g, "")}`;
// 				if (texture) {
// 					this._material.defines[define] = 1;
// 					// this._material.defines["ENVMAP_TYPE_CUBE"] = 1
// 					// this._material.defines["ENVMAP_MODE_REFLECTION"] = 1
// 					// this._material.defines["ENVMAP_BLENDING_ADD"] = 1
// 					this._material[material_attr] = texture;
// 				} else {
// 					delete this._material.defines[define];
// 					this._material[material_attr] = null;
// 				}
// 			} else {
// 				this._material[material_attr] = texture;
// 			}
// 		}

// 		// _set_texture_for_mapping(texture: THREE.Texture){
// 		// 	// texture.wrapS = THREE.RepeatWrapping
// 		// 	// texture.wrapT = THREE.RepeatWrapping
// 		// 	return texture;
// 		// }

// 		// _set_texture_for_env(texture: THREE.Texture){
// 		// 	if(this._registered_env_map){
// 		// 		POLY.renderers_controller.deregister_env_map(this._registered_env_map)
// 		// 	}
// 		// 	this._registered_env_map = POLY.renderers_controller.register_env_map(texture)
// 		// 	return this._registered_env_map

// 		// }

// 		_find_node(node_path: string): BaseNode {
// 			return CoreWalker.find_node((<unknown>this) as BaseNode, node_path);
// 		}
// 		async _load_texture_from_node(node: BaseNode) {
// 			const container = await node.request_container_p();
// 			return container.texture();
// 		}
// 	};
// }
