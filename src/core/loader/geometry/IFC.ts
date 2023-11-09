import {Object3D, FileLoader} from 'three';
import {BaseLoaderLoadOptions} from '../_Base';
import {BaseObject3DLoaderHandler} from './_BaseLoaderHandler';
import {
	createFragmentIfcLoader,
	getCategoryNames,
	setObjectAttributeAllCategoryNames,
	ifcFragmentsGroupToGroup,
} from '../../geometry/ifc/IFCUtils';
import {CoreLoaderGeometry} from '../Geometry';
import {WEBIFC} from '../../geometry/ifc/IFCCommon';
import {isNumber} from '../../Type';
import {stringMatchMask} from '../../String';

interface IFCLoaderLoadOptions extends BaseLoaderLoadOptions {
	coordinateToOrigin: boolean;
	includedCategories: string;
}

export class IFCLoaderHandler extends BaseObject3DLoaderHandler<Object3D> {
	override async load(options: IFCLoaderLoadOptions): Promise<any> {
		const url = await this._urlToLoad();

		CoreLoaderGeometry.incrementInProgressLoadsCount();
		await CoreLoaderGeometry.waitForMaxConcurrentLoadsQueueFreed();

		const fetched = await fetch(url);
		const buffer = await fetched.arrayBuffer();
		const byteArray = new Uint8Array(buffer);

		const fragmentIfcLoader = createFragmentIfcLoader();

		// get categories
		const categoryNames = await getCategoryNames(fragmentIfcLoader, byteArray);
		//

		// set included categories
		const includedCategories = options.includedCategories;
		const excludedCategoryIds: number[] = [];
		for (const categoryName of categoryNames) {
			const id = (WEBIFC as any)[categoryName];
			if (isNumber(id)) {
				if (!stringMatchMask(categoryName, includedCategories)) {
					excludedCategoryIds.push(id);
				}
			}
		}
		for (const categoryId of excludedCategoryIds) {
			fragmentIfcLoader.settings.excludedCategories.add(categoryId);
		}

		fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = options.coordinateToOrigin;
		(fragmentIfcLoader.settings.webIfc as any).OPTIMIZE_PROFILES = true;

		// load
		const model = await fragmentIfcLoader.load(byteArray, '');

		CoreLoaderGeometry.decrementInProgressLoadsCount(url, model);

		// We need to parent the model to a group,
		// otherwise the sop/FileIFC node does not seem to update when changed.
		// It may be because the model is re-used?
		const group = ifcFragmentsGroupToGroup(model);
		// const group = new Group();
		// group.add(model);
		setObjectAttributeAllCategoryNames(group, categoryNames);

		return [group];
	}

	protected _getLoader(): Promise<any> {
		return new FileLoader(this.loadingManager) as any;
	}
}
