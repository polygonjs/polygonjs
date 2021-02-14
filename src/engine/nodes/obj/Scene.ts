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
	autoUpdate = ParamConfig.BOOLEAN(1);

	// background
	/** @param set background mode (none, color or texture) */
	backgroundMode = ParamConfig.INTEGER(BACKGROUND_MODES.indexOf(BackgroundMode.NONE), {
		menu: {
			entries: BACKGROUND_MODES.map((mode, i) => {
				return {name: mode, value: i};
			}),
		},
	});
	/** @param background color */
	bgColor = ParamConfig.COLOR([0, 0, 0], {
		visibleIf: {backgroundMode: BACKGROUND_MODES.indexOf(BackgroundMode.COLOR)},
	});
	/** @param background texture */
	bgTexture = ParamConfig.OPERATOR_PATH('', {
		visibleIf: {backgroundMode: BACKGROUND_MODES.indexOf(BackgroundMode.TEXTURE)},
		nodeSelection: {
			context: NodeContext.COP,
		},
		dependentOnFoundNode: false,
	});

	// environment
	/** @param toggle on to use an environment map */
	useEnvironment = ParamConfig.BOOLEAN(0);
	/** @param environment map */
	environment = ParamConfig.OPERATOR_PATH('', {
		visibleIf: {useEnvironment: 1},
		nodeSelection: {
			context: NodeContext.COP,
		},
		dependentOnFoundNode: false,
	});

	// fog
	/** @param toggle on to use fog */
	useFog = ParamConfig.BOOLEAN(0);
	/** @param fog type */
	fogType = ParamConfig.INTEGER(FOG_TYPES.indexOf(FogType.EXPONENTIAL), {
		visibleIf: {useFog: 1},
		menu: {
			entries: FOG_TYPES.map((mode, i) => {
				return {name: mode, value: i};
			}),
		},
	});
	/** @param fog color */
	fogColor = ParamConfig.COLOR([1, 1, 1], {visibleIf: {useFog: 1}});
	/** @param fog near */
	fogNear = ParamConfig.FLOAT(1, {
		range: [0, 100],
		rangeLocked: [true, false],
		visibleIf: {useFog: 1, fogType: FOG_TYPES.indexOf(FogType.LINEAR)},
	});
	/** @param fog far */
	fogFar = ParamConfig.FLOAT(100, {
		range: [0, 100],
		rangeLocked: [true, false],
		visibleIf: {useFog: 1, fogType: FOG_TYPES.indexOf(FogType.LINEAR)},
	});
	/** @param fog density */
	fogDensity = ParamConfig.FLOAT(0.00025, {
		visibleIf: {useFog: 1, fogType: FOG_TYPES.indexOf(FogType.EXPONENTIAL)},
	});

	// override material
	/** @param toggle on to override all materials */
	useOverrideMaterial = ParamConfig.BOOLEAN(0);
	/** @param material */
	overrideMaterial = ParamConfig.OPERATOR_PATH('/MAT/mesh_standard1', {
		visibleIf: {useOverrideMaterial: 1},
		nodeSelection: {
			context: NodeContext.MAT,
		},
		dependentOnFoundNode: false,
	});
}
const ParamsConfig = new SceneObjParamConfig();

export class SceneObjNode extends TypedObjNode<Scene, SceneObjParamConfig> {
	params_config = ParamsConfig;
	static type(): Readonly<'scene'> {
		return 'scene';
	}
	readonly hierarchyController: HierarchyController = new HierarchyController(this);

	private _fog: Fog | undefined;
	private _fogExp2: FogExp2 | undefined;

	create_object() {
		const scene = new Scene();
		scene.matrixAutoUpdate = false;
		return scene;
	}

	initializeNode() {
		// this.dirtyController.addPostDirtyHook(
		// 	'_cook_main_without_inputs_when_dirty',
		// 	this._cook_main_without_inputs_when_dirty_bound
		// );

		// super.initializeNode();
		this.hierarchyController.initializeNode();
		// this.io.outputs.set_has_one_output();
	}
	// TODO: I may be able to swap those methods to param callbacks for most params
	// private _cook_main_without_inputs_when_dirty_bound = this._cook_main_without_inputs_when_dirty.bind(this);
	// private async _cook_main_without_inputs_when_dirty() {
	// 	// if (this.used_in_scene) {
	// 	await this.cookController.cook_main_without_inputs();
	// 	// }
	// }

	cook() {
		if (this.pv.autoUpdate != this.object.autoUpdate) {
			this.object.autoUpdate = this.pv.autoUpdate;
		}

		this._update_background();
		this._update_fog();
		this._update_enviromment();
		this._update_material_override();

		this.cookController.end_cook();
	}

	//
	//
	// BACKGROUND
	//
	//
	private _update_background() {
		if (this.pv.backgroundMode == BACKGROUND_MODES.indexOf(BackgroundMode.NONE)) {
			this.object.background = null;
		} else {
			if (this.pv.backgroundMode == BACKGROUND_MODES.indexOf(BackgroundMode.COLOR)) {
				this.object.background = this.pv.bgColor;
			} else {
				const node = this.p.bgTexture.found_node();
				if (node) {
					if (node.nodeContext() == NodeContext.COP) {
						(node as BaseCopNodeType).requestContainer().then((container) => {
							this.object.background = container.texture();
						});
					} else {
						this.states.error.set('bgTexture node is not a texture');
					}
				} else {
					this.states.error.set('bgTexture node not found');
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
		if (this.pv.useFog) {
			if (this.pv.fogType == FOG_TYPES.indexOf(FogType.LINEAR)) {
				const fog = this.fog2();
				this.object.fog = fog;
				fog.color = this.pv.fogColor;
				fog.near = this.pv.fogNear;
				fog.far = this.pv.fogFar;
			} else {
				const fogExp2 = this.fogExp2();
				this.object.fog = this.fogExp2();
				fogExp2.color = this.pv.fogColor;
				fogExp2.density = this.pv.fogDensity;
			}
		} else {
			const current_fog = this.object.fog;
			if (current_fog) {
				this.object.fog = null;
			}
		}
	}
	fog2() {
		return (this._fog = this._fog || new Fog(0xffffff, this.pv.fogNear, this.pv.fogFar));
	}
	fogExp2() {
		return (this._fogExp2 = this._fogExp2 || new FogExp2(0xffffff, this.pv.fogDensity));
	}

	//
	//
	// ENVIRONMENT
	//
	//
	private _update_enviromment() {
		if (this.pv.useEnvironment) {
			const node = this.p.environment.found_node();
			if (node) {
				if (node.nodeContext() == NodeContext.COP) {
					(node as BaseCopNodeType).requestContainer().then((container) => {
						this.object.environment = container.texture();
					});
				} else {
					this.states.error.set('bgTexture node is not a texture');
				}
			} else {
				this.states.error.set('bgTexture node not found');
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
		if (this.pv.useOverrideMaterial) {
			const node = this.p.overrideMaterial.found_node();
			if (node) {
				if (node.nodeContext() == NodeContext.MAT) {
					(node as BaseMatNodeType).requestContainer().then((container) => {
						this.object.overrideMaterial = container.material();
					});
				} else {
					this.states.error.set('bgTexture node is not a material');
				}
			} else {
				this.states.error.set('bgTexture node not found');
			}
		} else {
			this.object.overrideMaterial = null;
		}
	}
}
