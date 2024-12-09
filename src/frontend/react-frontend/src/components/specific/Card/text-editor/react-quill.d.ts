declare module 'react-quill' {
    import { FC } from 'react';
  
    interface ReactQuillProps {
      value: string;
      onChange: (value: string) => void;
      modules?: any;
      formats?: string[];
      placeholder?: string;
    }
  
    const ReactQuill: FC<ReactQuillProps>;
  
    export default ReactQuill;
  }
  