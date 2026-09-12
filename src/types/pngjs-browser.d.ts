declare module "pngjs/browser" {
  export const PNG: {
    sync: {
      read(data: Uint8Array): { data: Uint8Array };
    };
  };
}
