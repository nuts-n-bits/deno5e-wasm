export type Chamber = Map<Language_code, string>
export type Raw_input = Array<[Language_code, string]>
export type Language_code = keyof typeof language_code_definition

const language_code_definition = {
    "ar": true, "ar-eg": true, "ar-sa": true,
    "de": true, "de-at": true, "de-ch": true, "de-de": true, "de-li": true,
    "en": true, "en-au": true, "en-ca": true, "en-hk": true, "en-nz": true, "en-sg": true, "en-us": true, "en-uk": true,
    "es": true, "es-cl": true, "es-es": true, "es-mx": true, "es-pr": true,
    "fi": true, "fi-fi": true, 
    "fr": true, "fr-fr": true, "fr-ch": true,
    "it": true, "it-it": true,
    "ja": true, "ja-jp": true, 
    "ko": true, "ko-kr": true, 
    "nl": true, "nl-nl": true, 
    "no": true, "no-no": true, 
    "pl": true, "pl-pl": true, 
    "pt": true, "pt-br": true, "pt-pt": true,
    "sv": true, "sv-se": true, "sv-fi": true,
    "zh": true, "zh-cn": true, "zh-hk": true, "zh-mo": true, "zh-sg": true, "zh-tw": true,
}

export function concrete_check_string_is_language_code(string: string|null|undefined): Language_code | null {
    if (string === null || string === undefined) { return null }
    else if (language_code_definition[string as Language_code]) { return string as Language_code }
    else { return null }
}

export function best_fit_chamber_content(requested_codes: Language_code[], chamber: Chamber): string | null {

    for (const code of requested_codes) {
        const try_1 = chamber.get(code)
        if (try_1 !== undefined) { return try_1 }
        const short_code = concrete_check_string_is_language_code(code.split("-")[0])
        if (short_code === null) { return null }
        const try_2 = chamber.get(short_code)
        if (try_2 !== undefined) { return try_2 }
    }

    return null
}

export function mlc(requested_codes: string[], chamber: Chamber): string {

    const filtered_codes = requested_codes.filter(candidate => concrete_check_string_is_language_code(candidate) !== null) as Language_code[]
    // if the chamber contains (one of) the language results in requested codes from accept-language header, return that result (preferred outcome)
    const try_1 = best_fit_chamber_content(filtered_codes, chamber)
    if (try_1 !== null) { return try_1 }
    else {
        // if the chamber has nothing acceptable by the client, return en-us, then en as default fallback
        const try_2 = chamber.get("en-us")
        if (try_2 !== undefined) { return try_2 }
        const try_3 = chamber.get("en")
        if (try_3 !== undefined) { return try_3 }
        else { 
            // if neither en nor en-us exist, use whatever code available in the chamber.
            const try_4 = [...chamber.entries()][0]
            if (try_4 !== undefined) { return try_4[1] }
            // if there is no code in that chamber (which would be pretty weird), return "--"
            else { return "--" }
        }
    }
}

export function language_list_from_header(accept_language_header: string) {

    // "fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5"
    const list = accept_language_header.toLowerCase().split(",").map(x => x.split(";")[0].trim())
    //[ 'fr-ch', 'fr', 'en', 'de', '*' ]

    return list
}

export function complete_chamber(original_chamber: Raw_input): Chamber {

    const cc: Chamber = new Map()

    for (let [k, v] of original_chamber) {
        const partial = concrete_check_string_is_language_code(k.split("-")[0])
        if (partial !== null && cc.get(partial) === undefined) { cc.set(partial, v) }
        cc.set(k, v)
    }

    return cc

}