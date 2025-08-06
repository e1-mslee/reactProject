declare module "*.css" {
  const content: string;
  export default content;
}

// 다른 asset 파일들도 정의
declare module "*.scss" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // 다른 환경변수들도 여기에 추가
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
