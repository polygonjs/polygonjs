import {BaseNodeType} from '../../../nodes/_Base';
import {BaseParamType} from '../../../params/_Base';
import {MissingReference} from './MissingReference';
import {MapUtils} from '../../../../core/MapUtils';
import {PolyScene} from '../../PolyScene';
import {CoreWalker} from '../../../../core/Walker';
import {CoreGraphNodeId} from '../../../../core/graph/CoreGraph';
import {SetUtils} from '../../../../core/SetUtils';

export class MissingReferencesController {
	private references: Map<CoreGraphNodeId, Set<MissingReference>> = new Map();

	constructor(private scene: PolyScene) {}

	register(param: BaseParamType, path: string): MissingReference {
		const missingReference = new MissingReference(param, path);

		MapUtils.addToSetAtEntry(this.references, param.graphNodeId(), missingReference);

		return missingReference;
	}
	deregisterParam(param: BaseParamType) {
		this.references.delete(param.graphNodeId());
	}

	//
	//
	// MISSING REFERENCES
	//
	//
	resolveMissingReferences() {
		const resolved_references: MissingReference[] = [];
		this.references.forEach((references) => {
			for (let reference of references) {
				if (this._is_reference_resolvable(reference)) {
					resolved_references.push(reference);
				}
			}
		});
		for (let reference of resolved_references) {
			reference.resolveMissingDependencies();
		}
	}
	private _is_reference_resolvable(reference: MissingReference) {
		const absolute_path = reference.absolutePath();
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
	checkForMissingReferences(node: BaseNodeType) {
		this._checkForMissingReferencesForNode(node);
		for (let param of node.params.all) {
			this._checkForMissingReferencesForParam(param);
		}
	}
	private _checkForMissingReferencesForNode(node: BaseNodeType) {
		const id = node.graphNodeId();

		const missingReferences = MapUtils.arrayFromValues(this.references);
		for (let missingReference of missingReferences) {
			let match_found = false;
			const list = SetUtils.toArray(missingReference);
			for (let ref of list) {
				if (ref.matchesPath(node.path())) {
					match_found = true;
					ref.resolveMissingDependencies();
				}
			}
			if (match_found) {
				this.references.delete(id);
			}
		}
	}
	private _checkForMissingReferencesForParam(param: BaseParamType) {
		const id = param.graphNodeId();

		const missingReferences = MapUtils.arrayFromValues(this.references);
		for (let missingReference of missingReferences) {
			let match_found = false;
			const list = SetUtils.toArray(missingReference);
			for (let ref of list) {
				if (ref.matchesPath(param.path())) {
					match_found = true;
					ref.resolveMissingDependencies();
				}
			}
			if (match_found) {
				this.references.delete(id);
			}
		}
	}
}
