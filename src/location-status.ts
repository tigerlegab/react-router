type LocationStatus = "pending" | "loaded";

let _status: LocationStatus = "pending";
let _subscribers = new Set<() => void>();

export const locationStatus = {
   current: () => _status as LocationStatus,
   subscribe: (callback: () => void) => {
      _subscribers.add(callback);
      return () => {
         _subscribers.delete(callback);
      }
   },
   setStatus: (status: LocationStatus) => {
      _status = status;
      _subscribers.forEach((callback) => {
         callback();
      });
   }
};