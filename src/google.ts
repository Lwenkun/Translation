import {v2}  from '@google-cloud/translate';
import axios, { AxiosResponse } from 'axios';
import * as vscode from 'vscode';

export default function(query: string) {
    const key = vscode.workspace.getConfiguration().get<string>('translation.google.apiKey');
    if (key) {
        const translate = new v2.Translate({key});
        translate.translate(query, { from: 'en', to: 'zh-CN', }).then((value: [string, any]) => {
            if (!value || !value[0]) {
                vscode.window.showErrorMessage('翻译失败，服务器返回的翻译结果为空');
            } else {
                vscode.window.showInformationMessage(value[0], '关闭');
            }
        }, (reason: any) => {
            vscode.window.showErrorMessage("翻译失败，" + JSON.stringify(reason));
        }).catch((reason: any) => {
            vscode.window.showErrorMessage("翻译失败，" + JSON.stringify(reason));
        });
    } else {
        const url = `http://translate.google.cn/translate_a/single?client=gtx&dt=t&dj=1&ie=UTF-8&sl=en&tl=zh-CN&q=${query}`;
        axios.get(url).then((response: AxiosResponse<Result>) => {
            if (response.status !== 200) {
                vscode.window.showErrorMessage(`翻译失败，请求失败，code=${response.status}`);
            } else if (!response.data) {
                vscode.window.showErrorMessage('翻译失败，服务端返回的数据为空');
            } else if (!response.data.sentences || response.data.sentences.length === 0) {
                vscode.window.showErrorMessage('翻译失败，服务器返回的翻译结果为空');
            } else {
                const result = response.data.sentences.reduce<string>((prev: string, curr: {trans: string; orig: string}) => {
                    return `${prev}${curr.trans}`;
                }, '');
                vscode.window.showInformationMessage(result, '关闭');
            }
        }, (reason: any) => {
            vscode.window.showErrorMessage("翻译失败，" + JSON.stringify(reason));
        }).catch((reason: any) => {
            vscode.window.showErrorMessage("翻译失败，" + JSON.stringify(reason));
        });
    }
}

interface Result {
    sentences: Array<{trans: string, orig: string}>;
    src: string;
    spell: {};
}