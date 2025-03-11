export const marcRanges = [
  [  1,   8], // 00X: Control Fields
  [ 10,  99], // 01X-09X: Numbers and Code Fields
  [100, 199], // 1XX: Main Entry Fields
  [200, 249], // 20X-24X: Title and Title-Related Fields
  [250, 289], // 25X-28X: Edition, Imprint, Etc. Fields
  [300, 399], // 3XX: Physical Description, Etc. Fields
  [400, 499], // 4XX: Series Statement Fields
  [500, 599], // 5XX: Note Fields
  [600, 699], // 6XX: Subject Access Fields
  [700, 759], // 70X-75X: Added Entry Fields
  [760, 789], // 76X-78X: Linking Entry and Description Fields
  [800, 839], // 80X-83X: Series Added Entry Fields
  [841, 889], // 841-88X: Holdings, Location, Alternate Graphics, Etc. Fields
  [900, 909], // Vendor specific fields.
];
