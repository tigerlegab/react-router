import { useEffect, useState, useSyncExternalStore } from "react";
import { browserLocation } from "./browser-location";
import { locationStatus } from "./location-status";
import { parse } from "regexparam";

export interface RoutesProps {
   routes: Route[];
   page404: React.ReactNode;
   pageLoader?: React.ReactNode;
}

export interface Route {
   path: string;
   element: (() => Promise<{
      default: (props?: any) => React.JSX.Element;
      loader?: (params?: any) => Promise<any>;
   }>) | React.ReactNode;
}

interface RouteContent {
   element: ((props?: any) => React.JSX.Element) | React.ReactNode;
   params?: any;
   data?: any;
}

export function useLocation() {
   return useSyncExternalStore(browserLocation.subscribe, browserLocation.current);
}

export function useLocationStatus() {
   return useSyncExternalStore(locationStatus.subscribe, locationStatus.current);
}

export function Routes({ routes, ...props }: RoutesProps) {
   const location = useLocation();
   const status = useLocationStatus();
   const [content, setContent] = useState<RouteContent | null>(null);

   useEffect(() => {
      browserLocation.navigate("", { replace: true, search: true, state: true });
   }, []);

   useEffect(() => {
      const load = async () => {
         locationStatus.setStatus("pending");
         const routematch = getMatch(routes, location.path);
         if (routematch) {
            if (typeof routematch.route.element === "function") {
               const importEl = await routematch.route.element();
               const data = importEl.loader ? await importEl.loader(routematch.params) : null;
               setContent({
                  element: importEl.default,
                  params: routematch.params,
                  data
               });
            }
            else {
               setContent({
                  element: routematch.route.element,
                  params: routematch.params
               });
            }
         }
         locationStatus.setStatus("loaded");
      };

      if (location.path) {
         load();
      }
   }, [location.path]);

   if (status === "pending" && props.pageLoader) return props.pageLoader;
   if (!content) return props.page404;
   if (typeof content.element !== "function") return <>{content.element}</>;
   return <content.element params={content.params} data={content.data} />;
}

function getMatch(routes: Route[], path: string) {
   if (!path) return undefined;
   const { pattern, keys } = parse(path);
   for (const route of routes) {
      const matches = pattern.exec(route.path);
      if (matches) {
         const params = getMatchValue(matches, keys);
         return { route, params };
      }
   }
}

function getMatchValue(matches: RegExpExecArray, keys: string[]) {
   let i = 0, out: { [x: string]: any; } = {};
   while (i < keys.length) {
      out[keys[i]] = matches[++i] || null;
   }
   return out;
}