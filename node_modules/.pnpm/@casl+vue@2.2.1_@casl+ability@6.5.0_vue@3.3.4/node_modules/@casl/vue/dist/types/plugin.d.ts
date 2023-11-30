import { App } from 'vue';
import { AnyAbility } from '@casl/ability';
export interface AbilityPluginOptions {
    useGlobalProperties?: boolean;
}
export declare function abilitiesPlugin(app: App, ability: AnyAbility, options?: AbilityPluginOptions): void;
