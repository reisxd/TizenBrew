import TBLogo from '../assets/tizenbrew.svg';

export default function About() {
    const tizenVersion = tizen.systeminfo.getCapability('http://tizen.org/feature/platform.version');
    const tvModel = tizen.systeminfo.getCapability('http://tizen.org/system/model_name');
    const appVersion = tizen.application.getCurrentApplication().appInfo.version;
    
    return (
        <div className="flex justify-center align-center">
            <div className="flex flex-col items-center">
                <img src={TBLogo} className="h-[24vh] w-auto mt-16" />
                <p className="text-gray-300 mt-4 text-base/7">App Version: {appVersion}</p>
                <p className="text-gray-300 mt-4 text-base/7">Tizen Version: {tizenVersion}</p>
                <p className="text-gray-300 mt-4 text-base/7">TV Model: {tvModel}</p>
            </div>
        </div>
    )
}