import * as vscode from 'vscode';
import axios, { AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { sha256 } from 'js-sha256';

export default function(query: string) {
    const appId = vscode.workspace.getConfiguration().get("translation.youdao.appId");
    const password = vscode.workspace.getConfiguration().get("translation.youdao.appKey");
    const baseUrl = 'https://openapi.youdao.com/api';
    const salt = uuidv4();
    const from = 'en';
    const to = 'zh-CHS';
    const input = query.length <= 20 ? query : query.substring(0, 10) + query.length + query.substring(query.length - 10, query.length);
    const curTime = Math.round(new Date().getTime() / 1000);
    // const sign = sha256(应用ID+input+salt+curtime+应用密钥)；
    const sign = sha256(appId + input + salt + curTime + password);
    const url = encodeURI(`${baseUrl}?q=${query}&from=${from}&to=${to}&appKey=${appId}&salt=${salt}&sign=${sign}&signType=v3&curtime=${curTime}`);
    axios.get(url).then((response: AxiosResponse<Result>) => {
        if (response.status !== 200) {
            vscode.window.showErrorMessage(`翻译失败，请求失败，code=${response.status}`);
        } else if (!response.data) {
            vscode.window.showErrorMessage('翻译失败，服务端返回的数据为空');
        } else if (response.data.errorCode !== '0') {
            vscode.window.showErrorMessage(`翻译失败${response.data.errorCode ? `，errorCode=${response.data.errorCode}` : ''}`);
        } else if (!response.data.translation) {
            vscode.window.showErrorMessage('翻译失败，服务器返回的翻译结果为空');
        } else {
            vscode.window.showInformationMessage(response.data.translation[0] || '', '关闭');
        }
    }, (reason: any) => {
        vscode.window.showErrorMessage("翻译失败，" + JSON.stringify(reason));
    }).catch((reason: any) => {
        vscode.window.showErrorMessage("翻译失败，" + JSON.stringify(reason));
    });
}

interface Result {
    errorCode: string;
    query: string;
    translation: [string];
    basic: Basic;
    web: [{
        key: string;
        value: string;
    }];
    l: string;
    dict: {url: string};
    webdict: {url: string};
    tSpeakUrl: string;
    speakUrl: string;
    returnPhase: [];
}

interface Basic {
    phonetic: string;
    'uk-phonetic': string;
    'us-phonetic': string;
    'uk-speech': string;
    'us-speech': string;
     explains: [string];
}