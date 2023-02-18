/**
 * Returns the name of a camera created by a node.
 *
 * @remarks
 * It takes 2 arguments.
 *
 * `cameraName(input_index_or_node_path, object_index)`
 *
 * - `input_index_or_node_path` the path to a node, or input index
 * - `object_index` the index of the object
 *
 * ## Usage
 *
 * - `cameraName(0, 1)` - returns the name of 2nd camera (index 1 in the array) in the input node.
 * - `cameraName('/geo/merge1', 2)` - returns the name of the 3nd camera (index 2 in the array) in the node /geo/merge1
 *
 */
import {Poly} from '../../Poly';
import {Object3D} from 'three';
import {BaseMethodFindDependencyArgs} from './_Base';
import {BaseMethod} from './_Base';
import {MethodDependency} from '../MethodDependency';
import {GeometryContainer} from '../../containers/Geometry';

export class CameraNameExpression extends BaseMethod {
	static override requiredArguments() {
		return [
			['string', 'path to node'],
			['number', 'object index'],
		];
	}

	override findDependency(args: BaseMethodFindDependencyArgs): MethodDependency | null {
		return this.createDependencyFromIndexOrPath(args);
	}

	override processArguments(args: any[]): Promise<any> {
		return new Promise(async (resolve, reject) => {
			if (args.length == 2) {
				const index_or_path = args[0];
				let objectIndex = parseInt(args[1]);
				if (isNaN(objectIndex)) {
					objectIndex = 0;
				}

				let container: GeometryContainer;
				try {
					container = (await this.getReferencedNodeContainer(index_or_path)) as GeometryContainer;
				} catch (e) {
					reject(e);
					return;
				}

				if (container) {
					const coreContent = container.coreContent();
					if (coreContent) {
						const object = coreContent
							.objects()
							.filter((object) => Poly.camerasRegister.objectRegistered(object))[
							objectIndex
						] as Object3D | null;
						if (object) {
							resolve(object.name);
						}
						resolve('');
					} else {
						resolve('');
					}
				}
			} else {
				resolve('');
			}
		});
	}
}
