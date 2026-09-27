export const eventCategories = [
  { value: 'arts_culture', tr: 'Sanat ve kültür', en: 'Arts and culture', fr: 'Arts et culture' },
  { value: 'sports_nature', tr: 'Spor ve doğa', en: 'Sports and nature', fr: 'Sport et nature' },
  { value: 'science_technology', tr: 'Bilim ve teknoloji', en: 'Science and technology', fr: 'Science et technologie' },
  { value: 'career_entrepreneurship', tr: 'Kariyer ve girişimcilik', en: 'Career and entrepreneurship', fr: 'Carrière et entrepreneuriat' },
  { value: 'society_thought', tr: 'Toplum ve düşünce', en: 'Society and thought', fr: 'Société et pensée' },
  { value: 'social_hobbies', tr: 'Sosyal yaşam ve hobi', en: 'Social life and hobbies', fr: 'Vie sociale et loisirs' },
  { value: 'other', tr: 'Diğer', en: 'Other', fr: 'Autre' },
] as const;
export type EventCategory = typeof eventCategories[number]['value'];
