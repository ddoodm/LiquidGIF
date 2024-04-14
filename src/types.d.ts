// In a file like src/types/custom.d.ts
declare module '*.frag' {
    const content: string;
    export default content;
  }
  
  declare module '*.glsl' {
    const content: string;
    export default content;
  }
  