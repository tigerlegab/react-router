# react-router &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/tigerlegab/react-router/blob/main/LICENSE) [![Published on NPM](https://img.shields.io/npm/v/@tigerlegab/react-router.svg)](https://www.npmjs.com/package/@tigerlegab/react-router) [![Minified size](https://img.shields.io/bundlephobia/min/@tigerlegab/react-router.svg)](https://bundlephobia.com/package/@tigerlegab/react-router) [![Tree-shakeable](https://badgen.net/bundlephobia/tree-shaking/@tigerlegab/react-router)](https://bundlephobia.com/package/@tigerlegab/react-router)

Simple router for react with data loader.

## Example

```tsx
// Dashboard.tsx
export default function Dashboard() {
   return <>Dashboard</>;
}

// Item.tsx
export loader(params: { id: string; }) {
   return fetch("/api/item" + params.id);
}

export default function Item(props : { params: { id: string; }; data: any; }) {
   return (
      <>
         id: {props.params.id}
         data: {JSON.stringify(props.data)}
      </>
   );
}

// Layout.tsx
import { Router, BrowserRoute } from "@tigerlegab/react-router";
import { Loader } from "./Loader";

const Page404 = lazyLoad(() => import("./Page404"));
const Page500 = lazyLoad(() => import("./Page500"));
const routes: BrowserRoute[] = [
   {
      path: "/",
      element: () => import("./Dashboard"),
   },
   {
      path: "/:userId",
      element: () => import("./User"),
   }
];

export default function Layout() {
   return (
      <>
         <header>
            <Link to="/">Dashboard</Link>
            <Link to="/item/0001">Item One</Link>
         </header>

         <main>
           <Router
               routes={routes}
               page404={<Page404 />}
               page500={(error) => <Page500 error={error} />}
               pageLoader={{ element: <Loader />, firstLoadOnly: true }}
            />
         </main>
      </>
   );
}
```

During navigation, it will first look for the matching route, then import the file, then call the data loader function and waits for the response before displaying the content. You can use `useNavigationStatus()` to handle loading state. For example a loading bar:

```tsx
export function LoadingBar() {
  const status = useNavigationStatus();
  const [progress, setProgress] = useState(0);

   useEffect(() => {
      if (status === "loaded") {
         setProgress(100);
         window.setTimeout(() => setProgress(0), 160);
      }
      else {
         setProgress(randomInt(18, 20));
         const tick = () => setProgress(curr => curr + 1);
         const id = window.setInterval(tick, 500);
         return () => window.clearInterval(id);
      }
   }, [status]);

   return (
      <Progress
         size="xs"
         radius={0}
         value={progress}
         classNames={classes}
         data-mounted={progress > 0}
      />
   );
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
```

## Components

* `Router`

#### Props

```ts
interface RouterProps {
   /**
    * @required
    * List of routes
    */
   routes: BrowserRoute[];
   /**
    * @required
    * Default display if theres no matching route
    */
   page404: React.ReactNode;
   /**
    * @optional
    * Default display if loader returns an error
    */
   page500: page500: (error: string) => React.ReactNode;
   /**
    * @optional
    * Default display if location status is in pending state
    */
   pageLoader?: {
      // Element of the pageLoader.
      element: React.ReactNode;
      // Option to show pageLoader at first load only.
      firstLoadOnly?: boolean;
   };
}

interface BrowserRoute {
   /**
    * @required
    * The path to match for this route
    */
   path: string;
   /**
    * @required
    * The element to display for this route
    */
   element: (() => Promise<{
      default: (props?: any) => React.JSX.Element;
      loader?: (params?: any) => Promise<any>;
   }>) | React.ReactNode;
}
```

## Hooks

* `useBrowserLocation` - Listens to location changes and returns the current location data.
* `useNavigationStatus` - Listens to location status changes and returns the current location status. Statuses are `pending` and `loaded`.

## Utils
Functions that can also be used outside of react.

* `navigate` - Navigates to a new browser location.
* `getBrowserLocation` - Returns the current location data.
* `parseRoute` - Check if the route matches current pathname and returns the route value. Uses [`regexparam`](https://github.com/lukeed/regexparam).

## Location data

```ts
interface BrowserLocation {
   path: string;
   state?: any;
   search?: {
      [x: string]: any;
   };
}
```

## Navigation options

```ts
interface NavigateOptions {
   /**
    * Set to `true` to use `window.history.replace`
    */
   replace?: boolean;
   /**
    * Set to `true` to use `window.history.state` otherwise provide a value or none
    */
   state?: boolean | any;
   /**
    * Set to `true` to use `window.location.search` otherwise provide a string value (eq. "search=name&age=10")
    */
   search?: boolean | string;
}
```

## `parseRoute` usage

```ts
parseRoute("/item", "/item")
//=> {}

parseRoute("/item/:id", "/item")
//=> undefined

parseRoute("/item/:id?", "/item")
//=> { id: null }

parseRoute("/item/:id?", "/item/0001")
//=> { id: "0001" }
```
See [regexparam usage](https://github.com/lukeed/regexparam/blob/main/readme.md#usage) for more info.

## Developement issue

1. Hot reload not working in development. You need to refresh the browser to view the updates.