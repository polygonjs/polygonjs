import {BaseNodeType} from '../../nodes/_Base';
import {BaseParamType} from '../../params/_Base';
import {MissingExpressionReference} from '../../expressions/MissingReference';
import jsep from 'jsep';
import {MapUtils} from '../../../core/MapUtils';
import {PolyScene} from '../PolyScene';
import {CoreWalker} from '../../../core/Walker';
import {CoreGraphNodeId} from '../../../core/graph/CoreGraph';

// type MissingExpressionReferenceById = Map<number, MissingExpressionReference>;
// type MissingExpressionReferenceByIdByPath = Map<string, MissingExpressionReferenceById>;

export class MissingReferencesController {
	private references: Map<CoreGraphNodeId, MissingExpressionReference[]> = new Map();

	constructor(private scene: PolyScene) {}

	register(param: BaseParamType, jsep_node: jsep.Expression, path_argument: string): MissingExpressionReference {
		const missing_expression_reference = new MissingExpressionReference(param, path_argument);

		MapUtils.push_on_array_at_entry(this.references, param.graphNodeId(), missing_expression_reference);

		return missing_expression_reference;
	}
	deregister_param(param: BaseParamType) {
		this.references.delete(param.graphNodeId());
	}

	//
	//
	// MISSING REFERENCES
	//
	//
	resolve_missing_references() {
		const resolved_references: MissingExpressionReference[] = [];
		this.references.forEach((references) => {
			for (let reference of references) {
				if (this._is_reference_resolvable(reference)) {
					resolved_references.push(reference);
				}
			}
		});
		for (let reference of resolved_references) {
			reference.resolve_missing_dependencies();
		}
	}
	private _is_reference_resolvable(reference: MissingExpressionReference) {
		const absolute_path = reference.absolute_path();
		if (absolute_path) {
			const node = this.scene.node(absolute_path);
			// try and find a node first
			if (node) {
				return true;
			} else {
				// if no node, try and find a param, via a parent first
				const paths = CoreWalker.split_parent_child(absolute_path);
				if (paths.child) {
					const parent_node = this.scene.node(paths.parent);
					if (parent_node) {
						const param = parent_node.params.get(paths.child);
						if (param) {
							return true;
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
		const id = node.graphNodeId();

		this.references.forEach((missing_references, node_id) => {
			let match_found = false;
			for (let ref of missing_references) {
				if (ref.matches_path(node.fullPath())) {
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
		const id = param.graphNodeId();

		this.references.forEach((missing_references, node_id) => {
			let match_found = false;
			for (let ref of missing_references) {
				if (ref.matches_path(param.fullPath())) {
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
