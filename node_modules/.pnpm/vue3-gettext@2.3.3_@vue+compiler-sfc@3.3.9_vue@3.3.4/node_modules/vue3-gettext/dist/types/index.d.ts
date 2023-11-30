import * as vue from 'vue';
import { ObjectDirective, UnwrapRef, WritableComputedRef, App } from 'vue';

/**
 * Translate content according to the current language.
 * @deprecated
 */
declare const Component: vue.DefineComponent<{
    tag: {
        type: StringConstructor;
        default: string;
    };
    translateN: {
        type: NumberConstructor;
        default: null;
    };
    translatePlural: {
        type: StringConstructor;
        default: null;
    };
    translateContext: {
        type: StringConstructor;
        default: null;
    };
    translateParams: {
        type: ObjectConstructor;
        default: null;
    };
    translateComment: {
        type: StringConstructor;
        default: null;
    };
}, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, unknown, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, Record<string, any>, string, vue.VNodeProps & vue.AllowedComponentProps & vue.ComponentCustomProps, Readonly<vue.ExtractPropTypes<{
    tag: {
        type: StringConstructor;
        default: string;
    };
    translateN: {
        type: NumberConstructor;
        default: null;
    };
    translatePlural: {
        type: StringConstructor;
        default: null;
    };
    translateContext: {
        type: StringConstructor;
        default: null;
    };
    translateParams: {
        type: ObjectConstructor;
        default: null;
    };
    translateComment: {
        type: StringConstructor;
        default: null;
    };
}>>, {
    tag: string;
    translateN: number;
    translatePlural: string;
    translateContext: string;
    translateParams: Record<string, any>;
    translateComment: string;
}>;

/**
 * A directive to translate content according to the current language.
 *
 * Use this directive instead of the component if you need to translate HTML content.
 * It's too tricky to support HTML content within the component because we cannot get the raw HTML to use as `msgid`.
 *
 * This directive has a similar interface to the <translate> component, supporting
 * `translate-comment`, `translate-context`, `translate-plural`, `translate-n`.
 *
 * `<p v-translate translate-comment='Good stuff'>This is <strong class='txt-primary'>Sparta</strong>!</p>`
 *
 * If you need interpolation, you must add an expression that outputs binding value that changes with each of the
 * context variable:
 * `<p v-translate="fullName + location">I am %{ fullName } and from %{ location }</p>`
 * @deprecated
 */
declare function directive(language: Language): ObjectDirective<HTMLElement, any>;

declare type TranslateComponent = typeof Component;
declare type TranslateDirective = ReturnType<typeof directive>;
declare type Message = string | string[];
declare type MessageContext = {
    [context: string]: Message;
};
declare type LanguageData = {
    [messageId: string]: Message | MessageContext;
};
declare type Translations = {
    [language: string]: LanguageData;
};
interface GetTextOptions {
    availableLanguages: {
        [key: string]: string;
    };
    defaultLanguage: string;
    mutedLanguages: Array<string>;
    silent: boolean;
    translations: Translations;
    setGlobalProperties: boolean;
    provideDirective: boolean;
    provideComponent: boolean;
}
declare type Language = UnwrapRef<{
    available: GetTextOptions["availableLanguages"];
    muted: GetTextOptions["mutedLanguages"];
    silent: GetTextOptions["silent"];
    translations: WritableComputedRef<GetTextOptions["translations"]>;
    current: string;
    $gettext: (msgid: string, parameters?: {
        [key: string]: string;
    }, disableHtmlEscaping?: boolean) => string;
    $pgettext: (context: string, msgid: string, parameters?: {
        [key: string]: string;
    }, disableHtmlEscaping?: boolean) => string;
    $ngettext: (msgid: string, plural: string, n: number, parameters?: {
        [key: string]: string;
    }, disableHtmlEscaping?: boolean) => string;
    $npgettext: (context: string, msgid: string, plural: string, n: number, parameters?: {
        [key: string]: string;
    }, disableHtmlEscaping?: boolean) => string;
    interpolate: (msgid: string, context: object, disableHtmlEscaping?: boolean) => string;
    install: (app: App) => void;
    directive: TranslateDirective;
    component: TranslateComponent;
}>;
interface GettextConfig {
    input: {
        /** only files in this directory are considered for extraction */
        path: string;
        /** glob patterns to select files for extraction */
        include: string[];
        /** glob patterns to exclude files from extraction */
        exclude: string[];
    };
    output: {
        path: string;
        locales: string[];
        potPath: string;
        jsonPath: string;
        flat: boolean;
        linguas: boolean;
        splitJson: boolean;
    };
}
interface GettextConfigOptions {
    input?: Partial<GettextConfig["input"]>;
    output?: Partial<GettextConfig["output"]>;
}
declare module "vue" {
    interface ComponentCustomProperties extends Pick<Language, "$gettext" | "$pgettext" | "$ngettext" | "$npgettext"> {
        $language: Language;
        $gettextInterpolate: Language["interpolate"];
    }
    interface GlobalComponents {
        translate: TranslateComponent;
    }
    interface GlobalDirectives {
        vTranslate: TranslateDirective;
    }
}

