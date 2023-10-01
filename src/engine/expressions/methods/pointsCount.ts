/**
 * Returns the number of points in a geometry.
 *
 * @remarks
 * It takes 1 arguments.
 *
 * `pointsCount(input_index_or_node_path)`
 *
 * - `input_index_or_node_path` returns the number of points, as a number
 *
 * ## Usage
 *
 * - `pointsCount(0)` - returns the number of points in the input node.
 * - `pointsCount('/geo/merge1')` - returns the number of points in the node /geo/merge1
 *
 */
import {BaseMethodFindDependencyArgs} from './_Base';
import {BaseMethod} from './_Base';
import {MethodDependency} from '../MethodDependency';
import {GeometryContainer} from '../../containers/Geometry';
// import {CoreGroup} from '../../../core/Geometry/Group';

export class PointsCountExpression extends BaseMethod {
	// npoints(0)
	// npoints('../REF_bbox')
	static override requiredArguments() {
		return [['string', 'path to node']];
	}

	override findDependency(args: BaseMethodFindDependencyArgs): MethodDependency | null {
		return this.createDependencyFromIndexOrPath(args);
	}

	override async processArguments(args: any[]): Promise<number> {
		if (args.length == 1) {
			const indexOrPath = args[0];
			const container = (await this.getReferencedNodeContainer(indexOrPath)) as GeometryContainer;

			if (container) {
				const coreContent = container.coreContent()
				if(coreContent){
					return coreContent.pointsCount()
				}
			}
		}
		return 0;
	}
}
