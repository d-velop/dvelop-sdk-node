class GlobalContext {

  private appName: string = "";
  private appVersion: string | undefined;
  private instanceId: string | undefined;

  setServiceInformation(appName: string, appVersion: string | undefined, instanceId: string | undefined) {
    this.appName = appName;
    this.appVersion = appVersion;
    this.instanceId = instanceId;
  }

  get serviceInformation(): {appName: string, appVersion: string | undefined, instanceId: string | undefined} | undefined {
    if (!this.appName && !this.appVersion && !this.instanceId) {
      return undefined;
    }
    return {
      appName: this.appName,
      appVersion: this.appVersion,
      instanceId: this.instanceId
    };
  }
}

export const globalLoggingContext = new GlobalContext();
