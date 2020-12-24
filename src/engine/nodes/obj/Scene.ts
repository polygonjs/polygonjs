/**
 * Creates a THREE.Scene.
 *
 * @remarks
 * By default, all objects created will be added under the same master scene. This is enough in most cases, but there might be times where you want to use a custom one. For instance:
 *
 * - you would like to change the background color or the environment.
 * - you would like to have a fog.
 * - You may also use multiple scenes, if you want to switch from one to the other.
 *
 * For those situtation, you can parent the objects under a scene node, and set your camera scene parameter to point to it. The camera will then render this scene instead of the master one.
 *
 *
 */
import {TypedObjNode} from './_Base';
import {Scene} from 'three/src/scenes/Scene';
import {Fog} from 'three/src/scenes/Fog';
import {FogExp2} from 'three/src/scenes/FogExp2';
import {NodeContext} from '../../poly/NodeContext';
import {BaseCopNodeType} from '../cop/_Base';
import {BaseMatNodeType} from '../mat/_Base';
import {HierarchyController} from './utils/HierarchyController';

enum BackgroundMode {
	NONE = 'none',
	COLOR = 'color',
	TEXTURE = 'texture',
}
const BACKGROUND_MODES: BackgroundMode[] = [BackgroundMode.NONE, BackgroundMode.COLOR, BackgroundMode.TEXTURE];

enum FogType {
	LINEAR = 'linear',
	EXPONENTIAL = 'exponential',
}
const FOG_TYPES: FogType[] = [FogType.LINEAR, FogType.EXPONENTIAL];

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class SceneObjParamConfig extends NodeParamsConfig {
	/** @param autoUpdate */
	auto_update = ParamConfig.BOOLEAN(1);

	// background
	/** @param set background mode (none, color or texture) */
	background_mode = ParamConfig.INTEGER(BACKGROUND_MODES.indexOf(BackgroundMode.NONE), {
		menu: {
			entries: BACKGROUND_MODES.map((mode, i) => {
				return {name: mode, value: i};
			}),
		},
	});
	/** @param background color */
	bg_color = ParamConfig.COLOR([0, 0, 0], {
		visible_if: {background_mode: BACKGROUND_MODES.indexOf(BackgroundMode.COLOR)},
	});
	/** @param background texture */
	bg_texture = ParamConfig.OPERATOR_PATH('', {
		visible_if: {background_mode: BACKGROUND_MODES.indexOf(BackgroundMode.TEXTURE)},
		node_selection: {
			context: NodeContext.COP,
		},
		dependent_on_found_node: false,
	});

	// environment
	/** @param toggle on to use an environment map */
	use_environment = ParamConfig.BOOLEAN(0);
	/** @param environment map */
	environment = ParamConfig.OPERATOR_PATH('', {
		visible_if: {use_environment: 1},
		node_selection: {
			context: NodeContext.COP,
		},
		dependent_on_found_node: false,
	});

	// fog
	/** @param toggle on to use fog */
	use_fog = ParamConfig.BOOLEAN(0);
	/** @param fog type */
	fog_type = ParamConfig.INTEGER(FOG_TYPES.indexOf(FogType.EXPONENTIAL), {
		visible_if: {use_fog: 1},
		menu: {
			entries: FOG_TYPES.map((mode, i) => {
				return {name: mode, value: i};
			}),
		},
	});
	/** @param fog color */
	fog_color = ParamConfig.COLOR([1, 1, 1], {visible_if: {use_fog: 1}});
	/** @param fog near */
	fog_near = ParamConfig.FLOAT(1, {
		range: [0, 100],
		range_locked: [true, false],
		visible_if: {use_fog: 1, fog_type: FOG_TYPES.indexOf(FogType.LINEAR)},
	});
	/** @param fog far */
	fog_far = ParamConfig.FLOAT(100, {
		range: [0, 100],
		range_locked: [true, false],
		visible_if: {use_fog: 1, fog_type: FOG_TYPES.indexOf(FogType.LINEAR)},
	});
	/** @param fog density */
	fog_density = ParamConfig.FLOAT(0.00025, {
		visible_if: {use_fog: 1, fog_type: FOG_TYPES.indexOf(FogType.EXPONENTIAL)},
	});

	// override material
	/** @param toggle on to override all materials */
	use_override_material = ParamConfig.BOOLEAN(0);
	/** @param material */
	override_material = ParamConfig.OPERATOR_PATH('/MAT/mesh_standard1', {
		visible_if: {use_override_material: 1},
		node_selection: {
			context: NodeContext.MAT,
		},
		dependent_on_found_node: false,
	});
}
const ParamsConfig = new SceneObjParamConfig();

