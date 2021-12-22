// import {PROGRESS_RATIO} from '../common/Progress';

// type ProgressBarUpdateCallback = (progressRatio: number) => void;

// export interface LoadSceneOptions {
// 	onProgress?: ProgressBarUpdateCallback;
// }
// export type LoadScene = (options: LoadSceneOptions) => void;

// interface AssetsImportOptions extends LoadSceneOptions {
// 	assetUrls?: string[];
// }

// export class AssetsPreloader {
// 	static async fetchAssets(options: AssetsImportOptions): Promise<void> {
// 		const progressRatio = PROGRESS_RATIO.assets;

// 		const onProgress = (ratio: number) => {
// 			if (options.onProgress) {
// 				options.onProgress(progressRatio.start + progressRatio.mult * ratio);
// 			}
// 		};

// 		return new Promise(async (resolve) => {
// 			const assetUrls = options.assetUrls;

// 			let loadedAssetsCount = 0;
// 			if (assetUrls && assetUrls.length > 0) {
// 				const promises = assetUrls.map(async (url) => {
// 					console.log(`fetch ${url}`);
// 					// const response = await fetch(url);
// 					const response = await this._fetch(url);
// 					// await response.blob();
// 					console.log(`DONE ${url}`);
// 					loadedAssetsCount++;
// 					onProgress(loadedAssetsCount / assetUrls.length);
// 					return response;
// 				});
// 				await Promise.all(promises);
// 			} else {
// 				onProgress(1);
// 			}
// 			resolve();
// 		});
// 	}

// 	private static _fetch(url: string): Promise<void> {
// 		return new Promise((resolve) => {
// 			const request = new XMLHttpRequest();

// 			const onComplete = () => {
// 				resolve();
// 			};

// 			request.addEventListener('load', onComplete);
// 			request.addEventListener('error', onComplete);
// 			request.addEventListener('abort', onComplete);

// 			request.open('GET', url, true);
// 		});
// 	}
// }
