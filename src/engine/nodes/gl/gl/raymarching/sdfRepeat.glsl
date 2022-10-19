
/*
SDF Repeat in cartesian coordinates
*/
float SDFRepeat( in float p, in float c )
{
	return mod(p+0.5*c,c)-0.5*c;
}
float SDFRepeatClamped( in float p, in float c, in float boundMin, in float boundMax )
{
	return p-c*clamp(round(p/c),boundMin,boundMax);
}
vec3 SDFRepeat( in vec3 p, in vec3 c )
{
	return mod(p+0.5*c,c)-0.5*c;
}
vec3 SDFRepeatClamped( in vec3 p, in vec3 c, in vec3 boundMin, in vec3 boundMax )
{
	return p-c*clamp(round(p/c),boundMin,boundMax);
}
vec3 SDFRepeatClampedX( in vec3 p, in vec3 c, in float boundMin, in float boundMax )
{
	return vec3(
		SDFRepeatClamped(p.x, c.x, boundMin, boundMax),
		SDFRepeat(p.y, c.y),
		SDFRepeat(p.z, c.z)
	);
}
vec3 SDFRepeatClampedY( in vec3 p, in vec3 c, in float boundMin, in float boundMax )
{
	return vec3(
		SDFRepeat(p.x, c.x),
		SDFRepeatClamped(p.y, c.y, boundMin, boundMax),
		SDFRepeat(p.z, c.z)
	);
}
vec3 SDFRepeatClampedZ( in vec3 p, in vec3 c, in float boundMin, in float boundMax )
{
	return vec3(
		SDFRepeat(p.x, c.x),
		SDFRepeat(p.y, c.y),
		SDFRepeatClamped(p.z, c.z, boundMin, boundMax)
	);
}
vec3 SDFRepeatClampedXY( in vec3 p, in vec3 c, in vec2 boundMin, in vec2 boundMax )
{
	return vec3(
		SDFRepeatClamped(p.x, c.x, boundMin.x, boundMax.x),
		SDFRepeatClamped(p.y, c.y, boundMin.y, boundMax.y),
		SDFRepeat(p.z, c.z)
	);
}
vec3 SDFRepeatClampedXZ( in vec3 p, in vec3 c, in vec2 boundMin, in vec2 boundMax )
{
	return vec3(
		SDFRepeatClamped(p.x, c.x, boundMin.x, boundMax.x),
		SDFRepeat(p.y, c.y),
		SDFRepeatClamped(p.z, c.z, boundMin.y, boundMax.y)
	);
}
vec3 SDFRepeatClampedYZ( in vec3 p, in vec3 c, in vec2 boundMin, in vec2 boundMax )
{
	return vec3(
		SDFRepeat(p.x, c.x),
		SDFRepeatClamped(p.y, c.y, boundMin.x, boundMax.x),
		SDFRepeatClamped(p.z, c.z, boundMin.y, boundMax.y)
	);
}
vec3 SDFRepeatX( in vec3 p, in vec3 c ){
	return vec3(
		SDFRepeat(p.x, c.x),
		p.yz
	);
}
vec3 SDFRepeatXClampedX( in vec3 p, in vec3 c, in float boundMin, in float boundMax ){
	return vec3(
		SDFRepeatClamped(p.x, c.x, boundMin, boundMax),
		p.yz
	);
}
vec3 SDFRepeatY( in vec3 p, in vec3 c ){
	return vec3(
		p.x,
		SDFRepeat(p.y, c.y),
		p.z
	);
}
vec3 SDFRepeatYClampedY( in vec3 p, in vec3 c, in float boundMin, in float boundMax ){
	return vec3(
		p.x,
		SDFRepeatClamped(p.y, c.y, boundMin, boundMax),
		p.z
	);
}
vec3 SDFRepeatZ( in vec3 p, in vec3 c ){
	return vec3(
		p.xy,
		SDFRepeat(p.z, c.z)
	);
}
vec3 SDFRepeatZClampedZ( in vec3 p, in vec3 c, in float boundMin, in float boundMax ){
	return vec3(
		p.xy,
		SDFRepeatClamped(p.z, c.z, boundMin, boundMax)
	);
}
vec3 SDFRepeatXY( in vec3 p, in vec3 c ){
	return vec3(
		SDFRepeat(p.x, c.x),
		SDFRepeat(p.y, c.y),
		p.z
	);
}
vec3 SDFRepeatXYClampedX( in vec3 p, in vec3 c, in float boundMin, in float boundMax ){
	return vec3(
		SDFRepeatClamped(p.x, c.x, boundMin, boundMax),
		SDFRepeat(p.y, c.y),
		p.z
	);
}
vec3 SDFRepeatXYClampedY( in vec3 p, in vec3 c, in float boundMin, in float boundMax ){
	return vec3(
		SDFRepeat(p.x, c.x),
		SDFRepeatClamped(p.y, c.y, boundMin, boundMax),
		p.z
	);
}
vec3 SDFRepeatXYClampedXY( in vec3 p, in vec3 c, in vec2 boundMin, in vec2 boundMax ){
	return vec3(
		SDFRepeatClamped(p.x, c.x, boundMin.x, boundMax.x),
		SDFRepeatClamped(p.y, c.y, boundMin.y, boundMax.y),
		p.z
	);
}
vec3 SDFRepeatXZ( in vec3 p, in vec3 c ){
	return vec3(
		SDFRepeat(p.x, c.x),
		p.y,
		SDFRepeat(p.z, c.z)
	);
}
vec3 SDFRepeatXZClampedX( in vec3 p, in vec3 c, in float boundMin, in float boundMax ){
	return vec3(
		SDFRepeatClamped(p.x, c.x, boundMin, boundMax),
		p.y,
		SDFRepeat(p.z, c.z)
	);
}
vec3 SDFRepeatXZClampedZ( in vec3 p, in vec3 c, in float boundMin, in float boundMax ){
	return vec3(
		SDFRepeat(p.x, c.x),
		p.y,
		SDFRepeatClamped(p.z, c.z, boundMin, boundMax)
	);
}
vec3 SDFRepeatXZClampedXZ( in vec3 p, in vec3 c, in vec2 boundMin, in vec2 boundMax ){
	return vec3(
		SDFRepeatClamped(p.x, c.x, boundMin.x, boundMax.x),
		p.y,
		SDFRepeatClamped(p.z, c.z, boundMin.y, boundMax.y)
	);
}
vec3 SDFRepeatYZ( in vec3 p, in vec3 c ){
	return vec3(
		p.x,
		SDFRepeat(p.y, c.y),
		SDFRepeat(p.z, c.z)
	);
}
vec3 SDFRepeatYZClampedY( in vec3 p, in vec3 c, in float boundMin, in float boundMax ){
	return vec3(
		p.x,
		SDFRepeatClamped(p.y, c.y, boundMin, boundMax),
		SDFRepeat(p.z, c.z)
	);
}
vec3 SDFRepeatYZClampedZ( in vec3 p, in vec3 c, in float boundMin, in float boundMax ){
	return vec3(
		p.x,
		SDFRepeat(p.y, c.y),
		SDFRepeatClamped(p.z, c.z, boundMin, boundMax)
	);
}
vec3 SDFRepeatYZClampedYZ( in vec3 p, in vec3 c, in vec2 boundMin, in vec2 boundMax ){
	return vec3(
		p.x,
		SDFRepeatClamped(p.y, c.y, boundMin.x, boundMax.x),
		SDFRepeatClamped(p.z, c.z, boundMin.y, boundMax.y)
	);
}
