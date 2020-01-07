import {PolyScene} from '../scene/PolyScene';
import {NodeScene} from 'src/core/graph/NodeScene';
import {NamedGraphNode} from 'src/core/graph/NamedGraphNode';

import {BaseParam} from 'src/engine/params/_Base';
import {GeometryContainer} from 'src/engine/containers/Geometry';
import {UIData} from './UIData';

import {Bypass} from './concerns/Bypass';
import {ConnectionsOwner} from './concerns/ConnectionsOwner';
import {ContainerOwner} from './concerns/ContainerOwner';
import {Cook} from './concerns/Cook';
import {CustomNode} from './concerns/CustomNode';
import {Dependencies} from './concerns/Dependencies';
import {DisplayFlag} from './concerns/DisplayFlag';
import {Errored} from './concerns/Errored';
import {HierarchyChildrenOwner} from './concerns/HierarchyChildrenOwner';
import {HierarchyParentOwner} from './concerns/HierarchyParentOwner';
import {InputsClonable} from './concerns/InputsClonable';
import {InputsOwner} from './concerns/InputsOwner';
import {Json} from './concerns/Json';
import {LifeCycle} from './concerns/LifeCycle';
import {Named} from './concerns/Named';
import {OutputsOwner} from './concerns/OutputsOwner';
import {ParamsOwner} from './concerns/ParamsOwner';
import {Selectable} from './concerns/Selectable';
import {TimeDependent} from './concerns/TimeDependent';
import {UIDataOwner} from './concerns/UIDataOwner';
import {Visit} from './concerns/Visit';

export class BaseNode extends Visit(
	UIDataOwner(
		Bypass(
			ConnectionsOwner(
				ContainerOwner(
					Cook(
						CustomNode(
							Dependencies(
								DisplayFlag(
									Errored(
										HierarchyParentOwner(
											HierarchyChildrenOwner(
												InputsClonable(
													InputsOwner(
														Json(
															LifeCycle(
																Named(
																	OutputsOwner(
																		ParamsOwner(
																			Selectable(
																				TimeDependent(NamedGraphNode(NodeScene))
																			)
																		)
																	)
																)
															)
														)
													)
												)
											)
										)
									)
								)
							)
						)
					)
				)
			)
		)
	)
) {
	constructor() {
		super();

		// this._init_node_scene()
		// this._init_context_owner()
		// this._init_dirtyable()
		// this._init_graph_node()

		this._init_bypass_flag();
		this._init_display_flag();
		//this._init_context()
		this._init_cook();
		// this._init_error();
		// this._init_inputs();
		this._init_outputs();
		this._init_hierarchy_parent_owner();
		//this._init_time_dependent()
		this._init_ui_data();
	}
	static type() {
		throw 'type to be overriden';
	}
	type() {
		return this.constructor.type();
	}

	static required_three_imports() {
		return null;
	}
	static required_imports() {
		let three_imports = this.required_three_imports();
		if (three_imports) {
			if (!lodash_isArray(three_imports)) {
				three_imports = [three_imports];
			}
			return three_imports.map((e) => `three/examples/jsm/${e}`);
		} else {
			return null;
		}
	}
	required_imports() {
		return this.constructor.required_imports();
	}
	static require_webgl2(): boolean {
		return false;
	}
	require_webgl2(): boolean {
		return this.constructor.require_webgl2();
	}

	set_scene(scene: PolyScene) {
		super.set_scene(scene);
		this._init_graph_node_inputs();
		this._init_params();
	}
	// root(): BaseNode {
	// 	return this;
	// }
	// parent(): BaseNode {
	// 	return this;
	// }
	// node(name: string): BaseNode {
	// 	return this;
	// }
	// param(name: string): BaseParam {
	// 	return null;
	// }
	// full_path(): string {
	// 	return 'test full path';
	// }
	// params_node(): any {
	// 	return null;
	// }
	// type(): string {
	// 	return '';
	// }
	// is_cooking(): boolean {
	// 	return false;
	// }
	// async request_container(): Promise<GeometryContainer> {
	// 	return new Promise((resolve, reject) => {
	// 		resolve(new GeometryContainer());
	// 	});
	// }
	// input_graph_node(index: number): NodeScene {
	// 	return null;
	// }
	// input(index: number): BaseNode {
	// 	return null;
	// }
	// ui_data() {
	// 	return new UIData(this);
	// }
	// children(): BaseNode[] {
	// 	return [];
	// }
	// children_allowed(): boolean {
	// 	return true;
	// }
	// node_context_signature(): string {
	// 	return '';
	// }
	// node_context(): string {
	// 	return '';
	// }
	// remove_node(node: BaseNode) {}
	// nodes_by_type(type: string): BaseNode[] {
	// 	return [];
	// }
	// to_json(test: boolean): object {
	// 	if (test) {
	// 		return {};
	// 	} else {
	// 		return {a: 1};
	// 	}
	// }
	// all_params(): BaseParam[] {
	// 	return [];
	// }
}
