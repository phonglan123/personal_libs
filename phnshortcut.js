class PHNShortcut {
    constructor(elm, shortcuts) {
        if (typeof elm == "string")
            elm = document.querySelector(elm);
        elm.onkeydown = e => PHNShortcut.static_obj.onkeydown(PHNShortcut.static_obj.parse_event(e), e);
        elm.onkeyup = e => PHNShortcut.static_obj.onkeyup(PHNShortcut.static_obj.parse_event(e), e);
        PHNShortcut.static_obj.shortcuts = shortcuts;
    }

    static static_obj = {
        shortcuts: {},

        parse_event: e => {
            return {
                key: e.key,
                timestamp: parseInt(e.timeStamp),
                type: e.type
            }
        },
        parse_shortcut: shortcuts => {
            let return_result = {};

            shortcuts = shortcuts.split(" + ");
            shortcuts.forEach((shortcut, index) => shortcuts[index] = shortcut.split(":"));
            shortcuts.forEach(shortcut => {
                if (shortcut.length == 1)
                    return_result[shortcut[0]] = { action: "press" };
                else {
                    if (parseInt(shortcut[1]) != NaN)
                        return_result[shortcut[0]] = { action: "hold", hold_time: parseInt(shortcut[1]) };
                    if (shortcut[1] == "double")
                        return_result[shortcut[0]] = { action: "double" };
                }
            });

            return return_result;
        },
        compare_shortcut: (shortcut_event, shortcut_request) => {
            let flag = true;

            shortcut_request = Object.entries(PHNShortcut.static_obj.parse_shortcut(shortcut_request));

            for (let i = 0; i < shortcut_request.length; i++)
                if (!Object.keys(shortcut_event).includes(shortcut_request[i][0]))
                    flag = false;
                else {
                    let shortcut_in_event_obj = shortcut_event[shortcut_request[i][0]],
                        shortcut_in_request = shortcut_request[i][1];

                    if ((shortcut_in_event_obj.action != shortcut_in_request.action) && !(/double|hold/g.test(shortcut_in_event_obj.action) && shortcut_in_request.action == "press"))
                        flag = false;

                    if (shortcut_in_event_obj.action == "hold" && shortcut_in_event_obj.hold_time < shortcut_in_request.hold_time)
                        flag = false;
                }

            return flag;
        },

        current_key: {},
        previous_key: {},
        holding_key: {},

        onkeydown: (e_parsed, orginal_event) => {
            if (PHNShortcut.static_obj.holding_key[e_parsed.key] == undefined)
                PHNShortcut.static_obj.holding_key[e_parsed.key] = e_parsed.timestamp;
            else
                PHNShortcut.static_obj.process_key("hold", e_parsed.key, { hold_time: e_parsed.timestamp - PHNShortcut.static_obj.holding_key[e_parsed.key] }, orginal_event);
        },
        onkeyup: (e_parsed, orginal_event) => {
            let previous_key = PHNShortcut.static_obj.current_key,
                current_key = e_parsed;

            PHNShortcut.static_obj.previous_key = previous_key;
            PHNShortcut.static_obj.current_key = current_key;

            if (previous_key.key == current_key.key && current_key.timestamp - previous_key.timestamp < 500)
                PHNShortcut.static_obj.process_key("double", current_key.key, {}, orginal_event);
            else
                PHNShortcut.static_obj.process_key("press", current_key.key, {}, orginal_event);

            delete PHNShortcut.static_obj.holding_key[e_parsed.key];
        },
        process_key: (action, key_name, info = {}, orginal_event) => {
            let return_result = {},
                other_keys = JSON.parse(JSON.stringify(PHNShortcut.static_obj.holding_key));

            delete other_keys[key_name];
            other_keys = Object.keys(other_keys);
            other_keys.forEach(key => {
                return_result[key] = { action: "press" }
            });

            info.action = action;
            return_result[key_name] = info;

            PHNShortcut.static_obj.process_shortcut(return_result, orginal_event);
        },
        process_shortcut: (shortcut_event_obj, orginal_event) => {
            Object.entries(PHNShortcut.static_obj.shortcuts).forEach(shortcut_arr => {
                let compare_result = PHNShortcut.static_obj.compare_shortcut(shortcut_event_obj, shortcut_arr[0]);
                if (compare_result)
                    shortcut_arr[1](orginal_event);
            });
        }
    }
}