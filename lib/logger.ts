type LogLevel = "info" | "debug" | "warn" | "error";

export default class Logger {
  private context?: string;
  private isDev: boolean;

  constructor(context?: string, isDev: boolean = __DEV__) {
    this.context = context;
    this.isDev = isDev;
  }

  public log(data: any, level: LogLevel = "debug") {
    let log = "";

    // add timestamp in production environment
    if (!this.isDev) {
      const timestamp = new Date().toISOString();
      log += `${timestamp} `;
    }

    log += `${level.toUpperCase()} `;
    log += this.context ? `[${this.context}] ` : "";

    // prettify message in development environment
    log += this.isDev ? JSON.stringify(data, null, 2) : JSON.stringify(data);

    if (this.isDev) console.log("-------------------------");
    console.log(log);
    if (this.isDev) console.log("-------------------------");
  }
}
