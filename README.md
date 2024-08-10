# react-router &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/tigerlegab/react-router/LICENSE) [![Published on NPM](https://img.shields.io/npm/v/@tigerlegab/react-router.svg)](https://www.npmjs.com/package/@tigerlegab/react-router) [![Minified size](https://img.shields.io/bundlephobia/min/@tigerlegab/react-router.svg)](https://bundlephobia.com/package/@tigerlegab/react-router) [![Tree-shakeable](https://badgen.net/bundlephobia/tree-shaking/@tigerlegab/react-router)](https://github.com/@tigerlegab/react-router)

Simple router for react with data loader.

## Examples

### With lazy loading

```tsx
import { ComponentType, ComponentProps, lazy, Suspense } from "react";
import { Route, Routes } from "@tigerlegab/react-router";
import { Spinner } from "./Spinner";

// lazy loader function
function lazyLoad<T extends ComponentType<any>>(factory: () => Promise<{ default: T; }>) {
   const Component = lazy(factory);
   return (props: ComponentProps<T>) => (
      <Suspense fallback={<Spinner />}>
         <Component {...props} />
      </Suspense>
   );
}

const SignIn = lazyLoad(() => import("./SignIn"));
const SignUp = lazyLoad(() => import("./SignUp"));
const NotFound = lazyLoad(() => import("./NotFound"));
const routes: Route[] = [
   {
      path: "/",
      element: <SignIn />,
   },
   {
      path: "/sign-up",
      element: <SignUp />,
   }
];

export default function App() {
   return (
      <Routes
         routes={routes}
         page404={<NotFound />}
         pageLoader={<Spinner />}
      />
   );
}
```

It is always a good idea to wrap a lazy component inside a Suspense to let the user know that we're still importing the file.

### With data loader

```tsx
// Dashboard.tsx
export default function Dashboard() {
   return <>Dashboard</>;
}

// User.tsx
export loader(params: any) {
   return fetch("/api/user" + params.userId);
}

export default function User(props : { params: any; data: any; }) {
   return (
      <>
         userId: {props.params.userId}
         data: {JSON.stringify(props.data)}
      </>
   );
}

// Layout.tsx
import { Route, Routes } from "@tigerlegab/react-router";
import { Spinner } from "./Spinner";

const NotFound = lazyLoad(() => import("./NotFound"));
const routes: Route[] = [
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
            <Link to="/my-user-id">User</Link>
         </header>

         <main>
            <Routes
               routes={routes}
               page404={<NotFound />}
               pageLoader={<Spinner />}
            />
         </main>
      </>
   );
}
```

If your going to navigate to `/my-user-id`, it will look for the matching route, then import the file, then call the data loader function and waits for the response before displaying the element. You can use `useLocationStatus()` to handle loading state like the below example.

## With loading bar

```tsx
export default function Layout() {
   const status = useLocationStatus();
   const isFirstLoad = useFirstLoad();
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
      <>
         <Progress
            value={progress}
            hidden={progress === 0}
         />

         <header>
            <Link to="/">Dashboard</Link>
            <Link to="/my-user-id">User</Link>
         </header>

         <main>
            <Routes
               routes={routes}
               page404={<NotFound />}
               // show only the page loader at first load 
               // to freeze the current screen when navigating
               pageLoader={isFirstLoad ? <Spinner /> : undefind}
            />
         </main>
      </>
   );
}
```

## Components

* `Routes`

#### Props

```ts
interface RoutesProps {
   /**
    * @required
    * List of routes
    */
   routes: Route[];
   /**
    * @required
    * Default display if theres no matching route
    */
   page404: React.ReactNode;
   /**
    * @optional
    * Default display if location status is in pending state
    */
   pageLoader?: React.ReactNode;
}

interface Route {
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

* `useLocation` - Listens to location changes and returns the current location data.
* `useLocationStatus` - Listens to location status changes and returns the current location status. Statuses are `pending` and `loaded`.

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