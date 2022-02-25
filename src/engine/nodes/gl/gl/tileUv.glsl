
vec2 tileUv(vec2 uv, float tile, vec2 tilesCount){
	uv /= tilesCount;

	float row = floor(tile / tilesCount.x);
	float column = mod(tile, tilesCount.x);
	uv.x += column / tilesCount.x;
	uv.y += row / tilesCount.y;

	return uv;
}
