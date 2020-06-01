import { Callback, ISubscription } from './isubscription';
export declare class Delegate<T1 = void, T2 = void> implements ISubscription<T1, T2> {
    private _listeners;
    subscribe(callback: Callback<T1, T2>, linkedObject?: object, singleshot?: boolean): void;
    unsubscribe(callback: Callback<T1, T2>): void;
    unsubscribeAll(linkedObject: object): void;
    fire(param1: T1, param2: T2): void;
    hasListeners(): boolean;
    destroy(): void;
}
