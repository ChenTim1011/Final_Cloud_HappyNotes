declare module 'react-quill' {
  import { FC, CSSProperties } from 'react';

  interface ReactQuillProps {
    value: string;
    onChange: (value: string) => void;
    modules?: any;
    formats?: string[];
    placeholder?: string;
    readOnly?: boolean;
    theme?: 'snow' | 'bubble' | string;
    className?: string;
    style?: CSSProperties;
  }

  const ReactQuill: FC<ReactQuillProps>;

  export default ReactQuill;
}
