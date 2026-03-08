import { setFocus, useFocusable } from '@noriginmedia/norigin-spatial-navigation'
import { useEffect, useContext } from 'react';
import { GlobalStateContext } from '../components/ClientContext.jsx';
import { Events } from '../components/WebSocketClient.js';
import { useLocation } from 'preact-iso';
import { useTranslation } from 'react-i18next';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

function ItemBasic({ children, onClick, shouldFocus }) {
    const { ref, focused, focusSelf } = useFocusable();
    useEffect(() => {
        if (focused) {
            ref.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center',
            });
        }

    }, [focused, ref]);

    if (shouldFocus) {
        useEffect(() => {
            focusSelf();
        }, [ref]);
    }

    return (
        <div
            ref={ref}
            onClick={onClick}
            className={classNames(
                'relative bg-gray-900 shadow-2xl rounded-3xl p-8 ring-1 ring-gray-900/10 sm:p-10 h-[35vh] w-[20vw]',
                focused ? 'focus' : '',
            )}
        >
            {children}
        </div>
    );
}
export default function Settings() {
    const { state } = useContext(GlobalStateContext);
    const loc = useLocation();
    const { t } = useTranslation();

    return (
        <div className="relative isolate lg:px-8">
            <div className="mx-auto flex flex-wrap justify-center gap-4 top-4 relative">
                <ItemBasic onClick={() => {
                    if (state.sharedData.modules?.length === 0) return alert(t('settings.noModules'));
                    loc.route('/tizenbrew-ui/dist/index.html/settings/change?type=autolaunch');
                }}>
                    <h3 className='text-indigo-400 text-base/7 font-semibold'>
                        {t('settings.autolaunch')}
                    </h3>
                    <p className='text-gray-300 mt-6 text-base/7'>
                        {t('settings.autolaunchDesc')}
                    </p>
                </ItemBasic>
                <ItemBasic onClick={() => {
                    if (state.sharedData.modules?.length === 0) return alert(t('settings.noModules'));
                    loc.route('/tizenbrew-ui/dist/index.html/settings/change?type=autolaunchService');
                }}>
                    <h3 className='text-indigo-400 text-base/7 font-semibold'>
                        {t('settings.autolaunchService')}
                    </h3>
                    <p className='text-gray-300 mt-6 text-base/7'>
                        {t('settings.autolaunchServiceDesc')}
                    </p>
                </ItemBasic>
                <ItemBasic onClick={() => {
                    loc.route('/tizenbrew-ui/dist/index.html/settings/change-ua');
                }}>
                    <h3 className='text-indigo-400 text-base/7 font-semibold'>
                        {t('settings.useragent')}
                    </h3>
                    <p className='text-gray-300 mt-6 text-base/7'>
                        {t('settings.useragentDesc')}
                    </p>
                </ItemBasic>
            </div>
        </div>
    )
}

function Change() {
    const loc = useLocation();
    const { state } = useContext(GlobalStateContext);
    const { t } = useTranslation();

    return (
        <div className="relative isolate lg:px-8">
            <div className="mx-auto flex flex-wrap justify-center gap-4 top-4 relative">
                {state?.sharedData?.modules?.map((module, idx) => {
                    if (loc.query.type === 'autolaunchService' && !module.serviceFile) return null;
                    return (
                        <ItemBasic state={state}
                            shouldFocus={idx === 0}
                            key={idx}
                            onClick={() => {
                                if (confirm(t('settings.enableAutolaunchPrompt', { packageName: module.appName }))) {
                                    state.client.send({
                                        type: Events.ModuleAction,
                                        payload: {
                                            action: loc.query.type,
                                            module: module.fullName
                                        }
                                    });
                                    loc.route('/tizenbrew-ui/dist/index.html/settings');
                                    setFocus('sn:focusable-item-1');
                                }
                            }}>
                            <h3
                                className='text-indigo-400 text-base/7 font-semibold'
                            >
                                {module.appName} ({module.version})
                            </h3>
                            <p className='text-gray-300 mt-6 text-base/7'>
                                {module.description}
                            </p>
                        </ItemBasic>
                    )
                })}
                <ItemBasic
                    shouldFocus={state?.sharedData?.modules?.length === 0}
                    onClick={() => {
                        if (confirm(t('settings.disableAutolaunchPrompt'))) {
                            state.client.send({
                                type: Events.ModuleAction,
                                payload: {
                                    action: loc.query.type,
                                    module: ''
                                }
                            });
                            loc.route('/tizenbrew-ui/dist/index.html/settings');
                            setFocus('sn:focusable-item-1');
                        }
                    }}>
                    <h3 className='text-indigo-400 text-base/7 font-semibold'>
                        {t('settings.disableAutolaunch')}
                    </h3>
                </ItemBasic>
            </div>
        </div>
    )
}

export {
    Change
}