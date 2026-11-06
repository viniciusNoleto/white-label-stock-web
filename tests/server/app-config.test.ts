import express from 'express';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { injectPublicAppConfig, webManifest, withPublicAppConfig } from '../../src/server/app-config';
import { listen, type RunningServer } from './support/servers';

const SHELL = '<html><head><title>StockFlow</title></head><body><app-root></app-root></body></html>';

afterEach(() => {
  delete process.env['APP_NAME'];
});

describe('public app config', () => {
  it('injects window.__APP_CONFIG__ and replaces the default title', () => {
    const html = injectPublicAppConfig(SHELL, { appName: 'Almoxarifado' });

    expect(html).toContain('<title>Almoxarifado</title>');
    expect(html).toContain('<script>window.__APP_CONFIG__ = {"appName":"Almoxarifado"};</script></head>');
  });

  it('keeps a title already rendered by SSR', () => {
    const html = injectPublicAppConfig('<head><title>Login | Almoxarifado</title></head>', { appName: 'Almoxarifado' });

    expect(html).toContain('<title>Login | Almoxarifado</title>');
  });

  it('escapes the name in the title and in the script', () => {
    const html = injectPublicAppConfig(SHELL, { appName: '</script><b>"x"' });

    expect(html).toContain('<title>&lt;/script&gt;&lt;b&gt;&quot;x&quot;</title>');
    expect(html).toContain('{"appName":"\\u003c/script>\\u003cb>\\"x\\""}');
  });

  it('reads APP_NAME from the env, falling back to the default brand', async () => {
    const html = () => withPublicAppConfig(new Response(SHELL, { headers: { 'content-type': 'text/html; charset=utf-8', 'content-length': '1' } }));

    let response = await html();
    expect(await response.text()).toContain('{"appName":"StockFlow"}');
    expect(response.headers.get('content-length')).toBeNull();

    process.env['APP_NAME'] = '  Almoxarifado  ';
    response = await html();
    expect(await response.text()).toContain('<title>Almoxarifado</title>');
  });

  it('leaves non-HTML responses untouched', async () => {
    const original = new Response('{}', { headers: { 'content-type': 'application/json' } });

    expect(await withPublicAppConfig(original)).toBe(original);
  });
});

describe('web manifest', () => {
  let web: RunningServer;

  beforeAll(async () => {
    const dist = mkdtempSync(join(tmpdir(), 'manifest-'));
    writeFileSync(join(dist, 'site.webmanifest'), JSON.stringify({ name: 'StockFlow', short_name: 'StockFlow', theme_color: '#000' }));

    const app = express();
    app.get('/site.webmanifest', webManifest(dist));
    web = await listen(app);
  });

  afterAll(async () => {
    await web.close();
  });

  it('serves the manifest with the configured name', async () => {
    process.env['APP_NAME'] = 'Almoxarifado';

    const response = await fetch(`${web.url}/site.webmanifest`);

    expect(response.headers.get('content-type')).toContain('application/manifest+json');
    expect(await response.json()).toEqual({ name: 'Almoxarifado', short_name: 'Almoxarifado', theme_color: '#000' });
  });
});
