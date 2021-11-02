/* phntimestamp v3.1 */

const PHNTimestamp = {
    get: (date_obj = new Date()) => {
        let timestamp = new Date(date_obj.toISOString().replace("Z", "")).getTime();
        return timestamp.toString(35).replace("-", "z");
    },
    parse: encoded_string => {
        const miliseconds_offset = new Date().getTimezoneOffset() * 60000;
        return new Date(parseInt(encoded_string.replace("z", "-"), 35) - miliseconds_offset);
    }
};