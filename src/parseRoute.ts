import { parse } from "regexparam";

export function parseRoute(routePattern: string, pathname: string) {
   const { pattern, keys } = parse(routePattern);
   const matches = pattern.exec(pathname);
   if (matches) return getMatchValue(matches, keys);
}

function getMatchValue(matches: RegExpExecArray, keys: string[]) {
   let i = 0, out: { [x: string]: any; } = {};
   while (i < keys.length) out[keys[i]] = matches[++i] || null;
   return out;
}