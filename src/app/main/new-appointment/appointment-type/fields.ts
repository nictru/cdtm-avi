export const fields = [
  {
    id: 'unwell',
    name: 'Health complaints',
    description: 'For any complaints you would like to have clarified',
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
    name: 'Infection Consultation',
    description:
      'Very short appointment for acute infections (for a maximum of 1-2 days)',
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
    name: 'Sick Note',
    description: 'Sick notes for psychological or physical illnesses',
    icon: 'fa-file-medical',
    fields: [
      'What illness or condition requires a sick note?',
      'How long do you need the sick note for?',
      'Is this for a physical or psychological reason?',
    ],
  },
  {
    id: 'prescription',
    name: 'Prescriptions',
    description:
      'Prescriptions for your treatments or medications (also health apps on prescription possible)',
    icon: 'fa-prescription-bottle-alt',
    fields: [
      'Which medication or treatment do you need a prescription for?',
      'Have you used this medication before?',
      'Are there any allergies or side effects?',
    ],
  },
  {
    id: 'referral',
    name: 'Referral',
    description: 'Referral to a specialist or a special examination',
    icon: 'fa-share-square',
    fields: [
      'Which specialist or examination do you need a referral for?',
      'What is the reason for the referral?',
      'Have you seen this specialist before?',
    ],
  },
  {
    id: 'prevention',
    name: 'Prevention',
    description: 'Preventive check-ups without specific complaints',
    icon: 'fa-shield-alt',
    fields: [
      'Which preventive check-up do you need?',
      'Do you have any specific concerns?',
      'When was your last check-up?',
    ],
  },
  {
    id: 'control-lab',
    name: 'Control and Laboratory',
    description: 'For the control of your illness or laboratory values',
    icon: 'fa-chart-line',
    fields: [
      'Which condition or lab values need to be checked?',
      'When was your last control?',
      'Are there any new symptoms?',
    ],
  },
  {
    id: 'vaccination-advice',
    name: 'Vaccination and Advice',
    description: 'For travel or standard vaccinations (No Corona)',
    icon: 'fa-syringe',
    fields: [
      'Which vaccination or advice do you need?',
      'Is this for travel or standard vaccination?',
      'Have you had any reactions to vaccines before?',
    ],
  },
  {
    id: 'sexual-health',
    name: 'Sexual Health',
    description: 'For advice and examination of your sexual health',
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
      'General practitioner control appointment in a disease management program',
    icon: 'fa-notes-medical',
    fields: [
      'Which chronic condition is being managed?',
      'When was your last DMP appointment?',
      'Any changes in your condition?',
    ],
  },
  {
    id: 'mental-health',
    name: 'Mental Health',
    description: 'For advice on your mental health',
    icon: 'fa-brain',
    fields: [
      'What mental health concern do you have?',
      'How long have you been experiencing this?',
      'Have you received treatment before?',
    ],
  },
  {
    id: 'other',
    name: 'Other Reasons for Visit',
    description:
      'For other reasons for visit and special consultations (including cannabis consultation)',
    icon: 'fa-ellipsis-h',
    fields: [
      'What is the reason for your visit?',
      'Is this a special consultation?',
      'Any additional information?',
    ],
  },
];
