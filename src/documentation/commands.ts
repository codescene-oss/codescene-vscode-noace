import * as vscode from 'vscode';
import { DeltaFunctionInfo, DeltaIssue } from '../code-health-monitor/tree-model';
import { CodeSceneTabPanel } from '../codescene-tab/webview-panel';
import Telemetry from '../telemetry';

export function register(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'codescene-noace.openInteractiveDocsPanel',
      (params: InteractiveDocsParams, source: string) => {
        Telemetry.logUsage('openInteractiveDocsPanel', { source, category: params.issueInfo.category });
        CodeSceneTabPanel.show(params);
      }
    ),
    // A query param friendly version of openInteractiveDocsPanel
    vscode.commands.registerCommand('codescene-noace.openInteractiveDocsFromDiagnosticTarget', async (queryParams) => {
      const { category, lineNo, charNo, documentUri } = queryParams;
      Telemetry.logUsage('openInteractiveDocsPanel', { source: 'diagnostic-item', category });
      const params: InteractiveDocsParams = {
        issueInfo: { category, position: new vscode.Position(lineNo, charNo) },
        document: await findOrOpenDocument(documentUri),
      };
      CodeSceneTabPanel.show(params);
    }),
    vscode.commands.registerCommand('codescene-noace.openCodeHealthDocs', () => {
      Telemetry.logUsage('openCodeHealthDocs');
      void vscode.env.openExternal(vscode.Uri.parse('https://codescene.io/docs/guides/technical/code-health.html'));
    })
  );
}

async function findOrOpenDocument(uri: vscode.Uri) {
  let document = vscode.workspace.textDocuments.find((doc) => doc.uri.toString() === uri.toString());
  if (!document) {
    document = await vscode.workspace.openTextDocument(uri);
  }
  return document;
}

export interface IssueInfo {
  category: string;
  position?: vscode.Position;
  fnName?: string;
}

export interface InteractiveDocsParams {
  issueInfo: IssueInfo;
  document: vscode.TextDocument;
}

export function isInteractiveDocsParams(obj: unknown): obj is InteractiveDocsParams {
  if (!obj) return false;
  if (typeof obj === 'object') {
    Object.hasOwnProperty.call(obj, 'issueInfo');
    return obj.hasOwnProperty('issueInfo') && obj.hasOwnProperty('document');
  }
  return false;
}

export function issueToDocsParams(issue: DeltaIssue, fnInfo?: DeltaFunctionInfo) {
  const params = toDocsParams(issue.changeDetail.category, issue.parentDocument, issue.position);
  params.issueInfo.fnName = fnInfo?.fnName;
  return params;
}

export function toDocsParams(
  category: string,
  document: vscode.TextDocument,
  position?: vscode.Position,
): InteractiveDocsParams {
  return { issueInfo: { category, position }, document };
}

export function categoryToDocsCode(issueCategory: string) {
  return issueCategory.replace(/ /g, '-').replace(/,/g, '').toLowerCase();
}
