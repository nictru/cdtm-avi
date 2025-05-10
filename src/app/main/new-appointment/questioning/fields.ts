export const fields = [
  {
    id: 'unwell',
    name: 'Beschwerden',
    description: 'Für jegliche Beschwerden, die Sie abklären lassen möchten',
    icon: 'fa-notes-medical',
    fields: [
      'What is the complaint?',
      'How long has it been going on?',
      'Has it been getting worse?',
      'Previous health issues?',
    ],
  },
  {
    id: 'infection',
    name: 'Infektsprechstunde',
    description:
      'Sehr kurzer Termin bei akuten Infektionen (seit max. 1-2 Tage)',
    icon: 'fa-bolt',
    fields: [
      'What symptoms do you have?',
      'When did the symptoms start?',
      'Have you had a fever?',
      'Have you been in contact with sick people?',
    ],
  },
  {
    id: 'sick-note',
    name: 'Krankschreibung',
    description: 'Krankschreibungen für psychische oder physische Krankheiten',
    icon: 'fa-file-medical',
    fields: [
      'What illness or condition requires a sick note?',
      'How long do you need the sick note for?',
      'Is this for a physical or psychological reason?',
    ],
  },
  {
    id: 'prescription',
    name: 'Rezepte',
    description:
      'Rezepte für Ihre Behandlungen oder Medikamente (ebenfalls Gesundheitsapps auf Rezept möglich)',
    icon: 'fa-prescription-bottle-alt',
    fields: [
      'Which medication or treatment do you need a prescription for?',
      'Have you used this medication before?',
      'Are there any allergies or side effects?',
    ],
  },
  {
    id: 'referral',
    name: 'Überweisung',
    description:
      'Überweisung zu einem Facharzt oder einer speziellen Untersuchung',
    icon: 'fa-share-square',
    fields: [
      'Which specialist or examination do you need a referral for?',
      'What is the reason for the referral?',
      'Have you seen this specialist before?',
    ],
  },
  {
    id: 'prevention',
    name: 'Vorsorge',
    description: 'Vorsorgeuntersuchungen ohne konkrete Beschwerden',
    icon: 'fa-shield-alt',
    fields: [
      'Which preventive check-up do you need?',
      'Do you have any specific concerns?',
      'When was your last check-up?',
    ],
  },
  {
    id: 'control-lab',
    name: 'Kontrolle und Labor',
    description: 'Für die Kontrolle Ihrer Erkrankung oder Laborwerte',
    icon: 'fa-chart-line',
    fields: [
      'Which condition or lab values need to be checked?',
      'When was your last control?',
      'Are there any new symptoms?',
    ],
  },
  {
    id: 'vaccination-advice',
    name: 'Impfung und Beratung',
    description: 'Für Reise- oder Standardimpfungen (Kein Corona)',
    icon: 'fa-syringe',
    fields: [
      'Which vaccination or advice do you need?',
      'Is this for travel or standard vaccination?',
      'Have you had any reactions to vaccines before?',
    ],
  },
  {
    id: 'sexual-health',
    name: 'Sexuelle Gesundheit',
    description:
      'Für die Beratung zu und Untersuchung von Ihrer sexuellen Gesundheit',
    icon: 'fa-venus-mars',
    fields: [
      'What is your concern regarding sexual health?',
      'Do you have symptoms or need a check-up?',
      'Any recent risk exposures?',
    ],
  },
  {
    id: 'dmp',
    name: 'DMP',
    description:
      'Hausärztlicher Kontrolltermin in einem Disease-Management-Programm',
    icon: 'fa-notes-medical',
    fields: [
      'Which chronic condition is being managed?',
      'When was your last DMP appointment?',
      'Any changes in your condition?',
    ],
  },
  {
    id: 'mental-health',
    name: 'Mentale Gesundheit',
    description: 'Für Beratung Ihrer mentale Gesundheit',
    icon: 'fa-brain',
    fields: [
      'What mental health concern do you have?',
      'How long have you been experiencing this?',
      'Have you received treatment before?',
    ],
  },
  {
    id: 'other',
    name: 'Weitere Besuchsgründe',
    description:
      'Für weitere Besuchsgründe und Spezialsprechstunden (u.a. Cannabis-Sprechstunde)',
    icon: 'fa-ellipsis-h',
    fields: [
      'What is the reason for your visit?',
      'Is this a special consultation?',
      'Any additional information?',
    ],
  },
];
