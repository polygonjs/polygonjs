// https://iquilezles.org/articles/checkerfiltering/
float checkers(vec2 p) {
	vec2 s = sign(fract(p*.5)-.5);
	return .5 - .5*s.x*s.y;
}
float checkersGrad( in vec2 p, in vec2 ddx, in vec2 ddy )
{
    // filter kernel
    vec2 w = max(abs(ddx), abs(ddy)) + 0.01;
    // analytical integral (box filter)
    vec2 i = 2.0*(abs(fract((p-0.5*w)/2.0)-0.5)-abs(fract((p+0.5*w)/2.0)-0.5))/w;
    // xor pattern
    return 0.5 - 0.5*i.x*i.y;
}
