import { Task } from "./Task";
export declare function usePipeTask<T, U extends any[]>(firstTask: Task<any, U>, ...restTasks: Task<any, any>[]): Task<T, U>;
export declare function useParallelTask(...tasks: Task<any, any>[]): Task<any[], any>;
export declare function useSequentialTask<U extends any[]>(...tasks: Task<any, any>[]): Task<any, U>;
