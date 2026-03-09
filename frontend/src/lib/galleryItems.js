const GALLERY_FILENAMES = [
  '197937fa-fb9c-46ec-9501-78795206aa58_650.jpg',
  '20f5711b-b61e-411c-acf0-99c0921ec9a9_650.jpg',
  '6f620988-4c69-41a0-a9e2-7a1dca7cebb1_650.jpg',
  '75b087fd-df9b-47b1-827e-7cb36d5703ec_650.jpg',
  '7634883_YiY5IqT601.jpg',
  'c3eaa544-8727-4891-8580-272968b749b8_650.jpg',
  'ca2c99f3-e49c-47ee-8791-8f3e21775fdc_650.jpg',
  'dff013db-1785-4cd2-8347-3cd7da910618_650.jpg',
  'f841a441-4988-4fbc-bd4d-0cdf601a67cb_650.jpg',
];

const normalizeBasePath = (basePath = '') => {
  if (!basePath) return '';
  return basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
};

export const createGalleryItems = (basePath = '') => {
  const normalizedBasePath = normalizeBasePath(basePath);
  return GALLERY_FILENAMES.map((filename) => ({
    image: `${normalizedBasePath}/media/gallery/${filename}`,
    text: '',
  }));
};

export const DEFAULT_GALLERY_ITEMS = createGalleryItems();
export const DEFAULT_PUBLIC_GALLERY_ITEMS = createGalleryItems(process.env.PUBLIC_URL || '');