declare const useGettext: () => Language;

declare function createGettext(options?: Partial<GetTextOptions>): {
    available: {
        [key: string]: string;
    };
    muted: string[];
    silent: boolean;
    translations: Translations;
    current: string;
    $gettext: (msgid: string, parameters?: {
        [key: string]: string;
    } | undefined, disableHtmlEscaping?: boolean | undefined) => string;
    $pgettext: (context: string, msgid: string, parameters?: {
        [key: string]: string;
    } | undefined, disableHtmlEscaping?: boolean | undefined) => string;
    $ngettext: (msgid: string, plural: string, n: number, parameters?: {
        [key: string]: string;
    } | undefined, disableHtmlEscaping?: boolean | undefined) => string;
    $npgettext: (context: string, msgid: string, plural: string, n: number, parameters?: {
        [key: string]: string;
    } | undefined, disableHtmlEscaping?: boolean | undefined) => string;
    interpolate: (msgid: string, context: object, disableHtmlEscaping?: boolean | undefined) => string;
    install: (app: App<any>) => void;
    directive: {
        created?: vue.DirectiveHook<HTMLElement, null, any> | undefined;
        beforeMount?: vue.DirectiveHook<HTMLElement, null, any> | undefined;
        mounted?: vue.DirectiveHook<HTMLElement, null, any> | undefined;
        beforeUpdate?: vue.DirectiveHook<HTMLElement, vue.VNode<any, HTMLElement, {
            [key: string]: any;
        }>, any> | undefined;
        updated?: vue.DirectiveHook<HTMLElement, vue.VNode<any, HTMLElement, {
            [key: string]: any;
        }>, any> | undefined;
        beforeUnmount?: vue.DirectiveHook<HTMLElement, null, any> | undefined;
        unmounted?: vue.DirectiveHook<HTMLElement, null, any> | undefined;
        getSSRProps?: ((binding: vue.DirectiveBinding<any>, vnode: vue.VNode<vue.RendererNode, vue.RendererElement, {
            [key: string]: any;
        }>) => {
            [x: string]: unknown;
        } | undefined) | undefined;
        deep?: boolean | undefined;
    };
    component: vue.DefineComponent<{
        tag: {
            type: StringConstructor;
            default: string;
        };
        translateN: {
            type: NumberConstructor;
            default: null;
        };
        translatePlural: {
            type: StringConstructor;
            default: null;
        };
        translateContext: {
            type: StringConstructor;
            default: null;
        };
        translateParams: {
            type: ObjectConstructor;
            default: null;
        };
        translateComment: {
            type: StringConstructor;
            default: null;
        };
    }, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
        [key: string]: any;
    }>, unknown, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, Record<string, any>, string, vue.VNodeProps & vue.AllowedComponentProps & vue.ComponentCustomProps, Readonly<vue.ExtractPropTypes<{
        tag: {
            type: StringConstructor;
            default: string;
        };
        translateN: {
            type: NumberConstructor;
            default: null;
        };
        translatePlural: {
            type: StringConstructor;
            default: null;
        };
        translateContext: {
            type: StringConstructor;
            default: null;
        };
        translateParams: {
            type: ObjectConstructor;
            default: null;
        };
        translateComment: {
            type: StringConstructor;
            default: null;
        };
    }>>, {
        tag: string;
        translateN: number;
        translatePlural: string;
        translateContext: string;
        translateParams: Record<string, any>;
        translateComment: string;
    }>;
};
declare const defineGettextConfig: (config: GettextConfigOptions) => GettextConfigOptions;

export { GetTextOptions, GettextConfig, GettextConfigOptions, Language, LanguageData, Message, Translations, createGettext, defineGettextConfig, useGettext };
