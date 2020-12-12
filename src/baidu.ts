import * as vscode from 'vscode';
import axios, { AxiosResponse } from 'axios';
import { v4 as uuidv4} from 'uuid';
import { Md5 } from 'ts-md5';
import querystring = require('querystring');

export default function(query: string) {
    let appId = vscode.workspace.getConfiguration().get<string>("translation.baidu.appId");
    let appKey = vscode.workspace.getConfiguration().get<string>("translation.baidu.appKey");

    if (!appId || appKey) {
        appId = '20201210000643306';
        appKey = 'n3_scpwt0YR_tCY2wAfe';
    }

    const baseUrl = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

    const salt = uuidv4();

    const sign: string = Md5.hashStr(appId + query + salt + appKey).toString();

    const queryParams: querystring.ParsedUrlQueryInput = {
        q: query,
        from: 'en',
        to: 'zh',
        appid: appId,
        salt: salt,
        sign: sign
    };
    // eslint-disable-next-line @typescript-eslint/naming-convention
    axios.post(baseUrl, querystring.stringify(queryParams), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).then((response: AxiosResponse<Result>) => {
        if (response.status !== 200) {
            vscode.window.showErrorMessage(`无法翻译，网络请求错误，code=${response.status}`);
        } else if (!response.data) {
            vscode.window.showErrorMessage('翻译失败，服务端返回的数据为空');
        } else if (response.data.error_code && response.data.error_code !== 52000) {
            vscode.window.showErrorMessage(`翻译失败，error_code=${response.data.error_code}`);
        } else if (!response.data.trans_result) {
            vscode.window.showErrorMessage('翻译失败，服务端返回的翻译结果为空');
        } else {
            vscode.window.showInformationMessage(response.data.trans_result.reduce<string>((prev, cur) => {
                return  `${prev}\n${cur.dst}`;
            }, '') || '', '关闭');
        }
    }, (reason: any) => {
        vscode.window.showErrorMessage("翻译失败，" + JSON.stringify(reason));
    }).catch((reason: any) => {
        vscode.window.showErrorMessage("翻译失败，" + JSON.stringify(reason));
    });
}

interface Result {
    from?: string;
    to?: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'trans_result'?: [{src: string; dst: string;}];
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'error_code'?: number;
}