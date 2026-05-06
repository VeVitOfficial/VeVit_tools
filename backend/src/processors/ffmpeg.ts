import ffmpeg from 'fluent-ffmpeg'

export function convertVideo(input: string, output: string, format: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .toFormat(format)
      .on('end', () => resolve())
      .on('error', reject)
      .save(output)
  })
}

export function compressVideo(input: string, output: string, crf: number): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .videoCodec('libx264')
      .outputOptions(`-crf ${crf}`)
      .on('end', () => resolve())
      .on('error', reject)
      .save(output)
  })
}

export function extractAudio(input: string, output: string, format: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .noVideo()
      .toFormat(format)
      .on('end', () => resolve())
      .on('error', reject)
      .save(output)
  })
}

export function makeGif(input: string, output: string, fps: number): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .outputOptions([
        `-vf fps=${fps},scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
        '-loop 0',
      ])
      .on('end', () => resolve())
      .on('error', reject)
      .save(output)
  })
}
