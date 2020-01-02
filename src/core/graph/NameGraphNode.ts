import {NodeSimple} from './NodeSimple'
import {NamedGraphNode, NamedGraphNodeClass} from './NamedGraphNode'

export class NameGraphNode extends NodeSimple {
	constructor(public owner: NamedGraphNodeClass) {
		super()
	}
}
