import {Unzipped} from 'fflate';
import {PolyDictionary} from '../../types/GlobalTypes';
import {SceneJsonExporterData} from '../io/json/export/Scene';

type AssetsManifest = PolyDictionary<string>;
// export type UnzippedData = PolyDictionary<Uint8Array>;

export interface ViewerData {
	sceneData: SceneJsonExporterData;
	assetsManifest: AssetsManifest;
	unzippedData: Unzipped;
}

export type ViewerDataByElement = Map<HTMLElement, ViewerData>;
