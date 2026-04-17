// Local question bank — fallback when ALOC API is unavailable
// Contains representative questions across all subjects
export const localQuestions: Record<string, any> = {
  Mathematics: {
    icon: '📐', color: '#f59e0b', years: ['2023','2022','2021','2020','2019'],
    questions: [
      { question: 'Simplify: 3(2x - 4) - 2(x + 3)', options: ['4x - 18','4x - 6','4x + 18','4x + 6'], correct_answer: '4x - 18', explanation: '3(2x-4)-2(x+3)=6x-12-2x-6=4x-18', topic: 'Algebra', year: '2023', exam_type: 'WAEC' },
      { question: 'If 2x + 3 = 11, find x.', options: ['3','4','5','6'], correct_answer: '4', explanation: '2x=8; x=4', topic: 'Algebra', year: '2022', exam_type: 'WAEC' },
      { question: 'Factorize: x² - 9', options: ['(x-3)(x+3)','(x-9)(x+1)','(x-3)²','(x+3)²'], correct_answer: '(x-3)(x+3)', explanation: 'Difference of two squares', topic: 'Algebra', year: '2023', exam_type: 'NECO' },
      { question: 'Solve: 3x² - 12 = 0', options: ['x = ±2','x = ±4','x = ±3','x = ±6'], correct_answer: 'x = ±2', explanation: '3x²=12; x²=4; x=±2', topic: 'Algebra', year: '2021', exam_type: 'WAEC' },
      { question: 'Find the area of a triangle with base 8cm and height 6cm.', options: ['24 cm²','48 cm²','14 cm²','28 cm²'], correct_answer: '24 cm²', explanation: '½×8×6=24', topic: 'Geometry', year: '2022', exam_type: 'WAEC' },
      { question: 'The interior angle of a regular polygon is 140°. How many sides?', options: ['9','8','7','10'], correct_answer: '9', explanation: '140=(n-2)×180/n; n=9', topic: 'Geometry', year: '2023', exam_type: 'NECO' },
      { question: 'Find the mean of: 3, 7, 5, 9, 6', options: ['6','5','7','8'], correct_answer: '6', explanation: '30/5=6', topic: 'Statistics', year: '2023', exam_type: 'WAEC' },
      { question: 'Convert 110₂ to base 10.', options: ['6','5','7','4'], correct_answer: '6', explanation: '4+2+0=6', topic: 'Number & Numeration', year: '2023', exam_type: 'WAEC' },
      { question: 'Simplify: (27)^(⅔)', options: ['9','3','18','6'], correct_answer: '9', explanation: '(3³)^(⅔)=3²=9', topic: 'Algebra', year: '2019', exam_type: 'WAEC' },
      { question: 'Find the LCM of 12, 18, and 24.', options: ['72','36','48','144'], correct_answer: '72', explanation: '2³×3²=72', topic: 'Number & Numeration', year: '2020', exam_type: 'WAEC' },
    ],
  },
  'English Language': {
    icon: '📝', color: '#6366f1', years: ['2023','2022','2021','2020','2019'],
    questions: [
      { question: 'Choose the word nearest in meaning to BENEVOLENT.', options: ['Kind','Cruel','Indifferent','Hostile'], correct_answer: 'Kind', explanation: 'Benevolent means kindly', topic: 'Lexis & Structure', year: '2023', exam_type: 'WAEC' },
      { question: 'She ______ her homework before her mother came back.', options: ['had finished','has finished','have finished','finished'], correct_answer: 'had finished', explanation: 'Past perfect for completed prior action', topic: 'Lexis & Structure', year: '2022', exam_type: 'WAEC' },
      { question: 'Select the opposite of FRUGAL.', options: ['Extravagant','Economical','Careful','Thrifty'], correct_answer: 'Extravagant', explanation: 'Frugal=economical; opposite=extravagant', topic: 'Lexis & Structure', year: '2023', exam_type: 'NECO' },
      { question: 'Neither the students nor the teacher ______ present.', options: ['was','were','are','have been'], correct_answer: 'was', explanation: 'Verb agrees with nearer subject (teacher=singular)', topic: 'Lexis & Structure', year: '2021', exam_type: 'WAEC' },
      { question: 'The expression "to kick the bucket" means to:', options: ['Die','Play football','Get angry','Start a fight'], correct_answer: 'Die', explanation: 'Idiomatic expression meaning to die', topic: 'Idioms', year: '2021', exam_type: 'WAEC' },
      { question: 'She is married ______ a doctor.', options: ['to','with','by','for'], correct_answer: 'to', explanation: 'Correct collocation: married to', topic: 'Lexis & Structure', year: '2022', exam_type: 'WAEC' },
      { question: 'Which word is a SYNONYM for copious?', options: ['Abundant','Scarce','Tiny','Slow'], correct_answer: 'Abundant', explanation: 'Copious=abundant', topic: 'Lexis & Structure', year: '2019', exam_type: 'NECO' },
      { question: '"The wind whispered through the trees." This is:', options: ['Personification','Simile','Metaphor','Hyperbole'], correct_answer: 'Personification', explanation: 'Giving human quality to wind', topic: 'Figures of Speech', year: '2023', exam_type: 'WAEC' },
    ],
  },
  Biology: {
    icon: '🧬', color: '#10b981', years: ['2023','2022','2021','2020','2019'],
    questions: [
      { question: 'The organelle responsible for cellular respiration is the:', options: ['Mitochondrion','Ribosome','Nucleus','Golgi apparatus'], correct_answer: 'Mitochondrion', explanation: 'Powerhouse of the cell', topic: 'Cell Biology', year: '2023', exam_type: 'WAEC' },
      { question: 'Which is NOT a function of the liver?', options: ['Production of insulin','Detoxification','Bile production','Storage of glycogen'], correct_answer: 'Production of insulin', explanation: 'Insulin is produced by pancreas', topic: 'Human Physiology', year: '2022', exam_type: 'WAEC' },
      { question: 'Blood group O is a universal donor because it lacks:', options: ['Both antigens A and B','Antigen A only','Antigen B only','Antibodies'], correct_answer: 'Both antigens A and B', explanation: 'No A or B antigens on RBCs', topic: 'Human Physiology', year: '2021', exam_type: 'WAEC' },
      { question: 'The genotype of a carrier of sickle cell trait is:', options: ['AS','SS','AA','AO'], correct_answer: 'AS', explanation: 'AS carries one normal and one sickle allele', topic: 'Genetics', year: '2022', exam_type: 'WAEC' },
      { question: 'Sickle cell anaemia is an example of:', options: ['Gene mutation','Chromosomal mutation','Polyploidy','Hybridization'], correct_answer: 'Gene mutation', explanation: 'Point mutation in hemoglobin gene', topic: 'Genetics', year: '2022', exam_type: 'NECO' },
      { question: 'The enzyme for starch digestion in the mouth is:', options: ['Salivary amylase (ptyalin)','Pepsin','Trypsin','Lipase'], correct_answer: 'Salivary amylase (ptyalin)', explanation: 'Ptyalin breaks starch into maltose', topic: 'Human Physiology', year: '2023', exam_type: 'WAEC' },
    ],
  },
  Chemistry: {
    icon: '🧪', color: '#06b6d4', years: ['2023','2022','2021','2020','2019'],
    questions: [
      { question: 'An element with atomic number 11 belongs to which group and period?', options: ['Group 1, Period 3','Group 3, Period 1','Group 1, Period 2','Group 2, Period 3'], correct_answer: 'Group 1, Period 3', explanation: 'Na: 2,8,1 → Period 3, Group 1', topic: 'Periodic Table', year: '2023', exam_type: 'WAEC' },
      { question: 'The IUPAC name for CH₃CH₂OH is:', options: ['Ethanol','Methanol','Propanol','Butanol'], correct_answer: 'Ethanol', explanation: '2 carbons + OH = ethanol', topic: 'Organic Chemistry', year: '2022', exam_type: 'WAEC' },
      { question: 'What is the relative molecular mass of H₂SO₄?', options: ['98','96','64','80'], correct_answer: '98', explanation: '2+32+64=98', topic: 'General Chemistry', year: '2021', exam_type: 'WAEC' },
      { question: 'The pH of a neutral solution is:', options: ['7','1','14','0'], correct_answer: '7', explanation: 'pH 7 = neutral', topic: 'Acids & Bases', year: '2020', exam_type: 'NECO' },
      { question: 'The bond formed by sharing electrons is called:', options: ['Covalent bond','Ionic bond','Metallic bond','Hydrogen bond'], correct_answer: 'Covalent bond', explanation: 'Shared electron pairs = covalent', topic: 'Chemical Bonding', year: '2021', exam_type: 'WAEC' },
    ],
  },
  Physics: {
    icon: '⚛️', color: '#8b5cf6', years: ['2023','2022','2021','2020','2019'],
    questions: [
      { question: 'The SI unit of force is:', options: ['Newton','Joule','Watt','Pascal'], correct_answer: 'Newton', explanation: '1 N = 1 kg⋅m/s²', topic: 'Mechanics', year: '2023', exam_type: 'WAEC' },
      { question: 'A body of mass 5kg moves at 10m/s. Find its kinetic energy.', options: ['250 J','50 J','500 J','100 J'], correct_answer: '250 J', explanation: 'KE=½×5×100=250J', topic: 'Mechanics', year: '2022', exam_type: 'WAEC' },
      { question: 'Which is a vector quantity?', options: ['Velocity','Speed','Mass','Temperature'], correct_answer: 'Velocity', explanation: 'Has magnitude and direction', topic: 'Mechanics', year: '2023', exam_type: 'NECO' },
      { question: 'Resistance=10Ω, Current=2A. Find voltage.', options: ['20 V','5 V','12 V','8 V'], correct_answer: '20 V', explanation: 'V=IR=20V', topic: 'Electricity', year: '2020', exam_type: 'WAEC' },
      { question: 'Two resistors 6Ω and 3Ω in parallel. Effective resistance?', options: ['2 Ω','9 Ω','4.5 Ω','1 Ω'], correct_answer: '2 Ω', explanation: '1/R=1/6+1/3=1/2; R=2Ω', topic: 'Electricity', year: '2020', exam_type: 'NECO' },
    ],
  },
  Economics: {
    icon: '💰', color: '#059669', years: ['2023','2022','2021','2020','2019'],
    questions: [
      { question: 'The law of demand states that:', options: ['Quantity demanded falls as price rises','Quantity demanded rises as price rises','Price falls as supply rises','Supply rises as demand rises'], correct_answer: 'Quantity demanded falls as price rises', explanation: 'Inverse relationship between price and quantity demanded', topic: 'Demand & Supply', year: '2023', exam_type: 'WAEC' },
      { question: 'GDP stands for:', options: ['Gross Domestic Product','General Domestic Product','Gross Direct Product','Grand Domestic Product'], correct_answer: 'Gross Domestic Product', explanation: 'Total value of goods and services produced', topic: 'National Income', year: '2022', exam_type: 'WAEC' },
      { question: 'Inflation is a sustained increase in:', options: ['General price level','Money supply','Production','Employment'], correct_answer: 'General price level', explanation: 'Persistent rise in prices', topic: 'Inflation', year: '2021', exam_type: 'NECO' },
    ],
  },
  Government: {
    icon: '🏛️', color: '#dc2626', years: ['2023','2022','2021','2020','2019'],
    questions: [
      { question: 'Democracy is a system of government where:', options: ['People elect their leaders','Military rules','One person rules','Elders decide'], correct_answer: 'People elect their leaders', explanation: 'Government by the people', topic: 'Forms of Government', year: '2023', exam_type: 'WAEC' },
      { question: 'The three arms of government are:', options: ['Executive, Legislature, Judiciary','Executive, Military, Judiciary','Legislature, Police, Judiciary','Executive, Legislature, Military'], correct_answer: 'Executive, Legislature, Judiciary', explanation: 'Separation of powers', topic: 'Structure of Government', year: '2022', exam_type: 'WAEC' },
    ],
  },
};
