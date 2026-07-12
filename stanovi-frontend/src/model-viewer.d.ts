import type React from 'react';

// The <model-viewer> web component (from @google/model-viewer) is not part of
// the default JSX intrinsic elements. Declare the subset of attributes we use.
interface ModelViewerCustomAttributes {
  src?: string;
  alt?: string;
  'camera-controls'?: boolean;
  'auto-rotate'?: boolean;
  'touch-action'?: string;
  'shadow-intensity'?: string | number;
  loading?: 'auto' | 'lazy' | 'eager';
  reveal?: 'auto' | 'interaction' | 'manual';
  'disable-zoom'?: boolean;
  ar?: boolean;
  poster?: string;
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > &
        ModelViewerCustomAttributes;
    }
  }
}
