import {PolyDictionary} from '../../types/GlobalTypes';
import {SceneJsonExporterData} from '../io/json/export/Scene';

type AssetsManifest = PolyDictionary<string>;
type UnzippedData = PolyDictionary<Uint8Array>;

export interface ViewerData {
	sceneData: SceneJsonExporterData;
	assetsManifest: AssetsManifest;
	unzippedData: UnzippedData;
}

export type ViewerDataByElement = Map<HTMLElement, ViewerData>;
