import { ProtocolApi } from 'chrome-remote-interface';
import Protocol from 'devtools-protocol';
import RequestPausedEvent = Protocol.Fetch.RequestPausedEvent;
import RequestPattern = Protocol.Fetch.RequestPattern;
import GetResponseBodyResponse = Protocol.Fetch.GetResponseBodyResponse;
import FrameNavigatedEvent = Protocol.Page.FrameNavigatedEvent;
import {
    injectResources,
    PageInjectableResources,
    INJECTABLE_SCRIPTS as HAMMERHEAD_INJECTABLE_SCRIPTS,
    SPECIAL_BLANK_PAGE,
} from 'testcafe-hammerhead';
import BrowserConnection from '../browser/connection';
import { SCRIPTS, TESTCAFE_UI_STYLES } from '../assets/injectables';
import ABOUT_BLANK_PAGE_MARKUP from './about-blank-page-markup';

const HTTP_STATUS_OK = 200;

const ALL_DOCUMENT_RESPONSES = {
    urlPattern:   '*',
    resourceType: 'Document',
    requestStage: 'Response',
} as RequestPattern;

export default class ResourceInjector {
    private readonly _browserId: string;

    public constructor (browserId: string) {
        this._browserId = browserId;
    }

    private _getResponseAsString (response: GetResponseBodyResponse): string {
        return response.base64Encoded
            ? Buffer.from(response.body, 'base64').toString()
            : response.body;
    }

    private _isServicePage (url: string): boolean {
        const browserConnection = BrowserConnection.getById(this._browserId) as BrowserConnection;
        const proxy             = browserConnection.browserConnectionGateway.proxy;

        return url.startsWith(proxy.server1Info.domain);
    }

    private async _prepareInjectableResources (): Promise<PageInjectableResources> {
        const browserConnection = BrowserConnection.getById(this._browserId) as BrowserConnection;
        const proxy             = browserConnection.browserConnectionGateway.proxy;
        const windowId          = browserConnection.activeWindowId;

        const taskScript = await browserConnection.currentJob.currentTestRun.session.getTaskScript({
            referer:     '',
            cookieUrl:   '',
            isIframe:    false,
            withPayload: true,
            serverInfo:  proxy.server1Info,
            windowId,
        });

        const injectableResources = {
            stylesheets: [
                TESTCAFE_UI_STYLES,
            ],
            scripts: [
                ...HAMMERHEAD_INJECTABLE_SCRIPTS,
                ...SCRIPTS,
            ],
            embeddedScripts: [taskScript],
        };

        injectableResources.scripts     = injectableResources.scripts.map(script => proxy.resolveRelativeServiceUrl(script));
        injectableResources.stylesheets = injectableResources.stylesheets.map(style => proxy.resolveRelativeServiceUrl(style));

        return injectableResources;
    }

    private async _handleHTTPPages (client: ProtocolApi): Promise<void> {
        await client.Fetch.enable({ patterns: [ALL_DOCUMENT_RESPONSES] });

        client.Fetch.on('requestPaused', async (params: RequestPausedEvent) => {
            const {
                requestId,
                responseHeaders,
                responseStatusCode,
            } = params;

            if (this._isServicePage(params.request.url))
                await client.Fetch.continueRequest({ requestId });
            else {
                const responseObj         = await client.Fetch.getResponseBody({ requestId });
                const responseStr         = this._getResponseAsString(responseObj);
                const injectableResources = await this._prepareInjectableResources();
                const updatedResponseStr  = injectResources(responseStr, injectableResources);

                await client.Fetch.fulfillRequest({
                    requestId,
                    responseCode:    responseStatusCode || HTTP_STATUS_OK,
                    responseHeaders: responseHeaders || [],
                    body:            Buffer.from(updatedResponseStr).toString('base64'),
                });
            }
        });
    }

    private _topFrameNavigationToAboutBlank (event: FrameNavigatedEvent): boolean {
        if (event.frame.url !== SPECIAL_BLANK_PAGE)
            return false;

        if (event.type !== 'Navigation')
            return false;

        if (event.frame.parentId)
            return false;

        return true;
    }

    private async _handleAboutBlankPage (client: ProtocolApi): Promise<void> {
        await client.Page.enable();

        client.Page.on('frameNavigated', async (params: FrameNavigatedEvent) => {
            if (!this._topFrameNavigationToAboutBlank(params))
                return;

            const injectableResources = await this._prepareInjectableResources();
            const html                = injectResources(ABOUT_BLANK_PAGE_MARKUP, injectableResources);

            await client.Page.setDocumentContent({
                frameId: params.frame.id,
                html,
            });
        });
    }

    public async setup (client: ProtocolApi): Promise<void> {
        await this._handleHTTPPages(client);
        await this._handleAboutBlankPage(client);
    }
}
