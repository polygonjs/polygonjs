import {BaseNodeType} from '../../nodes/_Base';
import {BaseParamType} from '../../params/_Base';
import {MissingExpressionReference} from '../../expressions/MissingReference';
import jsep from 'jsep';
import {MapUtils} from '../../../core/MapUtils';
import {PolyScene} from '../PolyScene';
import {CoreWalker} from '../../../core/Walker';

// type MissingExpressionReferenceById = Map<number, MissingExpressionReference>;
// type MissingExpressionReferenceByIdByPath = Map<string, MissingExpressionReferenceById>;

export class MissingReferencesController {
	private references: Map<string, MissingExpressionReference[]> = new Map<string, MissingExpressionReference[]>();

	constructor(private scene: PolyScene) {}

	register(param: BaseParamType, jsep_node: jsep.Expression, path_argument: string): MissingExpressionReference {
		const missing_expression_reference = new MissingExpressionReference(param, path_argument);

		MapUtils.push_on_array_at_entry(this.references, param.graph_node_id, missing_expression_reference);

		return missing_expression_reference;
	}
	deregister_param(param: BaseParamType) {
		this.references.delete(param.graph_node_id);
	}

	//
	//
	// MISSING REFERENCES
	//
	//
	resolve_missing_references() {
		this.references.forEach((references) => {
			for (let reference of references) {
				this._resolve_missing_reference(reference);
			}
		});
	}
	private _resolve_missing_reference(reference: MissingExpressionReference) {
		const absolute_path = reference.absolute_path();
		if (absolute_path) {
			const node = this.scene.node(absolute_path);
			// try and find a node first
			if (node) {
				reference.resolve_missing_dependencies();
			} else {
				// if no node, try and find a param, via a parent first
				const paths = CoreWalker.split_parent_child(absolute_path);
				if (paths.child) {
					const parent_node = this.scene.node(paths.parent);
					if (parent_node) {
						const param = parent_node.params.get(paths.child);
						if (param) {
							reference.resolve_missing_dependencies();
						}
					}
				}
			}
		}
	}

	// call this from node.create and node.rename
	check_for_missing_references(node: BaseNodeType) {
		this._check_for_missing_references_for_node(node);
		for (let param of node.params.all) {
			this._check_for_missing_references_for_param(param);
		}
	}
	private _check_for_missing_references_for_node(node: BaseNodeType) {
		const id = node.graph_node_id;

		this.references.forEach((missing_references, node_id) => {
			let match_found = false;
			for (let ref of missing_references) {
				if (ref.matches_path(node.full_path())) {
					match_found = true;
					ref.resolve_missing_dependencies();
				}
			}
			if (match_found) {
				this.references.delete(id);
			}
		});
	}
	private _check_for_missing_references_for_param(param: BaseParamType) {
		const id = param.graph_node_id;

		this.references.forEach((missing_references, node_id) => {
			let match_found = false;
			for (let ref of missing_references) {
				if (ref.matches_path(param.full_path())) {
					match_found = true;
					ref.resolve_missing_dependencies();
				}
			}
			if (match_found) {
				this.references.delete(id);
			}
		});
	}
}
