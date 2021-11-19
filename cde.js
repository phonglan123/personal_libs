CustomDecEncode = {
    Rixits: undefined,
    NegativeSign: undefined,
    PadChar: undefined,
    Base64Charset: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",

    set_charset: function (charset) {
        const split_at_index = (value, index) => { return [value.substring(0, index), value.substring(index)]; };

        let values = [];
        values = split_at_index(charset, charset.length - 2);
        values[1] = split_at_index(values[1], values[1].length - 1);
        values = values.flat();

        this.Rixits = values[0];
        this.NegativeSign = values[1];
        this.PadChar = values[2];

        return values;
    },

    from_number: function (number, minlength = 0) {
        let is_negative = false,
            rixit,
            residual = Math.floor(number),
            result = "",
            base = this.Rixits.length;

        if (number < 0) {
            is_negative = true;
            number = -number;
            residual = Math.floor(number);
        }

        while (true) {
            rixit = residual % base;
            result = this.Rixits.charAt(rixit) + result;
            residual = Math.floor(residual / base);

            if (residual == 0)
                break;
        }

        result = this.padding(minlength, result);
        return is_negative ? (this.NegativeSign + result) : result;
    },

    to_number: function (rixits) {
        let is_negative = false,
            result = 0,
            base = this.Rixits.length;

        rixits = rixits.replaceAll(this.PadChar, "");
        if (rixits.startsWith(this.NegativeSign)) {
            is_negative = true;
            rixits = rixits.replace(this.NegativeSign, "");
        }

        rixits.split("").forEach(char => result = (result * base) + this.Rixits.indexOf(char));

        return is_negative ? -result : result;
    },

    padding: function (minlength, rixits) {
        let pad_string = this.PadChar.repeat(minlength);
        return (pad_string + rixits).slice(-minlength);
    },

    test_working: function () {
        CustomDecEncode.set_charset(this.Base64Charset);
        let test_character = "ừ", // "ừ" is Vietnamese, and means "yes" in English ^^
            rixits = CustomDecEncode.from_number(test_character.charCodeAt(0), 4),
            charCode = CustomDecEncode.to_number(rixits),
            character = String.fromCharCode(charCode);
        return character == test_character;
    }
}

if (!CustomDecEncode.test_working()) CustomDecEncode = undefined;