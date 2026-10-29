import { LocationProvider, ErrorBoundary, Router, Route } from 'preact-iso';
import Home from './pages/Home.jsx';
import ModuleManager, { AddModule } from './pages/ModuleManager.jsx';
import Header from './components/Header.jsx';
import { GlobalStateContext } from './components/ClientContext.jsx';
import { useRef } from 'preact/hooks';
import { useEffect, useState, useContext } from 'react';
import Client from './components/WebSocketClient.js';
import Settings, { Change } from './pages/Settings.jsx';
import About from './pages/About.jsx';
import './components/i18n.js';
import UserAgentSettings from './pages/UserAgentSettings.jsx';
import { ExclamationCircleIcon } from '@heroicons/react/16/solid';
import { useTranslation } from 'react-i18next';

export default function App() {
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const context = useContext(GlobalStateContext);
  const { t } = useTranslation();
  window.dispatch = context.dispatch;
  window.state = context.state;

  useEffect(() => {
    if (context.state.sharedData.error.disappear) {
      setTimeout(() => {
        context.dispatch({
          type: 'SET_ERROR',
          payload: {
            message: null,
            disappear: false
          }
        });
      }, 5000);
    }
  }, [context.state.sharedData.error.disappear]);
  useEffect(() => {
    setHeaderHeight(headerRef.current.base.clientHeight);
  }, [headerRef]);

  useEffect(() => {
    if (!window.setClient) {
      startService(context);
      window.setClient = true;
    }
  }, []);


  return (
    <ErrorBoundary>
      <LocationProvider>
        <Header ref={headerRef} />
        <div className="bg-slate-800 text-white overflow-hidden" style={{ height: `calc(100vh - ${headerHeight}px)` }}>
          <div className={`flex justify-center ${!context.state.sharedData.error.message ? 'hidden' : ''}`}>
            <div class="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 bg-slate-900 mt-8 w-[95vw] text-red-400" role="alert">
              <ExclamationCircleIcon className="h-[4vw] w-[2vw] mr-2" />
              <div>
                <span class="text-2xl">{t(context.state.sharedData.error.message, context.state.sharedData.error.args)}</span>
              </div>
            </div>
          </div>
          <Router>
            <Route component={Home} path="/tizenbrew-ui/dist/index.html" />
            <Route component={ModuleManager} path="/tizenbrew-ui/dist/index.html/module-manager" />
            <Route component={AddModule} path="/tizenbrew-ui/dist/index.html/module-manager/add" />
            <Route component={Settings} path="/tizenbrew-ui/dist/index.html/settings" />
            <Route component={Change} path="/tizenbrew-ui/dist/index.html/settings/change" />
            <Route component={UserAgentSettings} path="/tizenbrew-ui/dist/index.html/settings/change-ua" />
            <Route component={About} path="/tizenbrew-ui/dist/index.html/about" />
          </Router>
        </div>
      </LocationProvider>
    </ErrorBoundary>
  );
}


function platformMajor() {
  try { return parseInt(tizen.systeminfo.getCapability('http://tizen.org/feature/platform.version'), 10) || 0; }
  catch (e) { return 0; }
}

// Tizen 9+ needs wrt:service to start the service, launchAppControl does nothing there.
// Loaded through a script tag so vite doesn't try to resolve the import.
function withWrtService(cb) {
  if (platformMajor() < 9 || typeof window.tbWrtService === 'function') return cb();
  let done = false;
  const once = () => { if (done) return; done = true; window.removeEventListener('tb-wrt-service', once); cb(); };
  window.addEventListener('tb-wrt-service', once);
  setTimeout(once, 3000);
  try {
    const s = document.createElement('script');
    s.type = 'module';
    s.text = "import { Service } from 'wrt:service'; window.tbWrtService = Service; window.dispatchEvent(new Event('tb-wrt-service'));";
    s.onerror = once;
    document.body.appendChild(s);
  } catch (e) { once(); }
}

function launchService(serviceId, onOk, onFail) {
  if (typeof window.tbWrtService === 'function') {
    try {
      const started = new window.tbWrtService(serviceId).start();
      if (started && typeof started.then === 'function') started.then(onOk, (e) => onFail('wrt:service: ' + ((e && e.message) || e)));
      else onOk();
    } catch (e) { onFail('wrt:service: ' + ((e && e.message) || e)); }
    return;
  }
  tizen.application.launchAppControl(
    new tizen.ApplicationControl("http://tizen.org/appcontrol/operation/service"),
    serviceId,
    onOk,
    (e) => onFail(e.message)
  );
}

// first start after install can take a while, don't reload until the socket is actually up
function waitForService(context, tries = 30) {
  const ws = new WebSocket('ws://localhost:8081');
  ws.onopen = () => { ws.close(); window.location.reload(); };
  ws.onerror = () => {
    if (tries > 1) setTimeout(() => waitForService(context, tries - 1), 1000);
    else alert("Launch Service failed: service started but nothing is listening on 8081");
  };
}

function startService(context) {
  const testWS = new WebSocket('ws://localhost:8081');

  testWS.onerror = () => {
    const pkgId = tizen.application.getCurrentApplication().appInfo.packageId;

    const serviceId = pkgId + ".StandaloneService";

    withWrtService(() => launchService(serviceId,
      function () {
        context.dispatch({
          type: 'SET_STATE',
          payload: 'service.started'
        });

        waitForService(context);
      },
      function (why) {
        alert("Launch Service failed: " + why);
      }
    ));
  }

  testWS.onopen = () => {
    context.dispatch({
      type: 'SET_STATE',
      payload: 'service.alreadyRunning'
    });

    context.dispatch({
      type: 'SET_CLIENT',
      payload: new Client(context)
    });

  }
}