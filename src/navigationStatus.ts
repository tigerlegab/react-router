type NavigationStatus = "pending" | "loaded";

let _status: NavigationStatus = "pending";
let _subscribers = new Set<() => void>();

export const navigationStatus = {
   current: () => _status as NavigationStatus,
   subscribe: (callback: () => void) => {
      _subscribers.add(callback);
      return () => {
         _subscribers.delete(callback);
      }
   },
   setStatus: (status: NavigationStatus) => {
      _status = status;
      _subscribers.forEach((callback) => {
         callback();
      });
   }
};