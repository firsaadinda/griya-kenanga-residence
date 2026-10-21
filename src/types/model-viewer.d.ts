// TypeScript declaration for Google's <model-viewer> web component
import * as React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          "camera-controls"?: boolean | string;
          "auto-rotate"?: boolean | string;
          "rotation-per-second"?: string;
          "shadow-intensity"?: string | number;
          "shadow-softness"?: string | number;
          exposure?: string | number;
          poster?: string;
          loading?: "auto" | "lazy" | "eager";
          reveal?: string;
          ar?: boolean | string;
          "touch-action"?: string;
          "camera-orbit"?: string;
          style?: React.CSSProperties;
        },
        HTMLElement
      >;
    }
  }
}
