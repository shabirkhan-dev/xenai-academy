// src/utils/loger.ts
import chalk from 'chalk';
import process from 'process';

// Modern emojis for different log types
const LOG_TYPES = {
  info: { emoji: '🔵', label: 'INFO', color: chalk.blue },
  error: { emoji: '🔴', label: 'ERROR', color: chalk.red },
  warn: { emoji: '🟡', label: 'WARN', color: chalk.yellow },
  debug: { emoji: '🔍', label: 'DEBUG', color: chalk.gray },
  success: { emoji: '✨', label: 'SUCCESS', color: chalk.green },
  start: { emoji: '🚀', label: 'START', color: chalk.magenta },
  http: { emoji: '🌐', label: 'HTTP', color: chalk.cyan },
} as const;

// Get terminal width with fallback
const getTerminalWidth = (): number => process.stdout.columns || 80;

// Enhanced time formatting with milliseconds
const getFormattedTime = (): string => {
  const now = new Date();
  return chalk.gray(
    `${now.toLocaleTimeString('en-GB')}.${String(now.getMilliseconds()).padStart(3, '0')}`
  );
};

// Create fancy borders
const createBorder = (title: string = ''): string => {
  const width = getTerminalWidth();
  const pattern = '═';
  const padding = width - title.length - 2;
  const leftPad = Math.floor(padding / 2);
  const rightPad = padding - leftPad;

  const border = chalk.magenta(pattern.repeat(width));
  const titleLine = title 
    ? chalk.magenta(pattern.repeat(leftPad) + ' ' + title + ' ' + pattern.repeat(rightPad))
    : border;

  return `\n${border}\n${titleLine}\n${border}\n`;
};

// Format error stacks beautifully
const formatError = (error: Error): string => {
  if (!error.stack) return chalk.red(error.message);

  const lines = error.stack.split('\n');
  const message = lines[0];
  const stack = lines
    .slice(1)
    .map(line => {
      const [, method, path] = line.match(/at (.+) \((.+)\)/) || [null, line.trim(), ''];
      return chalk.gray(`  ┃  ${chalk.white(method)} ${chalk.gray(path)}`);
    })
    .join('\n');

  return `${chalk.red.bold(message)}\n${stack}`;
};

// Format HTTP specific details
const formatHttpDetails = (details: any): string => {
  const { method, url, status, duration } = details;
  const statusColor = status < 400 ? chalk.green : status < 500 ? chalk.yellow : chalk.red;
  
  return chalk.gray(
    `${chalk.bold(method)} ${url} ${statusColor(status)} ${chalk.gray(`${duration}ms`)}`
  );
};

export const createLogger = (name: string = '') => {
  // Format log message with right-aligned timestamp
  const formatLogMessage = (
    type: keyof typeof LOG_TYPES,
    message: string,
    error?: Error,
    details?: any
  ): string => {
    const { emoji, label, color } = LOG_TYPES[type];
    const timestamp = getFormattedTime();
    const category = name ? chalk.blue(`[${name}]`) : '';
    
    // Calculate spacing for right-aligned timestamp
    const baseMessage = `${emoji} ${label} ${category} ${message}`;
    const padding = getTerminalWidth() - baseMessage.length - timestamp.length - 5;
    
    let output = `${emoji} ${color.bold(label)} ${category} ${color(message)}`;
    output += ' '.repeat(Math.max(padding, 1));
    output += timestamp;

    if (details && type === 'http') {
      output += '\n  ' + formatHttpDetails(details);
    }

    if (error) {
      const separator = chalk.gray('─'.repeat(getTerminalWidth()));
      output += `\n${separator}\n${formatError(error)}\n${separator}`;
    }

    return output;
  };

  return {
    info: (message: string) => {
      console.log(formatLogMessage('info', message));
    },

    error: (message: string, error?: Error) => {
      console.error(formatLogMessage('error', message, error));
    },

    warn: (message: string) => {
      console.warn(formatLogMessage('warn', message));
    },

    debug: (message: string) => {
      console.debug(formatLogMessage('debug', message));
    },

    success: (message: string) => {
      console.log(formatLogMessage('success', message));
    },

    start: (message: string) => {
      console.log(createBorder('STARTUP'));
      console.log(formatLogMessage('start', message));
      console.log(createBorder());
    },

    http: (message: string, details: { 
      method: string;
      url: string;
      status: number;
      duration: number;
    }) => {
      console.log(formatLogMessage('http', message, undefined, details));
    }
  };
};

// Example HTTP middleware
export const createHttpLogger = (logger: ReturnType<typeof createLogger>) => {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    
    // Capture response finish
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      logger.http('Request processed', {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration
      });
    });

    next();
  };
};
