/* 
    Depends on JSEncrypt and CryptoJS:
        <script src="./jsencrypt.min.js"></script>
        <script src="./crypto-js.min.js"></script>
        <script src="./phnsignature.js"></script>
*/

let PHNSignature = (() => {
    function sign(string, info, keypair) {
        if (keypair == undefined)
            keypair = (() => {
                let jsencrypt = new JSEncrypt();
                return {
                    public: jsencrypt.getPublicKey(),
                    private: jsencrypt.getPrivateKey()
                };
            })();

        let sign = new JSEncrypt(),
            signature = null,
            return_result = null,
            info_b64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify(info)));

        sign.setPrivateKey(keypair.private);
        signature = sign.sign(JSON.stringify({ info: JSON.stringify(info), string: string }), CryptoJS.SHA512, "sha512");

        return_result = signature + "|" + info_b64 + "|" + keypair.public.replace("-----BEGIN PUBLIC KEY-----\n", "").replace("\n-----END PUBLIC KEY-----", "");
        return_result = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(return_result));

        return return_result;
    }

    function verify(string, signature) {
        signature = CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(signature));
        signature = signature.split("|");
        signature[1] = CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(signature[1]));

        let verify = new JSEncrypt(),
            verified = null;

        verify.setPublicKey(signature[2]);
        verified = verify.verify(JSON.stringify({ info: signature[1], string: string }), signature[0], CryptoJS.SHA512);

        return { valid: verified, info: JSON.parse(signature[1]) };
    }

    function sign_pdf(file_selector, info, callback) {
        const file_download = (filename, text) => {
            let element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            element.setAttribute('download', filename);

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        };

        let file = file_selector.files[0],
            reader = new FileReader();

        reader.readAsText(file, "UTF-8");
        reader.onload = e => {
            let
                signature = PHNSignature.sign(e.target.result, info),
                new_file = e.target.result + "\n[START_PHNSignature]" + signature + "[END_PHNSignature]";
            callback(new_file, file.name, file_download);
        }
    }

    function verify_pdf(file_selector, callback) {
        let file = file_selector.files[0],
            reader = new FileReader();

        reader.readAsText(file, "UTF-8");
        reader.onload = e => {
            let signature = "",
                document_content = e.target.result.replace(/\n\[START_PHNSignature\].*\[END_PHNSignature\]/, exported_signature => {
                    signature = exported_signature.replace("\n[START_PHNSignature]", "").replace("[END_PHNSignature]", "");
                    return "";
                });
            try {
                let verified = PHNSignature.verify(document_content, signature);
                if(verified.valid)
                    callback(true, verified.info);
                else
                    callback(false, "Wrong signature!");
            } catch (error) {
                callback(false, error);
            }
        }
    }

    /*

    function sign() {
        let file_selector = document.querySelector("#sign_pdf_selector");
        PHNSignature.sign_pdf(file_selector, {
            file_signtime: PHNTimestamp.get(),
            file_lastmodified: PHNTimestamp.get(file_selector.lastModifiedDate),
            note: document.querySelector("#sign_pdf_note").value
        }, (new_file, file_name, file_download) => {
            file_download(file_name.replace(".pdf", "-signed.pdf"), new_file);
        });
    }

    function verify() {
        let file_selector = document.querySelector("#verify_pdf_selector");
        PHNSignature.verify_pdf(file_selector, (valid, return_value) => {
            if (!valid) {
                alert("Đã xảy ra lỗi! Có thể là do không có chữ kí hoặc chữ kí sai, đã bị sửa đổi. Lỗi cụ thể: " + return_value);
                console.error(return_value);
            } else
                print_verified(return_value);
        });
    }

    function print_verified(info) {
        document.querySelector("#printed").innerHTML = 
            "Thời gian kí: " + PHNTimestamp.parse(info.file_signtime)
            + "<br/>" +
            "Lần sửa đổi cuối: " + PHNTimestamp.parse(info.file_lastmodified)
            + "<br/>" +
            "Ghi chú: " + info.note;
    }

    */

    return { sign, verify, sign_pdf, verify_pdf };
})();