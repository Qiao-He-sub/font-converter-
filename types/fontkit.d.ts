declare module 'fontkit' {
  interface Font {
    toWOFF2(): Buffer;
    toWOFF(): Buffer;
    toTTF(): Buffer;
    toOTF(): Buffer;
  }

  interface FontKit {
    create(buffer: Buffer): Font;
  }

  const fontkit: FontKit;
  export default fontkit;
} 