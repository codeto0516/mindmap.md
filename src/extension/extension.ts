import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { resolveTheme } from "./theme";

const VIEW_TYPE = "mindmap.md.markdown";
const WEBVIEW_HTML_PATH = path.join("dist", "webview", "index-webview.html");

/**
 * 拡張の activate。Custom Text Editor を登録し、「マインドマップで開く」コマンドを登録する。
 */
export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(
      VIEW_TYPE,
      new MindMapCustomTextEditorProvider(context),
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("mindmap-md.openAsMindMap", () => {
      const uri = vscode.window.activeTextEditor?.document.uri;
      if (uri?.scheme === "file" && uri.fsPath.endsWith(".md")) {
        return vscode.commands.executeCommand(
          "vscode.openWith",
          uri,
          VIEW_TYPE
        );
      }
      return vscode.window.showInformationMessage(
        "マインドマップで開くには、.md ファイルを開いた状態で実行してください。"
      );
    })
  );
}

export function deactivate(): void {
  // クリーンアップは context.subscriptions で自動解除
}

/**
 * .md を TextDocument として扱い、Webview でマインドマップ UI（React）を表示するプロバイダ。
 */
class MindMapCustomTextEditorProvider
  implements vscode.CustomTextEditorProvider
{
  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): void {
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, "dist"),
      ],
    };

    const initialHtml = this.getWebviewHtml(webviewPanel.webview, document);
    webviewPanel.webview.html = initialHtml;

    let skipNextChangeForUri: vscode.Uri | undefined;

    const updateWebview = (): void => {
      webviewPanel.webview.postMessage({
        type: "init",
        text: document.getText(),
        theme: getThemeForWebview(),
      });
    };

    updateWebview();

    const changeSubscription = vscode.workspace.onDidChangeTextDocument(
      (e) => {
        if (e.document.uri.toString() !== document.uri.toString()) return;
        if (skipNextChangeForUri?.toString() === document.uri.toString()) {
          skipNextChangeForUri = undefined;
          return;
        }
        updateWebview();
      }
    );

    const themeSubscription = vscode.window.onDidChangeActiveColorTheme(() => {
      webviewPanel.webview.postMessage({
        type: "theme",
        theme: getThemeForWebview(),
      });
    });

    webviewPanel.onDidDispose(() => {
      changeSubscription.dispose();
      themeSubscription.dispose();
    });

    webviewPanel.webview.onDidReceiveMessage(
      (message: { type: string; text?: string }) => {
        if (message.type === "save" && typeof message.text === "string") {
          const edit = new vscode.WorkspaceEdit();
          const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(document.getText().length)
          );
          edit.replace(document.uri, fullRange, message.text);
          vscode.workspace.applyEdit(edit);
          skipNextChangeForUri = document.uri;
        }
      }
    );
  }

  /**
   * Webview 用の HTML。dist/webview の Vite ビルド結果を読み、アセットを asWebviewUri で差し替える。
   */
  private getWebviewHtml(webview: vscode.Webview, _document: vscode.TextDocument): string {
    const htmlPath = path.join(this.context.extensionPath, WEBVIEW_HTML_PATH);
    if (!fs.existsSync(htmlPath)) {
      return this.getFallbackHtml();
    }
    let html = fs.readFileSync(htmlPath, "utf-8");
    const webviewRoot = vscode.Uri.joinPath(this.context.extensionUri, "dist", "webview");
    const baseUri = webview.asWebviewUri(webviewRoot).toString().replace(/\/?$/, "/");
    const nonce = getNonce();

    html = html.replace(
      /\s(src|href)="(\/|\.\/)?assets\//g,
      ` $1="${baseUri}assets/`
    );

    const csp = [
      "default-src 'none'",
      `script-src 'nonce-${nonce}'`,
      `style-src 'nonce-${nonce}'`,
      `img-src ${webview.cspSource} data:`,
      "font-src 'none'",
      "connect-src 'none'",
    ].join("; ");
    const cspMeta = `<meta http-equiv="Content-Security-Policy" content="${csp}">`;
    html = html.replace("</head>", `${cspMeta}\n</head>`);
    html = html.replace(/\s(crossorigin)?\s*(src=)/g, ` nonce="${nonce}" $2`);
    html = html.replace(/\s(crossorigin)?\s*(href=)/g, ` nonce="${nonce}" $2`);

    return html;
  }

  private getFallbackHtml(): string {
    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>mindmap.md</title></head>
<body>
  <p>Webview を読み込めません。pnpm run build:webview を実行してください。</p>
</body>
</html>`;
  }
}

function getNonce(): string {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function getThemeForWebview(): "light" | "dark" {
  const config = vscode.workspace.getConfiguration("mindmap-md");
  const setting = config.get<"auto" | "light" | "dark">("theme", "auto");
  const kind = vscode.window.activeColorTheme.kind;
  return resolveTheme(setting, kind);
}
