import {b64dec, b64enc} from '.';

const binstr2ab = (binStr: string)=>{
    const len = binStr.length;
    const buffer = new ArrayBuffer(len);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < len; i++) {
        view[i] = binStr.charCodeAt(i);
    }
    return buffer;
}

const ab2binstr = (buffer: ArrayBuffer)=>{
    const len = buffer.byteLength;
    const binStrParts: string[] = [];
    const view = new Uint8Array(buffer);
    for (let i = 0; i < len; i++) {
        binStrParts.push(String.fromCharCode(view[i]));
    }
    return binStrParts.join('');
}

const encodePEM = (data: string, label: string)=>{
    const preeb = (label: string) => "-----BEGIN " + label + "-----";
    const posteb = (label: string) => "-----END " + label + "-----";
    
    const dataLines = (data: string) => {
        const charsPerLine = 64;
        const lines: string[] = [];
        let linen = 0;
        
        while(true){
            const line = data.substring(linen * charsPerLine, (linen * charsPerLine) + charsPerLine);
            if(line === ''){
                break;
            }
            lines.push(line);
            linen++;
        }

        return lines.join(`\n`);
    };
    
    return `${preeb(label)}\n${dataLines(data)}\n${posteb(label)}`;
}


const decodePEM = (pemEncoded: string)=>{
    const pemRegex = /-----BEGIN ([\w\s]+)-----\n((?:[\w+=/]+\n)+)-----END \1-----\n?/;
    const match = pemRegex.exec(pemEncoded);

    if(match){
        return [match[2].replace(/\n/g, ''), match[1]] as [string, string];
    }
    throw new Error("PEM parsing error");
}

const getDERfromPEM = (pemEncoded: string)=>{
    const [derEncoded, label] = decodePEM(pemEncoded);
    const derBinStr = b64dec(derEncoded);
    return [binstr2ab(derBinStr), label] as [ArrayBuffer, string];
}

const getPEMfromDER = (derBuffer: ArrayBuffer, label: string)=>{
    const derBinStr = ab2binstr(derBuffer);
    const derEncoded = b64enc(derBinStr);
    return encodePEM(derEncoded, label);
}

const generateRSAOAEPKeyPair = async (size: number, hash: string)=>{
    const pair = await crypto.subtle.generateKey({
        name: 'RSA-OAEP',
        modulusLength: size,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: hash
    }, true, ["encrypt", "decrypt"]);
    return [pair.privateKey, pair.publicKey] as [CryptoKey, CryptoKey];
}

const importRSAOAEPPrivateKey = async (pemEncoded: string, hash: string)=>{
    const [derBuffer] = getDERfromPEM(pemEncoded);

    return await crypto.subtle.importKey("pkcs8", derBuffer, {
        name: "RSA-OAEP",
        hash: {
            name: hash
        }
    }, true, ["decrypt"]);
}

const exportRSAOAEPPrivateKey = async (key: CryptoKey)=>{
    const derBuffer = await crypto.subtle.exportKey("pkcs8", key);
    const pem = getPEMfromDER(derBuffer, "RSA PRIVATE KEY");
    return pem;
}

declare global{
    interface Window{
        tangramcrypto: {
            generateRSAOAEPKeyPair: typeof generateRSAOAEPKeyPair,
            importRSAOAEPPrivateKey: typeof importRSAOAEPPrivateKey,
            exportRSAOAEPPrivateKey: typeof exportRSAOAEPPrivateKey,
        }
    }
}

if(process.env.NODE_ENV === 'development'){
    window.tangramcrypto = {
        generateRSAOAEPKeyPair,
        importRSAOAEPPrivateKey,
        exportRSAOAEPPrivateKey
    }
}

export {
    binstr2ab,
    ab2binstr,
    encodePEM,
    decodePEM,
    getDERfromPEM,
    getPEMfromDER,
    generateRSAOAEPKeyPair,
    importRSAOAEPPrivateKey,
    exportRSAOAEPPrivateKey
}