export class SceneObjNode extends TypedObjNode<Scene, SceneObjParamConfig> {
	params_config = ParamsConfig;
	static type(): Readonly<'scene'> {
		return 'scene';
	}
	// protected _attachable_to_hierarchy: boolean = false;
	readonly hierarchy_controller: HierarchyController = new HierarchyController(this);

	private _fog: Fog | undefined;
	private _fog_exp2: FogExp2 | undefined;

	create_object() {
		const scene = new Scene();
		scene.matrixAutoUpdate = false;
		return scene;
	}

	initialize_node() {
		// this.dirty_controller.add_post_dirty_hook(
		// 	'_cook_main_without_inputs_when_dirty',
		// 	this._cook_main_without_inputs_when_dirty_bound
		// );

		// super.initialize_node();
		this.hierarchy_controller.initialize_node();
		// this.io.outputs.set_has_one_output();
	}
	// TODO: I may be able to swap those methods to param callbacks for most params
	// private _cook_main_without_inputs_when_dirty_bound = this._cook_main_without_inputs_when_dirty.bind(this);
	// private async _cook_main_without_inputs_when_dirty() {
	// 	// if (this.used_in_scene) {
	// 	await this.cook_controller.cook_main_without_inputs();
	// 	// }
	// }

	cook() {
		if (this.pv.auto_update != this.object.autoUpdate) {
			this.object.autoUpdate = this.pv.auto_update;
		}

		this._update_background();
		this._update_fog();
		this._update_enviromment();
		this._update_material_override();

		this.cook_controller.end_cook();
	}

	//
	//
	// BACKGROUND
	//
	//
	private _update_background() {
		if (this.pv.background_mode == BACKGROUND_MODES.indexOf(BackgroundMode.NONE)) {
			this.object.background = null;
		} else {
			if (this.pv.background_mode == BACKGROUND_MODES.indexOf(BackgroundMode.COLOR)) {
				this.object.background = this.pv.bg_color;
			} else {
				const node = this.p.bg_texture.found_node();
				if (node) {
					if (node.node_context() == NodeContext.COP) {
						(node as BaseCopNodeType).request_container().then((container) => {
							this.object.background = container.texture();
						});
					} else {
						this.states.error.set('bg_texture node is not a texture');
					}
				} else {
					this.states.error.set('bg_texture node not found');
				}
			}
		}
	}

	//
	//
	// FOG
	//
	//
	private _update_fog() {
		if (this.pv.use_fog) {
			if (this.pv.fog_type == FOG_TYPES.indexOf(FogType.LINEAR)) {
				this.object.fog = this.fog;
				this.fog.color = this.pv.fog_color;
				this.fog.near = this.pv.fog_near;
				this.fog.far = this.pv.fog_far;
			} else {
				this.object.fog = this.fog_exp2;
				this.fog_exp2.color = this.pv.fog_color;
				this.fog_exp2.density = this.pv.fog_density;
			}
		} else {
			const current_fog = this.object.fog;
			if (current_fog) {
				this.object.fog = null;
			}
		}
	}
	get fog() {
		return (this._fog = this._fog || new Fog(0xffffff, this.pv.fog_near, this.pv.fog_far));
	}
	get fog_exp2() {
		return (this._fog_exp2 = this._fog_exp2 || new FogExp2(0xffffff, this.pv.fog_density));
	}

	//
	//
	// ENVIRONMENT
	//
	//
	private _update_enviromment() {
		if (this.pv.use_environment) {
			const node = this.p.environment.found_node();
			if (node) {
				if (node.node_context() == NodeContext.COP) {
					(node as BaseCopNodeType).request_container().then((container) => {
						this.object.environment = container.texture();
					});
				} else {
					this.states.error.set('bg_texture node is not a texture');
				}
			} else {
				this.states.error.set('bg_texture node not found');
			}
		} else {
			this.object.environment = null;
		}
	}

	//
	//
	// MATERIAL OVERRIDE
	//
	//
	private _update_material_override() {
		if (this.pv.use_override_material) {
			const node = this.p.override_material.found_node();
			if (node) {
				if (node.node_context() == NodeContext.MAT) {
					(node as BaseMatNodeType).request_container().then((container) => {
						this.object.overrideMaterial = container.material();
					});
				} else {
					this.states.error.set('bg_texture node is not a material');
				}
			} else {
				this.states.error.set('bg_texture node not found');
			}
		} else {
			this.object.overrideMaterial = null;
		}
	}
}
