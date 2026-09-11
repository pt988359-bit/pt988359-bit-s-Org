/**
 * Enterprise Architecture - Centralized Logger Service
 * Phase 14.7 Architecture Hardening
 */

export type LogLevel = 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  details?: unknown;
}

export class LoggerService {
  private static logs: LogEntry[] = [];
  private static maxLogs: number = 200;

  public static log(level: LogLevel, context: string, message: string, details?: unknown): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      details,
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    const formattedMessage = `[${entry.timestamp}] [${level}] [${context}] ${message}`;

    switch (level) {
      case 'ERROR':
        console.error(formattedMessage, details ?? '');
        break;
      case 'WARNING':
        console.warn(formattedMessage, details ?? '');
        break;
      case 'DEBUG':
        console.debug(formattedMessage, details ?? '');
        break;
      case 'INFO':
      default:
        console.info(formattedMessage, details ?? '');
        break;
    }
  }

  public static info(context: string, message: string, details?: unknown): void {
    this.log('INFO', context, message, details);
  }

  public static warn(context: string, message: string, details?: unknown): void {
    this.log('WARNING', context, message, details);
  }

  public static error(context: string, message: string, details?: unknown): void {
    this.log('ERROR', context, message, details);
  }

  public static debug(context: string, message: string, details?: unknown): void {
    this.log('DEBUG', context, message, details);
  }

  public static getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public static clearLogs(): void {
    this.logs = [];
  }
}
