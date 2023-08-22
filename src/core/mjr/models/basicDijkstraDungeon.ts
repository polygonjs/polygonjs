export const BASIC_DIJKSTRA_DUNGEON = `<sequence values="BGW">
	<one file="BasicDijkstraRoom" legend="BW" steps="1" />
	<all in="W" out="G" />
	<markov>
		<all in="GW" out="GG" />
		<path from="W" to="G" on="B" color="G" inertia="True" />
		<one file="BasicDijkstraRoom" legend="BW" />
	</markov>
</sequence>`;
