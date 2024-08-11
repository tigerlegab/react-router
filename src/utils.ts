import { BrowserLocation, browserRouter } from "./browserRouter";

export const setRoutes = browserRouter.setRoutes;
export const setErrorElement = browserRouter.setErrorElement;
export const navigate = browserRouter.navigate;
export const getBrowserLocation = () => {
   const router = browserRouter.value();
   return { path: router.path, state: router.state, search: router.search } as BrowserLocation;
}