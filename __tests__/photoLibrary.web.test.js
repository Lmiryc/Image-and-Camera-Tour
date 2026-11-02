import { savePhoto } from '../src/services/photoLibrary.web';

test('web saving downloads an image through the browser', async () => {
  const link = { click: jest.fn(), style: {} };
  const appendChild = jest.fn();
  const removeChild = jest.fn();
  const previousDocument = global.document;
  const createElement = jest.fn(() => link);
  Object.defineProperty(global, 'document', {
    configurable: true,
    value: { body: { appendChild, removeChild }, createElement },
  });

  try {
    await expect(savePhoto('data:image/jpeg;base64,photo-data')).resolves.toEqual({
      uri: 'data:image/jpeg;base64,photo-data',
      fileName: 'photo-lab.jpg',
      destination: 'download',
    });
    expect(createElement).toHaveBeenCalledWith('a');
    expect(link.href).toBe('data:image/jpeg;base64,photo-data');
    expect(link.download).toBe('photo-lab.jpg');
    expect(link.click).toHaveBeenCalledTimes(1);
    expect(appendChild).toHaveBeenCalledWith(link);
    expect(removeChild).toHaveBeenCalledWith(link);
  } finally {
    if (previousDocument === undefined) delete global.document;
    else Object.defineProperty(global, 'document', { configurable: true, value: previousDocument });
  }
});
