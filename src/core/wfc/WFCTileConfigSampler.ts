import {arrayCopy} from '../ArrayUtils';
import {randFloat} from '../math/_Module';
import {TileConfig} from './WFCCommon';

export class WFCTileConfigSampler {
	private _cumulativeWeights: number[] = [];
	private _totalWeight: number = 0;
	private _tileConfigs: TileConfig[] = [];

	setItemsAndWeights(tileConfigs: TileConfig[], weights: number[]) {
		if (tileConfigs.length !== weights.length) {
			throw new Error('there must be as many weights as tileConfigs');
		}

		this._cumulativeWeights.length = 0;
		this._totalWeight = 0;

		for (const weight of weights) {
			this._totalWeight += weight;
			this._cumulativeWeights.push(this._totalWeight);
		}
		arrayCopy(tileConfigs, this._tileConfigs);
	}

	sample(seed: number): TileConfig {
		const randomWeight = randFloat(seed) * this._totalWeight;
		let index = 0;

		while (randomWeight >= this._cumulativeWeights[index]) {
			index++;
		}

		return this._tileConfigs[index];
	}
}
