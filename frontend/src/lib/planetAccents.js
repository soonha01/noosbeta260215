export const PLANET_ACCENTS = {
  mercury: '#e8927c',
  venus: '#b45d15',
  earth: '#26daaa',
  mars: '#e55f45',
  jupiter: '#ffb347',
  saturn: '#b29d81',
  uranus: '#8dcdd8',
  neptune: '#4f83e2',
  pluto: '#ff8732',
};

export const getPlanetAccent = (planet, fallback = 'mars') => {
  const key = String(planet || fallback).toLowerCase();
  return PLANET_ACCENTS[key] || PLANET_ACCENTS[fallback] || PLANET_ACCENTS.mars;
};
