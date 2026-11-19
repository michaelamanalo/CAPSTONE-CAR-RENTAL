export const isDemoMode = process.env.REACT_APP_DEMO_MODE === 'true'
  || process.env.NODE_ENV === 'development';

export const DEMO_DATA_EVENT = 'sgt-demo-data-change';
