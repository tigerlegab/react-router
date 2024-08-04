import { browserLocation } from "./browser-location";

export const navigate = browserLocation.navigate;
export const getBrowserLocation = browserLocation.current;
export * from "./routes";