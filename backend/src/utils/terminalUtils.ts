import logger from './logger';

/**
 * Creates a clickable terminal link using ANSI escape codes
 * @description - Creates a clickable terminal link using ANSI escape codes
 * @param url - The URL to make clickable
 * @param displayText - Optional display text (defaults to the URL)
 * @param color - Color to apply to the link (defaults to cyan like Vite)
 * @returns Formatted string with ANSI escape codes for clickable link
 */

export function createClickableLink({
  url,
  displayText,
  color = 'cyan',
}: {
  url: string;
  displayText?: string;
  color?: keyof typeof colors;
}): string {
  const text = displayText || url;
  const coloredText = colorText(text, color);
  return `\u001b]8;;${url}\u001b\\${coloredText}\u001b]8;;\u001b\\`;
}

/**
 * Creates a styled server startup message with clickable links (Vite-style)
 *
 * @param port - Server port number
 * @param options - Additional configuration options
 */
export function displayServerInfo({
  appName,
  port,
  docsPath,
  host,
}: {
  appName: string;
  port: number | string;
  docsPath: string;
  host: string;
}) {
  const docsUrl = `${host}:${port}${docsPath}`;


  const coloredText = colorText(appName, 'yellow');
  const coloredDocsUrl = createClickableLink({ url: docsUrl, color: 'cyan' });

  logger.info(`${coloredText}: ${coloredDocsUrl}`);

  return {
    docsUrl,
    coloredDocsUrl,
  };
}

/**
 * Colors for terminal output
 */
export const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

/**
 * Applies color to text
 */
export function colorText(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`;
}
