import { navigationStatus } from "./navigationStatus";
import { parseRoute } from "./parseRoute";

export interface BrowserRoute {
   path: string;
   element: (() => Promise<{
      default: (props?: any) => React.JSX.Element;
      loader?: (params?: any) => Promise<any>;
   }>) | React.ReactNode;
}

export interface BrowserLocation {
   path: string;
   state?: any;
   search?: {
      [x: string]: any;
   };
}

export interface BrowserContent {
   element: ((props?: any) => React.JSX.Element) | React.ReactNode;
   params?: any;
   data?: any;
}

export interface BrowserRouter extends BrowserLocation {
   content: BrowserContent | null;
}

export interface NavigateOptions {
   replace?: boolean;
   state?: boolean | any;
   search?: boolean | string;
   callback?: () => void;
}

let _subscribers = new Set<() => void>();
let _routes: BrowserRoute[] = [];
let _router: BrowserRouter = { path: "", content: null };
let _errorEl: (error: string) => React.ReactNode;

export const browserRouter = {
   value: () => _router,
   subscribe: (callback: () => void) => {
      _subscribers.add(callback);
      window.addEventListener("popstate", onpopstatechanged);
      return () => {
         _subscribers.delete(callback);
         window.removeEventListener("popstate", onpopstatechanged);
      }
   },
   setRoutes: (routes: BrowserRoute[]) => _routes = routes,
   setErrorElement: (element: (error: string) => React.ReactNode) => _errorEl = element,
   navigate
};

function onpopstatechanged(evnt: PopStateEvent) {
   navigate("", { replace: true, state: evnt.state, search: true });
}

function navigate(path: string, options: NavigateOptions = {}) {
   navigationStatus.setStatus("pending");
   const _q_ = options.search && options.search !== true ? options.search : (options.search === true ? window.location.search : "");
   const _s_ = options.state && options.state !== true ? options.state : window.history.state;
   const _n_ = (path ? path : window.location.pathname) + (!_q_ || _q_.startsWith("?") ? _q_ : "?" + _q_);

   let init: any = {};
   if (_q_) {
      const _p = new window.URLSearchParams(_q_);
      const _o: { [x: string]: any; } = {};
      _p.forEach((value, key) => { _o[key] = value; });
      init = { path: _n_, state: _s_, search: _o };
   }
   else {
      init = { path: _n_, state: _s_ };
   }

   if (options.replace) window.history.replaceState(_s_, "", _n_);
   else window.history.pushState(_s_, "", _n_);

   loadBrowserContent(_n_).then((content) => {
      _router = { ...init, content };
      _subscribers.forEach((callback) => callback());
      options.callback?.();
      navigationStatus.setStatus("loaded");
   });
}

async function loadBrowserContent(path: string) {
   const match = getMatchingRoute(path);
   if (match) {
      if (typeof match.route.element === "function") {
         try {
            const importEl = await match.route.element();
            const data = importEl.loader ? await importEl.loader(match.params) : null;
            return { element: importEl.default, params: match.params, data } as BrowserContent;
         } catch (error) {
            return { element: _errorEl(error as string) };
         }
      } else {
         return { element: match.route.element };
      }
   } else {
      return null;
   }
}

function getMatchingRoute(path: string) {
   for (const route of _routes) {
      const params = parseRoute(route.path, path);
      if (params) return { route, params };
   }
}