class LoggerC {
  private NODE_ENV: string;
  public log: (...args: any[]) => void;
  public info: (...args: any[]) => void;
  public warn: (...args: any[]) => void;
  public error: (...args: any[]) => void;

  constructor() {
    this.NODE_ENV = process.env.NODE_ENV || 'development';

    this.log = this.NODE_ENV === 'development' ? console.log : () => {};
    this.info = this.NODE_ENV === 'development' ? console.info : () => {};
    this.warn = this.NODE_ENV === 'development' ? console.warn : () => {};
    this.error = this.NODE_ENV === 'development' ? console.error : () => {};
  }
}

const logger = new LoggerC();
export default logger;
