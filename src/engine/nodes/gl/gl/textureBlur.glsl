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

	return blurResult * 0.2;
}
vec4 textureBlur7x1(sampler2D map, vec2 uv, vec2 resolution){

	vec2 offset1 = vec2(1.0/resolution.x, 0.0);
	vec2 offset2 = vec2(2.0/resolution.x, 0.0);
	vec2 offset3 = vec2(3.0/resolution.x, 0.0);
	vec4 blurResult = texture2D(map, uv) +
		texture2D(map, uv-offset1) +
		texture2D(map, uv+offset1) +
		texture2D(map, uv-offset2) +
		texture2D(map, uv+offset2) +
		texture2D(map, uv-offset3) +
		texture2D(map, uv+offset3);

	return blurResult / 7.0;
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

	return blurResult * 0.2;
}
vec4 textureBlur1x7(sampler2D map, vec2 uv, vec2 resolution){

	vec2 offset1 = vec2(0.0, 1.0/resolution.x);
	vec2 offset2 = vec2(0.0, 2.0/resolution.x);
	vec2 offset3 = vec2(0.0, 3.0/resolution.x);
	vec4 blurResult = texture2D(map, uv) +
		texture2D(map, uv-offset1) +
		texture2D(map, uv+offset1) +
		texture2D(map, uv-offset2) +
		texture2D(map, uv+offset2) +
		texture2D(map, uv-offset3) +
		texture2D(map, uv+offset3);

	return blurResult / 7.0;
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
vec4 textureBlur3x5(sampler2D map, vec2 uv, vec2 resolution){
	vec4 blurResult = vec4(0.0);
	for(int x=-3;x<=3;x++){
		for(int y=-5;y<=5;y++){
			blurResult += texture2D(map, uv + vec2(float(x)/resolution.x, float(y)/resolution.x));
		}
	}
	return blurResult / 77.0;
}
vec4 textureBlur5x3(sampler2D map, vec2 uv, vec2 resolution){
	vec4 blurResult = vec4(0.0);
	for(int x=-5;x<=5;x++){
		for(int y=-3;y<=3;y++){
			blurResult += texture2D(map, uv + vec2(float(x)/resolution.x, float(y)/resolution.x));
		}
	}
	return blurResult / 77.0;
}
vec4 textureBlur5x5(sampler2D map, vec2 uv, vec2 resolution){
	vec4 blurResult = vec4(0.0);
	for(int x=-5;x<=5;x++){
		for(int y=-5;y<=5;y++){
			blurResult += texture2D(map, uv + vec2(float(x)/resolution.x, float(y)/resolution.x));
		}
	}
	return blurResult / 121.0;
}
vec4 textureBlur3x7(sampler2D map, vec2 uv, vec2 resolution){
	vec4 blurResult = vec4(0.0);
	for(int x=-3;x<=3;x++){
		for(int y=-7;y<=7;y++){
			blurResult += texture2D(map, uv + vec2(float(x)/resolution.x, float(y)/resolution.x));
		}
	}
	return blurResult / 105.0;
}
vec4 textureBlur7x3(sampler2D map, vec2 uv, vec2 resolution){
	vec4 blurResult = vec4(0.0);
	for(int x=-7;x<=7;x++){
		for(int y=-3;y<=3;y++){
			blurResult += texture2D(map, uv + vec2(float(x)/resolution.x, float(y)/resolution.x));
		}
	}
	return blurResult / 105.0;
}
vec4 textureBlur5x7(sampler2D map, vec2 uv, vec2 resolution){
	vec4 blurResult = vec4(0.0);
	for(int x=-5;x<=5;x++){
		for(int y=-7;y<=7;y++){
			blurResult += texture2D(map, uv + vec2(float(x)/resolution.x, float(y)/resolution.x));
		}
	}
	return blurResult / 165.0;
}
vec4 textureBlur7x5(sampler2D map, vec2 uv, vec2 resolution){
	vec4 blurResult = vec4(0.0);
	for(int x=-7;x<=7;x++){
		for(int y=-5;y<=5;y++){
			blurResult += texture2D(map, uv + vec2(float(x)/resolution.x, float(y)/resolution.x));
		}
	}
	return blurResult / 165.0;
}
vec4 textureBlur7x7(sampler2D map, vec2 uv, vec2 resolution){
	vec4 blurResult = vec4(0.0);
	for(int x=-7;x<=7;x++){
		for(int y=-7;y<=7;y++){
			blurResult += texture2D(map, uv + vec2(float(x)/resolution.x, float(y)/resolution.x));
		}
	}
	return blurResult / 225.0;
}

// vec4 textureBlurXY(sampler2D map, vec2 uv, vec2 resolution, int pixelsX, int pixelsY){
// 	vec4 blurResult = vec4(0.0);
// 	// this loop unrolling does not work on iphone
// 	for(int x = -1*pixelsX; x <= pixelsX; x+=1 ){
// 		// for(int y = -pixelsY; y <= pixelsY; y++ ){
// 			// blurResult += texture2D(map, uv + vec2(float(x)/resolution.x, float(y)/resolution.x));
// 		// }
// 	}
// 	return blurResult / ((float(pixelsX)*2.0+1.0) * (float(pixelsY)*2.0+1.0));
// }

vec4 textureBlur(sampler2D map, vec2 uv, vec2 resolution, int pixelsX, int pixelsY){
	// the clamp are added in js when calling this function;
	// UPDATE: clamp, min or max seem to create issues on iphone, so they are skipped for now
	// pixelsX = clamp(pixelsX, 1, 4);
	// pixelsY = clamp(pixelsY, 1, 4);

	if(pixelsX == 1){
		if(pixelsY == 1){ return texture2D(map, uv); }
		if(pixelsY == 2){ return textureBlur1x3(map, uv, resolution); }
		if(pixelsY == 3){ return textureBlur1x5(map, uv, resolution); }
		if(pixelsY == 4){ return textureBlur1x7(map, uv, resolution); }
	}
	if(pixelsX == 2){
		if(pixelsY == 1){ return textureBlur3x1(map, uv, resolution); }
		if(pixelsY == 2){ return textureBlur3x3(map, uv, resolution); }
		if(pixelsY == 3){ return textureBlur3x5(map, uv, resolution); }
		if(pixelsY == 4){ return textureBlur3x7(map, uv, resolution); }
	}
	if(pixelsX == 3){
		if(pixelsY == 1){ return textureBlur5x1(map, uv, resolution); }
		if(pixelsY == 2){ return textureBlur5x3(map, uv, resolution); }
		if(pixelsY == 3){ return textureBlur5x5(map, uv, resolution); }
		if(pixelsY == 4){ return textureBlur5x7(map, uv, resolution); }
	}
	if(pixelsX == 4){
		if(pixelsY == 1){ return textureBlur7x1(map, uv, resolution); }
		if(pixelsY == 2){ return textureBlur7x3(map, uv, resolution); }
		if(pixelsY == 3){ return textureBlur7x5(map, uv, resolution); }
		if(pixelsY == 4){ return textureBlur7x7(map, uv, resolution); }
	}

	return texture2D(map, uv);
}