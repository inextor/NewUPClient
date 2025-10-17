import { ImagePipe } from './image.pipe';

describe('ImagePipe', () => {
  it('create an instance', () => {
    const pipe = new ImagePipe();
    expect(pipe).toBeTruthy();
  });

  it('should return a transparent image when value is null', () => {
    const pipe = new ImagePipe();
    const result = pipe.transform(null);
    expect(result).toBe('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
  });

  it('should return a transparent image when value is undefined', () => {
    const pipe = new ImagePipe();
    const result = pipe.transform(undefined);
    expect(result).toBe('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
  });

  it('should return the correct image URL when value is a number', () => {
    const pipe = new ImagePipe();
    const result = pipe.transform(123);
    expect(result).toBe('https://uniformesprofesionales.integranet.xyz/api/image.php?id=123');
  });
});
