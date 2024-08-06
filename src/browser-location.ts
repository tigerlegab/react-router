export interface BrowserLocation {
   path: string;
   state?: any;
   search?: {
      [x: string]: any;
   };
}

export interface NavigateOptions {
   replace?: boolean;
   state?: boolean | any;
   search?: boolean | string;
}

let _location: BrowserLocation = { path: "" };
let _subscribers = new Set<() => void>();

const navigate = (path: string, options: NavigateOptions = {}) => {
   const _q_ = options.search && options.search !== true ? options.search : (options.search === true ? window.location.search : "");
   const _s_ = options.state && options.state !== true ? options.state : window.history.state;
   const _n_ = (path ? path : window.location.pathname) + (!_q_ || _q_.startsWith("?") ? _q_ : "?" + _q_);

   if (_q_) {
      const _p = new window.URLSearchParams(_q_);
      const _o: { [x: string]: any; } = {};
      _p.forEach((value, key) => { _o[key] = value; });
      _location = { path: _n_, state: _s_, search: _o };
   }
   else {
      _location = { path: _n_, state: _s_ };
   }

   if (options.replace) window.history.replaceState(_s_, "", _n_);
   else window.history.pushState(_s_, "", _n_);
   _subscribers.forEach((callback) => {
      callback();
   });
};

const onpopstatechanged = (evnt: PopStateEvent) => navigate("", { replace: true, state: evnt.state, search: true });

export const browserLocation = {
   current: () => _location,
   subscribe: (callback: () => void) => {
      _subscribers.add(callback);
      window.addEventListener("popstate", onpopstatechanged);
      return () => {
         _subscribers.delete(callback);
         window.removeEventListener("popstate", onpopstatechanged);
      }
   },
   navigate
};