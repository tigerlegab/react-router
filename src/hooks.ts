import { useSyncExternalStore } from "react";
import { BrowserLocation, browserRouter } from "./browserRouter";
import { navigationStatus } from "./navigationStatus";

export function useBrowserLocation() {
   const router = useSyncExternalStore(browserRouter.subscribe, browserRouter.value);
   return { path: router.path, state: router.state, search: router.search } as BrowserLocation;
}

export function useBrowserContent() {
   const router = useSyncExternalStore(browserRouter.subscribe, browserRouter.value);
   return router.content;
}

export function useNavigationStatus() {
   return useSyncExternalStore(navigationStatus.subscribe, navigationStatus.current);
}