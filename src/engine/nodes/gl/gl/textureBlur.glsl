vec4 textureBlur3x1(sampler2D map, vec2 uv, vec2 resolution){

	vec2 offset = vec2(1.0/resolution.x, 0.0);
	vec4 blurResult = texture2D(map, uv) +
		texture2D(map, uv-offset) +
		texture2D(map, uv+offset);

	return blurResult / 3.0;
}

vec4 textureBlur5x1(sampler2D map, vec2 uv, vec2 resolution){

	vec2 offset1 = vec2(1.0/resolution.x, 0.0);
	vec2 offset2 = vec2(2.0/resolution.x, 0.0);
	vec4 blurResult = texture2D(map, uv) +
		texture2D(map, uv-offset1) +
		texture2D(map, uv+offset1) +
		texture2D(map, uv-offset2) +
		texture2D(map, uv+offset2);

	return blurResult / 5.0;
}

vec4 textureBlur1x3(sampler2D map, vec2 uv, vec2 resolution){

	vec2 offset = vec2(0.0, 1.0/resolution.y);
	vec4 blurResult = texture2D(map, uv) +
		texture2D(map, uv-offset) +
		texture2D(map, uv+offset);

	return blurResult / 3.0;
}
vec4 textureBlur1x5(sampler2D map, vec2 uv, vec2 resolution){

	vec2 offset1 = vec2(0.0, 1.0/resolution.x);
	vec2 offset2 = vec2(0.0, 2.0/resolution.x);
	vec4 blurResult = texture2D(map, uv) +
		texture2D(map, uv-offset1) +
		texture2D(map, uv+offset1) +
		texture2D(map, uv-offset2) +
		texture2D(map, uv+offset2);

	return blurResult / 5.0;
}

vec4 textureBlur3x3(sampler2D map, vec2 uv, vec2 resolution){

	vec2 offsetX = vec2(1.0/resolution.x, 0.0);
	vec2 offsetY = vec2(0.0, 1.0/resolution.y);
	vec4 blurResult = texture2D(map, uv) +
		texture2D(map, uv-offsetY) +
		texture2D(map, uv+offsetX-offsetY) +
		texture2D(map, uv+offsetX) +
		texture2D(map, uv+offsetX+offsetY) +
		texture2D(map, uv+offsetY) +
		texture2D(map, uv-offsetX+offsetY) +
		texture2D(map, uv-offsetX) +
		texture2D(map, uv-offsetX-offsetY);

	return blurResult / 9.0;
}
// vec4 textureBlur5x3(sampler2D map, vec2 uv, vec2 resolution){
// 	vec4 blurResult = vec4(0.0);
// 	for(int x=-5.0;x<=5.0;x++){
// 		for(int y=-3.0;y<=3.0;y++){
// 			blurResult += texture2D(map, uv + vec2(x/resolution.x, y/resolution.x));
// 		}
// 	}
// 	return blurResult / 15.0;
// }
vec4 textureBlurXY(sampler2D map, vec2 uv, vec2 resolution, float pixelsX, float pixelsY){
	vec4 blurResult = vec4(0.0);
	for(float x = -pixelsX; x <= pixelsX; x++ ){
		for(float y = -pixelsY; y <= pixelsY; y++ ){
			blurResult += texture2D(map, uv + vec2(x/resolution.x, y/resolution.x));
		}
	}
	return blurResult / ((pixelsX*2.0+1.0) * (pixelsY*2.0+1.0));
}

vec4 textureBlur(sampler2D map, vec2 uv, vec2 resolution, int pixelsX, int pixelsY){

	if(pixelsX == 1 && pixelsY == 1){
		return texture2D(map, uv);
	}
	if(pixelsX == 2 && pixelsY == 1){
		return textureBlur3x1(map, uv, resolution);
	}
	if(pixelsX == 1 && pixelsY == 2){
		return textureBlur1x3(map, uv, resolution);
	}
	if(pixelsX == 2 && pixelsY == 2){
		return textureBlur3x3(map, uv, resolution);
	}

	return textureBlurXY(map, uv, resolution, float(pixelsX), float(pixelsY));
}