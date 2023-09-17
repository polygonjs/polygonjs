import {Group} from 'three';
import {LDrawLoader} from 'three/examples/jsm/loaders/LDrawLoader';
import {BaseObject3DLoaderHandler, BaseGeoLoader} from './_BaseLoaderHandler';
import {ThreejsCoreObject} from '../../geometry/modules/three/ThreejsCoreObject';
import {CoreType} from '../../Type';

// export enum MPDAttribute {
// 	AUTHOR = 'author',
// 	BUILDING_STEP = 'buildingStep',
// 	CATEGORY = 'category',
// 	COLOR_CODE='colorCode',
// 	KEYWORDS = 'keywords',
// 	NUM_BUILDING_STEPS = 'numBuildingSteps',
// 	TYPE = 'type',
// }
// export const MPD_ATTRIBUTES: MPDAttribute[] = [
// 	MPDAttribute.AUTHOR,
// 	MPDAttribute.BUILDING_STEP,
// 	MPDAttribute.CATEGORY,
// 	MPDAttribute.KEYWORDS,
// 	MPDAttribute.NUM_BUILDING_STEPS,
// 	MPDAttribute.TYPE,
// ];
// const attributesSet: Set<string> = new Set(MPD_ATTRIBUTES);

export class MPDLoaderHandler extends BaseObject3DLoaderHandler<Group> {
	protected async _getLoader(): Promise<BaseGeoLoader<Group>> {
		return (this._loader = this._loader || (await new LDrawLoader(this.loadingManager)));
	}
	protected override _onLoadSuccess(o: Group): Group[] {
		o.rotation.x = Math.PI;
		o.updateMatrix();

		o.traverse((child) => {
			const attribNames = Object.keys(child.userData);
			for (let attribName of attribNames) {
				const value = child.userData[attribName];
				if (value != null) {
					// attribute is currently not added if its value is null,
					// as it would be useless to have all objects with an attribute set to null.
					// Maybe consider checking all objects before adding an attribute?

					if (CoreType.isString(value) || CoreType.isNumber(value)) {
						ThreejsCoreObject.setAttribute(child, attribName, value);
					} else {
						if (CoreType.isArray(value)) {
							const stringElements = value.filter((item) => CoreType.isString(item));
							const jointedStrings = stringElements.join(' ');
							ThreejsCoreObject.setAttribute(child, attribName, jointedStrings);
						}
					}
				}
			}
		});

		return [o];
	}
}
