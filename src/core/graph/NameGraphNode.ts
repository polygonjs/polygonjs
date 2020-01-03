import {NodeSimple} from './NodeSimple'
import {NamedGraphNodeClass} from './NamedGraphNode'

export class NameGraphNode extends NodeSimple {
	constructor(public owner: NodeSimple) {
		super()
	}
}
