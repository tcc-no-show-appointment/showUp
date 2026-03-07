/// <reference types="vite/client" />

// Vite env types
interface ImportMetaEnv {
  readonly VITE_PREDICTION_API_URL: string;
  readonly VITE_TRAINING_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Image assets
declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

// Assets barrel exports
declare module './assets' {
  export const ShowUpLogo: string;
}

declare module './assets/images' {
  export const ShowUpLogo: string;
}

// JSX pages (temporary until converted to TSX)
declare module '*.jsx' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
}

declare module './pages/Dashboard' {
  import { ComponentType } from 'react';
  const Dashboard: ComponentType<any>;
  export default Dashboard;
}

declare module './pages/Prediction' {
  import { ComponentType } from 'react';
  const Prediction: ComponentType<any>;
  export default Prediction;
}

declare module './pages/Appointments' {
  import { ComponentType } from 'react';
  const Appointments: ComponentType<any>;
  export default Appointments;
}

// React DatePicker fix for React 18
declare module 'react-datepicker' {
  import { Component } from 'react';
  import { Locale } from 'date-fns';

  export interface ReactDatePickerProps {
    selected?: Date | null;
    onChange: (date: Date | null, event?: React.SyntheticEvent<any> | undefined) => void;
    dateFormat?: string | string[];
    locale?: string | Locale;
    placeholderText?: string;
    required?: boolean;
    className?: string;
    calendarClassName?: string;
    showYearDropdown?: boolean;
    showMonthDropdown?: boolean;
    dropdownMode?: 'scroll' | 'select';
    minDate?: Date | null;
    maxDate?: Date | null;
    disabled?: boolean;
    readOnly?: boolean;
    withPortal?: boolean;
    inline?: boolean;
    [key: string]: any;
  }

  export default class DatePicker extends Component<ReactDatePickerProps> {}
  
  export function registerLocale(localeName: string, localeData: Locale): void;
  export function setDefaultLocale(localeName: string): void;
  export function getDefaultLocale(): string;
}
