// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import youdao from './youdao';
import baidu from './baidu';
import google from './google';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerTextEditorCommand("translation.translate", (textEditor: vscode.TextEditor) => {
        const q = textEditor.document.getText(textEditor.selection);
        const provider = vscode.workspace.getConfiguration().get<string>('translation.provider');
        if (provider === 'baidu') {
			baidu(q);
        } else if (provider === 'youdao') {
            youdao(q);
        } else if (provider === 'google') {
			google(q);
		}
    }));
    context.subscriptions.push(vscode.commands.registerCommand('translation.changeProvider', () => {
        const provider = <string> vscode.workspace.getConfiguration().get<string>('translation.provider');
        const providers = [
            ["baidu", "百度"],
            ["youdao", "有道"],
            ["google", "谷歌"]
        ];
        const index = providers.findIndex((value: string[]) => {
            return provider === value[0];
        });
        const nextProvider = providers[(index + 1) % providers.length];
        vscode.workspace.getConfiguration().update('translation.provider', nextProvider[0], vscode.ConfigurationTarget.Global).then(() => {
            vscode.window.setStatusBarMessage(`已更换为${nextProvider[1]}翻译`, 2000);
        }, () => {
            vscode.window.setStatusBarMessage('切换翻译服务失败', 2000);
        });
    }));
}

// this method is called when your extension is deactivated
export function deactivate() {

}
