import * as vscode from 'vscode';
import { logOutputChannel } from './log';

export function getConfiguration<T>(section: string, defaultValue?: T): T | undefined {
  if (!defaultValue) return vscode.workspace.getConfiguration('codescene-noace').get<T>(section);
  return vscode.workspace.getConfiguration('codescene-noace').get<T>(section, defaultValue);
}

export function setConfiguration(section: string, value: any) {
  const codesceneConfig = vscode.workspace.getConfiguration('codescene-noace');
  codesceneConfig.update(section, value).then(
    () => {},
    (err) => {
      logOutputChannel.error(`setConfiguration(${section}) failed: ${err}`);
    }
  );
}

export function onDidChangeConfiguration(
  section: string,
  listener: (e: { event: vscode.ConfigurationChangeEvent; value: any }) => any
) {
  return vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('codescene-noace.' + section)) {
      listener({ event: e, value: getConfiguration(section) });
    }
  });
}

/**
 * Get the configured URL of the CodeScene server.
 */
export function getServerUrl() {
  return getConfiguration<string>('serverUrl', 'https://codescene.io');
}

/**
 * Get the configured URL of the CodeScene Devtool Portal server.
 */
export function getPortalUrl() {
  return getConfiguration<string>('devtoolsPortalUrl', 'https://devtools.codescene.io');
}

export function reviewCodeLensesEnabled() {
  return getConfiguration<boolean>('enableReviewCodeLenses');
}

export function toggleReviewCodeLenses() {
  const state = reviewCodeLensesEnabled();
  setConfiguration('enableReviewCodeLenses', !state);
}
