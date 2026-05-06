import sharp from 'sharp'

export async function compressImage(input: Buffer, quality: number, format: string): Promise<Buffer> {
  return sharp(input)
    .toFormat(format as keyof sharp.FormatEnum, { quality })
    .toBuffer()
}

export async function resizeImage(input: Buffer, width: number, height?: number): Promise<Buffer> {
  return sharp(input)
    .resize(width, height)
    .toBuffer()
}

export async function upscaleImage(input: Buffer, scale: number): Promise<Buffer> {
  const metadata = await sharp(input).metadata()
  const newWidth = Math.round((metadata.width || 100) * scale)
  return sharp(input)
    .resize(newWidth, null, { kernel: sharp.kernel.lanczos3 })
    .toBuffer()
}
