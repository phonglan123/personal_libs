function KeywordFromStringOrHtml(string_or_html, maincontent_queryselector) {
    const
        word_counter = (string = "", phnmode_only_keywords = false) => {
            const
                escape_regex = string => string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'),
                string_count_char = (string, char) => { return (string.match(new RegExp(char, "g")) || []).length },
                arr_avarage = arr => arr.reduce((p, c, i) => p + (c - p) / (i + 1), 0),
                number_betwwen = (number, start, end) => number >= start && number <= end,
                lowercase_obj = obj => {
                    let
                        key,
                        keys = Object.keys(obj),
                        n = keys.length,
                        newobj = {}
                    while (n--) {
                        key = keys[n];
                        newobj[key.toLowerCase()] = obj[key];
                    }
                    return newobj;
                };

            if (phnmode_only_keywords)
                string = string.replace(/[\“\”\-\–\·\•\^&\/\\#,+()$~%.'":;*?<>{}0-9]/g, "").replace(/\n/g, " ").replace(/\s{2,}/g, " ");

            let words_array = string.split(" "),
                return_result = {};

            // Default return when string is empty or has only one word
            if (string == "")
                return {};
            else if (words_array.length == 1)
                return (string => {
                    return_result[string] = 1;
                    return return_result;
                })(string);

            // Counting words in string
            for (let i = 0; i < words_array.length; i++) {
                let temp_array = [],
                    temp_string = "";

                for (let j = i; j < words_array.length; j++) {
                    temp_array.push(words_array[j]);
                    temp_string = temp_array.join(" ");

                    let word_count = string_count_char(string, escape_regex(temp_string)),
                        acceptable_word = temp_array.length == 1 || (temp_array.length > 1 && word_count > 2);
                    if (word_count != undefined && acceptable_word)
                        return_result[temp_string] = word_count;
                    else
                        break;
                }
            }

            delete return_result[""];
            delete return_result[" "];

            if (phnmode_only_keywords) {
                let keywords = Object.keys(return_result),
                    keywords_average = arr_avarage(Object.values(return_result));

                keywords.forEach(keyword => {
                    let keyword_length = keyword.split(" ").length;
                    if (keyword_length == 1 || (return_result[keyword] < keywords_average && !number_betwwen(keyword_length, 4, 8)))
                        delete return_result[keyword];
                });

                for (let i = 0; i < keywords.length; i++)
                    for (let j = 0; j < keywords.length; j++)
                        if (keywords[i].includes(keywords[j]) && i != j) {
                            let first_keyword = return_result[keywords[i]],
                                second_keyword = return_result[keywords[j]];
                            if (first_keyword < second_keyword)
                                delete return_result[keywords[i]];
                            else
                                delete return_result[keywords[j]];
                        }

                return_result = lowercase_obj(return_result);
                return_result = Object.keys(return_result);
            }

            return return_result;
        },
        get_metatag = (request_param, dom = document) => {
            let request_list = request_param,
                return_result = {};

            if (request_param == undefined || request_param == "phnmode_only_keywords")
                request_list = ["keywords", "news_keywords", "description", "tt_list_folder_name", "og:site_name", "og:title", "og:description", "article:tag", "medium", "source", "copyright", "author", "geo.placename", "geo.region", "twitter:title", "twitter:description", "its_title", "its_section", "its_subsection", "its_tag", "its_topic"];
            else if (typeof request_param == "string")
                request_list = [request_param];

            request_list.forEach(metatag_name => {
                let metatag = dom.querySelector("meta[name='" + metatag_name + "']") || dom.querySelector("meta[property='" + metatag_name + "']")
                if (metatag != undefined && metatag.content != undefined)
                    return_result[metatag_name] = metatag.content;
            });

            if (request_param == "phnmode_only_keywords") {
                let temp_return_result = {};

                Object.values(return_result).forEach(metatag_value => temp_return_result[metatag_value.toLowerCase()] = undefined);
                delete temp_return_result[""];
                temp_return_result = Object.keys(temp_return_result);

                temp_return_result.forEach((elm, index) => temp_return_result[index] = elm.split(", "));
                temp_return_result = temp_return_result.flat();
                temp_return_result.forEach((elm, index) => temp_return_result[index] = elm.split(","));
                temp_return_result = temp_return_result.flat();

                for (let i = 0; i < temp_return_result.length; i++)
                    for (let j = 0; j < temp_return_result.length; j++)
                        if (temp_return_result[i] != undefined
                            && temp_return_result[j] != undefined
                            && temp_return_result[i].includes(temp_return_result[j])
                            && i != j)
                            delete temp_return_result[j];

                return_result = temp_return_result.filter(n => n);
            }

            return return_result;
        },
        dom_parser = html_string => {
            let elm = document.createElement("html");
            elm.innerHTML = html_string;
            return elm;
        };

    if (maincontent_queryselector == undefined) {
        maincontent_queryselector = "div";
        string_or_html = "<div>" + string_or_html + "</div>";
    }

    let dom = dom_parser(string_or_html.replace("<!DOCTYPE html>", "")),
        keywords = [],
        keywords_from_metatag = get_metatag("phnmode_only_keywords", dom),
        keywords_from_maincontent = word_counter(dom.querySelector(maincontent_queryselector).innerText.toLowerCase(), true);
    keywords = [keywords_from_metatag, keywords_from_metatag, keywords_from_maincontent];
    keywords = keywords.flat();
    if (dom.querySelector("title") != undefined && !keywords.includes(dom.querySelector("title").innerText.toLowerCase())) keywords.push(dom.querySelector("title").innerText.toLowerCase());

    Object.setPrototypeOf(keywords,
        Object.assign(Object.getPrototypeOf(keywords), {
            WordCounterFromString: word_counter,
            GetMetatagFromDOM: get_metatag
        })
    );

    return keywords;
}