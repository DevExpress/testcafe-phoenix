import promisifyEvent from 'promisify-event';
import { readSync as read } from 'read-file-relative';
import { respond404, respond500, respondWithJSON, redirect, preventCaching } from '../../utils/http';
import RemotesQueue from './remotes-queue';
import { Proxy } from 'testcafe-hammerhead';
import { Dictionary } from '../../configuration/interfaces';
import BrowserConnection from './index';
import { IncomingMessage, ServerResponse } from 'http';
import SetupWindowResult from './setup-window-result';

const IDLE_PAGE_SCRIPT = read('../../client/browser/idle-page/index.js');
const IDLE_PAGE_STYLE  = read('../../client/browser/idle-page/styles.css');
const IDLE_PAGE_LOGO   = read('../../client/browser/idle-page/logo.svg', true);

export default class BrowserConnectionGateway {
    private _connections: Dictionary<BrowserConnection> = {};
    private _remotesQueue: RemotesQueue;
    public readonly domain: string;
    public readonly connectUrl: string;
    public retryTestPages: boolean;

    public constructor (proxy: Proxy, options: { retryTestPages: boolean }) {
        this._remotesQueue   = new RemotesQueue();
        // @ts-ignore Need to improve typings of the 'testcafe-hammerhead' module
        this.domain          = (proxy as any).server1Info.domain;
        this.connectUrl      = `${this.domain}/browser/connect`;
        this.retryTestPages  = options.retryTestPages;

        this._registerRoutes(proxy);
    }

    private _dispatch (url: string, proxy: Proxy, handler: Function, method = 'GET'): void {
        // @ts-ignore Need to improve typings of the 'testcafe-hammerhead' module
        proxy[method](url, (req: IncomingMessage, res: ServerResponse, serverInfo, params: Dictionary<string>) => {
            const connection = this._connections[params.id];

            preventCaching(res);

            if (connection)
                handler(req, res, connection);
            else
                respond404(res);
        });
    }

    private _registerRoutes (proxy: Proxy): void {
        this._dispatch('/browser/connect/{id}', proxy, BrowserConnectionGateway._onConnection);
        this._dispatch('/browser/heartbeat/{id}', proxy, BrowserConnectionGateway._onHeartbeat);
        this._dispatch('/browser/idle/{id}', proxy, BrowserConnectionGateway._onIdle);
        this._dispatch('/browser/idle-forced/{id}', proxy, BrowserConnectionGateway._onIdleForced);
        this._dispatch('/browser/status/{id}', proxy, BrowserConnectionGateway._onStatusRequest);
        this._dispatch('/browser/status-done/{id}', proxy, BrowserConnectionGateway._onStatusRequestOnTestDone);
        this._dispatch('/browser/init-script/{id}', proxy, BrowserConnectionGateway._onInitScriptRequest);
        this._dispatch('/browser/init-script/{id}', proxy, BrowserConnectionGateway._onInitScriptResponse, 'POST');
        this._dispatch('/browser/active-window-id/{id}', proxy, BrowserConnectionGateway._onGetActiveWindowIdRequest);
        this._dispatch('/browser/active-window-id/{id}', proxy, BrowserConnectionGateway._onSetActiveWindowIdRequest, 'POST');
        this._dispatch('/browser/set-up-window/{id}', proxy, BrowserConnectionGateway._onSetupWindow, 'POST');

        proxy.GET('/browser/connect', (req: IncomingMessage, res: ServerResponse) => this._connectNextRemoteBrowser(req, res));
        proxy.GET('/browser/connect/', (req: IncomingMessage, res: ServerResponse) => this._connectNextRemoteBrowser(req, res));

        proxy.GET('/browser/assets/index.js', { content: IDLE_PAGE_SCRIPT, contentType: 'application/x-javascript' });
        proxy.GET('/browser/assets/styles.css', { content: IDLE_PAGE_STYLE, contentType: 'text/css' });
        proxy.GET('/browser/assets/logo.svg', { content: IDLE_PAGE_LOGO, contentType: 'image/svg+xml' });
    }

    // Helpers
    private static _ensureConnectionReady (res: ServerResponse, connection: BrowserConnection): boolean {
        if (!connection.isReady()) {
            respond500(res, 'The connection is not ready yet.');
            return false;
        }

        return true;
    }

    private static _fetchRequestData (req: IncomingMessage, callback: (data: string) => void): void {
        let data = '';

        req.on('data', chunk => {
            data += chunk;
        });

        req.on('end', () => {
            callback(data.toString());
        });
    }

