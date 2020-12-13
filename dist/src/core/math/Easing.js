const ease_i = function(power) {
  return function(t) {
    return Math.pow(t, power);
  };
};
const ease_o = function(power) {
  return function(t) {
    return 1 - Math.abs(Math.pow(t - 1, power));
  };
};
const ease_io = function(power) {
  return function(t) {
    return t < 0.5 ? ease_i(power)(t * 2) / 2 : ease_o(power)(t * 2 - 1) / 2 + 0.5;
  };
};
export const Easing = {
  linear: ease_io(1),
  ease_i: function(t, power) {
    return ease_i(power)(t);
  },
  ease_o: function(t, power) {
    return ease_o(power)(t);
  },
  ease_io: function(t, power) {
    return ease_io(power)(t);
  },
  ease_i2: ease_i(2),
  ease_o2: ease_o(2),
  ease_io2: ease_io(2),
  ease_i3: ease_io(3),
  ease_o3: ease_io(3),
  ease_io3: ease_io(3),
  ease_i4: ease_io(4),
  ease_o4: ease_io(4),
  ease_io4: ease_io(4),
  ease_i_sin: function(t) {
    return 1 + Math.sin(Math.PI / 2 * t - Math.PI / 2);
  },
  ease_o_sin: function(t) {
    return Math.sin(Math.PI / 2 * t);
  },
  ease_io_sin: function(t) {
    return (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2;
  },
  ease_i_elastic: function(t) {
    return (0.04 - 0.04 / t) * Math.sin(25 * t) + 1;
  },
  ease_o_elastic: function(t) {
    return 0.04 * t / --t * Math.sin(25 * t);
  },
  ease_io_elastic: function(t) {
    return (t -= 0.5) < 0 ? (0.02 + 0.01 / t) * Math.sin(50 * t) : (0.02 - 0.01 / t) * Math.sin(50 * t) + 1;
  }
};
