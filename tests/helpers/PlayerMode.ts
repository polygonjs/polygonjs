import {Poly} from '../../src/engine/Poly';

type WithPlayerModeCallback = () => Promise<void>;

export async function withPlayerMode(playerMode: boolean, callback: WithPlayerModeCallback) {
	const previousPlayerMode = Poly.playerMode();
	Poly.setPlayerMode(playerMode);

	await callback();

	Poly.setPlayerMode(previousPlayerMode);
}