    // Route handlers
    private static async _onConnection (req: IncomingMessage, res: ServerResponse, connection: BrowserConnection): Promise<void> {
        if (connection.isReady())
            respond500(res, 'The connection is already established.');

        else {
            const userAgent = req.headers['user-agent'] as string;

            connection.establish(userAgent);

            if (connection.permanent)
                redirect(res, connection.idleUrl);
            else {
                if (connection.provider.plugin.connectedWithDebugProtocol) {
                    promisifyEvent(connection.provider.plugin, connection.provider.plugin.CONNECTED_EVENT_NAME)
                        .then(async () => {
                            const testRunUrl = await connection.getTestRunUrl(true) || connection.idleUrl;

                            redirect(res, testRunUrl);
                        });
                }
                else {
                    const testRunUrl = await connection.getTestRunUrl(true) || connection.idleUrl;

                    redirect(res, testRunUrl);
                }
            }
        }
    }

    private static _onHeartbeat (req: IncomingMessage, res: ServerResponse, connection: BrowserConnection): void {
        if (BrowserConnectionGateway._ensureConnectionReady(res, connection)) {
            const status = connection.heartbeat();

            respondWithJSON(res, status);
        }
    }

    private static _onIdle (req: IncomingMessage, res: ServerResponse, connection: BrowserConnection): void {
        if (BrowserConnectionGateway._ensureConnectionReady(res, connection))
            res.end(connection.renderIdlePage());
    }

    private static async _onIdleForced (req: IncomingMessage, res: ServerResponse, connection: BrowserConnection): Promise<void> {
        if (BrowserConnectionGateway._ensureConnectionReady(res, connection)) {
            const status = await connection.getStatus(true);

            redirect(res, status.url);
        }
    }

    private static async _onStatusRequest (req: IncomingMessage, res: ServerResponse, connection: BrowserConnection): Promise<void> {
        return BrowserConnectionGateway._onStatusRequestCore(req, res, connection, false);
    }

    private static async _onStatusRequestOnTestDone (req: IncomingMessage, res: ServerResponse, connection: BrowserConnection): Promise<void> {
        return BrowserConnectionGateway._onStatusRequestCore(req, res, connection, true);
    }

    private static async _onStatusRequestCore (req: IncomingMessage, res: ServerResponse, connection: BrowserConnection, isTestDone: boolean): Promise<void> {
        if (BrowserConnectionGateway._ensureConnectionReady(res, connection)) {
            const status = await connection.getStatus(isTestDone);

            respondWithJSON(res, status);
        }
    }

    private static _onInitScriptRequest (req: IncomingMessage, res: ServerResponse, connection: BrowserConnection): void {
        if (BrowserConnectionGateway._ensureConnectionReady(res, connection)) {
            const script = connection.getInitScript();

            respondWithJSON(res, script);
        }
    }

    private static _onInitScriptResponse (req: IncomingMessage, res: ServerResponse, connection: BrowserConnection): void {
        if (BrowserConnectionGateway._ensureConnectionReady(res, connection)) {
            BrowserConnectionGateway._fetchRequestData(req, data => {
                connection.handleInitScriptResult(data);

                res.end();
            });
        }
    }

    private static _onGetActiveWindowIdRequest (req: IncomingMessage, res: ServerResponse, connection: BrowserConnection): void {
        if (BrowserConnectionGateway._ensureConnectionReady(res, connection)) {
            respondWithJSON(res, {
                activeWindowId: connection.activeWindowId
            });
        }
    }

    private static _onSetActiveWindowIdRequest (req: IncomingMessage, res: ServerResponse, connection: BrowserConnection): void {
        if (BrowserConnectionGateway._ensureConnectionReady(res, connection)) {
            BrowserConnectionGateway._fetchRequestData(req, data => {
                const parsedData = JSON.parse(data);

                connection.activeWindowId = parsedData.windowId;

                respondWithJSON(res);
            });
        }
    }

    private static async _onSetupWindow (req: IncomingMessage, res: ServerResponse, connection: BrowserConnection): Promise<void> {
        if (BrowserConnectionGateway._ensureConnectionReady(res, connection)) {
            await connection.setUpBrowserWindow();

            respondWithJSON(res, { result: SetupWindowResult.ok });
        }
    }

    private async _connectNextRemoteBrowser (req: IncomingMessage, res: ServerResponse): Promise<void> {
        preventCaching(res);

        const remoteConnection = await this._remotesQueue.shift();

        if (remoteConnection)
            redirect(res, remoteConnection.url);
        else
            respond500(res, 'There are no available _connections to establish.');
    }

    // API
    public startServingConnection (connection: BrowserConnection): void {
        this._connections[connection.id] = connection;

        if (connection.browserInfo.providerName === 'remote')
            this._remotesQueue.add(connection);
    }

    public stopServingConnection (connection: BrowserConnection): void {
        delete this._connections[connection.id];

        if (connection.browserInfo.providerName === 'remote')
            this._remotesQueue.remove(connection);
    }

    public close (): void {
        Object.keys(this._connections).forEach(id => this._connections[id].close());
    }
}

