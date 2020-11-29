import {v2}  from '@google-cloud/translate';
import { stringify } from 'querystring';
import * as vscode from 'vscode';

export default function(query: string) {
    const translate = new v2.Translate({key : vscode.workspace.getConfiguration().get('translation.google.apiKey')});
    translate.translate(query, {from: 'en', to: 'zh-CN', }).then((value: [string, any]) => {
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
}