class GlobalContext {

  private appName: string = "";
  private appVersion: string | undefined;
  private instanceId: string | undefined;

  /**
   * Set information about the current app
   * @param appName Name of the app
   * @param appVersion Version of the app
   * @param instanceId ID of the instance of your app
   */
  public setServiceInformation(appName: string, appVersion: string | undefined, instanceId: string | undefined) {
    this.appName = appName;
    this.appVersion = appVersion;
    this.instanceId = instanceId;
  }

  /**
   * Returns the currently set app information
   * @returns service information
   */
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

/**
 * Set data that are included in every log statement.
 */
export const globalLoggingContext = new GlobalContext();
