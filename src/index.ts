/**
 * @description 监控 SDK 入口文件
 * @params { Object } userConfig
 */
import { IUserConfig } from './type/index';
import initUserConfig from './initUserConfig';
import eagle from './eagle';

const initMonitor = (userConfig: IUserConfig) => {

  const config = initUserConfig(userConfig);
  const EagleEye = eagle(config);
  window.eagleEye = EagleEye;

  return EagleEye;
};

export {
  initMonitor
}