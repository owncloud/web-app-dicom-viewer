import { TaskInstance } from "../TaskInstance";
import { Task } from "../Task";
export declare function reviveTaskInstance(instance: TaskInstance<any>): void;
export declare function useTaskPrefetch<T>(key: string, task: Task<T, any>): TaskInstance<T>;
export declare function useSSRPersistance(key: string, task: Task<any, any>): void;
