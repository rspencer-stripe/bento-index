// Integration system - plugin architecture for data sources
export * from './types';
export * from './base';
export * from './registry';

// Individual integrations
export { googleCalendarIntegration } from './google-calendar';
export { slackIntegration } from './slack';
