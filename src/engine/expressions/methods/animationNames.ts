/**
 * Returns the names of animation clips inside a geometry. Animation Clips are typically loaded from a gltf file, using the [sop/fileGLTF](/docs/nodes/sop/fileGLTF) node.
 *
 * @remarks
 * It takes 1 or 2 arguments.
 *
 * `animationNames(input_index_or_node_path, object_index)`
 *
 * - `input_index_or_node_path` the path to a node, or input index
 * - `object_index` the index of the object (default to 0)
 *
 * ## Usage
 *
 * - `animationNames(0)` - returns the names animations in the 1st object of the input node.
 * - `animationNames(0, 1)` - returns the names animations in the 2nd object (index 1 in array) of the input node.
 * - `animationNames('/geo/merge1', 2)` - returns the names of animation in the 3rd object (index 2 in array) of the node /geo/merge1
 *
 */
import {Object3D} from 'three';
import {BaseMethodFindDependencyArgs} from './_Base';
import {BaseMethod} from './_Base';
import {MethodDependency} from '../MethodDependency';
import {GeometryContainer} from '../../containers/Geometry';

export class AnimationNamesExpression extends BaseMethod {
	static override requiredArguments() {
		return [
			['string', 'path to node'],
			['number', 'object index (optional)'],
		];
	}

	override findDependency(args: BaseMethodFindDependencyArgs): MethodDependency | null {
		return this.createDependencyFromIndexOrPath(args);
	}

	override processArguments(args: any[]): Promise<any> {
		return new Promise(async (resolve, reject) => {
			if (args.length == 1 || args.length == 2) {
				const index_or_path = args[0];
				let objectIndex = parseInt(args[1]);
				if (isNaN(objectIndex) || objectIndex == null) {
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
						const object = coreContent.threejsObjects()[objectIndex] as Object3D | null;
						if (object) {
							const animations = object.animations;
							if (!animations) {
								return [];
							}
							const animationNames = new Array(animations.length);
							let i = 0;
							for (let animation of animations) {
								animationNames[i] = animation.name;
								i++;
							}
							resolve(animationNames);
						}
					} else {
						resolve([]);
					}
				}
			} else {
				resolve([]);
			}
		});
	}
}
