import {NamedFunction1, NamedFunction2} from './_Base';
import {ChannelData} from '../../core/keyframes/KeyframeCommon';
import {CubicBezierCurveChannel} from '../../core/keyframes/CubicBezierCurveChannel';

export class cubicBezierCurveChannel extends NamedFunction1<[ChannelData]> {
	static override type() {
		return 'cubicBezierCurveChannel';
	}
	func(data: ChannelData): CubicBezierCurveChannel {
		return new CubicBezierCurveChannel(data);
	}
}

export class getCubicBezierCurveChannelValue extends NamedFunction2<[CubicBezierCurveChannel, number]> {
	static override type() {
		return 'getCubicBezierCurveChannelValue';
	}
	func(channel: CubicBezierCurveChannel, t: number): number {
		return channel.value(t);
	}
}
