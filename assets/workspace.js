(function () {
  const n = document.createElement("link").relList;
  if (n && n.supports && n.supports("modulepreload")) return;
  for (const i of document.querySelectorAll('link[rel="modulepreload"]')) r(i);
  new MutationObserver((i) => {
    for (const a of i)
      if (a.type === "childList")
        for (const l of a.addedNodes)
          l.tagName === "LINK" && l.rel === "modulepreload" && r(l);
  }).observe(document, { childList: !0, subtree: !0 });
  function s(i) {
    const a = {};
    return (
      i.integrity && (a.integrity = i.integrity),
      i.referrerPolicy && (a.referrerPolicy = i.referrerPolicy),
      i.crossOrigin === "use-credentials"
        ? (a.credentials = "include")
        : i.crossOrigin === "anonymous"
          ? (a.credentials = "omit")
          : (a.credentials = "same-origin"),
      a
    );
  }
  function r(i) {
    if (i.ep) return;
    i.ep = !0;
    const a = s(i);
    fetch(i.href, a);
  }
})();
function qp(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default")
    ? t.default
    : t;
}
var Xd = { exports: {} },
  ea = {},
  Jd = { exports: {} },
  J = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Mr = Symbol.for("react.element"),
  Zp = Symbol.for("react.portal"),
  Xp = Symbol.for("react.fragment"),
  Jp = Symbol.for("react.strict_mode"),
  em = Symbol.for("react.profiler"),
  tm = Symbol.for("react.provider"),
  nm = Symbol.for("react.context"),
  sm = Symbol.for("react.forward_ref"),
  rm = Symbol.for("react.suspense"),
  im = Symbol.for("react.memo"),
  am = Symbol.for("react.lazy"),
  vc = Symbol.iterator;
function lm(t) {
  return t === null || typeof t != "object"
    ? null
    : ((t = (vc && t[vc]) || t["@@iterator"]),
      typeof t == "function" ? t : null);
}
var eu = {
    isMounted: function () {
      return !1;
    },
    enqueueForceUpdate: function () {},
    enqueueReplaceState: function () {},
    enqueueSetState: function () {},
  },
  tu = Object.assign,
  nu = {};
function Ds(t, n, s) {
  (this.props = t),
    (this.context = n),
    (this.refs = nu),
    (this.updater = s || eu);
}
Ds.prototype.isReactComponent = {};
Ds.prototype.setState = function (t, n) {
  if (typeof t != "object" && typeof t != "function" && t != null)
    throw Error(
      "setState(...): takes an object of state variables to update or a function which returns an object of state variables.",
    );
  this.updater.enqueueSetState(this, t, n, "setState");
};
Ds.prototype.forceUpdate = function (t) {
  this.updater.enqueueForceUpdate(this, t, "forceUpdate");
};
function su() {}
su.prototype = Ds.prototype;
function po(t, n, s) {
  (this.props = t),
    (this.context = n),
    (this.refs = nu),
    (this.updater = s || eu);
}
var mo = (po.prototype = new su());
mo.constructor = po;
tu(mo, Ds.prototype);
mo.isPureReactComponent = !0;
var gc = Array.isArray,
  ru = Object.prototype.hasOwnProperty,
  fo = { current: null },
  iu = { key: !0, ref: !0, __self: !0, __source: !0 };
function au(t, n, s) {
  var r,
    i = {},
    a = null,
    l = null;
  if (n != null)
    for (r in (n.ref !== void 0 && (l = n.ref),
    n.key !== void 0 && (a = "" + n.key),
    n))
      ru.call(n, r) && !iu.hasOwnProperty(r) && (i[r] = n[r]);
  var o = arguments.length - 2;
  if (o === 1) i.children = s;
  else if (1 < o) {
    for (var c = Array(o), d = 0; d < o; d++) c[d] = arguments[d + 2];
    i.children = c;
  }
  if (t && t.defaultProps)
    for (r in ((o = t.defaultProps), o)) i[r] === void 0 && (i[r] = o[r]);
  return {
    $$typeof: Mr,
    type: t,
    key: a,
    ref: l,
    props: i,
    _owner: fo.current,
  };
}
function om(t, n) {
  return {
    $$typeof: Mr,
    type: t.type,
    key: n,
    ref: t.ref,
    props: t.props,
    _owner: t._owner,
  };
}
function xo(t) {
  return typeof t == "object" && t !== null && t.$$typeof === Mr;
}
function cm(t) {
  var n = { "=": "=0", ":": "=2" };
  return (
    "$" +
    t.replace(/[=:]/g, function (s) {
      return n[s];
    })
  );
}
var yc = /\/+/g;
function Ea(t, n) {
  return typeof t == "object" && t !== null && t.key != null
    ? cm("" + t.key)
    : n.toString(36);
}
function pi(t, n, s, r, i) {
  var a = typeof t;
  (a === "undefined" || a === "boolean") && (t = null);
  var l = !1;
  if (t === null) l = !0;
  else
    switch (a) {
      case "string":
      case "number":
        l = !0;
        break;
      case "object":
        switch (t.$$typeof) {
          case Mr:
          case Zp:
            l = !0;
        }
    }
  if (l)
    return (
      (l = t),
      (i = i(l)),
      (t = r === "" ? "." + Ea(l, 0) : r),
      gc(i)
        ? ((s = ""),
          t != null && (s = t.replace(yc, "$&/") + "/"),
          pi(i, n, s, "", function (d) {
            return d;
          }))
        : i != null &&
          (xo(i) &&
            (i = om(
              i,
              s +
                (!i.key || (l && l.key === i.key)
                  ? ""
                  : ("" + i.key).replace(yc, "$&/") + "/") +
                t,
            )),
          n.push(i)),
      1
    );
  if (((l = 0), (r = r === "" ? "." : r + ":"), gc(t)))
    for (var o = 0; o < t.length; o++) {
      a = t[o];
      var c = r + Ea(a, o);
      l += pi(a, n, s, c, i);
    }
  else if (((c = lm(t)), typeof c == "function"))
    for (t = c.call(t), o = 0; !(a = t.next()).done; )
      (a = a.value), (c = r + Ea(a, o++)), (l += pi(a, n, s, c, i));
  else if (a === "object")
    throw (
      ((n = String(t)),
      Error(
        "Objects are not valid as a React child (found: " +
          (n === "[object Object]"
            ? "object with keys {" + Object.keys(t).join(", ") + "}"
            : n) +
          "). If you meant to render a collection of children, use an array instead.",
      ))
    );
  return l;
}
function Gr(t, n, s) {
  if (t == null) return t;
  var r = [],
    i = 0;
  return (
    pi(t, r, "", "", function (a) {
      return n.call(s, a, i++);
    }),
    r
  );
}
function dm(t) {
  if (t._status === -1) {
    var n = t._result;
    (n = n()),
      n.then(
        function (s) {
          (t._status === 0 || t._status === -1) &&
            ((t._status = 1), (t._result = s));
        },
        function (s) {
          (t._status === 0 || t._status === -1) &&
            ((t._status = 2), (t._result = s));
        },
      ),
      t._status === -1 && ((t._status = 0), (t._result = n));
  }
  if (t._status === 1) return t._result.default;
  throw t._result;
}
var We = { current: null },
  mi = { transition: null },
  um = {
    ReactCurrentDispatcher: We,
    ReactCurrentBatchConfig: mi,
    ReactCurrentOwner: fo,
  };
function lu() {
  throw Error("act(...) is not supported in production builds of React.");
}
J.Children = {
  map: Gr,
  forEach: function (t, n, s) {
    Gr(
      t,
      function () {
        n.apply(this, arguments);
      },
      s,
    );
  },
  count: function (t) {
    var n = 0;
    return (
      Gr(t, function () {
        n++;
      }),
      n
    );
  },
  toArray: function (t) {
    return (
      Gr(t, function (n) {
        return n;
      }) || []
    );
  },
  only: function (t) {
    if (!xo(t))
      throw Error(
        "React.Children.only expected to receive a single React element child.",
      );
    return t;
  },
};
J.Component = Ds;
J.Fragment = Xp;
J.Profiler = em;
J.PureComponent = po;
J.StrictMode = Jp;
J.Suspense = rm;
J.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = um;
J.act = lu;
J.cloneElement = function (t, n, s) {
  if (t == null)
    throw Error(
      "React.cloneElement(...): The argument must be a React element, but you passed " +
        t +
        ".",
    );
  var r = tu({}, t.props),
    i = t.key,
    a = t.ref,
    l = t._owner;
  if (n != null) {
    if (
      (n.ref !== void 0 && ((a = n.ref), (l = fo.current)),
      n.key !== void 0 && (i = "" + n.key),
      t.type && t.type.defaultProps)
    )
      var o = t.type.defaultProps;
    for (c in n)
      ru.call(n, c) &&
        !iu.hasOwnProperty(c) &&
        (r[c] = n[c] === void 0 && o !== void 0 ? o[c] : n[c]);
  }
  var c = arguments.length - 2;
  if (c === 1) r.children = s;
  else if (1 < c) {
    o = Array(c);
    for (var d = 0; d < c; d++) o[d] = arguments[d + 2];
    r.children = o;
  }
  return { $$typeof: Mr, type: t.type, key: i, ref: a, props: r, _owner: l };
};
J.createContext = function (t) {
  return (
    (t = {
      $$typeof: nm,
      _currentValue: t,
      _currentValue2: t,
      _threadCount: 0,
      Provider: null,
      Consumer: null,
      _defaultValue: null,
      _globalName: null,
    }),
    (t.Provider = { $$typeof: tm, _context: t }),
    (t.Consumer = t)
  );
};
J.createElement = au;
J.createFactory = function (t) {
  var n = au.bind(null, t);
  return (n.type = t), n;
};
J.createRef = function () {
  return { current: null };
};
J.forwardRef = function (t) {
  return { $$typeof: sm, render: t };
};
J.isValidElement = xo;
J.lazy = function (t) {
  return { $$typeof: am, _payload: { _status: -1, _result: t }, _init: dm };
};
J.memo = function (t, n) {
  return { $$typeof: im, type: t, compare: n === void 0 ? null : n };
};
J.startTransition = function (t) {
  var n = mi.transition;
  mi.transition = {};
  try {
    t();
  } finally {
    mi.transition = n;
  }
};
J.unstable_act = lu;
J.useCallback = function (t, n) {
  return We.current.useCallback(t, n);
};
J.useContext = function (t) {
  return We.current.useContext(t);
};
J.useDebugValue = function () {};
J.useDeferredValue = function (t) {
  return We.current.useDeferredValue(t);
};
J.useEffect = function (t, n) {
  return We.current.useEffect(t, n);
};
J.useId = function () {
  return We.current.useId();
};
J.useImperativeHandle = function (t, n, s) {
  return We.current.useImperativeHandle(t, n, s);
};
J.useInsertionEffect = function (t, n) {
  return We.current.useInsertionEffect(t, n);
};
J.useLayoutEffect = function (t, n) {
  return We.current.useLayoutEffect(t, n);
};
J.useMemo = function (t, n) {
  return We.current.useMemo(t, n);
};
J.useReducer = function (t, n, s) {
  return We.current.useReducer(t, n, s);
};
J.useRef = function (t) {
  return We.current.useRef(t);
};
J.useState = function (t) {
  return We.current.useState(t);
};
J.useSyncExternalStore = function (t, n, s) {
  return We.current.useSyncExternalStore(t, n, s);
};
J.useTransition = function () {
  return We.current.useTransition();
};
J.version = "18.3.1";
Jd.exports = J;
var Dr = Jd.exports;
const C = qp(Dr);
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var hm = Dr,
  pm = Symbol.for("react.element"),
  mm = Symbol.for("react.fragment"),
  fm = Object.prototype.hasOwnProperty,
  xm = hm.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
  jm = { key: !0, ref: !0, __self: !0, __source: !0 };
function ou(t, n, s) {
  var r,
    i = {},
    a = null,
    l = null;
  s !== void 0 && (a = "" + s),
    n.key !== void 0 && (a = "" + n.key),
    n.ref !== void 0 && (l = n.ref);
  for (r in n) fm.call(n, r) && !jm.hasOwnProperty(r) && (i[r] = n[r]);
  if (t && t.defaultProps)
    for (r in ((n = t.defaultProps), n)) i[r] === void 0 && (i[r] = n[r]);
  return {
    $$typeof: pm,
    type: t,
    key: a,
    ref: l,
    props: i,
    _owner: xm.current,
  };
}
ea.Fragment = mm;
ea.jsx = ou;
ea.jsxs = ou;
Xd.exports = ea;
var e = Xd.exports,
  cu = { exports: {} },
  lt = {},
  du = { exports: {} },
  uu = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ (function (t) {
  function n(A, w) {
    var B = A.length;
    A.push(w);
    e: for (; 0 < B; ) {
      var T = (B - 1) >>> 1,
        D = A[T];
      if (0 < i(D, w)) (A[T] = w), (A[B] = D), (B = T);
      else break e;
    }
  }
  function s(A) {
    return A.length === 0 ? null : A[0];
  }
  function r(A) {
    if (A.length === 0) return null;
    var w = A[0],
      B = A.pop();
    if (B !== w) {
      A[0] = B;
      e: for (var T = 0, D = A.length, X = D >>> 1; T < X; ) {
        var M = 2 * (T + 1) - 1,
          q = A[M],
          Z = M + 1,
          Qe = A[Z];
        if (0 > i(q, B))
          Z < D && 0 > i(Qe, q)
            ? ((A[T] = Qe), (A[Z] = B), (T = Z))
            : ((A[T] = q), (A[M] = B), (T = M));
        else if (Z < D && 0 > i(Qe, B)) (A[T] = Qe), (A[Z] = B), (T = Z);
        else break e;
      }
    }
    return w;
  }
  function i(A, w) {
    var B = A.sortIndex - w.sortIndex;
    return B !== 0 ? B : A.id - w.id;
  }
  if (typeof performance == "object" && typeof performance.now == "function") {
    var a = performance;
    t.unstable_now = function () {
      return a.now();
    };
  } else {
    var l = Date,
      o = l.now();
    t.unstable_now = function () {
      return l.now() - o;
    };
  }
  var c = [],
    d = [],
    u = 1,
    m = null,
    x = 3,
    j = !1,
    f = !1,
    g = !1,
    b = typeof setTimeout == "function" ? setTimeout : null,
    v = typeof clearTimeout == "function" ? clearTimeout : null,
    h = typeof setImmediate < "u" ? setImmediate : null;
  typeof navigator < "u" &&
    navigator.scheduling !== void 0 &&
    navigator.scheduling.isInputPending !== void 0 &&
    navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function p(A) {
    for (var w = s(d); w !== null; ) {
      if (w.callback === null) r(d);
      else if (w.startTime <= A)
        r(d), (w.sortIndex = w.expirationTime), n(c, w);
      else break;
      w = s(d);
    }
  }
  function y(A) {
    if (((g = !1), p(A), !f))
      if (s(c) !== null) (f = !0), H(O);
      else {
        var w = s(d);
        w !== null && _(y, w.startTime - A);
      }
  }
  function O(A, w) {
    (f = !1), g && ((g = !1), v(E), (E = -1)), (j = !0);
    var B = x;
    try {
      for (
        p(w), m = s(c);
        m !== null && (!(m.expirationTime > w) || (A && !$()));

      ) {
        var T = m.callback;
        if (typeof T == "function") {
          (m.callback = null), (x = m.priorityLevel);
          var D = T(m.expirationTime <= w);
          (w = t.unstable_now()),
            typeof D == "function" ? (m.callback = D) : m === s(c) && r(c),
            p(w);
        } else r(c);
        m = s(c);
      }
      if (m !== null) var X = !0;
      else {
        var M = s(d);
        M !== null && _(y, M.startTime - w), (X = !1);
      }
      return X;
    } finally {
      (m = null), (x = B), (j = !1);
    }
  }
  var k = !1,
    z = null,
    E = -1,
    U = 5,
    P = -1;
  function $() {
    return !(t.unstable_now() - P < U);
  }
  function N() {
    if (z !== null) {
      var A = t.unstable_now();
      P = A;
      var w = !0;
      try {
        w = z(!0, A);
      } finally {
        w ? I() : ((k = !1), (z = null));
      }
    } else k = !1;
  }
  var I;
  if (typeof h == "function")
    I = function () {
      h(N);
    };
  else if (typeof MessageChannel < "u") {
    var S = new MessageChannel(),
      L = S.port2;
    (S.port1.onmessage = N),
      (I = function () {
        L.postMessage(null);
      });
  } else
    I = function () {
      b(N, 0);
    };
  function H(A) {
    (z = A), k || ((k = !0), I());
  }
  function _(A, w) {
    E = b(function () {
      A(t.unstable_now());
    }, w);
  }
  (t.unstable_IdlePriority = 5),
    (t.unstable_ImmediatePriority = 1),
    (t.unstable_LowPriority = 4),
    (t.unstable_NormalPriority = 3),
    (t.unstable_Profiling = null),
    (t.unstable_UserBlockingPriority = 2),
    (t.unstable_cancelCallback = function (A) {
      A.callback = null;
    }),
    (t.unstable_continueExecution = function () {
      f || j || ((f = !0), H(O));
    }),
    (t.unstable_forceFrameRate = function (A) {
      0 > A || 125 < A
        ? console.error(
            "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported",
          )
        : (U = 0 < A ? Math.floor(1e3 / A) : 5);
    }),
    (t.unstable_getCurrentPriorityLevel = function () {
      return x;
    }),
    (t.unstable_getFirstCallbackNode = function () {
      return s(c);
    }),
    (t.unstable_next = function (A) {
      switch (x) {
        case 1:
        case 2:
        case 3:
          var w = 3;
          break;
        default:
          w = x;
      }
      var B = x;
      x = w;
      try {
        return A();
      } finally {
        x = B;
      }
    }),
    (t.unstable_pauseExecution = function () {}),
    (t.unstable_requestPaint = function () {}),
    (t.unstable_runWithPriority = function (A, w) {
      switch (A) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          A = 3;
      }
      var B = x;
      x = A;
      try {
        return w();
      } finally {
        x = B;
      }
    }),
    (t.unstable_scheduleCallback = function (A, w, B) {
      var T = t.unstable_now();
      switch (
        (typeof B == "object" && B !== null
          ? ((B = B.delay), (B = typeof B == "number" && 0 < B ? T + B : T))
          : (B = T),
        A)
      ) {
        case 1:
          var D = -1;
          break;
        case 2:
          D = 250;
          break;
        case 5:
          D = 1073741823;
          break;
        case 4:
          D = 1e4;
          break;
        default:
          D = 5e3;
      }
      return (
        (D = B + D),
        (A = {
          id: u++,
          callback: w,
          priorityLevel: A,
          startTime: B,
          expirationTime: D,
          sortIndex: -1,
        }),
        B > T
          ? ((A.sortIndex = B),
            n(d, A),
            s(c) === null &&
              A === s(d) &&
              (g ? (v(E), (E = -1)) : (g = !0), _(y, B - T)))
          : ((A.sortIndex = D), n(c, A), f || j || ((f = !0), H(O))),
        A
      );
    }),
    (t.unstable_shouldYield = $),
    (t.unstable_wrapCallback = function (A) {
      var w = x;
      return function () {
        var B = x;
        x = w;
        try {
          return A.apply(this, arguments);
        } finally {
          x = B;
        }
      };
    });
})(uu);
du.exports = uu;
var vm = du.exports;
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var gm = Dr,
  at = vm;
function F(t) {
  for (
    var n = "https://reactjs.org/docs/error-decoder.html?invariant=" + t, s = 1;
    s < arguments.length;
    s++
  )
    n += "&args[]=" + encodeURIComponent(arguments[s]);
  return (
    "Minified React error #" +
    t +
    "; visit " +
    n +
    " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
  );
}
var hu = new Set(),
  fr = {};
function qn(t, n) {
  ws(t, n), ws(t + "Capture", n);
}
function ws(t, n) {
  for (fr[t] = n, t = 0; t < n.length; t++) hu.add(n[t]);
}
var Qt = !(
    typeof window > "u" ||
    typeof window.document > "u" ||
    typeof window.document.createElement > "u"
  ),
  ul = Object.prototype.hasOwnProperty,
  ym =
    /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
  Nc = {},
  kc = {};
function Nm(t) {
  return ul.call(kc, t)
    ? !0
    : ul.call(Nc, t)
      ? !1
      : ym.test(t)
        ? (kc[t] = !0)
        : ((Nc[t] = !0), !1);
}
function km(t, n, s, r) {
  if (s !== null && s.type === 0) return !1;
  switch (typeof n) {
    case "function":
    case "symbol":
      return !0;
    case "boolean":
      return r
        ? !1
        : s !== null
          ? !s.acceptsBooleans
          : ((t = t.toLowerCase().slice(0, 5)), t !== "data-" && t !== "aria-");
    default:
      return !1;
  }
}
function Sm(t, n, s, r) {
  if (n === null || typeof n > "u" || km(t, n, s, r)) return !0;
  if (r) return !1;
  if (s !== null)
    switch (s.type) {
      case 3:
        return !n;
      case 4:
        return n === !1;
      case 5:
        return isNaN(n);
      case 6:
        return isNaN(n) || 1 > n;
    }
  return !1;
}
function Ke(t, n, s, r, i, a, l) {
  (this.acceptsBooleans = n === 2 || n === 3 || n === 4),
    (this.attributeName = r),
    (this.attributeNamespace = i),
    (this.mustUseProperty = s),
    (this.propertyName = t),
    (this.type = n),
    (this.sanitizeURL = a),
    (this.removeEmptyString = l);
}
var _e = {};
"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style"
  .split(" ")
  .forEach(function (t) {
    _e[t] = new Ke(t, 0, !1, t, null, !1, !1);
  });
[
  ["acceptCharset", "accept-charset"],
  ["className", "class"],
  ["htmlFor", "for"],
  ["httpEquiv", "http-equiv"],
].forEach(function (t) {
  var n = t[0];
  _e[n] = new Ke(n, 1, !1, t[1], null, !1, !1);
});
["contentEditable", "draggable", "spellCheck", "value"].forEach(function (t) {
  _e[t] = new Ke(t, 2, !1, t.toLowerCase(), null, !1, !1);
});
[
  "autoReverse",
  "externalResourcesRequired",
  "focusable",
  "preserveAlpha",
].forEach(function (t) {
  _e[t] = new Ke(t, 2, !1, t, null, !1, !1);
});
"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope"
  .split(" ")
  .forEach(function (t) {
    _e[t] = new Ke(t, 3, !1, t.toLowerCase(), null, !1, !1);
  });
["checked", "multiple", "muted", "selected"].forEach(function (t) {
  _e[t] = new Ke(t, 3, !0, t, null, !1, !1);
});
["capture", "download"].forEach(function (t) {
  _e[t] = new Ke(t, 4, !1, t, null, !1, !1);
});
["cols", "rows", "size", "span"].forEach(function (t) {
  _e[t] = new Ke(t, 6, !1, t, null, !1, !1);
});
["rowSpan", "start"].forEach(function (t) {
  _e[t] = new Ke(t, 5, !1, t.toLowerCase(), null, !1, !1);
});
var jo = /[\-:]([a-z])/g;
function vo(t) {
  return t[1].toUpperCase();
}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height"
  .split(" ")
  .forEach(function (t) {
    var n = t.replace(jo, vo);
    _e[n] = new Ke(n, 1, !1, t, null, !1, !1);
  });
"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type"
  .split(" ")
  .forEach(function (t) {
    var n = t.replace(jo, vo);
    _e[n] = new Ke(n, 1, !1, t, "http://www.w3.org/1999/xlink", !1, !1);
  });
["xml:base", "xml:lang", "xml:space"].forEach(function (t) {
  var n = t.replace(jo, vo);
  _e[n] = new Ke(n, 1, !1, t, "http://www.w3.org/XML/1998/namespace", !1, !1);
});
["tabIndex", "crossOrigin"].forEach(function (t) {
  _e[t] = new Ke(t, 1, !1, t.toLowerCase(), null, !1, !1);
});
_e.xlinkHref = new Ke(
  "xlinkHref",
  1,
  !1,
  "xlink:href",
  "http://www.w3.org/1999/xlink",
  !0,
  !1,
);
["src", "href", "action", "formAction"].forEach(function (t) {
  _e[t] = new Ke(t, 1, !1, t.toLowerCase(), null, !0, !0);
});
function go(t, n, s, r) {
  var i = _e.hasOwnProperty(n) ? _e[n] : null;
  (i !== null
    ? i.type !== 0
    : r ||
      !(2 < n.length) ||
      (n[0] !== "o" && n[0] !== "O") ||
      (n[1] !== "n" && n[1] !== "N")) &&
    (Sm(n, s, i, r) && (s = null),
    r || i === null
      ? Nm(n) && (s === null ? t.removeAttribute(n) : t.setAttribute(n, "" + s))
      : i.mustUseProperty
        ? (t[i.propertyName] = s === null ? (i.type === 3 ? !1 : "") : s)
        : ((n = i.attributeName),
          (r = i.attributeNamespace),
          s === null
            ? t.removeAttribute(n)
            : ((i = i.type),
              (s = i === 3 || (i === 4 && s === !0) ? "" : "" + s),
              r ? t.setAttributeNS(r, n, s) : t.setAttribute(n, s))));
}
var tn = gm.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  Wr = Symbol.for("react.element"),
  is = Symbol.for("react.portal"),
  as = Symbol.for("react.fragment"),
  yo = Symbol.for("react.strict_mode"),
  hl = Symbol.for("react.profiler"),
  pu = Symbol.for("react.provider"),
  mu = Symbol.for("react.context"),
  No = Symbol.for("react.forward_ref"),
  pl = Symbol.for("react.suspense"),
  ml = Symbol.for("react.suspense_list"),
  ko = Symbol.for("react.memo"),
  rn = Symbol.for("react.lazy"),
  fu = Symbol.for("react.offscreen"),
  Sc = Symbol.iterator;
function Bs(t) {
  return t === null || typeof t != "object"
    ? null
    : ((t = (Sc && t[Sc]) || t["@@iterator"]),
      typeof t == "function" ? t : null);
}
var ye = Object.assign,
  Ta;
function er(t) {
  if (Ta === void 0)
    try {
      throw Error();
    } catch (s) {
      var n = s.stack.trim().match(/\n( *(at )?)/);
      Ta = (n && n[1]) || "";
    }
  return (
    `
` +
    Ta +
    t
  );
}
var Pa = !1;
function Ia(t, n) {
  if (!t || Pa) return "";
  Pa = !0;
  var s = Error.prepareStackTrace;
  Error.prepareStackTrace = void 0;
  try {
    if (n)
      if (
        ((n = function () {
          throw Error();
        }),
        Object.defineProperty(n.prototype, "props", {
          set: function () {
            throw Error();
          },
        }),
        typeof Reflect == "object" && Reflect.construct)
      ) {
        try {
          Reflect.construct(n, []);
        } catch (d) {
          var r = d;
        }
        Reflect.construct(t, [], n);
      } else {
        try {
          n.call();
        } catch (d) {
          r = d;
        }
        t.call(n.prototype);
      }
    else {
      try {
        throw Error();
      } catch (d) {
        r = d;
      }
      t();
    }
  } catch (d) {
    if (d && r && typeof d.stack == "string") {
      for (
        var i = d.stack.split(`
`),
          a = r.stack.split(`
`),
          l = i.length - 1,
          o = a.length - 1;
        1 <= l && 0 <= o && i[l] !== a[o];

      )
        o--;
      for (; 1 <= l && 0 <= o; l--, o--)
        if (i[l] !== a[o]) {
          if (l !== 1 || o !== 1)
            do
              if ((l--, o--, 0 > o || i[l] !== a[o])) {
                var c =
                  `
` + i[l].replace(" at new ", " at ");
                return (
                  t.displayName &&
                    c.includes("<anonymous>") &&
                    (c = c.replace("<anonymous>", t.displayName)),
                  c
                );
              }
            while (1 <= l && 0 <= o);
          break;
        }
    }
  } finally {
    (Pa = !1), (Error.prepareStackTrace = s);
  }
  return (t = t ? t.displayName || t.name : "") ? er(t) : "";
}
function Cm(t) {
  switch (t.tag) {
    case 5:
      return er(t.type);
    case 16:
      return er("Lazy");
    case 13:
      return er("Suspense");
    case 19:
      return er("SuspenseList");
    case 0:
    case 2:
    case 15:
      return (t = Ia(t.type, !1)), t;
    case 11:
      return (t = Ia(t.type.render, !1)), t;
    case 1:
      return (t = Ia(t.type, !0)), t;
    default:
      return "";
  }
}
function fl(t) {
  if (t == null) return null;
  if (typeof t == "function") return t.displayName || t.name || null;
  if (typeof t == "string") return t;
  switch (t) {
    case as:
      return "Fragment";
    case is:
      return "Portal";
    case hl:
      return "Profiler";
    case yo:
      return "StrictMode";
    case pl:
      return "Suspense";
    case ml:
      return "SuspenseList";
  }
  if (typeof t == "object")
    switch (t.$$typeof) {
      case mu:
        return (t.displayName || "Context") + ".Consumer";
      case pu:
        return (t._context.displayName || "Context") + ".Provider";
      case No:
        var n = t.render;
        return (
          (t = t.displayName),
          t ||
            ((t = n.displayName || n.name || ""),
            (t = t !== "" ? "ForwardRef(" + t + ")" : "ForwardRef")),
          t
        );
      case ko:
        return (
          (n = t.displayName || null), n !== null ? n : fl(t.type) || "Memo"
        );
      case rn:
        (n = t._payload), (t = t._init);
        try {
          return fl(t(n));
        } catch {}
    }
  return null;
}
function bm(t) {
  var n = t.type;
  switch (t.tag) {
    case 24:
      return "Cache";
    case 9:
      return (n.displayName || "Context") + ".Consumer";
    case 10:
      return (n._context.displayName || "Context") + ".Provider";
    case 18:
      return "DehydratedFragment";
    case 11:
      return (
        (t = n.render),
        (t = t.displayName || t.name || ""),
        n.displayName || (t !== "" ? "ForwardRef(" + t + ")" : "ForwardRef")
      );
    case 7:
      return "Fragment";
    case 5:
      return n;
    case 4:
      return "Portal";
    case 3:
      return "Root";
    case 6:
      return "Text";
    case 16:
      return fl(n);
    case 8:
      return n === yo ? "StrictMode" : "Mode";
    case 22:
      return "Offscreen";
    case 12:
      return "Profiler";
    case 21:
      return "Scope";
    case 13:
      return "Suspense";
    case 19:
      return "SuspenseList";
    case 25:
      return "TracingMarker";
    case 1:
    case 0:
    case 17:
    case 2:
    case 14:
    case 15:
      if (typeof n == "function") return n.displayName || n.name || null;
      if (typeof n == "string") return n;
  }
  return null;
}
function Nn(t) {
  switch (typeof t) {
    case "boolean":
    case "number":
    case "string":
    case "undefined":
      return t;
    case "object":
      return t;
    default:
      return "";
  }
}
function xu(t) {
  var n = t.type;
  return (
    (t = t.nodeName) &&
    t.toLowerCase() === "input" &&
    (n === "checkbox" || n === "radio")
  );
}
function wm(t) {
  var n = xu(t) ? "checked" : "value",
    s = Object.getOwnPropertyDescriptor(t.constructor.prototype, n),
    r = "" + t[n];
  if (
    !t.hasOwnProperty(n) &&
    typeof s < "u" &&
    typeof s.get == "function" &&
    typeof s.set == "function"
  ) {
    var i = s.get,
      a = s.set;
    return (
      Object.defineProperty(t, n, {
        configurable: !0,
        get: function () {
          return i.call(this);
        },
        set: function (l) {
          (r = "" + l), a.call(this, l);
        },
      }),
      Object.defineProperty(t, n, { enumerable: s.enumerable }),
      {
        getValue: function () {
          return r;
        },
        setValue: function (l) {
          r = "" + l;
        },
        stopTracking: function () {
          (t._valueTracker = null), delete t[n];
        },
      }
    );
  }
}
function Kr(t) {
  t._valueTracker || (t._valueTracker = wm(t));
}
function ju(t) {
  if (!t) return !1;
  var n = t._valueTracker;
  if (!n) return !0;
  var s = n.getValue(),
    r = "";
  return (
    t && (r = xu(t) ? (t.checked ? "true" : "false") : t.value),
    (t = r),
    t !== s ? (n.setValue(t), !0) : !1
  );
}
function Ai(t) {
  if (((t = t || (typeof document < "u" ? document : void 0)), typeof t > "u"))
    return null;
  try {
    return t.activeElement || t.body;
  } catch {
    return t.body;
  }
}
function xl(t, n) {
  var s = n.checked;
  return ye({}, n, {
    defaultChecked: void 0,
    defaultValue: void 0,
    value: void 0,
    checked: s ?? t._wrapperState.initialChecked,
  });
}
function Cc(t, n) {
  var s = n.defaultValue == null ? "" : n.defaultValue,
    r = n.checked != null ? n.checked : n.defaultChecked;
  (s = Nn(n.value != null ? n.value : s)),
    (t._wrapperState = {
      initialChecked: r,
      initialValue: s,
      controlled:
        n.type === "checkbox" || n.type === "radio"
          ? n.checked != null
          : n.value != null,
    });
}
function vu(t, n) {
  (n = n.checked), n != null && go(t, "checked", n, !1);
}
function jl(t, n) {
  vu(t, n);
  var s = Nn(n.value),
    r = n.type;
  if (s != null)
    r === "number"
      ? ((s === 0 && t.value === "") || t.value != s) && (t.value = "" + s)
      : t.value !== "" + s && (t.value = "" + s);
  else if (r === "submit" || r === "reset") {
    t.removeAttribute("value");
    return;
  }
  n.hasOwnProperty("value")
    ? vl(t, n.type, s)
    : n.hasOwnProperty("defaultValue") && vl(t, n.type, Nn(n.defaultValue)),
    n.checked == null &&
      n.defaultChecked != null &&
      (t.defaultChecked = !!n.defaultChecked);
}
function bc(t, n, s) {
  if (n.hasOwnProperty("value") || n.hasOwnProperty("defaultValue")) {
    var r = n.type;
    if (
      !(
        (r !== "submit" && r !== "reset") ||
        (n.value !== void 0 && n.value !== null)
      )
    )
      return;
    (n = "" + t._wrapperState.initialValue),
      s || n === t.value || (t.value = n),
      (t.defaultValue = n);
  }
  (s = t.name),
    s !== "" && (t.name = ""),
    (t.defaultChecked = !!t._wrapperState.initialChecked),
    s !== "" && (t.name = s);
}
function vl(t, n, s) {
  (n !== "number" || Ai(t.ownerDocument) !== t) &&
    (s == null
      ? (t.defaultValue = "" + t._wrapperState.initialValue)
      : t.defaultValue !== "" + s && (t.defaultValue = "" + s));
}
var tr = Array.isArray;
function js(t, n, s, r) {
  if (((t = t.options), n)) {
    n = {};
    for (var i = 0; i < s.length; i++) n["$" + s[i]] = !0;
    for (s = 0; s < t.length; s++)
      (i = n.hasOwnProperty("$" + t[s].value)),
        t[s].selected !== i && (t[s].selected = i),
        i && r && (t[s].defaultSelected = !0);
  } else {
    for (s = "" + Nn(s), n = null, i = 0; i < t.length; i++) {
      if (t[i].value === s) {
        (t[i].selected = !0), r && (t[i].defaultSelected = !0);
        return;
      }
      n !== null || t[i].disabled || (n = t[i]);
    }
    n !== null && (n.selected = !0);
  }
}
function gl(t, n) {
  if (n.dangerouslySetInnerHTML != null) throw Error(F(91));
  return ye({}, n, {
    value: void 0,
    defaultValue: void 0,
    children: "" + t._wrapperState.initialValue,
  });
}
function wc(t, n) {
  var s = n.value;
  if (s == null) {
    if (((s = n.children), (n = n.defaultValue), s != null)) {
      if (n != null) throw Error(F(92));
      if (tr(s)) {
        if (1 < s.length) throw Error(F(93));
        s = s[0];
      }
      n = s;
    }
    n == null && (n = ""), (s = n);
  }
  t._wrapperState = { initialValue: Nn(s) };
}
function gu(t, n) {
  var s = Nn(n.value),
    r = Nn(n.defaultValue);
  s != null &&
    ((s = "" + s),
    s !== t.value && (t.value = s),
    n.defaultValue == null && t.defaultValue !== s && (t.defaultValue = s)),
    r != null && (t.defaultValue = "" + r);
}
function Ac(t) {
  var n = t.textContent;
  n === t._wrapperState.initialValue && n !== "" && n !== null && (t.value = n);
}
function yu(t) {
  switch (t) {
    case "svg":
      return "http://www.w3.org/2000/svg";
    case "math":
      return "http://www.w3.org/1998/Math/MathML";
    default:
      return "http://www.w3.org/1999/xhtml";
  }
}
function yl(t, n) {
  return t == null || t === "http://www.w3.org/1999/xhtml"
    ? yu(n)
    : t === "http://www.w3.org/2000/svg" && n === "foreignObject"
      ? "http://www.w3.org/1999/xhtml"
      : t;
}
var Qr,
  Nu = (function (t) {
    return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction
      ? function (n, s, r, i) {
          MSApp.execUnsafeLocalFunction(function () {
            return t(n, s, r, i);
          });
        }
      : t;
  })(function (t, n) {
    if (t.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in t)
      t.innerHTML = n;
    else {
      for (
        Qr = Qr || document.createElement("div"),
          Qr.innerHTML = "<svg>" + n.valueOf().toString() + "</svg>",
          n = Qr.firstChild;
        t.firstChild;

      )
        t.removeChild(t.firstChild);
      for (; n.firstChild; ) t.appendChild(n.firstChild);
    }
  });
function xr(t, n) {
  if (n) {
    var s = t.firstChild;
    if (s && s === t.lastChild && s.nodeType === 3) {
      s.nodeValue = n;
      return;
    }
  }
  t.textContent = n;
}
var ir = {
    animationIterationCount: !0,
    aspectRatio: !0,
    borderImageOutset: !0,
    borderImageSlice: !0,
    borderImageWidth: !0,
    boxFlex: !0,
    boxFlexGroup: !0,
    boxOrdinalGroup: !0,
    columnCount: !0,
    columns: !0,
    flex: !0,
    flexGrow: !0,
    flexPositive: !0,
    flexShrink: !0,
    flexNegative: !0,
    flexOrder: !0,
    gridArea: !0,
    gridRow: !0,
    gridRowEnd: !0,
    gridRowSpan: !0,
    gridRowStart: !0,
    gridColumn: !0,
    gridColumnEnd: !0,
    gridColumnSpan: !0,
    gridColumnStart: !0,
    fontWeight: !0,
    lineClamp: !0,
    lineHeight: !0,
    opacity: !0,
    order: !0,
    orphans: !0,
    tabSize: !0,
    widows: !0,
    zIndex: !0,
    zoom: !0,
    fillOpacity: !0,
    floodOpacity: !0,
    stopOpacity: !0,
    strokeDasharray: !0,
    strokeDashoffset: !0,
    strokeMiterlimit: !0,
    strokeOpacity: !0,
    strokeWidth: !0,
  },
  Am = ["Webkit", "ms", "Moz", "O"];
Object.keys(ir).forEach(function (t) {
  Am.forEach(function (n) {
    (n = n + t.charAt(0).toUpperCase() + t.substring(1)), (ir[n] = ir[t]);
  });
});
function ku(t, n, s) {
  return n == null || typeof n == "boolean" || n === ""
    ? ""
    : s || typeof n != "number" || n === 0 || (ir.hasOwnProperty(t) && ir[t])
      ? ("" + n).trim()
      : n + "px";
}
function Su(t, n) {
  t = t.style;
  for (var s in n)
    if (n.hasOwnProperty(s)) {
      var r = s.indexOf("--") === 0,
        i = ku(s, n[s], r);
      s === "float" && (s = "cssFloat"), r ? t.setProperty(s, i) : (t[s] = i);
    }
}
var Em = ye(
  { menuitem: !0 },
  {
    area: !0,
    base: !0,
    br: !0,
    col: !0,
    embed: !0,
    hr: !0,
    img: !0,
    input: !0,
    keygen: !0,
    link: !0,
    meta: !0,
    param: !0,
    source: !0,
    track: !0,
    wbr: !0,
  },
);
function Nl(t, n) {
  if (n) {
    if (Em[t] && (n.children != null || n.dangerouslySetInnerHTML != null))
      throw Error(F(137, t));
    if (n.dangerouslySetInnerHTML != null) {
      if (n.children != null) throw Error(F(60));
      if (
        typeof n.dangerouslySetInnerHTML != "object" ||
        !("__html" in n.dangerouslySetInnerHTML)
      )
        throw Error(F(61));
    }
    if (n.style != null && typeof n.style != "object") throw Error(F(62));
  }
}
function kl(t, n) {
  if (t.indexOf("-") === -1) return typeof n.is == "string";
  switch (t) {
    case "annotation-xml":
    case "color-profile":
    case "font-face":
    case "font-face-src":
    case "font-face-uri":
    case "font-face-format":
    case "font-face-name":
    case "missing-glyph":
      return !1;
    default:
      return !0;
  }
}
var Sl = null;
function So(t) {
  return (
    (t = t.target || t.srcElement || window),
    t.correspondingUseElement && (t = t.correspondingUseElement),
    t.nodeType === 3 ? t.parentNode : t
  );
}
var Cl = null,
  vs = null,
  gs = null;
function Ec(t) {
  if ((t = Lr(t))) {
    if (typeof Cl != "function") throw Error(F(280));
    var n = t.stateNode;
    n && ((n = ia(n)), Cl(t.stateNode, t.type, n));
  }
}
function Cu(t) {
  vs ? (gs ? gs.push(t) : (gs = [t])) : (vs = t);
}
function bu() {
  if (vs) {
    var t = vs,
      n = gs;
    if (((gs = vs = null), Ec(t), n)) for (t = 0; t < n.length; t++) Ec(n[t]);
  }
}
function wu(t, n) {
  return t(n);
}
function Au() {}
var za = !1;
function Eu(t, n, s) {
  if (za) return t(n, s);
  za = !0;
  try {
    return wu(t, n, s);
  } finally {
    (za = !1), (vs !== null || gs !== null) && (Au(), bu());
  }
}
function jr(t, n) {
  var s = t.stateNode;
  if (s === null) return null;
  var r = ia(s);
  if (r === null) return null;
  s = r[n];
  e: switch (n) {
    case "onClick":
    case "onClickCapture":
    case "onDoubleClick":
    case "onDoubleClickCapture":
    case "onMouseDown":
    case "onMouseDownCapture":
    case "onMouseMove":
    case "onMouseMoveCapture":
    case "onMouseUp":
    case "onMouseUpCapture":
    case "onMouseEnter":
      (r = !r.disabled) ||
        ((t = t.type),
        (r = !(
          t === "button" ||
          t === "input" ||
          t === "select" ||
          t === "textarea"
        ))),
        (t = !r);
      break e;
    default:
      t = !1;
  }
  if (t) return null;
  if (s && typeof s != "function") throw Error(F(231, n, typeof s));
  return s;
}
var bl = !1;
if (Qt)
  try {
    var Hs = {};
    Object.defineProperty(Hs, "passive", {
      get: function () {
        bl = !0;
      },
    }),
      window.addEventListener("test", Hs, Hs),
      window.removeEventListener("test", Hs, Hs);
  } catch {
    bl = !1;
  }
function Tm(t, n, s, r, i, a, l, o, c) {
  var d = Array.prototype.slice.call(arguments, 3);
  try {
    n.apply(s, d);
  } catch (u) {
    this.onError(u);
  }
}
var ar = !1,
  Ei = null,
  Ti = !1,
  wl = null,
  Pm = {
    onError: function (t) {
      (ar = !0), (Ei = t);
    },
  };
function Im(t, n, s, r, i, a, l, o, c) {
  (ar = !1), (Ei = null), Tm.apply(Pm, arguments);
}
function zm(t, n, s, r, i, a, l, o, c) {
  if ((Im.apply(this, arguments), ar)) {
    if (ar) {
      var d = Ei;
      (ar = !1), (Ei = null);
    } else throw Error(F(198));
    Ti || ((Ti = !0), (wl = d));
  }
}
function Zn(t) {
  var n = t,
    s = t;
  if (t.alternate) for (; n.return; ) n = n.return;
  else {
    t = n;
    do (n = t), n.flags & 4098 && (s = n.return), (t = n.return);
    while (t);
  }
  return n.tag === 3 ? s : null;
}
function Tu(t) {
  if (t.tag === 13) {
    var n = t.memoizedState;
    if (
      (n === null && ((t = t.alternate), t !== null && (n = t.memoizedState)),
      n !== null)
    )
      return n.dehydrated;
  }
  return null;
}
function Tc(t) {
  if (Zn(t) !== t) throw Error(F(188));
}
function Om(t) {
  var n = t.alternate;
  if (!n) {
    if (((n = Zn(t)), n === null)) throw Error(F(188));
    return n !== t ? null : t;
  }
  for (var s = t, r = n; ; ) {
    var i = s.return;
    if (i === null) break;
    var a = i.alternate;
    if (a === null) {
      if (((r = i.return), r !== null)) {
        s = r;
        continue;
      }
      break;
    }
    if (i.child === a.child) {
      for (a = i.child; a; ) {
        if (a === s) return Tc(i), t;
        if (a === r) return Tc(i), n;
        a = a.sibling;
      }
      throw Error(F(188));
    }
    if (s.return !== r.return) (s = i), (r = a);
    else {
      for (var l = !1, o = i.child; o; ) {
        if (o === s) {
          (l = !0), (s = i), (r = a);
          break;
        }
        if (o === r) {
          (l = !0), (r = i), (s = a);
          break;
        }
        o = o.sibling;
      }
      if (!l) {
        for (o = a.child; o; ) {
          if (o === s) {
            (l = !0), (s = a), (r = i);
            break;
          }
          if (o === r) {
            (l = !0), (r = a), (s = i);
            break;
          }
          o = o.sibling;
        }
        if (!l) throw Error(F(189));
      }
    }
    if (s.alternate !== r) throw Error(F(190));
  }
  if (s.tag !== 3) throw Error(F(188));
  return s.stateNode.current === s ? t : n;
}
function Pu(t) {
  return (t = Om(t)), t !== null ? Iu(t) : null;
}
function Iu(t) {
  if (t.tag === 5 || t.tag === 6) return t;
  for (t = t.child; t !== null; ) {
    var n = Iu(t);
    if (n !== null) return n;
    t = t.sibling;
  }
  return null;
}
var zu = at.unstable_scheduleCallback,
  Pc = at.unstable_cancelCallback,
  Rm = at.unstable_shouldYield,
  Mm = at.unstable_requestPaint,
  Se = at.unstable_now,
  Dm = at.unstable_getCurrentPriorityLevel,
  Co = at.unstable_ImmediatePriority,
  Ou = at.unstable_UserBlockingPriority,
  Pi = at.unstable_NormalPriority,
  _m = at.unstable_LowPriority,
  Ru = at.unstable_IdlePriority,
  ta = null,
  Ot = null;
function $m(t) {
  if (Ot && typeof Ot.onCommitFiberRoot == "function")
    try {
      Ot.onCommitFiberRoot(ta, t, void 0, (t.current.flags & 128) === 128);
    } catch {}
}
var St = Math.clz32 ? Math.clz32 : Um,
  Lm = Math.log,
  Fm = Math.LN2;
function Um(t) {
  return (t >>>= 0), t === 0 ? 32 : (31 - ((Lm(t) / Fm) | 0)) | 0;
}
var Yr = 64,
  qr = 4194304;
function nr(t) {
  switch (t & -t) {
    case 1:
      return 1;
    case 2:
      return 2;
    case 4:
      return 4;
    case 8:
      return 8;
    case 16:
      return 16;
    case 32:
      return 32;
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return t & 4194240;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return t & 130023424;
    case 134217728:
      return 134217728;
    case 268435456:
      return 268435456;
    case 536870912:
      return 536870912;
    case 1073741824:
      return 1073741824;
    default:
      return t;
  }
}
function Ii(t, n) {
  var s = t.pendingLanes;
  if (s === 0) return 0;
  var r = 0,
    i = t.suspendedLanes,
    a = t.pingedLanes,
    l = s & 268435455;
  if (l !== 0) {
    var o = l & ~i;
    o !== 0 ? (r = nr(o)) : ((a &= l), a !== 0 && (r = nr(a)));
  } else (l = s & ~i), l !== 0 ? (r = nr(l)) : a !== 0 && (r = nr(a));
  if (r === 0) return 0;
  if (
    n !== 0 &&
    n !== r &&
    !(n & i) &&
    ((i = r & -r), (a = n & -n), i >= a || (i === 16 && (a & 4194240) !== 0))
  )
    return n;
  if ((r & 4 && (r |= s & 16), (n = t.entangledLanes), n !== 0))
    for (t = t.entanglements, n &= r; 0 < n; )
      (s = 31 - St(n)), (i = 1 << s), (r |= t[s]), (n &= ~i);
  return r;
}
function Vm(t, n) {
  switch (t) {
    case 1:
    case 2:
    case 4:
      return n + 250;
    case 8:
    case 16:
    case 32:
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return n + 5e3;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return -1;
    case 134217728:
    case 268435456:
    case 536870912:
    case 1073741824:
      return -1;
    default:
      return -1;
  }
}
function Bm(t, n) {
  for (
    var s = t.suspendedLanes,
      r = t.pingedLanes,
      i = t.expirationTimes,
      a = t.pendingLanes;
    0 < a;

  ) {
    var l = 31 - St(a),
      o = 1 << l,
      c = i[l];
    c === -1
      ? (!(o & s) || o & r) && (i[l] = Vm(o, n))
      : c <= n && (t.expiredLanes |= o),
      (a &= ~o);
  }
}
function Al(t) {
  return (
    (t = t.pendingLanes & -1073741825),
    t !== 0 ? t : t & 1073741824 ? 1073741824 : 0
  );
}
function Mu() {
  var t = Yr;
  return (Yr <<= 1), !(Yr & 4194240) && (Yr = 64), t;
}
function Oa(t) {
  for (var n = [], s = 0; 31 > s; s++) n.push(t);
  return n;
}
function _r(t, n, s) {
  (t.pendingLanes |= n),
    n !== 536870912 && ((t.suspendedLanes = 0), (t.pingedLanes = 0)),
    (t = t.eventTimes),
    (n = 31 - St(n)),
    (t[n] = s);
}
function Hm(t, n) {
  var s = t.pendingLanes & ~n;
  (t.pendingLanes = n),
    (t.suspendedLanes = 0),
    (t.pingedLanes = 0),
    (t.expiredLanes &= n),
    (t.mutableReadLanes &= n),
    (t.entangledLanes &= n),
    (n = t.entanglements);
  var r = t.eventTimes;
  for (t = t.expirationTimes; 0 < s; ) {
    var i = 31 - St(s),
      a = 1 << i;
    (n[i] = 0), (r[i] = -1), (t[i] = -1), (s &= ~a);
  }
}
function bo(t, n) {
  var s = (t.entangledLanes |= n);
  for (t = t.entanglements; s; ) {
    var r = 31 - St(s),
      i = 1 << r;
    (i & n) | (t[r] & n) && (t[r] |= n), (s &= ~i);
  }
}
var re = 0;
function Du(t) {
  return (t &= -t), 1 < t ? (4 < t ? (t & 268435455 ? 16 : 536870912) : 4) : 1;
}
var _u,
  wo,
  $u,
  Lu,
  Fu,
  El = !1,
  Zr = [],
  hn = null,
  pn = null,
  mn = null,
  vr = new Map(),
  gr = new Map(),
  ln = [],
  Gm =
    "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(
      " ",
    );
function Ic(t, n) {
  switch (t) {
    case "focusin":
    case "focusout":
      hn = null;
      break;
    case "dragenter":
    case "dragleave":
      pn = null;
      break;
    case "mouseover":
    case "mouseout":
      mn = null;
      break;
    case "pointerover":
    case "pointerout":
      vr.delete(n.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      gr.delete(n.pointerId);
  }
}
function Gs(t, n, s, r, i, a) {
  return t === null || t.nativeEvent !== a
    ? ((t = {
        blockedOn: n,
        domEventName: s,
        eventSystemFlags: r,
        nativeEvent: a,
        targetContainers: [i],
      }),
      n !== null && ((n = Lr(n)), n !== null && wo(n)),
      t)
    : ((t.eventSystemFlags |= r),
      (n = t.targetContainers),
      i !== null && n.indexOf(i) === -1 && n.push(i),
      t);
}
function Wm(t, n, s, r, i) {
  switch (n) {
    case "focusin":
      return (hn = Gs(hn, t, n, s, r, i)), !0;
    case "dragenter":
      return (pn = Gs(pn, t, n, s, r, i)), !0;
    case "mouseover":
      return (mn = Gs(mn, t, n, s, r, i)), !0;
    case "pointerover":
      var a = i.pointerId;
      return vr.set(a, Gs(vr.get(a) || null, t, n, s, r, i)), !0;
    case "gotpointercapture":
      return (
        (a = i.pointerId), gr.set(a, Gs(gr.get(a) || null, t, n, s, r, i)), !0
      );
  }
  return !1;
}
function Uu(t) {
  var n = Mn(t.target);
  if (n !== null) {
    var s = Zn(n);
    if (s !== null) {
      if (((n = s.tag), n === 13)) {
        if (((n = Tu(s)), n !== null)) {
          (t.blockedOn = n),
            Fu(t.priority, function () {
              $u(s);
            });
          return;
        }
      } else if (n === 3 && s.stateNode.current.memoizedState.isDehydrated) {
        t.blockedOn = s.tag === 3 ? s.stateNode.containerInfo : null;
        return;
      }
    }
  }
  t.blockedOn = null;
}
function fi(t) {
  if (t.blockedOn !== null) return !1;
  for (var n = t.targetContainers; 0 < n.length; ) {
    var s = Tl(t.domEventName, t.eventSystemFlags, n[0], t.nativeEvent);
    if (s === null) {
      s = t.nativeEvent;
      var r = new s.constructor(s.type, s);
      (Sl = r), s.target.dispatchEvent(r), (Sl = null);
    } else return (n = Lr(s)), n !== null && wo(n), (t.blockedOn = s), !1;
    n.shift();
  }
  return !0;
}
function zc(t, n, s) {
  fi(t) && s.delete(n);
}
function Km() {
  (El = !1),
    hn !== null && fi(hn) && (hn = null),
    pn !== null && fi(pn) && (pn = null),
    mn !== null && fi(mn) && (mn = null),
    vr.forEach(zc),
    gr.forEach(zc);
}
function Ws(t, n) {
  t.blockedOn === n &&
    ((t.blockedOn = null),
    El ||
      ((El = !0),
      at.unstable_scheduleCallback(at.unstable_NormalPriority, Km)));
}
function yr(t) {
  function n(i) {
    return Ws(i, t);
  }
  if (0 < Zr.length) {
    Ws(Zr[0], t);
    for (var s = 1; s < Zr.length; s++) {
      var r = Zr[s];
      r.blockedOn === t && (r.blockedOn = null);
    }
  }
  for (
    hn !== null && Ws(hn, t),
      pn !== null && Ws(pn, t),
      mn !== null && Ws(mn, t),
      vr.forEach(n),
      gr.forEach(n),
      s = 0;
    s < ln.length;
    s++
  )
    (r = ln[s]), r.blockedOn === t && (r.blockedOn = null);
  for (; 0 < ln.length && ((s = ln[0]), s.blockedOn === null); )
    Uu(s), s.blockedOn === null && ln.shift();
}
var ys = tn.ReactCurrentBatchConfig,
  zi = !0;
function Qm(t, n, s, r) {
  var i = re,
    a = ys.transition;
  ys.transition = null;
  try {
    (re = 1), Ao(t, n, s, r);
  } finally {
    (re = i), (ys.transition = a);
  }
}
function Ym(t, n, s, r) {
  var i = re,
    a = ys.transition;
  ys.transition = null;
  try {
    (re = 4), Ao(t, n, s, r);
  } finally {
    (re = i), (ys.transition = a);
  }
}
function Ao(t, n, s, r) {
  if (zi) {
    var i = Tl(t, n, s, r);
    if (i === null) Ba(t, n, r, Oi, s), Ic(t, r);
    else if (Wm(i, t, n, s, r)) r.stopPropagation();
    else if ((Ic(t, r), n & 4 && -1 < Gm.indexOf(t))) {
      for (; i !== null; ) {
        var a = Lr(i);
        if (
          (a !== null && _u(a),
          (a = Tl(t, n, s, r)),
          a === null && Ba(t, n, r, Oi, s),
          a === i)
        )
          break;
        i = a;
      }
      i !== null && r.stopPropagation();
    } else Ba(t, n, r, null, s);
  }
}
var Oi = null;
function Tl(t, n, s, r) {
  if (((Oi = null), (t = So(r)), (t = Mn(t)), t !== null))
    if (((n = Zn(t)), n === null)) t = null;
    else if (((s = n.tag), s === 13)) {
      if (((t = Tu(n)), t !== null)) return t;
      t = null;
    } else if (s === 3) {
      if (n.stateNode.current.memoizedState.isDehydrated)
        return n.tag === 3 ? n.stateNode.containerInfo : null;
      t = null;
    } else n !== t && (t = null);
  return (Oi = t), null;
}
function Vu(t) {
  switch (t) {
    case "cancel":
    case "click":
    case "close":
    case "contextmenu":
    case "copy":
    case "cut":
    case "auxclick":
    case "dblclick":
    case "dragend":
    case "dragstart":
    case "drop":
    case "focusin":
    case "focusout":
    case "input":
    case "invalid":
    case "keydown":
    case "keypress":
    case "keyup":
    case "mousedown":
    case "mouseup":
    case "paste":
    case "pause":
    case "play":
    case "pointercancel":
    case "pointerdown":
    case "pointerup":
    case "ratechange":
    case "reset":
    case "resize":
    case "seeked":
    case "submit":
    case "touchcancel":
    case "touchend":
    case "touchstart":
    case "volumechange":
    case "change":
    case "selectionchange":
    case "textInput":
    case "compositionstart":
    case "compositionend":
    case "compositionupdate":
    case "beforeblur":
    case "afterblur":
    case "beforeinput":
    case "blur":
    case "fullscreenchange":
    case "focus":
    case "hashchange":
    case "popstate":
    case "select":
    case "selectstart":
      return 1;
    case "drag":
    case "dragenter":
    case "dragexit":
    case "dragleave":
    case "dragover":
    case "mousemove":
    case "mouseout":
    case "mouseover":
    case "pointermove":
    case "pointerout":
    case "pointerover":
    case "scroll":
    case "toggle":
    case "touchmove":
    case "wheel":
    case "mouseenter":
    case "mouseleave":
    case "pointerenter":
    case "pointerleave":
      return 4;
    case "message":
      switch (Dm()) {
        case Co:
          return 1;
        case Ou:
          return 4;
        case Pi:
        case _m:
          return 16;
        case Ru:
          return 536870912;
        default:
          return 16;
      }
    default:
      return 16;
  }
}
var dn = null,
  Eo = null,
  xi = null;
function Bu() {
  if (xi) return xi;
  var t,
    n = Eo,
    s = n.length,
    r,
    i = "value" in dn ? dn.value : dn.textContent,
    a = i.length;
  for (t = 0; t < s && n[t] === i[t]; t++);
  var l = s - t;
  for (r = 1; r <= l && n[s - r] === i[a - r]; r++);
  return (xi = i.slice(t, 1 < r ? 1 - r : void 0));
}
function ji(t) {
  var n = t.keyCode;
  return (
    "charCode" in t
      ? ((t = t.charCode), t === 0 && n === 13 && (t = 13))
      : (t = n),
    t === 10 && (t = 13),
    32 <= t || t === 13 ? t : 0
  );
}
function Xr() {
  return !0;
}
function Oc() {
  return !1;
}
function ot(t) {
  function n(s, r, i, a, l) {
    (this._reactName = s),
      (this._targetInst = i),
      (this.type = r),
      (this.nativeEvent = a),
      (this.target = l),
      (this.currentTarget = null);
    for (var o in t)
      t.hasOwnProperty(o) && ((s = t[o]), (this[o] = s ? s(a) : a[o]));
    return (
      (this.isDefaultPrevented = (
        a.defaultPrevented != null ? a.defaultPrevented : a.returnValue === !1
      )
        ? Xr
        : Oc),
      (this.isPropagationStopped = Oc),
      this
    );
  }
  return (
    ye(n.prototype, {
      preventDefault: function () {
        this.defaultPrevented = !0;
        var s = this.nativeEvent;
        s &&
          (s.preventDefault
            ? s.preventDefault()
            : typeof s.returnValue != "unknown" && (s.returnValue = !1),
          (this.isDefaultPrevented = Xr));
      },
      stopPropagation: function () {
        var s = this.nativeEvent;
        s &&
          (s.stopPropagation
            ? s.stopPropagation()
            : typeof s.cancelBubble != "unknown" && (s.cancelBubble = !0),
          (this.isPropagationStopped = Xr));
      },
      persist: function () {},
      isPersistent: Xr,
    }),
    n
  );
}
var _s = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function (t) {
      return t.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0,
  },
  To = ot(_s),
  $r = ye({}, _s, { view: 0, detail: 0 }),
  qm = ot($r),
  Ra,
  Ma,
  Ks,
  na = ye({}, $r, {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    getModifierState: Po,
    button: 0,
    buttons: 0,
    relatedTarget: function (t) {
      return t.relatedTarget === void 0
        ? t.fromElement === t.srcElement
          ? t.toElement
          : t.fromElement
        : t.relatedTarget;
    },
    movementX: function (t) {
      return "movementX" in t
        ? t.movementX
        : (t !== Ks &&
            (Ks && t.type === "mousemove"
              ? ((Ra = t.screenX - Ks.screenX), (Ma = t.screenY - Ks.screenY))
              : (Ma = Ra = 0),
            (Ks = t)),
          Ra);
    },
    movementY: function (t) {
      return "movementY" in t ? t.movementY : Ma;
    },
  }),
  Rc = ot(na),
  Zm = ye({}, na, { dataTransfer: 0 }),
  Xm = ot(Zm),
  Jm = ye({}, $r, { relatedTarget: 0 }),
  Da = ot(Jm),
  ef = ye({}, _s, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
  tf = ot(ef),
  nf = ye({}, _s, {
    clipboardData: function (t) {
      return "clipboardData" in t ? t.clipboardData : window.clipboardData;
    },
  }),
  sf = ot(nf),
  rf = ye({}, _s, { data: 0 }),
  Mc = ot(rf),
  af = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified",
  },
  lf = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta",
  },
  of = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey",
  };
function cf(t) {
  var n = this.nativeEvent;
  return n.getModifierState ? n.getModifierState(t) : (t = of[t]) ? !!n[t] : !1;
}
function Po() {
  return cf;
}
var df = ye({}, $r, {
    key: function (t) {
      if (t.key) {
        var n = af[t.key] || t.key;
        if (n !== "Unidentified") return n;
      }
      return t.type === "keypress"
        ? ((t = ji(t)), t === 13 ? "Enter" : String.fromCharCode(t))
        : t.type === "keydown" || t.type === "keyup"
          ? lf[t.keyCode] || "Unidentified"
          : "";
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: Po,
    charCode: function (t) {
      return t.type === "keypress" ? ji(t) : 0;
    },
    keyCode: function (t) {
      return t.type === "keydown" || t.type === "keyup" ? t.keyCode : 0;
    },
    which: function (t) {
      return t.type === "keypress"
        ? ji(t)
        : t.type === "keydown" || t.type === "keyup"
          ? t.keyCode
          : 0;
    },
  }),
  uf = ot(df),
  hf = ye({}, na, {
    pointerId: 0,
    width: 0,
    height: 0,
    pressure: 0,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    pointerType: 0,
    isPrimary: 0,
  }),
  Dc = ot(hf),
  pf = ye({}, $r, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: Po,
  }),
  mf = ot(pf),
  ff = ye({}, _s, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
  xf = ot(ff),
  jf = ye({}, na, {
    deltaX: function (t) {
      return "deltaX" in t ? t.deltaX : "wheelDeltaX" in t ? -t.wheelDeltaX : 0;
    },
    deltaY: function (t) {
      return "deltaY" in t
        ? t.deltaY
        : "wheelDeltaY" in t
          ? -t.wheelDeltaY
          : "wheelDelta" in t
            ? -t.wheelDelta
            : 0;
    },
    deltaZ: 0,
    deltaMode: 0,
  }),
  vf = ot(jf),
  gf = [9, 13, 27, 32],
  Io = Qt && "CompositionEvent" in window,
  lr = null;
Qt && "documentMode" in document && (lr = document.documentMode);
var yf = Qt && "TextEvent" in window && !lr,
  Hu = Qt && (!Io || (lr && 8 < lr && 11 >= lr)),
  _c = " ",
  $c = !1;
function Gu(t, n) {
  switch (t) {
    case "keyup":
      return gf.indexOf(n.keyCode) !== -1;
    case "keydown":
      return n.keyCode !== 229;
    case "keypress":
    case "mousedown":
    case "focusout":
      return !0;
    default:
      return !1;
  }
}
function Wu(t) {
  return (t = t.detail), typeof t == "object" && "data" in t ? t.data : null;
}
var ls = !1;
function Nf(t, n) {
  switch (t) {
    case "compositionend":
      return Wu(n);
    case "keypress":
      return n.which !== 32 ? null : (($c = !0), _c);
    case "textInput":
      return (t = n.data), t === _c && $c ? null : t;
    default:
      return null;
  }
}
function kf(t, n) {
  if (ls)
    return t === "compositionend" || (!Io && Gu(t, n))
      ? ((t = Bu()), (xi = Eo = dn = null), (ls = !1), t)
      : null;
  switch (t) {
    case "paste":
      return null;
    case "keypress":
      if (!(n.ctrlKey || n.altKey || n.metaKey) || (n.ctrlKey && n.altKey)) {
        if (n.char && 1 < n.char.length) return n.char;
        if (n.which) return String.fromCharCode(n.which);
      }
      return null;
    case "compositionend":
      return Hu && n.locale !== "ko" ? null : n.data;
    default:
      return null;
  }
}
var Sf = {
  color: !0,
  date: !0,
  datetime: !0,
  "datetime-local": !0,
  email: !0,
  month: !0,
  number: !0,
  password: !0,
  range: !0,
  search: !0,
  tel: !0,
  text: !0,
  time: !0,
  url: !0,
  week: !0,
};
function Lc(t) {
  var n = t && t.nodeName && t.nodeName.toLowerCase();
  return n === "input" ? !!Sf[t.type] : n === "textarea";
}
function Ku(t, n, s, r) {
  Cu(r),
    (n = Ri(n, "onChange")),
    0 < n.length &&
      ((s = new To("onChange", "change", null, s, r)),
      t.push({ event: s, listeners: n }));
}
var or = null,
  Nr = null;
function Cf(t) {
  rh(t, 0);
}
function sa(t) {
  var n = ds(t);
  if (ju(n)) return t;
}
function bf(t, n) {
  if (t === "change") return n;
}
var Qu = !1;
if (Qt) {
  var _a;
  if (Qt) {
    var $a = "oninput" in document;
    if (!$a) {
      var Fc = document.createElement("div");
      Fc.setAttribute("oninput", "return;"),
        ($a = typeof Fc.oninput == "function");
    }
    _a = $a;
  } else _a = !1;
  Qu = _a && (!document.documentMode || 9 < document.documentMode);
}
function Uc() {
  or && (or.detachEvent("onpropertychange", Yu), (Nr = or = null));
}
function Yu(t) {
  if (t.propertyName === "value" && sa(Nr)) {
    var n = [];
    Ku(n, Nr, t, So(t)), Eu(Cf, n);
  }
}
function wf(t, n, s) {
  t === "focusin"
    ? (Uc(), (or = n), (Nr = s), or.attachEvent("onpropertychange", Yu))
    : t === "focusout" && Uc();
}
function Af(t) {
  if (t === "selectionchange" || t === "keyup" || t === "keydown")
    return sa(Nr);
}
function Ef(t, n) {
  if (t === "click") return sa(n);
}
function Tf(t, n) {
  if (t === "input" || t === "change") return sa(n);
}
function Pf(t, n) {
  return (t === n && (t !== 0 || 1 / t === 1 / n)) || (t !== t && n !== n);
}
var bt = typeof Object.is == "function" ? Object.is : Pf;
function kr(t, n) {
  if (bt(t, n)) return !0;
  if (typeof t != "object" || t === null || typeof n != "object" || n === null)
    return !1;
  var s = Object.keys(t),
    r = Object.keys(n);
  if (s.length !== r.length) return !1;
  for (r = 0; r < s.length; r++) {
    var i = s[r];
    if (!ul.call(n, i) || !bt(t[i], n[i])) return !1;
  }
  return !0;
}
function Vc(t) {
  for (; t && t.firstChild; ) t = t.firstChild;
  return t;
}
function Bc(t, n) {
  var s = Vc(t);
  t = 0;
  for (var r; s; ) {
    if (s.nodeType === 3) {
      if (((r = t + s.textContent.length), t <= n && r >= n))
        return { node: s, offset: n - t };
      t = r;
    }
    e: {
      for (; s; ) {
        if (s.nextSibling) {
          s = s.nextSibling;
          break e;
        }
        s = s.parentNode;
      }
      s = void 0;
    }
    s = Vc(s);
  }
}
function qu(t, n) {
  return t && n
    ? t === n
      ? !0
      : t && t.nodeType === 3
        ? !1
        : n && n.nodeType === 3
          ? qu(t, n.parentNode)
          : "contains" in t
            ? t.contains(n)
            : t.compareDocumentPosition
              ? !!(t.compareDocumentPosition(n) & 16)
              : !1
    : !1;
}
function Zu() {
  for (var t = window, n = Ai(); n instanceof t.HTMLIFrameElement; ) {
    try {
      var s = typeof n.contentWindow.location.href == "string";
    } catch {
      s = !1;
    }
    if (s) t = n.contentWindow;
    else break;
    n = Ai(t.document);
  }
  return n;
}
function zo(t) {
  var n = t && t.nodeName && t.nodeName.toLowerCase();
  return (
    n &&
    ((n === "input" &&
      (t.type === "text" ||
        t.type === "search" ||
        t.type === "tel" ||
        t.type === "url" ||
        t.type === "password")) ||
      n === "textarea" ||
      t.contentEditable === "true")
  );
}
function If(t) {
  var n = Zu(),
    s = t.focusedElem,
    r = t.selectionRange;
  if (
    n !== s &&
    s &&
    s.ownerDocument &&
    qu(s.ownerDocument.documentElement, s)
  ) {
    if (r !== null && zo(s)) {
      if (
        ((n = r.start),
        (t = r.end),
        t === void 0 && (t = n),
        "selectionStart" in s)
      )
        (s.selectionStart = n), (s.selectionEnd = Math.min(t, s.value.length));
      else if (
        ((t = ((n = s.ownerDocument || document) && n.defaultView) || window),
        t.getSelection)
      ) {
        t = t.getSelection();
        var i = s.textContent.length,
          a = Math.min(r.start, i);
        (r = r.end === void 0 ? a : Math.min(r.end, i)),
          !t.extend && a > r && ((i = r), (r = a), (a = i)),
          (i = Bc(s, a));
        var l = Bc(s, r);
        i &&
          l &&
          (t.rangeCount !== 1 ||
            t.anchorNode !== i.node ||
            t.anchorOffset !== i.offset ||
            t.focusNode !== l.node ||
            t.focusOffset !== l.offset) &&
          ((n = n.createRange()),
          n.setStart(i.node, i.offset),
          t.removeAllRanges(),
          a > r
            ? (t.addRange(n), t.extend(l.node, l.offset))
            : (n.setEnd(l.node, l.offset), t.addRange(n)));
      }
    }
    for (n = [], t = s; (t = t.parentNode); )
      t.nodeType === 1 &&
        n.push({ element: t, left: t.scrollLeft, top: t.scrollTop });
    for (typeof s.focus == "function" && s.focus(), s = 0; s < n.length; s++)
      (t = n[s]),
        (t.element.scrollLeft = t.left),
        (t.element.scrollTop = t.top);
  }
}
var zf = Qt && "documentMode" in document && 11 >= document.documentMode,
  os = null,
  Pl = null,
  cr = null,
  Il = !1;
function Hc(t, n, s) {
  var r = s.window === s ? s.document : s.nodeType === 9 ? s : s.ownerDocument;
  Il ||
    os == null ||
    os !== Ai(r) ||
    ((r = os),
    "selectionStart" in r && zo(r)
      ? (r = { start: r.selectionStart, end: r.selectionEnd })
      : ((r = (
          (r.ownerDocument && r.ownerDocument.defaultView) ||
          window
        ).getSelection()),
        (r = {
          anchorNode: r.anchorNode,
          anchorOffset: r.anchorOffset,
          focusNode: r.focusNode,
          focusOffset: r.focusOffset,
        })),
    (cr && kr(cr, r)) ||
      ((cr = r),
      (r = Ri(Pl, "onSelect")),
      0 < r.length &&
        ((n = new To("onSelect", "select", null, n, s)),
        t.push({ event: n, listeners: r }),
        (n.target = os))));
}
function Jr(t, n) {
  var s = {};
  return (
    (s[t.toLowerCase()] = n.toLowerCase()),
    (s["Webkit" + t] = "webkit" + n),
    (s["Moz" + t] = "moz" + n),
    s
  );
}
var cs = {
    animationend: Jr("Animation", "AnimationEnd"),
    animationiteration: Jr("Animation", "AnimationIteration"),
    animationstart: Jr("Animation", "AnimationStart"),
    transitionend: Jr("Transition", "TransitionEnd"),
  },
  La = {},
  Xu = {};
Qt &&
  ((Xu = document.createElement("div").style),
  "AnimationEvent" in window ||
    (delete cs.animationend.animation,
    delete cs.animationiteration.animation,
    delete cs.animationstart.animation),
  "TransitionEvent" in window || delete cs.transitionend.transition);
function ra(t) {
  if (La[t]) return La[t];
  if (!cs[t]) return t;
  var n = cs[t],
    s;
  for (s in n) if (n.hasOwnProperty(s) && s in Xu) return (La[t] = n[s]);
  return t;
}
var Ju = ra("animationend"),
  eh = ra("animationiteration"),
  th = ra("animationstart"),
  nh = ra("transitionend"),
  sh = new Map(),
  Gc =
    "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
      " ",
    );
function Cn(t, n) {
  sh.set(t, n), qn(n, [t]);
}
for (var Fa = 0; Fa < Gc.length; Fa++) {
  var Ua = Gc[Fa],
    Of = Ua.toLowerCase(),
    Rf = Ua[0].toUpperCase() + Ua.slice(1);
  Cn(Of, "on" + Rf);
}
Cn(Ju, "onAnimationEnd");
Cn(eh, "onAnimationIteration");
Cn(th, "onAnimationStart");
Cn("dblclick", "onDoubleClick");
Cn("focusin", "onFocus");
Cn("focusout", "onBlur");
Cn(nh, "onTransitionEnd");
ws("onMouseEnter", ["mouseout", "mouseover"]);
ws("onMouseLeave", ["mouseout", "mouseover"]);
ws("onPointerEnter", ["pointerout", "pointerover"]);
ws("onPointerLeave", ["pointerout", "pointerover"]);
qn(
  "onChange",
  "change click focusin focusout input keydown keyup selectionchange".split(
    " ",
  ),
);
qn(
  "onSelect",
  "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
    " ",
  ),
);
qn("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
qn(
  "onCompositionEnd",
  "compositionend focusout keydown keypress keyup mousedown".split(" "),
);
qn(
  "onCompositionStart",
  "compositionstart focusout keydown keypress keyup mousedown".split(" "),
);
qn(
  "onCompositionUpdate",
  "compositionupdate focusout keydown keypress keyup mousedown".split(" "),
);
var sr =
    "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
      " ",
    ),
  Mf = new Set("cancel close invalid load scroll toggle".split(" ").concat(sr));
function Wc(t, n, s) {
  var r = t.type || "unknown-event";
  (t.currentTarget = s), zm(r, n, void 0, t), (t.currentTarget = null);
}
function rh(t, n) {
  n = (n & 4) !== 0;
  for (var s = 0; s < t.length; s++) {
    var r = t[s],
      i = r.event;
    r = r.listeners;
    e: {
      var a = void 0;
      if (n)
        for (var l = r.length - 1; 0 <= l; l--) {
          var o = r[l],
            c = o.instance,
            d = o.currentTarget;
          if (((o = o.listener), c !== a && i.isPropagationStopped())) break e;
          Wc(i, o, d), (a = c);
        }
      else
        for (l = 0; l < r.length; l++) {
          if (
            ((o = r[l]),
            (c = o.instance),
            (d = o.currentTarget),
            (o = o.listener),
            c !== a && i.isPropagationStopped())
          )
            break e;
          Wc(i, o, d), (a = c);
        }
    }
  }
  if (Ti) throw ((t = wl), (Ti = !1), (wl = null), t);
}
function de(t, n) {
  var s = n[Dl];
  s === void 0 && (s = n[Dl] = new Set());
  var r = t + "__bubble";
  s.has(r) || (ih(n, t, 2, !1), s.add(r));
}
function Va(t, n, s) {
  var r = 0;
  n && (r |= 4), ih(s, t, r, n);
}
var ei = "_reactListening" + Math.random().toString(36).slice(2);
function Sr(t) {
  if (!t[ei]) {
    (t[ei] = !0),
      hu.forEach(function (s) {
        s !== "selectionchange" && (Mf.has(s) || Va(s, !1, t), Va(s, !0, t));
      });
    var n = t.nodeType === 9 ? t : t.ownerDocument;
    n === null || n[ei] || ((n[ei] = !0), Va("selectionchange", !1, n));
  }
}
function ih(t, n, s, r) {
  switch (Vu(n)) {
    case 1:
      var i = Qm;
      break;
    case 4:
      i = Ym;
      break;
    default:
      i = Ao;
  }
  (s = i.bind(null, n, s, t)),
    (i = void 0),
    !bl ||
      (n !== "touchstart" && n !== "touchmove" && n !== "wheel") ||
      (i = !0),
    r
      ? i !== void 0
        ? t.addEventListener(n, s, { capture: !0, passive: i })
        : t.addEventListener(n, s, !0)
      : i !== void 0
        ? t.addEventListener(n, s, { passive: i })
        : t.addEventListener(n, s, !1);
}
function Ba(t, n, s, r, i) {
  var a = r;
  if (!(n & 1) && !(n & 2) && r !== null)
    e: for (;;) {
      if (r === null) return;
      var l = r.tag;
      if (l === 3 || l === 4) {
        var o = r.stateNode.containerInfo;
        if (o === i || (o.nodeType === 8 && o.parentNode === i)) break;
        if (l === 4)
          for (l = r.return; l !== null; ) {
            var c = l.tag;
            if (
              (c === 3 || c === 4) &&
              ((c = l.stateNode.containerInfo),
              c === i || (c.nodeType === 8 && c.parentNode === i))
            )
              return;
            l = l.return;
          }
        for (; o !== null; ) {
          if (((l = Mn(o)), l === null)) return;
          if (((c = l.tag), c === 5 || c === 6)) {
            r = a = l;
            continue e;
          }
          o = o.parentNode;
        }
      }
      r = r.return;
    }
  Eu(function () {
    var d = a,
      u = So(s),
      m = [];
    e: {
      var x = sh.get(t);
      if (x !== void 0) {
        var j = To,
          f = t;
        switch (t) {
          case "keypress":
            if (ji(s) === 0) break e;
          case "keydown":
          case "keyup":
            j = uf;
            break;
          case "focusin":
            (f = "focus"), (j = Da);
            break;
          case "focusout":
            (f = "blur"), (j = Da);
            break;
          case "beforeblur":
          case "afterblur":
            j = Da;
            break;
          case "click":
            if (s.button === 2) break e;
          case "auxclick":
          case "dblclick":
          case "mousedown":
          case "mousemove":
          case "mouseup":
          case "mouseout":
          case "mouseover":
          case "contextmenu":
            j = Rc;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            j = Xm;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            j = mf;
            break;
          case Ju:
          case eh:
          case th:
            j = tf;
            break;
          case nh:
            j = xf;
            break;
          case "scroll":
            j = qm;
            break;
          case "wheel":
            j = vf;
            break;
          case "copy":
          case "cut":
          case "paste":
            j = sf;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            j = Dc;
        }
        var g = (n & 4) !== 0,
          b = !g && t === "scroll",
          v = g ? (x !== null ? x + "Capture" : null) : x;
        g = [];
        for (var h = d, p; h !== null; ) {
          p = h;
          var y = p.stateNode;
          if (
            (p.tag === 5 &&
              y !== null &&
              ((p = y),
              v !== null && ((y = jr(h, v)), y != null && g.push(Cr(h, y, p)))),
            b)
          )
            break;
          h = h.return;
        }
        0 < g.length &&
          ((x = new j(x, f, null, s, u)), m.push({ event: x, listeners: g }));
      }
    }
    if (!(n & 7)) {
      e: {
        if (
          ((x = t === "mouseover" || t === "pointerover"),
          (j = t === "mouseout" || t === "pointerout"),
          x &&
            s !== Sl &&
            (f = s.relatedTarget || s.fromElement) &&
            (Mn(f) || f[Yt]))
        )
          break e;
        if (
          (j || x) &&
          ((x =
            u.window === u
              ? u
              : (x = u.ownerDocument)
                ? x.defaultView || x.parentWindow
                : window),
          j
            ? ((f = s.relatedTarget || s.toElement),
              (j = d),
              (f = f ? Mn(f) : null),
              f !== null &&
                ((b = Zn(f)), f !== b || (f.tag !== 5 && f.tag !== 6)) &&
                (f = null))
            : ((j = null), (f = d)),
          j !== f)
        ) {
          if (
            ((g = Rc),
            (y = "onMouseLeave"),
            (v = "onMouseEnter"),
            (h = "mouse"),
            (t === "pointerout" || t === "pointerover") &&
              ((g = Dc),
              (y = "onPointerLeave"),
              (v = "onPointerEnter"),
              (h = "pointer")),
            (b = j == null ? x : ds(j)),
            (p = f == null ? x : ds(f)),
            (x = new g(y, h + "leave", j, s, u)),
            (x.target = b),
            (x.relatedTarget = p),
            (y = null),
            Mn(u) === d &&
              ((g = new g(v, h + "enter", f, s, u)),
              (g.target = p),
              (g.relatedTarget = b),
              (y = g)),
            (b = y),
            j && f)
          )
            t: {
              for (g = j, v = f, h = 0, p = g; p; p = ts(p)) h++;
              for (p = 0, y = v; y; y = ts(y)) p++;
              for (; 0 < h - p; ) (g = ts(g)), h--;
              for (; 0 < p - h; ) (v = ts(v)), p--;
              for (; h--; ) {
                if (g === v || (v !== null && g === v.alternate)) break t;
                (g = ts(g)), (v = ts(v));
              }
              g = null;
            }
          else g = null;
          j !== null && Kc(m, x, j, g, !1),
            f !== null && b !== null && Kc(m, b, f, g, !0);
        }
      }
      e: {
        if (
          ((x = d ? ds(d) : window),
          (j = x.nodeName && x.nodeName.toLowerCase()),
          j === "select" || (j === "input" && x.type === "file"))
        )
          var O = bf;
        else if (Lc(x))
          if (Qu) O = Tf;
          else {
            O = Af;
            var k = wf;
          }
        else
          (j = x.nodeName) &&
            j.toLowerCase() === "input" &&
            (x.type === "checkbox" || x.type === "radio") &&
            (O = Ef);
        if (O && (O = O(t, d))) {
          Ku(m, O, s, u);
          break e;
        }
        k && k(t, x, d),
          t === "focusout" &&
            (k = x._wrapperState) &&
            k.controlled &&
            x.type === "number" &&
            vl(x, "number", x.value);
      }
      switch (((k = d ? ds(d) : window), t)) {
        case "focusin":
          (Lc(k) || k.contentEditable === "true") &&
            ((os = k), (Pl = d), (cr = null));
          break;
        case "focusout":
          cr = Pl = os = null;
          break;
        case "mousedown":
          Il = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          (Il = !1), Hc(m, s, u);
          break;
        case "selectionchange":
          if (zf) break;
        case "keydown":
        case "keyup":
          Hc(m, s, u);
      }
      var z;
      if (Io)
        e: {
          switch (t) {
            case "compositionstart":
              var E = "onCompositionStart";
              break e;
            case "compositionend":
              E = "onCompositionEnd";
              break e;
            case "compositionupdate":
              E = "onCompositionUpdate";
              break e;
          }
          E = void 0;
        }
      else
        ls
          ? Gu(t, s) && (E = "onCompositionEnd")
          : t === "keydown" && s.keyCode === 229 && (E = "onCompositionStart");
      E &&
        (Hu &&
          s.locale !== "ko" &&
          (ls || E !== "onCompositionStart"
            ? E === "onCompositionEnd" && ls && (z = Bu())
            : ((dn = u),
              (Eo = "value" in dn ? dn.value : dn.textContent),
              (ls = !0))),
        (k = Ri(d, E)),
        0 < k.length &&
          ((E = new Mc(E, t, null, s, u)),
          m.push({ event: E, listeners: k }),
          z ? (E.data = z) : ((z = Wu(s)), z !== null && (E.data = z)))),
        (z = yf ? Nf(t, s) : kf(t, s)) &&
          ((d = Ri(d, "onBeforeInput")),
          0 < d.length &&
            ((u = new Mc("onBeforeInput", "beforeinput", null, s, u)),
            m.push({ event: u, listeners: d }),
            (u.data = z)));
    }
    rh(m, n);
  });
}
function Cr(t, n, s) {
  return { instance: t, listener: n, currentTarget: s };
}
function Ri(t, n) {
  for (var s = n + "Capture", r = []; t !== null; ) {
    var i = t,
      a = i.stateNode;
    i.tag === 5 &&
      a !== null &&
      ((i = a),
      (a = jr(t, s)),
      a != null && r.unshift(Cr(t, a, i)),
      (a = jr(t, n)),
      a != null && r.push(Cr(t, a, i))),
      (t = t.return);
  }
  return r;
}
function ts(t) {
  if (t === null) return null;
  do t = t.return;
  while (t && t.tag !== 5);
  return t || null;
}
function Kc(t, n, s, r, i) {
  for (var a = n._reactName, l = []; s !== null && s !== r; ) {
    var o = s,
      c = o.alternate,
      d = o.stateNode;
    if (c !== null && c === r) break;
    o.tag === 5 &&
      d !== null &&
      ((o = d),
      i
        ? ((c = jr(s, a)), c != null && l.unshift(Cr(s, c, o)))
        : i || ((c = jr(s, a)), c != null && l.push(Cr(s, c, o)))),
      (s = s.return);
  }
  l.length !== 0 && t.push({ event: n, listeners: l });
}
var Df = /\r\n?/g,
  _f = /\u0000|\uFFFD/g;
function Qc(t) {
  return (typeof t == "string" ? t : "" + t)
    .replace(
      Df,
      `
`,
    )
    .replace(_f, "");
}
function ti(t, n, s) {
  if (((n = Qc(n)), Qc(t) !== n && s)) throw Error(F(425));
}
function Mi() {}
var zl = null,
  Ol = null;
function Rl(t, n) {
  return (
    t === "textarea" ||
    t === "noscript" ||
    typeof n.children == "string" ||
    typeof n.children == "number" ||
    (typeof n.dangerouslySetInnerHTML == "object" &&
      n.dangerouslySetInnerHTML !== null &&
      n.dangerouslySetInnerHTML.__html != null)
  );
}
var Ml = typeof setTimeout == "function" ? setTimeout : void 0,
  $f = typeof clearTimeout == "function" ? clearTimeout : void 0,
  Yc = typeof Promise == "function" ? Promise : void 0,
  Lf =
    typeof queueMicrotask == "function"
      ? queueMicrotask
      : typeof Yc < "u"
        ? function (t) {
            return Yc.resolve(null).then(t).catch(Ff);
          }
        : Ml;
function Ff(t) {
  setTimeout(function () {
    throw t;
  });
}
function Ha(t, n) {
  var s = n,
    r = 0;
  do {
    var i = s.nextSibling;
    if ((t.removeChild(s), i && i.nodeType === 8))
      if (((s = i.data), s === "/$")) {
        if (r === 0) {
          t.removeChild(i), yr(n);
          return;
        }
        r--;
      } else (s !== "$" && s !== "$?" && s !== "$!") || r++;
    s = i;
  } while (s);
  yr(n);
}
function fn(t) {
  for (; t != null; t = t.nextSibling) {
    var n = t.nodeType;
    if (n === 1 || n === 3) break;
    if (n === 8) {
      if (((n = t.data), n === "$" || n === "$!" || n === "$?")) break;
      if (n === "/$") return null;
    }
  }
  return t;
}
function qc(t) {
  t = t.previousSibling;
  for (var n = 0; t; ) {
    if (t.nodeType === 8) {
      var s = t.data;
      if (s === "$" || s === "$!" || s === "$?") {
        if (n === 0) return t;
        n--;
      } else s === "/$" && n++;
    }
    t = t.previousSibling;
  }
  return null;
}
var $s = Math.random().toString(36).slice(2),
  It = "__reactFiber$" + $s,
  br = "__reactProps$" + $s,
  Yt = "__reactContainer$" + $s,
  Dl = "__reactEvents$" + $s,
  Uf = "__reactListeners$" + $s,
  Vf = "__reactHandles$" + $s;
function Mn(t) {
  var n = t[It];
  if (n) return n;
  for (var s = t.parentNode; s; ) {
    if ((n = s[Yt] || s[It])) {
      if (
        ((s = n.alternate),
        n.child !== null || (s !== null && s.child !== null))
      )
        for (t = qc(t); t !== null; ) {
          if ((s = t[It])) return s;
          t = qc(t);
        }
      return n;
    }
    (t = s), (s = t.parentNode);
  }
  return null;
}
function Lr(t) {
  return (
    (t = t[It] || t[Yt]),
    !t || (t.tag !== 5 && t.tag !== 6 && t.tag !== 13 && t.tag !== 3) ? null : t
  );
}
function ds(t) {
  if (t.tag === 5 || t.tag === 6) return t.stateNode;
  throw Error(F(33));
}
function ia(t) {
  return t[br] || null;
}
var _l = [],
  us = -1;
function bn(t) {
  return { current: t };
}
function he(t) {
  0 > us || ((t.current = _l[us]), (_l[us] = null), us--);
}
function oe(t, n) {
  us++, (_l[us] = t.current), (t.current = n);
}
var kn = {},
  Ue = bn(kn),
  Xe = bn(!1),
  Hn = kn;
function As(t, n) {
  var s = t.type.contextTypes;
  if (!s) return kn;
  var r = t.stateNode;
  if (r && r.__reactInternalMemoizedUnmaskedChildContext === n)
    return r.__reactInternalMemoizedMaskedChildContext;
  var i = {},
    a;
  for (a in s) i[a] = n[a];
  return (
    r &&
      ((t = t.stateNode),
      (t.__reactInternalMemoizedUnmaskedChildContext = n),
      (t.__reactInternalMemoizedMaskedChildContext = i)),
    i
  );
}
function Je(t) {
  return (t = t.childContextTypes), t != null;
}
function Di() {
  he(Xe), he(Ue);
}
function Zc(t, n, s) {
  if (Ue.current !== kn) throw Error(F(168));
  oe(Ue, n), oe(Xe, s);
}
function ah(t, n, s) {
  var r = t.stateNode;
  if (((n = n.childContextTypes), typeof r.getChildContext != "function"))
    return s;
  r = r.getChildContext();
  for (var i in r) if (!(i in n)) throw Error(F(108, bm(t) || "Unknown", i));
  return ye({}, s, r);
}
function _i(t) {
  return (
    (t =
      ((t = t.stateNode) && t.__reactInternalMemoizedMergedChildContext) || kn),
    (Hn = Ue.current),
    oe(Ue, t),
    oe(Xe, Xe.current),
    !0
  );
}
function Xc(t, n, s) {
  var r = t.stateNode;
  if (!r) throw Error(F(169));
  s
    ? ((t = ah(t, n, Hn)),
      (r.__reactInternalMemoizedMergedChildContext = t),
      he(Xe),
      he(Ue),
      oe(Ue, t))
    : he(Xe),
    oe(Xe, s);
}
var Vt = null,
  aa = !1,
  Ga = !1;
function lh(t) {
  Vt === null ? (Vt = [t]) : Vt.push(t);
}
function Bf(t) {
  (aa = !0), lh(t);
}
function wn() {
  if (!Ga && Vt !== null) {
    Ga = !0;
    var t = 0,
      n = re;
    try {
      var s = Vt;
      for (re = 1; t < s.length; t++) {
        var r = s[t];
        do r = r(!0);
        while (r !== null);
      }
      (Vt = null), (aa = !1);
    } catch (i) {
      throw (Vt !== null && (Vt = Vt.slice(t + 1)), zu(Co, wn), i);
    } finally {
      (re = n), (Ga = !1);
    }
  }
  return null;
}
var hs = [],
  ps = 0,
  $i = null,
  Li = 0,
  dt = [],
  ut = 0,
  Gn = null,
  Bt = 1,
  Ht = "";
function On(t, n) {
  (hs[ps++] = Li), (hs[ps++] = $i), ($i = t), (Li = n);
}
function oh(t, n, s) {
  (dt[ut++] = Bt), (dt[ut++] = Ht), (dt[ut++] = Gn), (Gn = t);
  var r = Bt;
  t = Ht;
  var i = 32 - St(r) - 1;
  (r &= ~(1 << i)), (s += 1);
  var a = 32 - St(n) + i;
  if (30 < a) {
    var l = i - (i % 5);
    (a = (r & ((1 << l) - 1)).toString(32)),
      (r >>= l),
      (i -= l),
      (Bt = (1 << (32 - St(n) + i)) | (s << i) | r),
      (Ht = a + t);
  } else (Bt = (1 << a) | (s << i) | r), (Ht = t);
}
function Oo(t) {
  t.return !== null && (On(t, 1), oh(t, 1, 0));
}
function Ro(t) {
  for (; t === $i; )
    ($i = hs[--ps]), (hs[ps] = null), (Li = hs[--ps]), (hs[ps] = null);
  for (; t === Gn; )
    (Gn = dt[--ut]),
      (dt[ut] = null),
      (Ht = dt[--ut]),
      (dt[ut] = null),
      (Bt = dt[--ut]),
      (dt[ut] = null);
}
var it = null,
  rt = null,
  me = !1,
  kt = null;
function ch(t, n) {
  var s = pt(5, null, null, 0);
  (s.elementType = "DELETED"),
    (s.stateNode = n),
    (s.return = t),
    (n = t.deletions),
    n === null ? ((t.deletions = [s]), (t.flags |= 16)) : n.push(s);
}
function Jc(t, n) {
  switch (t.tag) {
    case 5:
      var s = t.type;
      return (
        (n =
          n.nodeType !== 1 || s.toLowerCase() !== n.nodeName.toLowerCase()
            ? null
            : n),
        n !== null
          ? ((t.stateNode = n), (it = t), (rt = fn(n.firstChild)), !0)
          : !1
      );
    case 6:
      return (
        (n = t.pendingProps === "" || n.nodeType !== 3 ? null : n),
        n !== null ? ((t.stateNode = n), (it = t), (rt = null), !0) : !1
      );
    case 13:
      return (
        (n = n.nodeType !== 8 ? null : n),
        n !== null
          ? ((s = Gn !== null ? { id: Bt, overflow: Ht } : null),
            (t.memoizedState = {
              dehydrated: n,
              treeContext: s,
              retryLane: 1073741824,
            }),
            (s = pt(18, null, null, 0)),
            (s.stateNode = n),
            (s.return = t),
            (t.child = s),
            (it = t),
            (rt = null),
            !0)
          : !1
      );
    default:
      return !1;
  }
}
function $l(t) {
  return (t.mode & 1) !== 0 && (t.flags & 128) === 0;
}
function Ll(t) {
  if (me) {
    var n = rt;
    if (n) {
      var s = n;
      if (!Jc(t, n)) {
        if ($l(t)) throw Error(F(418));
        n = fn(s.nextSibling);
        var r = it;
        n && Jc(t, n)
          ? ch(r, s)
          : ((t.flags = (t.flags & -4097) | 2), (me = !1), (it = t));
      }
    } else {
      if ($l(t)) throw Error(F(418));
      (t.flags = (t.flags & -4097) | 2), (me = !1), (it = t);
    }
  }
}
function ed(t) {
  for (t = t.return; t !== null && t.tag !== 5 && t.tag !== 3 && t.tag !== 13; )
    t = t.return;
  it = t;
}
function ni(t) {
  if (t !== it) return !1;
  if (!me) return ed(t), (me = !0), !1;
  var n;
  if (
    ((n = t.tag !== 3) &&
      !(n = t.tag !== 5) &&
      ((n = t.type),
      (n = n !== "head" && n !== "body" && !Rl(t.type, t.memoizedProps))),
    n && (n = rt))
  ) {
    if ($l(t)) throw (dh(), Error(F(418)));
    for (; n; ) ch(t, n), (n = fn(n.nextSibling));
  }
  if ((ed(t), t.tag === 13)) {
    if (((t = t.memoizedState), (t = t !== null ? t.dehydrated : null), !t))
      throw Error(F(317));
    e: {
      for (t = t.nextSibling, n = 0; t; ) {
        if (t.nodeType === 8) {
          var s = t.data;
          if (s === "/$") {
            if (n === 0) {
              rt = fn(t.nextSibling);
              break e;
            }
            n--;
          } else (s !== "$" && s !== "$!" && s !== "$?") || n++;
        }
        t = t.nextSibling;
      }
      rt = null;
    }
  } else rt = it ? fn(t.stateNode.nextSibling) : null;
  return !0;
}
function dh() {
  for (var t = rt; t; ) t = fn(t.nextSibling);
}
function Es() {
  (rt = it = null), (me = !1);
}
function Mo(t) {
  kt === null ? (kt = [t]) : kt.push(t);
}
var Hf = tn.ReactCurrentBatchConfig;
function Qs(t, n, s) {
  if (
    ((t = s.ref), t !== null && typeof t != "function" && typeof t != "object")
  ) {
    if (s._owner) {
      if (((s = s._owner), s)) {
        if (s.tag !== 1) throw Error(F(309));
        var r = s.stateNode;
      }
      if (!r) throw Error(F(147, t));
      var i = r,
        a = "" + t;
      return n !== null &&
        n.ref !== null &&
        typeof n.ref == "function" &&
        n.ref._stringRef === a
        ? n.ref
        : ((n = function (l) {
            var o = i.refs;
            l === null ? delete o[a] : (o[a] = l);
          }),
          (n._stringRef = a),
          n);
    }
    if (typeof t != "string") throw Error(F(284));
    if (!s._owner) throw Error(F(290, t));
  }
  return t;
}
function si(t, n) {
  throw (
    ((t = Object.prototype.toString.call(n)),
    Error(
      F(
        31,
        t === "[object Object]"
          ? "object with keys {" + Object.keys(n).join(", ") + "}"
          : t,
      ),
    ))
  );
}
function td(t) {
  var n = t._init;
  return n(t._payload);
}
function uh(t) {
  function n(v, h) {
    if (t) {
      var p = v.deletions;
      p === null ? ((v.deletions = [h]), (v.flags |= 16)) : p.push(h);
    }
  }
  function s(v, h) {
    if (!t) return null;
    for (; h !== null; ) n(v, h), (h = h.sibling);
    return null;
  }
  function r(v, h) {
    for (v = new Map(); h !== null; )
      h.key !== null ? v.set(h.key, h) : v.set(h.index, h), (h = h.sibling);
    return v;
  }
  function i(v, h) {
    return (v = gn(v, h)), (v.index = 0), (v.sibling = null), v;
  }
  function a(v, h, p) {
    return (
      (v.index = p),
      t
        ? ((p = v.alternate),
          p !== null
            ? ((p = p.index), p < h ? ((v.flags |= 2), h) : p)
            : ((v.flags |= 2), h))
        : ((v.flags |= 1048576), h)
    );
  }
  function l(v) {
    return t && v.alternate === null && (v.flags |= 2), v;
  }
  function o(v, h, p, y) {
    return h === null || h.tag !== 6
      ? ((h = Xa(p, v.mode, y)), (h.return = v), h)
      : ((h = i(h, p)), (h.return = v), h);
  }
  function c(v, h, p, y) {
    var O = p.type;
    return O === as
      ? u(v, h, p.props.children, y, p.key)
      : h !== null &&
          (h.elementType === O ||
            (typeof O == "object" &&
              O !== null &&
              O.$$typeof === rn &&
              td(O) === h.type))
        ? ((y = i(h, p.props)), (y.ref = Qs(v, h, p)), (y.return = v), y)
        : ((y = Ci(p.type, p.key, p.props, null, v.mode, y)),
          (y.ref = Qs(v, h, p)),
          (y.return = v),
          y);
  }
  function d(v, h, p, y) {
    return h === null ||
      h.tag !== 4 ||
      h.stateNode.containerInfo !== p.containerInfo ||
      h.stateNode.implementation !== p.implementation
      ? ((h = Ja(p, v.mode, y)), (h.return = v), h)
      : ((h = i(h, p.children || [])), (h.return = v), h);
  }
  function u(v, h, p, y, O) {
    return h === null || h.tag !== 7
      ? ((h = Un(p, v.mode, y, O)), (h.return = v), h)
      : ((h = i(h, p)), (h.return = v), h);
  }
  function m(v, h, p) {
    if ((typeof h == "string" && h !== "") || typeof h == "number")
      return (h = Xa("" + h, v.mode, p)), (h.return = v), h;
    if (typeof h == "object" && h !== null) {
      switch (h.$$typeof) {
        case Wr:
          return (
            (p = Ci(h.type, h.key, h.props, null, v.mode, p)),
            (p.ref = Qs(v, null, h)),
            (p.return = v),
            p
          );
        case is:
          return (h = Ja(h, v.mode, p)), (h.return = v), h;
        case rn:
          var y = h._init;
          return m(v, y(h._payload), p);
      }
      if (tr(h) || Bs(h))
        return (h = Un(h, v.mode, p, null)), (h.return = v), h;
      si(v, h);
    }
    return null;
  }
  function x(v, h, p, y) {
    var O = h !== null ? h.key : null;
    if ((typeof p == "string" && p !== "") || typeof p == "number")
      return O !== null ? null : o(v, h, "" + p, y);
    if (typeof p == "object" && p !== null) {
      switch (p.$$typeof) {
        case Wr:
          return p.key === O ? c(v, h, p, y) : null;
        case is:
          return p.key === O ? d(v, h, p, y) : null;
        case rn:
          return (O = p._init), x(v, h, O(p._payload), y);
      }
      if (tr(p) || Bs(p)) return O !== null ? null : u(v, h, p, y, null);
      si(v, p);
    }
    return null;
  }
  function j(v, h, p, y, O) {
    if ((typeof y == "string" && y !== "") || typeof y == "number")
      return (v = v.get(p) || null), o(h, v, "" + y, O);
    if (typeof y == "object" && y !== null) {
      switch (y.$$typeof) {
        case Wr:
          return (v = v.get(y.key === null ? p : y.key) || null), c(h, v, y, O);
        case is:
          return (v = v.get(y.key === null ? p : y.key) || null), d(h, v, y, O);
        case rn:
          var k = y._init;
          return j(v, h, p, k(y._payload), O);
      }
      if (tr(y) || Bs(y)) return (v = v.get(p) || null), u(h, v, y, O, null);
      si(h, y);
    }
    return null;
  }
  function f(v, h, p, y) {
    for (
      var O = null, k = null, z = h, E = (h = 0), U = null;
      z !== null && E < p.length;
      E++
    ) {
      z.index > E ? ((U = z), (z = null)) : (U = z.sibling);
      var P = x(v, z, p[E], y);
      if (P === null) {
        z === null && (z = U);
        break;
      }
      t && z && P.alternate === null && n(v, z),
        (h = a(P, h, E)),
        k === null ? (O = P) : (k.sibling = P),
        (k = P),
        (z = U);
    }
    if (E === p.length) return s(v, z), me && On(v, E), O;
    if (z === null) {
      for (; E < p.length; E++)
        (z = m(v, p[E], y)),
          z !== null &&
            ((h = a(z, h, E)), k === null ? (O = z) : (k.sibling = z), (k = z));
      return me && On(v, E), O;
    }
    for (z = r(v, z); E < p.length; E++)
      (U = j(z, v, E, p[E], y)),
        U !== null &&
          (t && U.alternate !== null && z.delete(U.key === null ? E : U.key),
          (h = a(U, h, E)),
          k === null ? (O = U) : (k.sibling = U),
          (k = U));
    return (
      t &&
        z.forEach(function ($) {
          return n(v, $);
        }),
      me && On(v, E),
      O
    );
  }
  function g(v, h, p, y) {
    var O = Bs(p);
    if (typeof O != "function") throw Error(F(150));
    if (((p = O.call(p)), p == null)) throw Error(F(151));
    for (
      var k = (O = null), z = h, E = (h = 0), U = null, P = p.next();
      z !== null && !P.done;
      E++, P = p.next()
    ) {
      z.index > E ? ((U = z), (z = null)) : (U = z.sibling);
      var $ = x(v, z, P.value, y);
      if ($ === null) {
        z === null && (z = U);
        break;
      }
      t && z && $.alternate === null && n(v, z),
        (h = a($, h, E)),
        k === null ? (O = $) : (k.sibling = $),
        (k = $),
        (z = U);
    }
    if (P.done) return s(v, z), me && On(v, E), O;
    if (z === null) {
      for (; !P.done; E++, P = p.next())
        (P = m(v, P.value, y)),
          P !== null &&
            ((h = a(P, h, E)), k === null ? (O = P) : (k.sibling = P), (k = P));
      return me && On(v, E), O;
    }
    for (z = r(v, z); !P.done; E++, P = p.next())
      (P = j(z, v, E, P.value, y)),
        P !== null &&
          (t && P.alternate !== null && z.delete(P.key === null ? E : P.key),
          (h = a(P, h, E)),
          k === null ? (O = P) : (k.sibling = P),
          (k = P));
    return (
      t &&
        z.forEach(function (N) {
          return n(v, N);
        }),
      me && On(v, E),
      O
    );
  }
  function b(v, h, p, y) {
    if (
      (typeof p == "object" &&
        p !== null &&
        p.type === as &&
        p.key === null &&
        (p = p.props.children),
      typeof p == "object" && p !== null)
    ) {
      switch (p.$$typeof) {
        case Wr:
          e: {
            for (var O = p.key, k = h; k !== null; ) {
              if (k.key === O) {
                if (((O = p.type), O === as)) {
                  if (k.tag === 7) {
                    s(v, k.sibling),
                      (h = i(k, p.props.children)),
                      (h.return = v),
                      (v = h);
                    break e;
                  }
                } else if (
                  k.elementType === O ||
                  (typeof O == "object" &&
                    O !== null &&
                    O.$$typeof === rn &&
                    td(O) === k.type)
                ) {
                  s(v, k.sibling),
                    (h = i(k, p.props)),
                    (h.ref = Qs(v, k, p)),
                    (h.return = v),
                    (v = h);
                  break e;
                }
                s(v, k);
                break;
              } else n(v, k);
              k = k.sibling;
            }
            p.type === as
              ? ((h = Un(p.props.children, v.mode, y, p.key)),
                (h.return = v),
                (v = h))
              : ((y = Ci(p.type, p.key, p.props, null, v.mode, y)),
                (y.ref = Qs(v, h, p)),
                (y.return = v),
                (v = y));
          }
          return l(v);
        case is:
          e: {
            for (k = p.key; h !== null; ) {
              if (h.key === k)
                if (
                  h.tag === 4 &&
                  h.stateNode.containerInfo === p.containerInfo &&
                  h.stateNode.implementation === p.implementation
                ) {
                  s(v, h.sibling),
                    (h = i(h, p.children || [])),
                    (h.return = v),
                    (v = h);
                  break e;
                } else {
                  s(v, h);
                  break;
                }
              else n(v, h);
              h = h.sibling;
            }
            (h = Ja(p, v.mode, y)), (h.return = v), (v = h);
          }
          return l(v);
        case rn:
          return (k = p._init), b(v, h, k(p._payload), y);
      }
      if (tr(p)) return f(v, h, p, y);
      if (Bs(p)) return g(v, h, p, y);
      si(v, p);
    }
    return (typeof p == "string" && p !== "") || typeof p == "number"
      ? ((p = "" + p),
        h !== null && h.tag === 6
          ? (s(v, h.sibling), (h = i(h, p)), (h.return = v), (v = h))
          : (s(v, h), (h = Xa(p, v.mode, y)), (h.return = v), (v = h)),
        l(v))
      : s(v, h);
  }
  return b;
}
var Ts = uh(!0),
  hh = uh(!1),
  Fi = bn(null),
  Ui = null,
  ms = null,
  Do = null;
function _o() {
  Do = ms = Ui = null;
}
function $o(t) {
  var n = Fi.current;
  he(Fi), (t._currentValue = n);
}
function Fl(t, n, s) {
  for (; t !== null; ) {
    var r = t.alternate;
    if (
      ((t.childLanes & n) !== n
        ? ((t.childLanes |= n), r !== null && (r.childLanes |= n))
        : r !== null && (r.childLanes & n) !== n && (r.childLanes |= n),
      t === s)
    )
      break;
    t = t.return;
  }
}
function Ns(t, n) {
  (Ui = t),
    (Do = ms = null),
    (t = t.dependencies),
    t !== null &&
      t.firstContext !== null &&
      (t.lanes & n && (Ze = !0), (t.firstContext = null));
}
function ft(t) {
  var n = t._currentValue;
  if (Do !== t)
    if (((t = { context: t, memoizedValue: n, next: null }), ms === null)) {
      if (Ui === null) throw Error(F(308));
      (ms = t), (Ui.dependencies = { lanes: 0, firstContext: t });
    } else ms = ms.next = t;
  return n;
}
var Dn = null;
function Lo(t) {
  Dn === null ? (Dn = [t]) : Dn.push(t);
}
function ph(t, n, s, r) {
  var i = n.interleaved;
  return (
    i === null ? ((s.next = s), Lo(n)) : ((s.next = i.next), (i.next = s)),
    (n.interleaved = s),
    qt(t, r)
  );
}
function qt(t, n) {
  t.lanes |= n;
  var s = t.alternate;
  for (s !== null && (s.lanes |= n), s = t, t = t.return; t !== null; )
    (t.childLanes |= n),
      (s = t.alternate),
      s !== null && (s.childLanes |= n),
      (s = t),
      (t = t.return);
  return s.tag === 3 ? s.stateNode : null;
}
var an = !1;
function Fo(t) {
  t.updateQueue = {
    baseState: t.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: { pending: null, interleaved: null, lanes: 0 },
    effects: null,
  };
}
function mh(t, n) {
  (t = t.updateQueue),
    n.updateQueue === t &&
      (n.updateQueue = {
        baseState: t.baseState,
        firstBaseUpdate: t.firstBaseUpdate,
        lastBaseUpdate: t.lastBaseUpdate,
        shared: t.shared,
        effects: t.effects,
      });
}
function Gt(t, n) {
  return {
    eventTime: t,
    lane: n,
    tag: 0,
    payload: null,
    callback: null,
    next: null,
  };
}
function xn(t, n, s) {
  var r = t.updateQueue;
  if (r === null) return null;
  if (((r = r.shared), ne & 2)) {
    var i = r.pending;
    return (
      i === null ? (n.next = n) : ((n.next = i.next), (i.next = n)),
      (r.pending = n),
      qt(t, s)
    );
  }
  return (
    (i = r.interleaved),
    i === null ? ((n.next = n), Lo(r)) : ((n.next = i.next), (i.next = n)),
    (r.interleaved = n),
    qt(t, s)
  );
}
function vi(t, n, s) {
  if (
    ((n = n.updateQueue), n !== null && ((n = n.shared), (s & 4194240) !== 0))
  ) {
    var r = n.lanes;
    (r &= t.pendingLanes), (s |= r), (n.lanes = s), bo(t, s);
  }
}
function nd(t, n) {
  var s = t.updateQueue,
    r = t.alternate;
  if (r !== null && ((r = r.updateQueue), s === r)) {
    var i = null,
      a = null;
    if (((s = s.firstBaseUpdate), s !== null)) {
      do {
        var l = {
          eventTime: s.eventTime,
          lane: s.lane,
          tag: s.tag,
          payload: s.payload,
          callback: s.callback,
          next: null,
        };
        a === null ? (i = a = l) : (a = a.next = l), (s = s.next);
      } while (s !== null);
      a === null ? (i = a = n) : (a = a.next = n);
    } else i = a = n;
    (s = {
      baseState: r.baseState,
      firstBaseUpdate: i,
      lastBaseUpdate: a,
      shared: r.shared,
      effects: r.effects,
    }),
      (t.updateQueue = s);
    return;
  }
  (t = s.lastBaseUpdate),
    t === null ? (s.firstBaseUpdate = n) : (t.next = n),
    (s.lastBaseUpdate = n);
}
function Vi(t, n, s, r) {
  var i = t.updateQueue;
  an = !1;
  var a = i.firstBaseUpdate,
    l = i.lastBaseUpdate,
    o = i.shared.pending;
  if (o !== null) {
    i.shared.pending = null;
    var c = o,
      d = c.next;
    (c.next = null), l === null ? (a = d) : (l.next = d), (l = c);
    var u = t.alternate;
    u !== null &&
      ((u = u.updateQueue),
      (o = u.lastBaseUpdate),
      o !== l &&
        (o === null ? (u.firstBaseUpdate = d) : (o.next = d),
        (u.lastBaseUpdate = c)));
  }
  if (a !== null) {
    var m = i.baseState;
    (l = 0), (u = d = c = null), (o = a);
    do {
      var x = o.lane,
        j = o.eventTime;
      if ((r & x) === x) {
        u !== null &&
          (u = u.next =
            {
              eventTime: j,
              lane: 0,
              tag: o.tag,
              payload: o.payload,
              callback: o.callback,
              next: null,
            });
        e: {
          var f = t,
            g = o;
          switch (((x = n), (j = s), g.tag)) {
            case 1:
              if (((f = g.payload), typeof f == "function")) {
                m = f.call(j, m, x);
                break e;
              }
              m = f;
              break e;
            case 3:
              f.flags = (f.flags & -65537) | 128;
            case 0:
              if (
                ((f = g.payload),
                (x = typeof f == "function" ? f.call(j, m, x) : f),
                x == null)
              )
                break e;
              m = ye({}, m, x);
              break e;
            case 2:
              an = !0;
          }
        }
        o.callback !== null &&
          o.lane !== 0 &&
          ((t.flags |= 64),
          (x = i.effects),
          x === null ? (i.effects = [o]) : x.push(o));
      } else
        (j = {
          eventTime: j,
          lane: x,
          tag: o.tag,
          payload: o.payload,
          callback: o.callback,
          next: null,
        }),
          u === null ? ((d = u = j), (c = m)) : (u = u.next = j),
          (l |= x);
      if (((o = o.next), o === null)) {
        if (((o = i.shared.pending), o === null)) break;
        (x = o),
          (o = x.next),
          (x.next = null),
          (i.lastBaseUpdate = x),
          (i.shared.pending = null);
      }
    } while (!0);
    if (
      (u === null && (c = m),
      (i.baseState = c),
      (i.firstBaseUpdate = d),
      (i.lastBaseUpdate = u),
      (n = i.shared.interleaved),
      n !== null)
    ) {
      i = n;
      do (l |= i.lane), (i = i.next);
      while (i !== n);
    } else a === null && (i.shared.lanes = 0);
    (Kn |= l), (t.lanes = l), (t.memoizedState = m);
  }
}
function sd(t, n, s) {
  if (((t = n.effects), (n.effects = null), t !== null))
    for (n = 0; n < t.length; n++) {
      var r = t[n],
        i = r.callback;
      if (i !== null) {
        if (((r.callback = null), (r = s), typeof i != "function"))
          throw Error(F(191, i));
        i.call(r);
      }
    }
}
var Fr = {},
  Rt = bn(Fr),
  wr = bn(Fr),
  Ar = bn(Fr);
function _n(t) {
  if (t === Fr) throw Error(F(174));
  return t;
}
function Uo(t, n) {
  switch ((oe(Ar, n), oe(wr, t), oe(Rt, Fr), (t = n.nodeType), t)) {
    case 9:
    case 11:
      n = (n = n.documentElement) ? n.namespaceURI : yl(null, "");
      break;
    default:
      (t = t === 8 ? n.parentNode : n),
        (n = t.namespaceURI || null),
        (t = t.tagName),
        (n = yl(n, t));
  }
  he(Rt), oe(Rt, n);
}
function Ps() {
  he(Rt), he(wr), he(Ar);
}
function fh(t) {
  _n(Ar.current);
  var n = _n(Rt.current),
    s = yl(n, t.type);
  n !== s && (oe(wr, t), oe(Rt, s));
}
function Vo(t) {
  wr.current === t && (he(Rt), he(wr));
}
var xe = bn(0);
function Bi(t) {
  for (var n = t; n !== null; ) {
    if (n.tag === 13) {
      var s = n.memoizedState;
      if (
        s !== null &&
        ((s = s.dehydrated), s === null || s.data === "$?" || s.data === "$!")
      )
        return n;
    } else if (n.tag === 19 && n.memoizedProps.revealOrder !== void 0) {
      if (n.flags & 128) return n;
    } else if (n.child !== null) {
      (n.child.return = n), (n = n.child);
      continue;
    }
    if (n === t) break;
    for (; n.sibling === null; ) {
      if (n.return === null || n.return === t) return null;
      n = n.return;
    }
    (n.sibling.return = n.return), (n = n.sibling);
  }
  return null;
}
var Wa = [];
function Bo() {
  for (var t = 0; t < Wa.length; t++)
    Wa[t]._workInProgressVersionPrimary = null;
  Wa.length = 0;
}
var gi = tn.ReactCurrentDispatcher,
  Ka = tn.ReactCurrentBatchConfig,
  Wn = 0,
  ge = null,
  we = null,
  Te = null,
  Hi = !1,
  dr = !1,
  Er = 0,
  Gf = 0;
function $e() {
  throw Error(F(321));
}
function Ho(t, n) {
  if (n === null) return !1;
  for (var s = 0; s < n.length && s < t.length; s++)
    if (!bt(t[s], n[s])) return !1;
  return !0;
}
function Go(t, n, s, r, i, a) {
  if (
    ((Wn = a),
    (ge = n),
    (n.memoizedState = null),
    (n.updateQueue = null),
    (n.lanes = 0),
    (gi.current = t === null || t.memoizedState === null ? Yf : qf),
    (t = s(r, i)),
    dr)
  ) {
    a = 0;
    do {
      if (((dr = !1), (Er = 0), 25 <= a)) throw Error(F(301));
      (a += 1),
        (Te = we = null),
        (n.updateQueue = null),
        (gi.current = Zf),
        (t = s(r, i));
    } while (dr);
  }
  if (
    ((gi.current = Gi),
    (n = we !== null && we.next !== null),
    (Wn = 0),
    (Te = we = ge = null),
    (Hi = !1),
    n)
  )
    throw Error(F(300));
  return t;
}
function Wo() {
  var t = Er !== 0;
  return (Er = 0), t;
}
function Pt() {
  var t = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null,
  };
  return Te === null ? (ge.memoizedState = Te = t) : (Te = Te.next = t), Te;
}
function xt() {
  if (we === null) {
    var t = ge.alternate;
    t = t !== null ? t.memoizedState : null;
  } else t = we.next;
  var n = Te === null ? ge.memoizedState : Te.next;
  if (n !== null) (Te = n), (we = t);
  else {
    if (t === null) throw Error(F(310));
    (we = t),
      (t = {
        memoizedState: we.memoizedState,
        baseState: we.baseState,
        baseQueue: we.baseQueue,
        queue: we.queue,
        next: null,
      }),
      Te === null ? (ge.memoizedState = Te = t) : (Te = Te.next = t);
  }
  return Te;
}
function Tr(t, n) {
  return typeof n == "function" ? n(t) : n;
}
function Qa(t) {
  var n = xt(),
    s = n.queue;
  if (s === null) throw Error(F(311));
  s.lastRenderedReducer = t;
  var r = we,
    i = r.baseQueue,
    a = s.pending;
  if (a !== null) {
    if (i !== null) {
      var l = i.next;
      (i.next = a.next), (a.next = l);
    }
    (r.baseQueue = i = a), (s.pending = null);
  }
  if (i !== null) {
    (a = i.next), (r = r.baseState);
    var o = (l = null),
      c = null,
      d = a;
    do {
      var u = d.lane;
      if ((Wn & u) === u)
        c !== null &&
          (c = c.next =
            {
              lane: 0,
              action: d.action,
              hasEagerState: d.hasEagerState,
              eagerState: d.eagerState,
              next: null,
            }),
          (r = d.hasEagerState ? d.eagerState : t(r, d.action));
      else {
        var m = {
          lane: u,
          action: d.action,
          hasEagerState: d.hasEagerState,
          eagerState: d.eagerState,
          next: null,
        };
        c === null ? ((o = c = m), (l = r)) : (c = c.next = m),
          (ge.lanes |= u),
          (Kn |= u);
      }
      d = d.next;
    } while (d !== null && d !== a);
    c === null ? (l = r) : (c.next = o),
      bt(r, n.memoizedState) || (Ze = !0),
      (n.memoizedState = r),
      (n.baseState = l),
      (n.baseQueue = c),
      (s.lastRenderedState = r);
  }
  if (((t = s.interleaved), t !== null)) {
    i = t;
    do (a = i.lane), (ge.lanes |= a), (Kn |= a), (i = i.next);
    while (i !== t);
  } else i === null && (s.lanes = 0);
  return [n.memoizedState, s.dispatch];
}
function Ya(t) {
  var n = xt(),
    s = n.queue;
  if (s === null) throw Error(F(311));
  s.lastRenderedReducer = t;
  var r = s.dispatch,
    i = s.pending,
    a = n.memoizedState;
  if (i !== null) {
    s.pending = null;
    var l = (i = i.next);
    do (a = t(a, l.action)), (l = l.next);
    while (l !== i);
    bt(a, n.memoizedState) || (Ze = !0),
      (n.memoizedState = a),
      n.baseQueue === null && (n.baseState = a),
      (s.lastRenderedState = a);
  }
  return [a, r];
}
function xh() {}
function jh(t, n) {
  var s = ge,
    r = xt(),
    i = n(),
    a = !bt(r.memoizedState, i);
  if (
    (a && ((r.memoizedState = i), (Ze = !0)),
    (r = r.queue),
    Ko(yh.bind(null, s, r, t), [t]),
    r.getSnapshot !== n || a || (Te !== null && Te.memoizedState.tag & 1))
  ) {
    if (
      ((s.flags |= 2048),
      Pr(9, gh.bind(null, s, r, i, n), void 0, null),
      Ie === null)
    )
      throw Error(F(349));
    Wn & 30 || vh(s, n, i);
  }
  return i;
}
function vh(t, n, s) {
  (t.flags |= 16384),
    (t = { getSnapshot: n, value: s }),
    (n = ge.updateQueue),
    n === null
      ? ((n = { lastEffect: null, stores: null }),
        (ge.updateQueue = n),
        (n.stores = [t]))
      : ((s = n.stores), s === null ? (n.stores = [t]) : s.push(t));
}
function gh(t, n, s, r) {
  (n.value = s), (n.getSnapshot = r), Nh(n) && kh(t);
}
function yh(t, n, s) {
  return s(function () {
    Nh(n) && kh(t);
  });
}
function Nh(t) {
  var n = t.getSnapshot;
  t = t.value;
  try {
    var s = n();
    return !bt(t, s);
  } catch {
    return !0;
  }
}
function kh(t) {
  var n = qt(t, 1);
  n !== null && Ct(n, t, 1, -1);
}
function rd(t) {
  var n = Pt();
  return (
    typeof t == "function" && (t = t()),
    (n.memoizedState = n.baseState = t),
    (t = {
      pending: null,
      interleaved: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: Tr,
      lastRenderedState: t,
    }),
    (n.queue = t),
    (t = t.dispatch = Qf.bind(null, ge, t)),
    [n.memoizedState, t]
  );
}
function Pr(t, n, s, r) {
  return (
    (t = { tag: t, create: n, destroy: s, deps: r, next: null }),
    (n = ge.updateQueue),
    n === null
      ? ((n = { lastEffect: null, stores: null }),
        (ge.updateQueue = n),
        (n.lastEffect = t.next = t))
      : ((s = n.lastEffect),
        s === null
          ? (n.lastEffect = t.next = t)
          : ((r = s.next), (s.next = t), (t.next = r), (n.lastEffect = t))),
    t
  );
}
function Sh() {
  return xt().memoizedState;
}
function yi(t, n, s, r) {
  var i = Pt();
  (ge.flags |= t),
    (i.memoizedState = Pr(1 | n, s, void 0, r === void 0 ? null : r));
}
function la(t, n, s, r) {
  var i = xt();
  r = r === void 0 ? null : r;
  var a = void 0;
  if (we !== null) {
    var l = we.memoizedState;
    if (((a = l.destroy), r !== null && Ho(r, l.deps))) {
      i.memoizedState = Pr(n, s, a, r);
      return;
    }
  }
  (ge.flags |= t), (i.memoizedState = Pr(1 | n, s, a, r));
}
function id(t, n) {
  return yi(8390656, 8, t, n);
}
function Ko(t, n) {
  return la(2048, 8, t, n);
}
function Ch(t, n) {
  return la(4, 2, t, n);
}
function bh(t, n) {
  return la(4, 4, t, n);
}
function wh(t, n) {
  if (typeof n == "function")
    return (
      (t = t()),
      n(t),
      function () {
        n(null);
      }
    );
  if (n != null)
    return (
      (t = t()),
      (n.current = t),
      function () {
        n.current = null;
      }
    );
}
function Ah(t, n, s) {
  return (
    (s = s != null ? s.concat([t]) : null), la(4, 4, wh.bind(null, n, t), s)
  );
}
function Qo() {}
function Eh(t, n) {
  var s = xt();
  n = n === void 0 ? null : n;
  var r = s.memoizedState;
  return r !== null && n !== null && Ho(n, r[1])
    ? r[0]
    : ((s.memoizedState = [t, n]), t);
}
function Th(t, n) {
  var s = xt();
  n = n === void 0 ? null : n;
  var r = s.memoizedState;
  return r !== null && n !== null && Ho(n, r[1])
    ? r[0]
    : ((t = t()), (s.memoizedState = [t, n]), t);
}
function Ph(t, n, s) {
  return Wn & 21
    ? (bt(s, n) || ((s = Mu()), (ge.lanes |= s), (Kn |= s), (t.baseState = !0)),
      n)
    : (t.baseState && ((t.baseState = !1), (Ze = !0)), (t.memoizedState = s));
}
function Wf(t, n) {
  var s = re;
  (re = s !== 0 && 4 > s ? s : 4), t(!0);
  var r = Ka.transition;
  Ka.transition = {};
  try {
    t(!1), n();
  } finally {
    (re = s), (Ka.transition = r);
  }
}
function Ih() {
  return xt().memoizedState;
}
function Kf(t, n, s) {
  var r = vn(t);
  if (
    ((s = {
      lane: r,
      action: s,
      hasEagerState: !1,
      eagerState: null,
      next: null,
    }),
    zh(t))
  )
    Oh(n, s);
  else if (((s = ph(t, n, s, r)), s !== null)) {
    var i = Ge();
    Ct(s, t, r, i), Rh(s, n, r);
  }
}
function Qf(t, n, s) {
  var r = vn(t),
    i = { lane: r, action: s, hasEagerState: !1, eagerState: null, next: null };
  if (zh(t)) Oh(n, i);
  else {
    var a = t.alternate;
    if (
      t.lanes === 0 &&
      (a === null || a.lanes === 0) &&
      ((a = n.lastRenderedReducer), a !== null)
    )
      try {
        var l = n.lastRenderedState,
          o = a(l, s);
        if (((i.hasEagerState = !0), (i.eagerState = o), bt(o, l))) {
          var c = n.interleaved;
          c === null
            ? ((i.next = i), Lo(n))
            : ((i.next = c.next), (c.next = i)),
            (n.interleaved = i);
          return;
        }
      } catch {
      } finally {
      }
    (s = ph(t, n, i, r)),
      s !== null && ((i = Ge()), Ct(s, t, r, i), Rh(s, n, r));
  }
}
function zh(t) {
  var n = t.alternate;
  return t === ge || (n !== null && n === ge);
}
function Oh(t, n) {
  dr = Hi = !0;
  var s = t.pending;
  s === null ? (n.next = n) : ((n.next = s.next), (s.next = n)),
    (t.pending = n);
}
function Rh(t, n, s) {
  if (s & 4194240) {
    var r = n.lanes;
    (r &= t.pendingLanes), (s |= r), (n.lanes = s), bo(t, s);
  }
}
var Gi = {
    readContext: ft,
    useCallback: $e,
    useContext: $e,
    useEffect: $e,
    useImperativeHandle: $e,
    useInsertionEffect: $e,
    useLayoutEffect: $e,
    useMemo: $e,
    useReducer: $e,
    useRef: $e,
    useState: $e,
    useDebugValue: $e,
    useDeferredValue: $e,
    useTransition: $e,
    useMutableSource: $e,
    useSyncExternalStore: $e,
    useId: $e,
    unstable_isNewReconciler: !1,
  },
  Yf = {
    readContext: ft,
    useCallback: function (t, n) {
      return (Pt().memoizedState = [t, n === void 0 ? null : n]), t;
    },
    useContext: ft,
    useEffect: id,
    useImperativeHandle: function (t, n, s) {
      return (
        (s = s != null ? s.concat([t]) : null),
        yi(4194308, 4, wh.bind(null, n, t), s)
      );
    },
    useLayoutEffect: function (t, n) {
      return yi(4194308, 4, t, n);
    },
    useInsertionEffect: function (t, n) {
      return yi(4, 2, t, n);
    },
    useMemo: function (t, n) {
      var s = Pt();
      return (
        (n = n === void 0 ? null : n), (t = t()), (s.memoizedState = [t, n]), t
      );
    },
    useReducer: function (t, n, s) {
      var r = Pt();
      return (
        (n = s !== void 0 ? s(n) : n),
        (r.memoizedState = r.baseState = n),
        (t = {
          pending: null,
          interleaved: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: t,
          lastRenderedState: n,
        }),
        (r.queue = t),
        (t = t.dispatch = Kf.bind(null, ge, t)),
        [r.memoizedState, t]
      );
    },
    useRef: function (t) {
      var n = Pt();
      return (t = { current: t }), (n.memoizedState = t);
    },
    useState: rd,
    useDebugValue: Qo,
    useDeferredValue: function (t) {
      return (Pt().memoizedState = t);
    },
    useTransition: function () {
      var t = rd(!1),
        n = t[0];
      return (t = Wf.bind(null, t[1])), (Pt().memoizedState = t), [n, t];
    },
    useMutableSource: function () {},
    useSyncExternalStore: function (t, n, s) {
      var r = ge,
        i = Pt();
      if (me) {
        if (s === void 0) throw Error(F(407));
        s = s();
      } else {
        if (((s = n()), Ie === null)) throw Error(F(349));
        Wn & 30 || vh(r, n, s);
      }
      i.memoizedState = s;
      var a = { value: s, getSnapshot: n };
      return (
        (i.queue = a),
        id(yh.bind(null, r, a, t), [t]),
        (r.flags |= 2048),
        Pr(9, gh.bind(null, r, a, s, n), void 0, null),
        s
      );
    },
    useId: function () {
      var t = Pt(),
        n = Ie.identifierPrefix;
      if (me) {
        var s = Ht,
          r = Bt;
        (s = (r & ~(1 << (32 - St(r) - 1))).toString(32) + s),
          (n = ":" + n + "R" + s),
          (s = Er++),
          0 < s && (n += "H" + s.toString(32)),
          (n += ":");
      } else (s = Gf++), (n = ":" + n + "r" + s.toString(32) + ":");
      return (t.memoizedState = n);
    },
    unstable_isNewReconciler: !1,
  },
  qf = {
    readContext: ft,
    useCallback: Eh,
    useContext: ft,
    useEffect: Ko,
    useImperativeHandle: Ah,
    useInsertionEffect: Ch,
    useLayoutEffect: bh,
    useMemo: Th,
    useReducer: Qa,
    useRef: Sh,
    useState: function () {
      return Qa(Tr);
    },
    useDebugValue: Qo,
    useDeferredValue: function (t) {
      var n = xt();
      return Ph(n, we.memoizedState, t);
    },
    useTransition: function () {
      var t = Qa(Tr)[0],
        n = xt().memoizedState;
      return [t, n];
    },
    useMutableSource: xh,
    useSyncExternalStore: jh,
    useId: Ih,
    unstable_isNewReconciler: !1,
  },
  Zf = {
    readContext: ft,
    useCallback: Eh,
    useContext: ft,
    useEffect: Ko,
    useImperativeHandle: Ah,
    useInsertionEffect: Ch,
    useLayoutEffect: bh,
    useMemo: Th,
    useReducer: Ya,
    useRef: Sh,
    useState: function () {
      return Ya(Tr);
    },
    useDebugValue: Qo,
    useDeferredValue: function (t) {
      var n = xt();
      return we === null ? (n.memoizedState = t) : Ph(n, we.memoizedState, t);
    },
    useTransition: function () {
      var t = Ya(Tr)[0],
        n = xt().memoizedState;
      return [t, n];
    },
    useMutableSource: xh,
    useSyncExternalStore: jh,
    useId: Ih,
    unstable_isNewReconciler: !1,
  };
function vt(t, n) {
  if (t && t.defaultProps) {
    (n = ye({}, n)), (t = t.defaultProps);
    for (var s in t) n[s] === void 0 && (n[s] = t[s]);
    return n;
  }
  return n;
}
function Ul(t, n, s, r) {
  (n = t.memoizedState),
    (s = s(r, n)),
    (s = s == null ? n : ye({}, n, s)),
    (t.memoizedState = s),
    t.lanes === 0 && (t.updateQueue.baseState = s);
}
var oa = {
  isMounted: function (t) {
    return (t = t._reactInternals) ? Zn(t) === t : !1;
  },
  enqueueSetState: function (t, n, s) {
    t = t._reactInternals;
    var r = Ge(),
      i = vn(t),
      a = Gt(r, i);
    (a.payload = n),
      s != null && (a.callback = s),
      (n = xn(t, a, i)),
      n !== null && (Ct(n, t, i, r), vi(n, t, i));
  },
  enqueueReplaceState: function (t, n, s) {
    t = t._reactInternals;
    var r = Ge(),
      i = vn(t),
      a = Gt(r, i);
    (a.tag = 1),
      (a.payload = n),
      s != null && (a.callback = s),
      (n = xn(t, a, i)),
      n !== null && (Ct(n, t, i, r), vi(n, t, i));
  },
  enqueueForceUpdate: function (t, n) {
    t = t._reactInternals;
    var s = Ge(),
      r = vn(t),
      i = Gt(s, r);
    (i.tag = 2),
      n != null && (i.callback = n),
      (n = xn(t, i, r)),
      n !== null && (Ct(n, t, r, s), vi(n, t, r));
  },
};
function ad(t, n, s, r, i, a, l) {
  return (
    (t = t.stateNode),
    typeof t.shouldComponentUpdate == "function"
      ? t.shouldComponentUpdate(r, a, l)
      : n.prototype && n.prototype.isPureReactComponent
        ? !kr(s, r) || !kr(i, a)
        : !0
  );
}
function Mh(t, n, s) {
  var r = !1,
    i = kn,
    a = n.contextType;
  return (
    typeof a == "object" && a !== null
      ? (a = ft(a))
      : ((i = Je(n) ? Hn : Ue.current),
        (r = n.contextTypes),
        (a = (r = r != null) ? As(t, i) : kn)),
    (n = new n(s, a)),
    (t.memoizedState = n.state !== null && n.state !== void 0 ? n.state : null),
    (n.updater = oa),
    (t.stateNode = n),
    (n._reactInternals = t),
    r &&
      ((t = t.stateNode),
      (t.__reactInternalMemoizedUnmaskedChildContext = i),
      (t.__reactInternalMemoizedMaskedChildContext = a)),
    n
  );
}
function ld(t, n, s, r) {
  (t = n.state),
    typeof n.componentWillReceiveProps == "function" &&
      n.componentWillReceiveProps(s, r),
    typeof n.UNSAFE_componentWillReceiveProps == "function" &&
      n.UNSAFE_componentWillReceiveProps(s, r),
    n.state !== t && oa.enqueueReplaceState(n, n.state, null);
}
function Vl(t, n, s, r) {
  var i = t.stateNode;
  (i.props = s), (i.state = t.memoizedState), (i.refs = {}), Fo(t);
  var a = n.contextType;
  typeof a == "object" && a !== null
    ? (i.context = ft(a))
    : ((a = Je(n) ? Hn : Ue.current), (i.context = As(t, a))),
    (i.state = t.memoizedState),
    (a = n.getDerivedStateFromProps),
    typeof a == "function" && (Ul(t, n, a, s), (i.state = t.memoizedState)),
    typeof n.getDerivedStateFromProps == "function" ||
      typeof i.getSnapshotBeforeUpdate == "function" ||
      (typeof i.UNSAFE_componentWillMount != "function" &&
        typeof i.componentWillMount != "function") ||
      ((n = i.state),
      typeof i.componentWillMount == "function" && i.componentWillMount(),
      typeof i.UNSAFE_componentWillMount == "function" &&
        i.UNSAFE_componentWillMount(),
      n !== i.state && oa.enqueueReplaceState(i, i.state, null),
      Vi(t, s, i, r),
      (i.state = t.memoizedState)),
    typeof i.componentDidMount == "function" && (t.flags |= 4194308);
}
function Is(t, n) {
  try {
    var s = "",
      r = n;
    do (s += Cm(r)), (r = r.return);
    while (r);
    var i = s;
  } catch (a) {
    i =
      `
Error generating stack: ` +
      a.message +
      `
` +
      a.stack;
  }
  return { value: t, source: n, stack: i, digest: null };
}
function qa(t, n, s) {
  return { value: t, source: null, stack: s ?? null, digest: n ?? null };
}
function Bl(t, n) {
  try {
    console.error(n.value);
  } catch (s) {
    setTimeout(function () {
      throw s;
    });
  }
}
var Xf = typeof WeakMap == "function" ? WeakMap : Map;
function Dh(t, n, s) {
  (s = Gt(-1, s)), (s.tag = 3), (s.payload = { element: null });
  var r = n.value;
  return (
    (s.callback = function () {
      Ki || ((Ki = !0), (Jl = r)), Bl(t, n);
    }),
    s
  );
}
function _h(t, n, s) {
  (s = Gt(-1, s)), (s.tag = 3);
  var r = t.type.getDerivedStateFromError;
  if (typeof r == "function") {
    var i = n.value;
    (s.payload = function () {
      return r(i);
    }),
      (s.callback = function () {
        Bl(t, n);
      });
  }
  var a = t.stateNode;
  return (
    a !== null &&
      typeof a.componentDidCatch == "function" &&
      (s.callback = function () {
        Bl(t, n),
          typeof r != "function" &&
            (jn === null ? (jn = new Set([this])) : jn.add(this));
        var l = n.stack;
        this.componentDidCatch(n.value, {
          componentStack: l !== null ? l : "",
        });
      }),
    s
  );
}
function od(t, n, s) {
  var r = t.pingCache;
  if (r === null) {
    r = t.pingCache = new Xf();
    var i = new Set();
    r.set(n, i);
  } else (i = r.get(n)), i === void 0 && ((i = new Set()), r.set(n, i));
  i.has(s) || (i.add(s), (t = hx.bind(null, t, n, s)), n.then(t, t));
}
function cd(t) {
  do {
    var n;
    if (
      ((n = t.tag === 13) &&
        ((n = t.memoizedState), (n = n !== null ? n.dehydrated !== null : !0)),
      n)
    )
      return t;
    t = t.return;
  } while (t !== null);
  return null;
}
function dd(t, n, s, r, i) {
  return t.mode & 1
    ? ((t.flags |= 65536), (t.lanes = i), t)
    : (t === n
        ? (t.flags |= 65536)
        : ((t.flags |= 128),
          (s.flags |= 131072),
          (s.flags &= -52805),
          s.tag === 1 &&
            (s.alternate === null
              ? (s.tag = 17)
              : ((n = Gt(-1, 1)), (n.tag = 2), xn(s, n, 1))),
          (s.lanes |= 1)),
      t);
}
var Jf = tn.ReactCurrentOwner,
  Ze = !1;
function Be(t, n, s, r) {
  n.child = t === null ? hh(n, null, s, r) : Ts(n, t.child, s, r);
}
function ud(t, n, s, r, i) {
  s = s.render;
  var a = n.ref;
  return (
    Ns(n, i),
    (r = Go(t, n, s, r, a, i)),
    (s = Wo()),
    t !== null && !Ze
      ? ((n.updateQueue = t.updateQueue),
        (n.flags &= -2053),
        (t.lanes &= ~i),
        Zt(t, n, i))
      : (me && s && Oo(n), (n.flags |= 1), Be(t, n, r, i), n.child)
  );
}
function hd(t, n, s, r, i) {
  if (t === null) {
    var a = s.type;
    return typeof a == "function" &&
      !nc(a) &&
      a.defaultProps === void 0 &&
      s.compare === null &&
      s.defaultProps === void 0
      ? ((n.tag = 15), (n.type = a), $h(t, n, a, r, i))
      : ((t = Ci(s.type, null, r, n, n.mode, i)),
        (t.ref = n.ref),
        (t.return = n),
        (n.child = t));
  }
  if (((a = t.child), !(t.lanes & i))) {
    var l = a.memoizedProps;
    if (
      ((s = s.compare), (s = s !== null ? s : kr), s(l, r) && t.ref === n.ref)
    )
      return Zt(t, n, i);
  }
  return (
    (n.flags |= 1),
    (t = gn(a, r)),
    (t.ref = n.ref),
    (t.return = n),
    (n.child = t)
  );
}
function $h(t, n, s, r, i) {
  if (t !== null) {
    var a = t.memoizedProps;
    if (kr(a, r) && t.ref === n.ref)
      if (((Ze = !1), (n.pendingProps = r = a), (t.lanes & i) !== 0))
        t.flags & 131072 && (Ze = !0);
      else return (n.lanes = t.lanes), Zt(t, n, i);
  }
  return Hl(t, n, s, r, i);
}
function Lh(t, n, s) {
  var r = n.pendingProps,
    i = r.children,
    a = t !== null ? t.memoizedState : null;
  if (r.mode === "hidden")
    if (!(n.mode & 1))
      (n.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
        oe(xs, st),
        (st |= s);
    else {
      if (!(s & 1073741824))
        return (
          (t = a !== null ? a.baseLanes | s : s),
          (n.lanes = n.childLanes = 1073741824),
          (n.memoizedState = {
            baseLanes: t,
            cachePool: null,
            transitions: null,
          }),
          (n.updateQueue = null),
          oe(xs, st),
          (st |= t),
          null
        );
      (n.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
        (r = a !== null ? a.baseLanes : s),
        oe(xs, st),
        (st |= r);
    }
  else
    a !== null ? ((r = a.baseLanes | s), (n.memoizedState = null)) : (r = s),
      oe(xs, st),
      (st |= r);
  return Be(t, n, i, s), n.child;
}
function Fh(t, n) {
  var s = n.ref;
  ((t === null && s !== null) || (t !== null && t.ref !== s)) &&
    ((n.flags |= 512), (n.flags |= 2097152));
}
function Hl(t, n, s, r, i) {
  var a = Je(s) ? Hn : Ue.current;
  return (
    (a = As(n, a)),
    Ns(n, i),
    (s = Go(t, n, s, r, a, i)),
    (r = Wo()),
    t !== null && !Ze
      ? ((n.updateQueue = t.updateQueue),
        (n.flags &= -2053),
        (t.lanes &= ~i),
        Zt(t, n, i))
      : (me && r && Oo(n), (n.flags |= 1), Be(t, n, s, i), n.child)
  );
}
function pd(t, n, s, r, i) {
  if (Je(s)) {
    var a = !0;
    _i(n);
  } else a = !1;
  if ((Ns(n, i), n.stateNode === null))
    Ni(t, n), Mh(n, s, r), Vl(n, s, r, i), (r = !0);
  else if (t === null) {
    var l = n.stateNode,
      o = n.memoizedProps;
    l.props = o;
    var c = l.context,
      d = s.contextType;
    typeof d == "object" && d !== null
      ? (d = ft(d))
      : ((d = Je(s) ? Hn : Ue.current), (d = As(n, d)));
    var u = s.getDerivedStateFromProps,
      m =
        typeof u == "function" ||
        typeof l.getSnapshotBeforeUpdate == "function";
    m ||
      (typeof l.UNSAFE_componentWillReceiveProps != "function" &&
        typeof l.componentWillReceiveProps != "function") ||
      ((o !== r || c !== d) && ld(n, l, r, d)),
      (an = !1);
    var x = n.memoizedState;
    (l.state = x),
      Vi(n, r, l, i),
      (c = n.memoizedState),
      o !== r || x !== c || Xe.current || an
        ? (typeof u == "function" && (Ul(n, s, u, r), (c = n.memoizedState)),
          (o = an || ad(n, s, o, r, x, c, d))
            ? (m ||
                (typeof l.UNSAFE_componentWillMount != "function" &&
                  typeof l.componentWillMount != "function") ||
                (typeof l.componentWillMount == "function" &&
                  l.componentWillMount(),
                typeof l.UNSAFE_componentWillMount == "function" &&
                  l.UNSAFE_componentWillMount()),
              typeof l.componentDidMount == "function" && (n.flags |= 4194308))
            : (typeof l.componentDidMount == "function" && (n.flags |= 4194308),
              (n.memoizedProps = r),
              (n.memoizedState = c)),
          (l.props = r),
          (l.state = c),
          (l.context = d),
          (r = o))
        : (typeof l.componentDidMount == "function" && (n.flags |= 4194308),
          (r = !1));
  } else {
    (l = n.stateNode),
      mh(t, n),
      (o = n.memoizedProps),
      (d = n.type === n.elementType ? o : vt(n.type, o)),
      (l.props = d),
      (m = n.pendingProps),
      (x = l.context),
      (c = s.contextType),
      typeof c == "object" && c !== null
        ? (c = ft(c))
        : ((c = Je(s) ? Hn : Ue.current), (c = As(n, c)));
    var j = s.getDerivedStateFromProps;
    (u =
      typeof j == "function" ||
      typeof l.getSnapshotBeforeUpdate == "function") ||
      (typeof l.UNSAFE_componentWillReceiveProps != "function" &&
        typeof l.componentWillReceiveProps != "function") ||
      ((o !== m || x !== c) && ld(n, l, r, c)),
      (an = !1),
      (x = n.memoizedState),
      (l.state = x),
      Vi(n, r, l, i);
    var f = n.memoizedState;
    o !== m || x !== f || Xe.current || an
      ? (typeof j == "function" && (Ul(n, s, j, r), (f = n.memoizedState)),
        (d = an || ad(n, s, d, r, x, f, c) || !1)
          ? (u ||
              (typeof l.UNSAFE_componentWillUpdate != "function" &&
                typeof l.componentWillUpdate != "function") ||
              (typeof l.componentWillUpdate == "function" &&
                l.componentWillUpdate(r, f, c),
              typeof l.UNSAFE_componentWillUpdate == "function" &&
                l.UNSAFE_componentWillUpdate(r, f, c)),
            typeof l.componentDidUpdate == "function" && (n.flags |= 4),
            typeof l.getSnapshotBeforeUpdate == "function" && (n.flags |= 1024))
          : (typeof l.componentDidUpdate != "function" ||
              (o === t.memoizedProps && x === t.memoizedState) ||
              (n.flags |= 4),
            typeof l.getSnapshotBeforeUpdate != "function" ||
              (o === t.memoizedProps && x === t.memoizedState) ||
              (n.flags |= 1024),
            (n.memoizedProps = r),
            (n.memoizedState = f)),
        (l.props = r),
        (l.state = f),
        (l.context = c),
        (r = d))
      : (typeof l.componentDidUpdate != "function" ||
          (o === t.memoizedProps && x === t.memoizedState) ||
          (n.flags |= 4),
        typeof l.getSnapshotBeforeUpdate != "function" ||
          (o === t.memoizedProps && x === t.memoizedState) ||
          (n.flags |= 1024),
        (r = !1));
  }
  return Gl(t, n, s, r, a, i);
}
function Gl(t, n, s, r, i, a) {
  Fh(t, n);
  var l = (n.flags & 128) !== 0;
  if (!r && !l) return i && Xc(n, s, !1), Zt(t, n, a);
  (r = n.stateNode), (Jf.current = n);
  var o =
    l && typeof s.getDerivedStateFromError != "function" ? null : r.render();
  return (
    (n.flags |= 1),
    t !== null && l
      ? ((n.child = Ts(n, t.child, null, a)), (n.child = Ts(n, null, o, a)))
      : Be(t, n, o, a),
    (n.memoizedState = r.state),
    i && Xc(n, s, !0),
    n.child
  );
}
function Uh(t) {
  var n = t.stateNode;
  n.pendingContext
    ? Zc(t, n.pendingContext, n.pendingContext !== n.context)
    : n.context && Zc(t, n.context, !1),
    Uo(t, n.containerInfo);
}
function md(t, n, s, r, i) {
  return Es(), Mo(i), (n.flags |= 256), Be(t, n, s, r), n.child;
}
var Wl = { dehydrated: null, treeContext: null, retryLane: 0 };
function Kl(t) {
  return { baseLanes: t, cachePool: null, transitions: null };
}
function Vh(t, n, s) {
  var r = n.pendingProps,
    i = xe.current,
    a = !1,
    l = (n.flags & 128) !== 0,
    o;
  if (
    ((o = l) ||
      (o = t !== null && t.memoizedState === null ? !1 : (i & 2) !== 0),
    o
      ? ((a = !0), (n.flags &= -129))
      : (t === null || t.memoizedState !== null) && (i |= 1),
    oe(xe, i & 1),
    t === null)
  )
    return (
      Ll(n),
      (t = n.memoizedState),
      t !== null && ((t = t.dehydrated), t !== null)
        ? (n.mode & 1
            ? t.data === "$!"
              ? (n.lanes = 8)
              : (n.lanes = 1073741824)
            : (n.lanes = 1),
          null)
        : ((l = r.children),
          (t = r.fallback),
          a
            ? ((r = n.mode),
              (a = n.child),
              (l = { mode: "hidden", children: l }),
              !(r & 1) && a !== null
                ? ((a.childLanes = 0), (a.pendingProps = l))
                : (a = ua(l, r, 0, null)),
              (t = Un(t, r, s, null)),
              (a.return = n),
              (t.return = n),
              (a.sibling = t),
              (n.child = a),
              (n.child.memoizedState = Kl(s)),
              (n.memoizedState = Wl),
              t)
            : Yo(n, l))
    );
  if (((i = t.memoizedState), i !== null && ((o = i.dehydrated), o !== null)))
    return ex(t, n, l, r, o, i, s);
  if (a) {
    (a = r.fallback), (l = n.mode), (i = t.child), (o = i.sibling);
    var c = { mode: "hidden", children: r.children };
    return (
      !(l & 1) && n.child !== i
        ? ((r = n.child),
          (r.childLanes = 0),
          (r.pendingProps = c),
          (n.deletions = null))
        : ((r = gn(i, c)), (r.subtreeFlags = i.subtreeFlags & 14680064)),
      o !== null ? (a = gn(o, a)) : ((a = Un(a, l, s, null)), (a.flags |= 2)),
      (a.return = n),
      (r.return = n),
      (r.sibling = a),
      (n.child = r),
      (r = a),
      (a = n.child),
      (l = t.child.memoizedState),
      (l =
        l === null
          ? Kl(s)
          : {
              baseLanes: l.baseLanes | s,
              cachePool: null,
              transitions: l.transitions,
            }),
      (a.memoizedState = l),
      (a.childLanes = t.childLanes & ~s),
      (n.memoizedState = Wl),
      r
    );
  }
  return (
    (a = t.child),
    (t = a.sibling),
    (r = gn(a, { mode: "visible", children: r.children })),
    !(n.mode & 1) && (r.lanes = s),
    (r.return = n),
    (r.sibling = null),
    t !== null &&
      ((s = n.deletions),
      s === null ? ((n.deletions = [t]), (n.flags |= 16)) : s.push(t)),
    (n.child = r),
    (n.memoizedState = null),
    r
  );
}
function Yo(t, n) {
  return (
    (n = ua({ mode: "visible", children: n }, t.mode, 0, null)),
    (n.return = t),
    (t.child = n)
  );
}
function ri(t, n, s, r) {
  return (
    r !== null && Mo(r),
    Ts(n, t.child, null, s),
    (t = Yo(n, n.pendingProps.children)),
    (t.flags |= 2),
    (n.memoizedState = null),
    t
  );
}
function ex(t, n, s, r, i, a, l) {
  if (s)
    return n.flags & 256
      ? ((n.flags &= -257), (r = qa(Error(F(422)))), ri(t, n, l, r))
      : n.memoizedState !== null
        ? ((n.child = t.child), (n.flags |= 128), null)
        : ((a = r.fallback),
          (i = n.mode),
          (r = ua({ mode: "visible", children: r.children }, i, 0, null)),
          (a = Un(a, i, l, null)),
          (a.flags |= 2),
          (r.return = n),
          (a.return = n),
          (r.sibling = a),
          (n.child = r),
          n.mode & 1 && Ts(n, t.child, null, l),
          (n.child.memoizedState = Kl(l)),
          (n.memoizedState = Wl),
          a);
  if (!(n.mode & 1)) return ri(t, n, l, null);
  if (i.data === "$!") {
    if (((r = i.nextSibling && i.nextSibling.dataset), r)) var o = r.dgst;
    return (r = o), (a = Error(F(419))), (r = qa(a, r, void 0)), ri(t, n, l, r);
  }
  if (((o = (l & t.childLanes) !== 0), Ze || o)) {
    if (((r = Ie), r !== null)) {
      switch (l & -l) {
        case 4:
          i = 2;
          break;
        case 16:
          i = 8;
          break;
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
          i = 32;
          break;
        case 536870912:
          i = 268435456;
          break;
        default:
          i = 0;
      }
      (i = i & (r.suspendedLanes | l) ? 0 : i),
        i !== 0 &&
          i !== a.retryLane &&
          ((a.retryLane = i), qt(t, i), Ct(r, t, i, -1));
    }
    return tc(), (r = qa(Error(F(421)))), ri(t, n, l, r);
  }
  return i.data === "$?"
    ? ((n.flags |= 128),
      (n.child = t.child),
      (n = px.bind(null, t)),
      (i._reactRetry = n),
      null)
    : ((t = a.treeContext),
      (rt = fn(i.nextSibling)),
      (it = n),
      (me = !0),
      (kt = null),
      t !== null &&
        ((dt[ut++] = Bt),
        (dt[ut++] = Ht),
        (dt[ut++] = Gn),
        (Bt = t.id),
        (Ht = t.overflow),
        (Gn = n)),
      (n = Yo(n, r.children)),
      (n.flags |= 4096),
      n);
}
function fd(t, n, s) {
  t.lanes |= n;
  var r = t.alternate;
  r !== null && (r.lanes |= n), Fl(t.return, n, s);
}
function Za(t, n, s, r, i) {
  var a = t.memoizedState;
  a === null
    ? (t.memoizedState = {
        isBackwards: n,
        rendering: null,
        renderingStartTime: 0,
        last: r,
        tail: s,
        tailMode: i,
      })
    : ((a.isBackwards = n),
      (a.rendering = null),
      (a.renderingStartTime = 0),
      (a.last = r),
      (a.tail = s),
      (a.tailMode = i));
}
function Bh(t, n, s) {
  var r = n.pendingProps,
    i = r.revealOrder,
    a = r.tail;
  if ((Be(t, n, r.children, s), (r = xe.current), r & 2))
    (r = (r & 1) | 2), (n.flags |= 128);
  else {
    if (t !== null && t.flags & 128)
      e: for (t = n.child; t !== null; ) {
        if (t.tag === 13) t.memoizedState !== null && fd(t, s, n);
        else if (t.tag === 19) fd(t, s, n);
        else if (t.child !== null) {
          (t.child.return = t), (t = t.child);
          continue;
        }
        if (t === n) break e;
        for (; t.sibling === null; ) {
          if (t.return === null || t.return === n) break e;
          t = t.return;
        }
        (t.sibling.return = t.return), (t = t.sibling);
      }
    r &= 1;
  }
  if ((oe(xe, r), !(n.mode & 1))) n.memoizedState = null;
  else
    switch (i) {
      case "forwards":
        for (s = n.child, i = null; s !== null; )
          (t = s.alternate),
            t !== null && Bi(t) === null && (i = s),
            (s = s.sibling);
        (s = i),
          s === null
            ? ((i = n.child), (n.child = null))
            : ((i = s.sibling), (s.sibling = null)),
          Za(n, !1, i, s, a);
        break;
      case "backwards":
        for (s = null, i = n.child, n.child = null; i !== null; ) {
          if (((t = i.alternate), t !== null && Bi(t) === null)) {
            n.child = i;
            break;
          }
          (t = i.sibling), (i.sibling = s), (s = i), (i = t);
        }
        Za(n, !0, s, null, a);
        break;
      case "together":
        Za(n, !1, null, null, void 0);
        break;
      default:
        n.memoizedState = null;
    }
  return n.child;
}
function Ni(t, n) {
  !(n.mode & 1) &&
    t !== null &&
    ((t.alternate = null), (n.alternate = null), (n.flags |= 2));
}
function Zt(t, n, s) {
  if (
    (t !== null && (n.dependencies = t.dependencies),
    (Kn |= n.lanes),
    !(s & n.childLanes))
  )
    return null;
  if (t !== null && n.child !== t.child) throw Error(F(153));
  if (n.child !== null) {
    for (
      t = n.child, s = gn(t, t.pendingProps), n.child = s, s.return = n;
      t.sibling !== null;

    )
      (t = t.sibling), (s = s.sibling = gn(t, t.pendingProps)), (s.return = n);
    s.sibling = null;
  }
  return n.child;
}
function tx(t, n, s) {
  switch (n.tag) {
    case 3:
      Uh(n), Es();
      break;
    case 5:
      fh(n);
      break;
    case 1:
      Je(n.type) && _i(n);
      break;
    case 4:
      Uo(n, n.stateNode.containerInfo);
      break;
    case 10:
      var r = n.type._context,
        i = n.memoizedProps.value;
      oe(Fi, r._currentValue), (r._currentValue = i);
      break;
    case 13:
      if (((r = n.memoizedState), r !== null))
        return r.dehydrated !== null
          ? (oe(xe, xe.current & 1), (n.flags |= 128), null)
          : s & n.child.childLanes
            ? Vh(t, n, s)
            : (oe(xe, xe.current & 1),
              (t = Zt(t, n, s)),
              t !== null ? t.sibling : null);
      oe(xe, xe.current & 1);
      break;
    case 19:
      if (((r = (s & n.childLanes) !== 0), t.flags & 128)) {
        if (r) return Bh(t, n, s);
        n.flags |= 128;
      }
      if (
        ((i = n.memoizedState),
        i !== null &&
          ((i.rendering = null), (i.tail = null), (i.lastEffect = null)),
        oe(xe, xe.current),
        r)
      )
        break;
      return null;
    case 22:
    case 23:
      return (n.lanes = 0), Lh(t, n, s);
  }
  return Zt(t, n, s);
}
var Hh, Ql, Gh, Wh;
Hh = function (t, n) {
  for (var s = n.child; s !== null; ) {
    if (s.tag === 5 || s.tag === 6) t.appendChild(s.stateNode);
    else if (s.tag !== 4 && s.child !== null) {
      (s.child.return = s), (s = s.child);
      continue;
    }
    if (s === n) break;
    for (; s.sibling === null; ) {
      if (s.return === null || s.return === n) return;
      s = s.return;
    }
    (s.sibling.return = s.return), (s = s.sibling);
  }
};
Ql = function () {};
Gh = function (t, n, s, r) {
  var i = t.memoizedProps;
  if (i !== r) {
    (t = n.stateNode), _n(Rt.current);
    var a = null;
    switch (s) {
      case "input":
        (i = xl(t, i)), (r = xl(t, r)), (a = []);
        break;
      case "select":
        (i = ye({}, i, { value: void 0 })),
          (r = ye({}, r, { value: void 0 })),
          (a = []);
        break;
      case "textarea":
        (i = gl(t, i)), (r = gl(t, r)), (a = []);
        break;
      default:
        typeof i.onClick != "function" &&
          typeof r.onClick == "function" &&
          (t.onclick = Mi);
    }
    Nl(s, r);
    var l;
    s = null;
    for (d in i)
      if (!r.hasOwnProperty(d) && i.hasOwnProperty(d) && i[d] != null)
        if (d === "style") {
          var o = i[d];
          for (l in o) o.hasOwnProperty(l) && (s || (s = {}), (s[l] = ""));
        } else
          d !== "dangerouslySetInnerHTML" &&
            d !== "children" &&
            d !== "suppressContentEditableWarning" &&
            d !== "suppressHydrationWarning" &&
            d !== "autoFocus" &&
            (fr.hasOwnProperty(d)
              ? a || (a = [])
              : (a = a || []).push(d, null));
    for (d in r) {
      var c = r[d];
      if (
        ((o = i != null ? i[d] : void 0),
        r.hasOwnProperty(d) && c !== o && (c != null || o != null))
      )
        if (d === "style")
          if (o) {
            for (l in o)
              !o.hasOwnProperty(l) ||
                (c && c.hasOwnProperty(l)) ||
                (s || (s = {}), (s[l] = ""));
            for (l in c)
              c.hasOwnProperty(l) &&
                o[l] !== c[l] &&
                (s || (s = {}), (s[l] = c[l]));
          } else s || (a || (a = []), a.push(d, s)), (s = c);
        else
          d === "dangerouslySetInnerHTML"
            ? ((c = c ? c.__html : void 0),
              (o = o ? o.__html : void 0),
              c != null && o !== c && (a = a || []).push(d, c))
            : d === "children"
              ? (typeof c != "string" && typeof c != "number") ||
                (a = a || []).push(d, "" + c)
              : d !== "suppressContentEditableWarning" &&
                d !== "suppressHydrationWarning" &&
                (fr.hasOwnProperty(d)
                  ? (c != null && d === "onScroll" && de("scroll", t),
                    a || o === c || (a = []))
                  : (a = a || []).push(d, c));
    }
    s && (a = a || []).push("style", s);
    var d = a;
    (n.updateQueue = d) && (n.flags |= 4);
  }
};
Wh = function (t, n, s, r) {
  s !== r && (n.flags |= 4);
};
function Ys(t, n) {
  if (!me)
    switch (t.tailMode) {
      case "hidden":
        n = t.tail;
        for (var s = null; n !== null; )
          n.alternate !== null && (s = n), (n = n.sibling);
        s === null ? (t.tail = null) : (s.sibling = null);
        break;
      case "collapsed":
        s = t.tail;
        for (var r = null; s !== null; )
          s.alternate !== null && (r = s), (s = s.sibling);
        r === null
          ? n || t.tail === null
            ? (t.tail = null)
            : (t.tail.sibling = null)
          : (r.sibling = null);
    }
}
function Le(t) {
  var n = t.alternate !== null && t.alternate.child === t.child,
    s = 0,
    r = 0;
  if (n)
    for (var i = t.child; i !== null; )
      (s |= i.lanes | i.childLanes),
        (r |= i.subtreeFlags & 14680064),
        (r |= i.flags & 14680064),
        (i.return = t),
        (i = i.sibling);
  else
    for (i = t.child; i !== null; )
      (s |= i.lanes | i.childLanes),
        (r |= i.subtreeFlags),
        (r |= i.flags),
        (i.return = t),
        (i = i.sibling);
  return (t.subtreeFlags |= r), (t.childLanes = s), n;
}
function nx(t, n, s) {
  var r = n.pendingProps;
  switch ((Ro(n), n.tag)) {
    case 2:
    case 16:
    case 15:
    case 0:
    case 11:
    case 7:
    case 8:
    case 12:
    case 9:
    case 14:
      return Le(n), null;
    case 1:
      return Je(n.type) && Di(), Le(n), null;
    case 3:
      return (
        (r = n.stateNode),
        Ps(),
        he(Xe),
        he(Ue),
        Bo(),
        r.pendingContext &&
          ((r.context = r.pendingContext), (r.pendingContext = null)),
        (t === null || t.child === null) &&
          (ni(n)
            ? (n.flags |= 4)
            : t === null ||
              (t.memoizedState.isDehydrated && !(n.flags & 256)) ||
              ((n.flags |= 1024), kt !== null && (no(kt), (kt = null)))),
        Ql(t, n),
        Le(n),
        null
      );
    case 5:
      Vo(n);
      var i = _n(Ar.current);
      if (((s = n.type), t !== null && n.stateNode != null))
        Gh(t, n, s, r, i),
          t.ref !== n.ref && ((n.flags |= 512), (n.flags |= 2097152));
      else {
        if (!r) {
          if (n.stateNode === null) throw Error(F(166));
          return Le(n), null;
        }
        if (((t = _n(Rt.current)), ni(n))) {
          (r = n.stateNode), (s = n.type);
          var a = n.memoizedProps;
          switch (((r[It] = n), (r[br] = a), (t = (n.mode & 1) !== 0), s)) {
            case "dialog":
              de("cancel", r), de("close", r);
              break;
            case "iframe":
            case "object":
            case "embed":
              de("load", r);
              break;
            case "video":
            case "audio":
              for (i = 0; i < sr.length; i++) de(sr[i], r);
              break;
            case "source":
              de("error", r);
              break;
            case "img":
            case "image":
            case "link":
              de("error", r), de("load", r);
              break;
            case "details":
              de("toggle", r);
              break;
            case "input":
              Cc(r, a), de("invalid", r);
              break;
            case "select":
              (r._wrapperState = { wasMultiple: !!a.multiple }),
                de("invalid", r);
              break;
            case "textarea":
              wc(r, a), de("invalid", r);
          }
          Nl(s, a), (i = null);
          for (var l in a)
            if (a.hasOwnProperty(l)) {
              var o = a[l];
              l === "children"
                ? typeof o == "string"
                  ? r.textContent !== o &&
                    (a.suppressHydrationWarning !== !0 &&
                      ti(r.textContent, o, t),
                    (i = ["children", o]))
                  : typeof o == "number" &&
                    r.textContent !== "" + o &&
                    (a.suppressHydrationWarning !== !0 &&
                      ti(r.textContent, o, t),
                    (i = ["children", "" + o]))
                : fr.hasOwnProperty(l) &&
                  o != null &&
                  l === "onScroll" &&
                  de("scroll", r);
            }
          switch (s) {
            case "input":
              Kr(r), bc(r, a, !0);
              break;
            case "textarea":
              Kr(r), Ac(r);
              break;
            case "select":
            case "option":
              break;
            default:
              typeof a.onClick == "function" && (r.onclick = Mi);
          }
          (r = i), (n.updateQueue = r), r !== null && (n.flags |= 4);
        } else {
          (l = i.nodeType === 9 ? i : i.ownerDocument),
            t === "http://www.w3.org/1999/xhtml" && (t = yu(s)),
            t === "http://www.w3.org/1999/xhtml"
              ? s === "script"
                ? ((t = l.createElement("div")),
                  (t.innerHTML = "<script></script>"),
                  (t = t.removeChild(t.firstChild)))
                : typeof r.is == "string"
                  ? (t = l.createElement(s, { is: r.is }))
                  : ((t = l.createElement(s)),
                    s === "select" &&
                      ((l = t),
                      r.multiple
                        ? (l.multiple = !0)
                        : r.size && (l.size = r.size)))
              : (t = l.createElementNS(t, s)),
            (t[It] = n),
            (t[br] = r),
            Hh(t, n, !1, !1),
            (n.stateNode = t);
          e: {
            switch (((l = kl(s, r)), s)) {
              case "dialog":
                de("cancel", t), de("close", t), (i = r);
                break;
              case "iframe":
              case "object":
              case "embed":
                de("load", t), (i = r);
                break;
              case "video":
              case "audio":
                for (i = 0; i < sr.length; i++) de(sr[i], t);
                i = r;
                break;
              case "source":
                de("error", t), (i = r);
                break;
              case "img":
              case "image":
              case "link":
                de("error", t), de("load", t), (i = r);
                break;
              case "details":
                de("toggle", t), (i = r);
                break;
              case "input":
                Cc(t, r), (i = xl(t, r)), de("invalid", t);
                break;
              case "option":
                i = r;
                break;
              case "select":
                (t._wrapperState = { wasMultiple: !!r.multiple }),
                  (i = ye({}, r, { value: void 0 })),
                  de("invalid", t);
                break;
              case "textarea":
                wc(t, r), (i = gl(t, r)), de("invalid", t);
                break;
              default:
                i = r;
            }
            Nl(s, i), (o = i);
            for (a in o)
              if (o.hasOwnProperty(a)) {
                var c = o[a];
                a === "style"
                  ? Su(t, c)
                  : a === "dangerouslySetInnerHTML"
                    ? ((c = c ? c.__html : void 0), c != null && Nu(t, c))
                    : a === "children"
                      ? typeof c == "string"
                        ? (s !== "textarea" || c !== "") && xr(t, c)
                        : typeof c == "number" && xr(t, "" + c)
                      : a !== "suppressContentEditableWarning" &&
                        a !== "suppressHydrationWarning" &&
                        a !== "autoFocus" &&
                        (fr.hasOwnProperty(a)
                          ? c != null && a === "onScroll" && de("scroll", t)
                          : c != null && go(t, a, c, l));
              }
            switch (s) {
              case "input":
                Kr(t), bc(t, r, !1);
                break;
              case "textarea":
                Kr(t), Ac(t);
                break;
              case "option":
                r.value != null && t.setAttribute("value", "" + Nn(r.value));
                break;
              case "select":
                (t.multiple = !!r.multiple),
                  (a = r.value),
                  a != null
                    ? js(t, !!r.multiple, a, !1)
                    : r.defaultValue != null &&
                      js(t, !!r.multiple, r.defaultValue, !0);
                break;
              default:
                typeof i.onClick == "function" && (t.onclick = Mi);
            }
            switch (s) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                r = !!r.autoFocus;
                break e;
              case "img":
                r = !0;
                break e;
              default:
                r = !1;
            }
          }
          r && (n.flags |= 4);
        }
        n.ref !== null && ((n.flags |= 512), (n.flags |= 2097152));
      }
      return Le(n), null;
    case 6:
      if (t && n.stateNode != null) Wh(t, n, t.memoizedProps, r);
      else {
        if (typeof r != "string" && n.stateNode === null) throw Error(F(166));
        if (((s = _n(Ar.current)), _n(Rt.current), ni(n))) {
          if (
            ((r = n.stateNode),
            (s = n.memoizedProps),
            (r[It] = n),
            (a = r.nodeValue !== s) && ((t = it), t !== null))
          )
            switch (t.tag) {
              case 3:
                ti(r.nodeValue, s, (t.mode & 1) !== 0);
                break;
              case 5:
                t.memoizedProps.suppressHydrationWarning !== !0 &&
                  ti(r.nodeValue, s, (t.mode & 1) !== 0);
            }
          a && (n.flags |= 4);
        } else
          (r = (s.nodeType === 9 ? s : s.ownerDocument).createTextNode(r)),
            (r[It] = n),
            (n.stateNode = r);
      }
      return Le(n), null;
    case 13:
      if (
        (he(xe),
        (r = n.memoizedState),
        t === null ||
          (t.memoizedState !== null && t.memoizedState.dehydrated !== null))
      ) {
        if (me && rt !== null && n.mode & 1 && !(n.flags & 128))
          dh(), Es(), (n.flags |= 98560), (a = !1);
        else if (((a = ni(n)), r !== null && r.dehydrated !== null)) {
          if (t === null) {
            if (!a) throw Error(F(318));
            if (
              ((a = n.memoizedState),
              (a = a !== null ? a.dehydrated : null),
              !a)
            )
              throw Error(F(317));
            a[It] = n;
          } else
            Es(), !(n.flags & 128) && (n.memoizedState = null), (n.flags |= 4);
          Le(n), (a = !1);
        } else kt !== null && (no(kt), (kt = null)), (a = !0);
        if (!a) return n.flags & 65536 ? n : null;
      }
      return n.flags & 128
        ? ((n.lanes = s), n)
        : ((r = r !== null),
          r !== (t !== null && t.memoizedState !== null) &&
            r &&
            ((n.child.flags |= 8192),
            n.mode & 1 &&
              (t === null || xe.current & 1 ? Ae === 0 && (Ae = 3) : tc())),
          n.updateQueue !== null && (n.flags |= 4),
          Le(n),
          null);
    case 4:
      return (
        Ps(), Ql(t, n), t === null && Sr(n.stateNode.containerInfo), Le(n), null
      );
    case 10:
      return $o(n.type._context), Le(n), null;
    case 17:
      return Je(n.type) && Di(), Le(n), null;
    case 19:
      if ((he(xe), (a = n.memoizedState), a === null)) return Le(n), null;
      if (((r = (n.flags & 128) !== 0), (l = a.rendering), l === null))
        if (r) Ys(a, !1);
        else {
          if (Ae !== 0 || (t !== null && t.flags & 128))
            for (t = n.child; t !== null; ) {
              if (((l = Bi(t)), l !== null)) {
                for (
                  n.flags |= 128,
                    Ys(a, !1),
                    r = l.updateQueue,
                    r !== null && ((n.updateQueue = r), (n.flags |= 4)),
                    n.subtreeFlags = 0,
                    r = s,
                    s = n.child;
                  s !== null;

                )
                  (a = s),
                    (t = r),
                    (a.flags &= 14680066),
                    (l = a.alternate),
                    l === null
                      ? ((a.childLanes = 0),
                        (a.lanes = t),
                        (a.child = null),
                        (a.subtreeFlags = 0),
                        (a.memoizedProps = null),
                        (a.memoizedState = null),
                        (a.updateQueue = null),
                        (a.dependencies = null),
                        (a.stateNode = null))
                      : ((a.childLanes = l.childLanes),
                        (a.lanes = l.lanes),
                        (a.child = l.child),
                        (a.subtreeFlags = 0),
                        (a.deletions = null),
                        (a.memoizedProps = l.memoizedProps),
                        (a.memoizedState = l.memoizedState),
                        (a.updateQueue = l.updateQueue),
                        (a.type = l.type),
                        (t = l.dependencies),
                        (a.dependencies =
                          t === null
                            ? null
                            : {
                                lanes: t.lanes,
                                firstContext: t.firstContext,
                              })),
                    (s = s.sibling);
                return oe(xe, (xe.current & 1) | 2), n.child;
              }
              t = t.sibling;
            }
          a.tail !== null &&
            Se() > zs &&
            ((n.flags |= 128), (r = !0), Ys(a, !1), (n.lanes = 4194304));
        }
      else {
        if (!r)
          if (((t = Bi(l)), t !== null)) {
            if (
              ((n.flags |= 128),
              (r = !0),
              (s = t.updateQueue),
              s !== null && ((n.updateQueue = s), (n.flags |= 4)),
              Ys(a, !0),
              a.tail === null && a.tailMode === "hidden" && !l.alternate && !me)
            )
              return Le(n), null;
          } else
            2 * Se() - a.renderingStartTime > zs &&
              s !== 1073741824 &&
              ((n.flags |= 128), (r = !0), Ys(a, !1), (n.lanes = 4194304));
        a.isBackwards
          ? ((l.sibling = n.child), (n.child = l))
          : ((s = a.last),
            s !== null ? (s.sibling = l) : (n.child = l),
            (a.last = l));
      }
      return a.tail !== null
        ? ((n = a.tail),
          (a.rendering = n),
          (a.tail = n.sibling),
          (a.renderingStartTime = Se()),
          (n.sibling = null),
          (s = xe.current),
          oe(xe, r ? (s & 1) | 2 : s & 1),
          n)
        : (Le(n), null);
    case 22:
    case 23:
      return (
        ec(),
        (r = n.memoizedState !== null),
        t !== null && (t.memoizedState !== null) !== r && (n.flags |= 8192),
        r && n.mode & 1
          ? st & 1073741824 && (Le(n), n.subtreeFlags & 6 && (n.flags |= 8192))
          : Le(n),
        null
      );
    case 24:
      return null;
    case 25:
      return null;
  }
  throw Error(F(156, n.tag));
}
function sx(t, n) {
  switch ((Ro(n), n.tag)) {
    case 1:
      return (
        Je(n.type) && Di(),
        (t = n.flags),
        t & 65536 ? ((n.flags = (t & -65537) | 128), n) : null
      );
    case 3:
      return (
        Ps(),
        he(Xe),
        he(Ue),
        Bo(),
        (t = n.flags),
        t & 65536 && !(t & 128) ? ((n.flags = (t & -65537) | 128), n) : null
      );
    case 5:
      return Vo(n), null;
    case 13:
      if (
        (he(xe), (t = n.memoizedState), t !== null && t.dehydrated !== null)
      ) {
        if (n.alternate === null) throw Error(F(340));
        Es();
      }
      return (
        (t = n.flags), t & 65536 ? ((n.flags = (t & -65537) | 128), n) : null
      );
    case 19:
      return he(xe), null;
    case 4:
      return Ps(), null;
    case 10:
      return $o(n.type._context), null;
    case 22:
    case 23:
      return ec(), null;
    case 24:
      return null;
    default:
      return null;
  }
}
var ii = !1,
  Fe = !1,
  rx = typeof WeakSet == "function" ? WeakSet : Set,
  G = null;
function fs(t, n) {
  var s = t.ref;
  if (s !== null)
    if (typeof s == "function")
      try {
        s(null);
      } catch (r) {
        Ne(t, n, r);
      }
    else s.current = null;
}
function Yl(t, n, s) {
  try {
    s();
  } catch (r) {
    Ne(t, n, r);
  }
}
var xd = !1;
function ix(t, n) {
  if (((zl = zi), (t = Zu()), zo(t))) {
    if ("selectionStart" in t)
      var s = { start: t.selectionStart, end: t.selectionEnd };
    else
      e: {
        s = ((s = t.ownerDocument) && s.defaultView) || window;
        var r = s.getSelection && s.getSelection();
        if (r && r.rangeCount !== 0) {
          s = r.anchorNode;
          var i = r.anchorOffset,
            a = r.focusNode;
          r = r.focusOffset;
          try {
            s.nodeType, a.nodeType;
          } catch {
            s = null;
            break e;
          }
          var l = 0,
            o = -1,
            c = -1,
            d = 0,
            u = 0,
            m = t,
            x = null;
          t: for (;;) {
            for (
              var j;
              m !== s || (i !== 0 && m.nodeType !== 3) || (o = l + i),
                m !== a || (r !== 0 && m.nodeType !== 3) || (c = l + r),
                m.nodeType === 3 && (l += m.nodeValue.length),
                (j = m.firstChild) !== null;

            )
              (x = m), (m = j);
            for (;;) {
              if (m === t) break t;
              if (
                (x === s && ++d === i && (o = l),
                x === a && ++u === r && (c = l),
                (j = m.nextSibling) !== null)
              )
                break;
              (m = x), (x = m.parentNode);
            }
            m = j;
          }
          s = o === -1 || c === -1 ? null : { start: o, end: c };
        } else s = null;
      }
    s = s || { start: 0, end: 0 };
  } else s = null;
  for (Ol = { focusedElem: t, selectionRange: s }, zi = !1, G = n; G !== null; )
    if (((n = G), (t = n.child), (n.subtreeFlags & 1028) !== 0 && t !== null))
      (t.return = n), (G = t);
    else
      for (; G !== null; ) {
        n = G;
        try {
          var f = n.alternate;
          if (n.flags & 1024)
            switch (n.tag) {
              case 0:
              case 11:
              case 15:
                break;
              case 1:
                if (f !== null) {
                  var g = f.memoizedProps,
                    b = f.memoizedState,
                    v = n.stateNode,
                    h = v.getSnapshotBeforeUpdate(
                      n.elementType === n.type ? g : vt(n.type, g),
                      b,
                    );
                  v.__reactInternalSnapshotBeforeUpdate = h;
                }
                break;
              case 3:
                var p = n.stateNode.containerInfo;
                p.nodeType === 1
                  ? (p.textContent = "")
                  : p.nodeType === 9 &&
                    p.documentElement &&
                    p.removeChild(p.documentElement);
                break;
              case 5:
              case 6:
              case 4:
              case 17:
                break;
              default:
                throw Error(F(163));
            }
        } catch (y) {
          Ne(n, n.return, y);
        }
        if (((t = n.sibling), t !== null)) {
          (t.return = n.return), (G = t);
          break;
        }
        G = n.return;
      }
  return (f = xd), (xd = !1), f;
}
function ur(t, n, s) {
  var r = n.updateQueue;
  if (((r = r !== null ? r.lastEffect : null), r !== null)) {
    var i = (r = r.next);
    do {
      if ((i.tag & t) === t) {
        var a = i.destroy;
        (i.destroy = void 0), a !== void 0 && Yl(n, s, a);
      }
      i = i.next;
    } while (i !== r);
  }
}
function ca(t, n) {
  if (
    ((n = n.updateQueue), (n = n !== null ? n.lastEffect : null), n !== null)
  ) {
    var s = (n = n.next);
    do {
      if ((s.tag & t) === t) {
        var r = s.create;
        s.destroy = r();
      }
      s = s.next;
    } while (s !== n);
  }
}
function ql(t) {
  var n = t.ref;
  if (n !== null) {
    var s = t.stateNode;
    switch (t.tag) {
      case 5:
        t = s;
        break;
      default:
        t = s;
    }
    typeof n == "function" ? n(t) : (n.current = t);
  }
}
function Kh(t) {
  var n = t.alternate;
  n !== null && ((t.alternate = null), Kh(n)),
    (t.child = null),
    (t.deletions = null),
    (t.sibling = null),
    t.tag === 5 &&
      ((n = t.stateNode),
      n !== null &&
        (delete n[It], delete n[br], delete n[Dl], delete n[Uf], delete n[Vf])),
    (t.stateNode = null),
    (t.return = null),
    (t.dependencies = null),
    (t.memoizedProps = null),
    (t.memoizedState = null),
    (t.pendingProps = null),
    (t.stateNode = null),
    (t.updateQueue = null);
}
function Qh(t) {
  return t.tag === 5 || t.tag === 3 || t.tag === 4;
}
function jd(t) {
  e: for (;;) {
    for (; t.sibling === null; ) {
      if (t.return === null || Qh(t.return)) return null;
      t = t.return;
    }
    for (
      t.sibling.return = t.return, t = t.sibling;
      t.tag !== 5 && t.tag !== 6 && t.tag !== 18;

    ) {
      if (t.flags & 2 || t.child === null || t.tag === 4) continue e;
      (t.child.return = t), (t = t.child);
    }
    if (!(t.flags & 2)) return t.stateNode;
  }
}
function Zl(t, n, s) {
  var r = t.tag;
  if (r === 5 || r === 6)
    (t = t.stateNode),
      n
        ? s.nodeType === 8
          ? s.parentNode.insertBefore(t, n)
          : s.insertBefore(t, n)
        : (s.nodeType === 8
            ? ((n = s.parentNode), n.insertBefore(t, s))
            : ((n = s), n.appendChild(t)),
          (s = s._reactRootContainer),
          s != null || n.onclick !== null || (n.onclick = Mi));
  else if (r !== 4 && ((t = t.child), t !== null))
    for (Zl(t, n, s), t = t.sibling; t !== null; ) Zl(t, n, s), (t = t.sibling);
}
function Xl(t, n, s) {
  var r = t.tag;
  if (r === 5 || r === 6)
    (t = t.stateNode), n ? s.insertBefore(t, n) : s.appendChild(t);
  else if (r !== 4 && ((t = t.child), t !== null))
    for (Xl(t, n, s), t = t.sibling; t !== null; ) Xl(t, n, s), (t = t.sibling);
}
var Oe = null,
  Nt = !1;
function sn(t, n, s) {
  for (s = s.child; s !== null; ) Yh(t, n, s), (s = s.sibling);
}
function Yh(t, n, s) {
  if (Ot && typeof Ot.onCommitFiberUnmount == "function")
    try {
      Ot.onCommitFiberUnmount(ta, s);
    } catch {}
  switch (s.tag) {
    case 5:
      Fe || fs(s, n);
    case 6:
      var r = Oe,
        i = Nt;
      (Oe = null),
        sn(t, n, s),
        (Oe = r),
        (Nt = i),
        Oe !== null &&
          (Nt
            ? ((t = Oe),
              (s = s.stateNode),
              t.nodeType === 8 ? t.parentNode.removeChild(s) : t.removeChild(s))
            : Oe.removeChild(s.stateNode));
      break;
    case 18:
      Oe !== null &&
        (Nt
          ? ((t = Oe),
            (s = s.stateNode),
            t.nodeType === 8
              ? Ha(t.parentNode, s)
              : t.nodeType === 1 && Ha(t, s),
            yr(t))
          : Ha(Oe, s.stateNode));
      break;
    case 4:
      (r = Oe),
        (i = Nt),
        (Oe = s.stateNode.containerInfo),
        (Nt = !0),
        sn(t, n, s),
        (Oe = r),
        (Nt = i);
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      if (
        !Fe &&
        ((r = s.updateQueue), r !== null && ((r = r.lastEffect), r !== null))
      ) {
        i = r = r.next;
        do {
          var a = i,
            l = a.destroy;
          (a = a.tag),
            l !== void 0 && (a & 2 || a & 4) && Yl(s, n, l),
            (i = i.next);
        } while (i !== r);
      }
      sn(t, n, s);
      break;
    case 1:
      if (
        !Fe &&
        (fs(s, n),
        (r = s.stateNode),
        typeof r.componentWillUnmount == "function")
      )
        try {
          (r.props = s.memoizedProps),
            (r.state = s.memoizedState),
            r.componentWillUnmount();
        } catch (o) {
          Ne(s, n, o);
        }
      sn(t, n, s);
      break;
    case 21:
      sn(t, n, s);
      break;
    case 22:
      s.mode & 1
        ? ((Fe = (r = Fe) || s.memoizedState !== null), sn(t, n, s), (Fe = r))
        : sn(t, n, s);
      break;
    default:
      sn(t, n, s);
  }
}
function vd(t) {
  var n = t.updateQueue;
  if (n !== null) {
    t.updateQueue = null;
    var s = t.stateNode;
    s === null && (s = t.stateNode = new rx()),
      n.forEach(function (r) {
        var i = mx.bind(null, t, r);
        s.has(r) || (s.add(r), r.then(i, i));
      });
  }
}
function jt(t, n) {
  var s = n.deletions;
  if (s !== null)
    for (var r = 0; r < s.length; r++) {
      var i = s[r];
      try {
        var a = t,
          l = n,
          o = l;
        e: for (; o !== null; ) {
          switch (o.tag) {
            case 5:
              (Oe = o.stateNode), (Nt = !1);
              break e;
            case 3:
              (Oe = o.stateNode.containerInfo), (Nt = !0);
              break e;
            case 4:
              (Oe = o.stateNode.containerInfo), (Nt = !0);
              break e;
          }
          o = o.return;
        }
        if (Oe === null) throw Error(F(160));
        Yh(a, l, i), (Oe = null), (Nt = !1);
        var c = i.alternate;
        c !== null && (c.return = null), (i.return = null);
      } catch (d) {
        Ne(i, n, d);
      }
    }
  if (n.subtreeFlags & 12854)
    for (n = n.child; n !== null; ) qh(n, t), (n = n.sibling);
}
function qh(t, n) {
  var s = t.alternate,
    r = t.flags;
  switch (t.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      if ((jt(n, t), Tt(t), r & 4)) {
        try {
          ur(3, t, t.return), ca(3, t);
        } catch (g) {
          Ne(t, t.return, g);
        }
        try {
          ur(5, t, t.return);
        } catch (g) {
          Ne(t, t.return, g);
        }
      }
      break;
    case 1:
      jt(n, t), Tt(t), r & 512 && s !== null && fs(s, s.return);
      break;
    case 5:
      if (
        (jt(n, t),
        Tt(t),
        r & 512 && s !== null && fs(s, s.return),
        t.flags & 32)
      ) {
        var i = t.stateNode;
        try {
          xr(i, "");
        } catch (g) {
          Ne(t, t.return, g);
        }
      }
      if (r & 4 && ((i = t.stateNode), i != null)) {
        var a = t.memoizedProps,
          l = s !== null ? s.memoizedProps : a,
          o = t.type,
          c = t.updateQueue;
        if (((t.updateQueue = null), c !== null))
          try {
            o === "input" && a.type === "radio" && a.name != null && vu(i, a),
              kl(o, l);
            var d = kl(o, a);
            for (l = 0; l < c.length; l += 2) {
              var u = c[l],
                m = c[l + 1];
              u === "style"
                ? Su(i, m)
                : u === "dangerouslySetInnerHTML"
                  ? Nu(i, m)
                  : u === "children"
                    ? xr(i, m)
                    : go(i, u, m, d);
            }
            switch (o) {
              case "input":
                jl(i, a);
                break;
              case "textarea":
                gu(i, a);
                break;
              case "select":
                var x = i._wrapperState.wasMultiple;
                i._wrapperState.wasMultiple = !!a.multiple;
                var j = a.value;
                j != null
                  ? js(i, !!a.multiple, j, !1)
                  : x !== !!a.multiple &&
                    (a.defaultValue != null
                      ? js(i, !!a.multiple, a.defaultValue, !0)
                      : js(i, !!a.multiple, a.multiple ? [] : "", !1));
            }
            i[br] = a;
          } catch (g) {
            Ne(t, t.return, g);
          }
      }
      break;
    case 6:
      if ((jt(n, t), Tt(t), r & 4)) {
        if (t.stateNode === null) throw Error(F(162));
        (i = t.stateNode), (a = t.memoizedProps);
        try {
          i.nodeValue = a;
        } catch (g) {
          Ne(t, t.return, g);
        }
      }
      break;
    case 3:
      if (
        (jt(n, t), Tt(t), r & 4 && s !== null && s.memoizedState.isDehydrated)
      )
        try {
          yr(n.containerInfo);
        } catch (g) {
          Ne(t, t.return, g);
        }
      break;
    case 4:
      jt(n, t), Tt(t);
      break;
    case 13:
      jt(n, t),
        Tt(t),
        (i = t.child),
        i.flags & 8192 &&
          ((a = i.memoizedState !== null),
          (i.stateNode.isHidden = a),
          !a ||
            (i.alternate !== null && i.alternate.memoizedState !== null) ||
            (Xo = Se())),
        r & 4 && vd(t);
      break;
    case 22:
      if (
        ((u = s !== null && s.memoizedState !== null),
        t.mode & 1 ? ((Fe = (d = Fe) || u), jt(n, t), (Fe = d)) : jt(n, t),
        Tt(t),
        r & 8192)
      ) {
        if (
          ((d = t.memoizedState !== null),
          (t.stateNode.isHidden = d) && !u && t.mode & 1)
        )
          for (G = t, u = t.child; u !== null; ) {
            for (m = G = u; G !== null; ) {
              switch (((x = G), (j = x.child), x.tag)) {
                case 0:
                case 11:
                case 14:
                case 15:
                  ur(4, x, x.return);
                  break;
                case 1:
                  fs(x, x.return);
                  var f = x.stateNode;
                  if (typeof f.componentWillUnmount == "function") {
                    (r = x), (s = x.return);
                    try {
                      (n = r),
                        (f.props = n.memoizedProps),
                        (f.state = n.memoizedState),
                        f.componentWillUnmount();
                    } catch (g) {
                      Ne(r, s, g);
                    }
                  }
                  break;
                case 5:
                  fs(x, x.return);
                  break;
                case 22:
                  if (x.memoizedState !== null) {
                    yd(m);
                    continue;
                  }
              }
              j !== null ? ((j.return = x), (G = j)) : yd(m);
            }
            u = u.sibling;
          }
        e: for (u = null, m = t; ; ) {
          if (m.tag === 5) {
            if (u === null) {
              u = m;
              try {
                (i = m.stateNode),
                  d
                    ? ((a = i.style),
                      typeof a.setProperty == "function"
                        ? a.setProperty("display", "none", "important")
                        : (a.display = "none"))
                    : ((o = m.stateNode),
                      (c = m.memoizedProps.style),
                      (l =
                        c != null && c.hasOwnProperty("display")
                          ? c.display
                          : null),
                      (o.style.display = ku("display", l)));
              } catch (g) {
                Ne(t, t.return, g);
              }
            }
          } else if (m.tag === 6) {
            if (u === null)
              try {
                m.stateNode.nodeValue = d ? "" : m.memoizedProps;
              } catch (g) {
                Ne(t, t.return, g);
              }
          } else if (
            ((m.tag !== 22 && m.tag !== 23) ||
              m.memoizedState === null ||
              m === t) &&
            m.child !== null
          ) {
            (m.child.return = m), (m = m.child);
            continue;
          }
          if (m === t) break e;
          for (; m.sibling === null; ) {
            if (m.return === null || m.return === t) break e;
            u === m && (u = null), (m = m.return);
          }
          u === m && (u = null), (m.sibling.return = m.return), (m = m.sibling);
        }
      }
      break;
    case 19:
      jt(n, t), Tt(t), r & 4 && vd(t);
      break;
    case 21:
      break;
    default:
      jt(n, t), Tt(t);
  }
}
function Tt(t) {
  var n = t.flags;
  if (n & 2) {
    try {
      e: {
        for (var s = t.return; s !== null; ) {
          if (Qh(s)) {
            var r = s;
            break e;
          }
          s = s.return;
        }
        throw Error(F(160));
      }
      switch (r.tag) {
        case 5:
          var i = r.stateNode;
          r.flags & 32 && (xr(i, ""), (r.flags &= -33));
          var a = jd(t);
          Xl(t, a, i);
          break;
        case 3:
        case 4:
          var l = r.stateNode.containerInfo,
            o = jd(t);
          Zl(t, o, l);
          break;
        default:
          throw Error(F(161));
      }
    } catch (c) {
      Ne(t, t.return, c);
    }
    t.flags &= -3;
  }
  n & 4096 && (t.flags &= -4097);
}
function ax(t, n, s) {
  (G = t), Zh(t);
}
function Zh(t, n, s) {
  for (var r = (t.mode & 1) !== 0; G !== null; ) {
    var i = G,
      a = i.child;
    if (i.tag === 22 && r) {
      var l = i.memoizedState !== null || ii;
      if (!l) {
        var o = i.alternate,
          c = (o !== null && o.memoizedState !== null) || Fe;
        o = ii;
        var d = Fe;
        if (((ii = l), (Fe = c) && !d))
          for (G = i; G !== null; )
            (l = G),
              (c = l.child),
              l.tag === 22 && l.memoizedState !== null
                ? Nd(i)
                : c !== null
                  ? ((c.return = l), (G = c))
                  : Nd(i);
        for (; a !== null; ) (G = a), Zh(a), (a = a.sibling);
        (G = i), (ii = o), (Fe = d);
      }
      gd(t);
    } else
      i.subtreeFlags & 8772 && a !== null ? ((a.return = i), (G = a)) : gd(t);
  }
}
function gd(t) {
  for (; G !== null; ) {
    var n = G;
    if (n.flags & 8772) {
      var s = n.alternate;
      try {
        if (n.flags & 8772)
          switch (n.tag) {
            case 0:
            case 11:
            case 15:
              Fe || ca(5, n);
              break;
            case 1:
              var r = n.stateNode;
              if (n.flags & 4 && !Fe)
                if (s === null) r.componentDidMount();
                else {
                  var i =
                    n.elementType === n.type
                      ? s.memoizedProps
                      : vt(n.type, s.memoizedProps);
                  r.componentDidUpdate(
                    i,
                    s.memoizedState,
                    r.__reactInternalSnapshotBeforeUpdate,
                  );
                }
              var a = n.updateQueue;
              a !== null && sd(n, a, r);
              break;
            case 3:
              var l = n.updateQueue;
              if (l !== null) {
                if (((s = null), n.child !== null))
                  switch (n.child.tag) {
                    case 5:
                      s = n.child.stateNode;
                      break;
                    case 1:
                      s = n.child.stateNode;
                  }
                sd(n, l, s);
              }
              break;
            case 5:
              var o = n.stateNode;
              if (s === null && n.flags & 4) {
                s = o;
                var c = n.memoizedProps;
                switch (n.type) {
                  case "button":
                  case "input":
                  case "select":
                  case "textarea":
                    c.autoFocus && s.focus();
                    break;
                  case "img":
                    c.src && (s.src = c.src);
                }
              }
              break;
            case 6:
              break;
            case 4:
              break;
            case 12:
              break;
            case 13:
              if (n.memoizedState === null) {
                var d = n.alternate;
                if (d !== null) {
                  var u = d.memoizedState;
                  if (u !== null) {
                    var m = u.dehydrated;
                    m !== null && yr(m);
                  }
                }
              }
              break;
            case 19:
            case 17:
            case 21:
            case 22:
            case 23:
            case 25:
              break;
            default:
              throw Error(F(163));
          }
        Fe || (n.flags & 512 && ql(n));
      } catch (x) {
        Ne(n, n.return, x);
      }
    }
    if (n === t) {
      G = null;
      break;
    }
    if (((s = n.sibling), s !== null)) {
      (s.return = n.return), (G = s);
      break;
    }
    G = n.return;
  }
}
function yd(t) {
  for (; G !== null; ) {
    var n = G;
    if (n === t) {
      G = null;
      break;
    }
    var s = n.sibling;
    if (s !== null) {
      (s.return = n.return), (G = s);
      break;
    }
    G = n.return;
  }
}
function Nd(t) {
  for (; G !== null; ) {
    var n = G;
    try {
      switch (n.tag) {
        case 0:
        case 11:
        case 15:
          var s = n.return;
          try {
            ca(4, n);
          } catch (c) {
            Ne(n, s, c);
          }
          break;
        case 1:
          var r = n.stateNode;
          if (typeof r.componentDidMount == "function") {
            var i = n.return;
            try {
              r.componentDidMount();
            } catch (c) {
              Ne(n, i, c);
            }
          }
          var a = n.return;
          try {
            ql(n);
          } catch (c) {
            Ne(n, a, c);
          }
          break;
        case 5:
          var l = n.return;
          try {
            ql(n);
          } catch (c) {
            Ne(n, l, c);
          }
      }
    } catch (c) {
      Ne(n, n.return, c);
    }
    if (n === t) {
      G = null;
      break;
    }
    var o = n.sibling;
    if (o !== null) {
      (o.return = n.return), (G = o);
      break;
    }
    G = n.return;
  }
}
var lx = Math.ceil,
  Wi = tn.ReactCurrentDispatcher,
  qo = tn.ReactCurrentOwner,
  mt = tn.ReactCurrentBatchConfig,
  ne = 0,
  Ie = null,
  be = null,
  Me = 0,
  st = 0,
  xs = bn(0),
  Ae = 0,
  Ir = null,
  Kn = 0,
  da = 0,
  Zo = 0,
  hr = null,
  Ye = null,
  Xo = 0,
  zs = 1 / 0,
  Ut = null,
  Ki = !1,
  Jl = null,
  jn = null,
  ai = !1,
  un = null,
  Qi = 0,
  pr = 0,
  eo = null,
  ki = -1,
  Si = 0;
function Ge() {
  return ne & 6 ? Se() : ki !== -1 ? ki : (ki = Se());
}
function vn(t) {
  return t.mode & 1
    ? ne & 2 && Me !== 0
      ? Me & -Me
      : Hf.transition !== null
        ? (Si === 0 && (Si = Mu()), Si)
        : ((t = re),
          t !== 0 || ((t = window.event), (t = t === void 0 ? 16 : Vu(t.type))),
          t)
    : 1;
}
function Ct(t, n, s, r) {
  if (50 < pr) throw ((pr = 0), (eo = null), Error(F(185)));
  _r(t, s, r),
    (!(ne & 2) || t !== Ie) &&
      (t === Ie && (!(ne & 2) && (da |= s), Ae === 4 && on(t, Me)),
      et(t, r),
      s === 1 && ne === 0 && !(n.mode & 1) && ((zs = Se() + 500), aa && wn()));
}
function et(t, n) {
  var s = t.callbackNode;
  Bm(t, n);
  var r = Ii(t, t === Ie ? Me : 0);
  if (r === 0)
    s !== null && Pc(s), (t.callbackNode = null), (t.callbackPriority = 0);
  else if (((n = r & -r), t.callbackPriority !== n)) {
    if ((s != null && Pc(s), n === 1))
      t.tag === 0 ? Bf(kd.bind(null, t)) : lh(kd.bind(null, t)),
        Lf(function () {
          !(ne & 6) && wn();
        }),
        (s = null);
    else {
      switch (Du(r)) {
        case 1:
          s = Co;
          break;
        case 4:
          s = Ou;
          break;
        case 16:
          s = Pi;
          break;
        case 536870912:
          s = Ru;
          break;
        default:
          s = Pi;
      }
      s = ip(s, Xh.bind(null, t));
    }
    (t.callbackPriority = n), (t.callbackNode = s);
  }
}
function Xh(t, n) {
  if (((ki = -1), (Si = 0), ne & 6)) throw Error(F(327));
  var s = t.callbackNode;
  if (ks() && t.callbackNode !== s) return null;
  var r = Ii(t, t === Ie ? Me : 0);
  if (r === 0) return null;
  if (r & 30 || r & t.expiredLanes || n) n = Yi(t, r);
  else {
    n = r;
    var i = ne;
    ne |= 2;
    var a = ep();
    (Ie !== t || Me !== n) && ((Ut = null), (zs = Se() + 500), Fn(t, n));
    do
      try {
        dx();
        break;
      } catch (o) {
        Jh(t, o);
      }
    while (!0);
    _o(),
      (Wi.current = a),
      (ne = i),
      be !== null ? (n = 0) : ((Ie = null), (Me = 0), (n = Ae));
  }
  if (n !== 0) {
    if (
      (n === 2 && ((i = Al(t)), i !== 0 && ((r = i), (n = to(t, i)))), n === 1)
    )
      throw ((s = Ir), Fn(t, 0), on(t, r), et(t, Se()), s);
    if (n === 6) on(t, r);
    else {
      if (
        ((i = t.current.alternate),
        !(r & 30) &&
          !ox(i) &&
          ((n = Yi(t, r)),
          n === 2 && ((a = Al(t)), a !== 0 && ((r = a), (n = to(t, a)))),
          n === 1))
      )
        throw ((s = Ir), Fn(t, 0), on(t, r), et(t, Se()), s);
      switch (((t.finishedWork = i), (t.finishedLanes = r), n)) {
        case 0:
        case 1:
          throw Error(F(345));
        case 2:
          Rn(t, Ye, Ut);
          break;
        case 3:
          if (
            (on(t, r), (r & 130023424) === r && ((n = Xo + 500 - Se()), 10 < n))
          ) {
            if (Ii(t, 0) !== 0) break;
            if (((i = t.suspendedLanes), (i & r) !== r)) {
              Ge(), (t.pingedLanes |= t.suspendedLanes & i);
              break;
            }
            t.timeoutHandle = Ml(Rn.bind(null, t, Ye, Ut), n);
            break;
          }
          Rn(t, Ye, Ut);
          break;
        case 4:
          if ((on(t, r), (r & 4194240) === r)) break;
          for (n = t.eventTimes, i = -1; 0 < r; ) {
            var l = 31 - St(r);
            (a = 1 << l), (l = n[l]), l > i && (i = l), (r &= ~a);
          }
          if (
            ((r = i),
            (r = Se() - r),
            (r =
              (120 > r
                ? 120
                : 480 > r
                  ? 480
                  : 1080 > r
                    ? 1080
                    : 1920 > r
                      ? 1920
                      : 3e3 > r
                        ? 3e3
                        : 4320 > r
                          ? 4320
                          : 1960 * lx(r / 1960)) - r),
            10 < r)
          ) {
            t.timeoutHandle = Ml(Rn.bind(null, t, Ye, Ut), r);
            break;
          }
          Rn(t, Ye, Ut);
          break;
        case 5:
          Rn(t, Ye, Ut);
          break;
        default:
          throw Error(F(329));
      }
    }
  }
  return et(t, Se()), t.callbackNode === s ? Xh.bind(null, t) : null;
}
function to(t, n) {
  var s = hr;
  return (
    t.current.memoizedState.isDehydrated && (Fn(t, n).flags |= 256),
    (t = Yi(t, n)),
    t !== 2 && ((n = Ye), (Ye = s), n !== null && no(n)),
    t
  );
}
function no(t) {
  Ye === null ? (Ye = t) : Ye.push.apply(Ye, t);
}
function ox(t) {
  for (var n = t; ; ) {
    if (n.flags & 16384) {
      var s = n.updateQueue;
      if (s !== null && ((s = s.stores), s !== null))
        for (var r = 0; r < s.length; r++) {
          var i = s[r],
            a = i.getSnapshot;
          i = i.value;
          try {
            if (!bt(a(), i)) return !1;
          } catch {
            return !1;
          }
        }
    }
    if (((s = n.child), n.subtreeFlags & 16384 && s !== null))
      (s.return = n), (n = s);
    else {
      if (n === t) break;
      for (; n.sibling === null; ) {
        if (n.return === null || n.return === t) return !0;
        n = n.return;
      }
      (n.sibling.return = n.return), (n = n.sibling);
    }
  }
  return !0;
}
function on(t, n) {
  for (
    n &= ~Zo,
      n &= ~da,
      t.suspendedLanes |= n,
      t.pingedLanes &= ~n,
      t = t.expirationTimes;
    0 < n;

  ) {
    var s = 31 - St(n),
      r = 1 << s;
    (t[s] = -1), (n &= ~r);
  }
}
function kd(t) {
  if (ne & 6) throw Error(F(327));
  ks();
  var n = Ii(t, 0);
  if (!(n & 1)) return et(t, Se()), null;
  var s = Yi(t, n);
  if (t.tag !== 0 && s === 2) {
    var r = Al(t);
    r !== 0 && ((n = r), (s = to(t, r)));
  }
  if (s === 1) throw ((s = Ir), Fn(t, 0), on(t, n), et(t, Se()), s);
  if (s === 6) throw Error(F(345));
  return (
    (t.finishedWork = t.current.alternate),
    (t.finishedLanes = n),
    Rn(t, Ye, Ut),
    et(t, Se()),
    null
  );
}
function Jo(t, n) {
  var s = ne;
  ne |= 1;
  try {
    return t(n);
  } finally {
    (ne = s), ne === 0 && ((zs = Se() + 500), aa && wn());
  }
}
function Qn(t) {
  un !== null && un.tag === 0 && !(ne & 6) && ks();
  var n = ne;
  ne |= 1;
  var s = mt.transition,
    r = re;
  try {
    if (((mt.transition = null), (re = 1), t)) return t();
  } finally {
    (re = r), (mt.transition = s), (ne = n), !(ne & 6) && wn();
  }
}
function ec() {
  (st = xs.current), he(xs);
}
function Fn(t, n) {
  (t.finishedWork = null), (t.finishedLanes = 0);
  var s = t.timeoutHandle;
  if ((s !== -1 && ((t.timeoutHandle = -1), $f(s)), be !== null))
    for (s = be.return; s !== null; ) {
      var r = s;
      switch ((Ro(r), r.tag)) {
        case 1:
          (r = r.type.childContextTypes), r != null && Di();
          break;
        case 3:
          Ps(), he(Xe), he(Ue), Bo();
          break;
        case 5:
          Vo(r);
          break;
        case 4:
          Ps();
          break;
        case 13:
          he(xe);
          break;
        case 19:
          he(xe);
          break;
        case 10:
          $o(r.type._context);
          break;
        case 22:
        case 23:
          ec();
      }
      s = s.return;
    }
  if (
    ((Ie = t),
    (be = t = gn(t.current, null)),
    (Me = st = n),
    (Ae = 0),
    (Ir = null),
    (Zo = da = Kn = 0),
    (Ye = hr = null),
    Dn !== null)
  ) {
    for (n = 0; n < Dn.length; n++)
      if (((s = Dn[n]), (r = s.interleaved), r !== null)) {
        s.interleaved = null;
        var i = r.next,
          a = s.pending;
        if (a !== null) {
          var l = a.next;
          (a.next = i), (r.next = l);
        }
        s.pending = r;
      }
    Dn = null;
  }
  return t;
}
function Jh(t, n) {
  do {
    var s = be;
    try {
      if ((_o(), (gi.current = Gi), Hi)) {
        for (var r = ge.memoizedState; r !== null; ) {
          var i = r.queue;
          i !== null && (i.pending = null), (r = r.next);
        }
        Hi = !1;
      }
      if (
        ((Wn = 0),
        (Te = we = ge = null),
        (dr = !1),
        (Er = 0),
        (qo.current = null),
        s === null || s.return === null)
      ) {
        (Ae = 1), (Ir = n), (be = null);
        break;
      }
      e: {
        var a = t,
          l = s.return,
          o = s,
          c = n;
        if (
          ((n = Me),
          (o.flags |= 32768),
          c !== null && typeof c == "object" && typeof c.then == "function")
        ) {
          var d = c,
            u = o,
            m = u.tag;
          if (!(u.mode & 1) && (m === 0 || m === 11 || m === 15)) {
            var x = u.alternate;
            x
              ? ((u.updateQueue = x.updateQueue),
                (u.memoizedState = x.memoizedState),
                (u.lanes = x.lanes))
              : ((u.updateQueue = null), (u.memoizedState = null));
          }
          var j = cd(l);
          if (j !== null) {
            (j.flags &= -257),
              dd(j, l, o, a, n),
              j.mode & 1 && od(a, d, n),
              (n = j),
              (c = d);
            var f = n.updateQueue;
            if (f === null) {
              var g = new Set();
              g.add(c), (n.updateQueue = g);
            } else f.add(c);
            break e;
          } else {
            if (!(n & 1)) {
              od(a, d, n), tc();
              break e;
            }
            c = Error(F(426));
          }
        } else if (me && o.mode & 1) {
          var b = cd(l);
          if (b !== null) {
            !(b.flags & 65536) && (b.flags |= 256),
              dd(b, l, o, a, n),
              Mo(Is(c, o));
            break e;
          }
        }
        (a = c = Is(c, o)),
          Ae !== 4 && (Ae = 2),
          hr === null ? (hr = [a]) : hr.push(a),
          (a = l);
        do {
          switch (a.tag) {
            case 3:
              (a.flags |= 65536), (n &= -n), (a.lanes |= n);
              var v = Dh(a, c, n);
              nd(a, v);
              break e;
            case 1:
              o = c;
              var h = a.type,
                p = a.stateNode;
              if (
                !(a.flags & 128) &&
                (typeof h.getDerivedStateFromError == "function" ||
                  (p !== null &&
                    typeof p.componentDidCatch == "function" &&
                    (jn === null || !jn.has(p))))
              ) {
                (a.flags |= 65536), (n &= -n), (a.lanes |= n);
                var y = _h(a, o, n);
                nd(a, y);
                break e;
              }
          }
          a = a.return;
        } while (a !== null);
      }
      np(s);
    } catch (O) {
      (n = O), be === s && s !== null && (be = s = s.return);
      continue;
    }
    break;
  } while (!0);
}
function ep() {
  var t = Wi.current;
  return (Wi.current = Gi), t === null ? Gi : t;
}
function tc() {
  (Ae === 0 || Ae === 3 || Ae === 2) && (Ae = 4),
    Ie === null || (!(Kn & 268435455) && !(da & 268435455)) || on(Ie, Me);
}
function Yi(t, n) {
  var s = ne;
  ne |= 2;
  var r = ep();
  (Ie !== t || Me !== n) && ((Ut = null), Fn(t, n));
  do
    try {
      cx();
      break;
    } catch (i) {
      Jh(t, i);
    }
  while (!0);
  if ((_o(), (ne = s), (Wi.current = r), be !== null)) throw Error(F(261));
  return (Ie = null), (Me = 0), Ae;
}
function cx() {
  for (; be !== null; ) tp(be);
}
function dx() {
  for (; be !== null && !Rm(); ) tp(be);
}
function tp(t) {
  var n = rp(t.alternate, t, st);
  (t.memoizedProps = t.pendingProps),
    n === null ? np(t) : (be = n),
    (qo.current = null);
}
function np(t) {
  var n = t;
  do {
    var s = n.alternate;
    if (((t = n.return), n.flags & 32768)) {
      if (((s = sx(s, n)), s !== null)) {
        (s.flags &= 32767), (be = s);
        return;
      }
      if (t !== null)
        (t.flags |= 32768), (t.subtreeFlags = 0), (t.deletions = null);
      else {
        (Ae = 6), (be = null);
        return;
      }
    } else if (((s = nx(s, n, st)), s !== null)) {
      be = s;
      return;
    }
    if (((n = n.sibling), n !== null)) {
      be = n;
      return;
    }
    be = n = t;
  } while (n !== null);
  Ae === 0 && (Ae = 5);
}
function Rn(t, n, s) {
  var r = re,
    i = mt.transition;
  try {
    (mt.transition = null), (re = 1), ux(t, n, s, r);
  } finally {
    (mt.transition = i), (re = r);
  }
  return null;
}
function ux(t, n, s, r) {
  do ks();
  while (un !== null);
  if (ne & 6) throw Error(F(327));
  s = t.finishedWork;
  var i = t.finishedLanes;
  if (s === null) return null;
  if (((t.finishedWork = null), (t.finishedLanes = 0), s === t.current))
    throw Error(F(177));
  (t.callbackNode = null), (t.callbackPriority = 0);
  var a = s.lanes | s.childLanes;
  if (
    (Hm(t, a),
    t === Ie && ((be = Ie = null), (Me = 0)),
    (!(s.subtreeFlags & 2064) && !(s.flags & 2064)) ||
      ai ||
      ((ai = !0),
      ip(Pi, function () {
        return ks(), null;
      })),
    (a = (s.flags & 15990) !== 0),
    s.subtreeFlags & 15990 || a)
  ) {
    (a = mt.transition), (mt.transition = null);
    var l = re;
    re = 1;
    var o = ne;
    (ne |= 4),
      (qo.current = null),
      ix(t, s),
      qh(s, t),
      If(Ol),
      (zi = !!zl),
      (Ol = zl = null),
      (t.current = s),
      ax(s),
      Mm(),
      (ne = o),
      (re = l),
      (mt.transition = a);
  } else t.current = s;
  if (
    (ai && ((ai = !1), (un = t), (Qi = i)),
    (a = t.pendingLanes),
    a === 0 && (jn = null),
    $m(s.stateNode),
    et(t, Se()),
    n !== null)
  )
    for (r = t.onRecoverableError, s = 0; s < n.length; s++)
      (i = n[s]), r(i.value, { componentStack: i.stack, digest: i.digest });
  if (Ki) throw ((Ki = !1), (t = Jl), (Jl = null), t);
  return (
    Qi & 1 && t.tag !== 0 && ks(),
    (a = t.pendingLanes),
    a & 1 ? (t === eo ? pr++ : ((pr = 0), (eo = t))) : (pr = 0),
    wn(),
    null
  );
}
function ks() {
  if (un !== null) {
    var t = Du(Qi),
      n = mt.transition,
      s = re;
    try {
      if (((mt.transition = null), (re = 16 > t ? 16 : t), un === null))
        var r = !1;
      else {
        if (((t = un), (un = null), (Qi = 0), ne & 6)) throw Error(F(331));
        var i = ne;
        for (ne |= 4, G = t.current; G !== null; ) {
          var a = G,
            l = a.child;
          if (G.flags & 16) {
            var o = a.deletions;
            if (o !== null) {
              for (var c = 0; c < o.length; c++) {
                var d = o[c];
                for (G = d; G !== null; ) {
                  var u = G;
                  switch (u.tag) {
                    case 0:
                    case 11:
                    case 15:
                      ur(8, u, a);
                  }
                  var m = u.child;
                  if (m !== null) (m.return = u), (G = m);
                  else
                    for (; G !== null; ) {
                      u = G;
                      var x = u.sibling,
                        j = u.return;
                      if ((Kh(u), u === d)) {
                        G = null;
                        break;
                      }
                      if (x !== null) {
                        (x.return = j), (G = x);
                        break;
                      }
                      G = j;
                    }
                }
              }
              var f = a.alternate;
              if (f !== null) {
                var g = f.child;
                if (g !== null) {
                  f.child = null;
                  do {
                    var b = g.sibling;
                    (g.sibling = null), (g = b);
                  } while (g !== null);
                }
              }
              G = a;
            }
          }
          if (a.subtreeFlags & 2064 && l !== null) (l.return = a), (G = l);
          else
            e: for (; G !== null; ) {
              if (((a = G), a.flags & 2048))
                switch (a.tag) {
                  case 0:
                  case 11:
                  case 15:
                    ur(9, a, a.return);
                }
              var v = a.sibling;
              if (v !== null) {
                (v.return = a.return), (G = v);
                break e;
              }
              G = a.return;
            }
        }
        var h = t.current;
        for (G = h; G !== null; ) {
          l = G;
          var p = l.child;
          if (l.subtreeFlags & 2064 && p !== null) (p.return = l), (G = p);
          else
            e: for (l = h; G !== null; ) {
              if (((o = G), o.flags & 2048))
                try {
                  switch (o.tag) {
                    case 0:
                    case 11:
                    case 15:
                      ca(9, o);
                  }
                } catch (O) {
                  Ne(o, o.return, O);
                }
              if (o === l) {
                G = null;
                break e;
              }
              var y = o.sibling;
              if (y !== null) {
                (y.return = o.return), (G = y);
                break e;
              }
              G = o.return;
            }
        }
        if (
          ((ne = i), wn(), Ot && typeof Ot.onPostCommitFiberRoot == "function")
        )
          try {
            Ot.onPostCommitFiberRoot(ta, t);
          } catch {}
        r = !0;
      }
      return r;
    } finally {
      (re = s), (mt.transition = n);
    }
  }
  return !1;
}
function Sd(t, n, s) {
  (n = Is(s, n)),
    (n = Dh(t, n, 1)),
    (t = xn(t, n, 1)),
    (n = Ge()),
    t !== null && (_r(t, 1, n), et(t, n));
}
function Ne(t, n, s) {
  if (t.tag === 3) Sd(t, t, s);
  else
    for (; n !== null; ) {
      if (n.tag === 3) {
        Sd(n, t, s);
        break;
      } else if (n.tag === 1) {
        var r = n.stateNode;
        if (
          typeof n.type.getDerivedStateFromError == "function" ||
          (typeof r.componentDidCatch == "function" &&
            (jn === null || !jn.has(r)))
        ) {
          (t = Is(s, t)),
            (t = _h(n, t, 1)),
            (n = xn(n, t, 1)),
            (t = Ge()),
            n !== null && (_r(n, 1, t), et(n, t));
          break;
        }
      }
      n = n.return;
    }
}
function hx(t, n, s) {
  var r = t.pingCache;
  r !== null && r.delete(n),
    (n = Ge()),
    (t.pingedLanes |= t.suspendedLanes & s),
    Ie === t &&
      (Me & s) === s &&
      (Ae === 4 || (Ae === 3 && (Me & 130023424) === Me && 500 > Se() - Xo)
        ? Fn(t, 0)
        : (Zo |= s)),
    et(t, n);
}
function sp(t, n) {
  n === 0 &&
    (t.mode & 1
      ? ((n = qr), (qr <<= 1), !(qr & 130023424) && (qr = 4194304))
      : (n = 1));
  var s = Ge();
  (t = qt(t, n)), t !== null && (_r(t, n, s), et(t, s));
}
function px(t) {
  var n = t.memoizedState,
    s = 0;
  n !== null && (s = n.retryLane), sp(t, s);
}
function mx(t, n) {
  var s = 0;
  switch (t.tag) {
    case 13:
      var r = t.stateNode,
        i = t.memoizedState;
      i !== null && (s = i.retryLane);
      break;
    case 19:
      r = t.stateNode;
      break;
    default:
      throw Error(F(314));
  }
  r !== null && r.delete(n), sp(t, s);
}
var rp;
rp = function (t, n, s) {
  if (t !== null)
    if (t.memoizedProps !== n.pendingProps || Xe.current) Ze = !0;
    else {
      if (!(t.lanes & s) && !(n.flags & 128)) return (Ze = !1), tx(t, n, s);
      Ze = !!(t.flags & 131072);
    }
  else (Ze = !1), me && n.flags & 1048576 && oh(n, Li, n.index);
  switch (((n.lanes = 0), n.tag)) {
    case 2:
      var r = n.type;
      Ni(t, n), (t = n.pendingProps);
      var i = As(n, Ue.current);
      Ns(n, s), (i = Go(null, n, r, t, i, s));
      var a = Wo();
      return (
        (n.flags |= 1),
        typeof i == "object" &&
        i !== null &&
        typeof i.render == "function" &&
        i.$$typeof === void 0
          ? ((n.tag = 1),
            (n.memoizedState = null),
            (n.updateQueue = null),
            Je(r) ? ((a = !0), _i(n)) : (a = !1),
            (n.memoizedState =
              i.state !== null && i.state !== void 0 ? i.state : null),
            Fo(n),
            (i.updater = oa),
            (n.stateNode = i),
            (i._reactInternals = n),
            Vl(n, r, t, s),
            (n = Gl(null, n, r, !0, a, s)))
          : ((n.tag = 0), me && a && Oo(n), Be(null, n, i, s), (n = n.child)),
        n
      );
    case 16:
      r = n.elementType;
      e: {
        switch (
          (Ni(t, n),
          (t = n.pendingProps),
          (i = r._init),
          (r = i(r._payload)),
          (n.type = r),
          (i = n.tag = xx(r)),
          (t = vt(r, t)),
          i)
        ) {
          case 0:
            n = Hl(null, n, r, t, s);
            break e;
          case 1:
            n = pd(null, n, r, t, s);
            break e;
          case 11:
            n = ud(null, n, r, t, s);
            break e;
          case 14:
            n = hd(null, n, r, vt(r.type, t), s);
            break e;
        }
        throw Error(F(306, r, ""));
      }
      return n;
    case 0:
      return (
        (r = n.type),
        (i = n.pendingProps),
        (i = n.elementType === r ? i : vt(r, i)),
        Hl(t, n, r, i, s)
      );
    case 1:
      return (
        (r = n.type),
        (i = n.pendingProps),
        (i = n.elementType === r ? i : vt(r, i)),
        pd(t, n, r, i, s)
      );
    case 3:
      e: {
        if ((Uh(n), t === null)) throw Error(F(387));
        (r = n.pendingProps),
          (a = n.memoizedState),
          (i = a.element),
          mh(t, n),
          Vi(n, r, null, s);
        var l = n.memoizedState;
        if (((r = l.element), a.isDehydrated))
          if (
            ((a = {
              element: r,
              isDehydrated: !1,
              cache: l.cache,
              pendingSuspenseBoundaries: l.pendingSuspenseBoundaries,
              transitions: l.transitions,
            }),
            (n.updateQueue.baseState = a),
            (n.memoizedState = a),
            n.flags & 256)
          ) {
            (i = Is(Error(F(423)), n)), (n = md(t, n, r, s, i));
            break e;
          } else if (r !== i) {
            (i = Is(Error(F(424)), n)), (n = md(t, n, r, s, i));
            break e;
          } else
            for (
              rt = fn(n.stateNode.containerInfo.firstChild),
                it = n,
                me = !0,
                kt = null,
                s = hh(n, null, r, s),
                n.child = s;
              s;

            )
              (s.flags = (s.flags & -3) | 4096), (s = s.sibling);
        else {
          if ((Es(), r === i)) {
            n = Zt(t, n, s);
            break e;
          }
          Be(t, n, r, s);
        }
        n = n.child;
      }
      return n;
    case 5:
      return (
        fh(n),
        t === null && Ll(n),
        (r = n.type),
        (i = n.pendingProps),
        (a = t !== null ? t.memoizedProps : null),
        (l = i.children),
        Rl(r, i) ? (l = null) : a !== null && Rl(r, a) && (n.flags |= 32),
        Fh(t, n),
        Be(t, n, l, s),
        n.child
      );
    case 6:
      return t === null && Ll(n), null;
    case 13:
      return Vh(t, n, s);
    case 4:
      return (
        Uo(n, n.stateNode.containerInfo),
        (r = n.pendingProps),
        t === null ? (n.child = Ts(n, null, r, s)) : Be(t, n, r, s),
        n.child
      );
    case 11:
      return (
        (r = n.type),
        (i = n.pendingProps),
        (i = n.elementType === r ? i : vt(r, i)),
        ud(t, n, r, i, s)
      );
    case 7:
      return Be(t, n, n.pendingProps, s), n.child;
    case 8:
      return Be(t, n, n.pendingProps.children, s), n.child;
    case 12:
      return Be(t, n, n.pendingProps.children, s), n.child;
    case 10:
      e: {
        if (
          ((r = n.type._context),
          (i = n.pendingProps),
          (a = n.memoizedProps),
          (l = i.value),
          oe(Fi, r._currentValue),
          (r._currentValue = l),
          a !== null)
        )
          if (bt(a.value, l)) {
            if (a.children === i.children && !Xe.current) {
              n = Zt(t, n, s);
              break e;
            }
          } else
            for (a = n.child, a !== null && (a.return = n); a !== null; ) {
              var o = a.dependencies;
              if (o !== null) {
                l = a.child;
                for (var c = o.firstContext; c !== null; ) {
                  if (c.context === r) {
                    if (a.tag === 1) {
                      (c = Gt(-1, s & -s)), (c.tag = 2);
                      var d = a.updateQueue;
                      if (d !== null) {
                        d = d.shared;
                        var u = d.pending;
                        u === null
                          ? (c.next = c)
                          : ((c.next = u.next), (u.next = c)),
                          (d.pending = c);
                      }
                    }
                    (a.lanes |= s),
                      (c = a.alternate),
                      c !== null && (c.lanes |= s),
                      Fl(a.return, s, n),
                      (o.lanes |= s);
                    break;
                  }
                  c = c.next;
                }
              } else if (a.tag === 10) l = a.type === n.type ? null : a.child;
              else if (a.tag === 18) {
                if (((l = a.return), l === null)) throw Error(F(341));
                (l.lanes |= s),
                  (o = l.alternate),
                  o !== null && (o.lanes |= s),
                  Fl(l, s, n),
                  (l = a.sibling);
              } else l = a.child;
              if (l !== null) l.return = a;
              else
                for (l = a; l !== null; ) {
                  if (l === n) {
                    l = null;
                    break;
                  }
                  if (((a = l.sibling), a !== null)) {
                    (a.return = l.return), (l = a);
                    break;
                  }
                  l = l.return;
                }
              a = l;
            }
        Be(t, n, i.children, s), (n = n.child);
      }
      return n;
    case 9:
      return (
        (i = n.type),
        (r = n.pendingProps.children),
        Ns(n, s),
        (i = ft(i)),
        (r = r(i)),
        (n.flags |= 1),
        Be(t, n, r, s),
        n.child
      );
    case 14:
      return (
        (r = n.type),
        (i = vt(r, n.pendingProps)),
        (i = vt(r.type, i)),
        hd(t, n, r, i, s)
      );
    case 15:
      return $h(t, n, n.type, n.pendingProps, s);
    case 17:
      return (
        (r = n.type),
        (i = n.pendingProps),
        (i = n.elementType === r ? i : vt(r, i)),
        Ni(t, n),
        (n.tag = 1),
        Je(r) ? ((t = !0), _i(n)) : (t = !1),
        Ns(n, s),
        Mh(n, r, i),
        Vl(n, r, i, s),
        Gl(null, n, r, !0, t, s)
      );
    case 19:
      return Bh(t, n, s);
    case 22:
      return Lh(t, n, s);
  }
  throw Error(F(156, n.tag));
};
function ip(t, n) {
  return zu(t, n);
}
function fx(t, n, s, r) {
  (this.tag = t),
    (this.key = s),
    (this.sibling =
      this.child =
      this.return =
      this.stateNode =
      this.type =
      this.elementType =
        null),
    (this.index = 0),
    (this.ref = null),
    (this.pendingProps = n),
    (this.dependencies =
      this.memoizedState =
      this.updateQueue =
      this.memoizedProps =
        null),
    (this.mode = r),
    (this.subtreeFlags = this.flags = 0),
    (this.deletions = null),
    (this.childLanes = this.lanes = 0),
    (this.alternate = null);
}
function pt(t, n, s, r) {
  return new fx(t, n, s, r);
}
function nc(t) {
  return (t = t.prototype), !(!t || !t.isReactComponent);
}
function xx(t) {
  if (typeof t == "function") return nc(t) ? 1 : 0;
  if (t != null) {
    if (((t = t.$$typeof), t === No)) return 11;
    if (t === ko) return 14;
  }
  return 2;
}
function gn(t, n) {
  var s = t.alternate;
  return (
    s === null
      ? ((s = pt(t.tag, n, t.key, t.mode)),
        (s.elementType = t.elementType),
        (s.type = t.type),
        (s.stateNode = t.stateNode),
        (s.alternate = t),
        (t.alternate = s))
      : ((s.pendingProps = n),
        (s.type = t.type),
        (s.flags = 0),
        (s.subtreeFlags = 0),
        (s.deletions = null)),
    (s.flags = t.flags & 14680064),
    (s.childLanes = t.childLanes),
    (s.lanes = t.lanes),
    (s.child = t.child),
    (s.memoizedProps = t.memoizedProps),
    (s.memoizedState = t.memoizedState),
    (s.updateQueue = t.updateQueue),
    (n = t.dependencies),
    (s.dependencies =
      n === null ? null : { lanes: n.lanes, firstContext: n.firstContext }),
    (s.sibling = t.sibling),
    (s.index = t.index),
    (s.ref = t.ref),
    s
  );
}
function Ci(t, n, s, r, i, a) {
  var l = 2;
  if (((r = t), typeof t == "function")) nc(t) && (l = 1);
  else if (typeof t == "string") l = 5;
  else
    e: switch (t) {
      case as:
        return Un(s.children, i, a, n);
      case yo:
        (l = 8), (i |= 8);
        break;
      case hl:
        return (
          (t = pt(12, s, n, i | 2)), (t.elementType = hl), (t.lanes = a), t
        );
      case pl:
        return (t = pt(13, s, n, i)), (t.elementType = pl), (t.lanes = a), t;
      case ml:
        return (t = pt(19, s, n, i)), (t.elementType = ml), (t.lanes = a), t;
      case fu:
        return ua(s, i, a, n);
      default:
        if (typeof t == "object" && t !== null)
          switch (t.$$typeof) {
            case pu:
              l = 10;
              break e;
            case mu:
              l = 9;
              break e;
            case No:
              l = 11;
              break e;
            case ko:
              l = 14;
              break e;
            case rn:
              (l = 16), (r = null);
              break e;
          }
        throw Error(F(130, t == null ? t : typeof t, ""));
    }
  return (
    (n = pt(l, s, n, i)), (n.elementType = t), (n.type = r), (n.lanes = a), n
  );
}
function Un(t, n, s, r) {
  return (t = pt(7, t, r, n)), (t.lanes = s), t;
}
function ua(t, n, s, r) {
  return (
    (t = pt(22, t, r, n)),
    (t.elementType = fu),
    (t.lanes = s),
    (t.stateNode = { isHidden: !1 }),
    t
  );
}
function Xa(t, n, s) {
  return (t = pt(6, t, null, n)), (t.lanes = s), t;
}
function Ja(t, n, s) {
  return (
    (n = pt(4, t.children !== null ? t.children : [], t.key, n)),
    (n.lanes = s),
    (n.stateNode = {
      containerInfo: t.containerInfo,
      pendingChildren: null,
      implementation: t.implementation,
    }),
    n
  );
}
function jx(t, n, s, r, i) {
  (this.tag = n),
    (this.containerInfo = t),
    (this.finishedWork =
      this.pingCache =
      this.current =
      this.pendingChildren =
        null),
    (this.timeoutHandle = -1),
    (this.callbackNode = this.pendingContext = this.context = null),
    (this.callbackPriority = 0),
    (this.eventTimes = Oa(0)),
    (this.expirationTimes = Oa(-1)),
    (this.entangledLanes =
      this.finishedLanes =
      this.mutableReadLanes =
      this.expiredLanes =
      this.pingedLanes =
      this.suspendedLanes =
      this.pendingLanes =
        0),
    (this.entanglements = Oa(0)),
    (this.identifierPrefix = r),
    (this.onRecoverableError = i),
    (this.mutableSourceEagerHydrationData = null);
}
function sc(t, n, s, r, i, a, l, o, c) {
  return (
    (t = new jx(t, n, s, o, c)),
    n === 1 ? ((n = 1), a === !0 && (n |= 8)) : (n = 0),
    (a = pt(3, null, null, n)),
    (t.current = a),
    (a.stateNode = t),
    (a.memoizedState = {
      element: r,
      isDehydrated: s,
      cache: null,
      transitions: null,
      pendingSuspenseBoundaries: null,
    }),
    Fo(a),
    t
  );
}
function vx(t, n, s) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return {
    $$typeof: is,
    key: r == null ? null : "" + r,
    children: t,
    containerInfo: n,
    implementation: s,
  };
}
function ap(t) {
  if (!t) return kn;
  t = t._reactInternals;
  e: {
    if (Zn(t) !== t || t.tag !== 1) throw Error(F(170));
    var n = t;
    do {
      switch (n.tag) {
        case 3:
          n = n.stateNode.context;
          break e;
        case 1:
          if (Je(n.type)) {
            n = n.stateNode.__reactInternalMemoizedMergedChildContext;
            break e;
          }
      }
      n = n.return;
    } while (n !== null);
    throw Error(F(171));
  }
  if (t.tag === 1) {
    var s = t.type;
    if (Je(s)) return ah(t, s, n);
  }
  return n;
}
function lp(t, n, s, r, i, a, l, o, c) {
  return (
    (t = sc(s, r, !0, t, i, a, l, o, c)),
    (t.context = ap(null)),
    (s = t.current),
    (r = Ge()),
    (i = vn(s)),
    (a = Gt(r, i)),
    (a.callback = n ?? null),
    xn(s, a, i),
    (t.current.lanes = i),
    _r(t, i, r),
    et(t, r),
    t
  );
}
function ha(t, n, s, r) {
  var i = n.current,
    a = Ge(),
    l = vn(i);
  return (
    (s = ap(s)),
    n.context === null ? (n.context = s) : (n.pendingContext = s),
    (n = Gt(a, l)),
    (n.payload = { element: t }),
    (r = r === void 0 ? null : r),
    r !== null && (n.callback = r),
    (t = xn(i, n, l)),
    t !== null && (Ct(t, i, l, a), vi(t, i, l)),
    l
  );
}
function qi(t) {
  if (((t = t.current), !t.child)) return null;
  switch (t.child.tag) {
    case 5:
      return t.child.stateNode;
    default:
      return t.child.stateNode;
  }
}
function Cd(t, n) {
  if (((t = t.memoizedState), t !== null && t.dehydrated !== null)) {
    var s = t.retryLane;
    t.retryLane = s !== 0 && s < n ? s : n;
  }
}
function rc(t, n) {
  Cd(t, n), (t = t.alternate) && Cd(t, n);
}
function gx() {
  return null;
}
var op =
  typeof reportError == "function"
    ? reportError
    : function (t) {
        console.error(t);
      };
function ic(t) {
  this._internalRoot = t;
}
pa.prototype.render = ic.prototype.render = function (t) {
  var n = this._internalRoot;
  if (n === null) throw Error(F(409));
  ha(t, n, null, null);
};
pa.prototype.unmount = ic.prototype.unmount = function () {
  var t = this._internalRoot;
  if (t !== null) {
    this._internalRoot = null;
    var n = t.containerInfo;
    Qn(function () {
      ha(null, t, null, null);
    }),
      (n[Yt] = null);
  }
};
function pa(t) {
  this._internalRoot = t;
}
pa.prototype.unstable_scheduleHydration = function (t) {
  if (t) {
    var n = Lu();
    t = { blockedOn: null, target: t, priority: n };
    for (var s = 0; s < ln.length && n !== 0 && n < ln[s].priority; s++);
    ln.splice(s, 0, t), s === 0 && Uu(t);
  }
};
function ac(t) {
  return !(!t || (t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11));
}
function ma(t) {
  return !(
    !t ||
    (t.nodeType !== 1 &&
      t.nodeType !== 9 &&
      t.nodeType !== 11 &&
      (t.nodeType !== 8 || t.nodeValue !== " react-mount-point-unstable "))
  );
}
function bd() {}
function yx(t, n, s, r, i) {
  if (i) {
    if (typeof r == "function") {
      var a = r;
      r = function () {
        var d = qi(l);
        a.call(d);
      };
    }
    var l = lp(n, r, t, 0, null, !1, !1, "", bd);
    return (
      (t._reactRootContainer = l),
      (t[Yt] = l.current),
      Sr(t.nodeType === 8 ? t.parentNode : t),
      Qn(),
      l
    );
  }
  for (; (i = t.lastChild); ) t.removeChild(i);
  if (typeof r == "function") {
    var o = r;
    r = function () {
      var d = qi(c);
      o.call(d);
    };
  }
  var c = sc(t, 0, !1, null, null, !1, !1, "", bd);
  return (
    (t._reactRootContainer = c),
    (t[Yt] = c.current),
    Sr(t.nodeType === 8 ? t.parentNode : t),
    Qn(function () {
      ha(n, c, s, r);
    }),
    c
  );
}
function fa(t, n, s, r, i) {
  var a = s._reactRootContainer;
  if (a) {
    var l = a;
    if (typeof i == "function") {
      var o = i;
      i = function () {
        var c = qi(l);
        o.call(c);
      };
    }
    ha(n, l, t, i);
  } else l = yx(s, n, t, i, r);
  return qi(l);
}
_u = function (t) {
  switch (t.tag) {
    case 3:
      var n = t.stateNode;
      if (n.current.memoizedState.isDehydrated) {
        var s = nr(n.pendingLanes);
        s !== 0 &&
          (bo(n, s | 1), et(n, Se()), !(ne & 6) && ((zs = Se() + 500), wn()));
      }
      break;
    case 13:
      Qn(function () {
        var r = qt(t, 1);
        if (r !== null) {
          var i = Ge();
          Ct(r, t, 1, i);
        }
      }),
        rc(t, 1);
  }
};
wo = function (t) {
  if (t.tag === 13) {
    var n = qt(t, 134217728);
    if (n !== null) {
      var s = Ge();
      Ct(n, t, 134217728, s);
    }
    rc(t, 134217728);
  }
};
$u = function (t) {
  if (t.tag === 13) {
    var n = vn(t),
      s = qt(t, n);
    if (s !== null) {
      var r = Ge();
      Ct(s, t, n, r);
    }
    rc(t, n);
  }
};
Lu = function () {
  return re;
};
Fu = function (t, n) {
  var s = re;
  try {
    return (re = t), n();
  } finally {
    re = s;
  }
};
Cl = function (t, n, s) {
  switch (n) {
    case "input":
      if ((jl(t, s), (n = s.name), s.type === "radio" && n != null)) {
        for (s = t; s.parentNode; ) s = s.parentNode;
        for (
          s = s.querySelectorAll(
            "input[name=" + JSON.stringify("" + n) + '][type="radio"]',
          ),
            n = 0;
          n < s.length;
          n++
        ) {
          var r = s[n];
          if (r !== t && r.form === t.form) {
            var i = ia(r);
            if (!i) throw Error(F(90));
            ju(r), jl(r, i);
          }
        }
      }
      break;
    case "textarea":
      gu(t, s);
      break;
    case "select":
      (n = s.value), n != null && js(t, !!s.multiple, n, !1);
  }
};
wu = Jo;
Au = Qn;
var Nx = { usingClientEntryPoint: !1, Events: [Lr, ds, ia, Cu, bu, Jo] },
  qs = {
    findFiberByHostInstance: Mn,
    bundleType: 0,
    version: "18.3.1",
    rendererPackageName: "react-dom",
  },
  kx = {
    bundleType: qs.bundleType,
    version: qs.version,
    rendererPackageName: qs.rendererPackageName,
    rendererConfig: qs.rendererConfig,
    overrideHookState: null,
    overrideHookStateDeletePath: null,
    overrideHookStateRenamePath: null,
    overrideProps: null,
    overridePropsDeletePath: null,
    overridePropsRenamePath: null,
    setErrorHandler: null,
    setSuspenseHandler: null,
    scheduleUpdate: null,
    currentDispatcherRef: tn.ReactCurrentDispatcher,
    findHostInstanceByFiber: function (t) {
      return (t = Pu(t)), t === null ? null : t.stateNode;
    },
    findFiberByHostInstance: qs.findFiberByHostInstance || gx,
    findHostInstancesForRefresh: null,
    scheduleRefresh: null,
    scheduleRoot: null,
    setRefreshHandler: null,
    getCurrentFiber: null,
    reconcilerVersion: "18.3.1-next-f1338f8080-20240426",
  };
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
  var li = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!li.isDisabled && li.supportsFiber)
    try {
      (ta = li.inject(kx)), (Ot = li);
    } catch {}
}
lt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Nx;
lt.createPortal = function (t, n) {
  var s = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!ac(n)) throw Error(F(200));
  return vx(t, n, null, s);
};
lt.createRoot = function (t, n) {
  if (!ac(t)) throw Error(F(299));
  var s = !1,
    r = "",
    i = op;
  return (
    n != null &&
      (n.unstable_strictMode === !0 && (s = !0),
      n.identifierPrefix !== void 0 && (r = n.identifierPrefix),
      n.onRecoverableError !== void 0 && (i = n.onRecoverableError)),
    (n = sc(t, 1, !1, null, null, s, !1, r, i)),
    (t[Yt] = n.current),
    Sr(t.nodeType === 8 ? t.parentNode : t),
    new ic(n)
  );
};
lt.findDOMNode = function (t) {
  if (t == null) return null;
  if (t.nodeType === 1) return t;
  var n = t._reactInternals;
  if (n === void 0)
    throw typeof t.render == "function"
      ? Error(F(188))
      : ((t = Object.keys(t).join(",")), Error(F(268, t)));
  return (t = Pu(n)), (t = t === null ? null : t.stateNode), t;
};
lt.flushSync = function (t) {
  return Qn(t);
};
lt.hydrate = function (t, n, s) {
  if (!ma(n)) throw Error(F(200));
  return fa(null, t, n, !0, s);
};
lt.hydrateRoot = function (t, n, s) {
  if (!ac(t)) throw Error(F(405));
  var r = (s != null && s.hydratedSources) || null,
    i = !1,
    a = "",
    l = op;
  if (
    (s != null &&
      (s.unstable_strictMode === !0 && (i = !0),
      s.identifierPrefix !== void 0 && (a = s.identifierPrefix),
      s.onRecoverableError !== void 0 && (l = s.onRecoverableError)),
    (n = lp(n, null, t, 1, s ?? null, i, !1, a, l)),
    (t[Yt] = n.current),
    Sr(t),
    r)
  )
    for (t = 0; t < r.length; t++)
      (s = r[t]),
        (i = s._getVersion),
        (i = i(s._source)),
        n.mutableSourceEagerHydrationData == null
          ? (n.mutableSourceEagerHydrationData = [s, i])
          : n.mutableSourceEagerHydrationData.push(s, i);
  return new pa(n);
};
lt.render = function (t, n, s) {
  if (!ma(n)) throw Error(F(200));
  return fa(null, t, n, !1, s);
};
lt.unmountComponentAtNode = function (t) {
  if (!ma(t)) throw Error(F(40));
  return t._reactRootContainer
    ? (Qn(function () {
        fa(null, null, t, !1, function () {
          (t._reactRootContainer = null), (t[Yt] = null);
        });
      }),
      !0)
    : !1;
};
lt.unstable_batchedUpdates = Jo;
lt.unstable_renderSubtreeIntoContainer = function (t, n, s, r) {
  if (!ma(s)) throw Error(F(200));
  if (t == null || t._reactInternals === void 0) throw Error(F(38));
  return fa(t, n, s, !1, r);
};
lt.version = "18.3.1-next-f1338f8080-20240426";
function cp() {
  if (
    !(
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
    )
  )
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(cp);
    } catch (t) {
      console.error(t);
    }
}
cp(), (cu.exports = lt);
var lc = cu.exports,
  dp,
  wd = lc;
(dp = wd.createRoot), wd.hydrateRoot;
const xa = "0.14.5",
  te = ({ children: t, size: n = 22 }) =>
    e.jsx("svg", {
      width: n,
      height: n,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.7",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
      children: t,
    }),
  Wt = () =>
    e.jsxs(te, {
      children: [
        e.jsx("rect", { x: "4", y: "5", width: "16", height: "15", rx: "3" }),
        e.jsx("path", { d: "M8 3v4M16 3v4M4 10h16" }),
      ],
    }),
  Ss = () =>
    e.jsx(te, {
      children: e.jsx("path", {
        d: "M3.5 7.5a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z",
      }),
    }),
  An = ({ size: t }) =>
    e.jsxs(te, {
      size: t,
      children: [
        e.jsx("path", {
          d: "M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9.5A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5z",
        }),
        e.jsx("path", { d: "M14 3.5V8h4M8.5 12.5h7M8.5 16h5" }),
      ],
    }),
  Ur = () =>
    e.jsxs(te, {
      children: [
        e.jsx("circle", { cx: "12", cy: "12", r: "8.5" }),
        e.jsx("path", { d: "M12 7.5V12l3 2" }),
      ],
    }),
  Re = () =>
    e.jsx(te, { size: 20, children: e.jsx("path", { d: "m14.5 6-6 6 6 6" }) }),
  ve = () =>
    e.jsx(te, { size: 20, children: e.jsx("path", { d: "m9.5 6 6 6-6 6" }) }),
  _t = () =>
    e.jsx(te, { size: 18, children: e.jsx("path", { d: "m6 9.5 6 6 6-6" }) }),
  so = () =>
    e.jsx(te, {
      size: 20,
      children: e.jsx("path", { d: "M6 6l12 12M18 6 6 18" }),
    }),
  up = () =>
    e.jsx(te, {
      size: 18,
      children: e.jsx("path", {
        d: "M9 7h10M9 12h10M9 17h10M5 7h.01M5 12h.01M5 17h.01",
      }),
    }),
  hp = () =>
    e.jsx(te, {
      size: 18,
      children: e.jsx("path", {
        d: "M19.5 12a7.5 7.5 0 0 1-13 5.1M4.5 12A7.5 7.5 0 0 1 17.5 6.9M17.5 3.5v3.4h-3.4M6.5 20.5v-3.4h3.4",
      }),
    }),
  Ad = () =>
    e.jsx(te, {
      size: 16,
      children: e.jsx("path", {
        d: "m20 11.5-8 8a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.700 4.700L9.700 17.200a1.700 1.700 0 0 1-2.400-2.400L14.500 7.500",
      }),
    }),
  Sx = () =>
    e.jsxs(te, {
      size: 16,
      children: [
        e.jsx("rect", { x: "8", y: "8", width: "11", height: "11", rx: "2" }),
        e.jsx("path", { d: "M5 15V6a2 2 0 0 1 2-2h8" }),
      ],
    }),
  Ed = () =>
    e.jsx(te, {
      size: 16,
      children: e.jsx("path", {
        d: "M14 5h5v5M19 5l-8 8M18 14v4a1.500 1.500 0 0 1-1.500 1.500h-10A1.500 1.500 0 0 1 5 18V8a1.500 1.500 0 0 1 1.500-1.500H10",
      }),
    }),
  ja = () =>
    e.jsx(te, {
      size: 34,
      children: e.jsx("path", {
        d: "M4 20h16M6 20V9l6-4 6 4v11M9.500 20v-5h5v5M9.500 11.500h.01M14.500 11.500h.01",
      }),
    }),
  oc = () =>
    e.jsx(te, {
      size: 18,
      children: e.jsx("path", {
        d: "M12 16V5M7.500 9.500 12 5l4.500 4.500M5 19h14",
      }),
    }),
  pp = () =>
    e.jsxs(te, {
      children: [
        e.jsx("path", {
          d: "M5 7.5h3l1.5-2h5l1.5 2h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z",
        }),
        e.jsx("circle", { cx: "12", cy: "13", r: "3.5" }),
      ],
    }),
  mp = () =>
    e.jsx(te, {
      size: 18,
      children: e.jsx("path", { d: "m6.5 12 3.5 3.5 7.5-8" }),
    }),
  tt = () => e.jsx(te, { children: e.jsx("path", { d: "M12 5v14M5 12h14" }) }),
  cc = () =>
    e.jsx(te, {
      children: e.jsx("path", {
        d: "M4 15a8 8 0 0 1 16 0M3 15h18M9 7v5M15 7v5",
      }),
    }),
  dc = () =>
    e.jsxs(te, {
      children: [
        e.jsx("circle", { cx: "5", cy: "12", r: "1", fill: "currentColor" }),
        e.jsx("circle", { cx: "12", cy: "12", r: "1", fill: "currentColor" }),
        e.jsx("circle", { cx: "19", cy: "12", r: "1", fill: "currentColor" }),
      ],
    }),
  fp = () =>
    e.jsx(te, {
      children: e.jsx("path", {
        d: "M6.5 10a5.5 5.5 0 0 1 11 0v3.5l1.5 2.5H5l1.5-2.5zM9.5 19a3 3 0 0 0 5 0",
      }),
    }),
  Cx = () =>
    e.jsx(te, {
      children: e.jsx("path", {
        d: "m5 16-1-3 2-5h12l2 5-1 3zM7 16v2M17 16v2M7 12h.01M17 12h.01",
      }),
    }),
  va = () =>
    e.jsxs(te, {
      children: [
        e.jsx("circle", { cx: "9", cy: "9", r: "3" }),
        e.jsx("circle", { cx: "17", cy: "10", r: "2" }),
        e.jsx("path", {
          d: "M3.5 19a5.5 5.5 0 0 1 11 0M14 16a4 4 0 0 1 6.5 3",
        }),
      ],
    }),
  Zi = () =>
    e.jsx(te, {
      children: e.jsx("path", { d: "M18 6.5A7 7 0 1 0 18 17.5M5 10h9M5 14h8" }),
    }),
  wt = () =>
    e.jsx(te, {
      children: e.jsx("path", {
        d: "M7 3.5h7l4 4V20H7zM14 3.5V8h4M10 12h5M10 15.5h5",
      }),
    }),
  Xn = () =>
    e.jsxs(te, {
      children: [
        e.jsx("circle", { cx: "12", cy: "8", r: "3" }),
        e.jsx("path", { d: "M5.5 20a6.5 6.5 0 0 1 13 0M4 4h16v16H4z" }),
      ],
    }),
  xp = () =>
    e.jsx(te, {
      children: e.jsx("path", {
        d: "M4 20V5M4 20h16M8 17v-5M12 17V8M16 17v-8M20 17V4",
      }),
    }),
  bx = () =>
    e.jsxs(te, {
      children: [
        e.jsx("path", { d: "M8 2.8v4M16 2.8v4" }),
        e.jsx("rect", {
          x: "3.5",
          y: "5",
          width: "17",
          height: "16",
          rx: "2.5",
        }),
        e.jsx("path", { d: "M3.5 9.5h17M8 13h3v3H8z" }),
      ],
    }),
  ro = () =>
    e.jsx(te, {
      children: e.jsx("path", {
        d: "m4.5 6.5 1.6 1.6 2.8-3M11 7h8M4.5 12l1.6 1.6 2.8-3M11 12.5h8M4.5 17.5l1.6 1.6 2.8-3M11 18h8",
      }),
    }),
  Td = () =>
    e.jsx(te, {
      children: e.jsx("path", {
        d: "M20 11.5a7.5 7.5 0 0 1-8 7.5 8.8 8.8 0 0 1-3.4-.7L4 20l1.5-4A7.6 7.6 0 1 1 20 11.5z",
      }),
    }),
  io = () =>
    e.jsx(te, {
      children: e.jsx("path", {
        d: "M3 3v18h18M6.5 16.5l4-4 3 2 5-6M16 8.5h2.5V11",
      }),
    }),
  ga = () =>
    e.jsx(te, {
      children: e.jsx("path", {
        d: "m12 3 8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9M8 5.2l8 4.5",
      }),
    }),
  ya = () =>
    e.jsxs(te, {
      children: [
        e.jsx("path", {
          d: "M3.5 12s3.2-6 8.5-6 8.5 6 8.5 6-3.2 6-8.5 6-8.5-6-8.5-6z",
        }),
        e.jsx("circle", { cx: "12", cy: "12", r: "2.5" }),
      ],
    }),
  jp = () =>
    e.jsxs(te, {
      children: [
        e.jsx("circle", { cx: "12", cy: "12", r: "3" }),
        e.jsx("path", {
          d: "M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1z",
        }),
      ],
    }),
  Os = () =>
    e.jsxs(te, {
      children: [
        e.jsx("rect", {
          x: "3.5",
          y: "5",
          width: "17",
          height: "14",
          rx: "2.5",
        }),
        e.jsx("path", { d: "m8.5 10-2 2 2 2M15.5 10l2 2-2 2M13.5 8.5l-3 7" }),
      ],
    });
function wx({ s: t }) {
  const n = e.jsx("circle", { cx: "12", cy: "12", r: "8.500" }),
    s = {
      in_lavorazione: e.jsxs(e.Fragment, {
        children: [
          e.jsx("path", { d: "M12 3.500a8.500 8.500 0 1 0 8.500 8.500" }),
          e.jsx("path", { d: "M12 8v4l2.500 1.500" }),
        ],
      }),
      da_rivedere: e.jsxs(e.Fragment, {
        children: [n, e.jsx("path", { d: "M12 7.500v5M12 16h.01" })],
      }),
      scaduta: e.jsxs(e.Fragment, {
        children: [n, e.jsx("path", { d: "m9 9 6 6M15 9l-6 6" })],
      }),
      in_scadenza: e.jsxs(e.Fragment, {
        children: [n, e.jsx("path", { d: "M12 7.500V12l3 2" })],
      }),
      validata: e.jsxs(e.Fragment, {
        children: [
          n,
          e.jsx("path", { d: "m8.500 12.200 2.500 2.500 4.500-5" }),
        ],
      }),
    };
  return e.jsx(te, { size: 16, children: s[t] });
}
const Zs = {
    tasks: "02_TaskManager",
    notes: "03_Note",
    hours: "04_Ore",
    dv: "#DV",
    insight: "#InsightData",
  },
  Ax = {
    numero: ["n", "n°", "no", "numero"],
    assegnatario: ["assigned to", "assignedto"],
    tipologia: ["typology"],
    progetto: ["project"],
    descrizione: ["task description"],
    linkServer: ["link server"],
    immagini: ["image", "images"],
    priorita: ["priority"],
    titolo: ["task name"],
    inizio: ["start date"],
    scadenza: ["dead line", "deadline"],
    timing: ["timing"],
    stato: ["status"],
    shared: ["shared"],
    completed: ["completed"],
    dataChiusura: ["date"],
    notValidated: ["not validated"],
    validated: ["validated"],
    commenti: ["comments", "comment"],
  },
  Ex = [
    "assegnatario",
    "progetto",
    "descrizione",
    "scadenza",
    "completed",
    "validated",
    "commenti",
  ],
  Tx = 10,
  Pd = { column: 4, firstRow: 5 },
  el = { projectCol: 11, statusCol: 14, statusCols: [14, 13] },
  Id = {
    firstRow: 3,
    cols: {
      progetto: 1,
      autore: 2,
      creata: 3,
      testo: 4,
      stato: 5,
      chiusa: 6,
      marker: 7,
    },
  },
  zd = { header: "P:", note: "N:" },
  ns = {
    dateRow: 2,
    firstRow: 3,
    personCol: 1,
    projectCol: 2,
    noteCol: 3,
    firstDayCol: 4,
  },
  Px = "OFF",
  Ix = { P16: "P13" },
  PROJECT_STATUS_OPTIONS = [
    {
      value: "Planning",
      description: "Commessa pianificata o in fase pre-contrattuale",
    },
    { value: "Active", description: "Commessa in lavorazione" },
    {
      value: "On Hold",
      description: "Commessa temporaneamente sospesa o bloccata",
    },
    { value: "Completed", description: "Attività concluse" },
    { value: "Archived", description: "Commessa chiusa e archiviata" },
  ],
  normalizeProjectStatus = (t) => {
    const n = se(t);
    return ["planning", "pianificazione", "standby", "standbyproject"].includes(n)
      ? "Planning"
      : ["active", "attivo", "attiva", "attivi"].includes(n)
        ? "Active"
        : ["onhold", "sospeso", "sospesa", "fermo", "fermi", "freeze"].includes(n)
          ? "On Hold"
          : ["completed", "concluso", "conclusa", "conclusi"].includes(n)
            ? "Completed"
            : ["archived", "archiviato", "archiviata", "storico", "storici"].includes(n)
              ? "Archived"
              : String(t || "Archived");
  },
  projectStatusSlug = (t) =>
    normalizeProjectStatus(t).toLowerCase().replace(/\s+/g, "-"),
  zx = PROJECT_STATUS_OPTIONS.map((t) => t.value),
  Ox = [
    {
      id: "fdallo",
      label: "Francesco Dall'O'",
      match: (t) => t.startsWith("francescodall"),
    },
    {
      id: "dmastro",
      label: "Doriana Mastro",
      match: (t) => t === "dorianamastro",
    },
  ],
  Rx = "Europe/Rome";
function mr(t = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: Rx,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(t);
}
const Rs = (t) => {
    const [n, s, r] = t.split("-").map(Number);
    return Date.UTC(n, s - 1, r);
  },
  uc = (t) => new Date(t).toISOString().slice(0, 10),
  Sn = (t, n) => uc(Rs(t) + n * 864e5),
  Mx = (t, n) => Math.round((Rs(t) - Rs(n)) / 864e5),
  hc = (t) => (new Date(Rs(t)).getUTCDay() + 6) % 7,
  tl = (t) => typeof t == "string" && /^\d{4}-\d{2}-\d{2}$/.test(t);
function Dx(t) {
  return uc(Date.UTC(1899, 11, 30) + Math.floor(t) * 864e5);
}
function Cs(t) {
  if (typeof t == "number" && t > 36526 && t < 73050) return Dx(t);
  if (typeof t != "string") return;
  const n = t.trim();
  let s = n.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/);
  if (s) return Od(+s[3], +s[2], +s[1]);
  if (((s = n.match(/^(\d{4})-(\d{2})-(\d{2})/)), s))
    return Od(+s[1], +s[2], +s[3]);
}
function Od(t, n, s) {
  const r = `${t}-${String(n).padStart(2, "0")}-${String(s).padStart(2, "0")}`;
  return uc(Rs(r)) === r ? r : void 0;
}
function _x(t) {
  if (typeof t == "number" && t > 0 && t < 1) {
    const n = Math.round(t * 1440);
    return `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
  }
  if (typeof t == "string") {
    const n = t.trim().match(/^(\d{1,2})[:.](\d{2})/);
    if (n) return `${n[1].padStart(2, "0")}:${n[2]}`;
  }
}
const Na = (t) => new Intl.DateTimeFormat("it-IT", { timeZone: "UTC", ...t }),
  ka = (t) => new Date(Rs(t)),
  $n = (t) =>
    Na({ day: "numeric", month: "short" }).format(ka(t)).replace(".", ""),
  Kt = (t) =>
    Na({ day: "numeric", month: "long", year: "numeric" }).format(ka(t)),
  vp = (t) => {
    const n = Na({ weekday: "long", day: "numeric", month: "long" }).format(
      ka(t),
    );
    return n.charAt(0).toUpperCase() + n.slice(1);
  },
  $x = (t) => Na({ month: "long", year: "numeric" }).format(ka(t)),
  se = (t) =>
    String(t ?? "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
function Ms(t) {
  const n = String(t ?? "")
    .trim()
    .match(/^([A-Za-z]+[0-9]+)(?=$|[\s_-])/);
  if (!n) return "";
  const s = n[1].toUpperCase();
  return Ix[s] ?? s;
}
function gp(t) {
  return (
    String(t)
      .trim()
      .replace(/^[A-Za-z]+[0-9]+[\s_-]*/, "")
      .replace(/_/g, " ")
      .trim() || String(t).trim()
  );
}
const yp = (t) => {
    let n = 5381;
    for (let s = 0; s < t.length; s++) n = ((n << 5) + n + t.charCodeAt(s)) | 0;
    return (n >>> 0).toString(36);
  },
  le = (t) => (t == null ? "" : String(t).trim()),
  nl = (t) =>
    t === !0 ||
    (typeof t == "string" &&
      ["true", "vero", "si", "sì", "x", "1"].includes(
        t.trim().toLowerCase(),
      )) ||
    t === 1;
function Xs(t, n) {
  const s = Object.keys(t).find((r) => se(r) === se(n));
  return s ? t[s] : void 0;
}
function Lx(t) {
  const n = normalizeProjectStatus(t);
  return PROJECT_STATUS_OPTIONS.some((s) => s.value === n) ? n : void 0;
}
function Fx(t, n, s) {
  var o;
  if (!t)
    return (
      s.push(
        "Scheda #DV non trovata: elenco progetti ricavato solo dai dati collegati.",
      ),
      []
    );
  const r = new Map();
  if (n) {
    const c = el.statusCols ?? [el.statusCol];
    for (let d = 0; d < n.length; d++) {
      const u = n[d] ?? [],
        m = Ms(le(u[el.projectCol - 1]));
      if (!m) continue;
      const x = c.map((j) => Lx(u[j - 1])).filter(Boolean);
      if (x.length) {
        if (
          (new Set(x).size > 1 &&
            s.push(
              `Stati contrastanti per ${m} alla riga ${d + 1}: usato ${x[0]} secondo la precedenza delle colonne.`,
            ),
          r.has(m) && r.get(m) !== x[0])
        ) {
          s.push(
            `Stati contrastanti su più righe per ${m}: conservato ${r.get(m)}.`,
          );
          continue;
        }
        r.set(m, x[0]);
      }
    }
  } else
    s.push("Scheda #InsightData non trovata: stati progetto non disponibili.");
  const i = [],
    a = new Set();
  for (let c = Pd.firstRow - 1; c < t.length; c++) {
    const d = le((o = t[c]) == null ? void 0 : o[Pd.column - 1]);
    if (!d || d.toUpperCase() === "ND") continue;
    const u = Ms(d);
    if (u) {
      if (a.has(u)) {
        s.push(`Codice duplicato in #DV: ${u}`);
        continue;
      }
      a.add(u),
        i.push({
          id: u,
          codice: u,
          nome: gp(d),
          stato: r.get(u) || "Non indicato",
          ordine: i.length,
          inElenco: !0,
        });
    }
  }
  const l = i.filter((c) => c.stato === "Non indicato");
  return (
    n &&
      l.length &&
      s.push(
        `Stato progetto non riconosciuto per: ${l.map((c) => c.codice).join(", ")}. I progetti sono visibili nel filtro Tutti.`,
      ),
    i
  );
}
function Ux(t, n, s) {
  let r = null;
  for (let i = 0; i < Math.min(s, t.length); i++) {
    const a = {};
    let l = 0;
    (t[i] ?? []).forEach((o, c) => {
      const d = se(o);
      if (d) {
        for (const u of Object.keys(n))
          if (a[u] === void 0 && n[u].some((m) => se(m) === d)) {
            (a[u] = c), l++;
            break;
          }
      }
    }),
      (!r || l > r.n) && (r = { row: i, cols: a, n: l });
  }
  return r && r.n >= 3 ? r : null;
}
const Np = {
    validata: "Validata",
    da_rivedere: "Da rivedere",
    scaduta: "Scaduta",
    in_scadenza: "In scadenza",
    in_lavorazione: "In corso",
  },
  Rd = {
    validata: "👍",
    da_rivedere: "⚠️",
    scaduta: "☠️",
    in_scadenza: "⏰",
    in_lavorazione: "⚙️",
  },
  Vx = (t) => !!((t.titolo || "").trim() || (t.descrizione || "").trim());
function Ce(t, n) {
  return t.validated && t.completed && t.dataChiusura
    ? "validata"
    : (t.commenti || "").trim()
      ? "da_rivedere"
      : t.scadenza && t.scadenza < n
        ? "scaduta"
        : t.scadenza && t.scadenza <= Sn(n, 1)
          ? "in_scadenza"
          : "in_lavorazione";
}
const qe = (t, n) => Ce(t, n) !== "validata";
function Bx(t, n) {
  if (!t.scadenza) return { kind: "none", days: 0 };
  const s = Mx(t.scadenza, n);
  return {
    kind:
      s < 0 ? "overdue" : s === 0 ? "today" : s === 1 ? "tomorrow" : "future",
    days: s,
  };
}
const Md = {
  scaduta: 0,
  da_rivedere: 1,
  in_scadenza: 2,
  in_lavorazione: 3,
  validata: 4,
};
function kp(t) {
  return (n, s) =>
    Md[Ce(n, t)] - Md[Ce(s, t)] ||
    (n.scadenza ?? "9999").localeCompare(s.scadenza ?? "9999");
}
function Hx(t, n, s = mr()) {
  if (!t) return n.push("Scheda 02_TaskManager non trovata."), [];
  const r = Ux(t, Ax, Tx);
  if (!r)
    return n.push("Task Manager: riga di intestazione non riconosciuta."), [];
  const i = Ex.filter((d) => r.cols[d] === void 0);
  i.length &&
    n.push(
      `Task Manager: intestazioni mancanti (${i.join(", ")}). Campi correlati vuoti.`,
    );
  const a = r.cols,
    l = (d, u) => (a[u] === void 0 ? void 0 : d[a[u]]),
    o = [];
  let c = 0;
  for (let d = r.row + 1; d < t.length; d++) {
    const u = t[d] ?? [],
      m = le(l(u, "titolo")),
      x = le(l(u, "descrizione"));
    if (!Vx({ titolo: m, descrizione: x })) continue;
    const j = le(l(u, "progetto")),
      f = l(u, "scadenza"),
      g = le(l(u, "numero")),
      b = {
        id: `T${g || "_"}-${yp(j + m + x.slice(0, 60))}`,
        numero: g,
        progettoCodice: Ms(j),
        assegnatario: le(l(u, "assegnatario")),
        tipologia: le(l(u, "tipologia")),
        priorita: le(l(u, "priorita")),
        titolo: m,
        descrizione: x,
        inizio: Cs(l(u, "inizio")),
        scadenza: Cs(f),
        orario: _x(l(u, "timing")) ?? (le(l(u, "timing")) || void 0),
        statoSorgente: le(l(u, "stato")),
        completed: nl(l(u, "completed")),
        dataChiusura: Cs(l(u, "dataChiusura")),
        validated: nl(l(u, "validated")),
        notValidated: nl(l(u, "notValidated")),
        commenti: le(l(u, "commenti")),
        immagini: le(l(u, "immagini"))
          .split(/\r?\n|\s{2,}/)
          .map((h) => h.trim())
          .filter(Boolean),
        linkServer: le(l(u, "linkServer")),
        sharedRaw: le(l(u, "shared")),
      };
    b.progettoCodice ||
      n.push(
        `Task "${m || x.slice(0, 30)}": progetto senza codice riconoscibile ("${j}").`,
      ),
      f != null &&
        le(f) &&
        !b.scadenza &&
        n.push(
          `Task "${m || x.slice(0, 30)}": scadenza non interpretabile ("${le(f)}").`,
        );
    const v = Object.values(Rd).find((h) =>
      b.statoSorgente.includes(h.replace("️", "")),
    );
    v && v !== Rd[Ce(b, s)] && c++, o.push(b);
  }
  return (
    c &&
      n.push(
        `${c} task con stato calcolato diverso dall'icona nella colonna STATUS: verificare la formula attuale del foglio.`,
      ),
    o
  );
}
const Gx = (t) =>
  /chius/i.test(t) ? "chiusa" : /corso/i.test(t) ? "in_corso" : "aperta";
function Wx(t, n) {
  const s = new Map(),
    r = [];
  if (!t) return n.push("Scheda 03_Note non trovata."), { note: r, blocchi: s };
  const i = Id.cols;
  for (let a = Id.firstRow - 1; a < t.length; a++) {
    const l = t[a] ?? [],
      o = le(l[i.marker - 1]);
    if (o.startsWith(zd.header)) {
      s.set(Ms(o.slice(2)), le(l[i.progetto - 1]));
      continue;
    }
    if (!o.startsWith(zd.note)) {
      l.some((x) => le(x)) &&
        n.push(`03_Note riga ${a + 1}: contenuto senza marcatore, ignorato.`);
      continue;
    }
    const c = le(l[i.testo - 1]);
    if (!c) continue;
    const d = Ms(o.slice(2)),
      u = le(l[i.autore - 1]),
      m = Cs(l[i.creata - 1]);
    r.push({
      id: `N-${d}-${m ?? "_"}-${yp(u + c)}`,
      progettoCodice: d,
      autore: u,
      creata: m,
      testo: c,
      stato: Gx(le(l[i.stato - 1])),
      chiusa: Cs(l[i.chiusa - 1]),
    });
  }
  return { note: r, blocchi: s };
}
function Kx(t) {
  if (t == null) return "skip";
  if (typeof t == "number") return Number.isFinite(t) ? t : "bad";
  const n = String(t).trim();
  return n === "" || n === "-" || n === "–"
    ? "skip"
    : n.toUpperCase() === Px
      ? "off"
      : /^\d+([.,]\d+)?$/.test(n)
        ? parseFloat(n.replace(",", "."))
        : "bad";
}
function Qx(t, n) {
  const s = {
    regs: [],
    people: [],
    stats: { off: 0, unexpected: 0, dateCols: 0 },
  };
  if (!t) return n.push("Scheda 04_Ore non trovata."), s;
  const r = t[ns.dateRow - 1] ?? [],
    i = new Map(),
    a = new Set();
  for (let d = ns.firstDayCol - 1; d < r.length; d++) {
    const u = Cs(r[d]);
    if (u) {
      if (a.has(u)) {
        n.push(
          `04_Ore: data duplicata in intestazione (${u}), seconda colonna ignorata.`,
        );
        continue;
      }
      a.add(u), i.set(d, u);
    }
  }
  (s.stats.dateCols = i.size),
    i.size || n.push("04_Ore: nessuna data riconosciuta nella riga 2.");
  let l = "";
  const o = new Map(),
    c = new Set();
  for (let d = ns.firstRow - 1; d < t.length; d++) {
    const u = t[d] ?? [],
      m = le(u[ns.personCol - 1]),
      x = le(u[ns.projectCol - 1]);
    if (m && !x) {
      (l = m), c.add(m);
      continue;
    }
    if ((m && ((l = m), c.add(m)), !x || !l)) continue;
    const j = Ms(x);
    if (!j) {
      n.push(
        `04_Ore riga ${d + 1}: progetto senza codice ("${x}"), riga saltata.`,
      );
      continue;
    }
    const f = le(u[ns.noteCol - 1]) || void 0;
    for (const [g, b] of i) {
      const v = Kx(u[g]);
      if (v === "skip") continue;
      if (v === "off") {
        s.stats.off++;
        continue;
      }
      if (v === "bad") {
        s.stats.unexpected++;
        continue;
      }
      const h = `${l}|${j}|${b}`,
        p = (o.get(h) ?? 0) + 1;
      o.set(h, p),
        s.regs.push({
          id: p > 1 ? `${h}#${p}` : h,
          persona: l,
          progettoCodice: j,
          data: b,
          ore: v,
          nota: f,
        });
    }
  }
  return (
    s.stats.unexpected &&
      n.push(
        `04_Ore: ${s.stats.unexpected} celle con testo/errore inatteso, non contate come ore.`,
      ),
    (s.people = [...c]),
    s
  );
}
const Xt = {
    architect: "Architect",
    senior_architect: "Senior Architect",
    partner_architect: "Partner Architect",
    property: "Property",
    reception: "Reception",
    interior_head: "Responsabile Interior Department",
    concept_head: "Responsabile Concept Department",
    visual_head: "Responsabile Visual Department",
    hr_manager: "HR Manager",
  },
  Vn = [
    {
      id: "fdiamanti",
      nome: "Francesco Diamanti",
      email: "francesco.diamanti@archea.it",
      demoPassword: "demo",
      ruolo: "responsabile",
      appRole: "partner_architect",
    },
    {
      id: "abotrini",
      nome: "Alessandro Botrini",
      email: "alessandro.botrini@archea.it",
      demoPassword: "demo",
      ruolo: "membro",
      appRole: "senior_architect",
    },
    {
      id: "lleyra",
      nome: "Lisandro Leyra",
      email: "lisandro.leyra@archea.it",
      demoPassword: "demo",
      ruolo: "membro",
      appRole: "architect",
    },
    {
      id: "mmadaghiele",
      nome: "Mirko Madaghiele",
      email: "mirko.madaghiele@archea.it",
      demoPassword: "demo",
      ruolo: "membro",
      appRole: "architect",
      materialLibraryManager: !0,
    },
    {
      id: "epietrelli",
      nome: "Elisabetta Pietrelli",
      email: "elisabetta.pietrelli@archea.it",
      demoPassword: "demo",
      ruolo: "responsabile",
      appRole: "hr_manager",
      virtual: !0,
    },
    {
      id: "property",
      nome: "ARCHEA Property",
      email: "property@archea.it",
      demoPassword: "demo",
      ruolo: "membro",
      appRole: "property",
      virtual: !0,
    },
    {
      id: "alaurini",
      nome: "Alessandra Laurini",
      email: "alessandra.laurini@archea.it",
      demoPassword: "demo",
      ruolo: "membro",
      appRole: "reception",
      virtual: !0,
    },
    {
      id: "scardia",
      nome: "Simone Cardia",
      email: "simone.cardia@archea.it",
      demoPassword: "demo",
      ruolo: "responsabile",
      appRole: "interior_head",
      department: "interior",
      virtual: !0,
    },
    {
      id: "mgamberi",
      nome: "Marco Gamberi",
      email: "marco.gamberi@archea.it",
      demoPassword: "demo",
      ruolo: "responsabile",
      appRole: "concept_head",
      department: "concept",
      virtual: !0,
    },
    {
      id: "afrongia",
      nome: "Andrea Frongia",
      email: "andrea.frongia@archea.it",
      demoPassword: "demo",
      ruolo: "responsabile",
      appRole: "visual_head",
      department: "visual",
      virtual: !0,
    },
  ],
  ao = ["fdiamanti"];
function Sp(t, n, s) {
  const r = [],
    i = t.sheets,
    a = Fx(Xs(i, Zs.dv), Xs(i, Zs.insight), r),
    l = Hx(Xs(i, Zs.tasks), r),
    { note: o, blocchi: c } = Wx(Xs(i, Zs.notes), r),
    d = Qx(Xs(i, Zs.hours), r),
    u = Vn.filter((h) => !h.virtual).map(
      ({ appRole: h, virtual: p, email: y, demoPassword: O, ...k }) => ({
        ...k,
        inRiepiloghiOre: !0,
      }),
    ),
    m = [],
    x = [];
  for (const h of d.people) {
    const p = se(h);
    if (u.some((O) => se(O.nome) === p)) continue;
    const y = Ox.find((O) => O.match(p));
    y
      ? (u.push({ id: y.id, nome: h, ruolo: "membro", inRiepiloghiOre: !1 }),
        m.push(h))
      : (u.push({
          id: `x-${p}`,
          nome: h,
          ruolo: "membro",
          inRiepiloghiOre: !1,
        }),
        x.push(h));
  }
  m.length &&
    r.push(
      `Esclusi dai riepiloghi ore (come concordato; registrazioni conservate): ${m.join(", ")}.`,
    ),
    x.length &&
      r.push(
        `Persone in 04_Ore né principali né nell'elenco esclusioni: ${x.join(", ")}. Non incluse nei riepiloghi: da confermare.`,
      );
  for (const h of Vn.filter((p) => !p.virtual))
    d.people.some((p) => se(p) === se(h.nome)) ||
      r.push(`Persona principale assente da 04_Ore: ${h.nome}.`);
  const j = new Set(a.map((h) => h.codice)),
    f = [],
    g = (h) => c.get(h) || "";
  for (const h of new Set([
    ...l.map((p) => p.progettoCodice),
    ...o.map((p) => p.progettoCodice),
    ...d.regs.map((p) => p.progettoCodice),
  ]))
    !h ||
      j.has(h) ||
      f.push({
        id: h,
        codice: h,
        nome: gp(g(h)) || h,
        stato: "Archived",
        ordine: 1e6 + f.length,
        inElenco: !1,
      });
  f.length &&
    r.push(
      `Progetti assenti da #DV ma con dati collegati (conservati come storici): ${f.map((h) => h.codice).join(", ")}.`,
    );
  const b = (h) => {
      const p = zx.findIndex((y) => y.toLowerCase() === h.toLowerCase());
      return p < 0 ? 99 : p;
    },
    v = [...a, ...f].sort(
      (h, p) =>
        (normalizeProjectStatus(h.stato) === "Active" ? 0 : 1) -
          (normalizeProjectStatus(p.stato) === "Active" ? 0 : 1) ||
        b(h.stato) - b(p.stato) ||
        h.ordine - p.ordine,
    );
  return {
    persone: u,
    progetti: v,
    task: l,
    note: o,
    ore: d.regs,
    meta: {
      source: n,
      label: s,
      loadedAt: new Date().toISOString(),
      warnings: r,
      stats: {
        task: l.length,
        note: o.length,
        registrazioniOre: d.regs.length,
        celleOFF: d.stats.off,
        celleInattese: d.stats.unexpected,
        colonneData: d.stats.dateCols,
      },
    },
  };
}
const Dd = (t) =>
    Math.round(
      Date.UTC(+t.slice(0, 4), +t.slice(5, 7) - 1, +t.slice(8, 10)) / 864e5,
    ) + 25569,
  sl = [
    ["P51", "Ampliamento Fiorentina", "Active"],
    ["M86", "Stadio Flaminio", "Active"],
    ["O80", "Milanello Training Center", "Active"],
    ["H05", "Stadio di Pisa", "Active"],
    ["I05", "Fiorentina Training Center / Viola Park", "Planning"],
    ["I04", "Capannoncino", "Active"],
    ["P13", "Stadio di Napoli", "On Hold"],
    ["P52", "Social housing Firenze", "Planning"],
    ["M01", "Livorno Porto a Mare", "On Hold"],
  ],
  nt = "Francesco Diamanti",
  In = "Alessandro Botrini",
  ss = "Lisandro Leyra";
function Yx(t) {
  const n = (g) => Dd(Sn(t, g)),
    s = [
      [],
      [],
      ["", "", "", "Progetti"],
      [],
      ...sl.map(([g, b]) => ["", "", "", `${g}_${b}`]),
      ["", "", "", "ND"],
    ],
    r = [];
  sl.forEach(([g, b, v], h) => {
    (r[31 + h] = []), (r[31 + h][10] = `${g}_${b}`), (r[31 + h][13] = v);
  });
  const i = [
      "N°",
      "",
      "Assigned To",
      "Typology",
      "Project",
      "Task Description",
      "Link Server",
      "Image",
      "Priority",
      "Task Name",
      "Start Date",
      "Dead Line",
      "Timing",
      "STATUS",
      "Shared",
      "Completed",
      "Date",
      "Not Validated",
      "Validated",
      "Comments",
    ],
    a = (g, b, v, h, p, y, O, k, z, E = {}) => {
      const U = [
        g,
        "",
        b,
        v,
        h,
        p,
        "",
        "",
        O,
        y,
        n(k),
        z === null ? "" : n(z),
        "",
        "",
        "",
        !1,
        "",
        !1,
        !1,
        "",
      ];
      return Object.entries(E).forEach(([P, $]) => (U[+P] = $)), U;
    },
    l = [
      ["TASK MANAGER"],
      [],
      i,
      a(
        1,
        nt,
        "Grafica",
        "P51_Ampliamento Fiorentina",
        "Impaginare la brochure di presentazione dell'ampliamento.",
        "Brochure ampliamento U23",
        "Alta",
        -9,
        0,
      ),
      a(
        2,
        nt,
        "Elaborati",
        "M86_Stadio Flaminio",
        "Controllare le tavole del museo dopo le indicazioni ricevute.",
        "Revisione tavole museo",
        "Alta",
        -12,
        -2,
        { 19: "Mancano le quote nelle sezioni A-A e B-B." },
      ),
      a(
        3,
        nt,
        "Relazioni",
        "O80_Milanello Training Center",
        "Relazione sulla conferenza dei servizi con sintesi dei pareri.",
        "Relazione conferenza servizi",
        "Media",
        -6,
        3,
      ),
      a(
        4,
        nt,
        "Coordinamento",
        "H05_Stadio di Pisa",
        "Raccolta dei contributi dei consulenti per il rilievo.",
        "Raccolta contributi consulenti",
        "Media",
        -3,
        1,
      ),
      a(
        5,
        nt,
        "Elaborati",
        "P13_Stadio di Napoli",
        "Aggiornare il fascicolo del progetto con le ultime modifiche.",
        "Aggiornamento fascicolo",
        "Bassa",
        -30,
        -20,
        { 15: !0, 16: n(-19), 18: !0 },
      ),
      a(
        6,
        nt,
        "Modello",
        "I04_Capannoncino",
        "Verificare il modello 3D prima dell'invio al cliente.",
        "Verifica modello 3D",
        "Media",
        -4,
        -1,
      ),
      a(
        13,
        nt,
        "Elaborati",
        "P52_Social housing Firenze",
        "Schemi distributivi per il confronto con la committenza.",
        "Schemi distributivi",
        "Media",
        -2,
        8,
      ),
      a(
        7,
        In,
        "Elaborati",
        "M86_Stadio Flaminio",
        "Aggiornare le tavole con le ultime indicazioni ricevute.",
        "Aggiornamento tavole",
        "Alta",
        -5,
        0,
        {
          7: `https://drive.google.com/file/d/DEMO-1/view
https://drive.google.com/file/d/DEMO-2/view`,
        },
      ),
      a(
        8,
        In,
        "Rendering",
        "P51_Ampliamento Fiorentina",
        "Preparare tre viste per il tavolo di presentazione.",
        "Viste di presentazione",
        "Media",
        -4,
        5,
        { 6: "\\\\SERVER-STUDIO\\Progetti\\P51\\Rendering" },
      ),
      a(
        9,
        In,
        "Elaborati",
        "O80_Milanello Training Center",
        "Computo preliminare delle superfici.",
        "Computo superfici",
        "Bassa",
        -15,
        -4,
        { 19: "Verificare la superficie dei locali tecnici." },
      ),
      a(
        10,
        ss,
        "Rilievo",
        "H05_Stadio di Pisa",
        "Restituzione del rilievo dei prospetti.",
        "Restituzione rilievo",
        "Alta",
        -8,
        -1,
      ),
      a(
        11,
        ss,
        "Coordinamento",
        "P52_Social housing Firenze",
        "Verbale della riunione con la committenza.",
        "Verbale riunione",
        "Bassa",
        -1,
        4,
      ),
      a(
        12,
        ss,
        "Elaborati",
        "I04_Capannoncino",
        "Pianta delle coperture.",
        "Pianta coperture",
        "Media",
        -10,
        2,
      ),
      [
        "",
        "",
        "",
        "",
        "P51_Ampliamento Fiorentina",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        !1,
        "",
        !1,
        !1,
        "",
      ],
    ],
    o = [
      ["TACCUINO PROGETTI"],
      [
        "Progetto",
        "Inserita da",
        "Data inserimento",
        "Nota",
        "Status",
        "Data chiusura",
        "ID interno",
      ],
    ],
    c = (g, b) => {
      const v = sl.find((h) => h[0] === g);
      o.push([`${g}_${v[1]}`, "", "", "", "", "", `P:${g}`]),
        b.forEach(([h, p, y, O, k]) =>
          o.push(["", h, n(p), y, O, k === void 0 ? "" : n(k), `N:${g}`]),
        ),
        o.push(["", "", "", "", "", "", `N:${g}`]);
    };
  c("M01", [
    [
      nt,
      -60,
      "Concessione in attesa di rinnovo, nessuna attività fino a nuova comunicazione.",
      "🟡 Aperta",
    ],
  ]),
    c("M86", [
      [
        nt,
        0,
        "Verificare il percorso di accesso al museo con il gruppo di progetto.",
        "🟡 Aperta",
      ],
      [
        In,
        -1,
        "Aggiornare le tavole con le ultime indicazioni ricevute.",
        "🔵 In corso",
      ],
      [
        ss,
        -2,
        "Materiali ricevuti dal fornitore, catalogo caricato in cartella.",
        "✅ Chiusa",
        -2,
      ],
    ]),
    c("P51", [
      [
        In,
        -3,
        "Concordato con la committenza di consegnare le brochure entro fine settimana.",
        "🔵 In corso",
      ],
      [
        nt,
        -8,
        "Verificata la compatibilità delle quote con il rilievo.",
        "✅ Chiusa",
        -7,
      ],
    ]),
    c("O80", [
      [
        nt,
        -5,
        "Attendere i pareri dei consulenti prima di chiudere la relazione.",
        "🟡 Aperta",
      ],
    ]),
    c("H05", [
      [
        ss,
        -4,
        "Rilievo dei prospetti da completare dopo il sopralluogo.",
        "🔵 In corso",
      ],
    ]),
    c("I04", [
      [
        In,
        -20,
        "Il cliente chiede una variante per gli accessi carrabili.",
        "🟡 Aperta",
      ],
    ]),
    c("P13", [
      [
        nt,
        -90,
        "Progetto in pausa: in attesa di indicazioni sul programma.",
        "🟡 Aperta",
      ],
    ]),
    c("P52", []);
  const d = `${t.slice(0, 4)}-01-01`,
    u = `${t.slice(0, 4)}-12-31`,
    m = [];
  for (let g = d; g <= u; g = Sn(g, 1))
    g.slice(8) === "01" && m.push({ date: "", sep: g.slice(0, 7) }),
      m.push({ date: g });
  const x = [
      ["CALENDARIO ORE"],
      [
        "Persona",
        "Progetto",
        "Note",
        ...m.map((g) => (g.sep ? `Mese ${g.sep}` : Dd(g.date))),
      ],
    ],
    j = (g) => {
      const b = Math.sin(g) * 1e4;
      return b - Math.floor(b);
    },
    f = (g, b) => {
      x.push([g]),
        b.forEach(([v, h, p], y) =>
          x.push([
            "",
            v,
            h,
            ...m.map((O, k) => {
              if (O.sep || O.date > t) return "";
              if (hc(O.date) >= 5) return y === 0 ? "OFF" : "";
              const z = j(p + k * 1.7);
              return z < 0.4
                ? ""
                : z < 0.5
                  ? "-"
                  : z < 0.55
                    ? 0
                    : y === 0
                      ? z > 0.9
                        ? 3.5
                        : 4
                      : z > 0.8
                        ? 2.5
                        : 2;
            }),
          ]),
        );
    };
  return (
    f(nt, [
      ["P51_Ampliamento Fiorentina", "Brochure", 1],
      ["O80_Milanello Training Center", "", 2],
      ["M86_Stadio Flaminio", "", 3],
    ]),
    f(In, [
      ["M86_Stadio Flaminio", "", 4],
      ["P51_Ampliamento Fiorentina", "", 5],
      ["I04_Capannoncino", "", 6],
    ]),
    f(ss, [
      ["H05_Stadio di Pisa", "", 7],
      ["P52_Social housing Firenze", "", 8],
    ]),
    f("Doriana Mastro", [["H05_Stadio di Pisa", "", 9]]),
    f("Francesco Dall’O’", [
      ["I05_Fiorentina Training Center / Viola Park", "", 10],
    ]),
    {
      sheets: {
        "01_Dashboard": [],
        "02_TaskManager": l,
        "03_Note": o,
        "04_Ore": x,
        "#DV": s,
        "#InsightData": r,
      },
    }
  );
}
const oi = {
    async load() {
      return Sp(Yx(mr()), "demo", "Dati dimostrativi fittizi");
    },
  },
  qx = "modulepreload",
  Zx = function (t, n) {
    return new URL(t, n).href;
  },
  _d = {},
  Xx = function (n, s, r) {
    let i = Promise.resolve();
    if (s && s.length > 0) {
      const l = document.getElementsByTagName("link"),
        o = document.querySelector("meta[property=csp-nonce]"),
        c =
          (o == null ? void 0 : o.nonce) ||
          (o == null ? void 0 : o.getAttribute("nonce"));
      i = Promise.allSettled(
        s.map((d) => {
          if (((d = Zx(d, r)), d in _d)) return;
          _d[d] = !0;
          const u = d.endsWith(".css"),
            m = u ? '[rel="stylesheet"]' : "";
          if (!!r)
            for (let f = l.length - 1; f >= 0; f--) {
              const g = l[f];
              if (g.href === d && (!u || g.rel === "stylesheet")) return;
            }
          else if (document.querySelector(`link[href="${d}"]${m}`)) return;
          const j = document.createElement("link");
          if (
            ((j.rel = u ? "stylesheet" : qx),
            u || (j.as = "script"),
            (j.crossOrigin = ""),
            (j.href = d),
            c && j.setAttribute("nonce", c),
            document.head.appendChild(j),
            u)
          )
            return new Promise((f, g) => {
              j.addEventListener("load", f),
                j.addEventListener("error", () =>
                  g(new Error(`Unable to preload CSS for ${d}`)),
                );
            });
        }),
      );
    }
    function a(l) {
      const o = new Event("vite:preloadError", { cancelable: !0 });
      if (((o.payload = l), window.dispatchEvent(o), !o.defaultPrevented))
        throw l;
    }
    return i.then((l) => {
      for (const o of l || []) o.status === "rejected" && a(o.reason);
      return n().catch(a);
    });
  };
async function Jx(t) {
  const n = await Xx(() => import("./xlsx-Cznzrv2E.js"), [], import.meta.url),
    s = n.read(await t.arrayBuffer(), { type: "array", cellDates: !1 }),
    r = { sheets: {} };
  for (const i of s.SheetNames) {
    const a = s.Sheets[i];
    if (!a["!ref"]) {
      r.sheets[i] = [];
      continue;
    }
    const l = n.utils.decode_range(a["!ref"]);
    (l.s = { r: 0, c: 0 }),
      (r.sheets[i] = n.utils.sheet_to_json(a, {
        header: 1,
        range: l,
        raw: !0,
        defval: null,
        blankrows: !0,
      }));
  }
  return Sp(r, "excel", `Importazione statica: ${t.name}`);
}
const pc = "archea-workspace:excel-snapshot:v1",
  Cp = 1;
function bp(t) {
  var n;
  if (
    ((n = t == null ? void 0 : t.meta) == null ? void 0 : n.source) !==
      "excel" ||
    typeof t.meta.label != "string" ||
    !["persone", "progetti", "task", "note", "ore"].every((s) =>
      Array.isArray(t[s]),
    ) ||
    !Array.isArray(t.meta.warnings)
  )
    throw new Error(
      "La copia Excel salvata non è leggibile. Importa nuovamente il file.",
    );
  return t;
}
function ej(t) {
  const n = window.localStorage.getItem(pc);
  if (!n) return null;
  let s;
  try {
    s = JSON.parse(n);
  } catch {
    throw new Error(
      "La copia Excel salvata non è leggibile. Importa nuovamente il file.",
    );
  }
  if (s.schema !== Cp)
    throw new Error("La copia Excel salvata richiede una nuova importazione.");
  return bp(s.data);
}
function tj(t, n) {
  bp(t),
    window.localStorage.setItem(pc, JSON.stringify({ schema: Cp, data: t }));
}
function $d(t) {
  window.localStorage.removeItem(pc);
}
const Ld = {
    it: {
      today: "Oggi",
      projects: "Progetti",
      notes: "Note",
      hours: "Ore",
      site: "Cantiere",
      more: "Altro",
      calendar: "Calendario",
      bookings: "Prenota",
      inArchea: "IN ARCHEA",
      accounting: "Contabilità",
      progress: "Progetti",
      employeeBio: "Organico",
      insights: "Insight",
      bimPortal: "BIM Portal",
      visualDepartment: "Visual",
      packages: "Pacchi",
      language: "Lingua",
      demoData: "Dati dimostrativi",
      yourExcel: "Il tuo Excel",
      active: "attivi",
      updated: "aggiornati alle",
      loading: "Caricamento…",
      retry: "Riprova",
      profile: "Profilo e dati",
      settings: "Strumenti dello studio",
    },
    en: {
      today: "Today",
      projects: "Projects",
      notes: "Notes",
      hours: "Hours",
      site: "Site",
      more: "More",
      calendar: "Calendar",
      bookings: "Book",
      inArchea: "IN ARCHEA",
      accounting: "Accounting",
      progress: "Projects",
      employeeBio: "Staff",
      insights: "Insights",
      bimPortal: "BIM Portal",
      visualDepartment: "Visual",
      packages: "Parcels",
      language: "Language",
      demoData: "Demo data",
      yourExcel: "Your Excel",
      active: "active",
      updated: "updated at",
      loading: "Loading…",
      retry: "Retry",
      profile: "Profile and data",
      settings: "Studio tools",
    },
  },
  nj = (t, n) => {
    var s;
    return ((s = Ld[t]) == null ? void 0 : s[n]) ?? Ld.it[n] ?? n;
  },
  wp = C.createContext(null),
  Y = () => C.useContext(wp);
function sj({ children: t }) {
  const [n, s] = C.useState(null),
    [r, i] = C.useState(!0),
    [a, l] = C.useState(null),
    [o, c] = C.useState(() => {
      try {
        return sessionStorage.getItem("archea-demo-user") || "";
      } catch {
        return "";
      }
    }),
    [d, u] = C.useState(mr()),
    [m, x] = C.useState(location.hash.slice(2) || "oggi"),
    [j, f] = C.useState(null),
    [g, b] = C.useState(null),
    [v, h] = C.useState("fdiamanti"),
    [p, y] = C.useState(() => localStorage.getItem("archea-language") || "it"),
    O = C.useCallback(async ($) => {
      i(!0), l(null);
      try {
        const N = await $();
        return s(N), u(mr()), !0;
      } catch (N) {
        return l(N instanceof Error ? N.message : String(N)), !1;
      } finally {
        i(!1);
      }
    }, []);
  C.useEffect(() => {
    O(async () => {
      try {
        return ej() ?? (await oi.load());
      } catch ($) {
        const N = await oi.load();
        return (
          N.meta.warnings.push(
            `Dati locali non disponibili: ${$.message}. Importa nuovamente l'Excel.`,
          ),
          N
        );
      }
    });
  }, [O]),
    C.useEffect(() => {
      const $ = () => {
        document.visibilityState === "visible" && u(mr());
      };
      return (
        document.addEventListener("visibilitychange", $),
        () => document.removeEventListener("visibilitychange", $)
      );
    }, []),
    C.useEffect(() => {
      const $ = () => f(null);
      return (
        window.addEventListener("hashchange", $),
        () => window.removeEventListener("hashchange", $)
      );
    }, []);
  const k = C.useMemo(() => {
      const $ =
        (n == null ? void 0 : n.persone.find((I) => I.id === o)) ??
        Vn.find((I) => I.id === o) ??
        (n == null ? void 0 : n.persone[0]) ??
        null;
      if (!$) return null;
      const N = Vn.find((I) => I.id === $.id);
      return {
        ...$,
        appRole:
          (N == null ? void 0 : N.appRole) ??
          ($.ruolo === "responsabile" ? "partner_architect" : "architect"),
        isDeveloper: ao.includes($.id),
        technicalRole: ao.includes($.id) ? "platform_owner" : null,
      };
    }, [n, o]),
    P = {
      data: n,
      loading: r,
      error: a,
      viewer: k,
      viewerId: o,
      authenticated: !!o,
      login: ($, N) => {
        const I = Vn.find(
          (S) =>
            S.email.toLowerCase() === $.trim().toLowerCase() &&
            S.demoPassword === N,
        );
        if (!I)
          return {
            ok: !1,
            error:
              p === "en"
                ? "Email or password not valid."
                : "Email o password non valide.",
          };
        c(I.id);
        try {
          sessionStorage.setItem("archea-demo-user", I.id);
        } catch {}
        return { ok: !0 };
      },
      logout: () => {
        c(""), f(null), x("oggi"), history.replaceState(null, "", "#/oggi");
        try {
          sessionStorage.removeItem("archea-demo-user");
        } catch {}
      },
      setViewerId: c,
      today: d,
      tab: m,
      overlay: j,
      noteProject: g,
      setNoteProject: b,
      selectedEmployeeId: v,
      setSelectedEmployeeId: h,
      language: p,
      setLanguage: ($) => {
        localStorage.setItem("archea-language", $), y($);
      },
      t: ($) => nj(p, $),
      setTab($) {
        x($),
          f(null),
          history.replaceState(null, "", `#/${$}`),
          window.scrollTo(0, 0);
      },
      open: f,
      close: () => f(null),
      reload: () =>
        O(() =>
          !n || n.meta.source === "demo" ? oi.load() : Promise.resolve(n),
        ),
      importExcel: ($) =>
        O(async () => {
          const N = await Jx($);
          try {
            tj(N);
          } catch {
            try {
              $d();
            } catch {}
            N.meta.warnings.push(
              "Excel importato per questa sessione. Il browser non consente di conservarlo: alla riapertura sarà necessario importarlo di nuovo.",
            );
          }
          return b(null), N;
        }),
      backToDemo: () => O(async () => ($d(), b(null), oi.load())),
    };
  return e.jsx(wp.Provider, { value: P, children: t });
}
const Fd = (t) =>
    t
      .replace(/[’'`´]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join(""),
  Ud = (t) => t.split(/\s+/)[0] ?? t,
  rj = (t) =>
    t.assegnatario
      .split(/[,;/&\n]+/)
      .map((n) => n.trim())
      .filter(Boolean),
  Mt = (t, n) => rj(t).some((s) => se(s) === se(n.nome)),
  Vr = ({ name: t, size: n = 40, active: s = !1, onClick: r, label: i }) => {
    const a = { width: n, height: n, fontSize: n * 0.34 },
      l = `avatar${s ? " active" : ""}`;
    return r
      ? e.jsx("button", {
          className: l,
          style: a,
          onClick: r,
          "aria-pressed": s,
          "aria-label": i ?? t,
          title: t,
          children: Fd(t),
        })
      : e.jsx("span", {
          className: l,
          style: a,
          "aria-hidden": "true",
          children: Fd(t),
        });
  };
function $t({ title: t, onClose: n, children: s }) {
  const [r, i] = C.useState(!1),
    a = C.useRef(null),
    l = C.useRef(!1),
    o = C.useCallback(() => {
      l.current ||
        ((l.current = !0), i(!0), (a.current = window.setTimeout(n, 260)));
    }, [n]);
  return (
    C.useEffect(() => {
      const c = (d) => d.key === "Escape" && o();
      return (
        document.addEventListener("keydown", c),
        (document.body.style.overflow = "hidden"),
        () => {
          document.removeEventListener("keydown", c),
            (document.body.style.overflow = ""),
            a.current && window.clearTimeout(a.current);
        }
      );
    }, [o]),
    e.jsxs("div", {
      className: `sheet-wrap${r ? " closing" : ""}`,
      role: "dialog",
      "aria-modal": "true",
      "aria-label": t,
      children: [
        e.jsx("div", { className: "sheet-backdrop", onClick: o }),
        e.jsxs("div", {
          className: "sheet",
          children: [
            e.jsxs("div", {
              className: "sheet-head",
              children: [
                e.jsx("h2", { children: t }),
                e.jsx("button", {
                  className: "icon-btn",
                  onClick: o,
                  "aria-label": "Chiudi",
                  children: e.jsx(so, {}),
                }),
              ],
            }),
            e.jsx("div", { className: "sheet-body", children: s }),
          ],
        }),
      ],
    })
  );
}
const Sa = ({ value: t, options: n, onChange: s, label: r }) =>
    e.jsx("div", {
      className: "segmented",
      role: "tablist",
      "aria-label": r,
      style: { gridTemplateColumns: `repeat(${n.length}, 1fr)` },
      children: n.map(([i, a]) =>
        e.jsx(
          "button",
          {
            role: "tab",
            "aria-selected": i === t,
            className: i === t ? "on" : "",
            onClick: () => s(i),
            children: a,
          },
          i,
        ),
      ),
    }),
  En = ({ value: t, onChange: n, placeholder: s }) =>
    e.jsxs("label", {
      className: "searchbox",
      children: [
        e.jsx("span", { className: "sr-only", children: s }),
        e.jsx("span", {
          className: "si",
          children: e.jsxs("svg", {
            width: "20",
            height: "20",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "1.7",
            strokeLinecap: "round",
            children: [
              e.jsx("circle", { cx: "11", cy: "11", r: "6.500" }),
              e.jsx("path", { d: "m20 20-4-4" }),
            ],
          }),
        }),
        e.jsx("input", {
          type: "search",
          value: t,
          onChange: (r) => n(r.target.value),
          placeholder: s,
          enterKeyHint: "search",
        }),
      ],
    }),
  ij = { aperta: "Aperta", in_corso: "In corso", chiusa: "Chiusa" },
  Ap = ({ s: t }) =>
    e.jsx("span", { className: `pill note-${t}`, children: ij[t] }),
  Br = (t) => `ps-${projectStatusSlug(t).replace(/-/g, "") || "nd"}`,
  Xi = ({ children: t }) => e.jsx("p", { className: "empty", children: t }),
  Ca = {
    membersSeeAllProjects: !0,
    membersSeeAllNotes: !0,
    membersSeeOthersHours: !1,
    membersSeeOthersTasks: !1,
  },
  aj = [
    "Visibilità di progetti e note per i membri (ora: tutti, solo in demo).",
    'Se la colonna "Shared" debba avere un ruolo di autorizzazione (ora: nessuno).',
    "Se i membri possano vedere le task assegnate ad altri (ora: no).",
  ],
  mc = new Set(["senior_architect", "partner_architect"]),
  Jn = (t) =>
    t.ruolo === "responsabile" ||
    t.ruolo === "partner_architect" ||
    t.appRole === "partner_architect",
  zr = (t) => !!(t && mc.has(t.appRole ?? t.ruolo)),
  lj = (t) => !!(t && [...mc, "property"].includes(t.appRole ?? t.ruolo)),
  oj = (t) => !!(t && [...mc, "property"].includes(t.appRole ?? t.ruolo)),
  ba = (t) => !!(t && (t.appRole ?? t.ruolo) === "property");
function cj(t, n) {
  return Jn(t) || t.id === n.id || Ca.membersSeeOthersHours;
}
function Yn(t, n, s) {
  return Jn(t) || Ca.membersSeeOthersTasks ? n : n.filter((r) => s(r, t));
}
const Ep = (t, n) => (Jn(t) || Ca.membersSeeAllProjects ? n : []),
  fc = (t, n) => (Jn(t) || Ca.membersSeeAllNotes ? n : []),
  dj = { demo: "DEMO", excel: "EXCEL STATICO", live: "LIVE" };
function uj() {
  const {
      data: t,
      viewer: n,
      setViewerId: s,
      logout: r,
      close: i,
      reload: a,
      importExcel: l,
      backToDemo: o,
      loading: c,
      error: d,
      language: u,
      setLanguage: m,
    } = Y(),
    x = C.useRef(null),
    [j, f] = C.useState(!1);
  if (!t || !n) return null;
  const g = t.meta,
    b = {
      demo: "Dati dimostrativi fittizi, generati nel layout dei fogli reali. Nessun dato del team.",
      excel:
        "Dati importati dal tuo Excel e conservati in questo browser. Non vengono inviati online e non si aggiornano automaticamente da Google Fogli. Importa un nuovo Excel per aggiornarli.",
      live: "Connessione a Google Fogli.",
    }[g.source];
  return e.jsxs($t, {
    title: "Persona e dati",
    onClose: i,
    children: [
      e.jsx("h4", {
        children: u === "en" ? "Signed-in account" : "Account collegato",
      }),
      e.jsxs("div", {
        className: "signed-account",
        children: [
          e.jsx(Vr, { name: n.nome, size: 42 }),
          e.jsxs("span", {
            children: [
              e.jsx("b", { children: n.nome }),
              e.jsx("small", { children: Xt[n.appRole] }),
            ],
          }),
        ],
      }),
      e.jsx("h4", { children: u === "en" ? "Language" : "Lingua" }),
      e.jsxs("div", {
        className: "language-switch compact",
        children: [
          e.jsx("button", {
            className: u === "it" ? "on" : "",
            onClick: () => m("it"),
            children: "Italiano",
          }),
          e.jsx("button", {
            className: u === "en" ? "on" : "",
            onClick: () => m("en"),
            children: "English",
          }),
        ],
      }),
      e.jsx("h4", { children: "Origine dei dati" }),
      e.jsxs("div", {
        className: "callout",
        children: [
          e.jsxs("b", { children: [dj[g.source], " · ", g.label] }),
          e.jsx("p", { children: b }),
          e.jsxs("p", {
            children: [
              "Caricati: ",
              new Date(g.loadedAt).toLocaleString("it-IT", {
                timeZone: "Europe/Rome",
              }),
              ". Connessione Google Fogli live: ",
              e.jsx("b", { children: "non attiva" }),
              ".",
            ],
          }),
        ],
      }),
      e.jsx("div", {
        className: "stat-line",
        children: Object.entries(g.stats).map(([v, h]) =>
          e.jsxs(
            "span",
            {
              children: [
                v.replace(/([A-Z])/g, " $1").toLowerCase(),
                ": ",
                e.jsx("b", { children: h }),
              ],
            },
            v,
          ),
        ),
      }),
      d && e.jsxs("p", { className: "error", children: ["Errore: ", d] }),
      e.jsxs("div", {
        className: "btn-row",
        children: [
          e.jsxs("button", {
            className: "btn",
            disabled: c,
            onClick: () => void a(),
            children: [e.jsx(hp, {}), " Aggiorna"],
          }),
          e.jsxs("button", {
            className: "btn",
            disabled: c,
            onClick: () => {
              var v;
              return (v = x.current) == null ? void 0 : v.click();
            },
            children: [e.jsx(oc, {}), " Importa Excel (locale)"],
          }),
          g.source !== "demo" &&
            e.jsx("button", {
              className: "btn",
              onClick: () => void o(),
              children: "Rimuovi dati e torna alla demo",
            }),
          e.jsx("input", {
            ref: x,
            type: "file",
            hidden: !0,
            accept: ".xlsx,.xlsm",
            onChange: (v) => {
              var h;
              const p = (h = v.target.files) == null ? void 0 : h[0];
              p &&
                l(p).then((y) => {
                  y && i();
                }),
                (v.target.value = "");
            },
          }),
        ],
      }),
      e.jsx("button", {
        className: "logout-button",
        onClick: () => {
          i(), r();
        },
        children: u === "en" ? "Sign out from demo" : "Esci dalla demo",
      }),
      g.warnings.length > 0 &&
        e.jsxs(e.Fragment, {
          children: [
            e.jsxs("button", {
              className: "link warn-toggle",
              onClick: () => f(!j),
              children: [
                j ? "Nascondi" : "Mostra",
                " segnalazioni sui dati (",
                g.warnings.length,
                ")",
              ],
            }),
            j &&
              e.jsx("ul", {
                className: "warns",
                children: g.warnings
                  .slice(0, 80)
                  .map((v, h) => e.jsx("li", { children: v }, h)),
              }),
          ],
        }),
      e.jsx("h4", { children: "Decisioni in sospeso sugli accessi" }),
      e.jsx("ul", {
        className: "warns",
        children: aj.map((v) => e.jsx("li", { children: v }, v)),
      }),
    ],
  });
}
function Tp({ t, today: n }) {
  const s = Bx(t, n);
  if (s.kind === "none" || Ce(t, n) === "validata") return null;
  const r =
    s.kind === "overdue"
      ? `Scaduta · ${-s.days} g`
      : s.kind === "today"
        ? "Oggi"
        : s.kind === "tomorrow"
          ? "Domani"
          : $n(t.scadenza);
  return e.jsx("span", { className: `pill due-${s.kind}`, children: r });
}
function Pp({ t, showProject: n = !0 }) {
  const { today: s, open: r, data: i } = Y(),
    a = Ce(t, s),
    l =
      i == null
        ? void 0
        : i.progetti.find((o) => o.codice === t.progettoCodice);
  return e.jsxs("button", {
    className: `task-card st-${a}`,
    onClick: () => r({ kind: "task", id: t.id }),
    children: [
      e.jsxs("span", {
        className: "tc-top",
        children: [
          e.jsx("span", {
            className: "tc-proj",
            children: n
              ? `${t.progettoCodice || "—"}${l ? ` · ${l.nome}` : ""}`
              : t.tipologia,
          }),
          e.jsx(Tp, { t, today: s }),
        ],
      }),
      e.jsx("span", {
        className: "tc-title",
        children: t.titolo || t.descrizione,
      }),
      e.jsxs("span", {
        className: `tc-status s-${a}`,
        children: [e.jsx(wx, { s: a }), " ", Np[a]],
      }),
    ],
  });
}
function pe({ value: t, duration: n = 1e3, format: s }) {
  const r = Number(t) || 0,
    [i, a] = C.useState(0),
    l = C.useRef(0);
  return (
    C.useEffect(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        a(r), (l.current = r);
        return;
      }
      const o = l.current,
        c = performance.now();
      let d;
      const u = (m) => {
        const x = Math.min(1, (m - c) / n),
          j = 1 - Math.pow(1 - x, 3);
        a(Math.round(o + (r - o) * j)),
          x < 1 ? (d = requestAnimationFrame(u)) : (l.current = r);
      };
      return (d = requestAnimationFrame(u)), () => cancelAnimationFrame(d);
    }, [r, n]),
    s ? s(i) : i
  );
}
const TODAY_AGENDA_DEMO = [
  {
    id: "agenda-team",
    ownerIds: ["fdiamanti", "abotrini", "lleyra", "mmadaghiele"],
    title: "Coordinamento progetto P51",
    start: "09:00",
    end: "10:00",
    location: "Sala Cellini",
    tone: "teal",
  },
  {
    id: "agenda-review",
    ownerIds: ["fdiamanti", "abotrini"],
    title: "Revisione consegne e priorità",
    start: "11:30",
    end: "12:30",
    location: "Sala Lungarno",
    tone: "clay",
  },
  {
    id: "agenda-materials",
    ownerIds: ["mmadaghiele"],
    title: "Aggiornamento campioni Materioteca",
    start: "14:00",
    end: "15:30",
    location: "Materioteca",
    tone: "sage",
  },
  {
    id: "agenda-property",
    ownerIds: ["property"],
    title: "Riepilogo direzione e studi",
    start: "10:30",
    end: "12:00",
    location: "Sala Lungarno",
    tone: "dark",
  },
  {
    id: "agenda-reception",
    ownerIds: ["alaurini"],
    title: "Allestimento riunione clienti",
    start: "08:30",
    end: "09:15",
    location: "Sala Ingresso",
    tone: "clay",
  },
  {
    id: "agenda-departments",
    ownerIds: ["scardia", "mgamberi", "afrongia"],
    title: "Allineamento dipartimenti",
    start: "15:00",
    end: "16:00",
    location: "Sala Cellini",
    tone: "teal",
  },
  {
    id: "agenda-focus",
    ownerIds: Vn.map((t) => t.id),
    title: "Focus personale · nessuna riunione",
    start: "17:30",
    end: "18:15",
    location: "Agenda personale",
    tone: "slate",
  },
];
const agendaMinutes = (t) => {
  const [n, s] = String(t || "00:00").split(":").map(Number);
  return n * 60 + s;
};
function TodayAgendaWidget({ viewer: t, events: n = [], compact: s = !1 }) {
  const { today: agendaToday } = Y(),
    r = 8 * 60,
    i = 20 * 60,
    a = i - r,
    l = [
      ...TODAY_AGENDA_DEMO.filter((u) => u.ownerIds.includes(t.id)),
      ...n
        .filter(
          (u) =>
            (!u.date || u.date === agendaToday) &&
            (u.ownerId === t.id ||
              u.assigneeId === t.id ||
              (u.attendeeIds || []).includes(t.id)),
        )
        .map((u) => ({
          ...u,
          start: u.start || u.time || "09:00",
          end: u.end || "10:00",
          tone: u.tone || "sage",
        })),
    ]
      .filter(
        (u, m, x) => x.findIndex((j) => j.id === u.id) === m,
      )
      .sort((u, m) => agendaMinutes(u.start) - agendaMinutes(m.start)),
    o = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Rome",
      hour: "2-digit",
      minute: "2-digit",
      hour12: !1,
    }).formatToParts(new Date()),
    c = Number(o.find((u) => u.type === "hour").value) * 60 +
      Number(o.find((u) => u.type === "minute").value),
    d = Math.max(0, Math.min(100, ((c - r) / a) * 100));
  return e.jsxs("div", {
    className: `today-agenda${s ? " compact" : ""}`,
    children: [
      e.jsx("div", {
        className: "today-agenda-times",
        children: [8, 10, 12, 14, 16, 18, 20].map((u) =>
          e.jsx("span", { style: { top: `${((u * 60 - r) / a) * 100}%` }, children: `${String(u).padStart(2, "0")}:00` }, u),
        ),
      }),
      e.jsxs("div", {
        className: "today-agenda-track",
        children: [
          [8, 10, 12, 14, 16, 18, 20].map((u) =>
            e.jsx("i", { className: "agenda-gridline", style: { top: `${((u * 60 - r) / a) * 100}%` } }, u),
          ),
          l.map((u) => {
            const m = Math.max(r, agendaMinutes(u.start)),
              x = Math.min(i, agendaMinutes(u.end));
            return e.jsxs(
              "article",
              {
                className: `agenda-event ${u.tone || "sage"}`,
                style: {
                  top: `${((m - r) / a) * 100}%`,
                  height: `${Math.max(5.5, ((x - m) / a) * 100)}%`,
                },
                children: [
                  e.jsx("b", { children: u.title }),
                  e.jsxs("span", { children: [u.start, " – ", u.end] }),
                  !s && u.location && e.jsx("small", { children: u.location }),
                ],
              },
              u.id,
            );
          }),
          c >= r &&
            c <= i &&
            e.jsx("span", {
              className: "agenda-now-line",
              style: { top: `${d}%` },
              children: e.jsx("i", {}),
            }),
        ],
      }),
    ],
  });
}
function PersonalAgendaPanel() {
  const { viewer: t, language: n } = Y();
  if (!t) return null;
  return e.jsxs("section", {
    className: "desk-panel special-today-agenda",
    children: [
      e.jsxs("header", {
        children: [
          e.jsxs("div", {
            children: [
              e.jsx("small", { children: "AGENDA PERSONALE" }),
              e.jsx("h2", {
                children:
                  n === "en" ? "Today's appointments" : "Appuntamenti di oggi",
              }),
            ],
          }),
          e.jsx("span", {
            className: "agenda-personal-label",
            children: n === "en" ? "Only your events" : "Solo i tuoi eventi",
          }),
        ],
      }),
      e.jsx(TodayAgendaWidget, { viewer: t }),
    ],
  });
}
const hj = [
    ["aperte", "Aperte"],
    ["in_scadenza", "In scadenza"],
    ["scadute", "Scadute"],
    ["da_rivedere", "Da rivedere"],
    ["validate", "Validate"],
  ],
  Vd = 5;
function pj() {
  var t;
  const { data: n, viewer: s, today: r, language: i } = Y(),
    [a, l] = C.useState("aperte"),
    [o, c] = C.useState(""),
    [d, u] = C.useState(!1),
    [m, x] = C.useState("me"),
    j = !!s && Jn(s),
    f = C.useMemo(() => {
      if (!n || !s) return [];
      const E = Yn(s, n.task, Mt);
      if (!j || m === "me") return E.filter((P) => Mt(P, s));
      if (m === "all") return E;
      const U = n.persone.find((P) => P.id === m);
      return U ? E.filter((P) => Mt(P, U)) : E;
    }, [n, s, m, j]);
  if (!n || !s) return null;
  const g = i === "en",
    b = (E) => Ce(E, r),
    v = {
      aperte: f.filter((E) => qe(E, r)).length,
      in_scadenza: f.filter((E) => b(E) === "in_scadenza").length,
      scadute: f.filter((E) => b(E) === "scaduta").length,
      da_rivedere: f.filter((E) => b(E) === "da_rivedere").length,
      validate: f.filter((E) => b(E) === "validata").length,
    },
    h = {
      aperte: (E) => qe(E, r),
      in_scadenza: (E) => b(E) === "in_scadenza",
      scadute: (E) => b(E) === "scaduta",
      da_rivedere: (E) => b(E) === "da_rivedere",
      validate: (E) => b(E) === "validata",
    },
    p = se(o),
    y = f
      .filter(h[a])
      .filter(
        (E) =>
          !p ||
          se(
            [
              E.titolo,
              E.descrizione,
              E.progettoCodice,
              E.tipologia,
              E.assegnatario,
            ].join(" "),
          ).includes(p),
      )
      .sort(kp(r)),
    O = d || p ? y : y.slice(0, Vd),
    k = n.persone.filter((E) => E.inRiepiloghiOre),
    z =
      m === "me"
        ? g
          ? "Your tasks"
          : "Le tue task"
        : m === "all"
          ? g
            ? "Team tasks"
            : "Task del team"
          : `${g ? "Tasks ·" : "Task di"} ${Ud(((t = n.persone.find((E) => E.id === m)) == null ? void 0 : t.nome) ?? "")}`;
  return e.jsxs(e.Fragment, {
    children: [
      e.jsxs("div", {
        className: "greet",
        children: [
          e.jsxs("p", {
            className: "hello",
            children: [g ? "Hello " : "Ciao ", Ud(s.nome)],
          }),
          e.jsx("p", { className: "date", children: vp(r) }),
        ],
      }),
      e.jsx("h1", {
        className: "big",
        children: g ? "Today's work" : "Il lavoro di oggi",
      }),
      e.jsxs("div", {
        className: "stats",
        children: [
          e.jsxs("button", {
            className: `stat neutral${a === "aperte" ? " on" : ""}`,
            onClick: () => l("aperte"),
            children: [
              e.jsx("b", { children: e.jsx(pe, { value: v.aperte }) }),
              e.jsx(up, {}),
              e.jsx("span", { children: g ? "Open" : "Aperte" }),
            ],
          }),
          e.jsxs("button", {
            className: `stat warn${a === "in_scadenza" ? " on" : ""}`,
            onClick: () => l("in_scadenza"),
            children: [
              e.jsx("b", { children: e.jsx(pe, { value: v.in_scadenza }) }),
              e.jsx(Ur, {}),
              e.jsx("span", { children: g ? "Due soon" : "In scadenza" }),
            ],
          }),
          e.jsxs("button", {
            className: `stat alert${a === "da_rivedere" ? " on" : ""}`,
            onClick: () => l("da_rivedere"),
            children: [
              e.jsx("b", { children: e.jsx(pe, { value: v.da_rivedere }) }),
              e.jsx(hp, {}),
              e.jsx("span", { children: g ? "To review" : "Da rivedere" }),
            ],
          }),
        ],
      }),
      e.jsxs("section", {
        className: "mobile-today-agenda",
        children: [
          e.jsxs("div", {
            className: "section-head",
            children: [
              e.jsx("h2", {
                children: g ? "Today's appointments" : "Appuntamenti di oggi",
              }),
              e.jsx("span", {
                className: "agenda-personal-label",
                children: g ? "Personal calendar" : "Solo la tua agenda",
              }),
            ],
          }),
          e.jsx(TodayAgendaWidget, { viewer: s, compact: !0 }),
        ],
      }),
      e.jsxs("div", {
        className: "section-head",
        children: [
          e.jsx("h2", { children: z }),
          y.length > Vd &&
            !p &&
            e.jsx("button", {
              className: "link",
              onClick: () => u(!d),
              children: d
                ? g
                  ? "Show less"
                  : "Mostra meno"
                : g
                  ? "See all"
                  : "Vedi tutte",
            }),
        ],
      }),
      e.jsx(En, {
        value: o,
        onChange: c,
        placeholder: g
          ? "Search by title, project or type"
          : "Cerca per titolo, progetto o tipologia",
      }),
      e.jsx("div", {
        className: "chips",
        role: "group",
        "aria-label": "Filtri task",
        children: hj.map(([E, U]) =>
          e.jsxs(
            "button",
            {
              className: `chip${a === E ? " on" : ""}${E === "scadute" && v.scadute ? " hot" : ""}`,
              "aria-pressed": a === E,
              onClick: () => {
                l(E), u(!1);
              },
              children: [
                g
                  ? {
                      aperte: "Open",
                      in_scadenza: "Due soon",
                      scadute: "Overdue",
                      da_rivedere: "To review",
                      validate: "Validated",
                    }[E]
                  : U,
                " ",
                e.jsx("i", { children: v[E] }),
              ],
            },
            E,
          ),
        ),
      }),
      e.jsxs("div", {
        className: "list",
        children: [
          O.map((E, U) => e.jsx(Pp, { t: E, index: U }, E.id)),
          !O.length &&
            e.jsx(Xi, {
              children: p
                ? g
                  ? "No task matches your search."
                  : "Nessuna task corrisponde alla ricerca."
                : g
                  ? "No tasks in this category."
                  : "Nessuna task in questa categoria.",
            }),
        ],
      }),
      j &&
        e.jsxs(e.Fragment, {
          children: [
            e.jsx("div", {
              className: "section-head",
              children: e.jsx("h2", { children: g ? "Team" : "Il team" }),
            }),
            e.jsxs("div", {
              className: "team today-team-filters",
              children: [
                e.jsx("button", {
                  className: `team-filter${m === "me" ? " on" : ""}`,
                  onClick: () => x("me"),
                  children: g ? "ME" : "MIE",
                }),
                k
                  .filter((E) => E.id !== s.id)
                  .map((E) =>
                    e.jsx(
                      Vr,
                      {
                        name: E.nome,
                        size: 48,
                        active: m === E.id,
                        onClick: () => x(m === E.id ? "me" : E.id),
                        label: `Task di ${E.nome}`,
                      },
                      E.id,
                    ),
                  ),
                e.jsx("button", {
                  className: `team-filter all${m === "all" ? " on" : ""}`,
                  onClick: () => x("all"),
                  children: g ? "ALL" : "TUTTI",
                }),
              ],
            }),
          ],
        }),
    ],
  });
}
function lo({ n: t }) {
  const { open: n } = Y();
  return e.jsxs("button", {
    className: `note-card${t.stato === "chiusa" ? " closed" : ""}`,
    onClick: () => n({ kind: "note", id: t.id }),
    children: [
      e.jsxs("span", {
        className: "nc-head",
        children: [
          e.jsx(Vr, { name: t.autore || "?", size: 36 }),
          e.jsxs("span", {
            className: "nc-who",
            children: [
              e.jsx("b", { children: t.autore || "Autore non indicato" }),
              e.jsx("small", {
                children: t.creata ? Kt(t.creata) : "Data non indicata",
              }),
            ],
          }),
          e.jsx(Ap, { s: t.stato }),
        ],
      }),
      e.jsx("span", { className: "nc-text", children: t.testo }),
      t.stato === "chiusa" &&
        t.chiusa &&
        e.jsxs("small", {
          className: "nc-closed",
          children: ["Chiusa il ", Kt(t.chiusa)],
        }),
    ],
  });
}
function mj() {
  const {
      data: t,
      viewer: n,
      noteProject: s,
      setNoteProject: r,
      language: i,
    } = Y(),
    [a, l] = C.useState(!1),
    [o, c] = C.useState(""),
    d = C.useMemo(() => (t && n ? Ep(n, t.progetti) : []), [t, n]);
  if (!t || !n) return null;
  const u = i === "en",
    m = fc(n, t.note),
    x =
      d.find((h) => h.codice === s) ??
      d.find((h) => m.some((p) => p.progettoCodice === h.codice)) ??
      d[0],
    j = x ? m.filter((h) => h.progettoCodice === x.codice) : [],
    f = j.filter((h) => h.stato !== "chiusa"),
    g = j.filter((h) => h.stato === "chiusa"),
    b = se(o),
    v = (h) => m.filter((p) => p.progettoCodice === h).length;
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx("h1", {
        className: "big title-row",
        children: u ? "Notes" : "Taccuino",
      }),
      e.jsxs("button", {
        className: "picker",
        onClick: () => l(!0),
        "aria-haspopup": "dialog",
        children: [
          e.jsx("span", {
            children: x
              ? `${x.codice} · ${x.nome}`
              : u
                ? "No project"
                : "Nessun progetto",
          }),
          e.jsx(_t, {}),
        ],
      }),
      e.jsx("p", {
        className: "hint",
        children: u
          ? "Read-only: notes are viewed here and edited in the sheet."
          : "Sola lettura: le note si leggono qui, si scrivono nel foglio.",
      }),
      e.jsx("div", {
        className: "section-head",
        children: e.jsx("h2", { children: u ? "Open notes" : "Note aperte" }),
      }),
      e.jsxs("div", {
        className: "list",
        children: [
          f.map((h) => e.jsx(lo, { n: h }, h.id)),
          !f.length &&
            e.jsx(Xi, {
              children: u
                ? "No open notes for this project."
                : "Nessuna nota aperta per questo progetto.",
            }),
        ],
      }),
      e.jsx("div", {
        className: "section-head",
        children: e.jsx("h2", { children: u ? "Closed notes" : "Note chiuse" }),
      }),
      e.jsxs("div", {
        className: "list",
        children: [
          g.map((h) => e.jsx(lo, { n: h }, h.id)),
          !g.length &&
            e.jsx(Xi, {
              children: u ? "No closed notes." : "Nessuna nota chiusa.",
            }),
        ],
      }),
      a &&
        e.jsxs($t, {
          title: u ? "Choose project" : "Scegli progetto",
          onClose: () => l(!1),
          children: [
            e.jsx(En, {
              value: o,
              onChange: c,
              placeholder: u
                ? "Search by code or name"
                : "Cerca per codice o nome",
            }),
            e.jsx("div", {
              className: "list tight",
              children: d
                .filter((h) => !b || se(`${h.codice} ${h.nome}`).includes(b))
                .map((h) =>
                  e.jsxs(
                    "button",
                    {
                      className: `pick-row${h.codice === (x == null ? void 0 : x.codice) ? " on" : ""}`,
                      onClick: () => {
                        r(h.codice), l(!1), c("");
                      },
                      children: [
                        e.jsx("b", { children: h.codice }),
                        e.jsx("span", { children: h.nome }),
                        e.jsx("span", {
                          className: `pill ${Br(h.stato)}`,
                          children: h.stato,
                        }),
                        e.jsxs("small", { children: [v(h.codice), " note"] }),
                      ],
                    },
                    h.id,
                  ),
                ),
            }),
          ],
        }),
    ],
  });
}
function fj({ code: t, onClose: n }) {
  const { data: s, viewer: r, today: i, language: a } = Y(),
    l = s == null ? void 0 : s.progetti.find((x) => x.codice === t);
  if (!l || !s || !r) return null;
  const o = a === "en",
    c = Yn(r, s.task, Mt).filter((x) => x.progettoCodice === t),
    d = c.filter((x) => qe(x, i)).sort(kp(i)),
    u = c.length - d.length,
    m = fc(r, s.note).filter((x) => x.progettoCodice === t);
  return e.jsxs("section", {
    className: "project-detail-page",
    children: [
      e.jsxs("button", {
        type: "button",
        className: "detail-back project-back",
        onClick: n,
        children: [e.jsx(Re, {}), o ? "Back to projects" : "Torna ai progetti"],
      }),
      e.jsxs("div", {
        className: "project-page-title",
        children: [
          e.jsx("small", { children: o ? "PROJECT" : "PROGETTO" }),
          e.jsx("h1", { children: `${l.codice} · ${l.nome}` }),
        ],
      }),
      e.jsxs("div", {
        className: "d-badges",
        children: [
          e.jsx("span", {
            className: `pill ${Br(l.stato)}`,
            children: l.stato,
          }),
          !l.inElenco &&
            e.jsx("span", {
              className: "pill ps-nd",
              children: "Storico · assente da #DV",
            }),
        ],
      }),
      e.jsx("div", {
        className: "section-head",
        children: e.jsxs("h2", {
          children: [o ? "Open tasks (" : "Task aperte (", d.length, ")"],
        }),
      }),
      e.jsxs("div", {
        className: "list",
        children: [
          d.map((x) => e.jsx(Pp, { t: x, showProject: !1 }, x.id)),
          !d.length &&
            e.jsx("p", {
              className: "empty",
              children: o ? "No open tasks." : "Nessuna task aperta.",
            }),
        ],
      }),
      u > 0 &&
        e.jsxs("p", {
          className: "hint",
          children: [
            u,
            " ",
            o
              ? u === 1
                ? "closed task"
                : "closed tasks"
              : u === 1
                ? "task chiusa"
                : "task chiuse",
            o ? " hidden." : " (validate) non mostrate.",
          ],
        }),
      e.jsx("div", {
        className: "section-head",
        children: e.jsxs("h2", { children: ["Note (", m.length, ")"] }),
      }),
      e.jsxs("div", {
        className: "list",
        children: [
          m.map((x) => e.jsx(lo, { n: x }, x.id)),
          !m.length &&
            e.jsx("p", {
              className: "empty",
              children: o ? "No notes." : "Nessuna nota.",
            }),
        ],
      }),
    ],
  });
}
function xj() {
  const { data: t, viewer: n, today: s } = Y();
  return C.useMemo(() => {
    const r = new Map();
    if (!t || !n) return r;
    const i = (a, l) => {
      var o;
      return r.set(a, {
        ...(r.get(a) ?? { tasks: 0, notes: 0 }),
        [l]: (((o = r.get(a)) == null ? void 0 : o[l]) ?? 0) + 1,
      });
    };
    return (
      Yn(n, t.task, Mt)
        .filter((a) => qe(a, s))
        .forEach((a) => i(a.progettoCodice, "tasks")),
      fc(n, t.note)
        .filter((a) => a.stato !== "chiusa")
        .forEach((a) => i(a.progettoCodice, "notes")),
      r
    );
  }, [t, n, s]);
}
function jj() {
  const { data: t, viewer: n, language: s } = Y(),
    [r, i] = C.useState("Active"),
    [a, l] = C.useState(""),
    [o, c] = C.useState(null),
    d = xj();
  if (!t || !n) return null;
  if (o)
    return e.jsx(fj, {
      code: o,
      onClose: () => {
        c(null), window.scrollTo({ top: 0, behavior: "smooth" });
      },
    });
  const u = s === "en",
    m = se(a),
    x = Ep(n, t.progetti).filter(
      (j) =>
        (r === "all" || normalizeProjectStatus(j.stato) === r) &&
        (!m || se(`${j.codice} ${j.nome}`).includes(m)),
    );
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx("h1", {
        className: "big title-row",
        children: u ? "Projects" : "Progetti",
      }),
      e.jsx(En, {
        value: a,
        onChange: l,
        placeholder: u ? "Search projects" : "Cerca un progetto",
      }),
      e.jsx(Sa, {
        label: "Filtro progetti",
        value: r,
        onChange: i,
        options: [
          ["all", u ? "All" : "Tutti"],
          ...PROJECT_STATUS_OPTIONS.map((j) => [j.value, j.value]),
        ],
      }),
      !Jn(n) &&
        e.jsx("p", {
          className: "hint",
          children: "Elenco condiviso con tutti i membri (da confermare).",
        }),
      e.jsxs("div", {
        className: "list",
        children: [
          x.map((j) => {
            const f = d.get(j.codice) ?? { tasks: 0, notes: 0 };
            return e.jsxs(
              "button",
              {
                className: "proj-card",
                onClick: () => {
                  c(j.codice), window.scrollTo({ top: 0, behavior: "smooth" });
                },
                children: [
                  e.jsx("span", {
                    className: "thumb",
                    children: e.jsx(ja, {}),
                  }),
                  e.jsxs("span", {
                    className: "pc-main",
                    children: [
                      e.jsxs("span", {
                        className: "pc-top",
                        children: [
                          e.jsx("b", { children: j.codice }),
                          e.jsx("span", {
                            className: `pill ${Br(j.stato)}`,
                            children: j.stato,
                          }),
                        ],
                      }),
                      e.jsx("span", { className: "pc-name", children: j.nome }),
                      e.jsxs("span", {
                        className: "pc-meta",
                        children: [
                          e.jsxs("span", {
                            children: [
                              e.jsx(up, {}),
                              " ",
                              f.tasks,
                              u ? " open tasks" : " task aperte",
                            ],
                          }),
                          e.jsxs("span", {
                            children: [
                              e.jsx(An, { size: 18 }),
                              " ",
                              f.notes,
                              " ",
                              u
                                ? f.notes === 1
                                  ? "note"
                                  : "notes"
                                : f.notes === 1
                                  ? "nota"
                                  : "note",
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              },
              j.id,
            );
          }),
          !x.length &&
            e.jsxs(Xi, {
              children: [
                r === "attivi" && !a
                  ? u
                    ? "No active project found. You can view all projects and check the data warnings."
                    : "Nessun progetto attivo rilevato. Puoi consultare tutti i progetti e verificare le segnalazioni in Persona e dati."
                  : u
                    ? "No project found."
                    : "Nessun progetto trovato.",
                r === "attivi" &&
                  !a &&
                  e.jsxs(e.Fragment, {
                    children: [
                      e.jsx("br", {}),
                      e.jsx("button", {
                        className: "link",
                        onClick: () => i("tutti"),
                        children: u
                          ? "Show all projects"
                          : "Mostra tutti i progetti",
                      }),
                    ],
                  }),
              ],
            }),
        ],
      }),
    ],
  });
}
const oo = (t, n) => new Date(Date.UTC(t, n, 0)).getUTCDate(),
  Ln = (t) => String(t).padStart(2, "0");
function co(t, n, s) {
  const [r, i] = n.split("-").map(Number);
  switch (t) {
    case "giorno":
      return { from: n, to: n, label: Kt(n) };
    case "settimana": {
      const a = Sn(n, -hc(n)),
        l = Sn(a, 6);
      return { from: a, to: l, label: `${$n(a)} – ${$n(l)}` };
    }
    case "mese":
      return {
        from: `${r}-${Ln(i)}-01`,
        to: `${r}-${Ln(i)}-${Ln(oo(r, i))}`,
        label: $x(n),
      };
    case "anno":
      return { from: `${r}-01-01`, to: `${r}-12-31`, label: String(r) };
    case "custom": {
      let a = (s == null ? void 0 : s.from) ?? n,
        l = (s == null ? void 0 : s.to) ?? n;
      return (
        a > l && ([a, l] = [l, a]),
        { from: a, to: l, label: `${$n(a)} – ${$n(l)}` }
      );
    }
  }
}
function Or(t, n, s) {
  const [r, i, a] = n.split("-").map(Number);
  if (t === "giorno") return Sn(n, s);
  if (t === "settimana") return Sn(n, 7 * s);
  if (t === "mese") {
    const l = new Date(Date.UTC(r, i - 1 + s, 1));
    return `${l.getUTCFullYear()}-${Ln(l.getUTCMonth() + 1)}-${Ln(Math.min(a, oo(l.getUTCFullYear(), l.getUTCMonth() + 1)))}`;
  }
  return `${r + s}-${Ln(i)}-${Ln(Math.min(a, oo(r + s, i)))}`;
}
const vj = (t, n) => t.data >= n.from && t.data <= n.to,
  ci = (t) => Math.round(t * 1e6) / 1e6;
function uo(t, n) {
  const s = t.filter((j) => vj(j, n)),
    r = ci(s.reduce((j, f) => j + f.ore, 0)),
    i = (j, f) => {
      const g = [];
      for (let b = j; b <= f; b = Sn(b, 1)) g.push(b);
      return g;
    },
    a = i(n.from, n.to).length,
    l = new Map(),
    o = new Map();
  for (const j of s) {
    l.set(j.data, (l.get(j.data) ?? 0) + j.ore);
    const f = j.data.slice(0, 7);
    o.set(f, (o.get(f) ?? 0) + j.ore);
  }
  const c = ["L", "M", "M", "G", "V", "S", "D"],
    d = ["G", "F", "M", "A", "M", "G", "L", "A", "S", "O", "N", "D"];
  let u;
  if (a > 62) {
    const j = [];
    for (
      let f = n.from.slice(0, 7);
      f <= n.to.slice(0, 7);
      f = Or("mese", f + "-01", 1).slice(0, 7)
    )
      j.push(f);
    u = j.map((f) => ({
      key: f,
      label: d[+f.slice(5) - 1],
      ore: ci(o.get(f) ?? 0),
    }));
  } else
    u = i(n.from, n.to).map((j) => ({
      key: j,
      label: a <= 7 ? c[hc(j)] : String(+j.slice(8)),
      ore: ci(l.get(j) ?? 0),
    }));
  const m = new Map();
  for (const j of s)
    m.set(j.progettoCodice, (m.get(j.progettoCodice) ?? 0) + j.ore);
  const x = [...m]
    .map(([j, f]) => ({ codice: j, ore: ci(f) }))
    .filter((j) => j.ore !== 0)
    .sort((j, f) => f.ore - j.ore);
  return { totale: r, barre: u, perProgetto: x };
}
const ue = (t) =>
    `${new Intl.NumberFormat("it-IT", { maximumFractionDigits: 2 }).format(t)} h`,
  Ip = (t) =>
    [4, 8, 12, 16, 20, 40, 80, 160, 320, 640, 1280].find((n) => n >= t) ??
    Math.ceil(t / 100) * 100,
  gj = [
    ["giorno", "Giorno"],
    ["settimana", "Sett."],
    ["mese", "Mese"],
    ["anno", "Anno"],
    ["custom", "Custom"],
  ];
function yj() {
  const { data: t, viewer: n, today: s, language: r } = Y(),
    [i, a] = C.useState("settimana"),
    [l, o] = C.useState(s),
    [c, d] = C.useState({ from: s.slice(0, 8) + "01", to: s }),
    [u, m] = C.useState(null),
    x = C.useMemo(
      () =>
        t && n ? t.persone.filter((P) => P.inRiepiloghiOre && cj(n, P)) : [],
      [t, n],
    ),
    j =
      x.find((P) => P.id === u) ??
      x.find((P) => P.id === (n == null ? void 0 : n.id)) ??
      x[0],
    f = C.useMemo(
      () => (t && j ? t.ore.filter((P) => se(P.persona) === se(j.nome)) : []),
      [t, j],
    ),
    g = co(i, l, c),
    b = C.useMemo(() => uo(f, g), [f, g.from, g.to]),
    v = C.useMemo(() => uo(f, co("giorno", s)).totale, [f, s]);
  if (!t || !n) return null;
  const h = r === "en";
  if (!j)
    return e.jsxs(e.Fragment, {
      children: [
        e.jsx("h1", {
          className: "big title-row",
          children: h ? "My hours" : "Le mie ore",
        }),
        e.jsx("p", {
          className: "empty",
          children: h
            ? "No hours available for this person."
            : "Nessuna ora disponibile per questa persona.",
        }),
      ],
    });
  const p = Ip(Math.max(0, ...b.barre.map((P) => P.ore))),
    y = [0, 1, 2, 3, 4].map((P) => (p / 4) * P),
    O = f.reduce((P, $) => P + $.ore, 0),
    k = b.barre.length > 12,
    z = (P) => {
      var $;
      return (
        (($ = t.progetti.find((N) => N.codice === P)) == null
          ? void 0
          : $.nome) ?? ""
      );
    },
    E = Math.max(0, ...b.perProgetto.map((P) => P.ore)),
    U = (P) => tl(P) && o(P);
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx("h1", {
        className: "big title-row",
        children:
          j.id === n.id
            ? h
              ? "My hours"
              : "Le mie ore"
            : `${h ? "Hours" : "Ore"} · ${j.nome.split(" ")[0]}`,
      }),
      e.jsx("p", { className: "sub", children: j.nome }),
      Jn(n) &&
        x.length > 1 &&
        e.jsx("div", {
          className: "team compact",
          children: x.map((P) =>
            e.jsx(
              Vr,
              {
                name: P.nome,
                size: 40,
                active: P.id === j.id,
                onClick: () => m(P.id),
                label: `Ore di ${P.nome}`,
              },
              P.id,
            ),
          ),
        }),
      e.jsx(Sa, {
        label: "Periodo",
        value: i,
        onChange: a,
        options: h
          ? [
              ["giorno", "Day"],
              ["settimana", "Week"],
              ["mese", "Month"],
              ["anno", "Year"],
              ["custom", "Custom"],
            ]
          : gj,
      }),
      i === "custom"
        ? e.jsxs("div", {
            className: "range-row",
            children: [
              e.jsxs("label", {
                children: [
                  h ? "From" : "Dal",
                  e.jsx("input", {
                    type: "date",
                    value: c.from,
                    onChange: (P) =>
                      tl(P.target.value) && d({ ...c, from: P.target.value }),
                  }),
                ],
              }),
              e.jsxs("label", {
                children: [
                  h ? "To" : "Al",
                  e.jsx("input", {
                    type: "date",
                    value: c.to,
                    onChange: (P) =>
                      tl(P.target.value) && d({ ...c, to: P.target.value }),
                  }),
                ],
              }),
            ],
          })
        : e.jsxs("div", {
            className: "nav-row",
            children: [
              e.jsx("button", {
                className: "icon-btn",
                onClick: () => o(Or(i, l, -1)),
                "aria-label": "Periodo precedente",
                children: e.jsx(Re, {}),
              }),
              e.jsxs("label", {
                className: "date-pick",
                children: [
                  e.jsx("span", { children: g.label }),
                  e.jsx("input", {
                    type: "date",
                    value: l,
                    onChange: (P) => U(P.target.value),
                    "aria-label": "Scegli una data dal calendario",
                  }),
                ],
              }),
              e.jsx("button", {
                className: "icon-btn",
                onClick: () => o(Or(i, l, 1)),
                "aria-label": "Periodo successivo",
                children: e.jsx(ve, {}),
              }),
            ],
          }),
      i === "settimana" &&
        e.jsx("p", {
          className: "hint",
          children: h
            ? "Calendar week, Monday–Sunday."
            : "Settimana di calendario, lunedì–domenica.",
        }),
      e.jsxs("div", {
        className: "total",
        children: [
          e.jsx("b", { children: ue(b.totale) }),
          e.jsx("span", {
            children:
              i === "custom"
                ? `Dal ${$n(g.from)} al ${$n(g.to)}`
                : {
                    giorno: h ? "This day" : "In questo giorno",
                    settimana: h ? "This week" : "Questa settimana",
                    mese: h ? "This month" : "In questo mese",
                    anno: h ? "This year" : "In quest’anno",
                  }[i],
          }),
        ],
      }),
      e.jsxs("div", {
        className: "chart",
        role: "img",
        "aria-label": `Ore per ${b.barre.length > 12 ? "periodo" : "giorno"}`,
        children: [
          e.jsx("div", {
            className: "y",
            children: y
              .slice()
              .reverse()
              .map((P) =>
                e.jsx(
                  "span",
                  {
                    style: { bottom: `${(P / p) * 100}%` },
                    children: Number.isInteger(P) ? P : P.toFixed(1),
                  },
                  P,
                ),
              ),
          }),
          e.jsxs("div", {
            className: "plot",
            children: [
              y.map((P) =>
                e.jsx(
                  "i",
                  { className: "grid", style: { bottom: `${(P / p) * 100}%` } },
                  P,
                ),
              ),
              e.jsx("div", {
                className: "bars",
                children: b.barre.map((P, $) =>
                  e.jsxs(
                    "div",
                    {
                      className: "bar-col",
                      title: `${P.key}: ${ue(P.ore)}`,
                      children: [
                        e.jsx("span", {
                          className: "bar",
                          style: { height: `${(P.ore / p) * 100}%` },
                        }),
                        e.jsx("em", {
                          className:
                            k && $ % 5 !== 0 && $ !== b.barre.length - 1
                              ? "hide"
                              : "",
                          children: P.label,
                        }),
                      ],
                    },
                    P.key,
                  ),
                ),
              }),
            ],
          }),
        ],
      }),
      e.jsx("div", {
        className: "section-head",
        children: e.jsx("h2", { children: h ? "By project" : "Per progetto" }),
      }),
      e.jsxs("div", {
        className: "by-proj",
        children: [
          b.perProgetto.map((P) =>
            e.jsxs(
              "div",
              {
                className: "bp-row",
                children: [
                  e.jsxs("span", {
                    className: "bp-name",
                    children: [
                      e.jsx("b", { children: P.codice }),
                      " · ",
                      z(P.codice),
                    ],
                  }),
                  e.jsx("span", {
                    className: "bp-bar",
                    children: e.jsx("i", {
                      style: { width: `${(P.ore / E) * 100}%` },
                    }),
                  }),
                  e.jsx("span", { className: "bp-h", children: ue(P.ore) }),
                ],
              },
              P.codice,
            ),
          ),
          !b.perProgetto.length &&
            e.jsx("p", {
              className: "empty",
              children: h
                ? "No hours recorded in this period."
                : "Nessuna ora registrata nel periodo.",
            }),
        ],
      }),
      e.jsxs("button", {
        className: "today-card",
        onClick: () => {
          a("giorno"), o(s);
        },
        children: [
          e.jsx("span", { className: "tc-ico", children: e.jsx(Ur, {}) }),
          e.jsxs("span", {
            children: [
              e.jsxs("small", {
                children: [
                  h ? "Today · " : "Oggi · ",
                  Kt(s).replace(/ \d{4}$/, ""),
                ],
              }),
              e.jsxs("b", {
                children: [ue(v), h ? " recorded" : " registrate"],
              }),
            ],
          }),
          e.jsx(ve, {}),
        ],
      }),
      e.jsxs("p", {
        className: "hint",
        children: [
          "Totale storico registrato: ",
          ue(O),
          ". Le ore di ",
          t.persone.filter((P) => !P.inRiepiloghiOre).length
            ? "alcune persone"
            : "altre persone",
          " sono escluse dai riepiloghi concordati.",
        ],
      }),
    ],
  });
}
const gt = ({ k: t, children: n }) =>
    e.jsxs("div", {
      className: "kv",
      children: [e.jsx("dt", { children: t }), e.jsx("dd", { children: n })],
    }),
  di = (t) => /^https?:\/\//i.test(t);
function Bd({ text: t }) {
  const [n, s] = C.useState(!1);
  return e.jsxs("button", {
    className: "mini",
    onClick: () => {
      var r;
      (r = navigator.clipboard) == null ||
        r.writeText(t).then(
          () => {
            s(!0), setTimeout(() => s(!1), 1500);
          },
          () => {},
        );
    },
    children: [e.jsx(Sx, {}), " ", n ? "Copiato" : "Copia"],
  });
}
function Nj({ id: t }) {
  const { data: n, today: s, close: r } = Y(),
    i = n == null ? void 0 : n.task.find((d) => d.id === t);
  if (!i || !n) return null;
  const a = Ce(i, s),
    l = n.progetti.find((d) => d.codice === i.progettoCodice),
    o = i.completed
      ? i.dataChiusura
        ? `Sì · chiusa il ${Kt(i.dataChiusura)}`
        : "Sì · data di chiusura mancante"
      : "No",
    c =
      a === "validata"
        ? "Validata"
        : i.validated
          ? "Segnata come validata ma non valida (manca completamento o data di chiusura)"
          : i.completed
            ? "In attesa di validazione del responsabile"
            : "Non validata";
  return e.jsxs($t, {
    title: "Dettaglio task",
    onClose: r,
    children: [
      e.jsxs("p", {
        className: "d-proj",
        children: [i.progettoCodice, l ? ` · ${l.nome}` : ""],
      }),
      e.jsx("h3", {
        className: "d-title",
        children: i.titolo || i.descrizione,
      }),
      e.jsxs("div", {
        className: "d-badges",
        children: [
          e.jsx("span", { className: `tc-status s-${a}`, children: Np[a] }),
          e.jsx(Tp, { t: i, today: s }),
        ],
      }),
      i.titolo &&
        i.descrizione &&
        e.jsx("p", { className: "d-text", children: i.descrizione }),
      i.commenti &&
        e.jsxs("div", {
          className: "callout",
          children: [
            e.jsx("b", { children: "Commenti" }),
            e.jsx("p", { children: i.commenti }),
          ],
        }),
      e.jsxs("dl", {
        className: "kvs",
        children: [
          e.jsx(gt, { k: "Assegnata a", children: i.assegnatario || "—" }),
          e.jsx(gt, { k: "Tipologia", children: i.tipologia || "—" }),
          e.jsx(gt, { k: "Priorità", children: i.priorita || "—" }),
          e.jsx(gt, { k: "Inizio", children: i.inizio ? Kt(i.inizio) : "—" }),
          e.jsx(gt, {
            k: "Scadenza",
            children: i.scadenza ? Kt(i.scadenza) : "—",
          }),
          i.orario && e.jsx(gt, { k: "Orario", children: i.orario }),
          e.jsx(gt, { k: "Completata", children: o }),
          e.jsx(gt, { k: "Validazione", children: c }),
        ],
      }),
      i.linkServer &&
        e.jsxs(e.Fragment, {
          children: [
            e.jsx("h4", { children: "Percorso server" }),
            e.jsxs("div", {
              className: "attach",
              children: [
                e.jsx(Ad, {}),
                e.jsx("span", { className: "path", children: i.linkServer }),
                di(i.linkServer)
                  ? e.jsxs("a", {
                      className: "mini",
                      href: i.linkServer,
                      target: "_blank",
                      rel: "noopener noreferrer",
                      children: [e.jsx(Ed, {}), " Apri"],
                    })
                  : e.jsx(Bd, { text: i.linkServer }),
              ],
            }),
            !di(i.linkServer) &&
              e.jsx("p", {
                className: "hint",
                children:
                  "Percorso interno dello studio: potrebbe non essere raggiungibile da iPhone.",
              }),
          ],
        }),
      i.immagini.length > 0 &&
        e.jsxs(e.Fragment, {
          children: [
            e.jsxs("h4", { children: ["Allegati (", i.immagini.length, ")"] }),
            i.immagini.map((d, u) =>
              e.jsxs(
                "div",
                {
                  className: "attach",
                  children: [
                    e.jsx(Ad, {}),
                    e.jsx("span", {
                      className: "path",
                      children: di(d) ? `Allegato ${u + 1}` : d,
                    }),
                    di(d)
                      ? e.jsxs("a", {
                          className: "mini",
                          href: d,
                          target: "_blank",
                          rel: "noopener noreferrer",
                          children: [e.jsx(Ed, {}), " Apri in Google Drive"],
                        })
                      : e.jsx(Bd, { text: d }),
                  ],
                },
                u,
              ),
            ),
            e.jsx("p", {
              className: "hint",
              children:
                "Nessuna anteprima: i file restano protetti dai permessi di Google Drive.",
            }),
          ],
        }),
    ],
  });
}
function kj({ id: t }) {
  const { data: n, close: s } = Y(),
    r = n == null ? void 0 : n.note.find((a) => a.id === t);
  if (!r || !n) return null;
  const i = n.progetti.find((a) => a.codice === r.progettoCodice);
  return e.jsxs($t, {
    title: "Nota",
    onClose: s,
    children: [
      e.jsxs("p", {
        className: "d-proj",
        children: [r.progettoCodice, i ? ` · ${i.nome}` : ""],
      }),
      e.jsx("div", {
        className: "d-badges",
        children: e.jsx(Ap, { s: r.stato }),
      }),
      e.jsx("p", { className: "d-text full", children: r.testo }),
      e.jsxs("dl", {
        className: "kvs",
        children: [
          e.jsx(gt, { k: "Autore", children: r.autore || "—" }),
          e.jsx(gt, {
            k: "Inserita il",
            children: r.creata ? Kt(r.creata) : "—",
          }),
          r.stato === "chiusa" &&
            e.jsx(gt, {
              k: "Chiusa il",
              children: r.chiusa ? Kt(r.chiusa) : "—",
            }),
        ],
      }),
    ],
  });
}
const zp = [
    {
      id: "s1",
      project: "P51",
      title: "Verificare avanzamento opere esterne",
      done: !1,
      checklist: ["Foto panoramica", "Quote principali", "Note impresa"],
    },
    {
      id: "s2",
      project: "M86",
      title: "Controllo campione finitura calcestruzzo",
      done: !1,
      checklist: ["Confronto capitolato", "Foto dettaglio", "Approvazione DL"],
    },
    {
      id: "s3",
      project: "O80",
      title: "Sopralluogo area Guest Hub",
      done: !0,
      checklist: ["Accessi", "Interferenze", "Verbale"],
    },
  ],
  Op = [
    {
      id: "e1",
      day: "07",
      month: "OTT",
      title: "Riunione Milanello",
      meta: "10:30 · Sala Lungarno",
    },
    {
      id: "e2",
      day: "09",
      month: "OTT",
      title: "Sopralluogo Flaminio",
      meta: "09:00 · Roma",
    },
    {
      id: "e3",
      day: "14",
      month: "OTT",
      title: "Review ampliamento Viola Park",
      meta: "15:00 · Google Meet",
    },
  ],
  Rp = [
    { id: "fiat500", category: "Auto", name: "500", available: !0 },
    { id: "jeep", category: "Auto", name: "Jeep", available: !1 },
    { id: "troc", category: "Auto", name: "T-Roc", available: !0 },
    { id: "visor", category: "Materiale", name: "Visore 3D", available: !0 },
    { id: "lungarno", category: "Sale", name: "Sala Lungarno", available: !1 },
    { id: "cellini", category: "Sale", name: "Sala Cellini", available: !0 },
    { id: "ingresso", category: "Sale", name: "Sala Ingresso", available: !0 },
  ],
  ht = {
    report: {
      issue: "REPORT · OTTOBRE 2026",
      title: "Persone, progetti, città",
      description: "Il nuovo numero della rivista mensile di studio.",
    },
    items: [
      {
        id: "c1",
        kind: "Evento",
        title: "Festa d'autunno",
        meta: "23 ottobre · Corte interna",
      },
      {
        id: "c2",
        kind: "Visita",
        title: "Uscita di gruppo al cantiere Flaminio",
        meta: "6 novembre · Roma",
      },
    ],
    poll: {
      question: "Parteciperai alla festa d'autunno?",
      options: ["Sì", "No", "Forse"],
    },
  },
  Hd = { width: 1200, height: 760 },
  rl = (t, n, s) => Math.min(s, Math.max(n, t)),
  il = [
    {
      id: "A03",
      code: "A.03",
      title: "Pianta piano terra",
      revision: "Rev. 04",
      date: "02/10/2026",
      category: "Architettonico",
    },
    {
      id: "A04",
      code: "A.04",
      title: "Pianta piano primo",
      revision: "Rev. 03",
      date: "28/09/2026",
      category: "Architettonico",
    },
    {
      id: "E02",
      code: "E.02",
      title: "Layout impianto elettrico",
      revision: "Rev. 02",
      date: "25/09/2026",
      category: "Impianti",
    },
  ];
function Sj({ variant: t = "A03" }) {
  const n = t === "E02" ? "#f4f0e9" : "#f4f5f3";
  return e.jsxs("svg", {
    className: "drawing-svg",
    viewBox: `0 0 ${Hd.width} ${Hd.height}`,
    role: "img",
    "aria-label": "Pianta esecutiva dimostrativa",
    children: [
      e.jsx("rect", { width: "1200", height: "760", fill: "#fff" }),
      e.jsxs("g", {
        fill: "none",
        stroke: "#232724",
        strokeWidth: "5",
        children: [
          e.jsx("path", { d: "M110 105H1085V650H110Z" }),
          e.jsx("path", {
            d: "M110 270H420V105M420 105V650M760 105V650M1085 330H760",
          }),
          e.jsx("path", { d: "M110 485H420M420 430H760M900 330V650" }),
        ],
      }),
      e.jsxs("g", {
        fill: n,
        stroke: "#232724",
        strokeWidth: "2",
        children: [
          e.jsx("rect", { x: "126", y: "121", width: "278", height: "133" }),
          e.jsx("rect", { x: "126", y: "286", width: "278", height: "183" }),
          e.jsx("rect", { x: "126", y: "501", width: "278", height: "133" }),
          e.jsx("rect", { x: "436", y: "121", width: "308", height: "293" }),
          e.jsx("rect", { x: "436", y: "446", width: "308", height: "188" }),
          e.jsx("rect", { x: "776", y: "121", width: "293", height: "193" }),
          e.jsx("rect", { x: "776", y: "346", width: "108", height: "288" }),
          e.jsx("rect", { x: "916", y: "346", width: "153", height: "288" }),
        ],
      }),
      e.jsxs("g", {
        fill: "none",
        stroke: "#707772",
        strokeWidth: "2",
        children: [
          e.jsx("path", {
            d: "M235 105v38a38 38 0 0 0 38-38M420 340h42a42 42 0 0 1-42 42M760 245h42a42 42 0 0 1-42 42M900 455h-36a36 36 0 0 0 36 36",
          }),
          e.jsx("path", {
            d: "M125 188h279M125 380h279M435 285h309M435 545h309",
            strokeDasharray: "8 8",
          }),
        ],
      }),
      e.jsxs("g", {
        fill: "#232724",
        fontFamily: "Arial, sans-serif",
        textAnchor: "middle",
        children: [
          e.jsx("text", {
            x: "265",
            y: "190",
            fontSize: "22",
            children: "INGRESSO",
          }),
          e.jsx("text", {
            x: "265",
            y: "390",
            fontSize: "22",
            children: "AREA OPERATIVA",
          }),
          e.jsx("text", {
            x: "265",
            y: "575",
            fontSize: "22",
            children: "DEPOSITO",
          }),
          e.jsx("text", {
            x: "590",
            y: "270",
            fontSize: "24",
            children: "SALA PRINCIPALE",
          }),
          e.jsx("text", {
            x: "590",
            y: "545",
            fontSize: "22",
            children: "DISTRIBUZIONE",
          }),
          e.jsx("text", {
            x: "920",
            y: "225",
            fontSize: "22",
            children: "SALA RIUNIONI",
          }),
          e.jsx("text", {
            x: "830",
            y: "495",
            fontSize: "18",
            transform: "rotate(-90 830 495)",
            children: "SERVIZI",
          }),
          e.jsx("text", {
            x: "995",
            y: "495",
            fontSize: "18",
            transform: "rotate(-90 995 495)",
            children: "TECNICO",
          }),
        ],
      }),
      t === "E02" &&
        e.jsxs("g", {
          fill: "none",
          stroke: "#626763",
          strokeWidth: "3",
          children: [
            e.jsx("path", {
              d: "M160 160H370V610M470 160H710V610M810 160H1035V600",
              strokeDasharray: "12 7",
            }),
            [190, 335, 535].map((s, r) =>
              e.jsxs(
                "g",
                {
                  children: [
                    e.jsx("circle", { cx: 230 + r * 330, cy: s, r: "12" }),
                    e.jsx("path", {
                      d: `M${218 + r * 330} ${s}h24M${230 + r * 330} ${s - 12}v24`,
                    }),
                  ],
                },
                s,
              ),
            ),
          ],
        }),
      e.jsx("g", {
        stroke: "#8c938f",
        strokeWidth: "1.5",
        fill: "none",
        children: e.jsx("path", {
          d: "M110 70H1085M110 58v24M1085 58v24M75 105V650M63 105h24M63 650h24",
        }),
      }),
      e.jsxs("g", {
        fill: "#626963",
        fontFamily: "Arial, sans-serif",
        fontSize: "15",
        children: [
          e.jsx("text", {
            x: "570",
            y: "61",
            textAnchor: "middle",
            children: "19.50 m",
          }),
          e.jsx("text", {
            x: "50",
            y: "390",
            transform: "rotate(-90 50 390)",
            textAnchor: "middle",
            children: "10.90 m",
          }),
        ],
      }),
      e.jsxs("g", {
        transform: "translate(935 665)",
        children: [
          e.jsx("rect", {
            width: "150",
            height: "60",
            fill: "#fff",
            stroke: "#232724",
            strokeWidth: "2",
          }),
          e.jsx("text", {
            x: "12",
            y: "24",
            fontFamily: "Arial",
            fontSize: "13",
            fontWeight: "bold",
            children: "ARCHEA",
          }),
          e.jsx("text", {
            x: "12",
            y: "45",
            fontFamily: "Arial",
            fontSize: "11",
            children: "DEMO ESECUTIVO",
          }),
        ],
      }),
    ],
  });
}
function Cj({
  projectCode: t,
  plan: n,
  annotations: s,
  english: r,
  onAddAnnotation: i,
  onClose: a,
}) {
  const [l, o] = C.useState(1),
    [c, d] = C.useState({ x: 0, y: 0 }),
    [u, m] = C.useState(null),
    [x, j] = C.useState(null),
    f = C.useRef(null),
    g = C.useRef(null),
    b = C.useRef(null),
    v = C.useRef(new Map()),
    h = C.useRef({
      pointerId: null,
      startX: 0,
      startY: 0,
      originX: 0,
      originY: 0,
      timer: null,
      moved: !1,
      longPressed: !1,
    }),
    p = C.useRef(null),
    y = s.filter((S) => S.planId === n.id),
    O = (S) => {
      const L = g.current.getBoundingClientRect();
      return {
        x: rl((S.clientX - L.left) / L.width, 0, 1),
        y: rl((S.clientY - L.top) / L.height, 0, 1),
      };
    },
    k = () => {
      h.current.timer && window.clearTimeout(h.current.timer),
        (h.current.timer = null);
    },
    z = (S) => {
      var L, H, _, A;
      if (
        !((H = (L = S.target).closest) != null && H.call(L, ".plan-marker"))
      ) {
        if (
          ((A = (_ = S.currentTarget).setPointerCapture) == null ||
            A.call(_, S.pointerId),
          v.current.set(S.pointerId, { x: S.clientX, y: S.clientY }),
          v.current.size === 2)
        ) {
          k();
          const [w, B] = [...v.current.values()],
            T = f.current.getBoundingClientRect(),
            D = { x: (w.x + B.x) / 2, y: (w.y + B.y) / 2 },
            X = {
              x: D.x - T.left - g.current.offsetLeft,
              y: D.y - T.top - g.current.offsetTop,
            };
          p.current = {
            distance: Math.hypot(w.x - B.x, w.y - B.y),
            scale: l,
            contentX: (X.x - c.x) / l,
            contentY: (X.y - c.y) / l,
          };
          return;
        }
        h.current = {
          pointerId: S.pointerId,
          startX: S.clientX,
          startY: S.clientY,
          originX: c.x,
          originY: c.y,
          moved: !1,
          longPressed: !1,
          timer: window.setTimeout(() => {
            (h.current.longPressed = !0),
              m(O(S)),
              navigator.vibrate && navigator.vibrate(35);
          }, 650),
        };
      }
    },
    E = (S) => {
      if (
        (v.current.has(S.pointerId) &&
          v.current.set(S.pointerId, { x: S.clientX, y: S.clientY }),
        v.current.size === 2 && p.current)
      ) {
        k();
        const [_, A] = [...v.current.values()],
          w = Math.hypot(_.x - A.x, _.y - A.y),
          B = rl(
            (p.current.scale * w) / Math.max(1, p.current.distance),
            0.75,
            4,
          ),
          T = { x: (_.x + A.x) / 2, y: (_.y + A.y) / 2 },
          D = f.current.getBoundingClientRect(),
          X = {
            x: T.x - D.left - g.current.offsetLeft,
            y: T.y - D.top - g.current.offsetTop,
          };
        o(B),
          d({
            x: X.x - p.current.contentX * B,
            y: X.y - p.current.contentY * B,
          });
        return;
      }
      if (h.current.pointerId !== S.pointerId || h.current.longPressed) return;
      const L = S.clientX - h.current.startX,
        H = S.clientY - h.current.startY;
      Math.hypot(L, H) > 7 &&
        ((h.current.moved = !0),
        k(),
        d({ x: h.current.originX + L, y: h.current.originY + H }));
    },
    U = (S) => {
      k(),
        v.current.delete(S.pointerId),
        v.current.size < 2 && (p.current = null),
        (h.current.pointerId = null);
    };
  C.useEffect(() => () => k(), []);
  const P = () => {
      const S = prompt(
        r ? "Write the note for this point" : "Scrivi la nota per questo punto",
      );
      S != null &&
        S.trim() &&
        i({ planId: n.id, point: u, type: "note", text: S.trim() }),
        m(null);
    },
    $ = () => {
      var S;
      return (S = b.current) == null ? void 0 : S.click();
    },
    N = async (S) => {
      if (!S || !u) return;
      const L = S.name.replace(/\.[^.]+$/, ""),
        H = prompt(
          r
            ? "Rename photo before saving"
            : "Rinomina la foto prima di salvarla",
          `${t}_${n.code.replace(".", "")}_${L}`,
        );
      if (!(H != null && H.trim())) {
        m(null);
        return;
      }
      const _ = await bj(S);
      i({ planId: n.id, point: u, type: "photo", text: H.trim(), image: _ }),
        m(null);
    },
    I = () => {
      o(1), d({ x: 0, y: 0 });
    };
  return e.jsxs("div", {
    className: "plan-viewer",
    role: "dialog",
    "aria-modal": "true",
    "aria-label": `${n.code} ${n.title}`,
    children: [
      e.jsxs("header", {
        className: "plan-viewer-head",
        children: [
          e.jsx("button", {
            className: "icon-btn light",
            onClick: a,
            "aria-label": r ? "Close drawing" : "Chiudi elaborato",
            children: e.jsx(so, {}),
          }),
          e.jsxs("div", {
            children: [
              e.jsxs("small", { children: [t, " · ", n.revision] }),
              e.jsxs("b", { children: [n.code, " · ", n.title] }),
            ],
          }),
          e.jsx("span", { className: "sync-badge", children: "DEMO" }),
        ],
      }),
      e.jsxs("div", {
        className: "plan-toolbar gesture-toolbar",
        children: [
          e.jsx("span", {
            children: r
              ? "Pinch with two fingers to zoom"
              : "Pizzica con due dita per ingrandire",
          }),
          e.jsxs("b", { children: [Math.round(l * 100), "%"] }),
          e.jsx("button", { onClick: I, children: r ? "Fit" : "Adatta" }),
        ],
      }),
      e.jsx("div", {
        ref: f,
        className: "plan-viewport",
        children: e.jsxs("div", {
          ref: g,
          className: "plan-stage",
          style: { transform: `translate(${c.x}px, ${c.y}px) scale(${l})` },
          onPointerDown: z,
          onPointerMove: E,
          onPointerUp: U,
          onPointerCancel: U,
          onContextMenu: (S) => S.preventDefault(),
          children: [
            e.jsx(Sj, { variant: n.id }),
            y.map((S, L) =>
              e.jsx(
                "button",
                {
                  className: `plan-marker ${S.type}`,
                  style: {
                    left: `${S.point.x * 100}%`,
                    top: `${S.point.y * 100}%`,
                  },
                  onPointerDown: (H) => H.stopPropagation(),
                  onClick: () => j(S),
                  "aria-label": `${S.type === "photo" ? "Foto" : "Nota"} ${L + 1}`,
                  children: e.jsx("span", { children: L + 1 }),
                },
                S.id,
              ),
            ),
          ],
        }),
      }),
      e.jsxs("div", {
        className: "plan-hint",
        children: [
          e.jsx("span", { className: "press-symbol", children: "◎" }),
          e.jsxs("span", {
            children: [
              e.jsx("b", {
                children: r
                  ? "Press and hold on the drawing"
                  : "Tieni premuto sulla pianta",
              }),
              e.jsx("small", {
                children: r
                  ? "Drag to move · pinch with two fingers to zoom"
                  : "Trascina per spostarti · pizzica con due dita per ingrandire",
              }),
            ],
          }),
        ],
      }),
      e.jsxs("div", {
        className: "plan-viewer-foot",
        children: [
          e.jsxs("span", {
            children: [
              e.jsx("i", { className: "legend-pin note" }),
              y.filter((S) => S.type === "note").length,
              " ",
              r ? "notes" : "note",
            ],
          }),
          e.jsxs("span", {
            children: [
              e.jsx("i", { className: "legend-pin photo" }),
              y.filter((S) => S.type === "photo").length,
              " foto",
            ],
          }),
        ],
      }),
      e.jsx("input", {
        ref: b,
        hidden: !0,
        type: "file",
        accept: "image/*",
        capture: "environment",
        onChange: (S) => {
          var L;
          N((L = S.target.files) == null ? void 0 : L[0]),
            (S.target.value = "");
        },
      }),
      u &&
        e.jsxs("div", {
          className: "plan-action-wrap",
          children: [
            e.jsx("button", {
              className: "plan-action-backdrop",
              "aria-label": "Annulla",
              onClick: () => m(null),
            }),
            e.jsxs("div", {
              className: "plan-action-sheet",
              children: [
                e.jsx("span", { className: "sheet-grip" }),
                e.jsx("small", { children: r ? "NEW POINT" : "NUOVO PUNTO" }),
                e.jsx("h2", {
                  children: r
                    ? "What do you want to add?"
                    : "Cosa vuoi inserire qui?",
                }),
                e.jsxs("button", {
                  onClick: P,
                  children: [
                    e.jsx("span", {
                      className: "action-icon",
                      children: e.jsx(An, {}),
                    }),
                    e.jsxs("span", {
                      children: [
                        e.jsx("b", {
                          children: r ? "Add a note" : "Inserisci una nota",
                        }),
                        e.jsx("small", {
                          children: r
                            ? "Write an issue or a site check"
                            : "Scrivi una verifica o una segnalazione",
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs("button", {
                  onClick: $,
                  children: [
                    e.jsx("span", {
                      className: "action-icon dark",
                      children: e.jsx(pp, {}),
                    }),
                    e.jsxs("span", {
                      children: [
                        e.jsx("b", {
                          children: r ? "Take a photo" : "Scatta una foto",
                        }),
                        e.jsx("small", {
                          children: r
                            ? "Rename and pin it to the drawing"
                            : "Rinominala e collegala alla pianta",
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsx("button", {
                  className: "cancel-action",
                  onClick: () => m(null),
                  children: r ? "Cancel" : "Annulla",
                }),
              ],
            }),
          ],
        }),
      x &&
        e.jsxs("div", {
          className: "annotation-detail",
          children: [
            e.jsx("button", {
              className: "annotation-backdrop",
              onClick: () => j(null),
              "aria-label": "Chiudi",
            }),
            e.jsxs("article", {
              children: [
                e.jsx("button", {
                  className: "icon-btn",
                  onClick: () => j(null),
                  children: e.jsx(so, {}),
                }),
                x.image &&
                  e.jsx("img", { src: x.image, alt: "Foto di sopralluogo" }),
                e.jsx("small", {
                  children:
                    x.type === "photo"
                      ? "FOTO DI SOPRALLUOGO"
                      : "NOTA DI SOPRALLUOGO",
                }),
                e.jsx("h2", { children: x.text }),
                e.jsx("p", {
                  children: new Date(x.createdAt).toLocaleString(
                    r ? "en-GB" : "it-IT",
                  ),
                }),
                e.jsx("span", {
                  className: "pill note-aperta",
                  children: r ? "Open" : "Aperta",
                }),
              ],
            }),
          ],
        }),
    ],
  });
}
function bj(t) {
  return new Promise((n, s) => {
    const r = new FileReader();
    (r.onerror = s),
      (r.onload = () => {
        const i = new Image();
        (i.onerror = s),
          (i.onload = () => {
            const l = Math.min(1, 1400 / Math.max(i.width, i.height)),
              o = document.createElement("canvas");
            (o.width = Math.max(1, Math.round(i.width * l))),
              (o.height = Math.max(1, Math.round(i.height * l))),
              o.getContext("2d").drawImage(i, 0, 0, o.width, o.height),
              n(o.toDataURL("image/jpeg", 0.78));
          }),
          (i.src = r.result);
      }),
      r.readAsDataURL(t);
  });
}
const Mp = "archea-demo-site-annotations-v1",
  wj = () => {
    try {
      return JSON.parse(localStorage.getItem(Mp) || "[]");
    } catch {
      return [];
    }
  };
function Aj() {
  var $;
  const { data: t, viewer: n, language: s } = Y(),
    r = t.progetti.filter((N) => normalizeProjectStatus(N.stato) === "Active"),
    [i, a] = C.useState((($ = r[0]) == null ? void 0 : $.codice) || ""),
    [l, o] = C.useState(zp),
    [c, d] = C.useState([]),
    [u, m] = C.useState(wj),
    [x, j] = C.useState(null),
    [f, g] = C.useState(!1),
    [b, v] = C.useState(""),
    h = C.useRef(null),
    p = s === "en",
    y = r.find((N) => N.codice === i),
    O = se(b),
    k = l.filter((N) => N.project === i),
    z = u.filter((N) => N.projectCode === i);
  C.useEffect(() => {
    try {
      localStorage.setItem(Mp, JSON.stringify(u));
    } catch {}
  }, [u]);
  const E = () => {
      const N = prompt(p ? "New site task" : "Nuova attività di cantiere");
      N != null &&
        N.trim() &&
        o((I) => [
          ...I,
          {
            id: crypto.randomUUID(),
            project: i,
            title: N.trim(),
            done: !1,
            checklist: [],
          },
        ]);
    },
    U = (N) => {
      if (!N) return;
      const I = N.name.replace(/\.[^.]+$/, ""),
        S = prompt(
          p
            ? "Rename photo before saving"
            : "Rinomina la foto prima di salvarla",
          `${i}_${I}`,
        );
      S != null &&
        S.trim() &&
        d((L) => [
          {
            id: crypto.randomUUID(),
            name: S.trim(),
            url: URL.createObjectURL(N),
            status: "pending",
          },
          ...L,
        ]);
    },
    P = (N) =>
      m((I) => [
        ...I,
        {
          ...N,
          id: crypto.randomUUID(),
          projectCode: i,
          author: n.nome,
          createdAt: new Date().toISOString(),
          status: "open",
        },
      ]);
  return e.jsxs(e.Fragment, {
    children: [
      e.jsxs("div", {
        className: "title-action",
        children: [
          e.jsxs("div", {
            children: [
              e.jsx("h1", {
                className: "big title-row",
                children: p ? "Site" : "Cantiere",
              }),
              e.jsx("p", {
                className: "sub",
                children: p
                  ? "Checks, tasks and project photos"
                  : "Controlli, attività e foto per progetto",
              }),
            ],
          }),
          zr(n) &&
            e.jsx("button", {
              className: "round-add",
              onClick: E,
              "aria-label": "Aggiungi",
              children: e.jsx(tt, {}),
            }),
        ],
      }),
      e.jsx("label", {
        className: "field-label",
        children: p ? "Active project" : "Progetto attivo",
      }),
      e.jsxs("button", {
        className: "picker",
        onClick: () => g(!0),
        "aria-haspopup": "dialog",
        children: [
          e.jsx("span", {
            children: y
              ? `${y.codice} · ${y.nome}`
              : p
                ? "No active project"
                : "Nessun progetto attivo",
          }),
          e.jsx(_t, {}),
        ],
      }),
      y &&
        e.jsxs("div", {
          className: "project-hero site-project-hero",
          children: [
            e.jsx("span", { className: "thumb", children: e.jsx(ja, {}) }),
            e.jsxs("span", {
              children: [
                e.jsx("b", { children: y.codice }),
                e.jsx("small", { children: y.nome }),
              ],
            }),
          ],
        }),
      e.jsxs("div", {
        className: "section-head",
        children: [
          e.jsx("h2", { children: p ? "Site tasks" : "Task di sopralluogo" }),
          e.jsx("span", {
            className: "count",
            children: k.filter((N) => !N.done).length,
          }),
        ],
      }),
      e.jsxs("div", {
        className: "list",
        children: [
          k.map((N) =>
            e.jsxs(
              "div",
              {
                className: `site-task${N.done ? " done" : ""}`,
                children: [
                  e.jsx("button", {
                    className: "check-button",
                    onClick: () =>
                      zr(n) &&
                      o((I) =>
                        I.map((S) =>
                          S.id === N.id ? { ...S, done: !S.done } : S,
                        ),
                      ),
                    children: e.jsx(mp, {}),
                  }),
                  e.jsxs("span", {
                    children: [
                      e.jsx("b", { children: N.title }),
                      N.checklist.length > 0 &&
                        e.jsx("small", { children: N.checklist.join(" · ") }),
                    ],
                  }),
                ],
              },
              N.id,
            ),
          ),
          !k.length &&
            e.jsx("p", {
              className: "empty",
              children: p
                ? "No site tasks for this project."
                : "Nessuna attività di cantiere per questo progetto.",
            }),
        ],
      }),
      e.jsxs("div", {
        className: "section-head plan-section-head",
        children: [
          e.jsxs("div", {
            children: [
              e.jsx("h2", {
                children: p ? "Construction drawings" : "Elaborati esecutivi",
              }),
              e.jsx("p", {
                children: p
                  ? "Open a drawing and hold to add notes or photos."
                  : "Apri una pianta e tieni premuto per inserire note o foto.",
              }),
            ],
          }),
          e.jsx("span", { className: "count", children: il.length }),
        ],
      }),
      e.jsx("div", {
        className: "drawing-list",
        children: il.map((N) => {
          const I = z.filter((S) => S.planId === N.id).length;
          return e.jsxs(
            "button",
            {
              className: "drawing-row",
              onClick: () => j(N),
              children: [
                e.jsxs("span", {
                  className: "drawing-thumb",
                  children: [
                    e.jsx("span", { children: N.code }),
                    e.jsx("i", {}),
                    e.jsx("i", {}),
                    e.jsx("i", {}),
                  ],
                }),
                e.jsxs("span", {
                  className: "drawing-info",
                  children: [
                    e.jsxs("small", {
                      children: [N.category, " · ", N.revision],
                    }),
                    e.jsx("b", { children: N.title }),
                    e.jsx("em", { children: N.date }),
                  ],
                }),
                e.jsx("span", {
                  className: `drawing-count${I ? " has-items" : ""}`,
                  children: I
                    ? `${I} ${p ? "points" : "punti"}`
                    : p
                      ? "Open"
                      : "Apri",
                }),
              ],
            },
            N.id,
          );
        }),
      }),
      z.length > 0 &&
        e.jsxs(e.Fragment, {
          children: [
            e.jsxs("div", {
              className: "section-head",
              children: [
                e.jsx("h2", {
                  children: p ? "Site report" : "Riepilogo sopralluogo",
                }),
                e.jsx("span", { className: "count", children: z.length }),
              ],
            }),
            e.jsx("div", {
              className: "inspection-summary",
              children: z
                .slice()
                .reverse()
                .map((N, I) => {
                  const S = il.find((L) => L.id === N.planId);
                  return e.jsxs(
                    "button",
                    {
                      onClick: () => j(S),
                      children: [
                        e.jsx("span", {
                          className: `summary-index ${N.type}`,
                          children: z.length - I,
                        }),
                        e.jsxs("span", {
                          children: [
                            e.jsxs("small", {
                              children: [
                                S == null ? void 0 : S.code,
                                " · ",
                                N.type === "photo" ? "FOTO" : "NOTA",
                              ],
                            }),
                            e.jsx("b", { children: N.text }),
                            e.jsx("em", {
                              children: new Date(N.createdAt).toLocaleString(
                                p ? "en-GB" : "it-IT",
                              ),
                            }),
                          ],
                        }),
                      ],
                    },
                    N.id,
                  );
                }),
            }),
          ],
        }),
      e.jsxs("button", {
        className: "camera-button",
        onClick: () => {
          var N;
          return (N = h.current) == null ? void 0 : N.click();
        },
        children: [
          e.jsx(pp, {}),
          e.jsxs("span", {
            children: [
              e.jsx("b", {
                children: p
                  ? "Take or choose a photo"
                  : "Scatta o scegli una foto",
              }),
              e.jsx("small", {
                children: p
                  ? "Rename it before Drive sync"
                  : "Rinominala prima della sincronizzazione Drive",
              }),
            ],
          }),
        ],
      }),
      e.jsx("input", {
        ref: h,
        hidden: !0,
        type: "file",
        accept: "image/*",
        capture: "environment",
        onChange: (N) => {
          var I;
          U((I = N.target.files) == null ? void 0 : I[0]),
            (N.target.value = "");
        },
      }),
      c.length > 0 &&
        e.jsx("div", {
          className: "photo-grid",
          children: c.map((N) =>
            e.jsxs(
              "figure",
              {
                children: [
                  e.jsx("img", { src: N.url, alt: "" }),
                  e.jsxs("figcaption", {
                    children: [
                      N.name,
                      e.jsx("small", {
                        children: p
                          ? "Waiting for Drive connection"
                          : "In attesa del collegamento Drive",
                      }),
                    ],
                  }),
                ],
              },
              N.id,
            ),
          ),
        }),
      e.jsx(SiteMinutesDemo, { project: i, mobile: !0 }),
      f &&
        e.jsxs($t, {
          title: p ? "Choose active project" : "Scegli progetto attivo",
          onClose: () => {
            g(!1), v("");
          },
          children: [
            e.jsx(En, {
              value: b,
              onChange: v,
              placeholder: p
                ? "Search by code or name"
                : "Cerca per codice o nome",
            }),
            e.jsx("div", {
              className: "list tight",
              children: r
                .filter((N) => !O || se(`${N.codice} ${N.nome}`).includes(O))
                .map((N) =>
                  e.jsxs(
                    "button",
                    {
                      className: `pick-row${N.codice === i ? " on" : ""}`,
                      onClick: () => {
                        a(N.codice), g(!1), v("");
                      },
                      children: [
                        e.jsx("b", { children: N.codice }),
                        e.jsx("span", { children: N.nome }),
                        e.jsx("span", {
                          className: `pill ${Br(N.stato)}`,
                          children: N.stato,
                        }),
                      ],
                    },
                    N.id,
                  ),
                ),
            }),
          ],
        }),
      x &&
        e.jsx(Cj, {
          projectCode: i,
          plan: x,
          annotations: z,
          english: p,
          onAddAnnotation: P,
          onClose: () => j(null),
        }),
    ],
  });
}
function Ej() {
  const { language: t } = Y(),
    n = t === "en";
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx("h1", {
        className: "big title-row",
        children: n ? "Calendar" : "Calendario",
      }),
      e.jsx("p", {
        className: "sub",
        children: n
          ? "Meetings, deadlines and site visits"
          : "Riunioni, scadenze e sopralluoghi",
      }),
      e.jsxs("div", {
        className: "integration-banner",
        children: [
          e.jsx("span", { className: "live-dot" }),
          e.jsxs("span", {
            children: [
              e.jsx("b", { children: "Google Calendar" }),
              e.jsx("small", {
                children: n
                  ? "Ready to configure"
                  : "Predisposto, da configurare",
              }),
            ],
          }),
        ],
      }),
      e.jsx("div", {
        className: "section-head",
        children: e.jsx("h2", {
          children: n ? "Upcoming" : "Prossimi appuntamenti",
        }),
      }),
      e.jsx("div", {
        className: "list",
        children: Op.map((s) =>
          e.jsxs(
            "article",
            {
              className: "event-row",
              children: [
                e.jsxs("time", {
                  children: [
                    e.jsx("b", { children: s.day }),
                    e.jsx("small", { children: s.month }),
                  ],
                }),
                e.jsxs("span", {
                  children: [
                    e.jsx("b", { children: s.title }),
                    e.jsx("small", { children: s.meta }),
                  ],
                }),
              ],
            },
            s.id,
          ),
        ),
      }),
    ],
  });
}
const Tj = ["Auto", "Materiale", "Sale"];
function Pj() {
  const { language: t } = Y(),
    n = t === "en",
    [s, r] = C.useState("Auto"),
    [i, a] = C.useState([]),
    l = (o) => {
      !o.available || i.includes(o.id) || a((c) => [...c, o.id]);
    };
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx("h1", {
        className: "big title-row",
        children: n ? "Bookings" : "Prenotazioni",
      }),
      e.jsx("p", {
        className: "sub",
        children: n
          ? "Cars, equipment and meeting rooms"
          : "Auto, materiale e sale riunioni",
      }),
      e.jsx("div", {
        className: "chips",
        children: Tj.map((o) =>
          e.jsx(
            "button",
            {
              className: `chip${s === o ? " on" : ""}`,
              onClick: () => r(o),
              children: n
                ? { Auto: "Cars", Materiale: "Equipment", Sale: "Rooms" }[o]
                : o,
            },
            o,
          ),
        ),
      }),
      e.jsx("div", {
        className: "resource-grid",
        children: Rp.filter((o) => o.category === s).map((o) => {
          const c = i.includes(o.id);
          return e.jsxs(
            "button",
            {
              className: `resource-card${!o.available && !c ? " busy" : ""}`,
              onClick: () => l(o),
              children: [
                e.jsx("span", {
                  className: "resource-mark",
                  children: o.name.slice(0, 2).toUpperCase(),
                }),
                e.jsx("b", { children: o.name }),
                e.jsx("small", {
                  children: c
                    ? n
                      ? "Booked by you"
                      : "Prenotato da te"
                    : o.available
                      ? n
                        ? "Available"
                        : "Disponibile"
                      : n
                        ? "Busy"
                        : "Occupato",
                }),
              ],
            },
            o.id,
          );
        }),
      }),
      e.jsx("p", {
        className: "hint",
        children: n
          ? "Demo bookings. Google Calendar resources are ready to be connected."
          : "Prenotazioni dimostrative. Le risorse Google Calendar sono predisposte per il collegamento.",
      }),
    ],
  });
}
function Ij() {
  const { viewer: t, language: n } = Y(),
    s = n === "en",
    [r, i] = C.useState("");
  return e.jsxs(e.Fragment, {
    children: [
      e.jsxs("div", {
        className: "title-action",
        children: [
          e.jsxs("div", {
            children: [
              e.jsx("h1", {
                className: "big title-row",
                children: "IN ARCHEA",
              }),
              e.jsx("p", {
                className: "sub",
                children: s
                  ? "Studio life, culture and people"
                  : "Vita, cultura e persone dello studio",
              }),
            ],
          }),
          zr(t) &&
            e.jsx("button", {
              className: "round-add",
              "aria-label": "Aggiungi",
              children: e.jsx(tt, {}),
            }),
        ],
      }),
      e.jsxs("article", {
        className: "report-card",
        children: [
          e.jsx("span", { children: e.jsx(An, { size: 30 }) }),
          e.jsxs("div", {
            children: [
              e.jsx("small", { children: ht.report.issue }),
              e.jsx("h2", { children: ht.report.title }),
              e.jsx("p", { children: ht.report.description }),
              e.jsx("button", {
                className: "mini",
                children: s ? "Open report" : "Apri il report",
              }),
            ],
          }),
        ],
      }),
      e.jsx("div", {
        className: "section-head",
        children: e.jsx("h2", {
          children: s ? "Events and visits" : "Eventi e uscite",
        }),
      }),
      e.jsx("div", {
        className: "list",
        children: ht.items.map((a) =>
          e.jsxs(
            "article",
            {
              className: "community-row",
              children: [
                e.jsx("span", { children: a.kind }),
                e.jsxs("div", {
                  children: [
                    e.jsx("b", { children: a.title }),
                    e.jsx("small", { children: a.meta }),
                  ],
                }),
              ],
            },
            a.id,
          ),
        ),
      }),
      e.jsxs("div", {
        className: "poll-card",
        children: [
          e.jsx("small", { children: s ? "POLL" : "SONDAGGIO" }),
          e.jsx("h2", { children: ht.poll.question }),
          e.jsx("div", {
            children: ht.poll.options.map((a) =>
              e.jsx(
                "button",
                {
                  className: r === a ? "on" : "",
                  onClick: () => i(a),
                  children: a,
                },
                a,
              ),
            ),
          }),
          r &&
            e.jsx("p", {
              children: s ? "Response saved." : "Risposta registrata.",
            }),
        ],
      }),
    ],
  });
}
function Dp() {
  return e.jsxs("svg", {
    className: "archeai-sparkles",
    viewBox: "0 0 40 40",
    fill: "currentColor",
    "aria-hidden": "true",
    children: [
      e.jsx("path", {
        d: "M25 1c1.5 8 5.8 12.4 14 14-8.2 1.6-12.5 6-14 14-1.6-8-5.9-12.4-14-14C19.1 13.4 23.4 9 25 1z",
      }),
      e.jsx("path", {
        d: "M7 4c.7 3.8 2.8 5.9 6.7 6.7C9.8 11.4 7.7 13.5 7 17.3 6.2 13.5 4.1 11.4.3 10.7 4.1 9.9 6.2 7.8 7 4z",
      }),
      e.jsx("path", {
        d: "M11 24c.6 3 2.2 4.6 5.2 5.2-3 .6-4.6 2.2-5.2 5.2-.6-3-2.2-4.6-5.2-5.2 3-.6 4.6-2.2 5.2-5.2z",
      }),
    ],
  });
}
function xc({ compact: t = !1 }) {
  return e.jsxs("span", {
    className: `archeai-mark${t ? " compact" : ""}`,
    "aria-label": "ARCHEAI",
    children: [
      e.jsx("span", { className: "archeai-arche", children: "ARCHE" }),
      e.jsxs("span", {
        className: "archeai-symbol",
        children: [e.jsx("strong", { children: "AI" }), e.jsx(Dp, {})],
      }),
    ],
  });
}
const zj = [
  "Dove trovo il contratto del progetto AR_137?",
  "Come posso consultare le guide Revit?",
  "Dove posso controllare le ore del progetto?",
];
function Oj(t, n) {
  const s = t.toLowerCase();
  return s.includes("contratt") || s.includes("pagament")
    ? n
      ? "Open Accounting, select project AR_137 and open “Contract and client”. The same page also contains payments, deadlines and outstanding amounts."
      : "Apri Contabilità, seleziona il progetto AR_137 e apri “Contratto e cliente”. Nella stessa pagina trovi anche pagamenti, scadenze e importi mancanti."
    : s.includes("revit") || s.includes("bim")
      ? n
        ? "Open More → BIM Portal. Here you can find Revit guides, BIM standards and the studio’s shared procedures."
        : "Apri Altro → BIM Portal. Qui trovi le guide Revit, gli standard BIM e le procedure condivise dello studio."
      : s.includes("ore") || s.includes("hours")
        ? n
          ? "Open More → Hours, choose a period and then select the project. Managers can also view summaries for other team members."
          : "Apri Altro → Ore, scegli il periodo e poi seleziona il progetto. I responsabili possono consultare anche i riepiloghi delle altre risorse."
        : s.includes("render") || s.includes("visual")
          ? n
            ? "Open More → Visual Department to view requests, assignments, views and delivery dates."
            : "Apri Altro → Visual Department per controllare richieste, assegnazioni, viste e date di consegna."
          : n
            ? "I can help you locate this information. Include a project code, document type or the function you are looking for."
            : "Posso aiutarti a trovare questa informazione. Indicami il codice progetto, il tipo di documento oppure la funzione che stai cercando.";
}
function _p({ onClose: t, en: n = !1 }) {
  const [s, r] = C.useState(""),
    [i, a] = C.useState([]),
    l = C.useRef(null);
  C.useEffect(() => {
    const c = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const d = (u) => u.key === "Escape" && t();
    return (
      document.addEventListener("keydown", d),
      () => {
        (document.body.style.overflow = c),
          document.removeEventListener("keydown", d);
      }
    );
  }, [t]),
    C.useEffect(() => {
      var c;
      (c = l.current) == null ||
        c.scrollTo({ top: l.current.scrollHeight, behavior: "smooth" });
    }, [i]);
  const o = (c) => {
    const d = c.trim();
    d &&
      (a((u) => [
        ...u,
        { role: "user", text: d },
        { role: "assistant", text: Oj(d, n) },
      ]),
      r(""));
  };
  return e.jsxs("section", {
    className: "archeai-overlay",
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "ARCHEAI",
    children: [
      e.jsxs("header", {
        className: "archeai-header",
        children: [
          e.jsx("button", {
            className: "archeai-back",
            onClick: t,
            "aria-label": n ? "Back" : "Indietro",
            children: e.jsx(Re, {}),
          }),
          e.jsx(xc, { compact: !0 }),
          e.jsx("span", {}),
        ],
      }),
      e.jsxs("div", {
        className: "archeai-body",
        ref: l,
        children: [
          !i.length &&
            e.jsxs(e.Fragment, {
              children: [
                e.jsxs("div", {
                  className: "archeai-intro",
                  children: [
                    e.jsxs("div", {
                      className: "archeai-orbit",
                      children: [
                        e.jsx("strong", { children: "AI" }),
                        e.jsx(Dp, {}),
                      ],
                    }),
                    e.jsx("h2", {
                      children: n ? "How can I help?" : "Come posso aiutarti?",
                    }),
                    e.jsx("p", {
                      children: n
                        ? "I can show you where to find information, documents and features inside ARCHEA Workspace."
                        : "Posso indicarti dove trovare informazioni, documenti e funzioni all’interno di ARCHEA Workspace.",
                    }),
                  ],
                }),
                e.jsx("div", {
                  className: "archeai-suggestions",
                  children: zj.map((c) =>
                    e.jsxs(
                      "button",
                      {
                        onClick: () => o(c),
                        children: [
                          e.jsx("span", { children: c }),
                          e.jsx("i", { children: "→" }),
                        ],
                      },
                      c,
                    ),
                  ),
                }),
              ],
            }),
          !!i.length &&
            e.jsx("div", {
              className: "archeai-chat",
              children: i.map((c, d) =>
                e.jsxs(
                  "div",
                  {
                    className: `archeai-bubble ${c.role}`,
                    children: [
                      c.text,
                      c.role === "assistant" &&
                        e.jsx("small", {
                          children: n
                            ? "Generated by ARCHEAI · demo data"
                            : "Indicazione generata da ARCHEAI · dati demo",
                        }),
                    ],
                  },
                  `${c.role}-${d}`,
                ),
              ),
            }),
        ],
      }),
      e.jsxs("form", {
        className: "archeai-composer",
        onSubmit: (c) => {
          c.preventDefault(), o(s);
        },
        children: [
          e.jsx("input", {
            value: s,
            onChange: (c) => r(c.target.value),
            placeholder: n ? "Ask ARCHEAI…" : "Chiedi ad ARCHEAI…",
            "aria-label": n ? "Question for ARCHEAI" : "Domanda per ARCHEAI",
          }),
          e.jsx("button", {
            type: "submit",
            "aria-label": n ? "Send" : "Invia",
            children: e.jsx("svg", {
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "1.7",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              children: e.jsx("path", { d: "m4 5 16 7-16 7 3-7zM7 12h13" }),
            }),
          }),
        ],
      }),
    ],
  });
}
function Rj() {
  const { setTab: t, language: n, viewer: s } = Y(),
    r = n === "en",
    [i, a] = C.useState(!1),
    l = ["senior_architect", "partner_architect"].includes(
      s == null ? void 0 : s.appRole,
    ),
    receptionOnly = (s == null ? void 0 : s.appRole) === "reception",
    departmentType = departmentTypeForViewer(s),
    o = [
      ...(l
        ? [
            [
              "ore",
              r ? "Hours" : "Ore",
              r ? "Hours by person and project" : "Ore per persona e progetto",
              Ur,
            ],
          ]
        : []),
      [
        "calendario",
        r ? "Calendar" : "Calendario",
        r ? "Meetings and site visits" : "Riunioni e sopralluoghi",
        Wt,
      ],
      ...(l
        ? [
            [
              "insight",
              "Insight",
              r
                ? "Financial and operational performance"
                : "Andamento economico e operativo",
              xp,
            ],
          ]
        : []),
      [
        "prenota",
        r ? "Bookings" : "Prenotazioni",
        r ? "Cars, equipment and rooms" : "Auto, materiale e sale",
        Cx,
      ],
      [
        "bim",
        "BIM Portal",
        r
          ? "Revit guides and studio standards"
          : "Guide Revit e standard dello studio",
        ga,
      ],
      [
        "visual",
        "Visual Department",
        r ? "Render requests and deliveries" : "Richieste render e consegne",
        ya,
      ],
      [
        "interior",
        "Interior Department",
        r ? "Interior requests and deliveries" : "Prenotazioni viste interior e consegne",
        DepartmentStudioIcon,
      ],
      [
        "concept",
        "Concept Department",
        r ? "Concept requests and deliveries" : "Prenotazioni concept e consegne",
        DepartmentStudioIcon,
      ],
      ...(departmentType ? [["departmentmanager", "Project Manager", r ? "Department projects and resources" : "Progetti e risorse del reparto", Ss]] : []),
      [
        "inarchea",
        "IN ARCHEA",
        r ? "Report, events and polls" : "Report, eventi e sondaggi",
        va,
      ],
      [
        "fornitori",
        r ? "Suppliers" : "Fornitori",
        r ? "Companies, contacts and technical documents" : "Aziende, referenti, listini e schede tecniche",
        SupplierStudioIcon,
      ],
      [
        "materioteca",
        r ? "Material library" : "Materioteca",
        r ? "Physical samples available in the studio" : "Catalogo dei campioni presenti nello studio",
        MaterialStudioIcon,
      ],
      [
        "abacotecnico",
        r ? "Technical atlas" : "Abaco tecnico",
        r ? "Built details, layers and suppliers" : "Dettagli costruiti, stratigrafie e fornitori",
        wt,
      ],
    ],
    visibleMoreItems = departmentType
      ? o.filter(([c]) => [departmentType, "departmentmanager", "inarchea"].includes(c))
      : receptionOnly
      ? o.filter(([c]) => ["prenota", "fornitori", "materioteca"].includes(c))
      : o;
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx("h1", {
        className: "big title-row",
        children: r ? "More" : "Altro",
      }),
      e.jsx("p", {
        className: "sub",
        children: r
          ? "Studio tools and community"
          : "Strumenti e community dello studio",
      }),
      e.jsxs("button", {
        className: "archeai-feature",
        onClick: () => a(!0),
        children: [
          e.jsxs("span", {
            className: "archeai-feature-copy",
            children: [
              e.jsx("small", {
                children: r ? "STUDIO ASSISTANT" : "ASSISTENTE DELLO STUDIO",
              }),
              e.jsx(xc, {}),
              e.jsx("p", {
                children: r
                  ? "Ask where to find documents, data, features and project information."
                  : "Chiedi dove trovare documenti, dati, funzioni e informazioni sui progetti.",
              }),
            ],
          }),
          e.jsx("span", { className: "archeai-arrow", children: "→" }),
        ],
      }),
      e.jsx("div", {
        className: "section-head archeai-tools-title",
        children: e.jsx("h2", { children: r ? "Tools" : "Strumenti" }),
      }),
      e.jsx("div", {
        className: "menu-list",
        children: visibleMoreItems.map(([c, d, u, m]) =>
          e.jsxs(
            "button",
            {
              onClick: () => t(c),
              children: [
                e.jsx("span", {
                  className: "menu-icon",
                  children: e.jsx(m, {}),
                }),
                e.jsxs("span", {
                  children: [
                    e.jsx("b", { children: d }),
                    e.jsx("small", { children: u }),
                  ],
                }),
                e.jsx(ve, {}),
              ],
            },
            c,
          ),
        ),
      }),
      i && e.jsx(_p, { en: r, onClose: () => a(!1) }),
    ],
  });
}
const Mj = {
    P51: {
      client: {
        name: "ACF Fiorentina S.r.l.",
        vat: "05248440488",
        contact: "project@acffiorentina.it",
        address: "Bagno a Ripoli (FI)",
      },
      contract: {
        value: 1e5,
        signedAt: "2026-02-12",
        fileName: "P51_Contratto_firmato.pdf",
      },
      consultantExpenses: 1e4,
      expenses: [
        { label: "Consulenza impianti", amount: 6e3 },
        { label: "Consulenza strutture", amount: 4e3 },
      ],
      payments: [
        {
          id: "p51-1",
          label: "Acconto incarico",
          dueAt: "2026-03-15",
          paidAt: "2026-03-12",
          expected: 3e4,
          paid: 3e4,
        },
        {
          id: "p51-2",
          label: "Consegna intermedia",
          dueAt: "2026-09-30",
          paidAt: "2026-10-02",
          expected: 4e4,
          paid: 2e4,
        },
        {
          id: "p51-3",
          label: "Saldo finale",
          dueAt: "2026-12-20",
          paidAt: null,
          expected: 3e4,
          paid: 0,
        },
      ],
    },
    M86: {
      client: {
        name: "Roma Capitale",
        vat: "02438750586",
        contact: "direzione.lavori@example.it",
        address: "Roma",
      },
      contract: {
        value: 25e4,
        signedAt: "2026-01-28",
        fileName: "M86_Contratto_firmato.pdf",
      },
      consultantExpenses: 32500,
      expenses: [
        { label: "Consulenze specialistiche", amount: 20500 },
        { label: "Rilievi e indagini", amount: 12e3 },
      ],
      payments: [
        {
          id: "m86-1",
          label: "Avvio progettazione",
          dueAt: "2026-02-28",
          paidAt: "2026-02-25",
          expected: 75e3,
          paid: 75e3,
        },
        {
          id: "m86-2",
          label: "Sviluppo definitivo",
          dueAt: "2026-10-15",
          paidAt: null,
          expected: 1e5,
          paid: 0,
        },
        {
          id: "m86-3",
          label: "Saldo",
          dueAt: "2027-02-15",
          paidAt: null,
          expected: 75e3,
          paid: 0,
        },
      ],
    },
    O80: {
      client: {
        name: "AC Milan S.p.A.",
        vat: "01073200154",
        contact: "development@example.it",
        address: "Carnago (VA)",
      },
      contract: {
        value: 18e4,
        signedAt: "2026-04-08",
        fileName: "O80_Contratto_firmato.pdf",
      },
      consultantExpenses: 22e3,
      expenses: [
        { label: "Urbanistica e ambiente", amount: 14e3 },
        { label: "Consulenza impianti", amount: 8e3 },
      ],
      payments: [
        {
          id: "o80-1",
          label: "Acconto",
          dueAt: "2026-04-30",
          paidAt: "2026-04-29",
          expected: 54e3,
          paid: 54e3,
        },
        {
          id: "o80-2",
          label: "Conferenza dei Servizi",
          dueAt: "2026-11-10",
          paidAt: null,
          expected: 72e3,
          paid: 0,
        },
        {
          id: "o80-3",
          label: "Saldo",
          dueAt: "2027-03-31",
          paidAt: null,
          expected: 54e3,
          paid: 0,
        },
      ],
    },
    H05: {
      client: {
        name: "Pisa Sporting Club S.r.l.",
        vat: "02247390507",
        contact: "amministrazione@example.it",
        address: "Pisa",
      },
      contract: {
        value: 85e3,
        signedAt: "2026-05-20",
        fileName: "H05_Contratto_firmato.pdf",
      },
      consultantExpenses: 7500,
      expenses: [
        { label: "Rilievi", amount: 4500 },
        { label: "Consulenza acustica", amount: 3e3 },
      ],
      payments: [
        {
          id: "h05-1",
          label: "Acconto",
          dueAt: "2026-06-15",
          paidAt: "2026-06-14",
          expected: 25e3,
          paid: 25e3,
        },
        {
          id: "h05-2",
          label: "Secondo SAL",
          dueAt: "2026-10-31",
          paidAt: null,
          expected: 35e3,
          paid: 0,
        },
        {
          id: "h05-3",
          label: "Saldo",
          dueAt: "2027-01-31",
          paidAt: null,
          expected: 25e3,
          paid: 0,
        },
      ],
    },
    I04: {
      client: {
        name: "Cliente privato",
        vat: "—",
        contact: "amministrazione@example.it",
        address: "Firenze",
      },
      contract: {
        value: 6e4,
        signedAt: "2026-03-18",
        fileName: "I04_Contratto_firmato.pdf",
      },
      consultantExpenses: 5e3,
      expenses: [{ label: "Consulenze", amount: 5e3 }],
      payments: [
        {
          id: "i04-1",
          label: "Acconto",
          dueAt: "2026-04-15",
          paidAt: "2026-04-12",
          expected: 2e4,
          paid: 2e4,
        },
        {
          id: "i04-2",
          label: "Consegna",
          dueAt: "2026-10-20",
          paidAt: null,
          expected: 25e3,
          paid: 0,
        },
        {
          id: "i04-3",
          label: "Saldo",
          dueAt: "2026-12-15",
          paidAt: null,
          expected: 15e3,
          paid: 0,
        },
      ],
    },
  },
  Dj = (t) => ({
    client: {
      name: "Dati cliente da inserire",
      vat: "—",
      contact: "—",
      address: "—",
    },
    contract: {
      value: 0,
      signedAt: null,
      fileName: `${t}_Contratto_da_caricare.pdf`,
    },
    consultantExpenses: 0,
    expenses: [],
    payments: [],
  }),
  wa = (t) => Mj[t] ?? Dj(t),
  je = [
    { id: "roma", name: "Roma" },
    { id: "milano", name: "Milano" },
    { id: "firenze", name: "Firenze" },
    { id: "genova", name: "Genova" },
    { id: "tirana", name: "Tirana" },
    { id: "dubai", name: "Dubai" },
    { id: "sao_paulo", name: "San Paolo · Brasile" },
    { id: "shanghai", name: "Shanghai" },
    { id: "parigi", name: "Parigi" },
  ],
  _j = {
    M86: "roma",
    O80: "milano",
    P51: "firenze",
    H05: "genova",
    M01: "tirana",
    I04: "dubai",
    I05: "sao_paulo",
    P52: "shanghai",
    P13: "parigi",
  },
  Pe = {
    fdiamanti: {
      id: "fdiamanti",
      name: "Francesco Diamanti",
      studio: "firenze",
      years: null,
      role: "Partner Architect",
      contract: "FD_Contratto.pdf",
      annualCompensation: null,
      expiresAt: null,
    },
    abotrini: {
      id: "abotrini",
      name: "Alessandro Botrini",
      studio: "firenze",
      years: null,
      role: "Senior Architect",
      contract: "AB_Contratto.pdf",
      annualCompensation: null,
      expiresAt: null,
    },
    lleyra: {
      id: "lleyra",
      name: "Lisandro Leyra",
      studio: "roma",
      years: null,
      role: "Architect",
      contract: "LL_Contratto.pdf",
      annualCompensation: null,
      expiresAt: null,
    },
    mrossi: {
      id: "mrossi",
      name: "Maria Rossi",
      studio: "milano",
      years: null,
      role: "Architect",
      contract: "MR_Contratto.pdf",
      annualCompensation: null,
      expiresAt: null,
    },
    gsantos: {
      id: "gsantos",
      name: "Gabriel Santos",
      studio: "sao_paulo",
      years: null,
      role: "Architect",
      contract: "GS_Contratto.pdf",
      annualCompensation: null,
      expiresAt: null,
    },
    akola: {
      id: "akola",
      name: "Arben Kola",
      studio: "tirana",
      years: null,
      role: "Architect",
      contract: "AK_Contratto.pdf",
      annualCompensation: null,
      expiresAt: null,
    },
    lbianchi: {
      id: "lbianchi",
      name: "Luca Bianchi",
      studio: "genova",
      years: null,
      role: "Architect",
      contract: "LB_Contratto.pdf",
      annualCompensation: null,
      expiresAt: null,
    },
    nalmasi: {
      id: "nalmasi",
      name: "Noura Al-Masi",
      studio: "dubai",
      years: null,
      role: "Senior Architect",
      contract: "NA_Contratto.pdf",
      annualCompensation: null,
      expiresAt: null,
    },
    lzhang: {
      id: "lzhang",
      name: "Li Zhang",
      studio: "shanghai",
      years: null,
      role: "Architect",
      contract: "LZ_Contratto.pdf",
      annualCompensation: null,
      expiresAt: null,
    },
    cmoreau: {
      id: "cmoreau",
      name: "Claire Moreau",
      studio: "parigi",
      years: null,
      role: "Partner Architect",
      contract: "CM_Contratto.pdf",
      annualCompensation: null,
      expiresAt: null,
    },
  },
  $p = {
    P51: [
      {
        id: "p51-fi-1",
        studio: "firenze",
        name: "Gruppo progettazione",
        share: 0.65,
        members: ["fdiamanti", "abotrini"],
      },
      {
        id: "p51-mi-1",
        studio: "milano",
        name: "Gruppo visualizzazione",
        share: 0.35,
        members: ["mrossi"],
      },
    ],
    M86: [
      {
        id: "m86-rm-1",
        studio: "roma",
        name: "Gruppo architettura",
        share: 0.55,
        members: ["lleyra", "fdiamanti"],
      },
      {
        id: "m86-fi-1",
        studio: "firenze",
        name: "Gruppo museo",
        share: 0.45,
        members: ["abotrini"],
      },
    ],
    O80: [
      {
        id: "o80-mi-1",
        studio: "milano",
        name: "Gruppo masterplan",
        share: 0.7,
        members: ["mrossi", "fdiamanti"],
      },
      {
        id: "o80-fi-1",
        studio: "firenze",
        name: "Gruppo autorizzazioni",
        share: 0.3,
        members: ["abotrini"],
      },
    ],
    H05: [
      {
        id: "h05-ge-1",
        studio: "genova",
        name: "Gruppo rilievo e progetto",
        share: 1,
        members: ["lbianchi", "lleyra"],
      },
    ],
    I04: [
      {
        id: "i04-fi-1",
        studio: "firenze",
        name: "Gruppo progetto",
        share: 1,
        members: ["fdiamanti", "abotrini"],
      },
    ],
  },
  zt = (t) => {
    const n = normalizeProjectStatus(t);
    return n === "Planning"
      ? "planning"
      : n === "Active"
        ? "active"
        : n === "On Hold"
          ? "on-hold"
          : n === "Completed"
            ? "completed"
            : "archived";
  },
  Jt = (t) => _j[t] ?? "firenze",
  Rr = (t) => $p[t] ?? [],
  bi = 10,
  al = (t) =>
    t
      ? new Intl.DateTimeFormat("it-IT", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(new Date(`${t}T12:00:00`))
      : "—",
  Lp = (t) =>
    t.paid >= t.expected ? "complete" : t.paid > 0 ? "partial" : "pending",
  W = (t, n = !1) =>
    new Intl.NumberFormat(n ? "en-GB" : "it-IT", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(t),
  ct = ({ value: t, en: n = !1, prefix: s = "" }) =>
    e.jsxs(e.Fragment, {
      children: [s, e.jsx(pe, { value: t, format: (r) => W(r, n) })],
    });
function yn(t, n, s = wa(n.codice)) {
  const r = t.ore
      .filter((c) => c.progettoCodice === n.codice)
      .reduce((c, d) => c + (Number(d.ore) || 0), 0),
    i = r * bi,
    a = s.payments.reduce((c, d) => c + d.paid, 0),
    l = s.contract.value,
    o = s.consultantExpenses + i;
  return {
    accounting: s,
    hours: r,
    hoursCost: i,
    paid: a,
    turnover: l,
    totalExpenses: o,
    receivable: Math.max(0, l - a),
    expectedProfit: l - o,
    cashBalance: a - o,
  };
}
function jc({ data: t, viewer: n, project: s, en: r = !1, embedded: i = !1 }) {
  const [a, l] = C.useState(() => wa(s.codice)),
    o = yn(t, s, a),
    c = () => {
      const d = Number(
        prompt(r ? "Payment amount (€)" : "Importo pagamento (€)"),
      );
      if (!(d > 0)) return;
      const u = {
        id: crypto.randomUUID(),
        label: r ? "New payment" : "Nuovo pagamento",
        dueAt: new Date().toISOString().slice(0, 10),
        paidAt: null,
        expected: d,
        paid: 0,
      };
      l((m) => ({ ...m, payments: [...m.payments, u] }));
    };
  return e.jsxs("div", {
    className: i ? "embedded-accounting" : "",
    children: [
      i &&
        e.jsxs("div", {
          className: "embedded-title",
          children: [
            e.jsx("small", {
              children: r ? "PROJECT ACCOUNTING" : "CONTABILITÀ DEL PROGETTO",
            }),
            e.jsx("h2", {
              children: r ? "Economic overview" : "Quadro economico",
            }),
          ],
        }),
      e.jsxs("section", {
        className: "account-total",
        children: [
          e.jsx("small", { children: r ? "PROJECT VALUE" : "VALORE COMMESSA" }),
          e.jsx("b", { children: e.jsx(ct, { value: o.turnover, en: r }) }),
          e.jsxs("span", { children: [s.codice, " · ", s.nome] }),
        ],
      }),
      e.jsxs("div", {
        className: "account-kpis",
        children: [
          e.jsxs("div", {
            children: [
              e.jsx("small", { children: r ? "Collected" : "Incassato" }),
              e.jsx("b", { children: e.jsx(ct, { value: o.paid, en: r }) }),
            ],
          }),
          e.jsxs("div", {
            children: [
              e.jsx("small", { children: r ? "To collect" : "Da incassare" }),
              e.jsx("b", {
                children: e.jsx(ct, { value: o.receivable, en: r }),
              }),
            ],
          }),
          e.jsxs("div", {
            children: [
              e.jsx("small", {
                children: r ? "Expected margin" : "Margine previsto",
              }),
              e.jsx("b", {
                className: o.expectedProfit < 0 ? "negative" : "",
                children: e.jsx(ct, { value: o.expectedProfit, en: r }),
              }),
            ],
          }),
        ],
      }),
      e.jsx("div", {
        className: "section-head",
        children: e.jsx("h2", {
          children: r ? "Contract and client" : "Contratto e cliente",
        }),
      }),
      e.jsxs("article", {
        className: "contract-card",
        children: [
          e.jsxs("div", {
            className: "contract-file",
            children: [
              e.jsx("span", { children: e.jsx(wt, {}) }),
              e.jsxs("div", {
                children: [
                  e.jsx("b", { children: a.contract.fileName }),
                  e.jsx("small", {
                    children: a.contract.signedAt
                      ? `${r ? "Signed" : "Firmato"} ${al(a.contract.signedAt)}`
                      : r
                        ? "Contract not uploaded"
                        : "Contratto non caricato",
                  }),
                ],
              }),
              e.jsx("button", { children: r ? "Open" : "Apri" }),
            ],
          }),
          e.jsxs("dl", {
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("dt", { children: r ? "Client" : "Cliente" }),
                  e.jsx("dd", { children: a.client.name }),
                ],
              }),
              e.jsxs("div", {
                children: [
                  e.jsx("dt", { children: r ? "VAT no." : "P. IVA" }),
                  e.jsx("dd", { children: a.client.vat }),
                ],
              }),
              e.jsxs("div", {
                children: [
                  e.jsx("dt", { children: "Email" }),
                  e.jsx("dd", { children: a.client.contact }),
                ],
              }),
              e.jsxs("div", {
                children: [
                  e.jsx("dt", { children: r ? "Address" : "Sede" }),
                  e.jsx("dd", { children: a.client.address }),
                ],
              }),
            ],
          }),
        ],
      }),
      e.jsxs("div", {
        className: "section-head",
        children: [
          e.jsx("h2", {
            children: r ? "Payment schedule" : "Scadenziario pagamenti",
          }),
          zr(n) &&
            e.jsxs("button", {
              className: "link inline-add",
              onClick: c,
              children: [e.jsx(tt, {}), r ? "Add" : "Aggiungi"],
            }),
        ],
      }),
      e.jsxs("div", {
        className: "payment-list",
        children: [
          a.payments.map((d) => {
            const u = Lp(d),
              m = Math.max(0, d.expected - d.paid);
            return e.jsxs(
              "article",
              {
                className: "payment-row",
                children: [
                  e.jsxs("div", {
                    className: "payment-main",
                    children: [
                      e.jsxs("span", {
                        children: [
                          e.jsx("b", { children: d.label }),
                          e.jsxs("small", {
                            children: [
                              r ? "Due" : "Scadenza",
                              " · ",
                              al(d.dueAt),
                            ],
                          }),
                        ],
                      }),
                      e.jsx("span", {
                        className: `payment-status ${u}`,
                        children:
                          u === "complete"
                            ? r
                              ? "Paid"
                              : "Pagato"
                            : u === "partial"
                              ? r
                                ? "Partial"
                                : "Parziale"
                              : r
                                ? "Due"
                                : "Da pagare",
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "payment-values",
                    children: [
                      e.jsxs("span", {
                        children: [
                          e.jsx("small", {
                            children: r ? "Amount" : "Importo",
                          }),
                          e.jsx("b", { children: W(d.expected, r) }),
                        ],
                      }),
                      e.jsxs("span", {
                        children: [
                          e.jsx("small", { children: r ? "Paid" : "Pagato" }),
                          e.jsx("b", { children: W(d.paid, r) }),
                        ],
                      }),
                      e.jsxs("span", {
                        children: [
                          e.jsx("small", { children: r ? "Missing" : "Manca" }),
                          e.jsx("b", { children: W(m, r) }),
                        ],
                      }),
                    ],
                  }),
                  d.paidAt &&
                    e.jsxs("small", {
                      className: "paid-date",
                      children: [
                        r ? "Payment date" : "Data pagamento",
                        " · ",
                        al(d.paidAt),
                      ],
                    }),
                ],
              },
              d.id,
            );
          }),
          !a.payments.length &&
            e.jsx("p", {
              className: "empty",
              children: r
                ? "No payment schedule entered."
                : "Nessuna scadenza inserita.",
            }),
        ],
      }),
      e.jsx("div", {
        className: "section-head",
        children: e.jsx("h2", {
          children: r ? "Costs and resources" : "Costi e risorse",
        }),
      }),
      e.jsxs("div", {
        className: "cost-list",
        children: [
          e.jsxs("div", {
            children: [
              e.jsx("span", {
                children: r
                  ? "Consultants and external expenses"
                  : "Consulenti e spese esterne",
              }),
              e.jsx("b", { children: W(a.consultantExpenses, r) }),
            ],
          }),
          a.expenses.map((d) =>
            e.jsxs(
              "div",
              {
                className: "cost-detail",
                children: [
                  e.jsx("span", { children: d.label }),
                  e.jsx("b", { children: W(d.amount, r) }),
                ],
              },
              d.label,
            ),
          ),
          e.jsxs("div", {
            children: [
              e.jsxs("span", {
                children: [
                  r ? "Team hours" : "Ore lavorate dalle risorse",
                  e.jsxs("small", {
                    children: [
                      o.hours.toLocaleString(r ? "en-GB" : "it-IT", {
                        maximumFractionDigits: 1,
                      }),
                      " h × ",
                      W(bi, r),
                      "/h",
                    ],
                  }),
                ],
              }),
              e.jsx("b", { children: W(o.hoursCost, r) }),
            ],
          }),
        ],
      }),
      e.jsxs("section", {
        className: "grand-total",
        children: [
          e.jsx("h2", { children: r ? "Project total" : "Totale commessa" }),
          e.jsxs("div", {
            children: [
              e.jsx("span", { children: r ? "Turnover" : "Fatturato" }),
              e.jsx("b", { children: e.jsx(ct, { value: o.turnover, en: r }) }),
            ],
          }),
          e.jsxs("div", {
            children: [
              e.jsx("span", {
                children: r ? "Total expenses" : "Spese totali",
              }),
              e.jsx("b", {
                children: e.jsx(ct, {
                  value: o.totalExpenses,
                  en: r,
                  prefix: "− ",
                }),
              }),
            ],
          }),
          e.jsxs("div", {
            className: "grand-profit",
            children: [
              e.jsx("span", {
                children: r ? "Expected profit" : "Guadagno previsto",
              }),
              e.jsx("b", {
                children: e.jsx(ct, { value: o.expectedProfit, en: r }),
              }),
            ],
          }),
          e.jsxs("footer", {
            children: [
              e.jsx("span", {
                children: r
                  ? "Collected cash balance"
                  : "Saldo di cassa sugli incassi",
              }),
              e.jsx("b", {
                children: e.jsx(ct, { value: o.cashBalance, en: r }),
              }),
            ],
          }),
        ],
      }),
      e.jsx("p", {
        className: "hint accounting-note",
        children: r
          ? `Demo accounting data. Hourly cost: ${W(bi, r)}/h. VAT and taxes excluded.`
          : `Dati contabili dimostrativi. Costo orario: ${W(bi, r)}/h. IVA e imposte escluse.`,
      }),
    ],
  });
}
function $j({ data: t, viewer: n, en: s }) {
  var m;
  const [r, i] = C.useState(null),
    [a, l] = C.useState(null),
    o = je.map((x) => {
      const f = t.progetti
        .filter((g) => Jt(g.codice) === x.id)
        .map((g) => ({ project: g, ...yn(t, g) }));
      return {
        studio: x,
        projects: f,
        turnover: f.reduce((g, b) => g + b.turnover, 0),
        paid: f.reduce((g, b) => g + b.paid, 0),
        expenses: f.reduce((g, b) => g + b.totalExpenses, 0),
        profit: f.reduce((g, b) => g + b.expectedProfit, 0),
      };
    }),
    c = o.find((x) => x.studio.id === r),
    d =
      (m =
        c == null ? void 0 : c.projects.find((x) => x.project.codice === a)) ==
      null
        ? void 0
        : m.project,
    u = () => window.scrollTo({ top: 0, behavior: "smooth" });
  return d
    ? e.jsxs("section", {
        className: "property-detail-page",
        children: [
          e.jsxs("button", {
            className: "detail-back",
            onClick: () => {
              l(null), u();
            },
            children: [
              e.jsx(Re, {}),
              s
                ? "Back to studio accounts"
                : `Torna alla contabilità di ${c.studio.name}`,
            ],
          }),
          e.jsx("div", {
            className: "property-title",
            children: e.jsxs("div", {
              children: [
                e.jsx("small", { children: c.studio.name.toUpperCase() }),
                e.jsxs("h1", { children: [d.codice, " · ", d.nome] }),
              ],
            }),
          }),
          e.jsx(jc, { data: t, viewer: n, project: d, en: s }, d.codice),
        ],
      })
    : c
      ? e.jsxs("section", {
          className: "property-detail-page",
          children: [
            e.jsxs("button", {
              className: "detail-back",
              onClick: () => {
                i(null), u();
              },
              children: [
                e.jsx(Re, {}),
                s ? "Back to studios" : "Torna agli studi",
              ],
            }),
            e.jsx("div", {
              className: "property-title",
              children: e.jsxs("div", {
                children: [
                  e.jsxs("small", {
                    children: ["ARCHEA PROPERTY · ", "STUDIO"],
                  }),
                  e.jsx("h1", { children: c.studio.name }),
                ],
              }),
            }),
            e.jsxs("section", {
              className: "studio-finance-detail",
              children: [
                e.jsxs("div", {
                  className: "account-total",
                  children: [
                    e.jsx("small", {
                      children: s ? "STUDIO TURNOVER" : "FATTURATO STUDIO",
                    }),
                    e.jsx("b", {
                      children: e.jsx(ct, { value: c.turnover, en: s }),
                    }),
                    e.jsxs("span", {
                      children: [
                        c.projects.length,
                        " ",
                        s ? "projects" : "progetti",
                      ],
                    }),
                  ],
                }),
                e.jsxs("div", {
                  className: "account-kpis",
                  children: [
                    e.jsxs("div", {
                      children: [
                        e.jsx("small", {
                          children: s ? "Collected" : "Incassato",
                        }),
                        e.jsx("b", {
                          children: e.jsx(ct, { value: c.paid, en: s }),
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      children: [
                        e.jsx("small", {
                          children: s ? "Total costs" : "Spese totali",
                        }),
                        e.jsx("b", {
                          children: e.jsx(ct, { value: c.expenses, en: s }),
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      children: [
                        e.jsx("small", {
                          children: s ? "Expected profit" : "Guadagno previsto",
                        }),
                        e.jsx("b", {
                          children: e.jsx(ct, { value: c.profit, en: s }),
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsx("div", {
                  className: "section-head",
                  children: e.jsx("h2", {
                    children: s
                      ? "Projects generating turnover"
                      : "Progetti che generano fatturato",
                  }),
                }),
                e.jsxs("div", {
                  className: "finance-projects",
                  children: [
                    c.projects.map((x) =>
                      e.jsxs(
                        "button",
                        {
                          onClick: () => {
                            l(x.project.codice), u();
                          },
                          children: [
                            e.jsxs("span", {
                              children: [
                                e.jsx("b", { children: x.project.codice }),
                                e.jsx("small", { children: x.project.nome }),
                              ],
                            }),
                            e.jsxs("span", {
                              children: [
                                e.jsx("small", {
                                  children: s ? "Turnover" : "Fatturato",
                                }),
                                e.jsx("b", { children: W(x.turnover, s) }),
                              ],
                            }),
                            e.jsxs("span", {
                              children: [
                                e.jsx("small", {
                                  children: s ? "Profit" : "Guadagno",
                                }),
                                e.jsx("b", {
                                  children: W(x.expectedProfit, s),
                                }),
                              ],
                            }),
                            e.jsx(ve, {}),
                          ],
                        },
                        x.project.codice,
                      ),
                    ),
                    !c.projects.length &&
                      e.jsx("p", {
                        className: "empty",
                        children: s
                          ? "No projects assigned."
                          : "Nessun progetto assegnato.",
                      }),
                  ],
                }),
              ],
            }),
          ],
        })
      : e.jsxs(e.Fragment, {
          children: [
            e.jsx("div", {
              className: "property-title",
              children: e.jsxs("div", {
                children: [
                  e.jsx("small", { children: "ARCHEA PROPERTY" }),
                  e.jsx("h1", {
                    children: s
                      ? "Accounting by studio"
                      : "Contabilità per studio",
                  }),
                ],
              }),
            }),
            e.jsx("p", {
              className: "sub property-sub",
              children: s
                ? "Overall financial performance of every studio."
                : "Andamento contabile complessivo di ogni studio.",
            }),
            e.jsx("div", {
              className: "studio-finance-list",
              children: o.map((x) =>
                e.jsxs(
                  "button",
                  {
                    onClick: () => {
                      i(x.studio.id), l(null), u();
                    },
                    children: [
                      e.jsxs("div", {
                        children: [
                          e.jsx("b", { children: x.studio.name }),
                          e.jsxs("small", {
                            children: [
                              x.projects.length,
                              " ",
                              s ? "projects" : "progetti",
                            ],
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        children: [
                          e.jsxs("span", {
                            children: [
                              e.jsx("small", {
                                children: s ? "Turnover" : "Fatturato",
                              }),
                              e.jsx("b", { children: W(x.turnover, s) }),
                            ],
                          }),
                          e.jsxs("span", {
                            children: [
                              e.jsx("small", {
                                children: s ? "Costs" : "Spese",
                              }),
                              e.jsx("b", { children: W(x.expenses, s) }),
                            ],
                          }),
                          e.jsxs("span", {
                            children: [
                              e.jsx("small", {
                                children: s ? "Profit" : "Guadagno",
                              }),
                              e.jsx("b", { children: W(x.profit, s) }),
                            ],
                          }),
                        ],
                      }),
                      e.jsx(ve, {}),
                    ],
                  },
                  x.studio.id,
                ),
              ),
            }),
            e.jsx("p", {
              className: "hint accounting-note",
              children: s
                ? "Totals are the sum of all projects assigned to each studio."
                : "I totali sono la somma di tutti i progetti assegnati a ciascuno studio.",
            }),
          ],
        });
}
function Lj() {
  var j;
  const { data: t, viewer: n, language: s } = Y(),
    r = s === "en",
    i = t.progetti.filter((f) => normalizeProjectStatus(f.stato) === "Active"),
    [a, l] = C.useState(((j = i[0]) == null ? void 0 : j.codice) || ""),
    [o, c] = C.useState(!1),
    [d, u] = C.useState(""),
    m = i.find((f) => f.codice === a) ?? i[0],
    x = se(d);
  return lj(n)
    ? ba(n)
      ? e.jsx($j, { data: t, viewer: n, en: r })
      : m
        ? e.jsxs(e.Fragment, {
            children: [
              e.jsx("div", {
                className: "title-action",
                children: e.jsxs("div", {
                  children: [
                    e.jsx("h1", {
                      className: "big title-row",
                      children: r ? "Accounting" : "Contabilità",
                    }),
                    e.jsx("p", {
                      className: "sub",
                      children: r
                        ? "Contracts, payments and project margin"
                        : "Contratti, pagamenti e margine di commessa",
                    }),
                  ],
                }),
              }),
              e.jsx("label", {
                className: "field-label",
                children: r ? "Active project" : "Progetto attivo",
              }),
              e.jsxs("button", {
                className: "picker",
                onClick: () => c(!0),
                "aria-haspopup": "dialog",
                children: [
                  e.jsxs("span", { children: [m.codice, " · ", m.nome] }),
                  e.jsx(_t, {}),
                ],
              }),
              e.jsx(jc, { data: t, viewer: n, project: m, en: r }, m.codice),
              o &&
                e.jsxs($t, {
                  title: r ? "Choose active project" : "Scegli progetto attivo",
                  onClose: () => {
                    c(!1), u("");
                  },
                  children: [
                    e.jsx(En, {
                      value: d,
                      onChange: u,
                      placeholder: r
                        ? "Search by code or name"
                        : "Cerca per codice o nome",
                    }),
                    e.jsx("div", {
                      className: "list tight",
                      children: i
                        .filter(
                          (f) => !x || se(`${f.codice} ${f.nome}`).includes(x),
                        )
                        .map((f) =>
                          e.jsxs(
                            "button",
                            {
                              className: `pick-row${f.codice === m.codice ? " on" : ""}`,
                              onClick: () => {
                                l(f.codice), c(!1), u("");
                              },
                              children: [
                                e.jsx("b", { children: f.codice }),
                                e.jsx("span", { children: f.nome }),
                                e.jsx("span", {
                                  className: `pill ${Br(f.stato)}`,
                                  children: f.stato,
                                }),
                              ],
                            },
                            f.id,
                          ),
                        ),
                    }),
                  ],
                }),
            ],
          })
        : e.jsx("p", {
            className: "empty",
            children: r ? "No active project." : "Nessun progetto attivo.",
          })
    : e.jsxs("div", {
        className: "access-denied",
        children: [
          e.jsx("h1", { children: r ? "Restricted area" : "Area riservata" }),
          e.jsx("p", {
            children: r
              ? "Accounting is available to Senior Architects, Partner Architects and Property."
              : "La contabilità è disponibile per Senior Architect, Partner Architect e Property.",
          }),
        ],
      });
}
const wi = (t) =>
    /partner/i.test(t) ? "partner" : /senior/i.test(t) ? "senior" : "architect",
  Gd = [
    ["all", "Tutti"],
    ["architect", "Architect"],
    ["senior", "Senior Architect"],
    ["partner", "Partner Architect"],
  ];
function Fp({ data: t, person: n, en: s = !1, showHint: r = !1 }) {
  if (!n) return null;
  const i = je.find((d) => d.id === n.studio),
    a = Object.entries($p)
      .filter(([, d]) => d.some((u) => u.members.includes(n.id)))
      .map(([d]) => d),
    l = t.progetti.filter((d) => a.includes(d.codice)),
    o = ["senior", "partner"].includes(wi(n.role)),
    c = (d) =>
      d == null
        ? "—"
        : new Intl.NumberFormat(s ? "en-GB" : "it-IT", {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0,
          }).format(d);
  return e.jsxs(e.Fragment, {
    children: [
      e.jsxs("section", {
        className: "bio-card",
        children: [
          e.jsxs("div", {
            className: "bio-head",
            children: [
              e.jsx("span", { children: e.jsx(Xn, {}) }),
              e.jsxs("div", {
                children: [
                  e.jsx("h2", { children: n.name }),
                  e.jsxs("p", {
                    children: [n.role, " · ", i == null ? void 0 : i.name],
                  }),
                ],
              }),
            ],
          }),
          e.jsxs("dl", {
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("dt", {
                    children: s ? "Years at Archea" : "Anni in Archea",
                  }),
                  e.jsx("dd", {
                    children:
                      n.years ?? (s ? "To be connected" : "Da collegare"),
                  }),
                ],
              }),
              e.jsxs("div", {
                children: [
                  e.jsx("dt", { children: s ? "Role" : "Ruolo ricoperto" }),
                  e.jsx("dd", { children: n.role }),
                ],
              }),
              e.jsxs("div", {
                children: [
                  e.jsx("dt", {
                    children: s ? "Annual compensation" : "Compenso annuo",
                  }),
                  e.jsx("dd", { children: c(n.annualCompensation) }),
                ],
              }),
              e.jsxs("div", {
                children: [
                  e.jsx("dt", {
                    children: s ? "Contract expiry" : "Scadenza contratto",
                  }),
                  e.jsx("dd", { children: n.expiresAt ?? "—" }),
                ],
              }),
            ],
          }),
          e.jsxs("div", {
            className: "bio-contract",
            children: [
              e.jsx("span", { children: e.jsx(wt, {}) }),
              e.jsxs("div", {
                children: [
                  e.jsx("b", { children: n.contract }),
                  e.jsx("small", {
                    children: s
                      ? "Employment contract · PDF"
                      : "Contratto di lavoro · PDF",
                  }),
                ],
              }),
              e.jsx("button", { children: s ? "Open" : "Apri" }),
            ],
          }),
        ],
      }),
      o &&
        e.jsxs("section", {
          className: "followed-projects",
          children: [
            e.jsxs("div", {
              className: "section-head",
              children: [
                e.jsx("h2", {
                  children: s ? "Projects followed" : "Progetti seguiti",
                }),
                e.jsx("span", { className: "count", children: l.length }),
              ],
            }),
            e.jsxs("div", {
              children: [
                l.map((d) =>
                  e.jsxs(
                    "article",
                    {
                      children: [
                        e.jsx("b", { children: d.codice }),
                        e.jsx("span", { children: d.nome }),
                        e.jsx("small", { children: d.stato }),
                      ],
                    },
                    d.codice,
                  ),
                ),
                !l.length &&
                  e.jsx("p", {
                    className: "empty",
                    children: s
                      ? "No assigned projects."
                      : "Nessun progetto assegnato.",
                  }),
              ],
            }),
          ],
        }),
      r &&
        e.jsx("p", {
          className: "hint accounting-note",
          children: s
            ? "Demo profile: compensation and contract data are not real and must be connected to the protected HR source."
            : "Profilo dimostrativo: compensi e contratti non sono dati reali e dovranno essere collegati alla fonte HR protetta.",
        }),
    ],
  });
}
function Fj() {
  var y, O;
  const {
      data: t,
      viewer: n,
      language: s,
      selectedEmployeeId: r,
      setSelectedEmployeeId: i,
    } = Y(),
    a = s === "en",
    l = "all",
    [o, c] = C.useState(l),
    [d, u] = C.useState(!1),
    [m, x] = C.useState(!1),
    [j, f] = C.useState("");
  if (!ba(n))
    return e.jsx("div", {
      className: "access-denied",
      children: e.jsx("h1", {
        children: a ? "Restricted area" : "Area riservata",
      }),
    });
  const g = Object.values(Pe).filter((k) => o === "all" || wi(k.role) === o),
    b = g.find((k) => k.id === r) ?? g[0],
    v =
      o === "all"
        ? a
          ? "All"
          : "Tutti"
        : (((y = Gd.find(([k]) => k === o)) == null ? void 0 : y[1]) ??
          "Architect"),
    h = se(j),
    p = (k) => {
      c(k);
      const z = Object.values(Pe).find((E) => k === "all" || wi(E.role) === k);
      z && i(z.id), u(!1);
    };
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx("div", {
        className: "property-title",
        children: e.jsxs("div", {
          children: [
            e.jsx("small", { children: "ARCHEA PROPERTY" }),
            e.jsx("h1", { children: a ? "Staff" : "Organico" }),
          ],
        }),
      }),
      e.jsx("label", {
        className: "field-label",
        children: a ? "Role" : "Ruolo",
      }),
      e.jsxs("button", {
        className: "picker",
        onClick: () => u(!0),
        "aria-haspopup": "dialog",
        children: [e.jsx("span", { children: v }), e.jsx(_t, {})],
      }),
      e.jsx("label", {
        className: "field-label",
        children: a ? "Employee" : "Dipendente",
      }),
      e.jsxs("button", {
        className: "picker",
        onClick: () => x(!0),
        "aria-haspopup": "dialog",
        children: [
          e.jsxs("span", {
            children: [
              b.name,
              " · ",
              (O = je.find((k) => k.id === b.studio)) == null ? void 0 : O.name,
            ],
          }),
          e.jsx(_t, {}),
        ],
      }),
      e.jsx("div", {
        className: "bio-profile-content",
        children: e.jsx(Fp, { data: t, person: b, en: a, showHint: !0 }),
      }),
      d &&
        e.jsx($t, {
          title: a ? "Filter by role" : "Filtra per ruolo",
          onClose: () => u(!1),
          children: e.jsx("div", {
            className: "list tight",
            children: Gd.map(([k, z]) =>
              e.jsxs(
                "button",
                {
                  className: `pick-row${k === o ? " on" : ""}`,
                  onClick: () => p(k),
                  children: [
                    e.jsx("b", {
                      children: k === "all" ? (a ? "All" : "Tutti") : z,
                    }),
                    e.jsxs("span", {
                      children: [
                        Object.values(Pe).filter(
                          (E) => k === "all" || wi(E.role) === k,
                        ).length,
                        " ",
                        a ? "people" : "persone",
                      ],
                    }),
                  ],
                },
                k,
              ),
            ),
          }),
        }),
      m &&
        e.jsxs($t, {
          title: a ? "Choose employee" : "Scegli dipendente",
          onClose: () => {
            x(!1), f("");
          },
          children: [
            e.jsx(En, {
              value: j,
              onChange: f,
              placeholder: a
                ? "Search employee or studio"
                : "Cerca dipendente o studio",
            }),
            e.jsx("div", {
              className: "list tight",
              children: g
                .filter((k) => {
                  var z;
                  return (
                    !h ||
                    se(
                      `${k.name} ${(z = je.find((E) => E.id === k.studio)) == null ? void 0 : z.name}`,
                    ).includes(h)
                  );
                })
                .map((k) => {
                  var z;
                  return e.jsxs(
                    "button",
                    {
                      className: `pick-row${k.id === b.id ? " on" : ""}`,
                      onClick: () => {
                        i(k.id), x(!1), f("");
                      },
                      children: [
                        e.jsx("b", { children: k.name }),
                        e.jsx("span", { children: k.role }),
                        e.jsx("small", {
                          children:
                            (z = je.find((E) => E.id === k.studio)) == null
                              ? void 0
                              : z.name,
                        }),
                      ],
                    },
                    k.id,
                  );
                }),
            }),
          ],
        }),
    ],
  });
}
const Wd = [
    ["planning", "Planning", "Planning"],
    ["active", "Active", "Active"],
    ["on-hold", "On Hold", "On Hold"],
    ["completed", "Completed", "Completed"],
    ["archived", "Archived", "Archived"],
  ],
  ll = (t, n) =>
    t.ore
      .filter((s) => s.progettoCodice === n)
      .reduce((s, r) => s + (Number(r.ore) || 0), 0),
  rs = (t) => `${t.toLocaleString("it-IT", { maximumFractionDigits: 1 })} h`,
  ol = (t) => (/partner/i.test(t) ? 0 : /senior/i.test(t) ? 1 : 2);
function Uj() {
  var P, $;
  const { data: t, viewer: n, language: s } = Y(),
    r = s === "en",
    [i, a] = C.useState(null),
    [l, o] = C.useState(null),
    [c, d] = C.useState(null),
    [u, m] = C.useState(null),
    [x, j] = C.useState(null);
  if (!ba(n))
    return e.jsx("div", {
      className: "access-denied",
      children: e.jsx("h1", {
        children: r ? "Restricted area" : "Area riservata",
      }),
    });
  const f = je.find((N) => N.id === i),
    g = t.progetti.filter((N) => Jt(N.codice) === i),
    b = t.progetti.find((N) => N.codice === c),
    v = b ? Rr(b.codice) : [],
    h = Object.values(Pe)
      .filter((N) => N.studio === i)
      .slice(0, 2)
      .map((N) => N.id),
    p =
      b && v.length
        ? v
        : b
          ? [
              {
                id: `${b.codice}-studio`,
                studio: i,
                name: r ? "Studio team" : "Gruppo di studio",
                share: 1,
                members: h,
              },
            ]
          : [],
    y = p.find((N) => N.id === u),
    O = x ? Pe[x] : null,
    k = b ? ll(t, b.codice) : 0,
    z = (N) => {
      a(N), o(null), d(null), m(null), j(null);
    },
    E = () => {
      j(null), u ? m(null) : c ? d(null) : l ? o(null) : a(null);
    },
    U = [
      f == null ? void 0 : f.name,
      (P = Wd.find((N) => N[0] === l)) == null ? void 0 : P[r ? 2 : 1],
      b == null ? void 0 : b.nome,
      y == null ? void 0 : y.name,
    ].filter(Boolean);
  return e.jsxs(e.Fragment, {
    children: [
      e.jsxs("div", {
        className: "property-title",
        children: [
          e.jsxs("div", {
            children: [
              e.jsx("small", { children: "ARCHEA PROPERTY" }),
              e.jsx("h1", {
                children: r ? "Project progress" : "Avanzamento progetti",
              }),
            ],
          }),
          i &&
            e.jsx("button", {
              className: "icon-btn",
              onClick: E,
              "aria-label": r ? "Back" : "Indietro",
              children: e.jsx(Re, {}),
            }),
        ],
      }),
      U.length > 0 &&
        e.jsxs("div", {
          className: "breadcrumbs",
          children: [
            e.jsx("button", {
              onClick: () => {
                a(null), o(null), d(null), m(null), j(null);
              },
              children: r ? "Studios" : "Studi",
            }),
            U.map((N, I) =>
              e.jsxs(
                C.Fragment,
                {
                  children: [
                    e.jsx("span", { children: "›" }),
                    e.jsx("b", { children: N }),
                  ],
                },
                `${N}-${I}`,
              ),
            ),
          ],
        }),
      !i &&
        e.jsxs(e.Fragment, {
          children: [
            e.jsx("p", {
              className: "sub property-sub",
              children: r
                ? "Select a studio to view its projects."
                : "Seleziona uno studio per consultarne i progetti.",
            }),
            e.jsx("div", {
              className: "studio-grid",
              children: je.map((N) => {
                const I = t.progetti.filter((S) => Jt(S.codice) === N.id);
                return e.jsxs(
                  "button",
                  {
                    onClick: () => z(N.id),
                    children: [
                      e.jsx("span", {
                        className: "studio-icon",
                        children: e.jsx(ja, {}),
                      }),
                      e.jsx("b", { children: N.name }),
                      e.jsxs("small", {
                        children: [I.length, " ", r ? "projects" : "progetti"],
                      }),
                      e.jsxs("span", {
                        className: "mini-statuses",
                        children: [
                          e.jsxs("i", {
                            children: [
                              I.filter((S) => zt(S.stato) === "active").length,
                              " ",
                              r ? "active" : "attivi",
                            ],
                          }),
                          e.jsx("i", {
                            children: rs(
                              I.reduce((S, L) => S + ll(t, L.codice), 0),
                            ),
                          }),
                        ],
                      }),
                    ],
                  },
                  N.id,
                );
              }),
            }),
          ],
        }),
      i &&
        !l &&
        e.jsxs(e.Fragment, {
          children: [
            e.jsx("p", {
              className: "sub property-sub",
              children: r
                ? "Choose project status."
                : "Scegli lo stato dei progetti.",
            }),
            e.jsx("div", {
              className: "property-menu",
              children: Wd.map(([N, I, S]) => {
                const L = g.filter((H) => zt(H.stato) === N);
                return e.jsxs(
                  "button",
                  {
                    onClick: () => o(N),
                    children: [
                      e.jsxs("span", {
                        children: [
                          e.jsx("b", { children: r ? S : I }),
                          e.jsxs("small", {
                            children: [
                              L.length,
                              " ",
                              L.length === 1
                                ? r
                                  ? "project"
                                  : "progetto"
                                : r
                                  ? "projects"
                                  : "progetti",
                            ],
                          }),
                        ],
                      }),
                      e.jsx(ve, {}),
                    ],
                  },
                  N,
                );
              }),
            }),
          ],
        }),
      i &&
        l &&
        !c &&
        e.jsxs(e.Fragment, {
          children: [
            e.jsx("div", {
              className: "section-head",
              children: e.jsx("h2", {
                children: r ? "Project list" : "Elenco progetti",
              }),
            }),
            e.jsxs("div", {
              className: "property-list",
              children: [
                g
                  .filter((N) => zt(N.stato) === l)
                  .map((N) =>
                    e.jsxs(
                      "button",
                      {
                        onClick: () => d(N.codice),
                        children: [
                          e.jsxs("span", {
                            children: [
                              e.jsx("b", { children: N.codice }),
                              e.jsx("small", { children: N.nome }),
                            ],
                          }),
                          e.jsx("span", {
                            className: "hours-badge",
                            children: rs(ll(t, N.codice)),
                          }),
                          e.jsx(ve, {}),
                        ],
                      },
                      N.codice,
                    ),
                  ),
                !g.some((N) => zt(N.stato) === l) &&
                  e.jsx("p", {
                    className: "empty",
                    children: r
                      ? "No projects in this category."
                      : "Nessun progetto in questa categoria.",
                  }),
              ],
            }),
          ],
        }),
      b &&
        !u &&
        e.jsxs(e.Fragment, {
          children: [
            e.jsxs("div", {
              className: "project-property-hero",
              children: [
                e.jsx("small", { children: b.codice }),
                e.jsx("h2", { children: b.nome }),
                e.jsxs("span", {
                  children: [
                    r ? "Total studio hours" : "Ore complessive dello studio",
                    " · ",
                    e.jsx("b", { children: rs(k) }),
                  ],
                }),
              ],
            }),
            e.jsx("div", {
              className: "section-head",
              children: e.jsx("h2", {
                children: r
                  ? "Work groups by studio"
                  : "Gruppi di lavoro per studio",
              }),
            }),
            e.jsx("div", {
              className: "property-list",
              children: p.map((N) => {
                const I = je.find((S) => S.id === N.studio);
                return e.jsxs(
                  "button",
                  {
                    onClick: () => m(N.id),
                    children: [
                      e.jsxs("span", {
                        children: [
                          e.jsx("b", { children: N.name }),
                          e.jsx("small", {
                            children: I == null ? void 0 : I.name,
                          }),
                        ],
                      }),
                      e.jsx("span", {
                        className: "hours-badge",
                        children: rs(k * N.share),
                      }),
                      e.jsx(ve, {}),
                    ],
                  },
                  N.id,
                );
              }),
            }),
            e.jsxs("details", {
              className: "project-accounting-disclosure",
              open: !0,
              children: [
                e.jsxs("summary", {
                  children: [
                    r ? "Project accounting" : "Contabilità del progetto",
                    e.jsx(ve, {}),
                  ],
                }),
                e.jsx(
                  jc,
                  { data: t, viewer: n, project: b, en: r, embedded: !0 },
                  b.codice,
                ),
              ],
            }),
          ],
        }),
      y &&
        e.jsxs(e.Fragment, {
          children: [
            e.jsxs("div", {
              className: "project-property-hero group",
              children: [
                e.jsx("small", {
                  children:
                    ($ = je.find((N) => N.id === y.studio)) == null
                      ? void 0
                      : $.name,
                }),
                e.jsx("h2", { children: y.name }),
                e.jsxs("span", {
                  children: [
                    r ? "Group hours" : "Ore complessive del gruppo",
                    " · ",
                    e.jsx("b", { children: rs(k * y.share) }),
                  ],
                }),
              ],
            }),
            e.jsx("div", {
              className: "section-head",
              children: e.jsx("h2", {
                children: r ? "Team members" : "Componenti del gruppo",
              }),
            }),
            e.jsx("div", {
              className: "member-list",
              children: y.members
                .slice()
                .sort((N, I) => {
                  var S, L;
                  return (
                    ol((S = Pe[N]) == null ? void 0 : S.role) -
                    ol((L = Pe[I]) == null ? void 0 : L.role)
                  );
                })
                .map((N) => {
                  const I = Pe[N];
                  if (!I) return null;
                  const S = ol(I.role) < 2;
                  return e.jsxs(
                    "button",
                    {
                      className: "member-row",
                      onClick: () => j(N),
                      children: [
                        e.jsx("span", {
                          className: "member-avatar",
                          children: I.name
                            .split(" ")
                            .map((L) => L[0])
                            .slice(0, 2)
                            .join(""),
                        }),
                        e.jsxs("span", {
                          children: [
                            e.jsxs("span", {
                              className: "member-name",
                              children: [
                                S &&
                                  e.jsx("strong", {
                                    children: r ? "Lead: " : "Referente: ",
                                  }),
                                I.name,
                              ],
                            }),
                            e.jsxs("small", {
                              children: [
                                I.role,
                                " · ",
                                rs(
                                  (k * y.share) / Math.max(1, y.members.length),
                                ),
                              ],
                            }),
                          ],
                        }),
                        e.jsx("span", {
                          className: "member-open",
                          "aria-hidden": "true",
                          children: e.jsx(Xn, {}),
                        }),
                      ],
                    },
                    N,
                  );
                }),
            }),
          ],
        }),
      O &&
        e.jsx($t, {
          title: r ? "Team member" : "Scheda componente",
          onClose: () => j(null),
          children: e.jsx(Fp, { data: t, person: O, en: r }),
        }),
      e.jsx("p", {
        className: "hint property-data-note",
        children: r
          ? "Demo organizational mapping. Hours come from the imported Excel file."
          : "Mappatura organizzativa dimostrativa. Le ore provengono dall’Excel importato.",
      }),
    ],
  });
}
function Vj() {
  return e.jsxs("div", {
    className: "archea-splash",
    "aria-label": "Archea Associati",
    children: [
      e.jsx("div", {
        className: "splash-wordmark",
        children: e.jsx("img", {
          src: "./icons/archea-associati-logo.svg",
          alt: "ARCHEA ASSOCIATI",
        }),
      }),
      e.jsx("i", { className: "crt-line" }),
    ],
  });
}
function Bj() {
  const { login: t, language: n, setLanguage: s } = Y(),
    [r, i] = C.useState(Vn[0].email),
    [a, l] = C.useState("demo"),
    [o, c] = C.useState(""),
    d = n === "en",
    u = (m) => {
      m.preventDefault();
      const x = t(r, a);
      c(x.ok ? "" : x.error);
    };
  return e.jsxs("main", {
    className: "login-screen",
    children: [
      e.jsxs("section", {
        className: "login-brand",
        children: [
          e.jsx("img", {
            src: "./icons/archea-associati-logo.svg",
            alt: "ARCHEA ASSOCIATI",
          }),
          e.jsx("p", {
            children: d
              ? "Your studio workspace."
              : "Il workspace del tuo studio.",
          }),
        ],
      }),
      e.jsxs("section", {
        className: "login-card",
        children: [
          e.jsxs("div", {
            className: "login-card-head",
            children: [
              e.jsx("span", { children: "DEMO" }),
              e.jsxs("div", {
                className: "language-switch login-language",
                children: [
                  e.jsx("button", {
                    type: "button",
                    className: n === "it" ? "on" : "",
                    onClick: () => s("it"),
                    children: "IT",
                  }),
                  e.jsx("button", {
                    type: "button",
                    className: n === "en" ? "on" : "",
                    onClick: () => s("en"),
                    children: "EN",
                  }),
                ],
              }),
            ],
          }),
          e.jsx("h1", { children: d ? "Sign in" : "Accedi" }),
          e.jsx("p", {
            children: d
              ? "Use one of the demo company accounts."
              : "Utilizza uno degli account aziendali dimostrativi.",
          }),
          e.jsxs("form", {
            onSubmit: u,
            children: [
              e.jsxs("label", {
                children: [
                  d ? "Company email" : "Email aziendale",
                  e.jsx("input", {
                    type: "email",
                    value: r,
                    onChange: (m) => i(m.target.value),
                    autoComplete: "username",
                    required: !0,
                  }),
                ],
              }),
              e.jsxs("label", {
                children: [
                  "Password",
                  e.jsx("input", {
                    type: "password",
                    value: a,
                    onChange: (m) => l(m.target.value),
                    autoComplete: "current-password",
                    required: !0,
                  }),
                ],
              }),
              o &&
                e.jsx("p", {
                  className: "login-error",
                  role: "alert",
                  children: o,
                }),
              e.jsx("button", {
                className: "login-submit",
                type: "submit",
                children: d ? "Enter workspace" : "Entra nel workspace",
              }),
            ],
          }),
          e.jsxs("div", {
            className: "demo-accounts",
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("b", {
                    children: d ? "Demo accounts" : "Account di prova",
                  }),
                  e.jsx("small", {
                    children: d
                      ? "Password for all accounts: demo"
                      : "Password per tutti gli account: demo",
                  }),
                ],
              }),
              e.jsx("div", {
                className: "demo-account-picker",
                children: e.jsx(fe, {
                  label: d ? "Demo profile" : "Profilo dimostrativo",
                  value: (Vn.find((m) => m.email === r) || Vn[0]).id,
                  searchable: !0,
                  options: Vn.map((m) => ({
                    value: m.id,
                    label: m.nome,
                    meta:
                      m.id === "mmadaghiele"
                        ? "Architect · Gestore Materioteca"
                        : ao.includes(m.id)
                          ? `${Xt[m.appRole]} · Platform Owner`
                          : Xt[m.appRole],
                  })),
                  onChange: (m) => {
                    const x = Vn.find((j) => j.id === m);
                    x && (i(x.email), l("demo"), c(""));
                  },
                }),
              }),
            ],
          }),
        ],
      }),
      e.jsxs("footer", {
        className: "login-watermark",
        children: [
          e.jsxs("span", { children: ["v", xa, " · DEMO LOCALE"] }),
          e.jsx("span", {
            children:
              "© 2026 · Fatto per Archea Associati da Francesco Diamanti",
          }),
        ],
      }),
    ],
  });
}
const yt = (t, n) => (n > 0 ? Math.round((t / n) * 100) : 0),
  Js = (t) =>
    String(t || "")
      .toLowerCase()
      .replace(/[^a-z]/g, "");
function bs({
  value: t,
  label: n,
  amount: s,
  tone: r = "dark",
  en: i = !1,
  amountLabel: a,
}) {
  const o = 2 * Math.PI * 43,
    c = Math.max(0, Math.min(100, t)),
    [d, u] = C.useState(!1);
  return (
    C.useEffect(() => {
      const m = requestAnimationFrame(() => u(!0));
      return () => cancelAnimationFrame(m);
    }, [c]),
    e.jsxs("article", {
      className: `insight-ring ${r}`,
      children: [
        e.jsxs("div", {
          className: "ring-graphic",
          children: [
            e.jsxs("svg", {
              viewBox: "0 0 104 104",
              "aria-hidden": "true",
              children: [
                e.jsx("circle", {
                  className: "ring-track",
                  cx: "52",
                  cy: "52",
                  r: 43,
                }),
                e.jsx("circle", {
                  className: "ring-value",
                  cx: "52",
                  cy: "52",
                  r: 43,
                  strokeDasharray: o,
                  strokeDashoffset: d ? o * (1 - c / 100) : o,
                }),
              ],
            }),
            e.jsxs("span", {
              children: [
                e.jsxs("b", { children: [e.jsx(pe, { value: c }), "%"] }),
                e.jsx("small", { children: n }),
              ],
            }),
          ],
        }),
        e.jsx("strong", {
          children: a ?? e.jsx(pe, { value: s, format: (m) => W(m, i) }),
        }),
      ],
    })
  );
}
function Hj({ data: t, en: n }) {
  var c, d;
  const s = je.map((u) => {
      const m = t.progetti
          .filter((b) => Jt(b.codice) === u.id)
          .map((b) => yn(t, b)),
        x = m.reduce((b, v) => b + v.turnover, 0),
        j = m.reduce((b, v) => b + v.paid, 0),
        f = m.reduce((b, v) => b + v.totalExpenses, 0),
        g = m.reduce((b, v) => b + v.expectedProfit, 0);
      return {
        studio: u,
        projects: m.length,
        turnover: x,
        paid: j,
        expenses: f,
        profit: g,
        margin: yt(g, x),
        collection: yt(j, x),
      };
    }),
    r = s.reduce(
      (u, m) => ({
        turnover: u.turnover + m.turnover,
        paid: u.paid + m.paid,
        expenses: u.expenses + m.expenses,
        profit: u.profit + m.profit,
      }),
      { turnover: 0, paid: 0, expenses: 0, profit: 0 },
    ),
    i = [...s].sort((u, m) => m.profit - u.profit),
    a = [...s]
      .filter((u) => u.turnover > 0)
      .sort((u, m) => m.margin - u.margin)[0],
    l = [...s]
      .filter((u) => u.turnover > 0)
      .sort((u, m) => m.collection - u.collection)[0],
    o = Math.max(1, ...s.flatMap((u) => [u.turnover, u.expenses, u.profit]));
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx("div", {
        className: "property-title",
        children: e.jsxs("div", {
          children: [
            e.jsx("small", { children: "ARCHEA PROPERTY" }),
            e.jsx("h1", { children: "Insight" }),
          ],
        }),
      }),
      e.jsx("p", {
        className: "sub property-sub",
        children: n
          ? "Group-wide economic performance and studio comparison."
          : "Andamento economico generale e confronto tra gli studi.",
      }),
      e.jsxs("section", {
        className: "insight-total",
        children: [
          e.jsx("small", {
            children: n ? "ARCHEA GROUP TURNOVER" : "FATTURATO GENERALE ARCHEA",
          }),
          e.jsx("b", {
            children: e.jsx(pe, { value: r.turnover, format: (u) => W(u, n) }),
          }),
          e.jsxs("div", {
            children: [
              e.jsxs("span", {
                children: [
                  n ? "Collected" : "Incassato",
                  " ",
                  e.jsx("strong", {
                    children: e.jsx(pe, {
                      value: r.paid,
                      format: (u) => W(u, n),
                    }),
                  }),
                ],
              }),
              e.jsxs("span", {
                children: [
                  n ? "Collection rate" : "Percentuale incasso",
                  " ",
                  e.jsxs("strong", {
                    children: [
                      e.jsx(pe, { value: yt(r.paid, r.turnover) }),
                      "%",
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      e.jsxs("div", {
        className: "insight-kpis",
        children: [
          e.jsxs("article", {
            children: [
              e.jsx("small", { children: n ? "Total costs" : "Spese totali" }),
              e.jsx("b", {
                children: e.jsx(pe, {
                  value: r.expenses,
                  format: (u) => W(u, n),
                }),
              }),
              e.jsxs("span", {
                children: [
                  yt(r.expenses, r.turnover),
                  "% ",
                  n ? "of turnover" : "del fatturato",
                ],
              }),
            ],
          }),
          e.jsxs("article", {
            children: [
              e.jsx("small", {
                children: n ? "Expected profit" : "Guadagno previsto",
              }),
              e.jsx("b", {
                children: e.jsx(pe, {
                  value: r.profit,
                  format: (u) => W(u, n),
                }),
              }),
              e.jsxs("span", {
                children: [
                  yt(r.profit, r.turnover),
                  "% ",
                  n ? "group margin" : "margine generale",
                ],
              }),
            ],
          }),
        ],
      }),
      e.jsx("div", {
        className: "section-head insight-heading",
        children: e.jsxs("div", {
          children: [
            e.jsx("h2", {
              children: n ? "Group indicators" : "Indicatori generali",
            }),
            e.jsx("p", {
              children: n
                ? "Animated summary of collections, costs and margin."
                : "Riepilogo animato di incassi, costi e margine.",
            }),
          ],
        }),
      }),
      e.jsxs("section", {
        className: "insight-rings",
        children: [
          e.jsx(bs, {
            value: yt(r.paid, r.turnover),
            label: n ? "Collected" : "Incassato",
            amount: r.paid,
            en: n,
          }),
          e.jsx(bs, {
            value: yt(r.expenses, r.turnover),
            label: n ? "Costs" : "Spese",
            amount: r.expenses,
            tone: "light",
            en: n,
          }),
          e.jsx(bs, {
            value: yt(r.profit, r.turnover),
            label: n ? "Margin" : "Margine",
            amount: r.profit,
            tone: "mid",
            en: n,
          }),
        ],
      }),
      e.jsx("div", {
        className: "section-head insight-heading",
        children: e.jsxs("div", {
          children: [
            e.jsx("h2", {
              children: n ? "Studio performance" : "Andamento degli studi",
            }),
            e.jsx("p", {
              children: n
                ? "Turnover, costs and expected profit in one view."
                : "Fatturato, spese e guadagno previsto in un unico grafico.",
            }),
          ],
        }),
      }),
      e.jsxs("section", {
        className: "insight-chart",
        children: [
          e.jsxs("div", {
            className: "chart-legend",
            children: [
              e.jsx("span", {
                className: "turnover",
                children: n ? "Turnover" : "Fatturato",
              }),
              e.jsx("span", {
                className: "expenses",
                children: n ? "Costs" : "Spese",
              }),
              e.jsx("span", {
                className: "profit",
                children: n ? "Profit" : "Guadagno",
              }),
            ],
          }),
          s.map((u) =>
            e.jsxs(
              "article",
              {
                children: [
                  e.jsxs("header", {
                    children: [
                      e.jsx("b", { children: u.studio.name }),
                      e.jsxs("span", {
                        children: [W(u.profit, n), " · ", u.margin, "%"],
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "bar-group",
                    children: [
                      e.jsx("i", {
                        className: "turnover",
                        style: { width: `${(u.turnover / o) * 100}%` },
                      }),
                      e.jsx("i", {
                        className: "expenses",
                        style: { width: `${(u.expenses / o) * 100}%` },
                      }),
                      e.jsx("i", {
                        className: "profit",
                        style: {
                          width: `${(Math.max(0, u.profit) / o) * 100}%`,
                        },
                      }),
                    ],
                  }),
                ],
              },
              u.studio.id,
            ),
          ),
        ],
      }),
      e.jsx("div", {
        className: "section-head",
        children: e.jsx("h2", {
          children: n ? "Key indicators" : "Indicatori principali",
        }),
      }),
      e.jsxs("div", {
        className: "insight-leaders",
        children: [
          e.jsxs("article", {
            children: [
              e.jsx("small", {
                children: n ? "Highest profit" : "Maggiore guadagno",
              }),
              e.jsx("b", {
                children: (c = i[0]) == null ? void 0 : c.studio.name,
              }),
              e.jsx("strong", {
                children: W(((d = i[0]) == null ? void 0 : d.profit) || 0, n),
              }),
            ],
          }),
          e.jsxs("article", {
            children: [
              e.jsx("small", {
                children: n ? "Best margin" : "Margine migliore",
              }),
              e.jsx("b", { children: a == null ? void 0 : a.studio.name }),
              e.jsxs("strong", {
                children: [(a == null ? void 0 : a.margin) || 0, "%"],
              }),
            ],
          }),
          e.jsxs("article", {
            children: [
              e.jsx("small", {
                children: n
                  ? "Best collection rate"
                  : "Miglior percentuale d’incasso",
              }),
              e.jsx("b", { children: l == null ? void 0 : l.studio.name }),
              e.jsxs("strong", {
                children: [(l == null ? void 0 : l.collection) || 0, "%"],
              }),
            ],
          }),
        ],
      }),
      e.jsx("div", {
        className: "section-head",
        children: e.jsx("h2", {
          children: n ? "Profit ranking" : "Classifica per guadagno",
        }),
      }),
      e.jsx("div", {
        className: "insight-ranking",
        children: i.map((u, m) =>
          e.jsxs(
            "article",
            {
              children: [
                e.jsx("span", { children: m + 1 }),
                e.jsxs("div", {
                  children: [
                    e.jsx("b", { children: u.studio.name }),
                    e.jsxs("small", {
                      children: [
                        u.projects,
                        " ",
                        n ? "projects" : "progetti",
                        " · ",
                        n ? "turnover" : "fatturato",
                        " ",
                        W(u.turnover, n),
                      ],
                    }),
                  ],
                }),
                e.jsx("strong", { children: W(u.profit, n) }),
              ],
            },
            u.studio.id,
          ),
        ),
      }),
      e.jsx("p", {
        className: "hint accounting-note",
        children: n
          ? "Demo insight calculated from the accounting data assigned to each studio."
          : "Insight dimostrativi calcolati dai dati contabili dei progetti assegnati a ciascuno studio.",
      }),
    ],
  });
}
const cl = {
  month: {
    factor: 0.12,
    labelIt: "30 giorni",
    labelEn: "30 days",
    months: ["1", "7", "14", "21", "28"],
  },
  quarter: {
    factor: 0.35,
    labelIt: "3 mesi",
    labelEn: "3 months",
    months: ["Lug", "Ago", "Set"],
  },
  year: {
    factor: 1,
    labelIt: "12 mesi",
    labelEn: "12 months",
    months: ["Gen", "Mar", "Mag", "Lug", "Set"],
  },
};
function Gj({ data: t, viewer: n, today: s, en: r, setTab: i }) {
  const [a, l] = C.useState("year"),
    o = cl[a].factor,
    c = t.progetti.filter(
      (A) => !["storico", "concluso"].includes(Js(A.stato)),
    ),
    d = new Set(c.map((A) => A.codice)),
    m = c
      .map((A) => ({ project: A, ...yn(t, A) }))
      .reduce(
        (A, w) => ({
          turnover: A.turnover + w.turnover,
          paid: A.paid + w.paid,
          expenses: A.expenses + w.totalExpenses,
          profit: A.profit + w.expectedProfit,
        }),
        { turnover: 0, paid: 0, expenses: 0, profit: 0 },
      ),
    x = {
      turnover: Math.round(m.turnover * o),
      paid: Math.round(m.paid * o),
      expenses: Math.round(m.expenses * o),
      profit: Math.round(m.profit * o),
    },
    j = t.task.filter((A) => d.has(A.progettoCodice)),
    f = j.filter((A) => qe(A, s)),
    g = f.filter((A) => Ce(A, s) === "in_scadenza").length,
    b = f.filter((A) => Ce(A, s) === "scaduta").length,
    v = Math.max(f.length, Math.round(j.length * o)),
    h = t.ore
      .filter((A) => d.has(A.progettoCodice))
      .reduce((A, w) => A + (Number(w.ore) || 0), 0),
    p = Math.round(h * o),
    y = j.filter((A) => Ce(A, s) === "validata").length,
    O = Math.max(0, Math.min(100, yt(y, j.length))),
    k = yt(m.paid, m.turnover),
    z = yt(m.profit, m.turnover),
    E = c
      .map((A) => ({
        project: A,
        count: f.filter((w) => w.progettoCodice === A.codice).length,
      }))
      .sort((A, w) => w.count - A.count)
      .slice(0, 5),
    U = Math.max(1, ...E.map((A) => A.count)),
    P = [
      ...PROJECT_STATUS_OPTIONS.map((A) => ({
        label: A.value,
        className: projectStatusSlug(A.value),
        count: t.progetti.filter(
          (w) => normalizeProjectStatus(w.stato) === A.value,
        ).length,
      })),
    ],
    $ = Math.max(
      1,
      P.reduce((A, w) => A + w.count, 0),
    ),
    N = (P[0].count / $) * 100,
    I = N + (P[1].count / $) * 100,
    S = I + (P[2].count / $) * 100,
    R = S + (P[3].count / $) * 100,
    L = `conic-gradient(#a9afb2 0 ${N}%,#718779 ${N}% ${I}%,#c57f66 ${I}% ${S}%,#5e6661 ${S}% ${R}%,#d7dad7 ${R}% 100%)`,
    H = t.persone
      .filter((A) => A.inRiepiloghiOre)
      .map((A) => ({
        person: A,
        hours: t.ore
          .filter((w) => w.persona === A.nome && d.has(w.progettoCodice))
          .reduce((w, B) => w + (Number(B.ore) || 0), 0),
      }))
      .sort((A, w) => w.hours - A.hours)
      .slice(0, 4),
    _ = Math.max(1, ...H.map((A) => A.hours));
  return e.jsxs(e.Fragment, {
    children: [
      e.jsxs("button", {
        className: "detail-back manager-insight-back",
        onClick: () => i("altro"),
        children: [e.jsx(Re, {}), r ? "Back to More" : "Torna ad Altro"],
      }),
      e.jsxs("div", {
        className: "manager-insight-title",
        children: [
          e.jsxs("div", {
            children: [
              e.jsx("h1", { children: "Insight" }),
              e.jsx("p", {
                children: r
                  ? "Financial and operational performance"
                  : "Andamento economico e operativo",
              }),
            ],
          }),
          e.jsx("span", {
            children: n.appRole === "partner_architect" ? "PARTNER" : "SENIOR",
          }),
        ],
      }),
      e.jsx("div", {
        className: "manager-insight-periods",
        children: Object.entries(cl).map(([A, w]) =>
          e.jsx(
            "button",
            {
              className: a === A ? "on" : "",
              onClick: () => l(A),
              children: r ? w.labelEn : w.labelIt,
            },
            A,
          ),
        ),
      }),
      e.jsxs(
        "section",
        {
          className: "insight-total manager-insight-total",
          children: [
            e.jsx("small", {
              children: r
                ? "VISIBLE PROJECT TURNOVER"
                : "FATTURATO PROGETTI VISIBILI",
            }),
            e.jsx("b", {
              children: e.jsx(pe, {
                value: x.turnover,
                format: (A) => W(A, r),
              }),
            }),
            e.jsxs("div", {
              children: [
                e.jsxs("span", {
                  children: [
                    r ? "Collected" : "Incassato",
                    " ",
                    e.jsx("strong", {
                      children: e.jsx(pe, {
                        value: x.paid,
                        format: (A) => W(A, r),
                      }),
                    }),
                  ],
                }),
                e.jsxs("span", {
                  children: [
                    r ? "Margin" : "Margine",
                    " ",
                    e.jsxs("strong", {
                      children: [e.jsx(pe, { value: z }), "%"],
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
        `total-${a}`,
      ),
      e.jsxs(
        "div",
        {
          className: "manager-insight-kpis",
          children: [
            e.jsxs("article", {
              children: [
                e.jsx("small", {
                  children: r ? "Total costs" : "Spese complessive",
                }),
                e.jsx("b", {
                  children: e.jsx(pe, {
                    value: x.expenses,
                    format: (A) => W(A, r),
                  }),
                }),
                e.jsx("span", {
                  children: r
                    ? "Consultants, resources and external costs"
                    : "Consulenti, risorse e costi esterni",
                }),
              ],
            }),
            e.jsxs("article", {
              children: [
                e.jsx("small", {
                  children: r ? "Expected profit" : "Guadagno previsto",
                }),
                e.jsx("b", {
                  children: e.jsx(pe, {
                    value: x.profit,
                    format: (A) => W(A, r),
                  }),
                }),
                e.jsx("span", {
                  children: r
                    ? "Before VAT and taxes"
                    : "Prima di IVA e imposte",
                }),
              ],
            }),
            e.jsxs("article", {
              children: [
                e.jsx("small", {
                  children: r ? "Recorded hours" : "Ore registrate",
                }),
                e.jsxs("b", { children: [e.jsx(pe, { value: p }), " h"] }),
                e.jsx("span", {
                  children: r
                    ? "Across visible projects"
                    : "Su tutti i progetti visibili",
                }),
              ],
            }),
            e.jsxs("article", {
              children: [
                e.jsx("small", {
                  children: r ? "Managed tasks" : "Task gestite",
                }),
                e.jsx("b", { children: e.jsx(pe, { value: v }) }),
                e.jsx("span", {
                  children: r
                    ? "Open and completed in the period"
                    : "Aperte e completate nel periodo",
                }),
              ],
            }),
          ],
        },
        `kpis-${a}`,
      ),
      e.jsx("div", {
        className: "section-head insight-heading",
        children: e.jsxs("div", {
          children: [
            e.jsx("h2", {
              children: r ? "General indicators" : "Indicatori generali",
            }),
            e.jsx("p", {
              children: r
                ? "Collections, margin and operational efficiency."
                : "Incassi, margine ed efficienza operativa.",
            }),
          ],
        }),
      }),
      e.jsxs(
        "section",
        {
          className: "insight-rings",
          children: [
            e.jsx(bs, {
              value: k,
              label: r ? "Collected" : "Incassato",
              amount: x.paid,
              en: r,
            }),
            e.jsx(bs, {
              value: z,
              label: r ? "Margin" : "Margine",
              amount: x.profit,
              tone: "light",
              en: r,
            }),
            e.jsx(bs, {
              value: O,
              label: r ? "Completed" : "Efficienza",
              tone: "mid",
              en: r,
              amountLabel: r ? "Validated tasks" : "Task validate",
            }),
          ],
        },
        `rings-${a}`,
      ),
      e.jsx("div", {
        className: "section-head insight-heading",
        children: e.jsxs("div", {
          children: [
            e.jsx("h2", {
              children: r ? "Financial trend" : "Andamento economico",
            }),
            e.jsx("p", {
              children: r
                ? "Turnover and costs in the selected period."
                : "Fatturato e costi nel periodo selezionato.",
            }),
          ],
        }),
      }),
      e.jsxs(
        "section",
        {
          className: "manager-trend",
          children: [
            e.jsxs("div", {
              className: "manager-trend-legend",
              children: [
                e.jsxs("span", {
                  children: [e.jsx("i", {}), r ? "Turnover" : "Fatturato"],
                }),
                e.jsxs("span", {
                  className: "cost",
                  children: [e.jsx("i", {}), r ? "Costs" : "Spese"],
                }),
              ],
            }),
            e.jsxs("svg", {
              viewBox: "0 0 340 155",
              role: "img",
              "aria-label": r ? "Financial trend" : "Andamento economico",
              children: [
                e.jsx("line", { x1: "10", y1: "25", x2: "330", y2: "25" }),
                e.jsx("line", { x1: "10", y1: "75", x2: "330", y2: "75" }),
                e.jsx("line", { x1: "10", y1: "125", x2: "330", y2: "125" }),
                e.jsx("path", {
                  className: "trend-area",
                  d: "M12 119 C55 105 74 91 103 96 S154 59 190 67 S240 34 275 46 S310 18 328 25 L328 135 L12 135Z",
                }),
                e.jsx("path", {
                  className: "trend-turnover",
                  d: "M12 119 C55 105 74 91 103 96 S154 59 190 67 S240 34 275 46 S310 18 328 25",
                }),
                e.jsx("path", {
                  className: "trend-cost",
                  d: "M12 128 C54 119 78 112 103 115 S153 88 190 96 S235 76 275 81 S310 57 328 63",
                }),
              ],
            }),
            e.jsx("div", {
              className: "manager-trend-labels",
              children: cl[a].months.map((A) =>
                e.jsx("span", { children: A }, A),
              ),
            }),
          ],
        },
        `trend-${a}`,
      ),
      e.jsx("div", {
        className: "section-head insight-heading",
        children: e.jsxs("div", {
          children: [
            e.jsx("h2", {
              children: r ? "Project pressure" : "Pressione sui progetti",
            }),
            e.jsx("p", {
              children: r
                ? "Open tasks and current workload."
                : "Task aperte e carico operativo corrente.",
            }),
          ],
        }),
      }),
      e.jsxs("section", {
        className: "manager-pressure",
        children: [
          E.map((A, w) =>
            e.jsxs(
              "article",
              {
                className:
                  w === 0 && A.count
                    ? "alert"
                    : w === 1 && A.count
                      ? "warn"
                      : "",
                children: [
                  e.jsxs("span", {
                    children: [
                      e.jsx("b", { children: A.project.codice }),
                      e.jsx("small", { children: A.project.nome }),
                    ],
                  }),
                  e.jsx("i", {
                    children: e.jsx("em", {
                      style: { width: `${(A.count / U) * 100}%` },
                    }),
                  }),
                  e.jsx("strong", { children: A.count }),
                ],
              },
              A.project.codice,
            ),
          ),
          !E.length &&
            e.jsx("p", {
              className: "empty",
              children: r ? "No active projects." : "Nessun progetto attivo.",
            }),
        ],
      }),
      e.jsx("div", {
        className: "section-head insight-heading",
        children: e.jsxs("div", {
          children: [
            e.jsx("h2", {
              children: r ? "Project status" : "Stato dei progetti",
            }),
            e.jsx("p", {
              children: r
                ? "Distribution of visible projects."
                : "Distribuzione delle commesse visibili.",
            }),
          ],
        }),
      }),
      e.jsxs("section", {
        className: "manager-status",
        children: [
          e.jsx("div", {
            className: "manager-status-donut",
            style: { background: L },
            children: e.jsxs("span", {
              children: [
                e.jsx("b", { children: $ }),
                e.jsx("small", { children: r ? "PROJECTS" : "PROGETTI" }),
              ],
            }),
          }),
          e.jsx("div", {
            children: P.map((A) =>
              e.jsxs(
                "p",
                {
                  children: [
                    e.jsx("i", { className: A.className }),
                    e.jsx("span", { children: A.label }),
                    e.jsx("b", { children: A.count }),
                  ],
                },
                A.className,
              ),
            ),
          }),
        ],
      }),
      e.jsx("div", {
        className: "section-head insight-heading",
        children: e.jsxs("div", {
          children: [
            e.jsx("h2", { children: r ? "Team workload" : "Carico del team" }),
            e.jsx("p", {
              children: r
                ? "Share of recorded hours in the selected project set."
                : "Distribuzione delle ore sui progetti selezionati.",
            }),
          ],
        }),
      }),
      e.jsx("section", {
        className: "manager-team",
        children: H.map((A) => {
          const w = A.person.nome
            .split(/\s+/)
            .slice(0, 2)
            .map((B) => B[0])
            .join("")
            .toUpperCase();
          return e.jsxs(
            "article",
            {
              children: [
                e.jsx("span", { children: w }),
                e.jsxs("div", {
                  children: [
                    e.jsx("b", { children: A.person.nome }),
                    e.jsx("i", {
                      children: e.jsx("em", {
                        style: { width: `${(A.hours / _) * 100}%` },
                      }),
                    }),
                  ],
                }),
                e.jsxs("strong", { children: [Math.round(A.hours), " h"] }),
              ],
            },
            A.person.id,
          );
        }),
      }),
      e.jsx("div", {
        className: "section-head",
        children: e.jsx("h2", { children: r ? "Deadlines" : "Scadenze" }),
      }),
      e.jsxs("section", {
        className: "manager-deadlines",
        children: [
          e.jsxs("article", {
            children: [
              e.jsx("b", { children: e.jsx(pe, { value: f.length }) }),
              e.jsx("span", { children: r ? "Open" : "Aperte" }),
            ],
          }),
          e.jsxs("article", {
            className: "warn",
            children: [
              e.jsx("b", { children: e.jsx(pe, { value: g }) }),
              e.jsx("span", { children: r ? "Due soon" : "In scadenza" }),
            ],
          }),
          e.jsxs("article", {
            className: "alert",
            children: [
              e.jsx("b", { children: e.jsx(pe, { value: b }) }),
              e.jsx("span", { children: r ? "Overdue" : "Scadute" }),
            ],
          }),
        ],
      }),
      e.jsx("p", {
        className: "hint accounting-note",
        children: r
          ? "Demo insight based on visible projects, tasks, hours and accounting data."
          : "Insight dimostrativi calcolati su progetti, task, ore e dati contabili visibili.",
      }),
    ],
  });
}
function Wj() {
  const { data: t, viewer: n, today: s, language: r, setTab: i } = Y(),
    a = r === "en";
  return oj(n)
    ? ba(n)
      ? e.jsx(Hj, { data: t, en: a })
      : e.jsx(Gj, { data: t, viewer: n, today: s, en: a, setTab: i })
    : e.jsx("div", {
        className: "access-denied",
        children: e.jsx("h1", {
          children: a ? "Restricted area" : "Area riservata",
        }),
      });
}
const Up = [
  {
    id: "bim-01",
    category: "base",
    level: "BASE",
    title: "Impostazione iniziale di un progetto Revit",
    description:
      "Template Archea, unità, livelli, griglie e coordinate condivise.",
    duration: "8 min",
    format: "Guida",
  },
  {
    id: "bim-02",
    category: "base",
    level: "BASE",
    title: "Viste, template e filtri grafici",
    description:
      "Come mantenere coerenti piante, sezioni, prospetti e viste di lavoro.",
    duration: "12 min",
    format: "Video",
  },
  {
    id: "bim-03",
    category: "documentazione",
    level: "STANDARD",
    title: "Tavole, viewport e nomenclatura",
    description:
      "Regole dello studio per codici tavola, revisioni e impaginazione.",
    duration: "10 min",
    format: "PDF",
  },
  {
    id: "bim-04",
    category: "collaborazione",
    level: "TEAM",
    title: "Worksharing e modelli centrali",
    description:
      "Creazione del centrale, workset, sincronizzazione e buone pratiche.",
    duration: "15 min",
    format: "Guida",
  },
  {
    id: "bim-05",
    category: "collaborazione",
    level: "TEAM",
    title: "Collegamenti Revit, CAD e IFC",
    description: "Posizionamento, coordinate, gestione e controllo dei link.",
    duration: "11 min",
    format: "Video",
  },
  {
    id: "bim-06",
    category: "famiglie",
    level: "AVANZATO",
    title: "Famiglie parametriche Archea",
    description: "Parametri condivisi, tipi, materiali e livelli di dettaglio.",
    duration: "18 min",
    format: "Guida",
  },
  {
    id: "bim-07",
    category: "documentazione",
    level: "STANDARD",
    title: "Abachi e controllo qualità",
    description:
      "Abachi di verifica, filtri di controllo e consegna del modello.",
    duration: "14 min",
    format: "Checklist",
  },
];
function Kj() {
  const { language: t } = Y(),
    n = t === "en",
    [s, r] = C.useState("all"),
    [i, a] = C.useState(""),
    [l, o] = C.useState(null),
    c = se(i),
    d = Up.filter(
      (u) =>
        (s === "all" || u.category === s) &&
        (!c || se(`${u.title} ${u.description}`).includes(c)),
    );
  return e.jsxs(e.Fragment, {
    children: [
      e.jsxs("div", {
        className: "portal-title",
        children: [
          e.jsx("span", { children: e.jsx(ga, {}) }),
          e.jsxs("div", {
            children: [
              e.jsx("small", { children: "ARCHEA KNOWLEDGE" }),
              e.jsx("h1", { children: "BIM Portal" }),
            ],
          }),
        ],
      }),
      e.jsx("p", {
        className: "sub portal-sub",
        children: n
          ? "Revit guides, standards and shared workflows."
          : "Guide Revit, standard e procedure condivise dello studio.",
      }),
      e.jsx(En, {
        value: i,
        onChange: a,
        placeholder: n ? "Search a Revit guide" : "Cerca una guida Revit",
      }),
      e.jsx(Sa, {
        label: "BIM categories",
        value: s,
        onChange: r,
        options: [
          ["all", n ? "All" : "Tutte"],
          ["base", "Base"],
          ["documentazione", n ? "Docs" : "Tavole"],
          ["collaborazione", "Team"],
          ["famiglie", n ? "Families" : "Famiglie"],
        ],
      }),
      e.jsxs("div", {
        className: "bim-feature",
        children: [
          e.jsx("span", { children: e.jsx(wt, {}) }),
          e.jsxs("div", {
            children: [
              e.jsx("small", {
                children: n ? "STUDIO STANDARD" : "STANDARD DI STUDIO",
              }),
              e.jsx("h2", {
                children: n ? "Archea Revit Manual" : "Manuale Revit Archea",
              }),
              e.jsx("p", {
                children: n
                  ? "The complete reference for file structure, naming and delivery."
                  : "Il riferimento completo per struttura dei file, nomenclatura e consegna.",
              }),
            ],
          }),
          e.jsx("button", { children: n ? "Open" : "Apri" }),
        ],
      }),
      e.jsxs("div", {
        className: "section-head",
        children: [
          e.jsx("h2", { children: n ? "Guides" : "Guide" }),
          e.jsx("span", { className: "count", children: d.length }),
        ],
      }),
      e.jsx("div", {
        className: "bim-list",
        children: d.map((u) =>
          e.jsxs(
            "article",
            {
              className: l === u.id ? "open" : "",
              children: [
                e.jsxs("button", {
                  onClick: () => o(l === u.id ? null : u.id),
                  children: [
                    e.jsx("span", {
                      className: "bim-code",
                      children: u.level.slice(0, 2),
                    }),
                    e.jsxs("span", {
                      children: [
                        e.jsxs("small", {
                          children: [
                            u.level,
                            " · ",
                            u.format,
                            " · ",
                            u.duration,
                          ],
                        }),
                        e.jsx("b", { children: u.title }),
                      ],
                    }),
                    e.jsx(ve, {}),
                  ],
                }),
                l === u.id &&
                  e.jsxs("div", {
                    children: [
                      e.jsx("p", { children: u.description }),
                      e.jsx("button", {
                        className: "mini",
                        children: n ? "Open guide" : "Apri la guida",
                      }),
                    ],
                  }),
              ],
            },
            u.id,
          ),
        ),
      }),
    ],
  });
}
const Vp = [
    {
      id: "v1",
      requested: "2026-09-29",
      project: "P51",
      name: "Ampliamento Fiorentina",
      quantity: 5,
      requester: "Francesco Diamanti",
      delivery: "2026-10-08",
      artist: "Giovanni Cinquini",
      notes: "Aggiornamento viste padiglione e due viste esterne.",
      status: "open",
      priority: "high",
    },
    {
      id: "v2",
      requested: "2026-09-30",
      project: "M86",
      name: "Stadio Flaminio",
      quantity: 3,
      requester: "Francesco Diamanti",
      delivery: "2026-10-10",
      artist: "Sara Adorno",
      notes: "Fotoinserimenti del museo e vista pensilina.",
      status: "open",
      priority: "high",
    },
    {
      id: "v3",
      requested: "2026-10-02",
      project: "H42",
      name: "Leo France · Triangolo",
      quantity: 6,
      requester: "Giacomo Lissandron",
      delivery: "2026-10-14",
      artist: "Mattia Borrione",
      notes: "Aggiornamento viste già prodotte e fotoinserimenti.",
      status: "open",
      priority: "normal",
    },
    {
      id: "v4",
      requested: "2026-10-06",
      project: "P63",
      name: "Ragusa Cittadella dello Sport",
      quantity: 7,
      requester: "Mattia Borrione",
      delivery: "2026-10-21",
      artist: "Da assegnare",
      notes: "Birdview e street view per il concorso.",
      status: "open",
      priority: "normal",
    },
    {
      id: "v5",
      requested: "2026-09-22",
      project: "O55",
      name: "Yas Canal DCR1",
      quantity: 3,
      requester: "Alessandro Riccomi",
      delivery: "2026-09-25",
      artist: "Carolyn Speljarie",
      notes: "Due viste del bacino e una vista per off-plan.",
      status: "closed",
      priority: "normal",
    },
    {
      id: "v6",
      requested: "2026-09-18",
      project: "O32",
      name: "Castelfalfi UMI 3",
      quantity: 6,
      requester: "Castello Castellini",
      delivery: "2026-09-24",
      artist: "Mattia Borrione",
      notes: "Viste per presentazione pubblica.",
      status: "closed",
      priority: "normal",
    },
  ],
  Kd = (t) =>
    new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short" }).format(
      new Date(`${t}T12:00:00`),
    );
function Qj() {
  const { viewer: t, language: n } = Y(),
    s = n === "en",
    [r, i] = C.useState(Vp),
    [a, l] = C.useState("open"),
    [o, c] = C.useState(""),
    [d, u] = C.useState(null),
    m = se(o),
    x = zr(t),
    j = r.filter(
      (p) =>
        (a === "all" || p.status === a) &&
        (!m ||
          se(`${p.project} ${p.name} ${p.artist} ${p.requester}`).includes(m)),
    ),
    f = r.filter((p) => p.status === "open"),
    g = f.reduce((p, y) => p + y.quantity, 0),
    b = f.filter((p) => p.artist === "Da assegnare").length,
    v = () => {
      const p = prompt(s ? "Project code" : "Codice progetto");
      if (!(p != null && p.trim())) return;
      const y = prompt(s ? "Project name" : "Nome progetto") || p,
        O = Number(prompt(s ? "Number of renders" : "Numero di render") || 1),
        k =
          prompt(s ? "Visual artist" : "Renderista") ||
          (s ? "To assign" : "Da assegnare");
      i((z) => [
        {
          id: crypto.randomUUID(),
          requested: new Date().toISOString().slice(0, 10),
          project: p.trim().toUpperCase(),
          name: y.trim(),
          quantity: Math.max(1, O || 1),
          requester: t.nome,
          delivery: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10),
          artist: k,
          notes: s ? "New visual request" : "Nuova richiesta visual",
          status: "open",
          priority: "normal",
        },
        ...z,
      ]);
    },
    h = (p) =>
      x &&
      i((y) =>
        y.map((O) =>
          O.id === p.id
            ? { ...O, status: O.status === "open" ? "closed" : "open" }
            : O,
        ),
      );
  return e.jsxs(e.Fragment, {
    children: [
      e.jsxs("div", {
        className: "title-action",
        children: [
          e.jsxs("div", {
            className: "visual-title",
            children: [
              e.jsx("span", { children: e.jsx(ya, {}) }),
              e.jsxs("div", {
                children: [
                  e.jsx("small", { children: "ARCHEA" }),
                  e.jsx("h1", { children: "Visual Department" }),
                ],
              }),
            ],
          }),
          x &&
            e.jsx("button", {
              className: "round-add",
              onClick: v,
              "aria-label": s ? "New request" : "Nuova richiesta",
              children: e.jsx(tt, {}),
            }),
        ],
      }),
      e.jsx("p", {
        className: "sub portal-sub",
        children: s
          ? "Render requests, assignments and deliveries."
          : "Richieste render, assegnazioni e consegne.",
      }),
      e.jsxs("div", {
        className: "visual-kpis",
        children: [
          e.jsxs("article", {
            children: [
              e.jsx("b", { children: f.length }),
              e.jsx("span", {
                children: s ? "Open requests" : "Richieste aperte",
              }),
            ],
          }),
          e.jsxs("article", {
            children: [
              e.jsx("b", { children: g }),
              e.jsx("span", {
                children: s ? "Renders to produce" : "Render da produrre",
              }),
            ],
          }),
          e.jsxs("article", {
            className: b ? "alert" : "",
            children: [
              e.jsx("b", { children: b }),
              e.jsx("span", { children: s ? "To assign" : "Da assegnare" }),
            ],
          }),
        ],
      }),
      e.jsx(En, {
        value: o,
        onChange: c,
        placeholder: s
          ? "Search project, artist or requester"
          : "Cerca progetto, renderista o referente",
      }),
      e.jsx(Sa, {
        label: "Visual requests",
        value: a,
        onChange: l,
        options: [
          ["open", s ? "Open" : "Aperte"],
          ["closed", s ? "Closed" : "Chiuse"],
          ["all", s ? "All" : "Tutte"],
        ],
      }),
      e.jsx("div", {
        className: "visual-list",
        children: j.map((p) =>
          e.jsxs(
            "article",
            {
              className: `${p.status}${p.priority === "high" ? " priority" : ""}`,
              children: [
                e.jsxs("button", {
                  className: "visual-main",
                  onClick: () => u(d === p.id ? null : p.id),
                  children: [
                    e.jsxs("span", {
                      className: "visual-project",
                      children: [
                        e.jsx("small", { children: p.project }),
                        e.jsx("b", { children: p.name }),
                      ],
                    }),
                    e.jsxs("span", {
                      className: "render-number",
                      children: [
                        e.jsx("b", { children: p.quantity }),
                        e.jsx("small", { children: "RENDER" }),
                      ],
                    }),
                    e.jsxs("span", {
                      className: "visual-due",
                      children: [
                        e.jsx("small", {
                          children: s ? "DELIVERY" : "CONSEGNA",
                        }),
                        e.jsx("b", { children: Kd(p.delivery) }),
                      ],
                    }),
                  ],
                }),
                e.jsxs("div", {
                  className: "visual-assignment",
                  children: [
                    e.jsxs("span", {
                      children: [
                        e.jsx("small", {
                          children: s ? "Visual artist" : "Renderista",
                        }),
                        e.jsx("b", { children: p.artist }),
                      ],
                    }),
                    e.jsxs("span", {
                      children: [
                        e.jsx("small", {
                          children: s ? "Requester" : "Referente",
                        }),
                        e.jsx("b", { children: p.requester }),
                      ],
                    }),
                    e.jsx("button", {
                      className: `visual-status ${p.status}`,
                      onClick: () => h(p),
                      disabled: !x,
                      children:
                        p.status === "open"
                          ? s
                            ? "Open"
                            : "Aperta"
                          : s
                            ? "Closed"
                            : "Chiusa",
                    }),
                  ],
                }),
                d === p.id &&
                  e.jsxs("div", {
                    className: "visual-detail",
                    children: [
                      e.jsxs("small", {
                        children: [
                          s ? "REQUESTED" : "RICHIESTA",
                          " ",
                          Kd(p.requested),
                        ],
                      }),
                      e.jsx("p", { children: p.notes }),
                    ],
                  }),
              ],
            },
            p.id,
          ),
        ),
      }),
      !x &&
        e.jsx("p", {
          className: "hint accounting-note",
          children: s
            ? "Architect view: render requests are read-only."
            : "Vista Architect: le richieste render sono in sola lettura.",
        }),
    ],
  });
}
const Ji = [
  {
    id: "event-site-visit",
    kind: "event",
    title: "Visita collettiva al cantiere AR_137",
    titleEn: "Group visit to the AR_137 construction site",
    detail: "Mercoledì 14 ottobre · ore 10:00",
    detailEn: "Wednesday 14 October · 10:00",
    unread: !0,
  },
  {
    id: "party-autumn",
    kind: "party",
    title: "Festa di studio · Serata d’autunno",
    titleEn: "Studio party · Autumn evening",
    detail: "Venerdì 23 ottobre · Sala Lungarno",
    detailEn: "Friday 23 October · Sala Lungarno",
    unread: !0,
  },
  {
    id: "survey-site-visit",
    kind: "survey",
    title: "Sondaggio partecipazione evento",
    titleEn: "Event attendance survey",
    detail: "Parteciperai alla visita di gruppo a Milano?",
    detailEn: "Will you join the group visit in Milan?",
    unread: !0,
  },
];
function Yj() {
  const { close: t, language: n, viewer: viewer } = Y(),
    s = n === "en",
    [r, i] = C.useState(!1),
    notifications = [...parcelNotifications(viewer), ...Ji];
  return e.jsxs($t, {
    title: s ? "Notifications" : "Notifiche",
    onClose: t,
    children: [
      e.jsxs("div", {
        className: "notification-summary",
        children: [
          e.jsx("b", { children: notifications.filter((a) => a.unread).length }),
          e.jsx("span", {
            children: s
              ? "new studio updates"
              : "nuovi aggiornamenti dello studio",
          }),
        ],
      }),
      e.jsx("div", {
        className: "notification-list",
        children: notifications.map((a) =>
          e.jsxs(
            "article",
            {
              className: `notification-card ${a.kind}`,
              children: [
                e.jsx("span", {
                  className: "notification-type",
                  "aria-hidden": "true",
                  children:
                    a.kind === "parcel"
                      ? e.jsx(wt, {})
                      : a.kind === "survey"
                      ? e.jsx(mp, {})
                      : a.kind === "party"
                        ? e.jsx(va, {})
                        : e.jsx(Wt, {}),
                }),
                e.jsxs("div", {
                  children: [
                    e.jsx("small", {
                      children:
                        a.kind === "parcel"
                          ? s
                            ? "PARCEL"
                            : "PACCO IN RECEPTION"
                          : a.kind === "survey"
                          ? s
                            ? "SURVEY"
                            : "SONDAGGIO"
                          : a.kind === "party"
                            ? s
                              ? "STUDIO EVENT"
                              : "EVENTO STUDIO"
                            : s
                              ? "EVENT"
                              : "EVENTO",
                    }),
                    e.jsx("b", { children: s ? a.titleEn || a.title : a.title }),
                    e.jsx("p", { children: s ? a.detailEn || a.detail : a.detail }),
                    a.kind === "survey" &&
                      e.jsx("button", {
                        className: `notification-action${r ? " answered" : ""}`,
                        onClick: () => i(!0),
                        children: r
                          ? s
                            ? "Response recorded"
                            : "Risposta registrata"
                          : s
                            ? "Answer survey"
                            : "Rispondi al sondaggio",
                      }),
                  ],
                }),
                a.unread &&
                  e.jsx("i", {
                    className: "unread-dot",
                    "aria-label": s ? "Unread" : "Non letta",
                  }),
              ],
            },
            a.id,
          ),
        ),
      }),
    ],
  });
}
const Bp = [
    {
      id: "ERR-2041",
      severity: "critical",
      status: "open",
      title: "Errore durante il salvataggio della task",
      message:
        "Timeout simulato durante la sincronizzazione dei dati della task.",
      route: "/taskmanager",
      user: "Alessandro Botrini",
      device: "Chrome 155 · Windows 11",
      release: "0.10.10",
      occurrences: 3,
      lastSeen: "Oggi · 14:21",
      stack: "TaskEditor.save → demoAdapter.update → RequestTimeout",
    },
    {
      id: "ERR-2038",
      severity: "warning",
      status: "investigating",
      title: "Sincronizzazione calendario ritardata",
      message:
        "Il collegamento dimostrativo con Google Calendar ha superato il tempo previsto.",
      route: "/calendario",
      user: "Francesco Diamanti",
      device: "Safari 20 · macOS",
      release: "0.10.10",
      occurrences: 8,
      lastSeen: "Oggi · 12:48",
      stack: "CalendarSync.refresh → DemoConnector.pending",
    },
    {
      id: "ERR-2029",
      severity: "info",
      status: "resolved",
      title: "Anteprima PDF non disponibile",
      message:
        "Il documento dimostrativo non conteneva una miniatura utilizzabile.",
      route: "/cantiere",
      user: "Alessandro Botrini",
      device: "Chrome 155 · macOS",
      release: "0.10.9",
      occurrences: 2,
      lastSeen: "Ieri · 18:06",
      stack: "PlanViewer.preview → MissingThumbnail",
    },
    {
      id: "ERR-2017",
      severity: "warning",
      status: "resolved",
      title: "Widget Insight ripristinato",
      message:
        "Una configurazione locale non valida è stata sostituita con quella predefinita.",
      route: "/insight",
      user: "ARCHEA Property",
      device: "Edge 155 · Windows 11",
      release: "0.10.9",
      occurrences: 1,
      lastSeen: "14 ott · 09:34",
      stack: "WidgetLayout.restore → InvalidGridState",
    },
  ],
  Hp = [
    {
      id: "AUD-901",
      time: "Oggi · 14:32",
      actor: "Francesco Diamanti",
      action: "Ruolo modificato",
      target: "Alessandro Botrini",
      detail: "Senior Architect → Partner Architect",
      tone: "security",
    },
    {
      id: "AUD-900",
      time: "Oggi · 14:21",
      actor: "Sistema",
      action: "Errore registrato",
      target: "ERR-2041",
      detail: "Task Manager · salvataggio task",
      tone: "error",
    },
    {
      id: "AUD-899",
      time: "Oggi · 12:48",
      actor: "Sistema",
      action: "Sincronizzazione ritardata",
      target: "Google Calendar",
      detail: "Tentativo automatico programmato",
      tone: "warning",
    },
    {
      id: "AUD-898",
      time: "Oggi · 09:07",
      actor: "Francesco Diamanti",
      action: "Accesso master",
      target: "Developer Console",
      detail: "Chrome · Windows 11",
      tone: "security",
    },
    {
      id: "AUD-897",
      time: "Ieri · 18:22",
      actor: "Alessandro Botrini",
      action: "Task inviata in verifica",
      target: "P40 · Task 18",
      detail: "Notifica inviata al referente",
      tone: "normal",
    },
    {
      id: "AUD-896",
      time: "Ieri · 16:13",
      actor: "Francesco Diamanti",
      action: "Permesso aggiornato",
      target: "Senior Architect",
      detail: "Abilitata modifica Project Manager",
      tone: "security",
    },
    {
      id: "AUD-895",
      time: "14 ott · 11:42",
      actor: "ARCHEA Property",
      action: "Esportazione report",
      target: "Contabilità studi",
      detail: "Documento dimostrativo",
      tone: "normal",
    },
  ],
  qj = [
    {
      id: "app",
      name: "Applicazione web",
      detail: "Interfaccia e PWA",
      status: "operational",
      latency: "42 ms",
    },
    {
      id: "database",
      name: "Database demo",
      detail: "Archiviazione locale",
      status: "operational",
      latency: "18 ms",
    },
    {
      id: "auth",
      name: "Autenticazione",
      detail: "Account dimostrativi",
      status: "operational",
      latency: "31 ms",
    },
    {
      id: "drive",
      name: "Google Drive",
      detail: "Connettore non ancora attivo",
      status: "demo",
      latency: "—",
    },
    {
      id: "calendar",
      name: "Google Calendar",
      detail: "Connettore non ancora attivo",
      status: "demo",
      latency: "—",
    },
    {
      id: "monitoring",
      name: "Monitoraggio errori",
      detail: "Simulazione locale",
      status: "demo",
      latency: "—",
    },
  ],
  Gp = {
    architect: {
      label: "Architect",
      projects: !0,
      tasks: !0,
      hours: !0,
      site: !1,
      accounting: !1,
      people: !1,
      administration: !1,
    },
    senior_architect: {
      label: "Senior Architect",
      projects: !0,
      tasks: !0,
      hours: !0,
      site: !0,
      accounting: !0,
      people: !0,
      administration: !1,
    },
    partner_architect: {
      label: "Partner Architect",
      projects: !0,
      tasks: !0,
      hours: !0,
      site: !0,
      accounting: !0,
      people: !0,
      administration: !1,
    },
    property: {
      label: "Property",
      projects: !0,
      tasks: !1,
      hours: !1,
      site: !1,
      accounting: !0,
      people: !0,
      administration: !1,
    },
    reception: {
      label: "Reception",
      projects: !1,
      tasks: !0,
      hours: !1,
      site: !1,
      accounting: !1,
      people: !1,
      administration: !1,
    },
    platform_owner: {
      label: "Platform Owner",
      projects: !0,
      tasks: !0,
      hours: !0,
      site: !0,
      accounting: !0,
      people: !0,
      administration: !0,
    },
  },
  Zj = [
    {
      id: "supabase",
      label: "Connessione Supabase",
      detail: "Autenticazione e database reali",
      enabled: !1,
      locked: !0,
    },
    {
      id: "google",
      label: "Google Workspace",
      detail: "Drive e Calendar",
      enabled: !1,
      locked: !0,
    },
    {
      id: "monitoring",
      label: "Monitoraggio Sentry",
      detail: "Errori e crash in tempo reale",
      enabled: !1,
      locked: !0,
    },
    {
      id: "maintenance",
      label: "Modalità manutenzione",
      detail: "Blocca temporaneamente l’accesso agli utenti",
      enabled: !1,
    },
    {
      id: "beta",
      label: "Funzioni sperimentali",
      detail: "Mostra le funzioni in fase di prova",
      enabled: !0,
    },
  ],
  Xj = [
    {
      id: "fdiamanti",
      name: "Francesco Diamanti",
      email: "francesco.diamanti@archea.it",
      role: "partner_architect",
      technicalRole: "platform_owner",
      studio: "Firenze",
      status: "active",
      lastAccess: "Adesso",
      mfa: !0,
    },
    {
      id: "abotrini",
      name: "Alessandro Botrini",
      email: "alessandro.botrini@archea.it",
      role: "senior_architect",
      studio: "Firenze",
      status: "active",
      lastAccess: "Oggi · 14:12",
      mfa: !0,
    },
    {
      id: "lleyra",
      name: "Lisandro Leyra",
      email: "lisandro.leyra@archea.it",
      role: "architect",
      studio: "Milano",
      status: "active",
      lastAccess: "Oggi · 12:44",
      mfa: !1,
    },
    {
      id: "mmadaghiele",
      name: "Mirko Madaghiele",
      email: "mirko.madaghiele@archea.it",
      role: "architect",
      studio: "Firenze · Materioteca",
      status: "active",
      lastAccess: "Oggi · 13:26",
      mfa: !0,
    },
    {
      id: "property",
      name: "ARCHEA Property",
      email: "property@archea.it",
      role: "property",
      studio: "Tutti gli studi",
      status: "active",
      lastAccess: "Ieri · 18:31",
      mfa: !0,
    },
    {
      id: "alaurini",
      name: "Alessandra Laurini",
      email: "alessandra.laurini@archea.it",
      role: "reception",
      studio: "Firenze · Reception",
      status: "active",
      lastAccess: "Oggi · 08:42",
      mfa: !0,
    },
    {
      id: "mrossi",
      name: "Martina Rossi",
      email: "martina.rossi@archea.it",
      role: "architect",
      studio: "Roma",
      status: "active",
      lastAccess: "Ieri · 17:08",
      mfa: !1,
    },
    {
      id: "lbianchi",
      name: "Luca Bianchi",
      email: "luca.bianchi@archea.it",
      role: "senior_architect",
      studio: "Genova",
      status: "suspended",
      lastAccess: "11 ott · 09:20",
      mfa: !0,
    },
    {
      id: "csilva",
      name: "Carolina Silva",
      email: "carolina.silva@archea.it",
      role: "partner_architect",
      studio: "San Paolo",
      status: "invited",
      lastAccess: "Invito inviato",
      mfa: !1,
    },
  ],
  Qd = { ...Xt, platform_owner: "Platform Owner" },
  Jj = [
    ["overview", "Panoramica", io],
    ["errors", "Errori e crash", ro],
    ["users", "Utenti", Xn],
    ["permissions", "Ruoli e permessi", Os],
    ["audit", "Registro attività", ro],
    ["system", "Sistema", jp],
  ];
function ui(t, n) {
  const [s, r] = C.useState(() => {
    try {
      const i = localStorage.getItem(t);
      return i ? JSON.parse(i) : n;
    } catch {
      return n;
    }
  });
  return (
    C.useEffect(() => {
      try {
        localStorage.setItem(t, JSON.stringify(s));
      } catch {}
    }, [t, s]),
    [s, r]
  );
}
function ho({ title: t, subtitle: n, onClose: s, children: r }) {
  return (
    C.useEffect(() => {
      const i = (a) => a.key === "Escape" && s();
      return (
        document.addEventListener("keydown", i),
        () => document.removeEventListener("keydown", i)
      );
    }, [s]),
    lc.createPortal(
      e.jsx("div", {
        className: "dev-modal-layer",
        onClick: (i) => i.target === i.currentTarget && s(),
        children: e.jsxs("section", {
          className: "dev-modal",
          role: "dialog",
          "aria-modal": "true",
          "aria-label": t,
          children: [
            e.jsxs("header", {
              children: [
                e.jsxs("div", {
                  children: [
                    e.jsx("small", { children: "DEVELOPER CONSOLE" }),
                    e.jsx("h2", { children: t }),
                    n && e.jsx("p", { children: n }),
                  ],
                }),
                e.jsx("button", {
                  onClick: s,
                  "aria-label": "Chiudi",
                  children: e.jsx("span", {
                    "aria-hidden": "true",
                    children: "×",
                  }),
                }),
              ],
            }),
            e.jsx("div", { className: "dev-modal-body", children: r }),
          ],
        }),
      }),
      document.body,
    )
  );
}
function Ls({ title: t, subtitle: n, action: s }) {
  return e.jsxs("div", {
    className: "dev-heading",
    children: [
      e.jsxs("div", {
        children: [
          e.jsx("small", { children: "ARCHEA WORKSPACE · PLATFORM OWNER" }),
          e.jsx("h1", { children: t }),
          e.jsx("p", { children: n }),
        ],
      }),
      s,
    ],
  });
}
function hi({ label: t, value: n, note: s, tone: r = "", format: i }) {
  return e.jsxs("article", {
    className: `dev-stat ${r}`,
    children: [
      e.jsx("span", { children: t }),
      e.jsx("b", {
        children: e.jsx(pe, { value: n, duration: 1e3, format: i }),
      }),
      e.jsx("small", { children: s }),
    ],
  });
}
function Wp({ compact: t = !1 }) {
  return e.jsx("div", {
    className: `dev-services${t ? " compact" : ""}`,
    children: qj.map((n) =>
      e.jsxs(
        "article",
        {
          children: [
            e.jsx("i", { className: n.status }),
            e.jsxs("span", {
              children: [
                e.jsx("b", { children: n.name }),
                e.jsx("small", { children: n.detail }),
              ],
            }),
            e.jsx("em", {
              children: n.status === "operational" ? "Operativo" : "Demo",
            }),
            !t && e.jsx("strong", { children: n.latency }),
          ],
        },
        n.id,
      ),
    ),
  });
}
function ev({ users: t, errors: n, setSection: s }) {
  const r = n.filter((i) => i.status !== "resolved");
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(Ls, {
        title: "Controllo generale",
        subtitle:
          "Stato dell’applicazione, attività recenti e indicatori tecnici della versione demo.",
        action: e.jsxs("span", {
          className: "dev-live",
          children: [e.jsx("i", {}), "SISTEMA OPERATIVO"],
        }),
      }),
      e.jsxs("div", {
        className: "dev-stats",
        children: [
          e.jsx(hi, {
            label: "Utenti registrati",
            value: t.length,
            note: `${t.filter((i) => i.status === "active").length} account attivi`,
          }),
          e.jsx(hi, {
            label: "Errori aperti",
            value: r.length,
            note: "Nelle ultime 24 ore",
            tone: r.some((i) => i.severity === "critical") ? "alert" : "",
          }),
          e.jsx(hi, {
            label: "Sessioni demo",
            value: 4,
            note: "2 desktop · 2 mobile",
          }),
          e.jsx(hi, {
            label: "Disponibilità",
            value: 999,
            format: (i) =>
              `${(i / 10).toLocaleString("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`,
            note: "Ambiente dimostrativo",
            tone: "good",
          }),
        ],
      }),
      e.jsxs("div", {
        className: "dev-overview-grid",
        children: [
          e.jsxs("section", {
            className: "dev-panel dev-health",
            children: [
              e.jsxs("header", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "SERVIZI" }),
                      e.jsx("h2", { children: "Stato del sistema" }),
                    ],
                  }),
                  e.jsx("button", {
                    onClick: () => s("system"),
                    children: "Apri sistema",
                  }),
                ],
              }),
              e.jsx(Wp, { compact: !0 }),
            ],
          }),
          e.jsxs("section", {
            className: "dev-panel",
            children: [
              e.jsxs("header", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "MONITORAGGIO" }),
                      e.jsx("h2", { children: "Errori recenti" }),
                    ],
                  }),
                  e.jsx("button", {
                    onClick: () => s("errors"),
                    children: "Vedi tutti",
                  }),
                ],
              }),
              e.jsx("div", {
                className: "dev-error-compact",
                children: n
                  .slice(0, 3)
                  .map((i) =>
                    e.jsxs(
                      "button",
                      {
                        onClick: () => s("errors"),
                        children: [
                          e.jsx("i", { className: i.severity }),
                          e.jsxs("span", {
                            children: [
                              e.jsx("b", { children: i.title }),
                              e.jsxs("small", {
                                children: [i.route, " · ", i.lastSeen],
                              }),
                            ],
                          }),
                          e.jsxs("em", { children: [i.occurrences, "×"] }),
                        ],
                      },
                      i.id,
                    ),
                  ),
              }),
            ],
          }),
          e.jsxs("section", {
            className: "dev-panel dev-audit-preview",
            children: [
              e.jsxs("header", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "SICUREZZA" }),
                      e.jsx("h2", { children: "Ultime operazioni" }),
                    ],
                  }),
                  e.jsx("button", {
                    onClick: () => s("audit"),
                    children: "Registro completo",
                  }),
                ],
              }),
              e.jsx("div", {
                children: Hp.slice(0, 5).map((i) =>
                  e.jsxs(
                    "article",
                    {
                      children: [
                        e.jsx("i", { className: i.tone }),
                        e.jsxs("span", {
                          children: [
                            e.jsx("b", { children: i.action }),
                            e.jsxs("small", {
                              children: [i.actor, " · ", i.target],
                            }),
                          ],
                        }),
                        e.jsx("time", { children: i.time }),
                      ],
                    },
                    i.id,
                  ),
                ),
              }),
            ],
          }),
          e.jsxs("section", {
            className: "dev-panel dev-release",
            children: [
              e.jsx("header", {
                children: e.jsxs("div", {
                  children: [
                    e.jsx("small", { children: "RELEASE" }),
                    e.jsx("h2", { children: "Versione in uso" }),
                  ],
                }),
              }),
              e.jsxs("div", {
                children: [
                  e.jsxs("strong", { children: ["v", xa] }),
                  e.jsxs("span", {
                    children: [
                      e.jsx("b", { children: "Ambiente demo locale" }),
                      e.jsx("small", {
                        children:
                          "Nessun dato reale o servizio esterno collegato",
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs("footer", {
                children: [
                  e.jsx("span", { children: "Ultimo deploy simulato" }),
                  e.jsx("b", { children: "Oggi · 13:58" }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function tv({ errors: t, setErrors: n }) {
  const [s, r] = C.useState("all"),
    [i, a] = C.useState(null),
    l = t.filter(
      (c) =>
        s === "all" ||
        (s === "open" ? c.status !== "resolved" : c.severity === s),
    ),
    o = (c, d) =>
      n((u) => u.map((m) => (m.id === c ? { ...m, status: d } : m)));
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(Ls, {
        title: "Errori e crash",
        subtitle:
          "Eventi tecnici simulati raccolti dall’app, ordinati per gravità e frequenza.",
        action: e.jsx("button", {
          className: "dev-primary",
          onClick: () => n(Bp),
          children: "Ripristina dati demo",
        }),
      }),
      e.jsxs("div", {
        className: "dev-filterbar",
        children: [
          e.jsx("div", {
            children: [
              ["all", "Tutti"],
              ["open", "Aperti"],
              ["critical", "Critici"],
              ["warning", "Avvisi"],
            ].map(([c, d]) =>
              e.jsxs(
                "button",
                {
                  className: s === c ? "on" : "",
                  onClick: () => r(c),
                  children: [
                    d,
                    e.jsx("span", {
                      children:
                        c === "all"
                          ? t.length
                          : c === "open"
                            ? t.filter((u) => u.status !== "resolved").length
                            : t.filter((u) => u.severity === c).length,
                    }),
                  ],
                },
                c,
              ),
            ),
          }),
          e.jsx("span", { children: "ULTIMO CONTROLLO · ADESSO" }),
        ],
      }),
      e.jsx("section", {
        className: "dev-panel dev-table-panel",
        children: e.jsxs("table", {
          className: "dev-table",
          children: [
            e.jsx("thead", {
              children: e.jsxs("tr", {
                children: [
                  e.jsx("th", { children: "Gravità" }),
                  e.jsx("th", { children: "Errore" }),
                  e.jsx("th", { children: "Percorso" }),
                  e.jsx("th", { children: "Utente" }),
                  e.jsx("th", { children: "Eventi" }),
                  e.jsx("th", { children: "Ultima volta" }),
                  e.jsx("th", { children: "Stato" }),
                ],
              }),
            }),
            e.jsx("tbody", {
              children: l.map((c) =>
                e.jsxs(
                  "tr",
                  {
                    onClick: () => a(c),
                    children: [
                      e.jsx("td", {
                        children: e.jsx("span", {
                          className: `dev-severity ${c.severity}`,
                          children:
                            c.severity === "critical"
                              ? "Critico"
                              : c.severity === "warning"
                                ? "Avviso"
                                : "Info",
                        }),
                      }),
                      e.jsxs("td", {
                        children: [
                          e.jsx("b", { children: c.title }),
                          e.jsxs("small", {
                            children: [c.id, " · release ", c.release],
                          }),
                        ],
                      }),
                      e.jsx("td", { children: c.route }),
                      e.jsx("td", { children: c.user }),
                      e.jsx("td", {
                        children: e.jsx("strong", { children: c.occurrences }),
                      }),
                      e.jsx("td", { children: c.lastSeen }),
                      e.jsx("td", {
                        children: e.jsx("span", {
                          className: `dev-status ${c.status}`,
                          children:
                            c.status === "resolved"
                              ? "Risolto"
                              : c.status === "investigating"
                                ? "In analisi"
                                : "Aperto",
                        }),
                      }),
                    ],
                  },
                  c.id,
                ),
              ),
            }),
          ],
        }),
      }),
      i &&
        e.jsx(ho, {
          title: i.title,
          subtitle: `${i.id} · ${i.route}`,
          onClose: () => a(null),
          children: e.jsxs("div", {
            className: "dev-error-detail",
            children: [
              e.jsxs("div", {
                className: "dev-detail-grid",
                children: [
                  e.jsxs("article", {
                    children: [
                      e.jsx("small", { children: "GRAVITÀ" }),
                      e.jsx("span", {
                        className: `dev-severity ${i.severity}`,
                        children: i.severity,
                      }),
                    ],
                  }),
                  e.jsxs("article", {
                    children: [
                      e.jsx("small", { children: "OCCORRENZE" }),
                      e.jsx("b", { children: i.occurrences }),
                    ],
                  }),
                  e.jsxs("article", {
                    children: [
                      e.jsx("small", { children: "UTENTE" }),
                      e.jsx("b", { children: i.user }),
                    ],
                  }),
                  e.jsxs("article", {
                    children: [
                      e.jsx("small", { children: "DISPOSITIVO" }),
                      e.jsx("b", { children: i.device }),
                    ],
                  }),
                ],
              }),
              e.jsxs("article", {
                children: [
                  e.jsx("small", { children: "DESCRIZIONE" }),
                  e.jsx("p", { children: i.message }),
                ],
              }),
              e.jsxs("article", {
                className: "code",
                children: [
                  e.jsx("small", { children: "DETTAGLIO TECNICO" }),
                  e.jsx("code", { children: i.stack }),
                ],
              }),
              e.jsxs("div", {
                className: "dev-modal-actions",
                children: [
                  e.jsx("button", {
                    onClick: () => {
                      o(i.id, "investigating"),
                        a({ ...i, status: "investigating" });
                    },
                    children: "Segna in analisi",
                  }),
                  e.jsx("button", {
                    className: "dev-primary",
                    onClick: () => {
                      o(i.id, "resolved"), a(null);
                    },
                    children: "Segna come risolto",
                  }),
                ],
              }),
            ],
          }),
        }),
    ],
  });
}
function nv({ users: t, setUsers: n }) {
  const [s, r] = C.useState(""),
    [i, a] = C.useState(null),
    [l, o] = C.useState(!1),
    [c, d] = C.useState({
      name: "",
      email: "",
      role: "architect",
      studio: "Firenze",
    }),
    u = t.filter((j) =>
      `${j.name} ${j.email} ${j.studio} ${Qd[j.role]}`
        .toLowerCase()
        .includes(s.toLowerCase()),
    ),
    m = (j) => {
      n((f) => f.map((g) => (g.id === j.id ? j : g))), a(null);
    },
    x = (j) => {
      j.preventDefault(),
        !(!c.name.trim() || !c.email.trim()) &&
          (n((f) => [
            ...f,
            {
              ...c,
              id: `demo-${Date.now()}`,
              status: "active",
              lastAccess: "Account appena creato",
              mfa: !1,
            },
          ]),
          d({ name: "", email: "", role: "architect", studio: "Firenze" }),
          o(!1));
    },
    removeUser = (j) => {
      if (j.technicalRole) return;
      n((f) => f.filter((g) => g.id !== j.id));
      a(null);
    };
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(Ls, {
        title: "Utenti",
        subtitle:
          "Account, ruoli, studi e stato degli accessi all’applicazione.",
        action: e.jsx("button", {
          className: "dev-primary",
          onClick: () => o(!0),
          children: "+ Aggiungi utente",
        }),
      }),
      e.jsxs("div", {
        className: "dev-user-tools",
        children: [
          e.jsxs("label", {
            children: [
              e.jsx("span", { children: "⌕" }),
              e.jsx("input", {
                value: s,
                onChange: (j) => r(j.target.value),
                placeholder: "Cerca nome, email, studio o ruolo",
              }),
            ],
          }),
          e.jsxs("div", {
            children: [
              e.jsxs("span", {
                children: [
                  e.jsx("i", { className: "active" }),
                  t.filter((j) => j.status === "active").length,
                  " attivi",
                ],
              }),
              e.jsxs("span", {
                children: [
                  e.jsx("i", { className: "suspended" }),
                  t.filter((j) => j.status === "suspended").length,
                  " sospesi",
                ],
              }),
            ],
          }),
        ],
      }),
      e.jsx("section", {
        className: "dev-panel dev-table-panel",
        children: e.jsxs("table", {
          className: "dev-table dev-users-table",
          children: [
            e.jsx("thead", {
              children: e.jsxs("tr", {
                children: [
                  e.jsx("th", { children: "Utente" }),
                  e.jsx("th", { children: "Ruolo" }),
                  e.jsx("th", { children: "Studio" }),
                  e.jsx("th", { children: "Ultimo accesso" }),
                  e.jsx("th", { children: "MFA" }),
                  e.jsx("th", { children: "Stato" }),
                ],
              }),
            }),
            e.jsx("tbody", {
              children: u.map((j) =>
                e.jsxs(
                  "tr",
                  {
                    onClick: () => a({ ...j }),
                    children: [
                      e.jsx("td", {
                        children: e.jsxs("div", {
                          className: "dev-user-cell",
                          children: [
                            e.jsx("i", {
                              children: j.name
                                .split(/\s+/)
                                .map((f) => f[0])
                                .slice(0, 2)
                                .join(""),
                            }),
                            e.jsxs("span", {
                              children: [
                                e.jsx("b", { children: j.name }),
                                e.jsx("small", { children: j.email }),
                              ],
                            }),
                            j.technicalRole &&
                              e.jsx("em", { children: "MASTER" }),
                          ],
                        }),
                      }),
                      e.jsx("td", { children: Qd[j.technicalRole || j.role] }),
                      e.jsx("td", { children: j.studio }),
                      e.jsx("td", { children: j.lastAccess }),
                      e.jsx("td", {
                        children: e.jsx("span", {
                          className: `dev-mfa ${j.mfa ? "on" : ""}`,
                          children: j.mfa ? "Attiva" : "Non attiva",
                        }),
                      }),
                      e.jsx("td", {
                        children: e.jsx("span", {
                          className: `dev-status ${j.status}`,
                          children:
                            j.status === "active"
                              ? "Attivo"
                              : j.status === "suspended"
                                ? "Sospeso"
                                : "Invitato",
                        }),
                      }),
                    ],
                  },
                  j.id,
                ),
              ),
            }),
          ],
        }),
      }),
      i &&
        e.jsx(ho, {
          title: i.name,
          subtitle: i.email,
          onClose: () => a(null),
          children: e.jsxs("div", {
            className: "dev-user-editor",
            children: [
              e.jsx("div", {
                className: "dev-master-note",
                children: i.technicalRole
                  ? e.jsxs(e.Fragment, {
                      children: [
                        e.jsx(Os, {}),
                        e.jsxs("span", {
                          children: [
                            e.jsx("b", { children: "Platform Owner" }),
                            e.jsx("small", {
                              children:
                                "L’ultimo account master non può essere eliminato o declassato.",
                            }),
                          ],
                        }),
                      ],
                    })
                  : e.jsxs(e.Fragment, {
                      children: [
                        e.jsx(Xn, {}),
                        e.jsxs("span", {
                          children: [
                            e.jsx("b", { children: "Account aziendale" }),
                            e.jsx("small", {
                              children:
                                "Le modifiche sono simulate e restano salvate su questo browser.",
                            }),
                          ],
                        }),
                      ],
                    }),
              }),
              e.jsxs("div", {
                className: "dev-form-grid",
                children: [
                  e.jsxs("label", {
                    children: [
                      "Ruolo",
                      e.jsx("select", {
                        disabled: !!i.technicalRole,
                        value: i.role,
                        onChange: (j) => a({ ...i, role: j.target.value }),
                        children: Object.entries(Xt).map(([j, f]) =>
                          e.jsx("option", { value: j, children: f }, j),
                        ),
                      }),
                    ],
                  }),
                  e.jsxs("label", {
                    children: [
                      "Studio",
                      e.jsx("input", {
                        value: i.studio,
                        onChange: (j) => a({ ...i, studio: j.target.value }),
                      }),
                    ],
                  }),
                  e.jsxs("label", {
                    children: [
                      "Stato",
                      e.jsxs("select", {
                        disabled: !!i.technicalRole,
                        value: i.status,
                        onChange: (j) => a({ ...i, status: j.target.value }),
                        children: [
                          e.jsx("option", {
                            value: "active",
                            children: "Attivo",
                          }),
                          e.jsx("option", {
                            value: "suspended",
                            children: "Sospeso",
                          }),
                          e.jsx("option", {
                            value: "invited",
                            children: "Invitato",
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs("label", {
                    children: [
                      "Autenticazione MFA",
                      e.jsxs("select", {
                        value: i.mfa ? "yes" : "no",
                        onChange: (j) =>
                          a({ ...i, mfa: j.target.value === "yes" }),
                        children: [
                          e.jsx("option", { value: "yes", children: "Attiva" }),
                          e.jsx("option", {
                            value: "no",
                            children: "Non attiva",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "dev-modal-actions",
                children: [
                  !i.technicalRole &&
                    e.jsx("button", {
                      className: "dev-remove-user",
                      onClick: () => removeUser(i),
                      children: "Rimuovi utente",
                    }),
                  e.jsx("button", {
                    onClick: () => a(null),
                    children: "Annulla",
                  }),
                  e.jsx("button", {
                    className: "dev-primary",
                    onClick: () => m(i),
                    children: "Salva modifiche",
                  }),
                ],
              }),
            ],
          }),
        }),
      l &&
        e.jsx(ho, {
          title: "Aggiungi nuovo utente",
          subtitle: "Crea un account dimostrativo e assegna il ruolo iniziale",
          onClose: () => o(!1),
          children: e.jsxs("form", {
            className: "dev-user-editor",
            onSubmit: x,
            children: [
              e.jsxs("div", {
                className: "dev-form-grid",
                children: [
                  e.jsxs("label", {
                    children: [
                      "Nome e cognome",
                      e.jsx("input", {
                        autoFocus: !0,
                        value: c.name,
                        onChange: (j) => d({ ...c, name: j.target.value }),
                      }),
                    ],
                  }),
                  e.jsxs("label", {
                    children: [
                      "Email aziendale",
                      e.jsx("input", {
                        type: "email",
                        value: c.email,
                        onChange: (j) => d({ ...c, email: j.target.value }),
                      }),
                    ],
                  }),
                  e.jsxs("label", {
                    children: [
                      "Ruolo",
                      e.jsx("select", {
                        value: c.role,
                        onChange: (j) => d({ ...c, role: j.target.value }),
                        children: Object.entries(Xt).map(([j, f]) =>
                          e.jsx("option", { value: j, children: f }, j),
                        ),
                      }),
                    ],
                  }),
                  e.jsxs("label", {
                    children: [
                      "Studio",
                      e.jsx("input", {
                        value: c.studio,
                        onChange: (j) => d({ ...c, studio: j.target.value }),
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "dev-modal-actions",
                children: [
                  e.jsx("button", {
                    type: "button",
                    onClick: () => o(!1),
                    children: "Annulla",
                  }),
                  e.jsx("button", {
                    className: "dev-primary",
                    type: "submit",
                    children: "Aggiungi utente demo",
                  }),
                ],
              }),
            ],
          }),
        }),
    ],
  });
}
function sv({ permissions: t, setPermissions: n }) {
  const s = {
      projects: "Progetti",
      tasks: "Task",
      hours: "Ore",
      site: "Cantiere",
      accounting: "Contabilità",
      people: "Organico",
      administration: "Amministrazione",
    },
    r = (i, a) => {
      i !== "platform_owner" &&
        n((l) => ({ ...l, [i]: { ...l[i], [a]: !l[i][a] } }));
    };
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(Ls, {
        title: "Ruoli e permessi",
        subtitle:
          "Matrice dimostrativa delle sezioni accessibili per ciascun livello aziendale.",
        action: e.jsx("button", {
          className: "dev-primary",
          onClick: () => n(Gp),
          children: "Ripristina gerarchie",
        }),
      }),
      e.jsxs("section", {
        className: "dev-panel dev-permissions",
        children: [
          e.jsxs("header", {
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("small", { children: "CONTROLLO ACCESSI" }),
                  e.jsx("h2", { children: "Permessi per ruolo" }),
                ],
              }),
              e.jsx("span", {
                children: "Le modifiche hanno effetto solo nella demo",
              }),
            ],
          }),
          e.jsxs("div", {
            className: "dev-permission-grid",
            children: [
              e.jsxs("div", {
                className: "head",
                children: [
                  e.jsx("b", { children: "Ruolo" }),
                  Object.values(s).map((i) => e.jsx("b", { children: i }, i)),
                ],
              }),
              Object.entries(t).map(([i, a]) =>
                e.jsxs(
                  "div",
                  {
                    className: i === "platform_owner" ? "master" : "",
                    children: [
                      e.jsxs("span", {
                        children: [
                          e.jsx("b", { children: a.label }),
                          e.jsx("small", {
                            children:
                              i === "platform_owner"
                                ? "Accesso tecnico completo"
                                : "Ruolo aziendale",
                          }),
                        ],
                      }),
                      Object.keys(s).map((l) =>
                        e.jsx(
                          "button",
                          {
                            disabled: i === "platform_owner",
                            className: a[l] ? "on" : "",
                            onClick: () => r(i, l),
                            "aria-label": `${s[l]} ${a.label}`,
                            children: e.jsx("i", { children: a[l] ? "✓" : "" }),
                          },
                          l,
                        ),
                      ),
                    ],
                  },
                  i,
                ),
              ),
            ],
          }),
        ],
      }),
      e.jsxs("div", {
        className: "dev-security-callout",
        children: [
          e.jsx(Os, {}),
          e.jsxs("div", {
            children: [
              e.jsx("b", {
                children: "Protezione prevista per la versione reale",
              }),
              e.jsx("p", {
                children:
                  "I pulsanti verranno collegati a Supabase Row Level Security. Nascondere una sezione nell’interfaccia non sarà sufficiente: ogni richiesta verrà verificata anche dal database.",
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function rv() {
  const [t, n] = C.useState(""),
    s = Hp.filter((r) =>
      `${r.actor} ${r.action} ${r.target} ${r.detail}`
        .toLowerCase()
        .includes(t.toLowerCase()),
    );
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(Ls, {
        title: "Registro attività",
        subtitle:
          "Storico delle operazioni amministrative, modifiche sensibili e attività di sicurezza.",
        action: e.jsx("button", {
          className: "dev-primary",
          onClick: () =>
            window.alert(
              "Esportazione demo completata. Nessun file reale è stato generato.",
            ),
          children: "Esporta registro",
        }),
      }),
      e.jsxs("div", {
        className: "dev-user-tools",
        children: [
          e.jsxs("label", {
            children: [
              e.jsx("span", { children: "⌕" }),
              e.jsx("input", {
                value: t,
                onChange: (r) => n(r.target.value),
                placeholder: "Cerca nel registro attività",
              }),
            ],
          }),
          e.jsx("div", {
            children: e.jsx("span", {
              children: "CONSERVAZIONE DEMO · 30 GIORNI",
            }),
          }),
        ],
      }),
      e.jsx("section", {
        className: "dev-panel dev-audit-list",
        children: s.map((r) =>
          e.jsxs(
            "article",
            {
              children: [
                e.jsx("i", { className: r.tone }),
                e.jsx("time", { children: r.time }),
                e.jsxs("span", {
                  children: [
                    e.jsx("b", { children: r.action }),
                    e.jsx("small", { children: r.actor }),
                  ],
                }),
                e.jsx("strong", { children: r.target }),
                e.jsx("p", { children: r.detail }),
                e.jsx("em", { children: r.id }),
              ],
            },
            r.id,
          ),
        ),
      }),
    ],
  });
}
function iv({ flags: t, setFlags: n }) {
  const s = (r) =>
    n((i) =>
      i.map((a) =>
        a.id === r && !a.locked ? { ...a, enabled: !a.enabled } : a,
      ),
    );
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(Ls, {
        title: "Sistema",
        subtitle:
          "Servizi, integrazioni, configurazione della demo e funzioni sperimentali.",
        action: e.jsxs("span", {
          className: "dev-live",
          children: [e.jsx("i", {}), "DEMO LOCALE"],
        }),
      }),
      e.jsxs("div", {
        className: "dev-system-grid",
        children: [
          e.jsxs("section", {
            className: "dev-panel",
            children: [
              e.jsx("header", {
                children: e.jsxs("div", {
                  children: [
                    e.jsx("small", { children: "INFRASTRUTTURA" }),
                    e.jsx("h2", { children: "Servizi e connessioni" }),
                  ],
                }),
              }),
              e.jsx(Wp, {}),
            ],
          }),
          e.jsxs("section", {
            className: "dev-panel",
            children: [
              e.jsx("header", {
                children: e.jsxs("div", {
                  children: [
                    e.jsx("small", { children: "CONFIGURAZIONE" }),
                    e.jsx("h2", { children: "Funzioni e ambiente" }),
                  ],
                }),
              }),
              e.jsx("div", {
                className: "dev-flags",
                children: t.map((r) =>
                  e.jsxs(
                    "article",
                    {
                      children: [
                        e.jsxs("span", {
                          children: [
                            e.jsx("b", { children: r.label }),
                            e.jsx("small", { children: r.detail }),
                          ],
                        }),
                        r.locked
                          ? e.jsx("em", { children: "NON COLLEGATO" })
                          : e.jsx("button", {
                              className: r.enabled ? "on" : "",
                              onClick: () => s(r.id),
                              children: e.jsx("i", {}),
                            }),
                      ],
                    },
                    r.id,
                  ),
                ),
              }),
            ],
          }),
          e.jsxs("section", {
            className: "dev-panel dev-system-info",
            children: [
              e.jsx("header", {
                children: e.jsxs("div", {
                  children: [
                    e.jsx("small", { children: "APPLICAZIONE" }),
                    e.jsx("h2", { children: "Informazioni tecniche" }),
                  ],
                }),
              }),
              e.jsxs("dl", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("dt", { children: "Versione" }),
                      e.jsx("dd", { children: xa }),
                    ],
                  }),
                  e.jsxs("div", {
                    children: [
                      e.jsx("dt", { children: "Ambiente" }),
                      e.jsx("dd", { children: "Demo locale" }),
                    ],
                  }),
                  e.jsxs("div", {
                    children: [
                      e.jsx("dt", { children: "Database" }),
                      e.jsx("dd", { children: "Browser Local Storage" }),
                    ],
                  }),
                  e.jsxs("div", {
                    children: [
                      e.jsx("dt", { children: "Backend" }),
                      e.jsx("dd", { children: "Non collegato" }),
                    ],
                  }),
                  e.jsxs("div", {
                    children: [
                      e.jsx("dt", { children: "Ultimo aggiornamento" }),
                      e.jsx("dd", { children: "Oggi · 13:58" }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          e.jsxs("section", {
            className: "dev-panel dev-danger",
            children: [
              e.jsx("header", {
                children: e.jsxs("div", {
                  children: [
                    e.jsx("small", { children: "STRUMENTI MASTER" }),
                    e.jsx("h2", { children: "Operazioni di sistema" }),
                  ],
                }),
              }),
              e.jsxs("button", {
                onClick: () => window.location.reload(),
                children: [
                  e.jsxs("span", {
                    children: [
                      e.jsx("b", { children: "Riavvia interfaccia" }),
                      e.jsx("small", {
                        children:
                          "Ricarica l’applicazione senza cancellare i dati demo",
                      }),
                    ],
                  }),
                  "↻",
                ],
              }),
              e.jsxs("button", {
                onClick: () =>
                  window.alert(
                    "Controllo demo completato: nessuna anomalia bloccante rilevata.",
                  ),
                children: [
                  e.jsxs("span", {
                    children: [
                      e.jsx("b", { children: "Esegui controllo diagnostico" }),
                      e.jsx("small", {
                        children:
                          "Verifica configurazione, cache e dati locali",
                      }),
                    ],
                  }),
                  "›",
                ],
              }),
              e.jsxs("button", {
                className: "danger",
                onClick: () =>
                  window.alert(
                    "Funzione disabilitata nella demo per evitare cancellazioni involontarie.",
                  ),
                children: [
                  e.jsxs("span", {
                    children: [
                      e.jsx("b", { children: "Ripristina tutti i dati demo" }),
                      e.jsx("small", {
                        children:
                          "Operazione protetta e non attiva in questa versione",
                      }),
                    ],
                  }),
                  "×",
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function av() {
  const { viewer: t } = Y(),
    [n, s] = C.useState("overview"),
    [r, i] = ui("archea-developer-users", Xj),
    [a, l] = ui("archea-developer-errors", Bp),
    [o, c] = ui("archea-developer-permissions", Gp),
    [d, u] = ui("archea-developer-flags", Zj);
  if (!(t != null && t.isDeveloper))
    return e.jsxs("div", {
      className: "dev-denied",
      children: [
        e.jsx(Os, {}),
        e.jsx("h1", { children: "Accesso non autorizzato" }),
        e.jsx("p", {
          children: "Questa sezione è riservata al Platform Owner.",
        }),
      ],
    });
  const m =
    n === "overview"
      ? e.jsx(ev, { users: r, errors: a, setSection: s })
      : n === "errors"
        ? e.jsx(tv, { errors: a, setErrors: l })
        : n === "users"
          ? e.jsx(nv, { users: r, setUsers: i })
          : n === "permissions"
            ? e.jsx(sv, { permissions: o, setPermissions: c })
            : n === "audit"
              ? e.jsx(rv, {})
              : e.jsx(iv, { flags: d, setFlags: u });
  return e.jsxs("div", {
    className: "dev-console",
    children: [
      e.jsxs("aside", {
        children: [
          e.jsxs("div", {
            className: "dev-console-title",
            children: [
              e.jsx("span", { children: e.jsx(Os, {}) }),
              e.jsxs("div", {
                children: [
                  e.jsx("small", { children: "AREA RISERVATA" }),
                  e.jsx("b", { children: "Developer Console" }),
                ],
              }),
            ],
          }),
          e.jsx("nav", {
            children: Jj.map(([x, j, f]) =>
              e.jsxs(
                "button",
                {
                  className: n === x ? "on" : "",
                  onClick: () => s(x),
                  children: [
                    e.jsx(f, {}),
                    e.jsx("span", { children: j }),
                    x === "errors" &&
                      e.jsx("i", {
                        children: a.filter((g) => g.status !== "resolved")
                          .length,
                      }),
                  ],
                },
                x,
              ),
            ),
          }),
          e.jsxs("div", {
            className: "dev-owner",
            children: [
              e.jsx("i", { children: "FD" }),
              e.jsxs("span", {
                children: [
                  e.jsx("b", { children: "Francesco Diamanti" }),
                  e.jsx("small", { children: "Platform Owner · MFA attiva" }),
                ],
              }),
            ],
          }),
        ],
      }),
      e.jsx("main", { className: "dev-console-content", children: m }, n),
    ],
  });
}
const en = (t) => `${t}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  Lt = (t) =>
    t
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
function ke(t, n) {
  const [s, r] = C.useState(() => {
    try {
      const i = localStorage.getItem(t);
      return i ? JSON.parse(i) : n;
    } catch {
      return n;
    }
  });
  return (
    C.useEffect(() => {
      try {
        localStorage.setItem(t, JSON.stringify(s));
      } catch {}
    }, [t, s]),
    [s, r]
  );
}
function lv(t) {
  C.useEffect(() => {
    const n = Math.min(1.35, Math.max(0.8, Number(t) || 1)),
      s = (a) =>
        !(a instanceof HTMLElement) ||
        ["SCRIPT", "STYLE", "SVG", "PATH"].includes(a.tagName)
          ? !1
          : ["INPUT", "TEXTAREA", "SELECT", "OPTION"].includes(a.tagName)
            ? !0
            : [...a.childNodes].some(
                (l) => l.nodeType === Node.TEXT_NODE && l.textContent.trim(),
              ),
      r = (a) => {
        const l = [];
        a instanceof HTMLElement &&
          a.matches(
            ".desktop-app *, .desk-modal-layer *, .dev-modal-layer *",
          ) &&
          l.push(a),
          a.querySelectorAll &&
            l.push(
              ...a.querySelectorAll(
                ".desktop-app *, .desk-modal-layer *, .dev-modal-layer *",
              ),
            ),
          l.forEach((o) => {
            if (!s(o)) return;
            if (!o.dataset.archeaBaseFontSize) {
              const d = window.getComputedStyle(o),
                u = Number.parseFloat(d.fontSize),
                m = Number.parseFloat(d.lineHeight);
              Number.isFinite(u) && (o.dataset.archeaBaseFontSize = String(u)),
                Number.isFinite(m) &&
                  (o.dataset.archeaBaseLineHeight = String(m));
            }
            const c = Number(o.dataset.archeaBaseFontSize),
              d = Number(o.dataset.archeaBaseLineHeight);
            Number.isFinite(c) &&
              (o.style.fontSize = `${Math.round(c * n * 100) / 100}px`),
              Number.isFinite(d) && (o.style.lineHeight = `${d}px`);
          });
      };
    r(document.body);
    const i = new MutationObserver((a) =>
      a.forEach((l) =>
        l.addedNodes.forEach((o) => o.nodeType === Node.ELEMENT_NODE && r(o)),
      ),
    );
    return (
      i.observe(document.body, { childList: !0, subtree: !0 }),
      () => i.disconnect()
    );
  }, [t]);
}
function Fs(t, n) {
  const [s, r] = ke(t, n),
    i = C.useRef(null);
  return (
    C.useEffect(() => {
      r((l) => [
        ...l.filter((o) => n.includes(o)),
        ...n.filter((o) => !l.includes(o)),
      ]);
    }, [t]),
    {
      itemProps: (l) => ({
        draggable: !0,
        style: { order: Math.max(0, s.indexOf(l)) },
        onDragStart: (o) => {
          (i.current = l), (o.dataTransfer.effectAllowed = "move");
        },
        onDragOver: (o) => {
          o.preventDefault(), (o.dataTransfer.dropEffect = "move");
        },
        onDrop: (o) => {
          o.preventDefault();
          const c = i.current;
          !c ||
            c === l ||
            (r((d) => {
              const u = d.filter((m) => m !== c);
              return u.splice(u.indexOf(l), 0, c), u;
            }),
            (i.current = null));
        },
      }),
      reset: () => r(n),
    }
  );
}
function cn(t) {
  return (
    {
      in_lavorazione: "In lavorazione",
      in_scadenza: "In scadenza",
      scaduta: "Scaduta",
      da_rivedere: "Da rivedere",
      in_verifica: "In verifica",
      validata: "Validata",
    }[t] || t
  );
}
function He(t, n) {
  var s;
  return t.validated && t.completed && t.dataChiusura
    ? "validata"
    : t.completed && !t.validated
      ? "in_verifica"
      : t.notValidated || ((s = t.commenti) != null && s.trim())
        ? "da_rivedere"
        : Ce(t, n);
}
function Yd(t, n) {
  const s = String(n || "TASK").toUpperCase(),
    r = t.reduce((i, a) => {
      if (String(a.progettoCodice || "").toUpperCase() !== s) return i;
      const l = String(a.numero || "").match(/(\d+)(?!.*\d)/);
      return Math.max(i, l ? Number(l[1]) : 0);
    }, 0);
  return `${s}-${String(r + 1).padStart(3, "0")}`;
}
function dl(t) {
  var r;
  const n = String(t.numero || "").trim();
  if (!n) return `${t.progettoCodice || "TASK"}-—`;
  if (
    n
      .toUpperCase()
      .startsWith(`${String(t.progettoCodice || "").toUpperCase()}-`)
  )
    return n;
  const s = (r = n.match(/^\d+$/)) == null ? void 0 : r[0];
  return s ? `${t.progettoCodice || "TASK"}-${s.padStart(3, "0")}` : n;
}
const Bn = (t) => (/partner/i.test(t) ? 0 : /senior/i.test(t) ? 1 : 2),
  ov = (t) =>
    /partner/i.test(t) ? "partner" : /senior/i.test(t) ? "senior" : "architect",
  rr = (t, n) =>
    t
      .filter((s) => s.progettoCodice === n)
      .reduce((s, r) => s + Number(r.ore || 0), 0);
function cv(t) {
  return (
    Rr(t)
      .flatMap((s) => s.members)
      .map((s) => Pe[s])
      .filter(Boolean)
      .sort((s, r) => Bn(s.role) - Bn(r.role))
      .find((s) => Bn(s.role) < 2) || Pe.fdiamanti
  );
}
function ae({
  eyebrow: t = "ARCHEA WORKSPACE",
  title: n,
  subtitle: s,
  action: r,
}) {
  return e.jsxs("div", {
    className: "desk-heading",
    children: [
      e.jsxs("div", {
        children: [
          e.jsx("small", { children: t }),
          e.jsx("h1", { children: n }),
          s && e.jsx("p", { children: s }),
        ],
      }),
      r,
    ],
  });
}
function ee({ value: t }) {
  if (typeof t == "number") return e.jsx(pe, { value: t, duration: 1500 });
  const n = String(t ?? "");
  if (n.includes(":") || /^\d{2}[/-]\d{2}/.test(n)) return n;
  const s = n.match(/^([^\d-]*)(-?[\d.,]+)(.*)$/);
  if (!s) return n;
  const r = Number(s[2].replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(r)) return n;
  const i = s[2].includes(",") ? s[2].split(",")[1].length : 0,
    a = 10 ** i;
  return e.jsx(pe, {
    value: r * a,
    duration: 1500,
    format: (l) =>
      `${s[1]}${(l / a).toLocaleString("it-IT", { minimumFractionDigits: i, maximumFractionDigits: i })}${s[3]}`,
  });
}
function Q({ label: t, value: n, tone: s = "" }) {
  return e.jsxs("div", {
    className: `desk-stat ${s}`,
    children: [
      e.jsx("span", { children: t }),
      e.jsx("b", { children: e.jsx(ee, { value: n }) }),
    ],
  });
}
function zn({
  id: t,
  value: n,
  onChange: s,
  allowed: r = ["small", "medium", "large"],
}) {
  const i = { small: "S", medium: "M", large: "L" };
  return e.jsx("div", {
    className: "desk-widget-sizer",
    onPointerDown: (a) => a.stopPropagation(),
    children: r.map((a) =>
      e.jsx(
        "button",
        {
          type: "button",
          className: n === a ? "on" : "",
          onClick: () => s(t, a),
          title: `Dimensione ${a}`,
          children: i[a],
        },
        a,
      ),
    ),
  });
}
function Kp({
  open: t,
  onClose: n,
  items: s,
  visible: r,
  onToggle: i,
  onShowAll: a,
}) {
  return t
    ? e.jsxs(De, {
        title: "Widget della schermata",
        subtitle: "Scegli quali informazioni mostrare in questa pagina",
        onClose: n,
        children: [
          e.jsx("div", {
            className: "desk-widget-library",
            children: s.map((l) => {
              const o = r.includes(l.id);
              return e.jsxs(
                "button",
                {
                  type: "button",
                  className: o ? "on" : "",
                  onClick: () => i(l.id),
                  children: [
                    e.jsxs("span", {
                      children: [
                        e.jsx("b", { children: l.label }),
                        e.jsx("small", { children: l.description }),
                      ],
                    }),
                    e.jsx("i", { children: o ? "✓" : "+" }),
                  ],
                },
                l.id,
              );
            }),
          }),
          e.jsxs("div", {
            className: "desk-modal-actions",
            children: [
              e.jsx("button", {
                type: "button",
                onClick: a,
                children: "Mostra tutti",
              }),
              e.jsx("button", {
                type: "button",
                className: "desk-primary",
                onClick: n,
                children: "Fine",
              }),
            ],
          }),
        ],
      })
    : null;
}
function dv({ items: t }) {
  const n = { x: 130, y: 102 },
    s = 73,
    r = Math.max(1, ...t.map((l) => l.value)),
    i = (l, o = 1) => {
      const c = -Math.PI / 2 + (Math.PI * 2 * l) / t.length;
      return `${n.x + Math.cos(c) * s * o},${n.y + Math.sin(c) * s * o}`;
    },
    a = t.map((l, o) => i(o, 0.16 + 0.84 * (l.value / r))).join(" ");
  return e.jsx("div", {
    className: "desk-radar",
    children: e.jsxs("svg", {
      viewBox: "0 0 260 220",
      role: "img",
      "aria-label": "Grafico radar delle priorità delle task",
      children: [
        [0.25, 0.5, 0.75, 1].map((l) =>
          e.jsx(
            "polygon",
            { className: "grid", points: t.map((o, c) => i(c, l)).join(" ") },
            l,
          ),
        ),
        t.map((l, o) =>
          e.jsx(
            "line",
            {
              x1: n.x,
              y1: n.y,
              x2: i(o).split(",")[0],
              y2: i(o).split(",")[1],
            },
            o,
          ),
        ),
        e.jsx("polygon", { className: "value", points: a }),
        t.map((l, o) => {
          const [c, d] = i(o, 1.22).split(",").map(Number);
          return e.jsxs(
            "text",
            {
              x: c,
              y: d,
              textAnchor: "middle",
              dominantBaseline: "middle",
              children: [l.label, " · ", l.value],
            },
            l.label,
          );
        }),
      ],
    }),
  });
}
function De({ title: t, subtitle: n, onClose: s, children: r, wide: i = !1 }) {
  return (
    C.useEffect(() => {
      const a = (l) => l.key === "Escape" && s();
      return (
        document.addEventListener("keydown", a),
        () => document.removeEventListener("keydown", a)
      );
    }, [s]),
    lc.createPortal(
      e.jsx("div", {
        className: "desk-modal-layer",
        role: "presentation",
        onClick: (a) => a.target === a.currentTarget && s(),
        children: e.jsxs("section", {
          className: `desk-modal${i ? " wide" : ""}`,
          role: "dialog",
          "aria-modal": "true",
          "aria-label": t,
          onClick: (a) => a.stopPropagation(),
          children: [
            e.jsxs("header", {
              children: [
                e.jsxs("div", {
                  children: [
                    e.jsx("small", { children: "ARCHEA WORKSPACE" }),
                    e.jsx("h2", { children: t }),
                    n && e.jsx("p", { children: n }),
                  ],
                }),
                e.jsx("button", {
                  type: "button",
                  onClick: (a) => {
                    a.stopPropagation(), s();
                  },
                  "aria-label": "Chiudi",
                  children: e.jsx("span", {
                    "aria-hidden": "true",
                    children: "×",
                  }),
                }),
              ],
            }),
            e.jsx("div", { className: "desk-modal-body", children: r }),
          ],
        }),
      }),
      document.body,
    )
  );
}
function fe({
  label: t,
  value: n,
  options: s,
  onChange: r,
  disabled: i = !1,
  searchable: a = !1,
  placeholder: l = "Seleziona",
}) {
  const [o, c] = C.useState(!1),
    [d, u] = C.useState(""),
    m = s.map((f) =>
      Array.isArray(f) ? { value: f[0], label: f[1], meta: f[2] } : f,
    ),
    x = m.find((f) => String(f.value) === String(n)),
    j = m.filter(
      (f) =>
        !d ||
        `${f.label} ${f.meta || ""}`.toLowerCase().includes(d.toLowerCase()),
    );
  return e.jsxs("label", {
    className: "desk-select-field",
    children: [
      e.jsx("span", { children: t }),
      e.jsxs("button", {
        type: "button",
        className: "desk-select-trigger",
        disabled: i,
        onClick: () => c(!0),
        children: [
          e.jsx("span", { children: (x == null ? void 0 : x.label) || l }),
          e.jsx(_t, {}),
        ],
      }),
      o &&
        e.jsxs(De, {
          title: t,
          subtitle: a ? "Cerca e seleziona una voce" : void 0,
          onClose: () => {
            c(!1), u("");
          },
          children: [
            a &&
              e.jsx("input", {
                className: "desk-modal-search",
                autoFocus: !0,
                value: d,
                onChange: (f) => u(f.target.value),
                placeholder: "Cerca…",
              }),
            e.jsx("div", {
              className: "desk-select-options",
              children: j.map((f) =>
                e.jsxs(
                  "button",
                  {
                    type: "button",
                    className: String(f.value) === String(n) ? "on" : "",
                    onClick: () => {
                      r(f.value), c(!1), u("");
                    },
                    children: [
                      e.jsxs("span", {
                        children: [
                          e.jsx("b", { children: f.label }),
                          f.meta && e.jsx("small", { children: f.meta }),
                        ],
                      }),
                      e.jsx("i", {
                        children: String(f.value) === String(n) ? "✓" : "",
                      }),
                    ],
                  },
                  f.value,
                ),
              ),
            }),
          ],
        }),
    ],
  });
}
function uv({
  projects: t,
  value: n,
  onChange: s,
  label: r = "PROGETTO SELEZIONATO",
  meta: i,
}) {
  const [a, l] = C.useState(!1),
    [o, c] = C.useState(""),
    d = t.find((u) => u.codice === n);
  return e.jsxs(e.Fragment, {
    children: [
      e.jsxs("button", {
        type: "button",
        className: "desk-project-picker",
        onClick: () => l(!0),
        children: [
          e.jsxs("span", {
            children: [
              e.jsx("small", { children: r }),
              e.jsx("b", {
                children: d ? `${d.codice} · ${d.nome}` : "Nessun progetto",
              }),
            ],
          }),
          e.jsx(_t, {}),
        ],
      }),
      a &&
        e.jsxs(De, {
          title: "Scegli progetto",
          subtitle: "Cerca e seleziona una commessa",
          onClose: () => {
            l(!1), c("");
          },
          children: [
            e.jsx("input", {
              className: "desk-modal-search",
              autoFocus: !0,
              value: o,
              onChange: (u) => c(u.target.value),
              placeholder: "Cerca per codice o nome",
            }),
            e.jsx("div", {
              className: "desk-select-options",
              children: t
                .filter((u) =>
                  `${u.codice} ${u.nome}`
                    .toLowerCase()
                    .includes(o.toLowerCase()),
                )
                .map((u) =>
                  e.jsxs(
                    "button",
                    {
                      type: "button",
                      className: u.codice === n ? "on" : "",
                      onClick: () => {
                        s(u.codice), l(!1), c("");
                      },
                      children: [
                        e.jsxs("span", {
                          children: [
                            e.jsxs("b", {
                              children: [u.codice, " · ", u.nome],
                            }),
                            e.jsx("small", { children: i ? i(u) : u.stato }),
                          ],
                        }),
                        e.jsx("i", { children: u.codice === n ? "✓" : "" }),
                      ],
                    },
                    u.codice,
                  ),
                ),
            }),
          ],
        }),
    ],
  });
}
function qd({
  label: t,
  value: n,
  options: s,
  onChange: r,
  title: i,
  subtitle: a,
}) {
  const [l, o] = C.useState(!1),
    [c, d] = C.useState(""),
    u = s.find((x) => String(x.value) === String(n)),
    m = s.filter(
      (x) =>
        !c ||
        `${x.label} ${x.meta || ""}`.toLowerCase().includes(c.toLowerCase()),
    );
  return e.jsxs(e.Fragment, {
    children: [
      e.jsxs("button", {
        type: "button",
        className: "desk-project-picker",
        onClick: () => o(!0),
        children: [
          e.jsxs("span", {
            children: [
              e.jsx("small", { children: t }),
              e.jsx("b", {
                children: (u == null ? void 0 : u.label) || "Seleziona",
              }),
            ],
          }),
          e.jsx(_t, {}),
        ],
      }),
      l &&
        e.jsxs(De, {
          title: i || t,
          subtitle: a || "Cerca e seleziona una voce",
          onClose: () => {
            o(!1), d("");
          },
          children: [
            e.jsx("input", {
              className: "desk-modal-search",
              autoFocus: !0,
              value: c,
              onChange: (x) => d(x.target.value),
              placeholder: "Cerca…",
            }),
            e.jsx("div", {
              className: "desk-select-options",
              children: m.map((x) =>
                e.jsxs(
                  "button",
                  {
                    type: "button",
                    className: String(x.value) === String(n) ? "on" : "",
                    onClick: () => {
                      r(x.value), o(!1), d("");
                    },
                    children: [
                      e.jsxs("span", {
                        children: [
                          e.jsx("b", { children: x.label }),
                          x.meta && e.jsx("small", { children: x.meta }),
                        ],
                      }),
                      e.jsx("i", {
                        children: String(x.value) === String(n) ? "✓" : "",
                      }),
                    ],
                  },
                  x.value,
                ),
              ),
            }),
          ],
        }),
    ],
  });
}
function hv({ tasks: t, hours: n, projects: s, events: todayEvents = [] }) {
  const { viewer: r, today: i, data: a, setTab: l } = Y(),
    o = s || a.progetti,
    c = Yn(r, t, Mt).filter((M) => Mt(M, r)),
    d = Yn(r, t, Mt),
    [u, m] = C.useState("all"),
    [x, j] = C.useState("all"),
    [f, g] = C.useState("all"),
    b = d.filter(
      (M) =>
        (u === "all" || M.progettoCodice === u) &&
        (x === "all" || He(M, i) === x) &&
        (f === "all" || M.assegnatario === f),
    ),
    v = {
      open: c.filter((M) => qe(M, i)).length,
      due: c.filter((M) => Ce(M, i) === "in_scadenza").length,
      late: c.filter((M) => Ce(M, i) === "scaduta").length,
    },
    h = n
      .filter((M) => M.persona === r.nome && M.data === i)
      .reduce((M, q) => M + Number(q.ore || 0), 0),
    p = c.filter((M) => qe(M, i)).slice(0, 6),
    y = n.filter((M) => M.persona === r.nome),
    O = o.filter((M) => normalizeProjectStatus(M.stato) === "Active"),
    k = Array.from({ length: 7 }, (M, q) => {
      const Z = new Date(`${i}T12:00:00Z`);
      return Z.setUTCDate(Z.getUTCDate() - 6 + q), Z.toISOString().slice(0, 10);
    }),
    z = k.map((M) =>
      y.filter((q) => q.data === M).reduce((q, Z) => q + Number(Z.ore || 0), 0),
    ),
    E = Math.max(8, ...z),
    U = [
      "workstatus",
      "priority",
      "agenda",
      "projects",
      "hours",
      "status",
      "pressure",
      "summary",
    ],
    { itemProps: P, reset: $ } = Fs(`archea-home-order-${r.id}`, U),
    N = [
      {
        id: "workstatus",
        label: "Work Status",
        description: "Radar della pressione e delle priorità",
      },
      {
        id: "priority",
        label: "Priorità",
        description: "Task da tenere sotto controllo",
      },
      {
        id: "agenda",
        label: "Agenda di oggi",
        description: "Appuntamenti personali e linea dell'ora corrente",
      },
      {
        id: "projects",
        label: "Progetti",
        description: "Attività corrente delle commesse",
      },
      {
        id: "hours",
        label: "Ore personali",
        description: "Ore registrate negli ultimi sette giorni",
      },
      {
        id: "status",
        label: "Scadenze",
        description: "Distribuzione delle attività personali",
      },
      {
        id: "pressure",
        label: "Pressione progetti",
        description: "Carico delle commesse attive",
      },
      {
        id: "summary",
        label: "Riepilogo",
        description: "Indicatori sintetici della settimana",
      },
    ],
    [I, S] = ke(`archea-home-visible-${r.id}`, U),
    [L, H] = C.useState(!1),
    _ = (M) => S((q) => (q.includes(M) ? q.filter((Z) => Z !== M) : [...q, M])),
    A = {
      workstatus: "medium",
      priority: "medium",
      agenda: "medium",
      projects: "medium",
      hours: "small",
      status: "medium",
      pressure: "medium",
      summary: "small",
    },
    [w, B] = ke(`archea-home-sizes-${r.id}`, A),
    T = (M, q) => B((Z) => ({ ...Z, [M]: q })),
    D = (M) =>
      `resizable-widget widget-${w[M] || A[M]}${I.includes(M) ? "" : " widget-hidden"}`,
    X = [
      ["Urgent", "urgent|🔥"],
      ["High", "high|alta|🚴"],
      ["Medium", "medium|media|🏃"],
      ["Low", "low|bassa|🐌"],
    ].map(([M, q]) => ({
      label: M,
      value: b.filter((Z) => new RegExp(q, "i").test(Z.priorita || "")).length,
    }));
  C.useEffect(() => {
    const M = `archea-home-agenda-added-${r.id}`;
    try {
      if (localStorage.getItem(M)) return;
      S((q) => (q.includes("agenda") ? q : [...q, "agenda"]));
      localStorage.setItem(M, "1");
    } catch {}
  }, [r.id]);
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(ae, {
        title: "Il lavoro di oggi",
        subtitle:
          "Una vista rapida sulle attività che richiedono attenzione. Trascina le schede per riordinarle.",
      }),
      e.jsx(Kp, {
        open: L,
        onClose: () => H(!1),
        items: N,
        visible: I,
        onToggle: _,
        onShowAll: () => S(U),
      }),
      e.jsxs("div", {
        className: "desk-home-summary-row",
        children: [
          e.jsxs("div", {
            className: "desk-stats desk-home-stats",
            children: [
              e.jsx(Q, { label: "Task aperte", value: v.open }),
              e.jsx(Q, { label: "In scadenza", value: v.due, tone: "warn" }),
              e.jsx(Q, { label: "Scadute", value: v.late, tone: "alert" }),
              e.jsx(Q, { label: "Ore registrate oggi", value: `${h} h` }),
            ],
          }),
          e.jsxs("div", {
            className: "desk-heading-actions",
            children: [
              e.jsxs("button", {
                className: "desk-widget-add",
                onClick: () => H(!0),
                children: [e.jsx(tt, {}), "Widget"],
              }),
              e.jsx("button", {
                className: "desk-small-button",
                onClick: $,
                children: "Ripristina ordine",
              }),
            ],
          }),
        ],
      }),
      e.jsxs("div", {
        className: "desk-home-filters",
        children: [
          e.jsx(fe, {
            label: "Progetto",
            value: u,
            options: [
              { value: "all", label: "Tutti i progetti" },
              ...o.map((M) => ({
                value: M.codice,
                label: `${M.codice} · ${M.nome}`,
                meta: M.stato,
              })),
            ],
            searchable: !0,
            onChange: m,
          }),
          e.jsx(fe, {
            label: "Stato task",
            value: x,
            options: [
              { value: "all", label: "Tutti gli stati" },
              { value: "in_lavorazione", label: "In lavorazione" },
              { value: "in_scadenza", label: "In scadenza" },
              { value: "scaduta", label: "Scadute" },
              { value: "in_verifica", label: "In verifica" },
              { value: "da_rivedere", label: "Da rivedere" },
              { value: "validata", label: "Validate" },
            ],
            onChange: j,
          }),
          e.jsx(fe, {
            label: "Persona",
            value: f,
            options: [
              { value: "all", label: "Tutte le persone" },
              ...a.persone.map((M) => ({
                value: M.nome,
                label: M.nome,
                meta: M.ruolo || "",
              })),
            ],
            searchable: !0,
            onChange: g,
          }),
        ],
      }),
      e.jsxs("div", {
        className: "desk-home-widget-grid",
        children: [
          e.jsxs("section", {
            className: `desk-chart movable desk-work-status ${D("workstatus")}`,
            ...P("workstatus"),
            children: [
              e.jsxs("header", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "WORK STATUS" }),
                      e.jsx("h2", {
                        children: "Pressione e priorità delle task",
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "desk-widget-head-actions",
                    children: [
                      e.jsxs("strong", {
                        children: [
                          e.jsx(ee, { value: b.length }),
                          " task · ⋮⋮",
                        ],
                      }),
                      e.jsx(zn, {
                        id: "workstatus",
                        value: w.workstatus || "medium",
                        onChange: T,
                        allowed: ["small", "medium", "large"],
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "desk-work-status-body",
                children: [
                  e.jsx(dv, { items: X }),
                  e.jsxs("div", {
                    className: "desk-radar-summary",
                    children: [
                      X.map((M) =>
                        e.jsxs(
                          "div",
                          {
                            children: [
                              e.jsx("span", { children: M.label }),
                              e.jsx("b", {
                                children: e.jsx(ee, { value: M.value }),
                              }),
                            ],
                          },
                          M.label,
                        ),
                      ),
                      e.jsxs("div", {
                        className: "total",
                        children: [
                          e.jsx("span", { children: "Task aperte" }),
                          e.jsx("b", {
                            children: e.jsx(ee, {
                              value: b.filter((M) => qe(M, i)).length,
                            }),
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          e.jsxs("section", {
            className: `desk-panel movable ${D("priority")}`,
            ...P("priority"),
            children: [
              e.jsxs("header", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "PRIORITÀ" }),
                      e.jsx("h2", { children: "Task da tenere sotto occhio" }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "desk-widget-head-actions",
                    children: [
                      e.jsx("button", {
                        className: "desk-link",
                        onClick: () => l("taskmanager"),
                        children: "Apri Task Manager",
                      }),
                      e.jsx(zn, {
                        id: "priority",
                        value: w.priority || "medium",
                        onChange: T,
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "desk-rows",
                children: [
                  p.map((M) =>
                    e.jsxs(
                      "button",
                      {
                        className: "desk-row",
                        onClick: () => l("taskmanager"),
                        children: [
                          e.jsxs("span", {
                            children: [
                              e.jsx("b", {
                                children: M.titolo || M.descrizione,
                              }),
                              e.jsxs("small", {
                                children: [
                                  M.progettoCodice,
                                  " · ",
                                  M.tipologia || "Task",
                                ],
                              }),
                            ],
                          }),
                          e.jsx("span", {
                            className: `desk-badge ${Ce(M, i)}`,
                            children: cn(Ce(M, i)),
                          }),
                        ],
                      },
                      M.id,
                    ),
                  ),
                  !p.length &&
                    e.jsx("p", {
                      className: "desk-empty",
                      children: "Nessuna task aperta.",
                    }),
                ],
              }),
            ],
          }),
          e.jsxs("section", {
            className: `desk-panel desk-today-agenda movable ${D("agenda")}`,
            ...P("agenda"),
            children: [
              e.jsxs("header", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "AGENDA PERSONALE" }),
                      e.jsx("h2", { children: "Appuntamenti di oggi" }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "desk-widget-head-actions",
                    children: [
                      e.jsxs("strong", {
                        children: [
                          TODAY_AGENDA_DEMO.filter((M) =>
                            M.ownerIds.includes(r.id),
                          ).length +
                            todayEvents.filter(
                              (M) =>
                                (!M.date || M.date === i) &&
                                (M.ownerId === r.id ||
                                  M.assigneeId === r.id ||
                                  (M.attendeeIds || []).includes(r.id)),
                            ).length,
                          " eventi",
                        ],
                      }),
                      e.jsx(zn, {
                        id: "agenda",
                        value: w.agenda || "medium",
                        onChange: T,
                        allowed: ["small", "medium", "large"],
                      }),
                    ],
                  }),
                ],
              }),
              e.jsx(TodayAgendaWidget, {
                viewer: r,
                events: todayEvents,
                compact: w.agenda === "small",
              }),
            ],
          }),
          e.jsxs("section", {
            className: `desk-panel movable ${D("projects")}`,
            ...P("projects"),
            children: [
              e.jsxs("header", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "PROGETTI" }),
                      e.jsx("h2", { children: "Attività corrente" }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "desk-widget-head-actions",
                    children: [
                      e.jsx("button", {
                        className: "desk-link",
                        onClick: () => l("progetti"),
                        children: "Tutti i progetti",
                      }),
                      e.jsx(zn, {
                        id: "projects",
                        value: w.projects || "medium",
                        onChange: T,
                      }),
                    ],
                  }),
                ],
              }),
              e.jsx("div", {
                className: "desk-project-summary",
                children: o
                  .filter((M) => normalizeProjectStatus(M.stato) === "Active")
                  .slice(0, 5)
                  .map((M) => {
                    const q = t.filter(
                      (Z) => Z.progettoCodice === M.codice && qe(Z, i),
                    ).length;
                    return e.jsxs(
                      "div",
                      {
                        children: [
                          e.jsxs("span", {
                            children: [
                              M.codice,
                              e.jsx("small", { children: M.nome }),
                            ],
                          }),
                          e.jsx("i", {
                            children: e.jsx("em", {
                              style: {
                                width: `${Math.min(100, 20 + q * 12)}%`,
                              },
                            }),
                          }),
                          e.jsx("b", { children: q }),
                        ],
                      },
                      M.codice,
                    );
                  }),
              }),
            ],
          }),
          e.jsxs("section", {
            className: `desk-chart movable ${D("hours")}`,
            ...P("hours"),
            children: [
              e.jsxs("header", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "ORE PERSONALI" }),
                      e.jsx("h2", { children: "Ultimi sette giorni" }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "desk-widget-head-actions",
                    children: [
                      e.jsx("strong", {
                        children: e.jsx(ee, {
                          value: ue(z.reduce((M, q) => M + q, 0)),
                        }),
                      }),
                      e.jsx(zn, {
                        id: "hours",
                        value: w.hours || "small",
                        onChange: T,
                      }),
                    ],
                  }),
                ],
              }),
              e.jsx("div", {
                className: "desk-mini-week",
                children: z.map((M, q) =>
                  e.jsxs(
                    "div",
                    {
                      children: [
                        e.jsx("b", {
                          children: M ? e.jsx(ee, { value: M }) : "",
                        }),
                        e.jsx("i", {
                          children: e.jsx("em", {
                            style: { height: `${(M / E) * 100}%` },
                          }),
                        }),
                        e.jsx("small", {
                          children: ["D", "L", "M", "M", "G", "V", "S"][
                            new Date(`${k[q]}T12:00:00Z`).getUTCDay()
                          ],
                        }),
                      ],
                    },
                    k[q],
                  ),
                ),
              }),
            ],
          }),
          e.jsxs("section", {
            className: `desk-chart movable ${D("status")}`,
            ...P("status"),
            children: [
              e.jsxs("header", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "SCADENZE" }),
                      e.jsx("h2", {
                        children: "Stato delle attività personali",
                      }),
                    ],
                  }),
                  e.jsx(zn, {
                    id: "status",
                    value: w.status || "medium",
                    onChange: T,
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "desk-home-status",
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("span", {
                        style: {
                          "--value": `${v.open ? (v.late / v.open) * 100 : 0}%`,
                        },
                        children: e.jsx("b", {
                          children: e.jsx(ee, { value: v.open }),
                        }),
                      }),
                      e.jsx("small", { children: "Task aperte" }),
                    ],
                  }),
                  e.jsxs("div", {
                    children: [
                      e.jsxs("p", {
                        children: [
                          e.jsx("i", {}),
                          "In lavorazione ",
                          e.jsx("b", {
                            children: e.jsx(ee, {
                              value: c.filter(
                                (M) => Ce(M, i) === "in_lavorazione",
                              ).length,
                            }),
                          }),
                        ],
                      }),
                      e.jsxs("p", {
                        children: [
                          e.jsx("i", { className: "warn" }),
                          "In scadenza ",
                          e.jsx("b", { children: e.jsx(ee, { value: v.due }) }),
                        ],
                      }),
                      e.jsxs("p", {
                        children: [
                          e.jsx("i", { className: "alert" }),
                          "Scadute ",
                          e.jsx("b", {
                            children: e.jsx(ee, { value: v.late }),
                          }),
                        ],
                      }),
                      e.jsxs("p", {
                        children: [
                          e.jsx("i", { className: "done" }),
                          "Completate ",
                          e.jsx("b", {
                            children: e.jsx(ee, {
                              value: c.filter((M) => M.completed || M.validated)
                                .length,
                            }),
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          e.jsxs("section", {
            className: `desk-chart movable ${D("pressure")}`,
            ...P("pressure"),
            children: [
              e.jsxs("header", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "PROGETTI ATTIVI" }),
                      e.jsx("h2", { children: "Pressione delle commesse" }),
                    ],
                  }),
                  e.jsx(zn, {
                    id: "pressure",
                    value: w.pressure || "medium",
                    onChange: T,
                  }),
                ],
              }),
              e.jsx("div", {
                className: "desk-bars",
                children: O.slice(0, 6).map((M) => {
                  const q = c.filter(
                    (Z) => Z.progettoCodice === M.codice && qe(Z, i),
                  ).length;
                  return e.jsxs(
                    "div",
                    {
                      children: [
                        e.jsxs("span", {
                          children: [
                            M.codice,
                            e.jsx("small", { children: M.nome }),
                          ],
                        }),
                        e.jsx("i", {
                          children: e.jsx("em", {
                            className: "dark",
                            style: { width: `${Math.min(100, q * 18)}%` },
                          }),
                        }),
                        e.jsx("b", { children: e.jsx(ee, { value: q }) }),
                      ],
                    },
                    M.codice,
                  );
                }),
              }),
            ],
          }),
          e.jsxs("section", {
            className: `desk-chart movable ${D("summary")}`,
            ...P("summary"),
            children: [
              e.jsxs("header", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "RIEPILOGO" }),
                      e.jsx("h2", { children: "Indicatori della settimana" }),
                    ],
                  }),
                  e.jsx(zn, {
                    id: "summary",
                    value: w.summary || "small",
                    onChange: T,
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "desk-home-metrics",
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("b", {
                        children: e.jsx(ee, {
                          value: ue(z.reduce((M, q) => M + q, 0)),
                        }),
                      }),
                      e.jsx("span", { children: "Ore registrate" }),
                    ],
                  }),
                  e.jsxs("div", {
                    children: [
                      e.jsx("b", {
                        children: e.jsx(ee, {
                          value: new Set(
                            c
                              .filter((M) => qe(M, i))
                              .map((M) => M.progettoCodice),
                          ).size,
                        }),
                      }),
                      e.jsx("span", { children: "Progetti coinvolti" }),
                    ],
                  }),
                  e.jsxs("div", {
                    children: [
                      e.jsx("b", {
                        children: e.jsx(ee, {
                          value: c.filter((M) => M.completed || M.validated)
                            .length,
                        }),
                      }),
                      e.jsx("span", { children: "Task completate" }),
                    ],
                  }),
                  e.jsxs("div", {
                    children: [
                      e.jsx("b", {
                        children: e.jsx(ee, {
                          value: `${Math.round((c.filter((M) => M.completed || M.validated).length / Math.max(1, c.length)) * 100)}%`,
                        }),
                      }),
                      e.jsx("span", { children: "Completamento" }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function pv({ tasks: t, setTasks: n, projects: s }) {
  var Aa, ie, Vs;
  const { data: r, viewer: i, today: a } = Y(),
    l = s || r.progetti,
    o = ["senior_architect", "partner_architect", "property"].includes(
      i.appRole,
    ),
    c = ["architect", "senior_architect", "partner_architect"].includes(
      i.appRole,
    ),
    d = o ? t : Yn(i, t, Mt),
    [u, m] = C.useState("open"),
    [x, j] = C.useState(""),
    [f, g] = C.useState("all"),
    [b, v] = C.useState("all"),
    [h, p] = C.useState(
      () => sessionStorage.getItem("archea-task-focus") || null,
    ),
    [y, O] = C.useState(!1),
    [k, z] = C.useState(!1),
    E = l.find((R) => normalizeProjectStatus(R.stato) === "Active") || l[0],
    U = C.useMemo(
      () => ({
        progettoCodice: (E == null ? void 0 : E.codice) || "",
        assegnatario: i.nome,
        tipologia: "Coordination",
        priorita: "Media",
        titolo: "",
        descrizione: "",
        inizio: a,
        scadenza: a,
        orario: "18:00",
        commenti: "",
        linkServer: "",
        shared: !0,
      }),
      [E == null ? void 0 : E.codice, a, i.nome],
    ),
    [P, $] = C.useState(U);
  C.useEffect(() => {
    sessionStorage.removeItem("archea-task-focus");
  }, []),
    C.useEffect(() => {
      const R = (K) => {
        m("all"), g("all"), v("all"), j(""), p(K.detail);
      };
      return (
        window.addEventListener("archea-focus-task", R),
        () => window.removeEventListener("archea-focus-task", R)
      );
    }, []);
  const N = C.useDeferredValue(x.trim().toLowerCase()),
    I = d.filter((R) => {
      const K = He(R, a),
        ce = u === "all" || (u === "open" ? K !== "validata" : K === u),
        ze = f === "all" || R.progettoCodice === f,
        Ft = b === "all" || R.assegnatario === b,
        Hr =
          `${R.titolo || ""} ${R.descrizione || ""} ${R.progettoCodice || ""} ${R.assegnatario || ""} ${R.tipologia || ""}`.toLowerCase();
      return ce && ze && Ft && Hr.includes(N);
    }),
    S = t.find((R) => R.id === h) || null,
    L = (R, K) =>
      S && n((ce) => ce.map((ze) => (ze.id === S.id ? { ...ze, [R]: K } : ze))),
    H = (R, K) => $((ce) => ({ ...ce, [R]: K })),
    _ = (R) => {
      if (
        (R == null || R.preventDefault(),
        !c || !P.titolo.trim() || !P.progettoCodice || !P.assegnatario)
      )
        return;
      const K = cv(P.progettoCodice),
        ce = {
          ...P,
          numero: Yd(t, P.progettoCodice),
          assegnatario: o ? P.assegnatario : i.nome,
          id: en("demo-task"),
          completed: !1,
          validated: !1,
          notValidated: !1,
          immagini: [],
          dataChiusura: "",
          createdAt: new Date().toISOString(),
          createdBy: i.nome,
          createdById: i.id,
          approvalPending: !o,
          projectLeadId: (K == null ? void 0 : K.id) || "fdiamanti",
          projectLeadName:
            (K == null ? void 0 : K.name) || "Francesco Diamanti",
        };
      n((ze) => [ce, ...ze]),
        m("all"),
        g("all"),
        v("all"),
        j(""),
        $({ ...U, titolo: "", descrizione: "", commenti: "", linkServer: "" }),
        z(!1);
    },
    A = (R) => {
      [...(R.target.files || [])].forEach((K) => {
        const ce = new FileReader();
        (ce.onload = () =>
          n((ze) =>
            ze.map((Ft) =>
              Ft.id === (S == null ? void 0 : S.id)
                ? {
                    ...Ft,
                    immagini: [
                      ...(Ft.immagini || []),
                      { name: K.name, url: ce.result },
                    ],
                  }
                : Ft,
            ),
          )),
          ce.readAsDataURL(K);
      }),
        (R.target.value = "");
    },
    w = (S == null ? void 0 : S.assegnatario) === i.nome,
    B = !!(S && (w || o) && !S.validated),
    T = () =>
      S &&
      n((R) =>
        R.map((K) =>
          K.id === S.id
            ? {
                ...K,
                completed: !0,
                validated: !1,
                notValidated: !1,
                dataChiusura: a,
                submittedAt: new Date().toISOString(),
              }
            : K,
        ),
      ),
    D = () =>
      S &&
      o &&
      n((R) =>
        R.map((K) =>
          K.id === S.id
            ? {
                ...K,
                completed: !0,
                validated: !0,
                notValidated: !1,
                dataChiusura: K.dataChiusura || a,
                validatedAt: new Date().toISOString(),
                validatedBy: i.nome,
              }
            : K,
        ),
      ),
    X = () => {
      var R;
      return (
        S &&
        o &&
        ((R = S.commenti) == null ? void 0 : R.trim()) &&
        n((K) =>
          K.map((ce) =>
            ce.id === S.id
              ? {
                  ...ce,
                  completed: !1,
                  validated: !1,
                  notValidated: !0,
                  correctionAt: new Date().toISOString(),
                  correctionBy: i.nome,
                }
              : ce,
          ),
        )
      );
    },
    M = () =>
      S &&
      o &&
      n((R) =>
        R.map((K) =>
          K.id === S.id
            ? {
                ...K,
                approvalPending: !1,
                approvedAt: new Date().toISOString(),
                approvedBy: i.nome,
              }
            : K,
        ),
      ),
    q = () => {
      !S || !o || (n((R) => R.filter((K) => K.id !== S.id)), O(!1), p(null));
    },
    Z = {
      open: d.filter((R) => He(R, a) !== "validata").length,
      verify: d.filter((R) => He(R, a) === "in_verifica").length,
      due: d.filter((R) => He(R, a) === "in_scadenza").length,
      late: d.filter((R) => He(R, a) === "scaduta").length,
      review: d.filter((R) => He(R, a) === "da_rivedere").length,
    },
    Qe = l.map((R) => ({
      value: R.codice,
      label: `${R.codice} · ${R.nome}`,
      meta: R.stato,
    })),
    Us = r.persone.map((R) => ({
      value: R.nome,
      label: R.nome,
      meta: R.ruolo || "",
    })),
    nn = [
      "Checking",
      "Coordination",
      "3D",
      "2D",
      "Modeling",
      "Revit",
      "Output",
      "Printing",
      "Photoshop",
      "Indesign",
      "Render",
      "Amministrazione",
    ].map((R) => ({ value: R, label: R })),
    Tn = [
      ...new Set([
        ...t.map((R) => R.priorita).filter(Boolean),
        "🔥 Urgent",
        "🚴 High",
        "🏃‍♂️ Medium",
        "🐌 Low",
      ]),
    ].map((R) => ({ value: R, label: R })),
    es = S ? He(S, a) : "";
  return S
    ? e.jsxs("div", {
        className: "desk-task-detail-page",
        children: [
          e.jsxs("button", {
            className: "desk-back",
            onClick: () => p(null),
            children: [e.jsx(Re, {}), "Torna al Task Manager"],
          }),
          e.jsx(ae, {
            eyebrow: dl(S),
            title: S.titolo || S.descrizione || "Task senza titolo",
            subtitle: "Scheda completa, allegati e flusso di verifica.",
            action: o
              ? e.jsx("button", {
                  className: "desk-delete-button",
                  onClick: () => O(!0),
                  children: "Elimina task",
                })
              : null,
          }),
          e.jsxs("div", {
            className: "desk-task-detail-grid",
            children: [
              e.jsxs("section", {
                className: "desk-panel desk-task-detail-main",
                children: [
                  e.jsxs("header", {
                    children: [
                      e.jsxs("div", {
                        children: [
                          e.jsx("small", { children: "INFORMAZIONI" }),
                          e.jsx("h2", { children: "Dati della task" }),
                        ],
                      }),
                      e.jsx("span", {
                        className: `desk-badge ${es}`,
                        children: cn(es),
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "desk-form",
                    children: [
                      e.jsxs("div", {
                        className: "desk-auto-task-code",
                        children: [
                          e.jsx("span", { children: "CODICE TASK" }),
                          e.jsx("b", { children: dl(S) }),
                          e.jsx("small", {
                            children:
                              "Assegnato automaticamente e non modificabile",
                          }),
                        ],
                      }),
                      e.jsx(fe, {
                        label: "Priorità",
                        value: S.priorita || "",
                        options: Tn,
                        disabled: !o,
                        onChange: (R) => L("priorita", R),
                      }),
                      e.jsx(fe, {
                        label: "Progetto",
                        value: S.progettoCodice || "",
                        options: Qe,
                        disabled: !o,
                        searchable: !0,
                        onChange: (R) => L("progettoCodice", R),
                      }),
                      e.jsx(fe, {
                        label: "Assegnatario",
                        value: S.assegnatario || "",
                        options: Us,
                        disabled: !o,
                        searchable: !0,
                        onChange: (R) => L("assegnatario", R),
                      }),
                      e.jsx(fe, {
                        label: "Tipologia",
                        value: S.tipologia || "",
                        options: nn,
                        disabled: !o,
                        onChange: (R) => L("tipologia", R),
                      }),
                      e.jsxs("label", {
                        children: [
                          "Nome breve della task",
                          e.jsx("input", {
                            value: S.titolo || "",
                            disabled: !o,
                            onChange: (R) => L("titolo", R.target.value),
                          }),
                        ],
                      }),
                      e.jsxs("label", {
                        children: [
                          "Descrizione completa",
                          e.jsx("textarea", {
                            value: S.descrizione || "",
                            disabled: !o,
                            onChange: (R) => L("descrizione", R.target.value),
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "desk-form-row",
                        children: [
                          e.jsxs("label", {
                            children: [
                              "Data inizio",
                              e.jsx("input", {
                                type: "date",
                                value: S.inizio || "",
                                disabled: !o,
                                onChange: (R) => L("inizio", R.target.value),
                              }),
                            ],
                          }),
                          e.jsxs("label", {
                            children: [
                              "Scadenza",
                              e.jsx("input", {
                                type: "date",
                                value: S.scadenza || "",
                                disabled: !o,
                                onChange: (R) => L("scadenza", R.target.value),
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "desk-form-row",
                        children: [
                          e.jsxs("label", {
                            children: [
                              "Orario",
                              e.jsx("input", {
                                type: "time",
                                value: S.orario || "",
                                disabled: !o,
                                onChange: (R) => L("orario", R.target.value),
                              }),
                            ],
                          }),
                          e.jsxs("label", {
                            children: [
                              "Data completamento",
                              e.jsx("input", {
                                type: "date",
                                value: S.dataChiusura || "",
                                disabled: !0,
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "desk-task-detail-side",
                children: [
                  e.jsxs("section", {
                    className: "desk-panel",
                    children: [
                      e.jsx("header", {
                        children: e.jsxs("div", {
                          children: [
                            e.jsx("small", { children: "FILE E COLLEGAMENTI" }),
                            e.jsx("h2", { children: "Materiale di lavoro" }),
                          ],
                        }),
                      }),
                      e.jsxs("div", {
                        className: "desk-form",
                        children: [
                          e.jsxs("label", {
                            children: [
                              "Percorso server",
                              e.jsx("input", {
                                value: S.linkServer || "",
                                disabled: !o,
                                onChange: (R) =>
                                  L("linkServer", R.target.value),
                                placeholder: "es. Y:\\\\1-Lavori\\\\...",
                              }),
                            ],
                          }),
                          e.jsxs("label", {
                            className: "desk-upload",
                            children: [
                              e.jsx("span", { children: e.jsx(oc, {}) }),
                              e.jsxs("span", {
                                children: [
                                  e.jsx("b", {
                                    children: "Immagini di riferimento",
                                  }),
                                  e.jsxs("small", {
                                    children: [
                                      ((Aa = S.immagini) == null
                                        ? void 0
                                        : Aa.length) || 0,
                                      " file associati",
                                    ],
                                  }),
                                ],
                              }),
                              e.jsxs("span", {
                                className: "desk-upload-action",
                                children: [
                                  "Carica",
                                  e.jsx("input", {
                                    type: "file",
                                    accept: "image/*",
                                    multiple: !0,
                                    disabled: !o,
                                    onChange: A,
                                  }),
                                ],
                              }),
                            ],
                          }),
                          !!((ie = S.immagini) != null && ie.length) &&
                            e.jsx("div", {
                              className: "desk-image-strip",
                              children: S.immagini.map((R, K) => {
                                const ce = typeof R == "string" ? "" : R.url,
                                  ze = typeof R == "string" ? R : R.name;
                                return e.jsxs(
                                  "button",
                                  {
                                    type: "button",
                                    title: ze,
                                    onClick: () =>
                                      ce && window.open(ce, "_blank"),
                                    children: [
                                      ce
                                        ? e.jsx("img", { src: ce, alt: ze })
                                        : e.jsx("span", {
                                            children: e.jsx(wt, {}),
                                          }),
                                      e.jsx("small", { children: ze }),
                                    ],
                                  },
                                  `${ze}-${K}`,
                                );
                              }),
                            }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs("section", {
                    className: "desk-panel",
                    children: [
                      S.approvalPending &&
                        e.jsxs("div", {
                          className: "desk-task-proposal",
                          children: [
                            e.jsxs("span", {
                              children: [
                                e.jsx("small", {
                                  children: "TASK PROPOSTA DA UNA RISORSA",
                                }),
                                e.jsx("b", {
                                  children: S.createdBy || S.assegnatario,
                                }),
                                e.jsxs("p", {
                                  children: [
                                    "Notifica inviata a ",
                                    S.projectLeadName ||
                                      "referente del progetto",
                                    ".",
                                  ],
                                }),
                              ],
                            }),
                            o &&
                              e.jsx("button", {
                                className: "desk-primary",
                                onClick: M,
                                children: "Prendi in carico",
                              }),
                          ],
                        }),
                      e.jsxs("div", {
                        className: "desk-form",
                        children: [
                          e.jsxs("label", {
                            children: [
                              "Commenti e correzioni",
                              e.jsx("textarea", {
                                value: S.commenti || "",
                                disabled: !o,
                                onChange: (R) => L("commenti", R.target.value),
                                placeholder:
                                  "Scrivi qui le correzioni da inviare alla risorsa",
                              }),
                            ],
                          }),
                          o &&
                            e.jsxs("label", {
                              className: "desk-check",
                              children: [
                                e.jsx("input", {
                                  type: "checkbox",
                                  checked: !!(S.shared ?? S.sharedRaw),
                                  onChange: (R) =>
                                    L("shared", R.target.checked),
                                }),
                                "Condivisa",
                              ],
                            }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: `desk-task-flow ${es}`,
                        children: [
                          e.jsxs("header", {
                            children: [
                              e.jsx("small", {
                                children: "FLUSSO DI VERIFICA",
                              }),
                              e.jsx("b", { children: cn(es) }),
                            ],
                          }),
                          e.jsxs("div", {
                            children: [
                              e.jsxs("span", {
                                className: S.completed ? "done" : "",
                                children: [
                                  e.jsx("i", { children: "1" }),
                                  e.jsx("small", { children: "Risorsa" }),
                                  e.jsx("b", { children: "Lavoro completato" }),
                                ],
                              }),
                              e.jsxs("span", {
                                className: S.validated
                                  ? "done"
                                  : S.completed
                                    ? "current"
                                    : "",
                                children: [
                                  e.jsx("i", { children: "2" }),
                                  e.jsx("small", { children: "Referente" }),
                                  e.jsx("b", { children: "Controllo finale" }),
                                ],
                              }),
                              e.jsxs("span", {
                                className: S.validated ? "done" : "",
                                children: [
                                  e.jsx("i", { children: "3" }),
                                  e.jsx("small", { children: "Task" }),
                                  e.jsx("b", {
                                    children: "Chiusura definitiva",
                                  }),
                                ],
                              }),
                            ],
                          }),
                          S.notValidated &&
                            S.commenti &&
                            e.jsxs("p", {
                              children: [
                                e.jsxs("b", {
                                  children: [
                                    "Correzioni richieste da ",
                                    S.correctionBy || "referente",
                                    ":",
                                  ],
                                }),
                                " ",
                                S.commenti,
                              ],
                            }),
                          e.jsxs("footer", {
                            children: [
                              B &&
                                !S.completed &&
                                e.jsx("button", {
                                  className: "desk-primary",
                                  onClick: T,
                                  children: "Invia per verifica",
                                }),
                              o &&
                                S.completed &&
                                !S.validated &&
                                e.jsxs(e.Fragment, {
                                  children: [
                                    e.jsx("button", {
                                      className: "desk-review-button",
                                      disabled: !(
                                        (Vs = S.commenti) != null && Vs.trim()
                                      ),
                                      onClick: X,
                                      children: "Richiedi correzioni",
                                    }),
                                    e.jsx("button", {
                                      className: "desk-primary",
                                      onClick: D,
                                      children: "Valida e chiudi",
                                    }),
                                  ],
                                }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          y &&
            e.jsx(De, {
              title: "Eliminare questa task?",
              subtitle: "L’operazione rimuove la task dalla demo locale.",
              onClose: () => O(!1),
              children: e.jsxs("div", {
                className: "desk-delete-confirm",
                children: [
                  e.jsxs("p", {
                    children: [
                      e.jsx("b", { children: S.titolo || S.descrizione }),
                      e.jsx("br", {}),
                      S.progettoCodice,
                      " · ",
                      S.assegnatario,
                    ],
                  }),
                  e.jsxs("div", {
                    children: [
                      e.jsx("button", {
                        onClick: () => O(!1),
                        children: "Annulla",
                      }),
                      e.jsx("button", {
                        className: "desk-delete-button solid",
                        onClick: q,
                        children: "Elimina definitivamente",
                      }),
                    ],
                  }),
                ],
              }),
            }),
        ],
      })
    : e.jsxs("div", {
        className: "desk-task-manager-page task-manager-stable",
        children: [
          e.jsx(ae, {
            title: "Task Manager",
            subtitle: o
              ? "Consulta le attività e apri una riga per dettagli, verifica e chiusura."
              : "Consulta le attività assegnate e apri una riga per inviare il lavoro al referente.",
            action: c
              ? e.jsxs("button", {
                  className: "desk-primary",
                  onClick: () => z(!0),
                  children: [e.jsx(tt, {}), "Aggiungi task"],
                })
              : null,
          }),
          e.jsxs("div", {
            className: "desk-stats compact task-stats",
            children: [
              e.jsx(Q, { label: "Aperte", value: Z.open }),
              e.jsx(Q, { label: "In verifica", value: Z.verify }),
              e.jsx(Q, { label: "In scadenza", value: Z.due, tone: "warn" }),
              e.jsx(Q, { label: "Scadute", value: Z.late, tone: "alert" }),
              e.jsx(Q, { label: "Da rivedere", value: Z.review }),
            ],
          }),
          e.jsxs("div", {
            className: "desk-task-controls",
            children: [
              e.jsx("div", {
                className: "desk-segments",
                children: [
                  ["open", "Aperte"],
                  ["in_verifica", "In verifica"],
                  ["da_rivedere", "Da rivedere"],
                  ["in_scadenza", "In scadenza"],
                  ["scaduta", "Scadute"],
                  ["validata", "Validate"],
                  ["all", "Tutte"],
                ].map(([R, K]) =>
                  e.jsx(
                    "button",
                    {
                      className: u === R ? "on" : "",
                      onClick: () => m(R),
                      children: K,
                    },
                    R,
                  ),
                ),
              }),
              e.jsxs("div", {
                className: "desk-task-filters",
                children: [
                  e.jsx(fe, {
                    label: "Progetto",
                    value: f,
                    options: [
                      { value: "all", label: "Tutti i progetti" },
                      ...Qe,
                    ],
                    searchable: !0,
                    onChange: g,
                  }),
                  e.jsx(fe, {
                    label: "Persona",
                    value: b,
                    options: [
                      { value: "all", label: "Tutte le persone" },
                      ...Us,
                    ],
                    searchable: !0,
                    onChange: v,
                  }),
                  e.jsxs("label", {
                    children: [
                      e.jsx("span", { children: "Cerca" }),
                      e.jsx("input", {
                        className: "desk-search",
                        type: "search",
                        value: x,
                        onChange: (R) => j(R.target.value),
                        placeholder: "Task, progetto o persona",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          e.jsxs("div", {
            className: "desk-table-wrap task-results",
            children: [
              e.jsxs("table", {
                className: "desk-table task-table",
                children: [
                  e.jsx("thead", {
                    children: e.jsxs("tr", {
                      children: [
                        e.jsx("th", {
                          className: "desk-done-col",
                          children: "Stato",
                        }),
                        e.jsx("th", { children: "Task" }),
                        e.jsx("th", { children: "Progetto" }),
                        e.jsx("th", { children: "Assegnatario" }),
                        e.jsx("th", { children: "Priorità" }),
                        e.jsx("th", { children: "Scadenza" }),
                        e.jsx("th", { children: "Workflow" }),
                      ],
                    }),
                  }),
                  e.jsx("tbody", {
                    children: I.map((R) => {
                      const K = He(R, a),
                        ce =
                          K === "validata"
                            ? "✓"
                            : K === "in_verifica"
                              ? "⌛"
                              : K === "da_rivedere"
                                ? "↺"
                                : K === "scaduta"
                                  ? "!"
                                  : K === "in_scadenza"
                                    ? "◷"
                                    : "•";
                      return e.jsxs(
                        "tr",
                        {
                          onClick: () => p(R.id),
                          children: [
                            e.jsx("td", {
                              className: "desk-done-col",
                              children: e.jsx("span", {
                                className: `desk-flow-dot ${K}`,
                                title: cn(K),
                                "aria-label": cn(K),
                                children: ce,
                              }),
                            }),
                            e.jsxs("td", {
                              children: [
                                e.jsx("b", {
                                  children: R.titolo || R.descrizione,
                                }),
                                e.jsxs("small", {
                                  children: [R.tipologia || "—", " · ", dl(R)],
                                }),
                              ],
                            }),
                            e.jsx("td", { children: R.progettoCodice || "—" }),
                            e.jsx("td", {
                              children: e.jsxs("span", {
                                className: "desk-person",
                                children: [
                                  e.jsx("i", {
                                    children: Lt(R.assegnatario || "?"),
                                  }),
                                  R.assegnatario || "—",
                                ],
                              }),
                            }),
                            e.jsx("td", {
                              children: e.jsx("span", {
                                className: `desk-priority ${String(R.priorita || "").toLowerCase()}`,
                                children: R.priorita || "—",
                              }),
                            }),
                            e.jsxs("td", {
                              children: [
                                R.scadenza || "—",
                                R.orario &&
                                  e.jsx("small", { children: R.orario }),
                              ],
                            }),
                            e.jsx("td", {
                              children: e.jsx("span", {
                                className: `desk-badge ${K}`,
                                children: cn(K),
                              }),
                            }),
                          ],
                        },
                        R.id,
                      );
                    }),
                  }),
                ],
              }),
              !I.length &&
                e.jsx("p", {
                  className: "desk-empty",
                  children: "Nessuna task corrisponde ai filtri.",
                }),
            ],
          }),
          k &&
            e.jsx(De, {
              title: "Nuova task",
              subtitle: o
                ? "Compila i dati della nuova attività."
                : "La task sarà assegnata a te e notificata al capo progetto.",
              onClose: () => z(!1),
              wide: !0,
              children: e.jsxs("form", {
                className: "desk-form desk-task-create-modal",
                onSubmit: _,
                children: [
                  e.jsxs("div", {
                    className: "desk-auto-task-code",
                    children: [
                      e.jsx("span", { children: "CODICE TASK PREVISTO" }),
                      e.jsx("b", { children: Yd(t, P.progettoCodice) }),
                      e.jsx("small", {
                        children:
                          "Verrà assegnato automaticamente al salvataggio",
                      }),
                    ],
                  }),
                  e.jsx(fe, {
                    label: "Priorità",
                    value: P.priorita,
                    options: Tn,
                    onChange: (R) => H("priorita", R),
                  }),
                  e.jsx(fe, {
                    label: "Progetto",
                    value: P.progettoCodice,
                    options: Qe,
                    searchable: !0,
                    onChange: (R) => H("progettoCodice", R),
                  }),
                  e.jsx(fe, {
                    label: "Assegnatario",
                    value: o ? P.assegnatario : i.nome,
                    options: Us,
                    disabled: !o,
                    searchable: !0,
                    onChange: (R) => H("assegnatario", R),
                  }),
                  e.jsx(fe, {
                    label: "Tipologia",
                    value: P.tipologia,
                    options: nn,
                    onChange: (R) => H("tipologia", R),
                  }),
                  e.jsxs("label", {
                    children: [
                      "Nome breve della task",
                      e.jsx("input", {
                        required: !0,
                        value: P.titolo,
                        onChange: (R) => H("titolo", R.target.value),
                        placeholder: "Es. Aggiornare piante piano terra",
                      }),
                    ],
                  }),
                  e.jsxs("label", {
                    children: [
                      "Descrizione",
                      e.jsx("textarea", {
                        value: P.descrizione,
                        onChange: (R) => H("descrizione", R.target.value),
                        placeholder: "Indicazioni operative",
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "desk-form-row",
                    children: [
                      e.jsxs("label", {
                        children: [
                          "Data inizio",
                          e.jsx("input", {
                            type: "date",
                            value: P.inizio,
                            onChange: (R) => H("inizio", R.target.value),
                          }),
                        ],
                      }),
                      e.jsxs("label", {
                        children: [
                          "Scadenza",
                          e.jsx("input", {
                            type: "date",
                            value: P.scadenza,
                            onChange: (R) => H("scadenza", R.target.value),
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs("label", {
                    children: [
                      "Percorso server",
                      e.jsx("input", {
                        value: P.linkServer,
                        onChange: (R) => H("linkServer", R.target.value),
                        placeholder: "Y:\\\\1-Lavori\\\\...",
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "desk-modal-actions",
                    children: [
                      e.jsx("button", {
                        type: "button",
                        onClick: () => z(!1),
                        children: "Annulla",
                      }),
                      e.jsxs("button", {
                        className: "desk-primary",
                        type: "submit",
                        children: [e.jsx(tt, {}), "Inserisci nuova task"],
                      }),
                    ],
                  }),
                ],
              }),
            }),
        ],
      });
}
function mv({ hours: t, setHours: n }) {
  var p;
  const { data: s, viewer: r, today: i } = Y(),
    [a, l] = C.useState({
      progettoCodice: ((p = s.progetti[0]) == null ? void 0 : p.codice) || "",
      data: i,
      ore: 8,
      nota: "",
    }),
    [o, c] = C.useState("settimana"),
    [d, u] = C.useState(i),
    m = t.filter((y) => y.persona === r.nome),
    x = co(o, d, { from: d, to: d }),
    j = uo(m, x),
    f = Ip(Math.max(1, ...j.barre.map((y) => y.ore))),
    g = Math.max(1, ...j.perProgetto.map((y) => y.ore)),
    b = (y) => {
      y.preventDefault(),
        !(!a.progettoCodice || !a.data || Number(a.ore) <= 0) &&
          (n((O) => [
            { ...a, persona: r.nome, id: en("demo-hours"), ore: Number(a.ore) },
            ...O,
          ]),
          l((O) => ({ ...O, nota: "" })));
    },
    v = (y) =>
      l((O) => ({
        ...O,
        ore: Math.min(24, Math.max(0.5, Number(O.ore || 0) + y)),
      })),
    h = s.progetti.map((y) => ({
      value: y.codice,
      label: `${y.codice} · ${y.nome}`,
      meta: y.stato,
    }));
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(ae, {
        title: "Ore",
        subtitle: `Registrazione personale di ${r.nome}. Il profilo viene riconosciuto automaticamente dal login.`,
      }),
      e.jsxs("div", {
        className: "desk-hours-v2",
        children: [
          e.jsxs("form", {
            className: "desk-panel desk-entry-form",
            onSubmit: b,
            children: [
              e.jsx("header", {
                children: e.jsxs("div", {
                  children: [
                    e.jsx("small", { children: "NUOVA REGISTRAZIONE" }),
                    e.jsx("h2", { children: "Inserisci le ore lavorate" }),
                  ],
                }),
              }),
              e.jsx(fe, {
                label: "Progetto",
                value: a.progettoCodice,
                options: h,
                searchable: !0,
                onChange: (y) => l({ ...a, progettoCodice: y }),
              }),
              e.jsxs("label", {
                children: [
                  "Data",
                  e.jsx("input", {
                    type: "date",
                    value: a.data,
                    onChange: (y) => l({ ...a, data: y.target.value }),
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "desk-hour-counter",
                children: [
                  e.jsx("span", { children: "Ore lavorate" }),
                  e.jsxs("div", {
                    children: [
                      e.jsx("button", {
                        type: "button",
                        onClick: () => v(-0.5),
                        children: "−",
                      }),
                      e.jsxs("b", {
                        children: [
                          Number(a.ore).toLocaleString("it-IT", {
                            maximumFractionDigits: 1,
                          }),
                          e.jsx("small", { children: "h" }),
                        ],
                      }),
                      e.jsx("button", {
                        type: "button",
                        onClick: () => v(0.5),
                        children: "+",
                      }),
                    ],
                  }),
                  e.jsx("small", { children: "Incrementi da 30 minuti" }),
                ],
              }),
              e.jsxs("label", {
                children: [
                  "Descrizione attività",
                  e.jsx("textarea", {
                    value: a.nota,
                    onChange: (y) => l({ ...a, nota: y.target.value }),
                    placeholder: "Descrivi brevemente il lavoro svolto",
                  }),
                ],
              }),
              e.jsx("button", {
                className: "desk-primary",
                type: "submit",
                children: "Registra ore",
              }),
            ],
          }),
          e.jsxs("div", {
            className: "desk-hours-dashboard",
            children: [
              e.jsxs("section", {
                className: "desk-panel desk-hours-chart",
                children: [
                  e.jsxs("header", {
                    children: [
                      e.jsxs("div", {
                        children: [
                          e.jsx("small", { children: "ANDAMENTO ORE" }),
                          e.jsx("h2", { children: x.label }),
                        ],
                      }),
                      e.jsx("strong", { children: ue(j.totale) }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "desk-period-controls",
                    children: [
                      e.jsx("div", {
                        className: "desk-segments",
                        children: [
                          ["giorno", "Giorno"],
                          ["settimana", "Settimana"],
                          ["mese", "Mese"],
                          ["anno", "Anno"],
                        ].map(([y, O]) =>
                          e.jsx(
                            "button",
                            {
                              type: "button",
                              className: o === y ? "on" : "",
                              onClick: () => c(y),
                              children: O,
                            },
                            y,
                          ),
                        ),
                      }),
                      e.jsxs("div", {
                        className: "desk-date-nav",
                        children: [
                          e.jsx("button", {
                            onClick: () => u(Or(o, d, -1)),
                            children: e.jsx(Re, {}),
                          }),
                          e.jsx("input", {
                            type: "date",
                            value: d,
                            onChange: (y) => u(y.target.value),
                          }),
                          e.jsx("button", {
                            onClick: () => u(Or(o, d, 1)),
                            children: e.jsx(ve, {}),
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsx("div", {
                    className: "desk-hour-bars",
                    children: j.barre.map((y) =>
                      e.jsxs(
                        "div",
                        {
                          title: `${y.key}: ${ue(y.ore)}`,
                          children: [
                            e.jsx("b", { children: y.ore || "" }),
                            e.jsx("i", {
                              children: e.jsx("em", {
                                style: { height: `${(y.ore / f) * 100}%` },
                              }),
                            }),
                            e.jsx("small", { children: y.label }),
                          ],
                        },
                        y.key,
                      ),
                    ),
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "desk-grid-2 hours-bottom",
                children: [
                  e.jsxs("section", {
                    className: "desk-panel",
                    children: [
                      e.jsx("header", {
                        children: e.jsxs("div", {
                          children: [
                            e.jsx("small", { children: "PER PROGETTO" }),
                            e.jsx("h2", {
                              children: "Distribuzione del periodo",
                            }),
                          ],
                        }),
                      }),
                      e.jsxs("div", {
                        className: "desk-bars",
                        children: [
                          j.perProgetto.map((y) => {
                            var O;
                            return e.jsxs(
                              "div",
                              {
                                children: [
                                  e.jsxs("span", {
                                    children: [
                                      y.codice,
                                      e.jsx("small", {
                                        children:
                                          ((O = s.progetti.find(
                                            (k) => k.codice === y.codice,
                                          )) == null
                                            ? void 0
                                            : O.nome) || "",
                                      }),
                                    ],
                                  }),
                                  e.jsx("i", {
                                    children: e.jsx("em", {
                                      style: { width: `${(y.ore / g) * 100}%` },
                                    }),
                                  }),
                                  e.jsx("b", { children: ue(y.ore) }),
                                ],
                              },
                              y.codice,
                            );
                          }),
                          !j.perProgetto.length &&
                            e.jsx("p", {
                              className: "desk-empty",
                              children: "Nessuna ora nel periodo.",
                            }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs("section", {
                    className: "desk-panel",
                    children: [
                      e.jsx("header", {
                        children: e.jsxs("div", {
                          children: [
                            e.jsx("small", {
                              children: "ULTIME REGISTRAZIONI",
                            }),
                            e.jsx("h2", { children: "Attività recenti" }),
                          ],
                        }),
                      }),
                      e.jsx("div", {
                        className: "desk-recent-hours",
                        children: m
                          .slice()
                          .sort((y, O) => O.data.localeCompare(y.data))
                          .slice(0, 6)
                          .map((y) =>
                            e.jsxs(
                              "div",
                              {
                                children: [
                                  e.jsx("time", { children: y.data }),
                                  e.jsxs("span", {
                                    children: [
                                      e.jsx("b", {
                                        children: y.progettoCodice,
                                      }),
                                      e.jsx("small", {
                                        children:
                                          y.nota || "Nessuna descrizione",
                                      }),
                                    ],
                                  }),
                                  e.jsx("strong", { children: ue(y.ore) }),
                                ],
                              },
                              y.id,
                            ),
                          ),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function fv({ task: t, today: n, onClose: s }) {
  var i;
  if (!t) return null;
  const r = He(t, n);
  return e.jsx(De, {
    title: t.titolo || t.descrizione || "Dettaglio task",
    subtitle: `${t.progettoCodice} · Task #${t.numero || "—"}`,
    onClose: s,
    wide: !0,
    children: e.jsxs("div", {
      className: "desk-project-task-detail",
      children: [
        e.jsxs("section", {
          children: [
            e.jsxs("div", {
              children: [
                e.jsx("small", { children: "STATO" }),
                e.jsx("span", {
                  className: `desk-badge ${r}`,
                  children: cn(r),
                }),
              ],
            }),
            e.jsxs("div", {
              children: [
                e.jsx("small", { children: "PRIORITÀ" }),
                e.jsx("b", { children: t.priorita || "Non indicata" }),
              ],
            }),
            e.jsxs("div", {
              children: [
                e.jsx("small", { children: "ASSEGNATARIO" }),
                e.jsx("b", { children: t.assegnatario || "—" }),
              ],
            }),
            e.jsxs("div", {
              children: [
                e.jsx("small", { children: "TIPOLOGIA" }),
                e.jsx("b", { children: t.tipologia || "Task" }),
              ],
            }),
            e.jsxs("div", {
              children: [
                e.jsx("small", { children: "INIZIO" }),
                e.jsx("b", { children: Dt(t.inizio) }),
              ],
            }),
            e.jsxs("div", {
              children: [
                e.jsx("small", { children: "SCADENZA" }),
                e.jsx("b", { children: Dt(t.scadenza) }),
              ],
            }),
          ],
        }),
        e.jsxs("article", {
          children: [
            e.jsx("small", { children: "DESCRIZIONE COMPLETA" }),
            e.jsx("p", {
              children: t.descrizione || "Nessuna descrizione inserita.",
            }),
          ],
        }),
        e.jsxs("article", {
          children: [
            e.jsx("small", { children: "PERCORSO SERVER" }),
            e.jsx("p", {
              className: "server-path",
              children: t.linkServer || "Nessun percorso associato.",
            }),
          ],
        }),
        t.commenti &&
          e.jsxs("article", {
            className: "correction",
            children: [
              e.jsx("small", { children: "COMMENTI E CORREZIONI" }),
              e.jsx("p", { children: t.commenti }),
            ],
          }),
        e.jsxs("article", {
          children: [
            e.jsx("small", { children: "IMMAGINI DI RIFERIMENTO" }),
            (i = t.immagini) != null && i.length
              ? e.jsx("div", {
                  className: "desk-image-strip",
                  children: t.immagini.map((a, l) => {
                    const o = typeof a == "string" ? "" : a.url,
                      c = typeof a == "string" ? a : a.name;
                    return e.jsxs(
                      "button",
                      {
                        type: "button",
                        onClick: () => o && window.open(o, "_blank"),
                        children: [
                          o
                            ? e.jsx("img", { src: o, alt: c })
                            : e.jsx("span", { children: e.jsx(wt, {}) }),
                          e.jsx("small", { children: c }),
                        ],
                      },
                      `${c}-${l}`,
                    );
                  }),
                })
              : e.jsx("p", { children: "Nessuna immagine associata." }),
          ],
        }),
      ],
    }),
  });
}
function xv({ note: t, project: n, onClose: s }) {
  return t
    ? e.jsx(De, {
        title: "Nota del taccuino",
        subtitle: `${n.codice} · ${n.nome}`,
        onClose: s,
        children: e.jsxs("div", {
          className: "desk-project-note-detail",
          children: [
            e.jsxs("header", {
              children: [
                e.jsxs("span", {
                  children: [
                    e.jsx("i", { children: Lt(t.autore || "?") }),
                    e.jsx("b", { children: t.autore || "Autore" }),
                  ],
                }),
                e.jsx("time", { children: Dt(t.creata) }),
              ],
            }),
            e.jsx("article", { children: t.testo }),
            e.jsxs("footer", {
              children: [
                e.jsx("span", {
                  className: `desk-badge ${t.stato === "chiusa" ? "validata" : "in_lavorazione"}`,
                  children: t.stato === "chiusa" ? "Chiusa" : "Aperta",
                }),
                t.chiusa &&
                  e.jsxs("small", { children: ["Chiusa il ", Dt(t.chiusa)] }),
              ],
            }),
          ],
        }),
      })
    : null;
}
function jv({ tasks: t, hours: n, notes: s, projects: r }) {
  const { data: i, viewer: a, today: l } = Y(),
    o = r || i.progetti,
    [c, d] = C.useState("all"),
    [u, m] = C.useState(""),
    [x, j] = C.useState(null),
    [f, g] = C.useState("all"),
    [b, v] = C.useState(null),
    [h, p] = C.useState(null),
    y = (z) => projectStatusSlug(z),
    O = o
      .filter((z) => c === "all" || y(z.stato) === c)
      .filter((z) =>
        `${z.codice} ${z.nome}`.toLowerCase().includes(u.toLowerCase()),
      ),
    k = o.find((z) => z.codice === x);
  if (k) {
    const z = Yn(a, t, Mt).filter((_) => _.progettoCodice === k.codice),
      E = z.filter(
        (_) =>
          f === "all" ||
          (f === "open" ? He(_, l) !== "validata" : He(_, l) === f),
      ),
      U = n.filter((_) => _.progettoCodice === k.codice),
      P = U.reduce((_, A) => _ + Number(A.ore || 0), 0),
      $ = s.filter((_) => _.progettoCodice === k.codice),
      N = z.filter((_) => He(_, l) === "validata").length,
      I = [
        ["Urgent", "urgent|🔥"],
        ["High", "high|alta|🚴"],
        ["Medium", "medium|media|🏃"],
        ["Low", "low|bassa|🐌"],
      ].map(([_, A]) => ({
        label: _,
        count: z.filter((w) => new RegExp(A, "i").test(w.priorita || ""))
          .length,
      })),
      S = Math.max(1, ...I.map((_) => _.count)),
      L = [...new Set(U.map((_) => _.persona))]
        .map((_) => ({
          name: _,
          hours: U.filter((A) => A.persona === _).reduce(
            (A, w) => A + Number(w.ore || 0),
            0,
          ),
        }))
        .sort((_, A) => A.hours - _.hours)
        .slice(0, 5),
      H = Math.max(1, ...L.map((_) => _.hours));
    return e.jsxs(e.Fragment, {
      children: [
        e.jsxs("button", {
          className: "desk-back",
          onClick: () => {
            j(null), g("all");
          },
          children: [e.jsx(Re, {}), "Torna ai progetti"],
        }),
        e.jsx(ae, {
          eyebrow: `${k.codice} · ${k.stato}`,
          title: k.nome,
          subtitle: "Quadro operativo del progetto",
        }),
        e.jsxs("div", {
          className: "desk-stats",
          children: [
            e.jsx(Q, {
              label: "Task aperte",
              value: z.filter((_) => qe(_, l)).length,
            }),
            e.jsx(Q, {
              label: "In scadenza",
              value: z.filter((_) => Ce(_, l) === "in_scadenza").length,
              tone: "warn",
            }),
            e.jsx(Q, { label: "Ore registrate", value: ue(P) }),
            e.jsx(Q, {
              label: "Note aperte",
              value: $.filter((_) => _.stato !== "chiusa").length,
            }),
          ],
        }),
        e.jsxs("div", {
          className: "desk-project-task-filters",
          children: [
            e.jsx("span", { children: "FILTRA LE TASK" }),
            e.jsx("div", {
              className: "desk-segments",
              children: [
                ["all", "Tutte"],
                ["open", "Aperte"],
                ["in_lavorazione", "In lavorazione"],
                ["in_scadenza", "In scadenza"],
                ["scaduta", "Scadute"],
                ["in_verifica", "In verifica"],
                ["validata", "Validate"],
              ].map(([_, A]) =>
                e.jsx(
                  "button",
                  {
                    className: f === _ ? "on" : "",
                    onClick: () => g(_),
                    children: A,
                  },
                  _,
                ),
              ),
            }),
          ],
        }),
        e.jsxs("div", {
          className: "desk-project-analytics",
          children: [
            e.jsxs("section", {
              className: "desk-chart",
              children: [
                e.jsxs("header", {
                  children: [
                    e.jsxs("div", {
                      children: [
                        e.jsx("small", { children: "AVANZAMENTO" }),
                        e.jsx("h2", { children: "Completamento task" }),
                      ],
                    }),
                    e.jsxs("strong", {
                      children: [
                        Math.round((N / Math.max(1, z.length)) * 100),
                        "%",
                      ],
                    }),
                  ],
                }),
                e.jsx("div", {
                  className: "desk-project-progress-ring",
                  style: {
                    "--progress": `${(N / Math.max(1, z.length)) * 100}%`,
                  },
                  children: e.jsxs("span", {
                    children: [
                      e.jsx("b", { children: N }),
                      e.jsxs("small", { children: ["di ", z.length] }),
                    ],
                  }),
                }),
              ],
            }),
            e.jsxs("section", {
              className: "desk-chart",
              children: [
                e.jsx("header", {
                  children: e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "PRESSIONE" }),
                      e.jsx("h2", { children: "Priorità delle attività" }),
                    ],
                  }),
                }),
                e.jsx("div", {
                  className: "desk-priority-bars",
                  children: I.map((_) =>
                    e.jsxs(
                      "div",
                      {
                        children: [
                          e.jsx("span", { children: _.label }),
                          e.jsx("i", {
                            children: e.jsx("em", {
                              style: { width: `${(_.count / S) * 100}%` },
                            }),
                          }),
                          e.jsx("b", { children: _.count }),
                        ],
                      },
                      _.label,
                    ),
                  ),
                }),
              ],
            }),
            e.jsxs("section", {
              className: "desk-chart",
              children: [
                e.jsx("header", {
                  children: e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "TEAM" }),
                      e.jsx("h2", { children: "Ore per risorsa" }),
                    ],
                  }),
                }),
                e.jsx("div", {
                  className: "desk-bars",
                  children: L.map((_) =>
                    e.jsxs(
                      "div",
                      {
                        children: [
                          e.jsx("span", { children: _.name }),
                          e.jsx("i", {
                            children: e.jsx("em", {
                              className: "dark",
                              style: { width: `${(_.hours / H) * 100}%` },
                            }),
                          }),
                          e.jsx("b", { children: ue(_.hours) }),
                        ],
                      },
                      _.name,
                    ),
                  ),
                }),
              ],
            }),
          ],
        }),
        e.jsxs("div", {
          className: "desk-grid-2",
          children: [
            e.jsxs("section", {
              className: "desk-panel",
              children: [
                e.jsxs("header", {
                  children: [
                    e.jsxs("div", {
                      children: [
                        e.jsx("small", { children: "ATTIVITÀ" }),
                        e.jsx("h2", { children: "Task del progetto" }),
                      ],
                    }),
                    e.jsx("strong", { children: E.length }),
                  ],
                }),
                e.jsxs("div", {
                  className: "desk-rows",
                  children: [
                    E.map((_) =>
                      e.jsxs(
                        "button",
                        {
                          className: "desk-row",
                          onClick: () => v(_),
                          children: [
                            e.jsxs("span", {
                              children: [
                                e.jsx("b", {
                                  children: _.titolo || _.descrizione,
                                }),
                                e.jsxs("small", {
                                  children: [
                                    _.assegnatario,
                                    " · ",
                                    _.scadenza || "senza scadenza",
                                  ],
                                }),
                              ],
                            }),
                            e.jsx("span", {
                              className: `desk-badge ${He(_, l)}`,
                              children: cn(He(_, l)),
                            }),
                          ],
                        },
                        _.id,
                      ),
                    ),
                    !E.length &&
                      e.jsx("p", {
                        className: "desk-empty",
                        children: "Nessuna task con questo filtro.",
                      }),
                  ],
                }),
              ],
            }),
            e.jsxs("section", {
              className: "desk-panel",
              children: [
                e.jsx("header", {
                  children: e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "TACCUINO" }),
                      e.jsx("h2", { children: "Note del progetto" }),
                    ],
                  }),
                }),
                e.jsxs("div", {
                  className: "desk-rows",
                  children: [
                    $.slice(0, 8).map((_) =>
                      e.jsxs(
                        "button",
                        {
                          className: "desk-note-row clickable",
                          onClick: () => p(_),
                          children: [
                            e.jsxs("span", {
                              children: [
                                e.jsx("b", { children: _.autore || "Autore" }),
                                e.jsx("small", { children: _.creata || "" }),
                              ],
                            }),
                            e.jsx("p", { children: _.testo }),
                            e.jsx(ve, {}),
                          ],
                        },
                        _.id,
                      ),
                    ),
                    !$.length &&
                      e.jsx("p", {
                        className: "desk-empty",
                        children: "Nessuna nota.",
                      }),
                  ],
                }),
              ],
            }),
          ],
        }),
        b && e.jsx(fv, { task: b, today: l, onClose: () => v(null) }),
        h && e.jsx(xv, { note: h, project: k, onClose: () => p(null) }),
      ],
    });
  }
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(ae, {
        title: "Progetti",
        subtitle: "Vista desktop uniforme di commesse, attività, ore e note.",
      }),
      e.jsxs("div", {
        className: "desk-toolbar project-toolbar",
        children: [
          e.jsx(fe, {
            label: "Stato progetto",
            value: c,
            options: [
              { value: "all", label: "Tutti gli stati" },
              ...PROJECT_STATUS_OPTIONS.map((z) => ({
                value: projectStatusSlug(z.value),
                label: z.value,
                meta: z.description,
              })),
            ],
            onChange: d,
          }),
          e.jsx("input", {
            className: "desk-search",
            value: u,
            onChange: (z) => m(z.target.value),
            placeholder: "Cerca per codice o nome",
          }),
        ],
      }),
      e.jsx("div", {
        className: "desk-project-grid",
        children: O.map((z) => {
          const E = t.filter(
              (P) => P.progettoCodice === z.codice && qe(P, l),
            ).length,
            U = n
              .filter((P) => P.progettoCodice === z.codice)
              .reduce((P, $) => P + Number($.ore || 0), 0);
          return e.jsxs(
            "button",
            {
              onClick: () => j(z.codice),
              children: [
                e.jsxs("header", {
                  children: [
                    e.jsxs("span", {
                      children: [
                        e.jsx("small", { children: z.codice }),
                        e.jsx("b", { children: z.nome }),
                      ],
                    }),
                    e.jsx("i", {
                      className: `project-state ${projectStatusSlug(z.stato)}`,
                      children: normalizeProjectStatus(z.stato),
                    }),
                  ],
                }),
                e.jsxs("div", {
                  children: [
                    e.jsxs("span", {
                      children: [
                        e.jsx("b", { children: E }),
                        e.jsx("small", { children: "task aperte" }),
                      ],
                    }),
                    e.jsxs("span", {
                      children: [
                        e.jsx("b", { children: ue(U) }),
                        e.jsx("small", { children: "ore registrate" }),
                      ],
                    }),
                    e.jsxs("span", {
                      children: [
                        e.jsx("b", {
                          children: s.filter(
                            (P) =>
                              P.progettoCodice === z.codice &&
                              P.stato !== "chiusa",
                          ).length,
                        }),
                        e.jsx("small", { children: "note aperte" }),
                      ],
                    }),
                  ],
                }),
                e.jsxs("footer", {
                  children: ["Apri scheda progetto ", e.jsx(ve, {})],
                }),
              ],
            },
            z.codice,
          );
        }),
      }),
    ],
  });
}
function vv({ notes: t, setNotes: n, projects: s }) {
  var y, O;
  const { data: r, viewer: i, today: a } = Y(),
    l = s || r.progetti,
    [o, c] = C.useState(
      ((y = l.find((k) => normalizeProjectStatus(k.stato) === "Active")) == null
        ? void 0
        : y.codice) ||
        ((O = l[0]) == null ? void 0 : O.codice) ||
        "",
    ),
    [d, u] = C.useState(!1),
    [m, x] = C.useState(!1),
    [j, f] = C.useState(""),
    [g, b] = C.useState(""),
    v = l.find((k) => k.codice === o),
    h = t.filter((k) => k.progettoCodice === o),
    p = (k) => {
      k.preventDefault(),
        g.trim() &&
          (n((z) => [
            {
              id: en("demo-note"),
              progettoCodice: o,
              autore: i.nome,
              creata: a,
              testo: g.trim(),
              stato: "aperta",
              chiusa: null,
            },
            ...z,
          ]),
          b(""),
          x(!1));
    };
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(ae, {
        title: "Taccuino",
        subtitle: "Note operative organizzate per progetto.",
        action: e.jsxs("button", {
          className: "desk-primary",
          onClick: () => x(!0),
          children: [e.jsx(tt, {}), "Nuova nota"],
        }),
      }),
      e.jsxs("button", {
        className: "desk-project-picker",
        onClick: () => u(!0),
        children: [
          e.jsxs("span", {
            children: [
              e.jsx("small", { children: "PROGETTO SELEZIONATO" }),
              e.jsx("b", {
                children: v ? `${v.codice} · ${v.nome}` : "Nessun progetto",
              }),
            ],
          }),
          e.jsx(_t, {}),
        ],
      }),
      e.jsxs("div", {
        className: "desk-note-columns",
        children: [
          e.jsxs("section", {
            className: "desk-panel",
            children: [
              e.jsxs("header", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "APERTE" }),
                      e.jsx("h2", { children: "Note da gestire" }),
                    ],
                  }),
                  e.jsx("strong", {
                    children: h.filter((k) => k.stato !== "chiusa").length,
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "desk-note-list",
                children: [
                  h
                    .filter((k) => k.stato !== "chiusa")
                    .map((k) =>
                      e.jsxs(
                        "article",
                        {
                          children: [
                            e.jsxs("header", {
                              children: [
                                e.jsxs("span", {
                                  children: [
                                    e.jsx("i", {
                                      children: Lt(k.autore || "?"),
                                    }),
                                    e.jsx("b", {
                                      children: k.autore || "Autore",
                                    }),
                                  ],
                                }),
                                e.jsx("time", { children: k.creata || "" }),
                              ],
                            }),
                            e.jsx("p", { children: k.testo }),
                            e.jsx("button", {
                              onClick: () =>
                                n((z) =>
                                  z.map((E) =>
                                    E.id === k.id
                                      ? { ...E, stato: "chiusa", chiusa: a }
                                      : E,
                                  ),
                                ),
                              children: "Segna come chiusa",
                            }),
                          ],
                        },
                        k.id,
                      ),
                    ),
                  !h.some((k) => k.stato !== "chiusa") &&
                    e.jsx("p", {
                      className: "desk-empty",
                      children: "Nessuna nota aperta.",
                    }),
                ],
              }),
            ],
          }),
          e.jsxs("section", {
            className: "desk-panel",
            children: [
              e.jsxs("header", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "ARCHIVIO" }),
                      e.jsx("h2", { children: "Note chiuse" }),
                    ],
                  }),
                  e.jsx("strong", {
                    children: h.filter((k) => k.stato === "chiusa").length,
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "desk-note-list closed",
                children: [
                  h
                    .filter((k) => k.stato === "chiusa")
                    .map((k) =>
                      e.jsxs(
                        "article",
                        {
                          children: [
                            e.jsxs("header", {
                              children: [
                                e.jsxs("span", {
                                  children: [
                                    e.jsx("i", {
                                      children: Lt(k.autore || "?"),
                                    }),
                                    e.jsx("b", {
                                      children: k.autore || "Autore",
                                    }),
                                  ],
                                }),
                                e.jsx("time", {
                                  children: k.chiusa || k.creata || "",
                                }),
                              ],
                            }),
                            e.jsx("p", { children: k.testo }),
                          ],
                        },
                        k.id,
                      ),
                    ),
                  !h.some((k) => k.stato === "chiusa") &&
                    e.jsx("p", {
                      className: "desk-empty",
                      children: "Nessuna nota chiusa.",
                    }),
                ],
              }),
            ],
          }),
        ],
      }),
      d &&
        e.jsxs(De, {
          title: "Scegli progetto",
          subtitle: "Il selettore resta centrato nella schermata",
          onClose: () => {
            u(!1), f("");
          },
          children: [
            e.jsx("input", {
              className: "desk-modal-search",
              autoFocus: !0,
              value: j,
              onChange: (k) => f(k.target.value),
              placeholder: "Cerca per codice o nome",
            }),
            e.jsx("div", {
              className: "desk-select-options",
              children: l
                .filter((k) =>
                  `${k.codice} ${k.nome}`
                    .toLowerCase()
                    .includes(j.toLowerCase()),
                )
                .map((k) =>
                  e.jsxs(
                    "button",
                    {
                      className: k.codice === o ? "on" : "",
                      onClick: () => {
                        c(k.codice), u(!1), f("");
                      },
                      children: [
                        e.jsxs("span", {
                          children: [
                            e.jsxs("b", {
                              children: [k.codice, " · ", k.nome],
                            }),
                            e.jsxs("small", {
                              children: [
                                k.stato,
                                " · ",
                                t.filter((z) => z.progettoCodice === k.codice)
                                  .length,
                                " note",
                              ],
                            }),
                          ],
                        }),
                        e.jsx("i", { children: k.codice === o ? "✓" : "" }),
                      ],
                    },
                    k.codice,
                  ),
                ),
            }),
          ],
        }),
      m &&
        e.jsx(De, {
          title: "Nuova nota",
          subtitle: v ? `${v.codice} · ${v.nome}` : "",
          onClose: () => x(!1),
          children: e.jsxs("form", {
            className: "desk-new-note",
            onSubmit: p,
            children: [
              e.jsxs("label", {
                children: [
                  "Testo della nota",
                  e.jsx("textarea", {
                    autoFocus: !0,
                    value: g,
                    onChange: (k) => b(k.target.value),
                    placeholder: "Scrivi qui l’annotazione da condividere…",
                  }),
                ],
              }),
              e.jsxs("div", {
                children: [
                  e.jsx("button", {
                    type: "button",
                    onClick: () => x(!1),
                    children: "Annulla",
                  }),
                  e.jsx("button", {
                    className: "desk-primary",
                    type: "submit",
                    children: "Salva nota",
                  }),
                ],
              }),
            ],
          }),
        }),
    ],
  });
}
function gv({ items: t }) {
  const { setTab: n, viewer: s } = Y(),
    r = t || [
      ["prenota", "Prenotazioni", "Auto, materiali e sale riunioni", Wt],
      ["bim", "BIM Portal", "Guide Revit e standard condivisi", ga],
      [
        "visual",
        "Visual Department",
        "Richieste render, assegnazioni e consegne",
        ya,
      ],
      ["inarchea", "IN ARCHEA", "Report, eventi e sondaggi", An],
    ],
    { itemProps: i, reset: a } = Fs(
      `archea-more-order-${s.id}`,
      r.map((l) => l[0]),
    );
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(ae, {
        title: "Altro",
        subtitle:
          "Strumenti secondari e sezioni spostate dal menu principale. Trascina le schede per riordinarle.",
        action: e.jsx("button", {
          className: "desk-small-button",
          onClick: a,
          children: "Ripristina ordine",
        }),
      }),
      e.jsx("div", {
        className: "desk-more-grid",
        children: r.map(([l, o, c, d]) =>
          Dr.createElement(
            "button",
            { className: "movable", ...i(l), onClick: () => n(l), key: l },
            e.jsx("span", { children: e.jsx(d, {}) }),
            e.jsxs("div", {
              children: [
                e.jsx("b", { children: o }),
                e.jsx("small", { children: c }),
              ],
            }),
            e.jsx(ve, {}),
          ),
        ),
      }),
    ],
  });
}
function yv({
  projects: t,
  setProjects: n,
  staffProfiles: s,
  setStaffProfiles: r,
}) {
  var A;
  const { data: i, today: a } = Y(),
    [l, o] = C.useState(((A = t[0]) == null ? void 0 : A.codice) || ""),
    [c, d] = C.useState(!1),
    [u, m] = C.useState(null),
    [x, j] = C.useState(!1),
    [f, g] = ke("archea-project-manager-people", []),
    [b, v] = ke("archea-project-manager-removed-people", []),
    [h, p] = ke("archea-project-manager-assignments", {}),
    [y, O] = C.useState({
      codice: "",
      nome: "",
      stato: "Planning",
      studio: "firenze",
    }),
    [k, z] = C.useState({
      nome: "",
      email: "",
      ruolo: "Architect",
      studio: "firenze",
    }),
    E = [...i.persone, ...f].filter((w) => !b.includes(w.id)),
    U = t.find((w) => w.codice === l) || t[0],
    P = h[U == null ? void 0 : U.codice] || [],
    $ = t.find((w) => w.codice === u),
    N = (w, B) => {
      n((T) => T.map((D) => (D.codice === w ? { ...D, stato: B } : D))),
        m(null);
    },
    I = (w) => {
      const B = P.includes(w) ? P.filter((T) => T !== w) : [...P, w];
      p((T) => ({ ...T, [U.codice]: B })),
        r((T) => {
          const D = { ...T };
          Object.keys(D).forEach((M) => {
            var q, Z;
            M !== w &&
              (Z = (q = D[M]) == null ? void 0 : q.projects) != null &&
              Z.includes(U.codice) &&
              !B.includes(M) &&
              (D[M] = {
                ...D[M],
                projects: D[M].projects.filter((Qe) => Qe !== U.codice),
              });
          });
          const X = D[w] || {};
          return (
            (D[w] = {
              ...X,
              projects: B.includes(w)
                ? [...new Set([...(X.projects || []), U.codice])]
                : (X.projects || []).filter((M) => M !== U.codice),
            }),
            D
          );
        });
    },
    S = (w) => {
      w.preventDefault();
      const B = y.codice.trim().toUpperCase();
      !B ||
        !y.nome.trim() ||
        t.some((T) => T.codice === B) ||
        (n((T) => [
          ...T,
          {
            codice: B,
            nome: y.nome.trim(),
            stato: y.stato,
            studio: y.studio,
            createdAt: a,
          },
        ]),
        o(B),
        O({ codice: "", nome: "", stato: "Planning", studio: "firenze" }),
        d(!1));
    },
    L = (w) => {
      if ((w.preventDefault(), !k.nome.trim())) return;
      const B = { ...k, id: en("person"), nome: k.nome.trim() };
      g((T) => [...T, B]),
        z({ nome: "", email: "", ruolo: "Architect", studio: "firenze" }),
        j(!1);
    },
    H = (w) => {
      f.some((B) => B.id === w)
        ? g((B) => B.filter((T) => T.id !== w))
        : v((B) => [...new Set([...B, w])]),
        p((B) =>
          Object.fromEntries(
            Object.entries(B).map(([T, D]) => [T, D.filter((X) => X !== w)]),
          ),
        );
    },
    _ = (w) => {
      var B;
      n((T) => T.filter((D) => D.codice !== w)),
        p((T) => {
          const D = { ...T };
          return delete D[w], D;
        }),
        r((T) =>
          Object.fromEntries(
            Object.entries(T).map(([D, X]) => [
              D,
              { ...X, projects: (X.projects || []).filter((M) => M !== w) },
            ]),
          ),
        ),
        m(null),
        o(
          ((B = t.find((T) => T.codice !== w)) == null ? void 0 : B.codice) ||
            "",
        );
    };
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(ae, {
        title: "Project Manager",
        subtitle:
          "Gestisci in un unico spazio commesse, stati, organico e assegnazioni.",
        action: e.jsxs("button", {
          className: "desk-primary",
          onClick: () => d(!0),
          children: [e.jsx(tt, {}), "Aggiungi progetto"],
        }),
      }),
      e.jsxs("section", {
        className: "desk-panel desk-pm-projects",
        children: [
          e.jsxs("header", {
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("small", { children: "COMMESSE" }),
                  e.jsx("h2", { children: "Elenco progetti" }),
                ],
              }),
              e.jsx("strong", { children: t.length }),
            ],
          }),
          e.jsx("div", {
            className: "desk-pm-project-grid",
            children: t.map((w) =>
              e.jsxs(
                "article",
                {
                  className:
                    (U == null ? void 0 : U.codice) === w.codice ? "on" : "",
                  children: [
                    e.jsxs("button", {
                      className: "desk-pm-project-main",
                      onClick: () => o(w.codice),
                      children: [
                        e.jsx("small", { children: w.codice }),
                        e.jsx("b", { children: w.nome }),
                        e.jsxs("span", {
                          children: [(h[w.codice] || []).length, " risorse"],
                        }),
                      ],
                    }),
                    e.jsxs("button", {
                      type: "button",
                      className: `project-state ${projectStatusSlug(w.stato)}`,
                      onClick: () => m(w.codice),
                      children: [normalizeProjectStatus(w.stato), e.jsx(_t, {})],
                    }),
                  ],
                },
                w.codice,
              ),
            ),
          }),
        ],
      }),
      e.jsxs("section", {
        className: "desk-panel desk-pm-team-panel",
        children: [
          e.jsxs("header", {
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("small", { children: "ORGANICO E ASSEGNAZIONI" }),
                  e.jsx("h2", {
                    children: U
                      ? `Team · ${U.codice} · ${U.nome}`
                      : "Risorse del gruppo",
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "desk-widget-head-actions",
                children: [
                  e.jsxs("strong", {
                    children: [P.length, " assegnate · ", E.length, " totali"],
                  }),
                  e.jsxs("button", {
                    className: "desk-primary",
                    onClick: () => j(!0),
                    children: [e.jsx(tt, {}), "Aggiungi risorsa"],
                  }),
                ],
              }),
            ],
          }),
          e.jsx("p", {
            className: "desk-panel-intro",
            children:
              "Seleziona una persona per aggiungerla o rimuoverla dal progetto attivo. “Aggiungi risorsa” amplia invece l’organico disponibile per tutte le commesse.",
          }),
          e.jsx("div", {
            className: "desk-pm-team",
            children: E.map((w) => {
              const B = P.includes(w.id);
              return e.jsxs(
                "article",
                {
                  className: B ? "on" : "",
                  children: [
                    e.jsxs("button", {
                      type: "button",
                      onClick: () => U && I(w.id),
                      children: [
                        e.jsx("i", { children: Lt(w.nome) }),
                        e.jsxs("span", {
                          children: [
                            e.jsx("b", { children: w.nome }),
                            e.jsxs("small", {
                              children: [
                                w.ruolo || "Architect",
                                " · ",
                                w.studio || "Firenze",
                              ],
                            }),
                          ],
                        }),
                        e.jsx("em", {
                          children: B ? "Rimuovi dal team" : "Assegna al team",
                        }),
                      ],
                    }),
                    e.jsx("button", {
                      type: "button",
                      className: "desk-pm-remove-person",
                      onClick: () => H(w.id),
                      "aria-label": `Elimina ${w.nome}`,
                      children: "×",
                    }),
                  ],
                },
                w.id,
              );
            }),
          }),
        ],
      }),
      $ &&
        e.jsxs(De, {
          title: "Stato del progetto",
          subtitle: `${$.codice} · ${$.nome}`,
          onClose: () => m(null),
          children: [
            e.jsx("div", {
              className: "desk-select-options",
              children: PROJECT_STATUS_OPTIONS.map((w) =>
                e.jsxs(
                  "button",
                  {
                    type: "button",
                    className: `status-option ${projectStatusSlug(w.value)}${normalizeProjectStatus($.stato) === w.value ? " on" : ""}`,
                    onClick: () => N($.codice, w.value),
                    children: [
                      e.jsxs("span", {
                        children: [
                          e.jsx("b", { children: w.value }),
                          e.jsx("small", { children: w.description }),
                        ],
                      }),
                      e.jsx("i", {
                        children:
                          normalizeProjectStatus($.stato) === w.value ? "✓" : "",
                      }),
                    ],
                  },
                  w.value,
                ),
              ),
            }),
            e.jsx("button", {
              type: "button",
              className: "desk-delete-project",
              onClick: () => _($.codice),
              children: "Rimuovi progetto dalla demo",
            }),
          ],
        }),
      x &&
        e.jsx(De, {
          title: "Nuova risorsa",
          subtitle: "Aggiungi una persona all’organico disponibile",
          onClose: () => j(!1),
          children: e.jsxs("form", {
            className: "desk-event-form",
            onSubmit: L,
            children: [
              e.jsxs("label", {
                children: [
                  "Nome e cognome",
                  e.jsx("input", {
                    autoFocus: !0,
                    value: k.nome,
                    onChange: (w) => z({ ...k, nome: w.target.value }),
                  }),
                ],
              }),
              e.jsxs("label", {
                children: [
                  "Email aziendale",
                  e.jsx("input", {
                    type: "email",
                    value: k.email,
                    onChange: (w) => z({ ...k, email: w.target.value }),
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "desk-form-row",
                children: [
                  e.jsx(fe, {
                    label: "Ruolo",
                    value: k.ruolo,
                    options: [
                      "Architect",
                      "Senior Architect",
                      "Partner Architect",
                    ].map((w) => ({ value: w, label: w })),
                    onChange: (w) => z({ ...k, ruolo: w }),
                  }),
                  e.jsx(fe, {
                    label: "Studio",
                    value: k.studio,
                    options: je.map((w) => ({ value: w.id, label: w.name })),
                    onChange: (w) => z({ ...k, studio: w }),
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "desk-modal-actions",
                children: [
                  e.jsx("button", {
                    type: "button",
                    onClick: () => j(!1),
                    children: "Annulla",
                  }),
                  e.jsx("button", {
                    className: "desk-primary",
                    type: "submit",
                    children: "Aggiungi all’organico",
                  }),
                ],
              }),
            ],
          }),
        }),
      c &&
        e.jsx(De, {
          title: "Nuovo progetto",
          subtitle: "Aggiungi una nuova commessa alla demo",
          onClose: () => d(!1),
          children: e.jsxs("form", {
            className: "desk-event-form",
            onSubmit: S,
            children: [
              e.jsxs("div", {
                className: "desk-form-row",
                children: [
                  e.jsxs("label", {
                    children: [
                      "Codice progetto",
                      e.jsx("input", {
                        autoFocus: !0,
                        value: y.codice,
                        onChange: (w) => O({ ...y, codice: w.target.value }),
                        placeholder: "es. P60",
                      }),
                    ],
                  }),
                  e.jsx(fe, {
                    label: "Stato",
                    value: y.stato,
                    options: PROJECT_STATUS_OPTIONS.map((w) => ({
                      value: w.value,
                      label: w.value,
                      meta: w.description,
                    })),
                    onChange: (w) => O({ ...y, stato: w }),
                  }),
                ],
              }),
              e.jsxs("label", {
                children: [
                  "Nome progetto",
                  e.jsx("input", {
                    value: y.nome,
                    onChange: (w) => O({ ...y, nome: w.target.value }),
                  }),
                ],
              }),
              e.jsx(fe, {
                label: "Studio",
                value: y.studio,
                options: je.map((w) => ({ value: w.id, label: w.name })),
                onChange: (w) => O({ ...y, studio: w }),
              }),
              e.jsxs("div", {
                className: "desk-modal-actions",
                children: [
                  e.jsx("button", {
                    type: "button",
                    onClick: () => d(!1),
                    children: "Annulla",
                  }),
                  e.jsx("button", {
                    className: "desk-primary",
                    type: "submit",
                    children: "Crea progetto",
                  }),
                ],
              }),
            ],
          }),
        }),
    ],
  });
}
function Nv({
  onClose: t,
  catalog: n,
  mainIds: s,
  setMainIds: r,
  projects: i,
  staffProfiles: a,
  setStaffProfiles: l,
  preferences: o,
  setPreferences: c,
}) {
  const {
      viewer: d,
      language: u,
      setLanguage: m,
      importExcel: apsImportExcel,
    } = Y(),
    [x, j] = C.useState("menu"),
    f = a[d.id] || {},
    g = (p, y) => l((O) => ({ ...O, [d.id]: { ...(O[d.id] || {}), [p]: y } })),
    b = (p, y) =>
      r((O) => {
        const k = O.indexOf(p);
        if (k < 0) return O;
        const z = k + y;
        if (z < 0 || z >= O.length) return O;
        const E = [...O];
        return ([E[k], E[z]] = [E[z], E[k]]), E;
      }),
    v = (p, y) =>
      r((O) =>
        y ? [...O.filter((k) => k !== p), p] : O.filter((k) => k !== p),
      ),
    h = [
      ...s.map((p) => n.find((y) => y[0] === p)).filter(Boolean),
      ...n.filter((p) => !s.includes(p[0])),
    ];
  return e.jsx(De, {
    title: "Impostazioni",
    subtitle: "Personalizza ARCHEA WORKSPACE per il tuo modo di lavorare",
    onClose: t,
    wide: !0,
    children: e.jsxs("div", {
      className: "desk-settings",
      children: [
        e.jsx("nav", {
          children: [
            ["menu", "Menu e sezioni"],
            ["profile", "Profilo e lavoro"],
            ["language", "Lingua e interfaccia"],
          ].map(([p, y]) =>
            e.jsx(
              "button",
              {
                className: x === p ? "on" : "",
                onClick: () => j(p),
                children: y,
              },
              p,
            ),
          ),
        }),
        e.jsxs("div", {
          className: "desk-settings-content",
          children: [
            x === "menu" &&
              e.jsxs(e.Fragment, {
                children: [
                  e.jsxs("header", {
                    children: [
                      e.jsx("small", { children: "ORGANIZZAZIONE" }),
                      e.jsx("h3", { children: "Menu laterale" }),
                      e.jsx("p", {
                        children:
                          "Scegli cosa lasciare sempre visibile e cosa spostare in “Altro”. Le frecce aggiornano subito anche l’ordine dei blocchi qui sotto.",
                      }),
                    ],
                  }),
                  e.jsx("div", {
                    className: "desk-menu-config",
                    children: h.map(([p, y, O]) => {
                      const k = s.includes(p),
                        z = s.indexOf(p);
                      return e.jsxs(
                        "article",
                        {
                          className: k ? "is-main" : "is-more",
                          children: [
                            e.jsx("span", { children: e.jsx(O, {}) }),
                            e.jsxs("div", {
                              children: [
                                e.jsx("b", { children: y }),
                                e.jsx("small", {
                                  children: k
                                    ? "Menu principale"
                                    : "Dentro Altro",
                                }),
                              ],
                            }),
                            e.jsxs("div", {
                              className: "desk-menu-order",
                              children: [
                                e.jsx("button", {
                                  disabled: !k || z === 0,
                                  onClick: () => b(p, -1),
                                  "aria-label": "Sposta in alto",
                                  children: "↑",
                                }),
                                e.jsx("button", {
                                  disabled: !k || z === s.length - 1,
                                  onClick: () => b(p, 1),
                                  "aria-label": "Sposta in basso",
                                  children: "↓",
                                }),
                              ],
                            }),
                            e.jsx("button", {
                              className: k ? "main" : "more",
                              onClick: () => v(p, !k),
                              children: k
                                ? "Sposta in Altro"
                                : "Metti nel menu",
                            }),
                          ],
                        },
                        p,
                      );
                    }),
                  }),
                ],
              }),
            x === "profile" &&
              e.jsxs(e.Fragment, {
                children: [
                  e.jsxs("header", {
                    children: [
                      e.jsx("small", { children: "ANAGRAFICA" }),
                      e.jsx("h3", {
                        children: "Dati personali e professionali",
                      }),
                      e.jsx("p", {
                        children:
                          "I progetti seguiti si gestiscono ora esclusivamente dal Project Manager.",
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "desk-settings-form",
                    children: [
                      e.jsxs("div", {
                        className: "desk-form-row",
                        children: [
                          e.jsxs("label", {
                            children: [
                              "Nome e cognome",
                              e.jsx("input", {
                                value: f.name ?? d.nome,
                                onChange: (p) => g("name", p.target.value),
                              }),
                            ],
                          }),
                          e.jsxs("label", {
                            children: [
                              "Email aziendale",
                              e.jsx("input", {
                                type: "email",
                                value: f.email ?? d.email ?? "",
                                onChange: (p) => g("email", p.target.value),
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "desk-form-row",
                        children: [
                          e.jsxs("label", {
                            children: [
                              "Telefono",
                              e.jsx("input", {
                                value: f.phone ?? "",
                                onChange: (p) => g("phone", p.target.value),
                                placeholder: "+39 ...",
                              }),
                            ],
                          }),
                          e.jsxs("label", {
                            children: [
                              "Sede",
                              e.jsx(fe, {
                                label: "",
                                value: f.studio ?? "firenze",
                                options: je.map((p) => ({
                                  value: p.id,
                                  label: p.name,
                                })),
                                onChange: (p) => g("studio", p),
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "desk-form-row",
                        children: [
                          e.jsxs("label", {
                            children: [
                              "Ruolo",
                              e.jsx("input", {
                                value: Xt[d.appRole],
                                disabled: !0,
                              }),
                            ],
                          }),
                          e.jsxs("label", {
                            children: [
                              "Mansione",
                              e.jsx("input", {
                                value: f.jobTitle ?? "",
                                onChange: (p) => g("jobTitle", p.target.value),
                                placeholder: "es. Project Leader",
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            x === "language" &&
              e.jsxs(e.Fragment, {
                children: [
                  e.jsxs("header", {
                    children: [
                      e.jsx("small", { children: "INTERFACCIA" }),
                      e.jsx("h3", { children: "Lingua e comportamento" }),
                      e.jsx("p", {
                        children:
                          "Le preferenze restano salvate su questo browser nella versione demo.",
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "desk-setting-options",
                    children: [
                      e.jsxs("article", {
                        children: [
                          e.jsxs("span", {
                            children: [
                              e.jsx("b", { children: "Lingua" }),
                              e.jsx("small", {
                                children: "Italiano o inglese",
                              }),
                            ],
                          }),
                          e.jsxs("div", {
                            className: "desk-segments",
                            children: [
                              e.jsx("button", {
                                className: u === "it" ? "on" : "",
                                onClick: () => m("it"),
                                children: "Italiano",
                              }),
                              e.jsx("button", {
                                className: u === "en" ? "on" : "",
                                onClick: () => m("en"),
                                children: "English",
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsxs("article", {
                        className: "desk-text-scale-setting",
                        children: [
                          e.jsxs("span", {
                            children: [
                              e.jsx("b", { children: "Dimensione testo" }),
                              e.jsx("small", {
                                children:
                                  "Ingrandisce soltanto i caratteri: pannelli, pulsanti e spazi restano invariati",
                              }),
                            ],
                          }),
                          e.jsxs("div", {
                            children: [
                              e.jsx("span", {
                                className: "preview",
                                style: {
                                  fontSize: `${14 * (o.textScale || 1)}px`,
                                },
                                children: "Aa",
                              }),
                              e.jsx("input", {
                                type: "range",
                                min: "0.8",
                                max: "1.35",
                                step: "0.05",
                                value: o.textScale || 1,
                                onChange: (p) =>
                                  c((y) => ({
                                    ...y,
                                    textScale: Number(p.target.value),
                                  })),
                              }),
                              e.jsxs("em", {
                                children: [
                                  Math.round((o.textScale || 1) * 100),
                                  "%",
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsxs("article", {
                        children: [
                          e.jsxs("span", {
                            children: [
                              e.jsx("b", { children: "Menu compatto" }),
                              e.jsx("small", {
                                children:
                                  "Riduce leggermente altezza e spaziatura delle sezioni",
                              }),
                            ],
                          }),
                          e.jsx("button", {
                            className: `desk-toggle ${o.compactMenu ? "on" : ""}`,
                            onClick: () =>
                              c((p) => ({ ...p, compactMenu: !p.compactMenu })),
                            children: e.jsx("i", {}),
                          }),
                        ],
                      }),
                      e.jsxs("article", {
                        children: [
                          e.jsxs("span", {
                            children: [
                              e.jsx("b", {
                                children: "Animazioni interfaccia",
                              }),
                              e.jsx("small", {
                                children:
                                  "Soft spring, grafici e transizioni tra le pagine",
                              }),
                            ],
                          }),
                          e.jsx("button", {
                            className: `desk-toggle ${o.animations !== !1 ? "on" : ""}`,
                            onClick: () =>
                              c((p) => ({
                                ...p,
                                animations: p.animations === !1,
                              })),
                            children: e.jsx("i", {}),
                          }),
                        ],
                      }),
                      e.jsxs("article", {
                        children: [
                          e.jsxs("span", {
                            children: [
                              e.jsx("b", { children: "Notifiche" }),
                              e.jsx("small", {
                                children: "Eventi, task assegnate e verifiche",
                              }),
                            ],
                          }),
                          e.jsx("button", {
                            className: `desk-toggle ${o.notifications !== !1 ? "on" : ""}`,
                            onClick: () =>
                              c((p) => ({
                                ...p,
                                notifications: p.notifications === !1,
                              })),
                            children: e.jsx("i", {}),
                          }),
                        ],
                      }),
                      e.jsxs("article", {
                        className: "desk-excel-setting",
                        children: [
                          e.jsxs("span", {
                            children: [
                              e.jsx("b", { children: "Aggiorna dati da Excel" }),
                              e.jsx("small", {
                                children:
                                  "Carica un file .xlsx aggiornato. I dati restano locali in questo browser.",
                              }),
                            ],
                          }),
                          e.jsxs("label", {
                            className: "desk-primary",
                            children: [
                              "Carica Excel",
                              e.jsx("input", {
                                type: "file",
                                hidden: !0,
                                accept: ".xlsx,.xlsm,.xls",
                                onChange: (p) => {
                                  var y;
                                  const O = (y = p.target.files) == null ? void 0 : y[0];
                                  O && apsImportExcel(O);
                                  p.target.value = "";
                                },
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "desk-safari-tip",
                    children: [
                      e.jsx("b", {
                        children: "Installazione su Mac con Safari",
                      }),
                      e.jsx("p", {
                        children:
                          "Da macOS Sonoma 14: apri il menu File e scegli “Aggiungi al Dock”.",
                      }),
                    ],
                  }),
                ],
              }),
          ],
        }),
      ],
    }),
  });
}
function kv() {
  const { viewer: t } = Y(),
    n = ["Auto", "Materiale", "Sale"],
    [s, r] = ke("archea-desktop-bookings", []),
    { itemProps: i, reset: a } = Fs(`archea-booking-order-${t.id}`, n),
    l = {
      Auto: "Auto di studio",
      Materiale: "Attrezzature",
      Sale: "Sale riunioni",
    };
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(ae, {
        title: "Prenotazioni",
        subtitle:
          "Auto, attrezzature e sale riunioni in una vista desktop organizzabile.",
        action: e.jsx("button", {
          className: "desk-small-button",
          onClick: a,
          children: "Ripristina ordine",
        }),
      }),
      e.jsx("div", {
        className: "desk-tool-grid",
        children: n.map((o) =>
          Dr.createElement(
            "section",
            { className: "desk-panel movable", ...i(o), key: o },
            e.jsxs("header", {
              children: [
                e.jsxs("div", {
                  children: [
                    e.jsx("small", { children: o.toUpperCase() }),
                    e.jsx("h2", { children: l[o] }),
                  ],
                }),
                e.jsx("strong", { children: "⋮⋮" }),
              ],
            }),
            e.jsx("div", {
              className: "desk-resource-list",
              children: Rp.filter((c) => c.category === o).map((c) => {
                const d = s.includes(c.id);
                return e.jsxs(
                  "button",
                  {
                    className: `${d ? "mine " : ""}${!c.available && !d ? "busy" : ""}`,
                    onClick: () => c.available && !d && r((u) => [...u, c.id]),
                    children: [
                      e.jsx("i", {
                        children: c.name.slice(0, 2).toUpperCase(),
                      }),
                      e.jsxs("span", {
                        children: [
                          e.jsx("b", { children: c.name }),
                          e.jsx("small", {
                            children: d
                              ? "Prenotato da te"
                              : c.available
                                ? "Disponibile"
                                : "Occupato",
                          }),
                        ],
                      }),
                      e.jsx("em", {
                        children: d
                          ? "Confermato"
                          : c.available
                            ? "Prenota"
                            : "Non disponibile",
                      }),
                    ],
                  },
                  c.id,
                );
              }),
            }),
          ),
        ),
      }),
    ],
  });
}
function Sv() {
  const { viewer: t } = Y(),
    [n, s] = C.useState(""),
    [r, i] = C.useState("all"),
    a = [
      ["all", "Tutte"],
      ["base", "Base"],
      ["documentazione", "Tavole"],
      ["collaborazione", "Team"],
      ["famiglie", "Famiglie"],
    ],
    l = Up.filter(
      (d) =>
        (r === "all" || d.category === r) &&
        `${d.title} ${d.description}`.toLowerCase().includes(n.toLowerCase()),
    ),
    { itemProps: o, reset: c } = Fs(`archea-bim-order-${t.id}`, [
      "manual",
      "guides",
    ]);
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(ae, {
        title: "BIM Portal",
        subtitle: "Guide Revit, standard e procedure condivise dello studio.",
        action: e.jsx("button", {
          className: "desk-small-button",
          onClick: c,
          children: "Ripristina ordine",
        }),
      }),
      e.jsxs("div", {
        className: "desk-toolbar",
        children: [
          e.jsx("div", {
            className: "desk-segments",
            children: a.map(([d, u]) =>
              e.jsx(
                "button",
                {
                  className: r === d ? "on" : "",
                  onClick: () => i(d),
                  children: u,
                },
                d,
              ),
            ),
          }),
          e.jsx("input", {
            className: "desk-search",
            value: n,
            onChange: (d) => s(d.target.value),
            placeholder: "Cerca una guida Revit",
          }),
        ],
      }),
      e.jsxs("div", {
        className: "desk-tool-stack",
        children: [
          e.jsxs("section", {
            className: "desk-panel desk-bim-manual movable",
            ...o("manual"),
            children: [
              e.jsx("span", { children: e.jsx(wt, {}) }),
              e.jsxs("div", {
                children: [
                  e.jsx("small", { children: "STANDARD DI STUDIO" }),
                  e.jsx("h2", { children: "Manuale Revit Archea" }),
                  e.jsx("p", {
                    children:
                      "Struttura dei file, nomenclatura, coordinamento e consegna.",
                  }),
                ],
              }),
              e.jsx("button", {
                className: "desk-primary",
                children: "Apri manuale",
              }),
            ],
          }),
          e.jsxs("section", {
            className: "desk-panel movable",
            ...o("guides"),
            children: [
              e.jsxs("header", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "KNOWLEDGE BASE" }),
                      e.jsx("h2", { children: "Guide disponibili" }),
                    ],
                  }),
                  e.jsxs("strong", { children: [l.length, " · ⋮⋮"] }),
                ],
              }),
              e.jsx("div", {
                className: "desk-guide-table",
                children: l.map((d) =>
                  e.jsxs(
                    "button",
                    {
                      children: [
                        e.jsx("i", { children: d.level.slice(0, 2) }),
                        e.jsxs("span", {
                          children: [
                            e.jsx("b", { children: d.title }),
                            e.jsx("small", { children: d.description }),
                          ],
                        }),
                        e.jsxs("em", {
                          children: [d.format, " · ", d.duration],
                        }),
                        e.jsx(ve, {}),
                      ],
                    },
                    d.id,
                  ),
                ),
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function Cv() {
  const { viewer: t, today: n } = Y(),
    [s, r] = ke("archea-desktop-visual", Vp),
    [i, a] = C.useState("open"),
    [l, o] = C.useState(!1),
    [c, d] = C.useState({
      project: "",
      name: "",
      quantity: 1,
      artist: "Da assegnare",
      delivery: n,
      notes: "",
    }),
    u = s.filter((f) => i === "all" || f.status === i),
    m = (f) => {
      f.preventDefault(),
        !(!c.project.trim() || !c.name.trim()) &&
          (r((g) => [
            {
              ...c,
              id: en("visual"),
              requested: n,
              requester: t.nome,
              status: "open",
              priority: "normal",
              quantity: Number(c.quantity) || 1,
            },
            ...g,
          ]),
          o(!1));
    },
    { itemProps: x, reset: j } = Fs(`archea-visual-order-${t.id}`, [
      "summary",
      "requests",
    ]);
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(ae, {
        title: "Visual Department",
        subtitle:
          "Richieste render, assegnazioni e consegne in formato desktop.",
        action: e.jsxs("div", {
          className: "desk-heading-actions",
          children: [
            e.jsx("button", {
              className: "desk-small-button",
              onClick: j,
              children: "Ripristina ordine",
            }),
            e.jsxs("button", {
              className: "desk-primary",
              onClick: () => o(!0),
              children: [e.jsx(tt, {}), "Nuova richiesta"],
            }),
          ],
        }),
      }),
      e.jsxs("div", {
        className: "desk-tool-stack",
        children: [
          e.jsxs("section", {
            className: "desk-stats movable desk-visual-summary",
            ...x("summary"),
            children: [
              e.jsx(Q, {
                label: "Richieste aperte",
                value: s.filter((f) => f.status === "open").length,
              }),
              e.jsx(Q, {
                label: "Render da produrre",
                value: s
                  .filter((f) => f.status === "open")
                  .reduce((f, g) => f + Number(g.quantity || 0), 0),
              }),
              e.jsx(Q, {
                label: "Da assegnare",
                value: s.filter(
                  (f) => f.status === "open" && f.artist === "Da assegnare",
                ).length,
                tone: "warn",
              }),
              e.jsx(Q, {
                label: "Consegnate",
                value: s.filter((f) => f.status === "closed").length,
              }),
            ],
          }),
          e.jsxs("section", {
            className: "desk-panel movable",
            ...x("requests"),
            children: [
              e.jsxs("header", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "PRODUZIONE" }),
                      e.jsx("h2", { children: "Richieste render" }),
                    ],
                  }),
                  e.jsx("div", {
                    className: "desk-segments",
                    children: [
                      ["open", "Aperte"],
                      ["closed", "Chiuse"],
                      ["all", "Tutte"],
                    ].map(([f, g]) =>
                      e.jsx(
                        "button",
                        {
                          className: i === f ? "on" : "",
                          onClick: () => a(f),
                          children: g,
                        },
                        f,
                      ),
                    ),
                  }),
                ],
              }),
              e.jsx("div", {
                className: "desk-table-wrap inset",
                children: e.jsxs("table", {
                  className: "desk-table desk-visual-table",
                  children: [
                    e.jsx("thead", {
                      children: e.jsxs("tr", {
                        children: [
                          e.jsx("th", { children: "Progetto" }),
                          e.jsx("th", { children: "Render" }),
                          e.jsx("th", { children: "Renderista" }),
                          e.jsx("th", { children: "Consegna" }),
                          e.jsx("th", { children: "Referente" }),
                          e.jsx("th", { children: "Stato" }),
                        ],
                      }),
                    }),
                    e.jsx("tbody", {
                      children: u.map((f) =>
                        e.jsxs(
                          "tr",
                          {
                            children: [
                              e.jsxs("td", {
                                children: [
                                  e.jsxs("b", {
                                    children: [f.project, " · ", f.name],
                                  }),
                                  e.jsx("small", { children: f.notes }),
                                ],
                              }),
                              e.jsx("td", { children: f.quantity }),
                              e.jsx("td", { children: f.artist }),
                              e.jsx("td", { children: Dt(f.delivery) }),
                              e.jsx("td", { children: f.requester }),
                              e.jsx("td", {
                                children: e.jsx("button", {
                                  className: `desk-payment-status ${f.status === "closed" ? "complete" : "partial"}`,
                                  onClick: () =>
                                    r((g) =>
                                      g.map((b) =>
                                        b.id === f.id
                                          ? {
                                              ...b,
                                              status:
                                                b.status === "open"
                                                  ? "closed"
                                                  : "open",
                                            }
                                          : b,
                                      ),
                                    ),
                                  children:
                                    f.status === "open"
                                      ? "Aperta"
                                      : "Consegnata",
                                }),
                              }),
                            ],
                          },
                          f.id,
                        ),
                      ),
                    }),
                  ],
                }),
              }),
            ],
          }),
        ],
      }),
      l &&
        e.jsx(De, {
          title: "Nuova richiesta render",
          subtitle: "Compila i dati principali della richiesta",
          onClose: () => o(!1),
          children: e.jsxs("form", {
            className: "desk-event-form",
            onSubmit: m,
            children: [
              e.jsxs("div", {
                className: "desk-form-row",
                children: [
                  e.jsxs("label", {
                    children: [
                      "Codice progetto",
                      e.jsx("input", {
                        autoFocus: !0,
                        value: c.project,
                        onChange: (f) =>
                          d({ ...c, project: f.target.value.toUpperCase() }),
                      }),
                    ],
                  }),
                  e.jsxs("label", {
                    children: [
                      "Numero render",
                      e.jsx("input", {
                        type: "number",
                        min: "1",
                        value: c.quantity,
                        onChange: (f) => d({ ...c, quantity: f.target.value }),
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs("label", {
                children: [
                  "Nome progetto",
                  e.jsx("input", {
                    value: c.name,
                    onChange: (f) => d({ ...c, name: f.target.value }),
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "desk-form-row",
                children: [
                  e.jsxs("label", {
                    children: [
                      "Renderista",
                      e.jsx("input", {
                        value: c.artist,
                        onChange: (f) => d({ ...c, artist: f.target.value }),
                      }),
                    ],
                  }),
                  e.jsxs("label", {
                    children: [
                      "Consegna",
                      e.jsx("input", {
                        type: "date",
                        value: c.delivery,
                        onChange: (f) => d({ ...c, delivery: f.target.value }),
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs("label", {
                children: [
                  "Indicazioni",
                  e.jsx("textarea", {
                    value: c.notes,
                    onChange: (f) => d({ ...c, notes: f.target.value }),
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "desk-modal-actions",
                children: [
                  e.jsx("button", {
                    type: "button",
                    onClick: () => o(!1),
                    children: "Annulla",
                  }),
                  e.jsx("button", {
                    className: "desk-primary",
                    type: "submit",
                    children: "Salva richiesta",
                  }),
                ],
              }),
            ],
          }),
        }),
    ],
  });
}
function bv() {
  const { viewer: t } = Y(),
    [n, s] = C.useState(""),
    { itemProps: r, reset: i } = Fs(`archea-community-order-${t.id}`, [
      "report",
      "events",
      "poll",
    ]);
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(ae, {
        title: "IN ARCHEA",
        subtitle: "Report, eventi, uscite e vita dello studio.",
        action: e.jsx("button", {
          className: "desk-small-button",
          onClick: i,
          children: "Ripristina ordine",
        }),
      }),
      e.jsxs("div", {
        className: "desk-community-grid",
        children: [
          e.jsxs("section", {
            className: "desk-panel desk-community-report movable",
            ...r("report"),
            children: [
              e.jsx("span", { children: e.jsx(An, {}) }),
              e.jsxs("div", {
                children: [
                  e.jsx("small", { children: ht.report.issue }),
                  e.jsx("h2", { children: ht.report.title }),
                  e.jsx("p", { children: ht.report.description }),
                  e.jsx("button", {
                    className: "desk-primary",
                    children: "Apri il report",
                  }),
                ],
              }),
            ],
          }),
          e.jsxs("section", {
            className: "desk-panel movable",
            ...r("events"),
            children: [
              e.jsxs("header", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "AGENDA INTERNA" }),
                      e.jsx("h2", { children: "Eventi e uscite" }),
                    ],
                  }),
                  e.jsx("strong", { children: "⋮⋮" }),
                ],
              }),
              e.jsx("div", {
                className: "desk-community-events",
                children: ht.items.map((a) =>
                  e.jsxs(
                    "article",
                    {
                      children: [
                        e.jsx("i", {
                          children: a.kind.slice(0, 2).toUpperCase(),
                        }),
                        e.jsxs("span", {
                          children: [
                            e.jsx("b", { children: a.title }),
                            e.jsx("small", { children: a.meta }),
                          ],
                        }),
                        e.jsx("button", { children: "Dettagli" }),
                      ],
                    },
                    a.id,
                  ),
                ),
              }),
            ],
          }),
          e.jsxs("section", {
            className: "desk-panel movable",
            ...r("poll"),
            children: [
              e.jsxs("header", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "SONDAGGIO" }),
                      e.jsx("h2", { children: ht.poll.question }),
                    ],
                  }),
                  e.jsx("strong", { children: "⋮⋮" }),
                ],
              }),
              e.jsx("div", {
                className: "desk-poll-options",
                children: ht.poll.options.map((a) =>
                  e.jsxs(
                    "button",
                    {
                      className: n === a ? "on" : "",
                      onClick: () => s(a),
                      children: [
                        a,
                        e.jsx("i", { children: n === a ? "✓" : "" }),
                      ],
                    },
                    a,
                  ),
                ),
              }),
              n &&
                e.jsx("p", {
                  className: "desk-saved",
                  children: "Risposta registrata nella demo.",
                }),
            ],
          }),
        ],
      }),
    ],
  });
}
function wv(t) {
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}`;
}
function Zd(t, n) {
  const [s, r] = t.split("-").map(Number);
  return wv(new Date(Date.UTC(s, r - 1 + n, 1)));
}
function Av(t) {
  const [n, s] = t.split("-").map(Number),
    i = (new Date(Date.UTC(n, s - 1, 1)).getUTCDay() + 6) % 7;
  return Array.from({ length: 42 }, (a, l) => {
    const o = new Date(Date.UTC(n, s - 1, 1 - i + l));
    return {
      iso: o.toISOString().slice(0, 10),
      day: o.getUTCDate(),
      current: o.getUTCMonth() === s - 1,
    };
  });
}
function Ev({ events: t, setEvents: n, tasks: s }) {
  const { today: r, viewer: i } = Y(),
    [a, l] = C.useState(r.slice(0, 7)),
    [o, c] = C.useState(!1),
    [d, u] = C.useState(r),
    [m, x] = C.useState({
      title: "",
      date: r,
      time: "09:00",
      end: "10:00",
      type: "Riunione",
      location: "",
    }),
    j = [
      ...t,
      ...s
        .filter((h) => h.scadenza)
        .map((h) => ({
          id: `task-${h.id}`,
          date: h.scadenza,
          time: h.orario || "18:00",
          title: h.titolo || h.descrizione,
          type: "Task",
          project: h.progettoCodice,
          locked: !0,
        })),
    ],
    f = Av(a),
    g = new Intl.DateTimeFormat("it-IT", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${a}-01T12:00:00Z`)),
    b = (h) => {
      h.preventDefault(),
        !(!m.title.trim() || !m.date) &&
          (n((p) => [
            ...p,
            {
              ...m,
              id: en("calendar"),
              title: m.title.trim(),
              createdBy: i.nome,
              ownerId: i.id,
            },
          ]),
          c(!1),
          l(m.date.slice(0, 7)),
          u(m.date),
          x((p) => ({ ...p, title: "", location: "" })));
    },
    v = (h) => {
      u(h), x((p) => ({ ...p, date: h })), c(!0);
    };
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(ae, {
        title: "Calendario",
        subtitle:
          "Agenda mensile completa con appuntamenti, riunioni, sopralluoghi e scadenze.",
        action: e.jsxs("button", {
          className: "desk-primary",
          onClick: () => v(d),
          children: [e.jsx(tt, {}), "Nuovo evento"],
        }),
      }),
      e.jsxs("div", {
        className: "desk-calendar-toolbar",
        children: [
          e.jsxs("div", {
            children: [
              e.jsx("button", {
                onClick: () => l(Zd(a, -1)),
                children: e.jsx(Re, {}),
              }),
              e.jsx("button", {
                className: "today",
                onClick: () => l(r.slice(0, 7)),
                children: "Oggi",
              }),
              e.jsx("button", {
                onClick: () => l(Zd(a, 1)),
                children: e.jsx(ve, {}),
              }),
            ],
          }),
          e.jsx("h2", { children: g }),
          e.jsxs("span", {
            children: [
              t.length,
              " eventi personali · ",
              s.filter((h) => {
                var p;
                return (p = h.scadenza) == null ? void 0 : p.startsWith(a);
              }).length,
              " scadenze task",
            ],
          }),
        ],
      }),
      e.jsxs("section", {
        className: "desk-calendar",
        children: [
          e.jsx("header", {
            children: ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map(
              (h) => e.jsx("span", { children: h }, h),
            ),
          }),
          e.jsx("div", {
            className: "desk-calendar-grid",
            children: f.map((h) => {
              const p = j
                .filter((y) => y.date === h.iso)
                .sort((y, O) => (y.time || "").localeCompare(O.time || ""));
              return e.jsxs(
                "article",
                {
                  className: `${h.current ? "" : "outside"}${h.iso === r ? " today" : ""}`,
                  onDoubleClick: () => v(h.iso),
                  children: [
                    e.jsx("button", {
                      className: "desk-calendar-day",
                      onClick: () => u(h.iso),
                      children: h.day,
                    }),
                    e.jsxs("div", {
                      children: [
                        p
                          .slice(0, 4)
                          .map((y) =>
                            e.jsxs(
                              "button",
                              {
                                className: `desk-calendar-event ${String(y.type).toLowerCase()}`,
                                title: `${y.time || ""} ${y.title}`,
                                children: [
                                  e.jsx("time", { children: y.time || "" }),
                                  e.jsx("span", { children: y.title }),
                                  y.project &&
                                    e.jsx("small", { children: y.project }),
                                ],
                              },
                              y.id,
                            ),
                          ),
                        p.length > 4 &&
                          e.jsxs("small", {
                            className: "desk-more-events",
                            children: ["+", p.length - 4, " altri"],
                          }),
                      ],
                    }),
                    e.jsx("button", {
                      className: "desk-day-add",
                      onClick: () => v(h.iso),
                      children: "+",
                    }),
                  ],
                },
                h.iso,
              );
            }),
          }),
        ],
      }),
      o &&
        e.jsx(De, {
          title: "Nuovo evento",
          subtitle: "Aggiungi un appuntamento al calendario della demo",
          onClose: () => c(!1),
          children: e.jsxs("form", {
            className: "desk-event-form",
            onSubmit: b,
            children: [
              e.jsxs("label", {
                children: [
                  "Titolo",
                  e.jsx("input", {
                    autoFocus: !0,
                    value: m.title,
                    onChange: (h) => x({ ...m, title: h.target.value }),
                    placeholder: "Nome dell’evento",
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "desk-form-row",
                children: [
                  e.jsxs("label", {
                    children: [
                      "Data",
                      e.jsx("input", {
                        type: "date",
                        value: m.date,
                        onChange: (h) => x({ ...m, date: h.target.value }),
                      }),
                    ],
                  }),
                  e.jsx(fe, {
                    label: "Tipo",
                    value: m.type,
                    options: [
                      "Riunione",
                      "Sopralluogo",
                      "Consegna",
                      "Evento",
                      "Personale",
                    ].map((h) => ({ value: h, label: h })),
                    onChange: (h) => x({ ...m, type: h }),
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "desk-form-row",
                children: [
                  e.jsxs("label", {
                    children: [
                      "Inizio",
                      e.jsx("input", {
                        type: "time",
                        value: m.time,
                        onChange: (h) => x({ ...m, time: h.target.value }),
                      }),
                    ],
                  }),
                  e.jsxs("label", {
                    children: [
                      "Fine",
                      e.jsx("input", {
                        type: "time",
                        value: m.end,
                        onChange: (h) => x({ ...m, end: h.target.value }),
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs("label", {
                children: [
                  "Luogo o collegamento",
                  e.jsx("input", {
                    value: m.location,
                    onChange: (h) => x({ ...m, location: h.target.value }),
                    placeholder: "Sala, indirizzo oppure link Meet",
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "desk-modal-actions",
                children: [
                  e.jsx("button", {
                    type: "button",
                    onClick: () => c(!1),
                    children: "Annulla",
                  }),
                  e.jsx("button", {
                    className: "desk-primary",
                    type: "submit",
                    children: "Aggiungi evento",
                  }),
                ],
              }),
            ],
          }),
        }),
    ],
  });
}
function Tv({ messages: t, setMessages: n }) {
  var f;
  const { data: s, viewer: r } = Y(),
    i = s.persone.filter((g) => g.id !== r.id),
    [a, l] = C.useState(((f = i[0]) == null ? void 0 : f.id) || ""),
    [o, c] = C.useState(""),
    [d, u] = C.useState(""),
    m = i.find((g) => g.id === a) || i[0],
    x = t
      .filter(
        (g) =>
          (g.from === r.id && g.to === (m == null ? void 0 : m.id)) ||
          (g.from === (m == null ? void 0 : m.id) && g.to === r.id),
      )
      .sort((g, b) => g.createdAt.localeCompare(b.createdAt)),
    j = (g) => {
      g.preventDefault(),
        !(!d.trim() || !m) &&
          (n((b) => [
            ...b,
            {
              id: en("message"),
              from: r.id,
              to: m.id,
              text: d.trim(),
              createdAt: new Date().toISOString(),
            },
          ]),
          u(""));
    };
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(ae, {
        title: "Chat",
        subtitle:
          "Conversazioni interne fra i dipendenti dello studio. Nella demo i messaggi restano su questo browser.",
      }),
      e.jsxs("section", {
        className: "desk-chat",
        children: [
          e.jsxs("aside", {
            children: [
              e.jsx("div", {
                className: "desk-chat-search",
                children: e.jsx("input", {
                  value: o,
                  onChange: (g) => c(g.target.value),
                  placeholder: "Cerca una persona",
                }),
              }),
              e.jsx("div", {
                children: i
                  .filter((g) => g.nome.toLowerCase().includes(o.toLowerCase()))
                  .map((g) => {
                    const b = t
                      .filter(
                        (v) =>
                          (v.from === r.id && v.to === g.id) ||
                          (v.from === g.id && v.to === r.id),
                      )
                      .slice(-1)[0];
                    return e.jsxs(
                      "button",
                      {
                        className:
                          g.id === (m == null ? void 0 : m.id) ? "on" : "",
                        onClick: () => l(g.id),
                        children: [
                          e.jsx("i", { children: Lt(g.nome) }),
                          e.jsxs("span", {
                            children: [
                              e.jsx("b", { children: g.nome }),
                              e.jsx("small", {
                                children:
                                  (b == null ? void 0 : b.text) ||
                                  g.ruolo ||
                                  "Conversazione interna",
                              }),
                            ],
                          }),
                          e.jsx("time", {
                            children: b
                              ? new Date(b.createdAt).toLocaleTimeString(
                                  "it-IT",
                                  { hour: "2-digit", minute: "2-digit" },
                                )
                              : "",
                          }),
                        ],
                      },
                      g.id,
                    );
                  }),
              }),
            ],
          }),
          e.jsx("div", {
            className: "desk-chat-thread",
            children: m
              ? e.jsxs(e.Fragment, {
                  children: [
                    e.jsxs("header", {
                      children: [
                        e.jsx("i", { children: Lt(m.nome) }),
                        e.jsxs("span", {
                          children: [
                            e.jsx("b", { children: m.nome }),
                            e.jsxs("small", {
                              children: [
                                m.ruolo || "ARCHEA Associati",
                                " · disponibile",
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    e.jsxs("main", {
                      children: [
                        !x.length &&
                          e.jsxs("div", {
                            className: "desk-chat-empty",
                            children: [
                              e.jsx(va, {}),
                              e.jsx("b", {
                                children: "Inizia la conversazione",
                              }),
                              e.jsx("span", {
                                children:
                                  "I messaggi della demo sono condivisi fra i profili su questo dispositivo.",
                              }),
                            ],
                          }),
                        x.map((g) =>
                          e.jsxs(
                            "div",
                            {
                              className: `desk-message ${g.from === r.id ? "mine" : ""}`,
                              children: [
                                e.jsx("p", { children: g.text }),
                                e.jsx("small", {
                                  children: new Date(
                                    g.createdAt,
                                  ).toLocaleString("it-IT", {
                                    day: "2-digit",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }),
                                }),
                              ],
                            },
                            g.id,
                          ),
                        ),
                      ],
                    }),
                    e.jsxs("form", {
                      onSubmit: j,
                      children: [
                        e.jsx("input", {
                          value: d,
                          onChange: (g) => u(g.target.value),
                          placeholder: `Scrivi a ${m.nome.split(" ")[0]}…`,
                        }),
                        e.jsx("button", { type: "submit", children: "Invia" }),
                      ],
                    }),
                  ],
                })
              : e.jsx("p", {
                  className: "desk-empty",
                  children: "Nessun contatto disponibile.",
                }),
          }),
        ],
      }),
    ],
  });
}
function Pv({ setTasks: onSetTasks = null }) {
  var m, x, j;
  const { data: t, viewer: n } = Y(),
    s = t.progetti.filter((f) => normalizeProjectStatus(f.stato) === "Active"),
    [r, i] = C.useState(((m = s[0]) == null ? void 0 : m.codice) || ""),
    [a, l] = ke("archea-desktop-demo-site-tasks", zp),
    [o, c] = ke("archea-desktop-demo-plans", [
      {
        id: "p1",
        project: ((x = s[0]) == null ? void 0 : x.codice) || "P51",
        name: "Pianta piano terra · Esecutivo",
        revision: "Rev. 04 · 02/10/2026",
      },
      {
        id: "p2",
        project: ((j = s[0]) == null ? void 0 : j.codice) || "P51",
        name: "Dettagli facciata",
        revision: "Rev. 02 · 28/09/2026",
      },
    ]),
    d = () => {
      const f = window.prompt("Descrizione della nuova attività di cantiere");
      f != null &&
        f.trim() &&
        l((g) => [
          {
            id: en("site"),
            project: r,
            title: f.trim(),
            done: !1,
            checklist: [],
          },
          ...g,
        ]);
    },
    u = (f) => {
      var b;
      const g = (b = f.target.files) == null ? void 0 : b[0];
      g &&
        c((v) => [
          {
            id: en("plan"),
            project: r,
            name: g.name,
            revision: "Caricato ora · demo locale",
          },
          ...v,
        ]),
        (f.target.value = "");
    };
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(ae, {
        title: "Cantiere",
        subtitle:
          "Da desktop puoi preparare attività e piante PDF da consultare sul campo.",
      }),
      e.jsxs("div", {
        className: "desk-site-controls",
        children: [
          e.jsx(uv, {
            projects: s,
            value: r,
            onChange: i,
            label: "PROGETTO ATTIVO",
            meta: (f) => `${f.stato} · selezione cantiere`,
          }),
          e.jsxs("span", {
            children: ["Modifica consentita a ", Xt[n.appRole]],
          }),
        ],
      }),
      e.jsxs("div", {
        className: "desk-grid-2",
        children: [
          e.jsxs("section", {
            className: "desk-panel",
            children: [
              e.jsxs("header", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "DOCUMENTI" }),
                      e.jsx("h2", { children: "Piante esecutive" }),
                    ],
                  }),
                  e.jsxs("label", {
                    className: "desk-small-button",
                    children: [
                      e.jsx(oc, {}),
                      "Carica PDF",
                      e.jsx("input", {
                        type: "file",
                        accept: "application/pdf",
                        onChange: u,
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "desk-rows",
                children: [
                  o
                    .filter((f) => f.project === r)
                    .map((f) =>
                      e.jsxs(
                        "div",
                        {
                          className: "desk-file-row",
                          children: [
                            e.jsx("span", { children: e.jsx(wt, {}) }),
                            e.jsxs("div", {
                              children: [
                                e.jsx("b", { children: f.name }),
                                e.jsx("small", { children: f.revision }),
                              ],
                            }),
                            e.jsx("em", { children: "PDF" }),
                          ],
                        },
                        f.id,
                      ),
                    ),
                  !o.some((f) => f.project === r) &&
                    e.jsx("p", {
                      className: "desk-empty",
                      children: "Nessuna pianta caricata per il progetto.",
                    }),
                ],
              }),
            ],
          }),
          e.jsxs("section", {
            className: "desk-panel",
            children: [
              e.jsxs("header", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "ATTIVITÀ" }),
                      e.jsx("h2", { children: "Task di cantiere" }),
                    ],
                  }),
                  e.jsxs("button", {
                    className: "desk-small-button",
                    onClick: d,
                    children: [e.jsx(tt, {}), "Aggiungi"],
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "desk-rows",
                children: [
                  a
                    .filter((f) => f.project === r)
                    .map((f) => {
                      var g;
                      return e.jsxs(
                        "label",
                        {
                          className: `desk-site-task ${f.done ? "done" : ""}`,
                          children: [
                            e.jsx("input", {
                              type: "checkbox",
                              checked: f.done,
                              onChange: () =>
                                l((b) =>
                                  b.map((v) =>
                                    v.id === f.id ? { ...v, done: !v.done } : v,
                                  ),
                                ),
                            }),
                            e.jsxs("span", {
                              children: [
                                e.jsx("b", { children: f.title }),
                                e.jsx("small", {
                                  children:
                                    ((g = f.checklist) == null
                                      ? void 0
                                      : g.join(" · ")) || "Nessuna checklist",
                                }),
                              ],
                            }),
                          ],
                        },
                        f.id,
                      );
                    }),
                  !a.some((f) => f.project === r) &&
                    e.jsx("p", {
                      className: "desk-empty",
                      children: "Nessuna attività di cantiere.",
                    }),
                ],
              }),
            ],
          }),
        ],
      }),
      e.jsx(SiteMinutesDemo, {
        project: r,
        onApprove: (f) =>
          onSetTasks &&
          onSetTasks((g) => [
            ...f.filter((b) => !g.some((v) => v.id === b.id)),
            ...g,
          ]),
      }),
    ],
  });
}
const Dt = (t) =>
  t
    ? new Intl.DateTimeFormat("it-IT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(`${t}T12:00:00`))
    : "—";
function Qp({ person: t, data: n, project: s = null, hours: r = 0 }) {
  const i = je.find((c) => c.id === t.studio),
    a = [
      ...new Set([
        ...n.progetti
          .filter((c) => Rr(c.codice).some((d) => d.members.includes(t.id)))
          .map((c) => c.codice),
        ...(t.projects || []),
      ]),
    ],
    l = n.progetti.filter((c) => a.includes(c.codice)),
    o = Bn(t.role) < 2;
  return e.jsxs("div", {
    className: "desk-property-profile",
    children: [
      e.jsxs("section", {
        className: "desk-panel desk-person-identity",
        children: [
          e.jsx("span", { children: Lt(t.name) }),
          e.jsxs("div", {
            children: [
              e.jsx("small", { children: "PROFILO DIPENDENTE" }),
              e.jsx("h2", { children: t.name }),
              e.jsxs("p", {
                children: [
                  t.role,
                  " · Studio di ",
                  (i == null ? void 0 : i.name) || "—",
                ],
              }),
            ],
          }),
        ],
      }),
      e.jsxs("div", {
        className: "desk-stats desk-person-kpis",
        children: [
          e.jsx(Q, {
            label: "Anni in Archea",
            value: t.years ?? "Da collegare",
          }),
          e.jsx(Q, { label: "Ruolo", value: t.role }),
          e.jsx(Q, {
            label: "Compenso annuo",
            value: t.annualCompensation == null ? "—" : W(t.annualCompensation),
          }),
          e.jsx(Q, {
            label: "Scadenza contratto",
            value: t.expiresAt ? Dt(t.expiresAt) : "—",
          }),
        ],
      }),
      s &&
        e.jsxs("section", {
          className: "desk-panel desk-member-project",
          children: [
            e.jsxs("header", {
              children: [
                e.jsxs("div", {
                  children: [
                    e.jsx("small", { children: "GRUPPO DI LAVORO" }),
                    e.jsxs("h2", { children: [s.codice, " · ", s.nome] }),
                  ],
                }),
                e.jsx("strong", { children: ue(r) }),
              ],
            }),
            e.jsx("p", {
              children:
                "Ore attribuite al componente nella simulazione corrente del gruppo.",
            }),
          ],
        }),
      e.jsxs("section", {
        className: "desk-panel",
        children: [
          e.jsxs("header", {
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("small", { children: "DOCUMENTI HR" }),
                  e.jsx("h2", { children: "Contratto" }),
                ],
              }),
              e.jsxs("button", {
                className: "desk-small-button",
                children: [e.jsx(wt, {}), "Apri PDF"],
              }),
            ],
          }),
          e.jsxs("div", {
            className: "desk-contract-file",
            children: [
              e.jsx(wt, {}),
              e.jsxs("span", {
                children: [
                  e.jsx("b", { children: t.contract }),
                  e.jsx("small", {
                    children: "Contratto di lavoro · documento protetto",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      o &&
        e.jsxs("section", {
          className: "desk-panel",
          children: [
            e.jsxs("header", {
              children: [
                e.jsxs("div", {
                  children: [
                    e.jsx("small", { children: "RESPONSABILITÀ" }),
                    e.jsx("h2", { children: "Progetti seguiti" }),
                  ],
                }),
                e.jsx("strong", { children: l.length }),
              ],
            }),
            e.jsxs("div", {
              className: "desk-table-wrap inset",
              children: [
                e.jsxs("table", {
                  className: "desk-table",
                  children: [
                    e.jsx("thead", {
                      children: e.jsxs("tr", {
                        children: [
                          e.jsx("th", { children: "Progetto" }),
                          e.jsx("th", { children: "Studio" }),
                          e.jsx("th", { children: "Stato" }),
                          e.jsx("th", { children: "Ore complessive" }),
                        ],
                      }),
                    }),
                    e.jsx("tbody", {
                      children: l.map((c) => {
                        var d;
                        return e.jsxs(
                          "tr",
                          {
                            children: [
                              e.jsxs("td", {
                                children: [
                                  e.jsx("b", { children: c.codice }),
                                  e.jsx("small", { children: c.nome }),
                                ],
                              }),
                              e.jsx("td", {
                                children:
                                  (d = je.find((u) => u.id === Jt(c.codice))) ==
                                  null
                                    ? void 0
                                    : d.name,
                              }),
                              e.jsx("td", {
                                children: e.jsx("span", {
                                  className: `desk-badge ${zt(c.stato)}`,
                                  children: c.stato,
                                }),
                              }),
                              e.jsx("td", {
                                children: ue(rr(n.ore, c.codice)),
                              }),
                            ],
                          },
                          c.codice,
                        );
                      }),
                    }),
                  ],
                }),
                !l.length &&
                  e.jsx("p", {
                    className: "desk-empty",
                    children: "Nessun progetto assegnato.",
                  }),
              ],
            }),
          ],
        }),
    ],
  });
}
function Iv({ staffProfiles: t = {}, projects: n }) {
  var P, $, N;
  const { data: s } = Y(),
    r = n || s.progetti,
    i = { ...s, progetti: r },
    [a, l] = C.useState(null),
    [o, c] = C.useState("all"),
    [d, u] = C.useState(null),
    [m, x] = C.useState(null),
    [j, f] = C.useState(null),
    g = je.find((I) => I.id === a),
    b = r.filter((I) => (I.studio || Jt(I.codice)) === a),
    v = b.filter((I) => o === "all" || zt(I.stato) === o),
    h = r.find((I) => I.codice === d),
    p = h ? Rr(h.codice) : [],
    y = Object.values(Pe)
      .filter((I) => I.studio === a)
      .slice(0, 3)
      .map((I) => I.id),
    O = h
      ? p.length
        ? p
        : [
            {
              id: `${h.codice}-studio`,
              studio: a,
              name: "Gruppo di studio",
              share: 1,
              members: y,
            },
          ]
      : [],
    k = O.find((I) => I.id === m),
    z =
      j && Pe[j]
        ? {
            ...Pe[j],
            ...(t[j] || {}),
            name: ((P = t[j]) == null ? void 0 : P.name) || Pe[j].name,
          }
        : null,
    E = h ? rr(s.ore, h.codice) : 0,
    U = () => {
      l(null), c("all"), u(null), x(null), f(null);
    };
  return z && h && k
    ? e.jsxs(e.Fragment, {
        children: [
          e.jsxs("button", {
            className: "desk-back",
            onClick: () => f(null),
            children: [e.jsx(Re, {}), "Torna al gruppo"],
          }),
          e.jsx(ae, {
            eyebrow: `${h.codice} · ${k.name}`,
            title: z.name,
            subtitle:
              "Scheda del componente senza uscire dal percorso del progetto.",
          }),
          e.jsx(Qp, {
            person: z,
            data: i,
            project: h,
            hours: (E * k.share) / Math.max(1, k.members.length),
          }),
        ],
      })
    : k && h
      ? e.jsxs(e.Fragment, {
          children: [
            e.jsxs("button", {
              className: "desk-back",
              onClick: () => x(null),
              children: [e.jsx(Re, {}), "Torna al progetto"],
            }),
            e.jsx(ae, {
              eyebrow: `${h.codice} · ${(($ = je.find((I) => I.id === k.studio)) == null ? void 0 : $.name) || (g == null ? void 0 : g.name)}`,
              title: k.name,
              subtitle:
                "Componenti ordinati per responsabilità e ore del gruppo.",
            }),
            e.jsxs("div", {
              className: "desk-stats compact",
              children: [
                e.jsx(Q, { label: "Ore del gruppo", value: ue(E * k.share) }),
                e.jsx(Q, { label: "Componenti", value: k.members.length }),
                e.jsx(Q, {
                  label: "Studio",
                  value:
                    ((N = je.find((I) => I.id === k.studio)) == null
                      ? void 0
                      : N.name) || "—",
                }),
              ],
            }),
            e.jsxs("section", {
              className: "desk-panel",
              children: [
                e.jsx("header", {
                  children: e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "GRUPPO DI LAVORO" }),
                      e.jsx("h2", { children: "Componenti" }),
                    ],
                  }),
                }),
                e.jsx("div", {
                  className: "desk-property-members",
                  children: k.members
                    .slice()
                    .sort((I, S) => {
                      var L, H;
                      return (
                        Bn((L = Pe[I]) == null ? void 0 : L.role) -
                        Bn((H = Pe[S]) == null ? void 0 : H.role)
                      );
                    })
                    .map((I) => {
                      const S = Pe[I];
                      if (!S) return null;
                      const L = Bn(S.role) < 2;
                      return e.jsxs(
                        "button",
                        {
                          onClick: () => f(I),
                          children: [
                            e.jsx("i", { children: Lt(S.name) }),
                            e.jsxs("span", {
                              children: [
                                e.jsxs("b", {
                                  children: [
                                    L &&
                                      e.jsx("strong", {
                                        children: "Referente: ",
                                      }),
                                    S.name,
                                  ],
                                }),
                                e.jsxs("small", {
                                  children: [
                                    S.role,
                                    " · ",
                                    ue(
                                      (E * k.share) /
                                        Math.max(1, k.members.length),
                                    ),
                                  ],
                                }),
                              ],
                            }),
                            e.jsx(Xn, {}),
                            e.jsx(ve, {}),
                          ],
                        },
                        I,
                      );
                    }),
                }),
              ],
            }),
          ],
        })
      : h
        ? e.jsxs(e.Fragment, {
            children: [
              e.jsxs("button", {
                className: "desk-back",
                onClick: () => u(null),
                children: [
                  e.jsx(Re, {}),
                  "Torna ai progetti di ",
                  g == null ? void 0 : g.name,
                ],
              }),
              e.jsx(ae, {
                eyebrow: `${(g == null ? void 0 : g.name) || "STUDIO"} · ${h.stato}`,
                title: `${h.codice} · ${h.nome}`,
                subtitle:
                  "Gruppi di lavoro, ore complessive e quadro economico della commessa.",
              }),
              e.jsxs("div", {
                className: "desk-stats",
                children: [
                  e.jsx(Q, { label: "Ore complessive", value: ue(E) }),
                  e.jsx(Q, { label: "Gruppi di lavoro", value: O.length }),
                  e.jsx(Q, {
                    label: "Componenti",
                    value: new Set(O.flatMap((I) => I.members)).size,
                  }),
                  e.jsx(Q, { label: "Stato", value: h.stato }),
                ],
              }),
              e.jsxs("section", {
                className: "desk-panel",
                children: [
                  e.jsx("header", {
                    children: e.jsxs("div", {
                      children: [
                        e.jsx("small", { children: "ORGANIZZAZIONE" }),
                        e.jsx("h2", { children: "Gruppi divisi per studio" }),
                      ],
                    }),
                  }),
                  e.jsx("div", {
                    className: "desk-table-wrap inset",
                    children: e.jsxs("table", {
                      className: "desk-table desk-group-table",
                      children: [
                        e.jsx("thead", {
                          children: e.jsxs("tr", {
                            children: [
                              e.jsx("th", { children: "Gruppo" }),
                              e.jsx("th", { children: "Studio" }),
                              e.jsx("th", { children: "Componenti" }),
                              e.jsx("th", { children: "Ore gruppo" }),
                              e.jsx("th", {}),
                            ],
                          }),
                        }),
                        e.jsx("tbody", {
                          children: O.map((I) => {
                            var S;
                            return e.jsxs(
                              "tr",
                              {
                                onClick: () => x(I.id),
                                children: [
                                  e.jsx("td", {
                                    children: e.jsx("b", { children: I.name }),
                                  }),
                                  e.jsx("td", {
                                    children:
                                      ((S = je.find(
                                        (L) => L.id === I.studio,
                                      )) == null
                                        ? void 0
                                        : S.name) || "—",
                                  }),
                                  e.jsx("td", { children: I.members.length }),
                                  e.jsx("td", { children: ue(E * I.share) }),
                                  e.jsx("td", { children: e.jsx(ve, {}) }),
                                ],
                              },
                              I.id,
                            );
                          }),
                        }),
                      ],
                    }),
                  }),
                ],
              }),
              e.jsx("div", {
                className: "desk-property-accounting",
                children: e.jsx(Yp, { project: h, data: i, compactHeader: !0 }),
              }),
            ],
          })
        : g
          ? e.jsxs(e.Fragment, {
              children: [
                e.jsxs("button", {
                  className: "desk-back",
                  onClick: U,
                  children: [e.jsx(Re, {}), "Torna a tutti gli studi"],
                }),
                e.jsx(ae, {
                  eyebrow: "ARCHEA PROPERTY · STUDIO",
                  title: g.name,
                  subtitle:
                    "Progetti organizzati per stato, con ore complessive dello studio.",
                }),
                e.jsxs("div", {
                  className: "desk-stats",
                  children: [
                    e.jsx(Q, { label: "Progetti", value: b.length }),
                    e.jsx(Q, {
                      label: "Active",
                      value: b.filter((I) => zt(I.stato) === "active").length,
                    }),
                    e.jsx(Q, {
                      label: "On Hold",
                      value: b.filter((I) => zt(I.stato) === "on-hold").length,
                    }),
                    e.jsx(Q, {
                      label: "Ore complessive",
                      value: ue(b.reduce((I, S) => I + rr(s.ore, S.codice), 0)),
                    }),
                  ],
                }),
                e.jsxs("div", {
                  className: "desk-property-toolbar",
                  children: [
                    e.jsx("div", {
                      className: "desk-segments",
                      children: [
                        ["all", "Tutti"],
                        ...PROJECT_STATUS_OPTIONS.map((I) => [
                          zt(I.value),
                          I.value,
                        ]),
                      ].map(([I, S]) =>
                        e.jsx(
                          "button",
                          {
                            className: o === I ? "on" : "",
                            onClick: () => c(I),
                            children: S,
                          },
                          I,
                        ),
                      ),
                    }),
                    e.jsxs("span", {
                      children: [v.length, " progetti visualizzati"],
                    }),
                  ],
                }),
                e.jsxs("div", {
                  className: "desk-table-wrap",
                  children: [
                    e.jsxs("table", {
                      className: "desk-table desk-property-projects",
                      children: [
                        e.jsx("thead", {
                          children: e.jsxs("tr", {
                            children: [
                              e.jsx("th", { children: "Progetto" }),
                              e.jsx("th", { children: "Stato" }),
                              e.jsx("th", { children: "Ore complessive" }),
                              e.jsx("th", { children: "Gruppi" }),
                              e.jsx("th", {}),
                            ],
                          }),
                        }),
                        e.jsx("tbody", {
                          children: v.map((I) =>
                            e.jsxs(
                              "tr",
                              {
                                onClick: () => u(I.codice),
                                children: [
                                  e.jsxs("td", {
                                    children: [
                                      e.jsx("b", { children: I.codice }),
                                      e.jsx("small", { children: I.nome }),
                                    ],
                                  }),
                                  e.jsx("td", {
                                    children: e.jsx("span", {
                                      className: `desk-badge ${zt(I.stato)}`,
                                      children: I.stato,
                                    }),
                                  }),
                                  e.jsx("td", {
                                    children: ue(rr(s.ore, I.codice)),
                                  }),
                                  e.jsx("td", {
                                    children: Rr(I.codice).length || 1,
                                  }),
                                  e.jsx("td", { children: e.jsx(ve, {}) }),
                                ],
                              },
                              I.codice,
                            ),
                          ),
                        }),
                      ],
                    }),
                    !v.length &&
                      e.jsx("p", {
                        className: "desk-empty",
                        children: "Nessun progetto in questa categoria.",
                      }),
                  ],
                }),
              ],
            })
          : e.jsxs(e.Fragment, {
              children: [
                e.jsx(ae, {
                  eyebrow: "ARCHEA PROPERTY",
                  title: "Avanzamento progetti",
                  subtitle:
                    "Tutti gli studi, lo stato delle commesse e i gruppi di lavoro.",
                }),
                e.jsx("div", {
                  className: "desk-property-studios",
                  children: je.map((I) => {
                    const S = r.filter(
                        (H) => (H.studio || Jt(H.codice)) === I.id,
                      ),
                      L = S.reduce((H, _) => H + rr(s.ore, _.codice), 0);
                    return e.jsxs(
                      "button",
                      {
                        onClick: () => l(I.id),
                        children: [
                          e.jsxs("header", {
                            children: [
                              e.jsxs("span", {
                                children: [
                                  e.jsx("small", { children: "STUDIO" }),
                                  e.jsx("b", { children: I.name }),
                                ],
                              }),
                              e.jsx(ja, {}),
                            ],
                          }),
                          e.jsxs("div", {
                            children: [
                              e.jsxs("span", {
                                children: [
                                  e.jsx("b", { children: S.length }),
                                  e.jsx("small", { children: "Progetti" }),
                                ],
                              }),
                              e.jsxs("span", {
                                children: [
                                  e.jsx("b", {
                                    children: S.filter(
                                      (H) => zt(H.stato) === "active",
                                    ).length,
                                  }),
                                  e.jsx("small", { children: "Attivi" }),
                                ],
                              }),
                              e.jsxs("span", {
                                children: [
                                  e.jsx("b", { children: ue(L) }),
                                  e.jsx("small", { children: "Ore" }),
                                ],
                              }),
                            ],
                          }),
                          e.jsxs("footer", {
                            children: ["Apri avanzamento ", e.jsx(ve, {})],
                          }),
                        ],
                      },
                      I.id,
                    );
                  }),
                }),
              ],
            });
}
function zv({ staffProfiles: t = {}, projects: n }) {
  const { data: s, selectedEmployeeId: r, setSelectedEmployeeId: i } = Y(),
    [a, l] = C.useState("all"),
    o = Object.values(Pe)
      .map((d) => {
        var u;
        return {
          ...d,
          ...(t[d.id] || {}),
          name: ((u = t[d.id]) == null ? void 0 : u.name) || d.name,
        };
      })
      .filter((d) => a === "all" || ov(d.role) === a),
    c = o.find((d) => d.id === r) || o[0];
  return (
    C.useEffect(() => {
      c && c.id !== r && i(c.id);
    }, [c == null ? void 0 : c.id]),
    e.jsxs(e.Fragment, {
      children: [
        e.jsx(ae, {
          eyebrow: "ARCHEA PROPERTY",
          title: "Organico",
          subtitle:
            "Ruoli, contratti e progetti seguiti dalle persone dello studio.",
        }),
        e.jsxs("div", {
          className: "desk-property-staff-controls",
          children: [
            e.jsx(fe, {
              label: "Ruolo",
              value: a,
              options: [
                { value: "all", label: "Tutti i ruoli" },
                { value: "architect", label: "Architect" },
                { value: "senior", label: "Senior Architect" },
                { value: "partner", label: "Partner Architect" },
              ],
              onChange: l,
            }),
            e.jsx(fe, {
              label: "Dipendente",
              value: (c == null ? void 0 : c.id) || "",
              options: o.map((d) => {
                var u;
                return {
                  value: d.id,
                  label: d.name,
                  meta: `${d.role} · ${(u = je.find((m) => m.id === d.studio)) == null ? void 0 : u.name}`,
                };
              }),
              searchable: !0,
              onChange: i,
            }),
          ],
        }),
        c &&
          e.jsx(Qp, { person: c, data: { ...s, progetti: n || s.progetti } }),
      ],
    })
  );
}
function Yp({ project: t, data: n, onBack: s, compactHeader: r = !1 }) {
  const i = yn(n, t),
    a = i.accounting;
  return e.jsxs(e.Fragment, {
    children: [
      s &&
        e.jsxs("button", {
          className: "desk-back",
          onClick: s,
          children: [e.jsx(Re, {}), "Torna al riepilogo"],
        }),
      r
        ? e.jsxs("div", {
            className: "desk-account-project-title",
            children: [
              e.jsxs("small", { children: [t.codice, " · ", a.client.name] }),
              e.jsx("h2", { children: t.nome }),
            ],
          })
        : e.jsx(ae, {
            eyebrow: `${t.codice} · ${a.client.name}`,
            title: t.nome,
            subtitle: "Quadro economico completo della commessa",
          }),
      e.jsxs("div", {
        className: "desk-stats accounting-kpis",
        children: [
          e.jsx(Q, { label: "Valore commessa", value: W(i.turnover) }),
          e.jsx(Q, { label: "Incassato", value: W(i.paid) }),
          e.jsx(Q, {
            label: "Da incassare",
            value: W(i.receivable),
            tone: "warn",
          }),
          e.jsx(Q, { label: "Margine previsto", value: W(i.expectedProfit) }),
        ],
      }),
      e.jsxs("div", {
        className: "desk-account-grid",
        children: [
          e.jsxs("section", {
            className: "desk-panel",
            children: [
              e.jsxs("header", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "CONTRATTO" }),
                      e.jsx("h2", { children: "Cliente e incarico" }),
                    ],
                  }),
                  e.jsxs("button", {
                    className: "desk-small-button",
                    children: [e.jsx(wt, {}), "Apri PDF"],
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "desk-contract-file",
                children: [
                  e.jsx(wt, {}),
                  e.jsxs("span", {
                    children: [
                      e.jsx("b", { children: a.contract.fileName }),
                      e.jsxs("small", {
                        children: ["Firmato il ", Dt(a.contract.signedAt)],
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs("dl", {
                className: "desk-client-data",
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("dt", { children: "Cliente" }),
                      e.jsx("dd", { children: a.client.name }),
                    ],
                  }),
                  e.jsxs("div", {
                    children: [
                      e.jsx("dt", { children: "P. IVA" }),
                      e.jsx("dd", { children: a.client.vat }),
                    ],
                  }),
                  e.jsxs("div", {
                    children: [
                      e.jsx("dt", { children: "Email" }),
                      e.jsx("dd", { children: a.client.contact }),
                    ],
                  }),
                  e.jsxs("div", {
                    children: [
                      e.jsx("dt", { children: "Sede" }),
                      e.jsx("dd", { children: a.client.address }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          e.jsxs("section", {
            className: "desk-panel",
            children: [
              e.jsx("header", {
                children: e.jsxs("div", {
                  children: [
                    e.jsx("small", { children: "COSTI" }),
                    e.jsx("h2", { children: "Spese e risorse" }),
                  ],
                }),
              }),
              e.jsxs("div", {
                className: "desk-cost-table",
                children: [
                  a.expenses.map((l) =>
                    e.jsxs(
                      "div",
                      {
                        children: [
                          e.jsx("span", { children: l.label }),
                          e.jsx("b", { children: W(l.amount) }),
                        ],
                      },
                      l.label,
                    ),
                  ),
                  e.jsxs("div", {
                    children: [
                      e.jsxs("span", {
                        children: [
                          "Ore lavorate",
                          e.jsxs("small", {
                            children: [ue(i.hours), " × €10/h"],
                          }),
                        ],
                      }),
                      e.jsx("b", { children: W(i.hoursCost) }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "total",
                    children: [
                      e.jsx("span", { children: "Spese complessive" }),
                      e.jsx("b", { children: W(i.totalExpenses) }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "profit",
                    children: [
                      e.jsx("span", { children: "Guadagno previsto" }),
                      e.jsx("b", { children: W(i.expectedProfit) }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          e.jsxs("section", {
            className: "desk-panel wide",
            children: [
              e.jsxs("header", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "SCADENZIARIO" }),
                      e.jsx("h2", { children: "Pagamenti della commessa" }),
                    ],
                  }),
                  e.jsxs("span", {
                    className: "desk-muted-label",
                    children: [a.payments.length, " rate"],
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "desk-payment-table",
                children: [
                  e.jsxs("div", {
                    className: "head",
                    children: [
                      e.jsx("span", { children: "Descrizione" }),
                      e.jsx("span", { children: "Scadenza" }),
                      e.jsx("span", { children: "Data pagamento" }),
                      e.jsx("span", { children: "Importo" }),
                      e.jsx("span", { children: "Pagato" }),
                      e.jsx("span", { children: "Residuo" }),
                      e.jsx("span", { children: "Stato" }),
                    ],
                  }),
                  a.payments.map((l) => {
                    const o = Lp(l);
                    return e.jsxs(
                      "div",
                      {
                        children: [
                          e.jsx("span", {
                            children: e.jsx("b", { children: l.label }),
                          }),
                          e.jsx("span", { children: Dt(l.dueAt) }),
                          e.jsx("span", { children: Dt(l.paidAt) }),
                          e.jsx("span", { children: W(l.expected) }),
                          e.jsx("span", { children: W(l.paid) }),
                          e.jsx("span", {
                            children: W(Math.max(0, l.expected - l.paid)),
                          }),
                          e.jsx("span", {
                            children: e.jsx("i", {
                              className: `desk-payment-status ${o}`,
                              children:
                                o === "complete"
                                  ? "Pagato"
                                  : o === "partial"
                                    ? "Parziale"
                                    : "Da pagare",
                            }),
                          }),
                        ],
                      },
                      l.id,
                    );
                  }),
                ],
              }),
            ],
          }),
          e.jsxs("section", {
            className: "desk-account-total",
            children: [
              e.jsxs("span", {
                children: [
                  e.jsx("small", { children: "FATTURATO" }),
                  e.jsx("b", { children: e.jsx(ee, { value: W(i.turnover) }) }),
                ],
              }),
              e.jsx("i", { children: "−" }),
              e.jsxs("span", {
                children: [
                  e.jsx("small", { children: "SPESE TOTALI" }),
                  e.jsx("b", {
                    children: e.jsx(ee, { value: W(i.totalExpenses) }),
                  }),
                ],
              }),
              e.jsx("i", { children: "=" }),
              e.jsxs("span", {
                className: "result",
                children: [
                  e.jsx("small", { children: "GUADAGNO" }),
                  e.jsx("b", {
                    children: e.jsx(ee, { value: W(i.expectedProfit) }),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function Ov() {
  const { data: t, viewer: n, today: s } = Y(),
    r = n.appRole === "property",
    [i, a] = C.useState(null),
    [l, o] = C.useState(null),
    [c, d] = C.useState("all"),
    u = r && i ? t.progetti.filter((N) => Jt(N.codice) === i) : t.progetti,
    m = new Date(`${s}T12:00:00Z`);
  m.setUTCDate(m.getUTCDate() + 30);
  const x = m.toISOString().slice(0, 10),
    j = (N) => {
      const I = wa(N.codice).payments || [],
        S = I.filter((L) => Number(L.paid || 0) < Number(L.expected || 0));
      return c === "receivable"
        ? S.length > 0
        : c === "due"
          ? S.some((L) => L.dueAt >= s && L.dueAt <= x)
          : c === "overdue"
            ? S.some((L) => L.dueAt < s)
            : c === "paid"
              ? I.length > 0 && S.length === 0
              : !0;
    },
    f = u.filter(j),
    g = u.map((N) => {
      const I = yn(t, N),
        S = (I.accounting.payments || []).filter(
          (w) => Number(w.paid || 0) < Number(w.expected || 0),
        ),
        L = S.filter((w) => w.dueAt < s),
        H = S.filter((w) => w.dueAt >= s && w.dueAt <= x),
        _ =
          [...S].sort((w, B) =>
            String(w.dueAt).localeCompare(String(B.dueAt)),
          )[0] || null,
        A = L.length
          ? "overdue"
          : H.length
            ? "due"
            : S.length
              ? "receivable"
              : (I.accounting.payments || []).length
                ? "paid"
                : "none";
      return {
        project: N,
        ...I,
        unpaid: S,
        overdue: L,
        dueSoon: H,
        nextPayment: _,
        financeState: A,
      };
    }),
    b = g.filter((N) => f.some((I) => I.codice === N.project.codice)),
    h = g
      .flatMap((N) =>
        (N.accounting.payments || []).map((I) => ({
          ...I,
          project: N.project,
        })),
      )
      .filter((N) => Number(N.paid || 0) < Number(N.expected || 0)),
    p = h.filter((N) => N.dueAt >= s && N.dueAt <= x),
    y = h.filter((N) => N.dueAt < s),
    O = g.reduce((N, I) => N + I.turnover, 0),
    k = g.reduce((N, I) => N + I.paid, 0),
    z = g.reduce((N, I) => N + I.receivable, 0),
    E = p.reduce(
      (N, I) => N + Math.max(0, Number(I.expected || 0) - Number(I.paid || 0)),
      0,
    ),
    U = t.progetti.find((N) => N.codice === l);
  if (U) return e.jsx(Yp, { project: U, data: t, onBack: () => o(null) });
  if (r && !i) {
    const N = je.map((I) => {
      const S = t.progetti.filter((H) => Jt(H.codice) === I.id),
        L = S.map((H) => yn(t, H));
      return {
        studio: I,
        projects: S,
        turnover: L.reduce((H, _) => H + _.turnover, 0),
        paid: L.reduce((H, _) => H + _.paid, 0),
        expenses: L.reduce((H, _) => H + _.totalExpenses, 0),
        profit: L.reduce((H, _) => H + _.expectedProfit, 0),
      };
    });
    return e.jsxs(e.Fragment, {
      children: [
        e.jsx(ae, {
          title: "Contabilità",
          subtitle: "Andamento economico complessivo dei singoli studi.",
        }),
        e.jsx("div", {
          className: "desk-studio-account-grid",
          children: N.map((I) =>
            e.jsxs(
              "button",
              {
                onClick: () => a(I.studio.id),
                children: [
                  e.jsxs("header", {
                    children: [
                      e.jsxs("span", {
                        children: [
                          e.jsx("small", { children: "STUDIO" }),
                          e.jsx("b", { children: I.studio.name }),
                        ],
                      }),
                      e.jsx(ve, {}),
                    ],
                  }),
                  e.jsxs("div", {
                    children: [
                      e.jsxs("span", {
                        children: [
                          e.jsx("small", { children: "Fatturato" }),
                          e.jsx("b", { children: W(I.turnover) }),
                        ],
                      }),
                      e.jsxs("span", {
                        children: [
                          e.jsx("small", { children: "Incassato" }),
                          e.jsx("b", { children: W(I.paid) }),
                        ],
                      }),
                      e.jsxs("span", {
                        children: [
                          e.jsx("small", { children: "Spese" }),
                          e.jsx("b", { children: W(I.expenses) }),
                        ],
                      }),
                      e.jsxs("span", {
                        children: [
                          e.jsx("small", { children: "Margine" }),
                          e.jsx("b", { children: W(I.profit) }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs("footer", {
                    children: [I.projects.length, " progetti assegnati"],
                  }),
                ],
              },
              I.studio.id,
            ),
          ),
        }),
      ],
    });
  }
  if (r && i) {
    const N = je.find((S) => S.id === i),
      I = u.map((S) => ({ project: S, ...yn(t, S) }));
    return e.jsxs(e.Fragment, {
      children: [
        e.jsxs("button", {
          className: "desk-back",
          onClick: () => a(null),
          children: [e.jsx(Re, {}), "Torna agli studi"],
        }),
        e.jsx(ae, {
          eyebrow: "ARCHEA PROPERTY · STUDIO",
          title: (N == null ? void 0 : N.name) || "",
          subtitle: "Progetti, fatturato, incassi, costi e marginalità.",
        }),
        e.jsxs("div", {
          className: "desk-stats",
          children: [
            e.jsx(Q, {
              label: "Fatturato",
              value: W(I.reduce((S, L) => S + L.turnover, 0)),
            }),
            e.jsx(Q, {
              label: "Incassato",
              value: W(I.reduce((S, L) => S + L.paid, 0)),
            }),
            e.jsx(Q, {
              label: "Spese",
              value: W(I.reduce((S, L) => S + L.totalExpenses, 0)),
            }),
            e.jsx(Q, {
              label: "Margine",
              value: W(I.reduce((S, L) => S + L.expectedProfit, 0)),
            }),
          ],
        }),
        e.jsx("div", {
          className: "desk-table-wrap desk-accounting-overview-table-wrap",
          children: e.jsxs("table", {
            className: "desk-table desk-account-projects",
            children: [
              e.jsx("thead", {
                children: e.jsxs("tr", {
                  children: [
                    e.jsx("th", { children: "Progetto" }),
                    e.jsx("th", { children: "Fatturato" }),
                    e.jsx("th", { children: "Incassato" }),
                    e.jsx("th", { children: "Spese" }),
                    e.jsx("th", { children: "Margine" }),
                    e.jsx("th", {}),
                  ],
                }),
              }),
              e.jsx("tbody", {
                children: I.map((S) =>
                  e.jsxs(
                    "tr",
                    {
                      onClick: () => o(S.project.codice),
                      children: [
                        e.jsxs("td", {
                          children: [
                            e.jsx("b", { children: S.project.codice }),
                            e.jsx("small", { children: S.project.nome }),
                          ],
                        }),
                        e.jsx("td", { children: W(S.turnover) }),
                        e.jsx("td", { children: W(S.paid) }),
                        e.jsx("td", { children: W(S.totalExpenses) }),
                        e.jsx("td", {
                          children: e.jsx("b", {
                            children: W(S.expectedProfit),
                          }),
                        }),
                        e.jsx("td", { children: e.jsx(ve, {}) }),
                      ],
                    },
                    S.project.codice,
                  ),
                ),
              }),
            ],
          }),
        }),
      ],
    });
  }
  const P = [
      {
        value: "all",
        label: "Tutte le commesse",
        meta: `${u.length} progetti nello storico`,
      },
      {
        value: "receivable",
        label: "Da incassare",
        meta: "Commesse con importi ancora aperti",
      },
      {
        value: "due",
        label: "Pagamenti in scadenza",
        meta: "Scadenze previste nei prossimi 30 giorni",
      },
      {
        value: "overdue",
        label: "Pagamenti scaduti",
        meta: "Scadenze superate con residuo aperto",
      },
      {
        value: "paid",
        label: "Interamente incassati",
        meta: "Commesse con pagamenti completati",
      },
    ],
    $ = [
      {
        value: "all",
        label: "Tutti i progetti filtrati",
        meta: `${b.length} risultati`,
      },
      ...b.map((N) => ({
        value: N.project.codice,
        label: `${N.project.codice} · ${N.project.nome}`,
        meta: `${N.project.stato} · ${W(N.receivable)} da incassare`,
      })),
    ];
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(ae, {
        title: "Contabilità",
        subtitle:
          "Panoramica generale, scadenze e storico economico di tutte le commesse.",
      }),
      e.jsxs("div", {
        className: "desk-accounting-overview",
        children: [
          e.jsx(Q, { label: "Fatturato totale", value: W(O) }),
          e.jsx(Q, { label: "Incassato", value: W(k) }),
          e.jsx(Q, { label: "Da incassare", value: W(z), tone: "warn" }),
          e.jsx(Q, {
            label: "In scadenza entro 30 giorni",
            value: W(E),
            tone: "warn",
          }),
          e.jsx(Q, {
            label: "Progetti con pagamenti scaduti",
            value: new Set(y.map((N) => N.project.codice)).size,
            tone: "alert",
          }),
        ],
      }),
      e.jsxs("section", {
        className: "desk-accounting-snapshot",
        children: [
          e.jsxs("header", {
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("small", { children: "SITUAZIONE GENERALE" }),
                  e.jsx("h2", { children: "Scadenze e criticità di incasso" }),
                ],
              }),
              e.jsx("span", { children: "Aggiornata sui dati demo" }),
            ],
          }),
          e.jsxs("div", {
            children: [
              e.jsxs("article", {
                children: [
                  e.jsx("b", { children: p.length }),
                  e.jsx("span", { children: "pagamenti in scadenza" }),
                  e.jsx("small", { children: "nei prossimi 30 giorni" }),
                ],
              }),
              e.jsxs("article", {
                className: "alert",
                children: [
                  e.jsx("b", { children: y.length }),
                  e.jsx("span", { children: "pagamenti scaduti" }),
                  e.jsxs("small", {
                    children: [
                      W(
                        y.reduce(
                          (N, I) => N + Math.max(0, I.expected - I.paid),
                          0,
                        ),
                      ),
                      " ancora aperti",
                    ],
                  }),
                ],
              }),
              e.jsxs("article", {
                children: [
                  e.jsx("b", {
                    children: g.filter((N) => N.financeState === "paid").length,
                  }),
                  e.jsx("span", { children: "progetti incassati" }),
                  e.jsx("small", { children: "pagamenti completati" }),
                ],
              }),
            ],
          }),
        ],
      }),
      e.jsxs("div", {
        className: "desk-accounting-filters",
        children: [
          e.jsx(qd, {
            label: "STATO CONTABILE",
            value: c,
            options: P,
            onChange: (N) => {
              d(N), o(null);
            },
            title: "Filtra la situazione contabile",
            subtitle:
              "La selezione aggiorna l’elenco complessivo delle commesse",
          }),
          e.jsx(qd, {
            label: "PROGETTO / STORICO",
            value: l || "all",
            options: $,
            onChange: (N) => o(N === "all" ? null : N),
            title: "Scegli progetto",
            subtitle: "Apri il quadro economico completo di una commessa",
          }),
        ],
      }),
      b.length
        ? e.jsx("div", {
            className: "desk-table-wrap desk-accounting-overview-table-wrap",
            children: e.jsxs("table", {
              className: "desk-table desk-accounting-overview-table",
              children: [
                e.jsx("thead", {
                  children: e.jsxs("tr", {
                    children: [
                      e.jsx("th", { children: "Progetto" }),
                      e.jsx("th", { children: "Stato progetto" }),
                      e.jsx("th", { children: "Fatturato" }),
                      e.jsx("th", { children: "Incassato" }),
                      e.jsx("th", { children: "Da incassare" }),
                      e.jsx("th", { children: "Prossima scadenza" }),
                      e.jsx("th", { children: "Situazione" }),
                      e.jsx("th", {}),
                    ],
                  }),
                }),
                e.jsx("tbody", {
                  children: b.map((N) =>
                    e.jsxs(
                      "tr",
                      {
                        onClick: () => o(N.project.codice),
                        children: [
                          e.jsxs("td", {
                            children: [
                              e.jsx("b", { children: N.project.codice }),
                              e.jsx("small", { children: N.project.nome }),
                            ],
                          }),
                          e.jsx("td", {
                            children: e.jsx("i", {
                              className: `project-state ${projectStatusSlug(N.project.stato)}`,
                              children: normalizeProjectStatus(N.project.stato),
                            }),
                          }),
                          e.jsx("td", { children: W(N.turnover) }),
                          e.jsx("td", { children: W(N.paid) }),
                          e.jsx("td", {
                            children: e.jsx("b", { children: W(N.receivable) }),
                          }),
                          e.jsx("td", {
                            children: N.nextPayment
                              ? e.jsxs(e.Fragment, {
                                  children: [
                                    e.jsx("b", {
                                      children: Dt(N.nextPayment.dueAt),
                                    }),
                                    e.jsx("small", {
                                      children: N.nextPayment.label,
                                    }),
                                  ],
                                })
                              : "—",
                          }),
                          e.jsx("td", {
                            children: e.jsx("i", {
                              className: `desk-payment-status ${N.financeState === "paid" ? "complete" : N.financeState === "due" ? "partial" : N.financeState === "overdue" ? "overdue" : ""}`,
                              children:
                                N.financeState === "overdue"
                                  ? "Scaduto"
                                  : N.financeState === "due"
                                    ? "In scadenza"
                                    : N.financeState === "receivable"
                                      ? "Da incassare"
                                      : N.financeState === "paid"
                                        ? "Incassato"
                                        : "Nessun piano",
                            }),
                          }),
                          e.jsx("td", { children: e.jsx(ve, {}) }),
                        ],
                      },
                      N.project.codice,
                    ),
                  ),
                }),
              ],
            }),
          })
        : e.jsxs("div", {
            className: "desk-empty-state",
            children: [
              e.jsx("b", {
                children: "Nessuna commessa corrisponde al filtro",
              }),
              e.jsx("span", {
                children:
                  "Prova a selezionare una situazione contabile diversa.",
              }),
            ],
          }),
    ],
  });
}
function Rv({ tasks: t, hours: n }) {
  const { data: s, today: r, viewer: i } = Y(),
    a = [
      "trend",
      "pressure",
      "workload",
      "status",
      "types",
      "team",
      "timing",
      "deadlines",
      "economics",
    ],
    l = [
      {
        id: "trend",
        label: "Work Statistics",
        description: "Andamento del carico negli ultimi 12 mesi",
      },
      {
        id: "pressure",
        label: "Project Pressure",
        description: "Carico task per progetto",
      },
      {
        id: "workload",
        label: "Workload",
        description: "Ore registrate per progetto",
      },
      {
        id: "status",
        label: "Project Status",
        description: "Distribuzione degli stati delle commesse",
      },
      {
        id: "types",
        label: "Task Mix",
        description: "Tipologie di attività più frequenti",
      },
      {
        id: "team",
        label: "Team Capacity",
        description: "Ore registrate per risorsa",
      },
      {
        id: "timing",
        label: "Puntualità",
        description: "Consegne anticipate, puntuali o in ritardo",
      },
      {
        id: "deadlines",
        label: "Scadenze",
        description: "Situazione delle task aperte",
      },
      {
        id: "economics",
        label: "Economics",
        description: "Quadro economico dimostrativo",
      },
    ],
    [o, c] = ke(`archea-insight-order-${i.id}`, a),
    [d, u] = ke(`archea-insight-visible-${i.id}`, a),
    [m, x] = C.useState(!1),
    j = C.useRef(null),
    f = (T) => ({
      draggable: !0,
      hidden: !d.includes(T),
      "data-widget": T,
      style: { order: Math.max(0, o.indexOf(T)) },
      onDragStart: (D) => {
        (j.current = T), (D.dataTransfer.effectAllowed = "move");
      },
      onDragOver: (D) => {
        D.preventDefault(), (D.dataTransfer.dropEffect = "move");
      },
      onDrop: (D) => {
        D.preventDefault();
        const X = j.current;
        !X ||
          X === T ||
          (c((M) => {
            const q = M.filter((Z) => Z !== X);
            return q.splice(q.indexOf(T), 0, X), q;
          }),
          (j.current = null));
      },
    }),
    g = s.progetti,
    b = t.filter((T) => qe(T, r)),
    v = t.filter((T) => T.completed || T.validated),
    h = n.reduce((T, D) => T + Number(D.ore || 0), 0),
    p = g
      .map((T) => ({
        ...T,
        hours: n
          .filter((D) => D.progettoCodice === T.codice)
          .reduce((D, X) => D + Number(X.ore || 0), 0),
        open: b.filter((D) => D.progettoCodice === T.codice).length,
      }))
      .sort((T, D) => D.hours - T.hours),
    y = Math.max(1, ...p.map((T) => T.hours)),
    O = Math.max(1, ...p.map((T) => T.open)),
    k = PROJECT_STATUS_OPTIONS.map((T) => ({
      state: T.value,
      count: g.filter(
        (D) => normalizeProjectStatus(D.stato) === T.value,
      ).length,
    })),
    z = [...new Set(t.map((T) => T.tipologia).filter(Boolean))]
      .map((T) => ({
        type: T,
        count: t.filter((D) => D.tipologia === T).length,
      }))
      .sort((T, D) => D.count - T.count)
      .slice(0, 7),
    E = Math.max(1, ...z.map((T) => T.count)),
    U = s.persone
      .map((T) => ({
        ...T,
        hours: n
          .filter((D) => D.persona === T.nome)
          .reduce((D, X) => D + Number(X.ore || 0), 0),
      }))
      .filter((T) => T.hours)
      .sort((T, D) => D.hours - T.hours)
      .slice(0, 6),
    P = Math.max(1, ...U.map((T) => T.hours)),
    $ = v.filter(
      (T) => T.dataChiusura && T.scadenza && T.dataChiusura < T.scadenza,
    ).length,
    N = v.filter(
      (T) => T.dataChiusura && T.scadenza && T.dataChiusura === T.scadenza,
    ).length,
    I = v.filter(
      (T) => T.dataChiusura && T.scadenza && T.dataChiusura > T.scadenza,
    ).length,
    S = g.map((T) => wa(T.codice)),
    L = S.reduce((T, D) => T + Number(D.contract.value || 0), 0),
    H = S.flatMap((T) => T.payments).reduce(
      (T, D) => T + Number(D.paid || 0),
      0,
    ),
    _ = S.reduce((T, D) => T + Number(D.consultantExpenses || 0), 0),
    A = h * 10,
    w = L - _ - A,
    B = [55, 72, 64, 88, 76, 96, 84, 108, 92, 118, 104, 126];
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(ae, {
        title: "Insight",
        subtitle:
          i.appRole === "property"
            ? "Andamento generale di progetti, lavoro e contabilità. Trascina le schede per riordinarle."
            : "Dashboard operativa completa. Trascina le schede per organizzare la vista.",
      }),
      e.jsx(Kp, {
        open: m,
        onClose: () => x(!1),
        items: l,
        visible: d,
        onToggle: (T) =>
          u((D) => (D.includes(T) ? D.filter((X) => X !== T) : [...D, T])),
        onShowAll: () => u(a),
      }),
      e.jsxs("div", {
        className: "desk-home-summary-row",
        children: [
          e.jsxs("div", {
            className: "desk-stats insight-kpis",
            children: [
              e.jsx(Q, { label: "Progetti", value: g.length }),
              e.jsx(Q, { label: "Task aperte", value: b.length }),
              e.jsx(Q, { label: "Ore registrate", value: ue(h) }),
              e.jsx(Q, {
                label: "Completamento task",
                value: `${Math.round((v.length / Math.max(1, t.length)) * 100)}%`,
              }),
            ],
          }),
          e.jsxs("div", {
            className: "desk-heading-actions",
            children: [
              e.jsxs("button", {
                className: "desk-widget-add",
                onClick: () => x(!0),
                children: [e.jsx(tt, {}), "Widget"],
              }),
              e.jsx("button", {
                className: "desk-small-button",
                onClick: () => c(a),
                children: "Ripristina ordine",
              }),
            ],
          }),
        ],
      }),
      e.jsxs("div", {
        className: "desk-insight-wide",
        children: [
          e.jsxs("section", {
            className: "desk-chart wide movable",
            ...f("trend"),
            children: [
              e.jsxs("header", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "WORK STATISTICS" }),
                      e.jsx("h2", {
                        children: "Andamento del carico di lavoro",
                      }),
                    ],
                  }),
                  e.jsx("strong", { children: "Ultimi 12 mesi · ⋮⋮" }),
                ],
              }),
              e.jsxs("div", {
                className: "desk-line-chart",
                children: [
                  e.jsx("div", { className: "desk-line-fill" }),
                  e.jsx("svg", {
                    viewBox: "0 0 1100 210",
                    preserveAspectRatio: "none",
                    "aria-hidden": "true",
                    children: e.jsx("polyline", {
                      points: B.map((T, D) => `${D * 100},${195 - T}`).join(
                        " ",
                      ),
                    }),
                  }),
                  e.jsx("div", {
                    children: [
                      "N",
                      "D",
                      "G",
                      "F",
                      "M",
                      "A",
                      "M",
                      "G",
                      "L",
                      "A",
                      "S",
                      "O",
                    ].map((T, D) =>
                      e.jsx(
                        "span",
                        { style: { left: `${(D / 11) * 100}%` }, children: T },
                        `${T}-${D}`,
                      ),
                    ),
                  }),
                ],
              }),
            ],
          }),
          e.jsxs("section", {
            className: "desk-chart movable",
            ...f("pressure"),
            children: [
              e.jsxs("header", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "PROJECT PRESSURE" }),
                      e.jsx("h2", { children: "Carico task per progetto" }),
                    ],
                  }),
                  e.jsx("strong", { children: "⋮⋮" }),
                ],
              }),
              e.jsx("div", {
                className: "desk-bars",
                children: p
                  .slice(0, 7)
                  .map((T) =>
                    e.jsxs(
                      "div",
                      {
                        children: [
                          e.jsxs("span", {
                            children: [
                              T.codice,
                              e.jsx("small", { children: T.nome }),
                            ],
                          }),
                          e.jsx("i", {
                            children: e.jsx("em", {
                              className: "dark",
                              style: { width: `${(T.open / O) * 100}%` },
                            }),
                          }),
                          e.jsx("b", {
                            children: e.jsx(ee, { value: T.open }),
                          }),
                        ],
                      },
                      T.codice,
                    ),
                  ),
              }),
            ],
          }),
          e.jsxs("section", {
            className: "desk-chart movable",
            ...f("workload"),
            children: [
              e.jsxs("header", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "WORKLOAD" }),
                      e.jsx("h2", { children: "Ore per progetto" }),
                    ],
                  }),
                  e.jsx("strong", { children: "⋮⋮" }),
                ],
              }),
              e.jsx("div", {
                className: "desk-bars",
                children: p
                  .slice(0, 7)
                  .map((T) =>
                    e.jsxs(
                      "div",
                      {
                        children: [
                          e.jsxs("span", {
                            children: [
                              T.codice,
                              e.jsx("small", { children: T.nome }),
                            ],
                          }),
                          e.jsx("i", {
                            children: e.jsx("em", {
                              style: { width: `${(T.hours / y) * 100}%` },
                            }),
                          }),
                          e.jsx("b", {
                            children: e.jsx(ee, {
                              value: `${Math.round(T.hours)} h`,
                            }),
                          }),
                        ],
                      },
                      T.codice,
                    ),
                  ),
              }),
            ],
          }),
          e.jsxs("section", {
            className: "desk-chart movable",
            ...f("status"),
            children: [
              e.jsxs("header", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "PROJECT STATUS" }),
                      e.jsx("h2", { children: "Stato delle commesse" }),
                    ],
                  }),
                  e.jsx("strong", { children: "⋮⋮" }),
                ],
              }),
              e.jsx("div", {
                className: "desk-status-donuts",
                children: k.map((T, D) =>
                  e.jsxs(
                    "div",
                    {
                      children: [
                        e.jsx("span", {
                          style: {
                            "--value": `${(T.count / Math.max(1, g.length)) * 100}%`,
                            "--ring":
                              D === 0
                                ? "#8fa295"
                                : D === 1
                                  ? "#d5aa72"
                                  : D === 2
                                    ? "#b66f6f"
                                    : "#aeb4b0",
                          },
                          children: e.jsx("b", {
                            children: e.jsx(ee, { value: T.count }),
                          }),
                        }),
                        e.jsx("small", { children: T.state }),
                      ],
                    },
                    T.state,
                  ),
                ),
              }),
            ],
          }),
          e.jsxs("section", {
            className: "desk-chart movable",
            ...f("types"),
            children: [
              e.jsxs("header", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "TASK MIX" }),
                      e.jsx("h2", { children: "Tipologie di attività" }),
                    ],
                  }),
                  e.jsx("strong", { children: "⋮⋮" }),
                ],
              }),
              e.jsx("div", {
                className: "desk-bars",
                children: z.map((T) =>
                  e.jsxs(
                    "div",
                    {
                      children: [
                        e.jsx("span", { children: T.type }),
                        e.jsx("i", {
                          children: e.jsx("em", {
                            style: { width: `${(T.count / E) * 100}%` },
                          }),
                        }),
                        e.jsx("b", { children: e.jsx(ee, { value: T.count }) }),
                      ],
                    },
                    T.type,
                  ),
                ),
              }),
            ],
          }),
          e.jsxs("section", {
            className: "desk-chart movable",
            ...f("team"),
            children: [
              e.jsxs("header", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "TEAM CAPACITY" }),
                      e.jsx("h2", { children: "Ore per risorsa" }),
                    ],
                  }),
                  e.jsx("strong", { children: "⋮⋮" }),
                ],
              }),
              e.jsx("div", {
                className: "desk-bars",
                children: U.map((T) =>
                  e.jsxs(
                    "div",
                    {
                      children: [
                        e.jsxs("span", {
                          children: [
                            T.nome,
                            e.jsx("small", { children: T.ruolo || "" }),
                          ],
                        }),
                        e.jsx("i", {
                          children: e.jsx("em", {
                            className: "dark",
                            style: { width: `${(T.hours / P) * 100}%` },
                          }),
                        }),
                        e.jsx("b", {
                          children: e.jsx(ee, {
                            value: `${Math.round(T.hours)} h`,
                          }),
                        }),
                      ],
                    },
                    T.id,
                  ),
                ),
              }),
            ],
          }),
          e.jsxs("section", {
            className: "desk-chart movable",
            ...f("timing"),
            children: [
              e.jsxs("header", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "PUNTUALITÀ" }),
                      e.jsx("h2", { children: "Consegne completate" }),
                    ],
                  }),
                  e.jsx("strong", { children: "⋮⋮" }),
                ],
              }),
              e.jsxs("div", {
                className: "desk-triple-metric",
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("b", { children: e.jsx(ee, { value: $ }) }),
                      e.jsx("span", { children: "In anticipo" }),
                    ],
                  }),
                  e.jsxs("div", {
                    children: [
                      e.jsx("b", { children: e.jsx(ee, { value: N }) }),
                      e.jsx("span", { children: "Puntuali" }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "alert",
                    children: [
                      e.jsx("b", { children: e.jsx(ee, { value: I }) }),
                      e.jsx("span", { children: "In ritardo" }),
                    ],
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "desk-progress-summary",
                children: [
                  e.jsx("i", {
                    children: e.jsx("em", {
                      style: {
                        width: `${(($ + N) / Math.max(1, v.length)) * 100}%`,
                      },
                    }),
                  }),
                  e.jsxs("span", {
                    children: [
                      e.jsx(ee, {
                        value: `${Math.round((($ + N) / Math.max(1, v.length)) * 100)}%`,
                      }),
                      " entro la scadenza",
                    ],
                  }),
                ],
              }),
            ],
          }),
          e.jsxs("section", {
            className: "desk-chart movable",
            ...f("deadlines"),
            children: [
              e.jsxs("header", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "SCADENZE" }),
                      e.jsx("h2", { children: "Situazione delle task aperte" }),
                    ],
                  }),
                  e.jsx("strong", { children: "⋮⋮" }),
                ],
              }),
              e.jsxs("div", {
                className: "desk-deadline-grid",
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("b", {
                        children: e.jsx(ee, {
                          value: b.filter((T) => Ce(T, r) === "in_lavorazione")
                            .length,
                        }),
                      }),
                      e.jsx("span", { children: "In lavorazione" }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "warn",
                    children: [
                      e.jsx("b", {
                        children: e.jsx(ee, {
                          value: b.filter((T) => Ce(T, r) === "in_scadenza")
                            .length,
                        }),
                      }),
                      e.jsx("span", { children: "In scadenza" }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "alert",
                    children: [
                      e.jsx("b", {
                        children: e.jsx(ee, {
                          value: b.filter((T) => Ce(T, r) === "scaduta").length,
                        }),
                      }),
                      e.jsx("span", { children: "Scadute" }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          e.jsxs("section", {
            className: "desk-chart wide movable",
            ...f("economics"),
            children: [
              e.jsxs("header", {
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("small", { children: "ECONOMICS" }),
                      e.jsx("h2", {
                        children: "Quadro economico dimostrativo",
                      }),
                    ],
                  }),
                  e.jsx("strong", { children: "Tariffa interna €10/h · ⋮⋮" }),
                ],
              }),
              e.jsxs("div", {
                className: "desk-finance-kpis",
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsx("span", { children: "Fatturato" }),
                      e.jsx("b", {
                        children: e.jsx(ee, {
                          value: `€ ${L.toLocaleString("it-IT")}`,
                        }),
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    children: [
                      e.jsx("span", { children: "Incassato" }),
                      e.jsx("b", {
                        children: e.jsx(ee, {
                          value: `€ ${H.toLocaleString("it-IT")}`,
                        }),
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    children: [
                      e.jsx("span", { children: "Consulenze" }),
                      e.jsx("b", {
                        children: e.jsx(ee, {
                          value: `€ ${_.toLocaleString("it-IT")}`,
                        }),
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    children: [
                      e.jsx("span", { children: "Costo ore" }),
                      e.jsx("b", {
                        children: e.jsx(ee, {
                          value: `€ ${A.toLocaleString("it-IT")}`,
                        }),
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "strong",
                    children: [
                      e.jsx("span", { children: "Margine previsto" }),
                      e.jsx("b", {
                        children: e.jsx(ee, {
                          value: `€ ${w.toLocaleString("it-IT")}`,
                        }),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
const supplierDemo = (id, name, mark, category, city, projects, notes) => ({
  id, name, mark, category, city, projects, notes,
  website: `www.${id.replace(/[^a-z0-9]/g, "")}.it`,
  contact: "Referente Contract",
  email: `contract@${id.replace(/[^a-z0-9]/g, "")}-demo.it`,
  phone: "+39 055 000 2026",
  priceLists: [`${name} · Listino Contract 2026.pdf`],
  sheets: [`${name} · Schede tecniche.pdf`, `${name} · Catalogo materiali.pdf`],
});
const SupplierSeed = [
  supplierDemo("41zero42", "41 zero 42", "41", "Pavimenti e rivestimenti", "Fiorano Modenese", ["P51 · Viola Park", "O80 · Milanello Training Center"], "Superfici ceramiche per architettura e interior."),
  supplierDemo("agenzia-bartolini", "Agenzia Bartolini", "GB", "Arredi e complementi", "Firenze", ["P51 · Viola Park", "P52 · Social Housing Firenze"], "Agenzia di rappresentanza per arredo, contract e finiture."),
  supplierDemo("bici", "BICI", "BI", "Arredi e complementi", "Firenze", ["I04 · Capannoncino"], "Progetti e arredamento per spazi contract e residenziali."),
  supplierDemo("botteganove", "Botteganove", "B9", "Mosaici e rivestimenti", "Nove", ["M86 · Stadio Flaminio"], "Mosaici artigianali e superfici decorative."),
  supplierDemo("cantalupi", "Cantalupi Light Engineering", "CL", "Illuminazione", "Viareggio", ["P51 · Viola Park", "H05 · Stadio di Pisa"], "Light engineering e apparecchi su misura."),
  supplierDemo("cimento", "Cimento", "CI", "Rivestimenti e superfici", "Venezia", ["P52 · Social Housing Firenze"], "Elementi leggeri in cemento per interni e facciate."),
  supplierDemo("de-marchi", "De Marchi Verona", "DM", "Arredi e complementi", "Verona", ["O80 · Milanello Training Center"], "Soluzioni e finiture per l’interior contract."),
  supplierDemo("dmm", "DMM", "DM", "Arredi e complementi", "Milano", ["M86 · Stadio Flaminio"], "Collezioni e complementi per spazi di rappresentanza."),
  supplierDemo("ekinex", "Ekinex", "EX", "Domotica e impianti", "Novara", ["P51 · Viola Park", "I04 · Capannoncino"], "Controllo KNX, domotica e dispositivi di comando."),
  supplierDemo("iscom", "Iscom", "IS", "Coperture e facciate", "Verona", ["P51 · Viola Park", "H05 · Stadio di Pisa"], "Sistemi metallici per coperture e involucri."),
  supplierDemo("itlas", "ITLAS", "IT", "Pavimenti in legno", "Cordignano", ["P52 · Social Housing Firenze", "O80 · Milanello Training Center"], "Pavimenti e rivestimenti in legno certificato."),
  supplierDemo("kilife", "Kilife", "K1", "Arredi e complementi", "Milano", ["I04 · Capannoncino"], "Complementi e soluzioni per l’interior contemporaneo."),
  supplierDemo("lesko", "Lesko", "LE", "Illuminazione", "Milano", ["M86 · Stadio Flaminio"], "Illuminazione tecnica e decorativa per il contract."),
  supplierDemo("lip-lighting", "LiP Lighting", "LiP", "Illuminazione", "Firenze", ["P51 · Viola Park", "I04 · Capannoncino"], "Progettazione illuminotecnica e apparecchi professionali."),
  supplierDemo("luce5", "Luce5", "L5", "Illuminazione", "Firenze", ["H05 · Stadio di Pisa"], "Sistemi di luce architetturale e custom."),
  supplierDemo("mafi", "Mafi", "MA", "Pavimenti in legno", "Austria", ["O80 · Milanello Training Center"], "Pavimenti naturali in legno per interior di alta gamma."),
  supplierDemo("nextworks", "Nextworks", "NW", "Domotica e impianti", "Lucca", ["P51 · Viola Park", "M86 · Stadio Flaminio"], "Sistemi integrati, building automation e supervisione."),
  supplierDemo("olev", "Olev", "OL", "Illuminazione", "Colceresa", ["P52 · Social Housing Firenze"], "Luce decorativa e sistemi fonoassorbenti illuminanti."),
  supplierDemo("operaprima", "Operaprima", "OP", "Arredi e complementi", "Firenze", ["I04 · Capannoncino", "M86 · Stadio Flaminio"], "Ricerca e fornitura di prodotti per l’interior."),
  supplierDemo("passamaneria-moderna", "Passamaneria Moderna", "PM", "Tessili", "Firenze", ["P51 · Viola Park"], "Passamanerie, tessuti e finiture decorative su misura."),
  supplierDemo("roda", "Roda", "RO", "Arredi outdoor", "Varese", ["P51 · Viola Park", "O80 · Milanello Training Center"], "Arredi outdoor per hospitality e paesaggio."),
  supplierDemo("schueco", "Schüco Italia", "S", "Facciate e serramenti", "Padova", ["P51 · Viola Park", "M86 · Stadio Flaminio"], "Sistemi in alluminio per involucri ad alte prestazioni."),
  supplierDemo("studio-interni", "Studio D’Interni", "SI", "Arredi e complementi", "Firenze", ["P52 · Social Housing Firenze"], "Consulenza, arredi e coordinamento forniture interior."),
  supplierDemo("secco-sistemi", "Secco Sistemi", "SE", "Facciate e serramenti", "Treviso", ["M86 · Stadio Flaminio", "I04 · Capannoncino"], "Profili sottili in acciaio, ottone e corten."),
];
const MaterialSeed = [
  { id: "mat-01", name: "Buildtech 2.0 Bone", category: "Pavimenti", material: "Ceramica", brand: "Florim", location: "M02 · Cassetto 04", tone: "sand", finish: "Naturale opaco", format: "60 × 120 cm", code: "BT20-BONE-60120", performance: "R10 · Gres porcellanato · 9 mm", notes: "Campione grande disponibile anche in formato 120 × 120 cm." },
  { id: "mat-02", name: "Stopray Vision 50", category: "Vetri", material: "Vetro", brand: "AGC Glass Europe", location: "V01 · Rastrelliera 02", tone: "glass", finish: "Selettivo neutro", format: "Campione 30 × 30 cm", code: "SRV50-8-16-66.2", performance: "Ug 1,0 W/m²K · TL 49% · g 27%", notes: "Vetro camera dimostrativo con stratificato interno." },
  { id: "mat-03", name: "Kvadrat Remix 3 · 123", category: "Tessili", material: "Stoffa", brand: "Kvadrat", location: "T03 · Raccoglitore 11", tone: "fabric", finish: "Intreccio melange", format: "Taglio 20 × 30 cm", code: "REMIX3-123", performance: "Martindale 100.000 · EN 1021", notes: "Tessuto per sedute e pannelli fonoassorbenti." },
  { id: "mat-04", name: "AWS 75.SI+ Anodic Bronze", category: "Finestre", material: "Alluminio", brand: "Schüco Italia", location: "F01 · Telaio campioni", tone: "bronze", finish: "Anodizzato spazzolato", format: "Profilo 40 cm", code: "AWS75-BR-A6", performance: "Uf fino a 1,6 W/m²K · RC3", notes: "Nodo angolare e fermavetro inclusi nel campione." },
  { id: "mat-05", name: "Rovere Europeo Naturale", category: "Pavimenti", material: "Legno", brand: "Listone Giordano", location: "M01 · Cassetto 09", tone: "wood", finish: "Spazzolato olio naturale", format: "14 × 190 × 1200 mm", code: "LG-ROV-NAT-19", performance: "Classe 1 · posa incollata", notes: "Campione con scheda di manutenzione e certificazione FSC." },
  { id: "mat-06", name: "Travertino Silver Vein Cut", category: "Rivestimenti", material: "Pietra", brand: "Margraf", location: "P02 · Ripiano 03", tone: "stone", finish: "Levigato", format: "30 × 60 × 2 cm", code: "TR-SV-LV", performance: "Uso interno/esterno protetto", notes: "Campione con trattamento idro-oleorepellente." },
];
const TechnicalSeed = [
  { id: "vp-b", project: "P51", title: "Padiglione B · Copertura", subtitle: "Viola Park · Bagno a Ripoli", theme: "roof", points: [
    { id: "skylight", x: 31, y: 32, label: "Lucernario continuo", supplier: "Schüco Italia", layers: ["Vetro stratificato selettivo", "Telaio alluminio a taglio termico", "Controtelaio coibentato", "Scossalina in alluminio"], detail: "Nodo apribile motorizzato per ventilazione e controllo fumi.", photos: ["Cantiere · posa controtelaio", "Opera finita · vista interna"] },
    { id: "green", x: 58, y: 48, label: "Copertura verde", supplier: "Harpo Seic", layers: ["Sedum estensivo", "Substrato 10 cm", "Elemento drenante", "Guaina antiradice", "Isolamento XPS"], detail: "Sistema estensivo a bassa manutenzione con troppo pieno ispezionabile.", photos: ["Cantiere · stesura drenante", "Opera finita · vista copertura"] },
    { id: "parapet", x: 79, y: 35, label: "Parapetto perimetrale", supplier: "AGC Glass Europe", layers: ["Vetro 10+10 temperato stratificato", "Profilo continuo incassato", "Carter alluminio verniciato"], detail: "Parapetto vetrato continuo con fissaggio nascosto.", photos: ["Mock-up · profilo incassato", "Opera finita · bordo copertura"] },
  ]},
  { id: "flaminio", project: "M86", title: "Museo Flaminio · Involucro", subtitle: "Stadio Flaminio · Roma", theme: "museum", points: [
    { id: "glasswall", x: 38, y: 44, label: "Vetrata panoramica", supplier: "AGC Glass Europe", layers: ["Vetro extraclear stratificato", "Camera 18 mm", "Lastra selettiva esterna", "Montante minimale"], detail: "Vetrata orientata verso il Palazzetto dello Sport di Pier Luigi Nervi.", photos: ["Mock-up · giunto verticale", "Vista finita · museo"] },
    { id: "light", x: 68, y: 63, label: "Luce lineare intradosso", supplier: "iGuzzini", layers: ["Profilo LED 3000 K", "Diffusore opale", "Canale tecnico ispezionabile"], detail: "Illuminazione indiretta continua sotto l’intradosso delle travi.", photos: ["Prova luce · 3000 K", "Opera finita · sala espositiva"] },
  ]},
];
const ParcelSeed = [
  { id: "pk-101", courier: "Amazon Business", tracking: "AMZ-847215", recipient: "Francesco Diamanti", arrivedAt: "27/10/2026 · 10:42", status: "waiting", note: "Scatola media · reception Firenze" },
  { id: "pk-102", courier: "DHL", tracking: "DHL-550981", recipient: "Lisandro Leyra", arrivedAt: "27/10/2026 · 11:18", status: "waiting", note: "Busta documenti" },
  { id: "pk-103", courier: "Amazon", tracking: "AMZ-770341", recipient: "Alessandro Botrini", arrivedAt: "26/10/2026 · 16:05", status: "delivered", note: "Consegnato alle 17:20" },
];
const MinutesTasks = [
  { id: "minute-1", project: "P51", title: "Verificare quota davanzali facciata nord", owner: "Alessandro Botrini", priority: "Alta", due: "2026-10-30" },
  { id: "minute-2", project: "P51", title: "Inviare dettaglio impermeabilizzazione lucernari", owner: "Lisandro Leyra", priority: "Alta", due: "2026-10-29" },
  { id: "minute-3", project: "P51", title: "Confermare campione finitura parapetto", owner: "Francesco Diamanti", priority: "Media", due: "2026-11-03" },
  { id: "minute-4", project: "P51", title: "Aggiornare tavola copertura con troppo pieno", owner: "Lisandro Leyra", priority: "Media", due: "2026-11-04" },
];
const canEditStudioTools = (t) => ["senior_architect", "partner_architect", "property"].includes(t == null ? void 0 : t.appRole);
const canManageMaterials = (t) =>
  (t == null ? void 0 : t.id) === "mmadaghiele" || !!(t != null && t.isDeveloper);
function SupplierStudioIcon({ size: t = 22 }) {
  return e.jsxs("svg", { width: t, height: t, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round", children: [e.jsx("circle", { cx: "6.5", cy: "6", r: "2.3" }), e.jsx("path", { d: "M2.8 15.5v-2.8a3.7 3.7 0 0 1 7.4 0v2.8M13 4.5h7v4h-7zM13 10h7v4h-7zM13 15.5h7v4h-7z" })] });
}
function MaterialStudioIcon({ size: t = 22 }) {
  return e.jsxs("svg", { width: t, height: t, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round", children: [e.jsx("path", { d: "m4 7 8-4 8 4-8 4z" }), e.jsx("path", { d: "m4 12 8 4 8-4M4 17l8 4 8-4" })] });
}
function DepartmentStudioIcon({ size: t = 22 }) {
  return e.jsxs("svg", { width: t, height: t, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round", children: [e.jsx("path", { d: "M4 19V8l8-4 8 4v11" }), e.jsx("path", { d: "M8 19v-5h8v5M8 9h.01M12 9h.01M16 9h.01" })] });
}
function StudioToolHeading({ title: t, subtitle: n, action: s = null, eyebrow: r = "ARCHEA WORKSPACE", back: a = !0 }) {
  const { setTab: i } = Y();
  return e.jsxs(e.Fragment, { children: [a && e.jsxs("button", { className: "studio-tool-mobile-back", onClick: () => i("altro"), children: [e.jsx(Re, {}), "Torna ad Altro"] }), e.jsxs("div", { className: "studio-tool-heading", children: [e.jsxs("div", { children: [e.jsx("small", { children: r }), e.jsx("h1", { children: t }), e.jsx("p", { children: n })] }), s] })] });
}
function SupplierDetail({ supplier: t, editable: n, onClose: s, onSave: r }) {
  const [i, a] = C.useState(t), [l, o] = C.useState(!1);
  return e.jsx(De, { title: i.name, subtitle: `${i.category} · ${i.city}`, onClose: s, wide: !0, children: e.jsxs("div", { className: "supplier-detail", children: [
    e.jsxs("section", { className: "supplier-identity", children: [e.jsx("span", { className: "supplier-logo large", children: i.mark }), e.jsxs("div", { children: [e.jsx("small", { children: "AZIENDA" }), e.jsx("h3", { children: i.name }), e.jsx("p", { children: i.notes })] }), n && e.jsx("button", { className: "desk-small-button", onClick: () => o(!l), children: l ? "Fine modifica" : "Modifica" })] }),
    l ? e.jsxs("div", { className: "studio-edit-grid", children: [e.jsxs("label", { children: ["Referente", e.jsx("input", { value: i.contact, onChange: c => a({ ...i, contact: c.target.value }) })] }), e.jsxs("label", { children: ["Email", e.jsx("input", { value: i.email, onChange: c => a({ ...i, email: c.target.value }) })] }), e.jsxs("label", { children: ["Telefono", e.jsx("input", { value: i.phone, onChange: c => a({ ...i, phone: c.target.value }) })] }), e.jsxs("label", { className: "wide", children: ["Note", e.jsx("textarea", { value: i.notes, onChange: c => a({ ...i, notes: c.target.value }) })] }), e.jsx("button", { className: "desk-primary", onClick: () => { r(i); o(!1); }, children: "Salva aggiornamenti" })] }) : e.jsxs("div", { className: "supplier-info-grid", children: [e.jsxs("article", { children: [e.jsx("small", { children: "REFERENTE" }), e.jsx("b", { children: i.contact }), e.jsx("span", { children: i.email }), e.jsx("span", { children: i.phone })] }), e.jsxs("article", { children: [e.jsx("small", { children: "SEDE E WEB" }), e.jsx("b", { children: i.city }), e.jsx("span", { children: i.website })] })] }),
    e.jsxs("div", { className: "studio-detail-columns", children: [e.jsxs("section", { children: [e.jsx("h3", { children: "Progetti in cui è stata utilizzata" }), i.projects.map(c => e.jsx("span", { className: "studio-doc-row", children: c }, c))] }), e.jsxs("section", { children: [e.jsx("h3", { children: "Listini aggiornati" }), i.priceLists.map(c => e.jsxs("button", { className: "studio-doc-row", children: [e.jsx(wt, {}), c, e.jsx("em", { children: "Apri" })] }, c))] }), e.jsxs("section", { children: [e.jsx("h3", { children: "Schede tecniche" }), i.sheets.map(c => e.jsxs("button", { className: "studio-doc-row", children: [e.jsx(wt, {}), c, e.jsx("em", { children: "PDF" })] }, c))] })] })
  ] }) });
}
function SuppliersDemo() {
  const { viewer: t } = Y(), n = canEditStudioTools(t), [s, r] = ke("archea-demo-suppliers-v2", SupplierSeed), [i, a] = C.useState("all"), [l, o] = C.useState("all"), [c, d] = C.useState(null), u = [...new Set(s.map(f => f.category))], m = [...new Set(s.flatMap(f => f.projects))], x = s.filter(f => (i === "all" || f.category === i) && (l === "all" || f.projects.includes(l)));
  const j = () => { const f = { ...SupplierSeed[0], id: en("supplier"), name: "Nuovo fornitore", mark: "NF", projects: [], priceLists: [], sheets: [], contact: "Da compilare", email: "", phone: "", notes: "Scheda demo appena creata." }; r(g => [f, ...g]); d(f.id); };
  return e.jsxs(e.Fragment, { children: [e.jsx(StudioToolHeading, { title: "Fornitori", subtitle: n ? "Archivio contatti, progetti, listini e schede tecniche. Puoi aggiornare le schede demo." : "Archivio consultabile di aziende e referenti dello studio.", action: n ? e.jsxs("button", { className: "desk-primary", onClick: j, children: [e.jsx(tt, {}), "Aggiungi fornitore"] }) : e.jsx("span", { className: "read-only-badge", children: "Sola lettura" }) }), e.jsxs("div", { className: "studio-tool-filters supplier-filters", children: [e.jsx(fe, { label: "Categoria", value: i, onChange: a, options: [{ value: "all", label: "Tutte le categorie", meta: `${s.length} aziende` }, ...u.map(f => ({ value: f, label: f }))] }), e.jsx(fe, { label: "Progetto", value: l, onChange: o, searchable: !0, options: [{ value: "all", label: "Tutti i progetti", meta: `${m.length} commesse` }, ...m.map(f => ({ value: f, label: f }))] })] }), e.jsx("div", { className: "supplier-grid", children: x.map(f => e.jsxs("article", { className: "supplier-card", children: [e.jsx("button", { className: "supplier-logo", onClick: () => d(f.id), "aria-label": `Apri ${f.name}`, children: f.mark }), e.jsxs("div", { children: [e.jsx("small", { children: f.category }), e.jsx("h2", { children: f.name }), e.jsx("p", { children: f.notes }), e.jsxs("span", { children: [f.contact, " · ", f.city] })] }), e.jsx("button", { className: "supplier-open", onClick: () => d(f.id), children: "Apri scheda" })] }, f.id)) }), !x.length && e.jsx("p", { className: "desk-empty", children: "Nessun fornitore corrisponde ai filtri selezionati." }), c && e.jsx(SupplierDetail, { supplier: s.find(f => f.id === c), editable: n, onClose: () => d(null), onSave: f => r(g => g.map(b => b.id === f.id ? f : b)) })] });
}
function MaterialDetail({ item: t, editable: n, onClose: s, onSave: r }) {
  const [i, a] = C.useState(t), [l, o] = C.useState(!1);
  return e.jsx(De, { title: i.name, subtitle: `${i.brand} · ${i.category}`, onClose: s, wide: !0, children: e.jsxs("div", { className: "material-detail", children: [e.jsx("div", { className: `material-preview large ${i.tone}`, children: e.jsx("span", { children: i.code }) }), e.jsxs("div", { className: "material-detail-copy", children: [e.jsxs("header", { children: [e.jsxs("div", { children: [e.jsx("small", { children: "CAMPIONE MATERIOTECA" }), e.jsx("h3", { children: i.name }), e.jsx("p", { children: i.notes })] }), n && e.jsx("button", { className: "desk-small-button", onClick: () => o(!l), children: l ? "Annulla" : "Modifica" })] }), l ? e.jsxs("div", { className: "studio-edit-grid", children: [e.jsxs("label", { children: ["Posizione", e.jsx("input", { value: i.location, onChange: c => a({ ...i, location: c.target.value }) })] }), e.jsxs("label", { children: ["Finitura", e.jsx("input", { value: i.finish, onChange: c => a({ ...i, finish: c.target.value }) })] }), e.jsxs("label", { className: "wide", children: ["Note", e.jsx("textarea", { value: i.notes, onChange: c => a({ ...i, notes: c.target.value }) })] }), e.jsx("button", { className: "desk-primary", onClick: () => { r(i); o(!1); }, children: "Salva campione" })] }) : e.jsxs("div", { className: "material-spec-grid", children: [["Azienda", i.brand], ["Materiale", i.material], ["Finitura", i.finish], ["Formato", i.format], ["Prestazioni", i.performance], ["Posizione in materioteca", i.location]].map(([c,d]) => e.jsxs("article", { children: [e.jsx("small", { children: c }), e.jsx("b", { children: d })] }, c)) })] })] }) });
}
function MaterialsDemo() {
  const { viewer: t } = Y(), n = canEditStudioTools(t), [s, r] = ke("archea-demo-materials-v1", MaterialSeed), [i, a] = C.useState("all"), [l, o] = C.useState("all"), [c, d] = C.useState("all"), [u, m] = C.useState(null), x = [...new Set(s.map(g => g.category))], j = [...new Set(s.map(g => g.material))], f = [...new Set(s.map(g => g.brand))], b = s.filter(g => (i === "all" || g.category === i) && (l === "all" || g.material === l) && (c === "all" || g.brand === c));
  const v = () => { const g = { ...MaterialSeed[0], id: en("material"), name: "Nuovo campione", code: "DA-COMPILARE", location: "Da assegnare", notes: "Campione aggiunto nella demo." }; r(h => [g, ...h]); m(g.id); };
  return e.jsxs(e.Fragment, { children: [e.jsx(StudioToolHeading, { title: "Materioteca", subtitle: "Catalogo digitale dei campioni fisici disponibili nello studio.", action: n ? e.jsxs("button", { className: "desk-primary", onClick: v, children: [e.jsx(tt, {}), "Aggiungi campione"] }) : e.jsx("span", { className: "read-only-badge", children: "Sola lettura" }) }), e.jsxs("div", { className: "studio-tool-filters", children: [e.jsx(fe, { label: "Categoria", value: i, onChange: a, options: [{ value: "all", label: "Tutte le categorie" }, ...x.map(g => ({ value: g, label: g }))] }), e.jsx(fe, { label: "Materiale", value: l, onChange: o, options: [{ value: "all", label: "Tutti i materiali" }, ...j.map(g => ({ value: g, label: g }))] }), e.jsx(fe, { label: "Azienda", value: c, onChange: d, options: [{ value: "all", label: "Tutte le aziende" }, ...f.map(g => ({ value: g, label: g }))] })] }), e.jsx("div", { className: "material-grid", children: b.map(g => e.jsxs("button", { className: "material-card", onClick: () => m(g.id), children: [e.jsx("span", { className: `material-preview ${g.tone}`, children: e.jsx("small", { children: g.code }) }), e.jsxs("span", { children: [e.jsx("small", { children: `${g.category} · ${g.material}` }), e.jsx("b", { children: g.name }), e.jsx("em", { children: g.brand }), e.jsx("i", { children: g.location })] })] }, g.id)) }), !b.length && e.jsx("p", { className: "desk-empty", children: "Nessun materiale corrisponde ai filtri." }), u && e.jsx(MaterialDetail, { item: s.find(g => g.id === u), editable: n, onClose: () => m(null), onSave: g => r(h => h.map(p => p.id === g.id ? g : p)) })] });
}
function MaterialDetailV2({ item: t, editable: n, onClose: s, onSave: r, startEditing: i = !1 }) {
  const [a, l] = C.useState(t), [o, c] = C.useState(i), d = (u, m) => l(x => ({ ...x, [u]: m })), u = m => { var x; const j = (x = m.target.files) == null ? void 0 : x[0]; if (!j) return; const f = new FileReader(); f.onload = () => d("photo", String(f.result || "")); f.readAsDataURL(j); };
  const m = [["Nome materiale", "name"], ["Codice", "code"], ["Categoria", "category"], ["Materiale", "material"], ["Azienda", "brand"], ["Posizione", "location"], ["Finitura", "finish"], ["Formato", "format"], ["Prestazioni", "performance"]];
  return e.jsx(De, { title: a.name || "Nuovo materiale", subtitle: `${a.brand || "Azienda da indicare"} · ${a.category || "Categoria da indicare"}`, onClose: s, wide: !0, children: e.jsxs("div", { className: "material-detail", children: [e.jsxs("div", { className: `material-preview large ${a.photo ? "has-photo" : a.tone || "blank"}`, style: a.photo ? { backgroundImage: `url(${a.photo})` } : void 0, children: [e.jsx("span", { children: a.code || "NUOVO" }), o && e.jsxs("label", { className: "material-photo-upload", children: [e.jsx(oc, {}), a.photo ? "Sostituisci immagine" : "Carica immagine", e.jsx("input", { type: "file", accept: "image/*", hidden: !0, onChange: u })] })] }), e.jsxs("div", { className: "material-detail-copy", children: [e.jsxs("header", { children: [e.jsxs("div", { children: [e.jsx("small", { children: "CAMPIONE MATERIOTECA" }), e.jsx("h3", { children: a.name || "Nuovo materiale" }), e.jsx("p", { children: a.notes || "Compila tutti i dati del nuovo campione." })] }), n && !i && e.jsx("button", { className: "desk-small-button", onClick: () => c(!o), children: o ? "Annulla" : "Modifica" })] }), o ? e.jsxs("form", { className: "studio-edit-grid material-edit-grid", onSubmit: x => { x.preventDefault(); r(a); c(!1); }, children: [...m.map(([x,j]) => e.jsxs("label", { children: [x, e.jsx("input", { value: a[j] || "", onChange: f => d(j, f.target.value), required: ["name", "category", "material", "brand", "location"].includes(j) })] }, j)), e.jsxs("label", { className: "wide", children: ["Note", e.jsx("textarea", { value: a.notes || "", onChange: x => d("notes", x.target.value) })] }, "notes"), e.jsx("button", { className: "desk-primary", type: "submit", children: i ? "Aggiungi materiale" : "Salva campione" }, "save")] }) : e.jsxs("div", { className: "material-spec-grid", children: [["Azienda", a.brand], ["Categoria", a.category], ["Materiale", a.material], ["Finitura", a.finish], ["Formato", a.format], ["Prestazioni", a.performance], ["Posizione in materioteca", a.location], ["Codice", a.code]].map(([x,j]) => e.jsxs("article", { children: [e.jsx("small", { children: x }), e.jsx("b", { children: j || "—" })] }, x)) })] })] }) });
}
function MaterialsDemoV2() {
  const { viewer: t } = Y(), n = canManageMaterials(t), [s, r] = ke("archea-demo-materials-v2", MaterialSeed), [i, a] = C.useState("all"), [l, o] = C.useState("all"), [c, d] = C.useState("all"), [u, m] = C.useState(null), [x, j] = C.useState(null), f = [...new Set(s.map(h => h.category))], b = [...new Set(s.map(h => h.material))], v = [...new Set(s.map(h => h.brand))], g = s.filter(h => (i === "all" || h.category === i) && (l === "all" || h.material === l) && (c === "all" || h.brand === c));
  const p = () => { const h = { id: en("material"), name: "", category: "", material: "", brand: "", location: "", tone: "blank", finish: "", format: "", code: "", performance: "", notes: "", photo: "" }; j(h); m(h.id); };
  const y = h => { r(O => O.some(k => k.id === h.id) ? O.map(k => k.id === h.id ? h : k) : [h, ...O]); j(null); };
  const O = x && x.id === u ? x : s.find(h => h.id === u);
  return e.jsxs(e.Fragment, { children: [e.jsx(StudioToolHeading, { title: "Materioteca", subtitle: n ? "Catalogo digitale dei campioni fisici. Sei il gestore demo autorizzato ad aggiungere e modificare i materiali." : "Catalogo digitale dei campioni fisici disponibili nello studio. Le modifiche sono riservate al gestore della materioteca.", action: n ? e.jsxs("button", { className: "desk-primary", onClick: p, children: [e.jsx(tt, {}), "Aggiungi materiale"] }) : e.jsx("span", { className: "read-only-badge", children: "Sola lettura" }) }), e.jsxs("div", { className: "studio-tool-filters", children: [e.jsx(fe, { label: "Categoria", value: i, onChange: a, options: [{ value: "all", label: "Tutte le categorie" }, ...f.map(h => ({ value: h, label: h }))] }), e.jsx(fe, { label: "Materiale", value: l, onChange: o, options: [{ value: "all", label: "Tutti i materiali" }, ...b.map(h => ({ value: h, label: h }))] }), e.jsx(fe, { label: "Azienda", value: c, onChange: d, options: [{ value: "all", label: "Tutte le aziende" }, ...v.map(h => ({ value: h, label: h }))] })] }), e.jsx("div", { className: "material-grid", children: g.map(h => e.jsxs("button", { className: "material-card", onClick: () => m(h.id), children: [e.jsx("span", { className: `material-preview ${h.photo ? "has-photo" : h.tone}`, style: h.photo ? { backgroundImage: `url(${h.photo})` } : void 0, children: e.jsx("small", { children: h.code }) }), e.jsxs("span", { children: [e.jsx("small", { children: `${h.category} · ${h.material}` }), e.jsx("b", { children: h.name }), e.jsx("em", { children: h.brand }), e.jsx("i", { children: h.location })] })] }, h.id)) }), !g.length && e.jsx("p", { className: "desk-empty", children: "Nessun materiale corrisponde ai filtri." }), O && e.jsx(MaterialDetailV2, { item: O, editable: n, startEditing: !!x, onClose: () => { m(null); j(null); }, onSave: y })] });
}
function TechnicalAtlasDemo() {
  const [t, n] = C.useState(TechnicalSeed[0].id), [s, r] = C.useState(null), i = TechnicalSeed.find(o => o.id === t), a = i == null ? void 0 : i.points.find(o => o.id === s);
  return e.jsxs(e.Fragment, { children: [e.jsx(StudioToolHeading, { title: "Abaco tecnico", subtitle: "Dettagli costruiti, stratigrafie, fornitori e fotografie delle opere realizzate." }), e.jsx("div", { className: "studio-tool-filter", children: e.jsx(fe, { label: "Progetto e dettaglio", value: t, onChange: n, searchable: !0, options: TechnicalSeed.map(o => ({ value: o.id, label: o.title, meta: o.subtitle })) }) }), e.jsxs("section", { className: "technical-atlas", children: [e.jsxs("header", { children: [e.jsxs("div", { children: [e.jsx("small", { children: i.project }), e.jsx("h2", { children: i.title }), e.jsx("p", { children: i.subtitle })] }), e.jsx("span", { children: `${i.points.length} punti tecnici` })] }), e.jsx("div", { className: `technical-image ${i.theme}`, children: [e.jsxs("div", { className: "technical-scene", children: [e.jsx("span", { className: "scene-line one" }), e.jsx("span", { className: "scene-line two" }), e.jsx("span", { className: "scene-line three" })] }), i.points.map((o,c) => e.jsxs("button", { className: "technical-hotspot", style: { left: `${o.x}%`, top: `${o.y}%` }, onClick: () => r(o.id), children: [e.jsx("i", { children: c + 1 }), e.jsx("span", { children: o.label })] }, o.id))] }), e.jsx("footer", { children: "Clicca sui punti numerati per aprire il dettaglio tecnico." })] }), a && e.jsx(De, { title: a.label, subtitle: `${i.title} · ${a.supplier}`, onClose: () => r(null), wide: !0, children: e.jsxs("div", { className: "technical-detail", children: [e.jsxs("section", { children: [e.jsx("small", { children: "DESCRIZIONE" }), e.jsx("p", { children: a.detail }), e.jsx("b", { children: `Fornitore: ${a.supplier}` })] }), e.jsxs("section", { children: [e.jsx("h3", { children: "Stratigrafia" }), e.jsx("ol", { children: a.layers.map(o => e.jsx("li", { children: o }, o)) })] }), e.jsxs("section", { children: [e.jsx("h3", { children: "Immagini di riferimento" }), e.jsx("div", { className: "technical-photo-grid", children: a.photos.map((o,c) => e.jsxs("article", { children: [e.jsx("span", { className: `technical-photo ph-${c + 1}` }), e.jsx("b", { children: o })] }, o)) })] })] }) })] });
}
function useDemoParcels() { return ke("archea-demo-reception-parcels-v1", ParcelSeed); }
function parcelNotifications(t) { let n = ParcelSeed; try { n = JSON.parse(localStorage.getItem("archea-demo-reception-parcels-v1") || JSON.stringify(ParcelSeed)); } catch {} return n.filter(s => s.status === "waiting" && s.recipient === (t == null ? void 0 : t.nome)).map(s => ({ id: `parcel-${s.id}`, kind: "parcel", title: "È arrivato un pacco per te", detail: `${s.courier} · ${s.tracking} · Ritiralo alla reception`, unread: !0 })); }
function ReceptionTodayDemo() {
  const [t] = useDemoParcels(), n = t.filter(s => s.status === "waiting").length;
  return e.jsxs(e.Fragment, { children: [e.jsx(StudioToolHeading, { title: "Reception · Oggi", subtitle: "Attività di segreteria, arrivi, riunioni e spazi da preparare.", eyebrow: "ARCHEA WORKSPACE · RECEPTION" }), e.jsxs("div", { className: "desk-stats reception-stats", children: [e.jsx(Q, { label: "Pacchi da consegnare", value: n, tone: n ? "warn" : "" }), e.jsx(Q, { label: "Riunioni oggi", value: 4 }), e.jsx(Q, { label: "Sale da preparare", value: 2 }), e.jsx(Q, { label: "Visitatori attesi", value: 7 })] }), e.jsxs("div", { className: "reception-grid", children: [e.jsxs("section", { className: "desk-panel", children: [e.jsxs("header", { children: [e.jsxs("div", { children: [e.jsx("small", { children: "AGENDA RECEPTION" }), e.jsx("h2", { children: "Prossime attività" })] }), e.jsx("span", { children: "27 ottobre" })] }), e.jsx("div", { className: "reception-timeline", children: [["09:30", "Allestire Sala Lungarno", "Riunione P51 · 10 persone", "done"], ["11:00", "Accoglienza consulenti impianti", "Studio MEP · appuntamento con Alessandro", "active"], ["14:30", "Preparare Sala Cellini", "Call Milanello · collegamento Teams", ""], ["17:00", "Ritiro corriere espresso", "3 buste documenti da spedire", ""]].map(([s,r,i,a]) => e.jsxs("article", { className: a, children: [e.jsx("time", { children: s }), e.jsxs("span", { children: [e.jsx("b", { children: r }), e.jsx("small", { children: i })] }), e.jsx("i", {})] }, s)) })] }), e.jsxs("section", { className: "desk-panel", children: [e.jsxs("header", { children: [e.jsxs("div", { children: [e.jsx("small", { children: "SALE RIUNIONI" }), e.jsx("h2", { children: "Stato preparazione" })] }), e.jsx("span", { children: "Oggi" })] }), e.jsx("div", { className: "reception-rooms", children: [["Sala Lungarno", "Pronta", "10:00 · Riunione P51"], ["Sala Cellini", "Da preparare", "14:30 · Milanello"], ["Sala Ingresso", "Libera", "Nessun evento"]].map(([s,r,i]) => e.jsxs("article", { children: [e.jsx("span", { className: `room-state ${r === "Pronta" ? "ready" : r === "Da preparare" ? "prepare" : "free"}` }), e.jsxs("div", { children: [e.jsx("b", { children: s }), e.jsx("small", { children: i })] }), e.jsx("em", { children: r })] }, s)) })] })] })] });
}
function PackagesDemo() {
  const [t,n] = useDemoParcels(), [s,r] = C.useState("all"), [i,a] = C.useState(!1), [l,o] = C.useState({ courier: "Amazon Business", tracking: "", recipient: "Lisandro Leyra", note: "" }), c = s === "all" ? t : t.filter(m => m.status === s), d = (m,x) => n(j => j.map(f => f.id === m ? { ...f, status: x, note: x === "delivered" ? "Consegnato dalla reception" : f.note } : f)), u = m => { m.preventDefault(); n(x => [{ id: en("parcel"), ...l, arrivedAt: new Date().toLocaleString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }), status: "waiting" }, ...x]); a(!1); o({ courier: "Amazon Business", tracking: "", recipient: "Lisandro Leyra", note: "" }); };
  return e.jsxs(e.Fragment, { children: [e.jsx(StudioToolHeading, { title: "Pacchi e corrieri", subtitle: "Registra gli arrivi, notifica il destinatario e controlla i pacchi ancora da ritirare.", eyebrow: "ARCHEA WORKSPACE · RECEPTION", action: e.jsxs("button", { className: "desk-primary", onClick: () => a(!0), children: [e.jsx(tt, {}), "Registra pacco"] }) }), e.jsx("div", { className: "studio-tool-filter", children: e.jsx(fe, { label: "Stato consegna", value: s, onChange: r, options: [{ value: "all", label: "Tutti gli stati", meta: `${t.length} pacchi` }, { value: "waiting", label: "In attesa di ritiro", meta: `${t.filter(m => m.status === "waiting").length} pacchi` }, { value: "delivered", label: "Consegnati", meta: `${t.filter(m => m.status === "delivered").length} pacchi` }] }) }), e.jsx("div", { className: "package-table-wrap", children: e.jsxs("table", { className: "desk-table package-table", children: [e.jsx("thead", { children: e.jsxs("tr", { children: ["Corriere / tracking", "Destinatario", "Arrivato", "Note", "Stato"].map(m => e.jsx("th", { children: m }, m)) }) }), e.jsx("tbody", { children: c.map(m => e.jsxs("tr", { children: [e.jsxs("td", { children: [e.jsx("b", { children: m.courier }), e.jsx("small", { children: m.tracking })] }), e.jsx("td", { children: e.jsxs("span", { className: "desk-person", children: [e.jsx("i", { children: Lt(m.recipient) }), m.recipient] }) }), e.jsx("td", { children: m.arrivedAt }), e.jsx("td", { children: m.note || "—" }), e.jsx("td", { children: e.jsx("button", { className: `parcel-status ${m.status}`, onClick: () => d(m.id, m.status === "waiting" ? "delivered" : "waiting"), children: m.status === "waiting" ? "In attesa" : "Consegnato" }) })] }, m.id)) })] }) }), i && e.jsx(De, { title: "Registra nuovo pacco", subtitle: "Il destinatario riceverà una notifica nell’app.", onClose: () => a(!1), children: e.jsxs("form", { className: "studio-edit-grid", onSubmit: u, children: [e.jsxs("label", { children: ["Corriere", e.jsx("input", { value: l.courier, onChange: m => o({ ...l, courier: m.target.value }), required: !0 })] }), e.jsxs("label", { children: ["Tracking", e.jsx("input", { value: l.tracking, onChange: m => o({ ...l, tracking: m.target.value }), required: !0 })] }), e.jsxs("label", { className: "wide", children: ["Destinatario", e.jsx("select", { value: l.recipient, onChange: m => o({ ...l, recipient: m.target.value }), children: ["Francesco Diamanti", "Alessandro Botrini", "Lisandro Leyra", "Alessandra Laurini"].map(m => e.jsx("option", { value: m, children: m }, m)) })] }), e.jsxs("label", { className: "wide", children: ["Note", e.jsx("input", { value: l.note, onChange: m => o({ ...l, note: m.target.value }) })] }), e.jsx("button", { className: "desk-primary", type: "submit", children: "Registra e invia notifica" })] }) })] });
}
function SiteMinutesDemo({ project: t = "P51", onApprove: n = null, mobile: s = !1 }) {
  const [r,i] = C.useState(MinutesTasks.map(d => d.id)), [a,l] = C.useState(!1), [o,c] = C.useState("Riunione_cantiere_P51_27-10-2026.m4a"), d = () => { const u = MinutesTasks.filter(m => r.includes(m.id)).map((m,x) => ({ id: `${m.project}-AI-${String(Date.now() + x).slice(-4)}`, numero: `${m.project}-AI-${String(x + 1).padStart(2, "0")}`, progettoCodice: m.project, titolo: m.title, descrizione: m.title, assegnatario: m.owner, priorita: m.priority, inizio: "2026-10-27", scadenza: m.due, orario: "18:00", tipologia: "Verbale cantiere AI", commenti: "", linkServer: `Verbale ${o}`, shared: !0, completed: !1, validated: !1, notValidated: !1 })); n ? n(u) : localStorage.setItem("archea-ai-minutes-tasks", JSON.stringify(u)); l(!0); window.dispatchEvent(new CustomEvent("archea-ai-minutes-approved", { detail: u })); };
  return e.jsxs("section", { className: `site-minutes-ai${s ? " mobile" : ""}`, children: [e.jsxs("header", { children: [e.jsxs("div", { children: [e.jsx("small", { children: "ARCHEAI · VERBALE DI CANTIERE" }), e.jsx("h2", { children: "Da registrazione a task operative" }), e.jsx("p", { children: "Carica l’audio o la trascrizione: la demo produce un riepilogo e propone le attività da validare." })] }), e.jsxs("label", { className: "desk-primary", children: [e.jsx(oc, {}), "Carica verbale", e.jsx("input", { type: "file", accept: "audio/*,.txt,.doc,.docx", hidden: !0, onChange: u => { var m; const x = (m = u.target.files) == null ? void 0 : m[0]; x && c(x.name); } })] })] }), e.jsxs("div", { className: "minutes-source", children: [e.jsx("span", { children: "AI" }), e.jsxs("div", { children: [e.jsx("b", { children: o }), e.jsx("small", { children: "Trascrizione completata · 18 min 42 sec · 4 interlocutori" })] }), e.jsx("em", { children: "DEMO" })] }), e.jsxs("div", { className: "minutes-summary", children: [e.jsx("h3", { children: "Riassunto della riunione" }), e.jsx("p", { children: "Il sopralluogo ha confermato l’avanzamento della copertura del Padiglione B. Prima della posa definitiva dei lucernari devono essere verificati i davanzali della facciata nord e il raccordo dell’impermeabilizzazione. La Direzione Lavori richiede inoltre il campione colore del parapetto e l’aggiornamento della tavola con il troppo pieno della copertura verde." }), e.jsx("div", { children: ["Copertura verde: posa prevista dal 3 novembre", "Lucernari: dettaglio da approvare prima dell’ordine", "Parapetto: finitura bronzo da confermare", "Prossimo sopralluogo: 6 novembre · ore 10:00"].map(u => e.jsx("span", { children: u }, u)) })] }), e.jsxs("div", { className: "minutes-task-head", children: [e.jsxs("div", { children: [e.jsx("h3", { children: "Task estratte dall’AI" }), e.jsxs("p", { children: [r.length, " di ", MinutesTasks.length, " selezionate"] })] }), e.jsx("button", { className: "desk-primary", disabled: !r.length || a, onClick: d, children: a ? "Task inserite nel Task Manager" : "Valida e invia al Task Manager" })] }), e.jsx("div", { className: "minutes-task-list", children: MinutesTasks.map(u => e.jsxs("label", { className: r.includes(u.id) ? "selected" : "", children: [e.jsx("input", { type: "checkbox", checked: r.includes(u.id), onChange: () => i(m => m.includes(u.id) ? m.filter(x => x !== u.id) : [...m, u.id]) }), e.jsxs("span", { children: [e.jsx("b", { children: u.title }), e.jsxs("small", { children: [u.project, " · ", u.owner, " · scadenza ", u.due] })] }), e.jsx("em", { className: u.priority.toLowerCase(), children: u.priority })] }, u.id)) })] });
}
const DepartmentMeta = {
  interior: { title: "Interior Department", unit: "viste interior", singular: "vista interior", lead: "Simone Cardia", accent: "Interior" },
  concept: { title: "Concept Department", unit: "concept", singular: "concept", lead: "Marco Gamberi", accent: "Concept" },
  visual: { title: "Visual Department", unit: "render", singular: "render", lead: "Andrea Frongia", accent: "Visual" },
};
const DepartmentSeed = {
  interior: [
    { id: "int-1", project: "P51", name: "Hospitality lounge · viste materiali", quantity: 6, requester: "Francesco Diamanti", delivery: "2026-10-30", assignee: "Giulia Neri", status: "in_progress", priority: "Alta", notes: "Definire palette, arredi loose e illuminazione decorativa." },
    { id: "int-2", project: "M86", name: "Museo · percorso espositivo", quantity: 4, requester: "Alessandro Botrini", delivery: "2026-11-04", assignee: "Marta Rosi", status: "open", priority: "Media", notes: "Viste dalla hall e dalla sala Nervi." },
    { id: "int-3", project: "O80", name: "Spogliatoi prima squadra", quantity: 8, requester: "Lisandro Leyra", delivery: "2026-11-08", assignee: "Da assegnare", status: "open", priority: "Alta", notes: "Coordinare falegnamerie e campioni pavimento." },
    { id: "int-4", project: "I04", name: "Uffici · mock-up sala riunioni", quantity: 3, requester: "Francesco Diamanti", delivery: "2026-10-25", assignee: "Giulia Neri", status: "closed", priority: "Media", notes: "Consegna validata dal referente." },
  ],
  concept: [
    { id: "con-1", project: "P63", name: "Cittadella dello Sport · concept masterplan", quantity: 5, requester: "Francesco Diamanti", delivery: "2026-10-31", assignee: "Elena Conti", status: "in_progress", priority: "Alta", notes: "Tre alternative di impianto e diagrammi dei flussi." },
    { id: "con-2", project: "H42", name: "Leo France · identità architettonica", quantity: 4, requester: "Alessandro Botrini", delivery: "2026-11-03", assignee: "Paolo Ricci", status: "open", priority: "Media", notes: "Massing, facciata e principi materici." },
    { id: "con-3", project: "P51", name: "Padiglione eventi · concept update", quantity: 3, requester: "Lisandro Leyra", delivery: "2026-11-06", assignee: "Da assegnare", status: "open", priority: "Alta", notes: "Recepire gli esiti dell’incontro con il cliente." },
    { id: "con-4", project: "O32", name: "Castelfalfi · concept residenze", quantity: 7, requester: "Francesco Diamanti", delivery: "2026-10-24", assignee: "Elena Conti", status: "closed", priority: "Media", notes: "Concept approvato e archiviato." },
  ],
  visual: [
    { id: "vis-1", project: "P51", name: "Viola Park · padiglione B", quantity: 8, requester: "Alessandro Botrini", delivery: "2026-10-30", assignee: "Andrea Frongia", status: "in_progress", priority: "Alta", notes: "Esterni golden hour e due viste interne." },
    { id: "vis-2", project: "M86", name: "Stadio Flaminio · museo", quantity: 5, requester: "Francesco Diamanti", delivery: "2026-11-02", assignee: "Sara Adorno", status: "open", priority: "Alta", notes: "Fotoinserimenti museo e vista pensilina." },
    { id: "vis-3", project: "H42", name: "Leo France · triangolo", quantity: 6, requester: "Giacomo Lissandron", delivery: "2026-11-05", assignee: "Mattia Borrione", status: "open", priority: "Media", notes: "Aggiornamento viste e fotoinserimenti." },
    { id: "vis-4", project: "O55", name: "Yas Canal DCR1", quantity: 3, requester: "Alessandro Riccomi", delivery: "2026-10-22", assignee: "Carolyn Speljarie", status: "closed", priority: "Media", notes: "Due viste del bacino e una off-plan." },
  ],
};
const departmentTypeForViewer = t => (t == null ? void 0 : t.department) || ({ interior_head: "interior", concept_head: "concept", visual_head: "visual" }[t == null ? void 0 : t.appRole]) || null;
function useDepartmentRequests(t) { return ke(`archea-demo-department-${t}-v1`, DepartmentSeed[t]); }
function DepartmentRequestsDemo({ type: t }) {
  const { viewer: n, today: s } = Y(), r = DepartmentMeta[t], [i, a] = useDepartmentRequests(t), [l, o] = C.useState("all"), [c, d] = C.useState(!1), [u, m] = C.useState({ project: "", name: "", quantity: 1, delivery: s, assignee: "Da assegnare", priority: "Media", notes: "" }), x = ["senior_architect", "partner_architect", `${t}_head`].includes(n.appRole), j = i.filter(g => l === "all" || g.status === l), f = g => { g.preventDefault(); if (!u.project.trim() || !u.name.trim()) return; a(b => [{ ...u, id: en(t), project: u.project.trim().toUpperCase(), requester: n.nome, status: "open", quantity: Number(u.quantity) || 1 }, ...b]); d(!1); m({ project: "", name: "", quantity: 1, delivery: s, assignee: "Da assegnare", priority: "Media", notes: "" }); };
  return e.jsxs(e.Fragment, { children: [e.jsx(StudioToolHeading, { title: r.title, subtitle: `Prenotazioni, assegnazioni e consegne del reparto ${r.accent}.`, action: e.jsxs("button", { className: "desk-primary", onClick: () => d(!0), children: [e.jsx(tt, {}), `Prenota ${r.singular}`] }) }), e.jsxs("div", { className: "desk-stats department-stats", children: [e.jsx(Q, { label: "Richieste aperte", value: i.filter(g => g.status !== "closed").length }), e.jsx(Q, { label: "Unità da produrre", value: i.filter(g => g.status !== "closed").reduce((g,b) => g + b.quantity, 0) }), e.jsx(Q, { label: "In lavorazione", value: i.filter(g => g.status === "in_progress").length }), e.jsx(Q, { label: "Da assegnare", value: i.filter(g => g.assignee === "Da assegnare").length, tone: "warn" })] }), e.jsx("div", { className: "studio-tool-filter", children: e.jsx(fe, { label: "Stato richieste", value: l, onChange: o, options: [{ value: "all", label: "Tutte le richieste" }, { value: "open", label: "Aperte" }, { value: "in_progress", label: "In lavorazione" }, { value: "closed", label: "Consegnate" }] }) }), e.jsx("div", { className: "department-request-list", children: j.map(g => e.jsxs("article", { children: [e.jsxs("span", { className: "department-project", children: [e.jsx("small", { children: g.project }), e.jsx("b", { children: g.name }), e.jsx("em", { children: g.notes })] }), e.jsxs("span", { children: [e.jsx("small", { children: r.unit.toUpperCase() }), e.jsx("b", { children: g.quantity })] }), e.jsxs("span", { children: [e.jsx("small", { children: "ASSEGNATA A" }), e.jsx("b", { children: g.assignee })] }), e.jsxs("span", { children: [e.jsx("small", { children: "CONSEGNA" }), e.jsx("b", { children: Dt(g.delivery) })] }), e.jsx("button", { className: `department-status ${g.status}`, disabled: !x, onClick: () => x && a(b => b.map(v => v.id === g.id ? { ...v, status: v.status === "open" ? "in_progress" : v.status === "in_progress" ? "closed" : "open" } : v)), children: g.status === "closed" ? "Consegnata" : g.status === "in_progress" ? "In lavorazione" : "Aperta" })] }, g.id)) }), c && e.jsx(De, { title: `Nuova richiesta · ${r.title}`, subtitle: `Prenota una nuova ${r.singular} per un progetto.`, onClose: () => d(!1), children: e.jsxs("form", { className: "studio-edit-grid", onSubmit: f, children: [e.jsxs("label", { children: ["Codice progetto", e.jsx("input", { value: u.project, onChange: g => m({ ...u, project: g.target.value }), required: !0 })] }), e.jsxs("label", { children: ["Numero", e.jsx("input", { type: "number", min: 1, value: u.quantity, onChange: g => m({ ...u, quantity: g.target.value }) })] }), e.jsxs("label", { className: "wide", children: ["Titolo richiesta", e.jsx("input", { value: u.name, onChange: g => m({ ...u, name: g.target.value }), required: !0 })] }), e.jsxs("label", { children: ["Consegna", e.jsx("input", { type: "date", value: u.delivery, onChange: g => m({ ...u, delivery: g.target.value }) })] }), e.jsxs("label", { children: ["Priorità", e.jsx("select", { value: u.priority, onChange: g => m({ ...u, priority: g.target.value }), children: ["Bassa", "Media", "Alta"].map(g => e.jsx("option", { children: g }, g)) })] }), e.jsxs("label", { className: "wide", children: ["Indicazioni", e.jsx("textarea", { value: u.notes, onChange: g => m({ ...u, notes: g.target.value }) })] }), e.jsx("button", { className: "desk-primary", type: "submit", children: "Salva prenotazione" })] }) })] });
}
function DepartmentTodayDemo({ type: t }) {
  const n = DepartmentMeta[t], [s] = useDepartmentRequests(t), r = s.filter(o => o.status !== "closed"), i = r.reduce((o,c) => o + c.quantity, 0), a = r.slice().sort((o,c) => o.delivery.localeCompare(c.delivery));
  return e.jsxs(e.Fragment, { children: [e.jsx(StudioToolHeading, { title: `${n.title} · Oggi`, subtitle: `Ordine del giorno, consegne e attività operative coordinate da ${n.lead}.`, eyebrow: `ARCHEA WORKSPACE · ${n.accent.toUpperCase()}` }), e.jsxs("div", { className: "desk-stats department-stats", children: [e.jsx(Q, { label: "Richieste attive", value: r.length }), e.jsx(Q, { label: n.unit, value: i }), e.jsx(Q, { label: "In lavorazione", value: r.filter(o => o.status === "in_progress").length }), e.jsx(Q, { label: "Consegne entro 7 giorni", value: r.filter(o => o.delivery <= "2026-11-04").length, tone: "warn" })] }), e.jsxs("section", { className: "desk-panel department-agenda", children: [e.jsxs("header", { children: [e.jsxs("div", { children: [e.jsx("small", { children: "ORDINE DEL GIORNO" }), e.jsx("h2", { children: "Priorità e consegne" })] }), e.jsx("strong", { children: n.lead })] }), e.jsx("div", { children: a.map((o,c) => e.jsxs("article", { children: [e.jsx("i", { children: String(c + 1).padStart(2, "0") }), e.jsxs("span", { children: [e.jsxs("b", { children: [o.project, " · ", o.name] }), e.jsxs("small", { children: [o.assignee, " · ", o.quantity, " ", n.unit, " · ", o.priority] })] }), e.jsx("time", { children: Dt(o.delivery) })] }, o.id)) })] })] });
}
function DepartmentProjectsDemo({ type: t, manager: n = !1 }) {
  const s = DepartmentMeta[t], [r,i] = useDepartmentRequests(t), [a,l] = C.useState(null), o = [...new Set(r.map(d => d.project))].map(d => { const u = r.filter(m => m.project === d); return { code: d, requests: u.length, quantity: u.reduce((m,x) => m + x.quantity, 0), open: u.filter(m => m.status !== "closed").length, team: [...new Set(u.map(m => m.assignee).filter(m => m !== "Da assegnare"))] }; });
  return e.jsxs(e.Fragment, { children: [e.jsx(StudioToolHeading, { title: n ? `Project Manager · ${s.accent}` : `Progetti · ${s.accent}`, subtitle: n ? `Gestione delle commesse e delle risorse del reparto ${s.accent}.` : `Carico ${s.unit}, assegnazioni e avanzamento per progetto.`, action: n ? e.jsxs("button", { className: "desk-primary", onClick: () => l("resources"), children: [e.jsx(tt, {}), "Aggiungi risorsa"] }) : null }), e.jsx("div", { className: "department-project-grid", children: o.map(d => e.jsxs("article", { children: [e.jsxs("header", { children: [e.jsx("small", { children: d.code }), e.jsx("span", { children: d.open ? `${d.open} attive` : "Completato" })] }), e.jsxs("div", { children: [e.jsx("b", { children: d.quantity }), e.jsx("small", { children: s.unit })] }), e.jsxs("footer", { children: [e.jsxs("span", { children: [d.requests, " richieste"] }), e.jsx("span", { children: d.team.join(", ") || "Da assegnare" })] })] }, d.code)) }), n && e.jsxs("section", { className: "desk-panel department-team", children: [e.jsxs("header", { children: [e.jsxs("div", { children: [e.jsx("small", { children: "ORGANICO DEL REPARTO" }), e.jsx("h2", { children: "Risorse e carico attuale" })] }), e.jsx("strong", { children: "⋮⋮" })] }), e.jsx("div", { children: [[s.lead, "Responsabile", 8], [t === "concept" ? "Elena Conti" : t === "interior" ? "Giulia Neri" : "Sara Adorno", "Senior", 6], [t === "concept" ? "Paolo Ricci" : t === "interior" ? "Marta Rosi" : "Mattia Borrione", "Specialist", 5]].map(([d,u,m]) => e.jsxs("article", { children: [e.jsx("i", { children: Lt(d) }), e.jsxs("span", { children: [e.jsx("b", { children: d }), e.jsx("small", { children: u })] }), e.jsxs("em", { children: [m, " attività"] })] }, d)) })] }), a && e.jsx(De, { title: "Aggiungi risorsa al reparto", subtitle: `Demo di gestione organico · ${s.title}`, onClose: () => l(null), children: e.jsxs("div", { className: "studio-edit-grid", children: [e.jsxs("label", { children: ["Nome e cognome", e.jsx("input", { placeholder: "Nuova risorsa" })] }), e.jsxs("label", { children: ["Ruolo", e.jsx("input", { placeholder: "Designer / Specialist" })] }), e.jsx("button", { className: "desk-primary", onClick: () => l(null), children: "Aggiungi alla demo" })] }) })] });
}
function Mv() {
  const [t, n] = C.useState(null),
    [s, r] = C.useState(!1),
    [i, a] = C.useState(() => {
      var o;
      return (
        ((o = window.matchMedia) == null
          ? void 0
          : o.call(window, "(display-mode: standalone)").matches) ||
        window.navigator.standalone
      );
    }),
    l = /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent);
  return (
    C.useEffect(() => {
      const o = (d) => {
          d.preventDefault(), n(d);
        },
        c = () => {
          a(!0), n(null);
        };
      return (
        window.addEventListener("beforeinstallprompt", o),
        window.addEventListener("appinstalled", c),
        () => {
          window.removeEventListener("beforeinstallprompt", o),
            window.removeEventListener("appinstalled", c);
        }
      );
    }, []),
    i
      ? e.jsx("span", {
          className: "desk-installed",
          children: "App installata",
        })
      : e.jsxs(e.Fragment, {
          children: [
            e.jsx("button", {
              className: "desk-install",
              disabled: !t && !l,
              title:
                !t && !l
                  ? "Usa il comando Installa del browser se disponibile"
                  : "",
              onClick: async () => {
                if (l && !t) {
                  r(!0);
                  return;
                }
                await t.prompt(),
                  (await t.userChoice).outcome === "accepted" && n(null);
              },
              children: l && !t ? "Aggiungi al Dock" : "Installa app",
            }),
            s &&
              e.jsx(De, {
                title: "Installa su Mac",
                subtitle: "Safari usa un comando diverso da Chrome",
                onClose: () => r(!1),
                children: e.jsxs("div", {
                  className: "desk-install-guide",
                  children: [
                    e.jsx("b", { children: "1. Apri il menu File di Safari" }),
                    e.jsx("b", {
                      children: "2. Seleziona “Aggiungi al Dock…”",
                    }),
                    e.jsx("b", {
                      children: "3. Conferma il nome ARCHEA WORKSPACE",
                    }),
                    e.jsx("p", {
                      children:
                        "La web app comparirà nel Dock, in Spotlight e nella cartella Applicazioni del tuo utente.",
                    }),
                  ],
                }),
              }),
          ],
        })
  );
}
function Dv(t, n) {
  const s = `archea-work-timer-${t}-${n}`,
    [r, i] = C.useState(() => {
      try {
        return Number(localStorage.getItem(s) || 0);
      } catch {
        return 0;
      }
    }),
    a = C.useRef(Date.now()),
    [l, o] = C.useState(Date.now());
  C.useEffect(() => {
    let j = 0;
    try {
      j = Number(localStorage.getItem(s) || 0);
    } catch {}
    i(j), (a.current = Date.now()), o(Date.now());
  }, [s]);
  const c = r + Math.max(0, Math.floor((l - a.current) / 1e3));
  C.useEffect(() => {
    const j = window.setInterval(() => o(Date.now()), 1e3),
      f = () => {
        try {
          localStorage.setItem(
            s,
            String(r + Math.max(0, Math.floor((Date.now() - a.current) / 1e3))),
          );
        } catch {}
      };
    return (
      window.addEventListener("beforeunload", f),
      () => {
        window.clearInterval(j),
          window.removeEventListener("beforeunload", f),
          f();
      }
    );
  }, [r, s]),
    C.useEffect(() => {
      if (c % 15 === 0)
        try {
          localStorage.setItem(s, String(c));
        } catch {}
    }, [s, c]);
  const d = () => {
      try {
        localStorage.setItem(s, "0");
      } catch {}
      i(0), (a.current = Date.now()), o(Date.now());
    },
    u = Math.floor(c / 3600),
    m = Math.floor((c % 3600) / 60),
    x = c % 60;
  return {
    compact: `${String(u).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
    full: `${String(u).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(x).padStart(2, "0")}`,
    reset: d,
  };
}
function _v() {
  var ce, ze, Ft, Hr;
  const {
      data: t,
      viewer: n,
      tab: s,
      setTab: r,
      logout: i,
      today: a,
      language: l,
    } = Y(),
    [o, c] = ke("archea-desktop-demo-tasks", t.task),
    [d, u] = ke("archea-desktop-demo-hours", t.ore),
    [m, x] = ke("archea-desktop-demo-notes", t.note),
    [j, f] = ke("archea-desktop-demo-projects", t.progetti),
    [g, b] = ke("archea-desktop-staff-profiles", {}),
    [v, h] = ke(`archea-desktop-preferences-${n.id}`, {
      compactMenu: !1,
      animations: !0,
      notifications: !0,
      textScale: 1,
    });
  lv(v.textScale);
  C.useEffect(() => {
    f((V) =>
      V.map((Ee) => ({
        ...Ee,
        stato: normalizeProjectStatus(Ee.stato),
      })),
    );
  }, []);
  C.useEffect(() => {
    if (t.meta.source !== "excel") return;
    const mergeBy = (V, Ee, Ve) => [
      ...new Map([...V, ...Ee].map((At) => [At[Ve], At])).values(),
    ];
    c((V) => mergeBy(V, t.task, "id"));
    u((V) => mergeBy(V, t.ore, "id"));
    x((V) => mergeBy(V, t.note, "id"));
    f((V) => mergeBy(V, t.progetti, "codice"));
  }, [t.meta.loadedAt, t.meta.source]);
  C.useEffect(() => {
    const mergeMinutes = (V) => {
      if (!Array.isArray(V) || !V.length) return;
      c((Ee) => [...V.filter((Ve) => !Ee.some((At) => At.id === Ve.id)), ...Ee]);
    };
    try {
      mergeMinutes(JSON.parse(localStorage.getItem("archea-ai-minutes-tasks") || "[]"));
    } catch {}
    const onMinutes = (V) => mergeMinutes(V.detail);
    window.addEventListener("archea-ai-minutes-approved", onMinutes);
    return () => window.removeEventListener("archea-ai-minutes-approved", onMinutes);
  }, []);
  C.useEffect(() => {
    c((V) =>
      V.map((Ee, Ve) =>
        String(Ee.id || "").includes("-AI-")
          ? {
              commenti: "",
              descrizione: Ee.titolo || "",
              inizio: "2026-10-27",
              orario: "18:00",
              shared: !0,
              notValidated: !1,
              numero: `${Ee.progettoCodice || "TASK"}-AI-${String(Ve + 1).padStart(2, "0")}`,
              ...Ee,
              commenti: Ee.commenti || "",
              numero: Ee.numero || `${Ee.progettoCodice || "TASK"}-AI-${String(Ve + 1).padStart(2, "0")}`,
            }
          : Ee,
      ),
    );
  }, []);
  const [p, y] = ke(
      "archea-desktop-calendar-events",
      Op.map((V, Ee) => {
        var Ve, At;
        return {
          id: V.id,
          date: `${a.slice(0, 8)}${String(Math.min(28, 7 + Ee * 4)).padStart(2, "0")}`,
          time:
            ((Ve = V.meta.match(/^\d\d:\d\d/)) == null ? void 0 : Ve[0]) ||
            "09:00",
          end: "10:00",
          title: V.title,
          type: Ee === 1 ? "Sopralluogo" : "Riunione",
          location:
            ((At = V.meta.split("·")[1]) == null ? void 0 : At.trim()) || "",
        };
      }),
    ),
    [O, k] = ke("archea-desktop-chat-messages", []),
    [z, E] = C.useState(!1),
    [U, P] = C.useState(!1),
    [$, N] = C.useState(!1),
    [I, S] = C.useState(!1),
    L = C.useRef(null),
    H = C.useRef(null),
    _ = Dv(n.id, a);
  C.useEffect(() => {
    if (!$) return;
    const V = (Ee) => {
      var Ve;
      ((Ve = L.current) != null && Ve.contains(Ee.target)) || N(!1);
    };
    return (
      document.addEventListener("pointerdown", V),
      () => document.removeEventListener("pointerdown", V)
    );
  }, [$]);
  const A = ["senior_architect", "partner_architect"].includes(n.appRole),
    w = n.appRole === "property",
    Reception = n.appRole === "reception",
    HRManager = n.appRole === "hr_manager",
    DepartmentHead = ["interior_head", "concept_head", "visual_head"].includes(n.appRole),
    DeptType = departmentTypeForViewer(n),
    B = [
      ...o
        .filter((V) => V.approvalPending && V.projectLeadId === n.id)
        .map((V) => ({
          id: `proposal-${V.id}`,
          kind: "proposal",
          title: "Nuova task inserita da una risorsa",
          detail: `${V.progettoCodice} · ${V.titolo || V.descrizione} · ${V.createdBy || V.assegnatario}`,
          unread: !0,
          taskId: V.id,
        })),
      ...(A
        ? o
            .filter((V) => V.completed && !V.validated)
            .map((V) => ({
              id: `review-${V.id}`,
              kind: "review",
              title: "Task completata · da verificare",
              detail: `${V.progettoCodice} · ${V.titolo || V.descrizione} · ${V.assegnatario}`,
              unread: !0,
              taskId: V.id,
            }))
        : []),
      ...o
        .filter(
          (V) => V.assegnatario === n.nome && V.notValidated && !V.completed,
        )
        .map((V) => ({
          id: `correction-${V.id}`,
          kind: "correction",
          title: "Correzioni richieste sulla tua task",
          detail: `${V.progettoCodice} · ${V.titolo || V.descrizione}${V.correctionBy ? ` · ${V.correctionBy}` : ""}`,
          unread: !0,
          taskId: V.id,
        })),
      ...parcelNotifications(n),
    ],
    T = v.notifications === !1 ? [] : [...B, ...Ji],
    D = [
      ["oggi", "Oggi", bx, "Attività, scadenze e Work Status"],
      ["progetti", "Progetti", Ss, "Commesse, task e indicatori"],
      [
        "taskmanager",
        "Task Manager",
        ro,
        "Inserimento e verifica delle attività",
      ],
      ["note", "Note", An, "Taccuino per progetto"],
      ["chat", "Chat", Td, "Messaggi interni dello studio"],
      ["ore", "Ore", Ur, "Registrazione e analisi ore"],
      ...(A
        ? [
            ["cantiere", "Cantiere", cc, "Piante e task di cantiere"],
            [
              "contabilita",
              "Contabilità",
              Zi,
              "Contratti, pagamenti e margini",
            ],
            ["insight", "Insight", io, "Dashboard e indicatori"],
            [
              "projectmanager",
              "Project Manager",
              Ss,
              "Progetti, stati e composizione team",
            ],
          ]
        : []),
      ["calendario", "Calendario", Wt, "Agenda e appuntamenti"],
      ["prenota", "Prenotazioni", Wt, "Auto, materiali e sale"],
      ["bim", "BIM Portal", ga, "Guide Revit e standard condivisi"],
      ["visual", "Visual Department", ya, "Richieste render e consegne"],
      ["interior", "Interior Department", DepartmentStudioIcon, "Prenotazioni viste interior e consegne"],
      ["concept", "Concept Department", DepartmentStudioIcon, "Prenotazioni concept e consegne"],
      ["inarchea", "IN ARCHEA", va, "Report, eventi e sondaggi"],
      ["fornitori", "Fornitori", SupplierStudioIcon, "Aziende, referenti, listini e schede"],
      ["materioteca", "Materioteca", MaterialStudioIcon, "Catalogo dei campioni dello studio"],
      ["abacotecnico", "Abaco tecnico", wt, "Dettagli costruiti e stratigrafie"],
    ],
    X = [
      ["avanzamento", "Avanzamento", Ss, "Studi, commesse e gruppi"],
      ["contabilita", "Contabilità", Zi, "Andamento economico degli studi"],
      ["insight", "Insight", io, "Dashboard complessiva"],
      ["calendario", "Calendario", Wt, "Agenda e appuntamenti"],
      ["chat", "Chat", Td, "Messaggi interni"],
      ["bio", "Organico", Xn, "Anagrafica e contratti"],
      ["fornitori", "Fornitori", SupplierStudioIcon, "Aziende, referenti, listini e schede"],
      ["materioteca", "Materioteca", MaterialStudioIcon, "Catalogo dei campioni dello studio"],
      ["abacotecnico", "Abaco tecnico", wt, "Dettagli costruiti e stratigrafie"],
    ],
    ReceptionCatalog = [
      ["oggi", "Oggi", bx, "Agenda operativa della reception"],
      ["pacchi", "Pacchi", wt, "Arrivi, notifiche e consegne"],
      ["calendario", "Calendario", Wt, "Riunioni e sale da preparare"],
      ["chat", "Chat", Td, "Messaggi interni dello studio"],
      ["prenota", "Prenotazioni", Wt, "Auto, materiali e sale"],
      ["fornitori", "Fornitori", SupplierStudioIcon, "Rubrica aziende in sola lettura"],
      ["materioteca", "Materioteca", MaterialStudioIcon, "Catalogo campioni in sola lettura"],
    ],
    DepartmentCatalog = DepartmentHead ? [
      ["oggi", "Oggi", bx, `Agenda ${DepartmentMeta[DeptType].accent}`],
      ["progetti", "Progetti", Ss, `Commesse e ${DepartmentMeta[DeptType].unit}`],
      ["calendario", "Calendario", Wt, "Agenda e appuntamenti"],
      ["ore", "Ore", Ur, "Registrazione e analisi ore"],
      ["chat", "Chat", Td, "Messaggi interni dello studio"],
      ["note", "Note", An, "Taccuino per progetto"],
      [DeptType, DepartmentMeta[DeptType].title, DepartmentStudioIcon, "Prenotazioni, assegnazioni e consegne"],
      ["departmentmanager", "Project Manager", Ss, `Gestione progetti e organico ${DepartmentMeta[DeptType].accent}`],
    ] : [],
    HRCatalog = [
      ["oggi", "Oggi", bx, "Agenda, richieste e attività HR"],
      ["chat", "Chat", Td, "Messaggi interni dello studio"],
      ["calendario", "Calendario", Wt, "Colloqui e appuntamenti"],
      ["bio", "Organico", Xn, "Persone, ruoli e contratti"],
      ["ore", "Ore", Ur, "Registrazione e analisi ore"],
      ["insight", "Insight", io, "Indicatori HR e organizzativi"],
      ["inarchea", "IN ARCHEA", va, "Report, eventi e sondaggi"],
      ["prenota", "Prenotazioni", Wt, "Sale, auto e attrezzature"],
    ],
    M = Reception ? ReceptionCatalog : HRManager ? HRCatalog : DepartmentHead ? DepartmentCatalog : w ? X : D,
    q = Reception
      ? ["oggi", "pacchi", "calendario", "chat"]
      : HRManager
      ? ["oggi", "chat", "calendario", "bio", "ore", "insight"]
      : DepartmentHead
      ? ["oggi", "progetti", "calendario", "ore", "chat", "note"]
      : w
      ? X.map((V) => V[0])
      : [
          "oggi",
          "progetti",
          "taskmanager",
          "note",
          "chat",
          "ore",
          ...(A ? ["cantiere", "contabilita", "insight"] : []),
          "calendario",
        ],
    [Z, Qe] = ke(`archea-desktop-main-menu-${n.id}`, q);
  C.useEffect(() => {
    Qe((V) => V.filter((Ee) => M.some((Ve) => Ve[0] === Ee)));
  }, [n.id]);
  const Us = Z.map((V) => M.find((Ee) => Ee[0] === V)).filter(Boolean),
    nn = M.filter((V) => !Z.includes(V[0])),
    Tn = [
      ...Us,
      ...(nn.length ? [["altro", "Altro", dc, "Altri strumenti"]] : []),
    ],
    es = (V, Ee) =>
      Qe((Ve) => {
        if (!V || !Ee || V === Ee) return Ve;
        const At = Ve.filter((Et) => Et !== V),
          Pn = At.indexOf(Ee);
        return Pn < 0 ? Ve : (At.splice(Pn, 0, V), At);
      }),
    ie = [
      ...M.map((V) => V[0]),
      ...(nn.length ? ["altro"] : []),
      ...(n.isDeveloper ? ["developer"] : []),
    ].includes(s)
      ? s
      : ((ce = Tn[0]) == null ? void 0 : ce[0]) || M[0][0],
    Vs = Tn.findIndex(
      ([V]) => V === ie || (V === "altro" && nn.some((Ee) => Ee[0] === ie)),
    ),
    R =
      Reception && ie === "oggi"
        ? e.jsxs(e.Fragment, {
            children: [e.jsx(ReceptionTodayDemo, {}), e.jsx(PersonalAgendaPanel, {})],
          })
        : DepartmentHead && ie === "oggi"
          ? e.jsxs(e.Fragment, {
              children: [
                e.jsx(DepartmentTodayDemo, { type: DeptType }),
                e.jsx(PersonalAgendaPanel, {}),
              ],
            })
        : DepartmentHead && ie === "progetti"
          ? e.jsx(DepartmentProjectsDemo, { type: DeptType })
        : ie === "pacchi"
          ? e.jsx(PackagesDemo, {})
      : ie === "oggi"
        ? e.jsx(hv, { tasks: o, hours: d, projects: j, events: p })
        : ie === "taskmanager"
          ? e.jsx(pv, { tasks: o, setTasks: c, projects: j })
          : ie === "ore"
            ? e.jsx(mv, { hours: d, setHours: u })
            : ie === "cantiere"
              ? e.jsx(Pv, { setTasks: c })
              : ie === "insight"
                ? e.jsx(Rv, { tasks: o, hours: d })
                : ie === "progetti"
                  ? e.jsx(jv, { tasks: o, hours: d, notes: m, projects: j })
                  : ie === "note"
                    ? e.jsx(vv, { notes: m, setNotes: x, projects: j })
                    : ie === "chat"
                      ? e.jsx(Tv, { messages: O, setMessages: k })
                      : ie === "calendario"
                        ? e.jsx(Ev, { events: p, setEvents: y, tasks: o })
                        : ie === "contabilita"
                          ? e.jsx(Ov, {})
                          : ie === "avanzamento"
                            ? e.jsx(Iv, { staffProfiles: g, projects: j })
                            : ie === "bio"
                              ? e.jsx(zv, { staffProfiles: g, projects: j })
                              : ie === "projectmanager" && A
                                ? e.jsx(yv, {
                                    projects: j,
                                    setProjects: f,
                                    staffProfiles: g,
                                    setStaffProfiles: b,
                                  })
                                : ie === "bim"
                                  ? e.jsx(Sv, {})
                                  : ie === "visual"
                                    ? DepartmentHead ? e.jsx(DepartmentRequestsDemo, { type: "visual" }) : e.jsx(Cv, {})
                                    : ie === "interior"
                                      ? e.jsx(DepartmentRequestsDemo, { type: "interior" })
                                    : ie === "concept"
                                      ? e.jsx(DepartmentRequestsDemo, { type: "concept" })
                                    : ie === "departmentmanager" && DepartmentHead
                                      ? e.jsx(DepartmentProjectsDemo, { type: DeptType, manager: !0 })
                                    : ie === "prenota"
                                      ? e.jsx(kv, {})
                                      : ie === "inarchea"
                                        ? e.jsx(bv, {})
                        : ie === "fornitori"
                          ? e.jsx(SuppliersDemo, {})
                          : ie === "materioteca"
                            ? e.jsx(MaterialsDemoV2, {})
                            : ie === "abacotecnico"
                              ? e.jsx(TechnicalAtlasDemo, {})
                        : ie === "developer" && n.isDeveloper
                                          ? e.jsx(av, {})
                                          : e.jsx(gv, {
                                              items: nn.map(
                                                ([V, Ee, Ve, At]) => [
                                                  V,
                                                  Ee,
                                                  At,
                                                  Ve,
                                                ],
                                              ),
                                            }),
    K = v.compactMenu ? 42 : 47;
  return e.jsxs("div", {
    className: `desktop-app${v.compactMenu ? " compact-menu" : ""}${v.animations === !1 ? " no-motion" : ""}`,
    children: [
      e.jsxs("aside", {
        className: "desk-sidebar",
        children: [
          e.jsx("button", {
            className: "desk-logo",
            onClick: () => r(Tn[0][0]),
            "aria-label": "ARCHEA ASSOCIATI",
            children: e.jsx("img", {
              src: "./icons/archea-associati-logo.svg",
              alt: "ARCHEA ASSOCIATI",
            }),
          }),
          e.jsxs("nav", {
            children: [
              e.jsx("span", {
                className: "desk-nav-highlight",
                style: {
                  transform: `translateY(${Math.max(0, Vs) * K}px)`,
                  opacity: Vs < 0 ? 0 : 1,
                },
                "aria-hidden": "true",
              }),
              Tn.map(([V, Ee, Ve]) => {
                const At =
                    ie === V ||
                    (V === "altro" && nn.some((Et) => Et[0] === ie)),
                  Pn = V !== "altro";
                return e.jsxs(
                  "button",
                  {
                    className: `${At ? "on " : ""}${Pn ? "draggable-nav" : ""}`,
                    draggable: Pn,
                    onDragStart: (Et) => {
                      Pn &&
                        ((H.current = V),
                        (Et.dataTransfer.effectAllowed = "move"));
                    },
                    onDragOver: (Et) => {
                      Pn &&
                        (Et.preventDefault(),
                        (Et.dataTransfer.dropEffect = "move"));
                    },
                    onDrop: (Et) => {
                      Et.preventDefault(), es(H.current, V), (H.current = null);
                    },
                    onDragEnd: () => {
                      H.current = null;
                    },
                    onClick: () => r(V),
                    children: [e.jsx(Ve, {}), e.jsx("span", { children: Ee })],
                  },
                  V,
                );
              }),
            ],
          }),
          e.jsxs("div", {
            className: "desk-side-bottom",
            children: [
              n.isDeveloper &&
                e.jsxs("button", {
                  className: `desk-developer-button${ie === "developer" ? " on" : ""}`,
                  onClick: () => r("developer"),
                  children: [
                    e.jsx(Os, {}),
                    e.jsx("span", { children: "Console sviluppatore" }),
                    e.jsx("i", { children: "MASTER" }),
                  ],
                }),
              e.jsxs("button", {
                className: "desk-settings-button",
                onClick: () => S(!0),
                children: [
                  e.jsx(jp, {}),
                  e.jsx("span", { children: "Impostazioni" }),
                ],
              }),
              e.jsxs("span", {
                className: "desk-demo-dot",
                children: [e.jsx("i", {}), "DEMO LOCALE · nessuna connessione"],
              }),
              e.jsxs("button", {
                className: "desk-user",
                onClick: () => E((V) => !V),
                children: [
                  e.jsx("i", {
                    children: Lt(
                      ((ze = g[n.id]) == null ? void 0 : ze.name) || n.nome,
                    ),
                  }),
                  e.jsxs("span", {
                    children: [
                      e.jsx("b", {
                        children:
                          ((Ft = g[n.id]) == null ? void 0 : Ft.name) || n.nome,
                      }),
                      e.jsx("small", {
                        children: n.isDeveloper
                          ? "Partner Architect · Platform Owner"
                          : Xt[n.appRole],
                      }),
                    ],
                  }),
                  e.jsxs("em", {
                    className: "desk-user-time",
                    children: [
                      e.jsx("b", { children: _.compact }),
                      e.jsx("small", { children: "ore oggi" }),
                    ],
                  }),
                ],
              }),
              z &&
                e.jsxs("div", {
                  className: "desk-user-menu",
                  children: [
                    e.jsx("b", {
                      children:
                        ((Hr = g[n.id]) == null ? void 0 : Hr.name) || n.nome,
                    }),
                    e.jsx("span", {
                      children: n.isDeveloper
                        ? "Platform Owner · account master demo"
                        : "Dati fittizi salvati su questo browser",
                    }),
                    e.jsxs("div", {
                      className: "desk-work-clock",
                      children: [
                        e.jsx("small", { children: "TEMPO DI LAVORO OGGI" }),
                        e.jsx("b", { children: _.full }),
                        e.jsx("span", {
                          children:
                            "Il conteggio è iniziato all’apertura dell’app.",
                        }),
                        e.jsx("button", {
                          onClick: _.reset,
                          children: "Azzera contatore",
                        }),
                      ],
                    }),
                    e.jsx("button", {
                      onClick: i,
                      children: "Esci dalla demo",
                    }),
                  ],
                }),
            ],
          }),
        ],
      }),
      e.jsxs("div", {
        className: "desk-workspace",
        children: [
          e.jsxs("header", {
            className: "desk-topbar",
            children: [
              e.jsxs("div", {
                children: [
                  e.jsxs("b", { children: ["Ciao ", n.nome.split(" ")[0]] }),
                  e.jsx("span", { children: vp(a) }),
                ],
              }),
              e.jsxs("div", {
                className: "desk-top-actions",
                children: [
                  e.jsxs("div", {
                    className: "desk-notifications-wrap",
                    ref: L,
                    children: [
                      e.jsxs("button", {
                        className: "desk-notification-button",
                        onClick: () => N((V) => !V),
                        "aria-label": "Apri notifiche",
                        children: [
                          e.jsx(fp, {}),
                          e.jsx("i", {
                            children: T.filter((V) => V.unread).length,
                          }),
                        ],
                      }),
                      $ &&
                        e.jsxs("div", {
                          className: "desk-notification-popover",
                          children: [
                            e.jsxs("header", {
                              children: [
                                e.jsxs("div", {
                                  children: [
                                    e.jsx("small", {
                                      children: "ARCHEA WORKSPACE",
                                    }),
                                    e.jsx("h2", { children: "Notifiche" }),
                                  ],
                                }),
                                e.jsx("button", {
                                  onClick: () => N(!1),
                                  "aria-label": "Chiudi notifiche",
                                  children: e.jsx("span", {
                                    "aria-hidden": "true",
                                    children: "×",
                                  }),
                                }),
                              ],
                            }),
                            e.jsx("div", {
                              children: T.map((V) =>
                                e.jsxs(
                                  "article",
                                  {
                                    className: V.taskId ? "clickable" : "",
                                    onClick: () => {
                                      V.taskId &&
                                        (sessionStorage.setItem(
                                          "archea-task-focus",
                                          V.taskId,
                                        ),
                                        r("taskmanager"),
                                        window.dispatchEvent(
                                          new CustomEvent("archea-focus-task", {
                                            detail: V.taskId,
                                          }),
                                        ),
                                        N(!1));
                                    },
                                    children: [
                                      e.jsx("span", {
                                        className: V.kind,
                                        children: e.jsx("i", {}),
                                      }),
                                      e.jsxs("div", {
                                        children: [
                                          e.jsx("small", {
                                            children:
                                              V.kind === "proposal"
                                                ? "NUOVA TASK PROPOSTA"
                                                : V.kind === "review"
                                                  ? "TASK DA VERIFICARE"
                                                  : V.kind === "correction"
                                                    ? "CORREZIONE TASK"
                                                    : V.kind === "survey"
                                                      ? "SONDAGGIO"
                                                      : V.kind === "party"
                                                        ? "EVENTO STUDIO"
                                                        : "EVENTO",
                                          }),
                                          e.jsx("b", { children: V.title }),
                                          e.jsx("p", { children: V.detail }),
                                        ],
                                      }),
                                      V.unread && e.jsx("em", {}),
                                    ],
                                  },
                                  V.id,
                                ),
                              ),
                            }),
                          ],
                        }),
                    ],
                  }),
                  e.jsx("span", {
                    className: "desk-demo-label",
                    children:
                      t.meta.source === "excel" ? "DATI EXCEL" : "DATI DIMOSTRATIVI",
                  }),
                  e.jsx(Mv, {}),
                ],
              }),
            ],
          }),
          e.jsx(
            "main",
            {
              className: "desk-content desk-page-spring",
              children: e.jsxs(e.Fragment, {
                children: [
                  nn.some(([V]) => V === ie) &&
                    e.jsxs("button", {
                      className: "desk-back desk-more-back",
                      onClick: () => r("altro"),
                      children: [e.jsx(Re, {}), "Torna ad Altro"],
                    }),
                  R,
                ],
              }),
            },
            ie,
          ),
          e.jsxs("footer", {
            className: "desk-footer",
            children: [
              e.jsxs("span", {
                children: [
                  "v",
                  xa,
                  " · ",
                  l === "en" ? "Data updated at" : "Dati aggiornati alle",
                  " ",
                  new Date(t.meta.loadedAt).toLocaleTimeString(
                    l === "en" ? "en-GB" : "it-IT",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Europe/Rome",
                    },
                  ),
                ],
              }),
              e.jsx("span", {
                children:
                  "© 2026 · Fatto per Archea Associati da Francesco Diamanti",
              }),
            ],
          }),
        ],
      }),
      e.jsx("button", {
        className: "desk-archeai-fab",
        onClick: () => P(!0),
        "aria-label": "Apri ARCHEAI",
        children: e.jsx(xc, { compact: !0 }),
      }),
      U && e.jsx(_p, { en: l === "en", onClose: () => P(!1) }),
      I &&
        e.jsx(Nv, {
          onClose: () => S(!1),
          catalog: M,
          mainIds: Z,
          setMainIds: Qe,
          projects: j,
          staffProfiles: g,
          setStaffProfiles: b,
          preferences: v,
          setPreferences: h,
        }),
    ],
  });
}
const $v = [
    ["oggi", "today", Wt],
    ["progetti", "projects", Ss],
    ["note", "notes", () => e.jsx(An, {})],
    ["ore", "hours", Ur],
    ["cantiere", "site", cc],
    ["altro", "more", dc],
  ],
  Lv = $v.filter(([t]) => t !== "cantiere"),
  Fv = [
    ["oggi", "today", Wt],
    ["progetti", "projects", Ss],
    ["note", "notes", () => e.jsx(An, {})],
    ["cantiere", "site", cc],
    ["contabilita", "accounting", Zi],
    ["altro", "more", dc],
  ],
  Uv = [
    ["avanzamento", "progress", Ss],
    ["contabilita", "accounting", Zi],
    ["insight", "insights", xp],
    ["calendario", "calendar", Wt],
    ["bio", "employeeBio", Xn],
  ],
  ReceptionMobile = [
    ["oggi", "today", Wt],
    ["pacchi", "packages", wt],
    ["calendario", "calendar", Wt],
    ["altro", "more", dc],
  ],
  DepartmentMobile = [
    ["oggi", "today", Wt],
    ["progetti", "projects", Ss],
    ["chat", "chat", Td],
    ["ore", "hours", Ur],
    ["calendario", "calendar", Wt],
    ["altro", "more", dc],
  ],
  HRMobile = [
    ["oggi", "today", Wt],
    ["chat", "chat", Td],
    ["calendario", "calendar", Wt],
    ["bio", "employeeBio", Xn],
    ["ore", "hours", Ur],
    ["insight", "insights", xp],
    ["altro", "more", dc],
  ];
function Vv() {
  const {
      data: t,
      viewer: n,
      tab: s,
      setTab: r,
      overlay: i,
      open: a,
      loading: l,
      error: o,
      reload: c,
      t: d,
      language: u,
    } = Y(),
    m = (n == null ? void 0 : n.appRole) === "property",
    x = ["senior_architect", "partner_architect"].includes(
      n == null ? void 0 : n.appRole,
    ),
    j = (n == null ? void 0 : n.appRole) === "architect",
    Reception = (n == null ? void 0 : n.appRole) === "reception",
    HRManager = (n == null ? void 0 : n.appRole) === "hr_manager",
    DepartmentHead = ["interior_head", "concept_head", "visual_head"].includes(n == null ? void 0 : n.appRole),
    DeptType = departmentTypeForViewer(n),
    f = ["avanzamento", "contabilita", "insight", "calendario", "bio"],
    g = ["avanzamento", "bio"],
    b = Reception
      ? ["oggi", "pacchi", "calendario", "prenota", "fornitori", "materioteca"].includes(s)
        ? s
        : "oggi"
      : HRManager
      ? ["oggi", "chat", "calendario", "bio", "ore", "insight", "inarchea", "prenota"].includes(s)
        ? s
        : "oggi"
      : DepartmentHead
      ? ["oggi", "progetti", "chat", "ore", "calendario", "note", DeptType, "departmentmanager", "inarchea"].includes(s)
        ? s
        : "oggi"
      : m
      ? f.includes(s)
        ? s
        : "avanzamento"
      : (j && ["cantiere", "contabilita", "insight", ...g].includes(s)) ||
          g.includes(s)
        ? "oggi"
        : s,
    v = Reception ? ReceptionMobile : HRManager ? HRMobile : DepartmentHead ? DepartmentMobile : m ? Uv : x ? Fv : Lv,
    h = Reception
      ? ["prenota", "fornitori", "materioteca"]
      : HRManager
      ? ["inarchea", "prenota"]
      : DepartmentHead
      ? ["note", DeptType, "departmentmanager", "inarchea"]
      : x
      ? ["ore", "calendario", "insight", "prenota", "inarchea", "bim", "visual", "interior", "concept", "fornitori", "materioteca", "abacotecnico"]
      : ["calendario", "prenota", "inarchea", "bim", "visual", "interior", "concept", "fornitori", "materioteca", "abacotecnico"],
    p = v.some(([E]) => E === b) ? b : h.includes(b) ? "altro" : v[0][0],
    y = Math.max(
      0,
      v.findIndex(([E]) => E === p),
    ),
    [O, k] = C.useState(!1);
  C.useEffect(() => {
    let E = Math.max(0, window.scrollY),
      U = 0;
    const P = () => {
        const N = Math.max(0, window.scrollY),
          I = N - E;
        N < 20 ? k(!1) : I > 6 ? k(!0) : I < -5 && k(!1), (E = N), (U = 0);
      },
      $ = () => {
        U || (U = window.requestAnimationFrame(P));
      };
    return (
      window.addEventListener("scroll", $, { passive: !0 }),
      () => {
        window.removeEventListener("scroll", $),
          U && window.cancelAnimationFrame(U);
      }
    );
  }, []),
    C.useEffect(() => k(!1), [b]);
  const z =
    t &&
    n &&
    (Reception && b === "oggi"
      ? e.jsxs(e.Fragment, {
          children: [
            e.jsx(ReceptionTodayDemo, {}, n.id),
            e.jsx(PersonalAgendaPanel, {}),
          ],
        })
      : DepartmentHead && b === "oggi"
        ? e.jsxs(e.Fragment, {
            children: [
              e.jsx(DepartmentTodayDemo, { type: DeptType }, n.id),
              e.jsx(PersonalAgendaPanel, {}),
            ],
          })
      : DepartmentHead && b === "progetti"
        ? e.jsx(DepartmentProjectsDemo, { type: DeptType })
      : b === "pacchi"
        ? e.jsx(PackagesDemo, {})
      : b === "oggi"
      ? e.jsx(pj, {}, n.id)
      : b === "progetti"
        ? e.jsx(jj, {})
        : b === "note"
          ? e.jsx(mj, {})
          : b === "ore"
            ? e.jsx(yj, {}, n.id)
            : b === "cantiere"
              ? e.jsx(Aj, {})
              : b === "calendario"
                ? e.jsx(Ej, {})
                : b === "prenota"
                  ? e.jsx(Pj, {})
                  : b === "inarchea"
                    ? e.jsx(Ij, {})
                    : b === "contabilita"
                      ? e.jsx(Lj, {})
                      : b === "avanzamento"
                        ? e.jsx(Uj, {})
                        : b === "bio"
                          ? e.jsx(Fj, {})
                          : b === "insight"
                            ? e.jsx(Wj, {})
                            : b === "bim"
                              ? e.jsx(Kj, {})
                            : b === "visual"
                                ? DepartmentHead ? e.jsx(DepartmentRequestsDemo, { type: "visual" }) : e.jsx(Qj, {})
                              : b === "interior"
                                ? e.jsx(DepartmentRequestsDemo, { type: "interior" })
                              : b === "concept"
                                ? e.jsx(DepartmentRequestsDemo, { type: "concept" })
                              : b === "departmentmanager" && DepartmentHead
                                ? e.jsx(DepartmentProjectsDemo, { type: DeptType, manager: !0 })
                                : b === "fornitori"
                                  ? e.jsx(SuppliersDemo, {})
                                  : b === "materioteca"
                                    ? e.jsx(MaterialsDemoV2, {})
                                    : b === "abacotecnico"
                                      ? e.jsx(TechnicalAtlasDemo, {})
                                      : e.jsx(Rj, {}));
  return e.jsxs("div", {
    className: "app glass-prototype",
    children: [
      e.jsxs("header", {
        className: "top",
        children: [
          e.jsx("div", {
            className: "brand",
            children: e.jsx("img", {
              className: "brand-logo",
              src: "./icons/archea-associati-logo.svg",
              alt: "ARCHEA ASSOCIATI",
            }),
          }),
          n &&
            e.jsxs("div", {
              className: "top-actions",
              children: [
                e.jsxs("button", {
                  className: "notification-button",
                  onClick: () => a({ kind: "notifications" }),
                  "aria-label":
                    u === "en" ? "Open notifications" : "Apri notifiche",
                  children: [
                    e.jsx(fp, {}),
                    e.jsx("span", {
                      children: [...parcelNotifications(n), ...Ji].filter((E) => E.unread).length,
                    }),
                  ],
                }),
                e.jsx(Vr, {
                  name: n.nome,
                  size: 44,
                  onClick: () => a({ kind: "profile" }),
                  label: "Persona e origine dei dati",
                }),
              ],
            }),
        ],
      }),
      e.jsxs("main", {
        className: "main",
        children: [
          o &&
            e.jsxs("div", {
              className: "banner error",
              role: "alert",
              children: [
                "Impossibile caricare i dati: ",
                o,
                " ",
                e.jsx("button", {
                  className: "link",
                  onClick: () => void c(),
                  children: "Riprova",
                }),
              ],
            }),
          l && !t && e.jsx("p", { className: "empty", children: d("loading") }),
          z &&
            e.jsx(
              "section",
              { className: "mobile-scene", "data-section": b, children: z },
              b,
            ),
          t &&
            e.jsxs("p", {
              className: "foot",
              children: [
                e.jsxs("span", {
                  children: [
                    `v${xa} · ${u === "en" ? "Data updated at" : "Dati aggiornati alle"} `,
                    new Date(t.meta.loadedAt).toLocaleTimeString(
                      u === "en" ? "en-GB" : "it-IT",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Europe/Rome",
                      },
                    ),
                    l
                      ? u === "en"
                        ? " · updating…"
                        : " · aggiornamento…"
                      : "",
                  ],
                }),
                e.jsx("span", {
                  children:
                    "© 2026 · Fatto per Archea Associati da Francesco Diamanti",
                }),
              ],
            }),
        ],
      }),
      e.jsxs("nav", {
        className: `tabbar glass-tabbar${O ? " compact" : ""}`,
        "aria-label": "Sezioni",
        style: { "--glass-count": v.length, "--glass-index": y },
        children: [
          e.jsx("i", { className: "glass-indicator", "aria-hidden": "true" }),
          v.map(([E, U, P]) =>
            e.jsxs(
              "button",
              {
                className: p === E ? "on" : "",
                "aria-current": p === E ? "page" : void 0,
                onClick: () => {
                  O ? k(!1) : r(E);
                },
                children: [e.jsx(P, {}), e.jsx("span", { children: d(U) })],
              },
              E,
            ),
          ),
        ],
      }),
      (i == null ? void 0 : i.kind) === "task" && e.jsx(Nj, { id: i.id }),
      (i == null ? void 0 : i.kind) === "note" && e.jsx(kj, { id: i.id }),
      (i == null ? void 0 : i.kind) === "profile" && e.jsx(uj, {}),
      (i == null ? void 0 : i.kind) === "notifications" && e.jsx(Yj, {}),
    ],
  });
}
function Bv() {
  const [t, n] = C.useState(!0);
  return (
    C.useEffect(() => {
      const s = window.setTimeout(() => n(!1), 2600);
      return () => window.clearTimeout(s);
    }, []),
    e.jsx(sj, { children: t ? e.jsx(Vj, {}) : e.jsx(Hv, {}) })
  );
}
function Hv() {
  const { authenticated: t } = Y(),
    desktopDevice = () =>
      window.matchMedia("(pointer: fine)").matches ||
      window.screen.width >= 980,
    [n, s] = C.useState(desktopDevice);
  return (
    C.useEffect(() => {
      const r = window.matchMedia("(pointer: fine)"),
        i = () => s(desktopDevice());
      return (
        r.addEventListener("change", i),
        () => r.removeEventListener("change", i)
      );
    }, []),
    t ? (n ? e.jsx(_v, {}) : e.jsx(Vv, {})) : e.jsx(Bj, {})
  );
}
dp(document.getElementById("root")).render(
  e.jsx(C.StrictMode, { children: e.jsx(Bv, {}) }),
);
"serviceWorker" in navigator &&
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js", { updateViaCache: "none" })
      .catch((t) => {
        console.warn("Service worker non disponibile:", t);
      });
  });
