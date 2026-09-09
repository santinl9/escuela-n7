export const logger = {
  info: (message: any, ...optionalParams: any[]) => {
    // In a real application, this would use Winston, Pino, etc.
    console.info(`[INFO] ${new Date().toISOString()} -`, message, ...optionalParams);
  },
  error: (message: any, ...optionalParams: any[]) => {
    console.error(`[ERROR] ${new Date().toISOString()} -`, message, ...optionalParams);
  },
  warn: (message: any, ...optionalParams: any[]) => {
    console.warn(`[WARN] ${new Date().toISOString()} -`, message, ...optionalParams);
  }
};

export default logger;
