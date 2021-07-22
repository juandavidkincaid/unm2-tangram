import {ab2binstr, b64enc} from '.';

const downloadBase64 = async (base64Content: string, mime: string, filename: string) => {
    const element = document.createElement('a');
    element.setAttribute('href', `data:${mime};base64,${base64Content}`);
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

const downloadBlob = async (blob: Blob, filename: string) => {
    const content = b64enc(ab2binstr(await blob.arrayBuffer()));
    downloadBase64(content, blob.type, filename);
}

export {
    downloadBase64,
    downloadBlob,
    
}