export const PDF_MAP: Record<string, string> = {
  'bes-cfp':     '1v4kEQcZ33Oi_6bE4cvNpaXlAD5k3nt_o',
  'ie-ac-111':   '1mPUieL99B92iZ76DDx5mwayYVxeT-Zec',
  'ie-ipc-111':  '1NCi8MtAMVkh-6j2MvSTPTtuFWSubCmTU',
  'ie-tech-111': '1YZKpxqrqnEISOpFbB_l9_W1eZpwDmj3E',
  'ephys':       '1iGCJEYbMfTAIscy93Ltqnm4extEVqc1q',
  'ephysl':      '1PudL-f85oQ4xo0lGofYyowBykt3M7Keh',
  'ie-pc-212':   '1_kkGmS599dIlNzNSeu1olykO0iyx-RT4',
  'ie-pc-212l':  '1FpEBciGCxeLixdjkWdPb_oSOTBsnJuhp',
  'gec-lwr':     '1iPCkU49tGomAu9IrUCywFz398pg7F4l4',
  'gec-tcw':     '15IZ0haMPeYOzl3uzjNXd79rPOd9glDQC',
  'ie-pc-3112':  '1zSk1tI4OttAzQrCrreySHgWZoBEc8Tuk',
  'ie-ac-313':   '1UNUUA-DuVjk7hMJnWZj3gfRyP08Aj9s4',
  'ie-ac-314':   '1Gt3cN_eMlAgXvHl-n7Nm5BHQEDfPHobd',
  'ie-pc-3110':  '1ixY5Crmdp5kRvDUyNJsiqDqkhzFCEIaS',
  'ie-pc-3214':  '10J_uO-mvGEJUH-wOeUbI1ngPGlJdAz1u',
};

export interface SubjectEntry {
  id: string;
  subjectCode: string;
  subjectName: string;
  units: number;
  yearLevel: string;
  term: string;
  description: string;
}

export const SUBJECTS_DATA: SubjectEntry[] = [
  { id: 'emath-111',   subjectCode: 'EMATH 111',   subjectName: 'Calculus 1',                                         units: 5, yearLevel: '1st', term: '1st Semester', description: 'Differential calculus, limits, continuity, and derivatives.' },
  { id: 'echem',       subjectCode: 'ECHEM',        subjectName: 'Chemistry for Engineering (Lec)',                    units: 3, yearLevel: '1st', term: '1st Semester', description: 'Fundamental principles of chemistry for engineering students.' },
  { id: 'echeml',      subjectCode: 'ECHEML',       subjectName: 'Chemistry for Engineering (Lab)',                    units: 1, yearLevel: '1st', term: '1st Semester', description: 'Laboratory experiments in chemistry.' },
  { id: 'bes-cfp',     subjectCode: 'BES-CFP',      subjectName: 'Computer Fundamentals and Programming',              units: 2, yearLevel: '1st', term: '1st Semester', description: 'Introduction to computer systems and basic programming concepts.' },
  { id: 'ie-ipc-111',  subjectCode: 'IE-IPC 111',   subjectName: 'Introduction to Engineering',                        units: 2, yearLevel: '1st', term: '1st Semester', description: 'Overview of the engineering profession and IE field.' },
  { id: 'ie-ac-111',   subjectCode: 'IE-AC 111',    subjectName: 'Principles of Economics',                            units: 3, yearLevel: '1st', term: '1st Semester', description: 'Basic economic theories and their applications.' },
  { id: 'ie-tech-111', subjectCode: 'IE-TECH 111',  subjectName: 'Pneumatics and Programmable Logic Controller',       units: 3, yearLevel: '1st', term: '1st Semester', description: 'Control systems using pneumatics and PLCs.' },
  { id: 'pe-1',        subjectCode: 'PE 1',         subjectName: 'Physical Education 1',                               units: 2, yearLevel: '1st', term: '1st Semester', description: 'Physical fitness and self-testing activities.' },
  { id: 'nstp-1',      subjectCode: 'NSTP 1',       subjectName: 'National Service Training Program',                  units: 3, yearLevel: '1st', term: '1st Semester', description: 'Civic consciousness and defense preparedness.' },
  { id: 'emath-122',   subjectCode: 'EMATH 122',    subjectName: 'Calculus 2',                                         units: 5, yearLevel: '1st', term: '2nd Semester', description: 'Integral calculus and its applications.' },
  { id: 'ephys',       subjectCode: 'EPHYS',        subjectName: 'Physics for Engineers (Lec)',                        units: 3, yearLevel: '1st', term: '2nd Semester', description: 'Mechanics, heat, and sound for engineers.' },
  { id: 'ephysl',      subjectCode: 'EPHYSL',       subjectName: 'Physics for Engineers (Lab)',                        units: 1, yearLevel: '1st', term: '2nd Semester', description: 'Laboratory experiments in physics.' },
  { id: 'bes-cad',     subjectCode: 'BES-CAD',      subjectName: 'Computer-Aided Drafting',                            units: 1, yearLevel: '1st', term: '2nd Semester', description: 'Technical drawing using CAD software.' },
  { id: 'ie-pc-121',   subjectCode: 'IE-PC 121',    subjectName: 'Statistical Analysis for Industrial Engineering 1',  units: 3, yearLevel: '1st', term: '2nd Semester', description: 'Probability and descriptive statistics.' },
  { id: 'ie-iac-121',  subjectCode: 'IE-IAC 121',   subjectName: 'Basic Accounting',                                   units: 3, yearLevel: '1st', term: '2nd Semester', description: 'Introduction to accounting principles.' },
  { id: 'gec-pc',      subjectCode: 'GEC-PC',       subjectName: 'Purposive Communication',                            units: 3, yearLevel: '1st', term: '2nd Semester', description: 'Effective communication in various contexts.' },
  { id: 'gec-us',      subjectCode: 'GEC-US',       subjectName: 'Understanding the Self',                             units: 3, yearLevel: '1st', term: '2nd Semester', description: 'Psychological and philosophical perspectives of the self.' },
  { id: 'pe-2',        subjectCode: 'PE 2',         subjectName: 'Physical Education 2',                               units: 2, yearLevel: '1st', term: '2nd Semester', description: 'Rhythmic activities and dance.' },
  { id: 'nstp-2',      subjectCode: 'NSTP 2',       subjectName: 'National Service Training Program 2',                units: 3, yearLevel: '1st', term: '2nd Semester', description: 'Community immersion and service.' },
  { id: 'emath-213',   subjectCode: 'EMATH 213',    subjectName: 'Differential Equations',                             units: 3, yearLevel: '2nd', term: '1st Semester', description: 'Solving first-order and higher-order differential equations.' },
  { id: 'bes-emech',   subjectCode: 'BES-EMECH',    subjectName: 'Engineering Mechanics',                              units: 3, yearLevel: '2nd', term: '1st Semester', description: 'Statics and dynamics of rigid bodies.' },
  { id: 'ie-pc-212',   subjectCode: 'IE-PC 212',    subjectName: 'Industrial Materials and Processes',                 units: 3, yearLevel: '2nd', term: '1st Semester', description: 'Study of materials used in industry and manufacturing processes.' },
  { id: 'ie-pc-212l',  subjectCode: 'IE-PC 212L',   subjectName: 'Industrial Materials and Processes (Lab)',           units: 2, yearLevel: '2nd', term: '1st Semester', description: 'Hands-on experiments with industrial materials.' },
  { id: 'ie-pc-213',   subjectCode: 'IE-PC 213',    subjectName: 'Statistical Analysis for Industrial Engineering 2',  units: 3, yearLevel: '2nd', term: '1st Semester', description: 'Inferential statistics and hypothesis testing.' },
  { id: 'ie-pc-214',   subjectCode: 'IE-PC 214',    subjectName: 'Industrial Organization and Management',             units: 3, yearLevel: '2nd', term: '1st Semester', description: 'Principles of management and organizational behavior.' },
  { id: 'ie-ac-212',   subjectCode: 'IE-AC 212',    subjectName: 'Financial Accounting',                               units: 3, yearLevel: '2nd', term: '1st Semester', description: 'Preparation and analysis of financial statements.' },
  { id: 'gec-mmw',     subjectCode: 'GEC-MMW',      subjectName: 'Mathematics in the Modern World',                    units: 3, yearLevel: '2nd', term: '1st Semester', description: 'Applications of mathematics in contemporary life.' },
  { id: 'pe-3',        subjectCode: 'PE 3',         subjectName: 'Physical Education 3',                               units: 2, yearLevel: '2nd', term: '1st Semester', description: 'Individual and dual sports.' },
  { id: 'emath-224',   subjectCode: 'EMATH 224',    subjectName: 'Numerical Methods',                                  units: 3, yearLevel: '2nd', term: '2nd Semester', description: 'Computational methods for engineering problems.' },
  { id: 'ie-pc-212b',  subjectCode: 'IE-PC 212B',   subjectName: 'Manufacturing Systems',                              units: 3, yearLevel: '2nd', term: '2nd Semester', description: 'Design and management of manufacturing processes.' },
  { id: 'ie-pc-222',   subjectCode: 'IE-PC 222',    subjectName: 'Industrial Electronics',                             units: 3, yearLevel: '2nd', term: '2nd Semester', description: 'Electronic circuits and systems for industrial applications.' },
  { id: 'ie-pc-222l',  subjectCode: 'IE-PC 222L',   subjectName: 'Industrial Electronics (Lab)',                       units: 2, yearLevel: '2nd', term: '2nd Semester', description: 'Laboratory work in industrial electronics.' },
  { id: 'ie-pc-225',   subjectCode: 'IE-PC 225',    subjectName: 'Thermodynamics',                                     units: 3, yearLevel: '2nd', term: '2nd Semester', description: 'Laws of thermodynamics and their applications.' },
  { id: 'ie-ac-221',   subjectCode: 'IE-AC 221',    subjectName: 'Cost Engineering',                                   units: 3, yearLevel: '2nd', term: '2nd Semester', description: 'Principles of cost estimation and analysis.' },
  { id: 'gec-lwr',     subjectCode: 'GEC-LWR',      subjectName: 'Life and Works of Rizal',                            units: 3, yearLevel: '2nd', term: '2nd Semester', description: 'Study of Jose Rizal\'s life, works, and writings.' },
  { id: 'gec-tcw',     subjectCode: 'GEC-TCW',      subjectName: 'The Contemporary World',                             units: 3, yearLevel: '2nd', term: '2nd Semester', description: 'Global issues and trends in the modern world.' },
  { id: 'pe-4',        subjectCode: 'PE 4',         subjectName: 'Physical Education 4',                               units: 2, yearLevel: '2nd', term: '2nd Semester', description: 'Team sports and recreational activities.' },
  { id: 'ie-pc-3111',  subjectCode: 'IE-PC 3111',   subjectName: 'Methods Engineering and Ergonomics',                 units: 3, yearLevel: '3rd', term: '1st Semester', description: 'Work study, motion and time study, ergonomics.' },
  { id: 'ie-pc-3111l', subjectCode: 'IE-PC 3111L',  subjectName: 'Methods Engineering and Ergonomics (Lab)',           units: 2, yearLevel: '3rd', term: '1st Semester', description: 'Laboratory in work measurement and ergonomics.' },
  { id: 'ie-pc-3112',  subjectCode: 'IE-PC 3112',   subjectName: 'Operations Research 1',                              units: 3, yearLevel: '3rd', term: '1st Semester', description: 'Linear programming, transportation, and network models.' },
  { id: 'ie-pc-3113',  subjectCode: 'IE-PC 3113',   subjectName: 'Engineering Economy',                                units: 3, yearLevel: '3rd', term: '1st Semester', description: 'Economic analysis and decision making for engineers.' },
  { id: 'ie-ac-313',   subjectCode: 'IE-AC 313',    subjectName: 'Safety Management',                                  units: 3, yearLevel: '3rd', term: '1st Semester', description: 'Occupational health and safety standards and management.' },
  { id: 'ie-ac-314',   subjectCode: 'IE-AC 314',    subjectName: 'Total Quality Management',                           units: 3, yearLevel: '3rd', term: '1st Semester', description: 'Quality systems, ISO standards, and continuous improvement.' },
  { id: 'gec-sts',     subjectCode: 'GEC-STS',      subjectName: 'Science, Technology and Society',                    units: 3, yearLevel: '3rd', term: '1st Semester', description: 'Interrelationship of science, technology, and social development.' },
  { id: 'gec-aral',    subjectCode: 'GEC-ARAL',     subjectName: 'Panitikang Pilipino',                                units: 3, yearLevel: '3rd', term: '1st Semester', description: 'Pag-aaral ng panitikan at kulturang Pilipino.' },
  { id: 'ie-pc-3211',  subjectCode: 'IE-PC 3211',   subjectName: 'Production Planning and Control',                    units: 3, yearLevel: '3rd', term: '2nd Semester', description: 'Planning, scheduling, and control of manufacturing operations.' },
  { id: 'ie-pc-3212',  subjectCode: 'IE-PC 3212',   subjectName: 'Operations Research 2',                              units: 3, yearLevel: '3rd', term: '2nd Semester', description: 'Queuing theory, simulation, and dynamic programming.' },
  { id: 'ie-pc-3110',  subjectCode: 'IE-PC 3110',   subjectName: 'Facilities Planning and Design',                     units: 3, yearLevel: '3rd', term: '2nd Semester', description: 'Layout planning, material handling, and facility location.' },
  { id: 'ie-pc-3214',  subjectCode: 'IE-PC 3214',   subjectName: 'Supply Chain Management',                            units: 3, yearLevel: '3rd', term: '2nd Semester', description: 'Integrated supply chain design, logistics, and inventory management.' },
  { id: 'ie-ac-321',   subjectCode: 'IE-AC 321',    subjectName: 'Human Resource Management',                          units: 3, yearLevel: '3rd', term: '2nd Semester', description: 'HR planning, recruitment, training, and labor relations.' },
  { id: 'ie-ac-323',   subjectCode: 'IE-AC 323',    subjectName: 'Project Management',                                 units: 3, yearLevel: '3rd', term: '2nd Semester', description: 'Planning, executing, and controlling engineering projects.' },
  { id: 'gec-ethics',  subjectCode: 'GEC-ETHICS',   subjectName: 'Ethics',                                             units: 3, yearLevel: '3rd', term: '2nd Semester', description: 'Ethical theories and moral reasoning in professional practice.' },
  { id: 'gec-gg',      subjectCode: 'GEC-GG',       subjectName: 'Gender and Society',                                 units: 3, yearLevel: '3rd', term: '2nd Semester', description: 'Gender roles, equality, and social institutions.' },
  { id: 'ie-elec-1',   subjectCode: 'IE-ELEC 1',    subjectName: 'IE Elective 1',                                      units: 3, yearLevel: '3rd', term: '2nd Semester', description: 'Elective course for Industrial Engineering specialization.' },
  { id: 'ie-sum-on',   subjectCode: 'IE-SUM',       subjectName: 'On-the-Job Training',                                units: 6, yearLevel: '3rd', term: 'Summer',       description: 'Supervised practicum in an industrial or manufacturing setting.' },
  { id: 'ie-pc-4111',  subjectCode: 'IE-PC 4111',   subjectName: 'IE Capstone Project 1',                              units: 3, yearLevel: '4th', term: '1st Semester', description: 'Research proposal and design phase for the senior capstone project.' },
  { id: 'ie-pc-4112',  subjectCode: 'IE-PC 4112',   subjectName: 'Simulation and Modeling',                            units: 3, yearLevel: '4th', term: '1st Semester', description: 'System modeling and simulation using engineering software.' },
  { id: 'ie-pc-4113',  subjectCode: 'IE-PC 4113',   subjectName: 'Lean Manufacturing',                                 units: 3, yearLevel: '4th', term: '1st Semester', description: 'Lean principles, value stream mapping, and waste elimination.' },
  { id: 'ie-ac-411',   subjectCode: 'IE-AC 411',    subjectName: 'Strategic Management',                               units: 3, yearLevel: '4th', term: '1st Semester', description: 'Corporate strategy, competitive analysis, and business planning.' },
  { id: 'ie-ac-412',   subjectCode: 'IE-AC 412',    subjectName: 'Entrepreneurship',                                   units: 3, yearLevel: '4th', term: '1st Semester', description: 'Business creation, innovation, and entrepreneurial thinking.' },
  { id: 'ie-elec-2',   subjectCode: 'IE-ELEC 2',    subjectName: 'IE Elective 2',                                      units: 3, yearLevel: '4th', term: '1st Semester', description: 'Advanced elective course for Industrial Engineering specialization.' },
  { id: 'ie-elec-3',   subjectCode: 'IE-ELEC 3',    subjectName: 'IE Elective 3',                                      units: 3, yearLevel: '4th', term: '1st Semester', description: 'Advanced elective course for Industrial Engineering specialization.' },
  { id: 'ie-pc-4211',  subjectCode: 'IE-PC 4211',   subjectName: 'IE Capstone Project 2',                              units: 3, yearLevel: '4th', term: '2nd Semester', description: 'Implementation and final presentation of the senior capstone project.' },
  { id: 'ie-pc-4212',  subjectCode: 'IE-PC 4212',   subjectName: 'Integrated IE Systems',                              units: 3, yearLevel: '4th', term: '2nd Semester', description: 'Integration of IE tools and techniques in complex systems.' },
  { id: 'ie-ac-421',   subjectCode: 'IE-AC 421',    subjectName: 'Environmental Engineering for IE',                   units: 3, yearLevel: '4th', term: '2nd Semester', description: 'Environmental laws, pollution control, and sustainable engineering.' },
  { id: 'ie-ac-422',   subjectCode: 'IE-AC 422',    subjectName: 'IE Laws and Ethics',                                 units: 3, yearLevel: '4th', term: '2nd Semester', description: 'Legal and ethical considerations in the practice of IE.' },
  { id: 'ie-elec-4',   subjectCode: 'IE-ELEC 4',    subjectName: 'IE Elective 4',                                      units: 3, yearLevel: '4th', term: '2nd Semester', description: 'Advanced elective course for Industrial Engineering specialization.' },
  { id: 'ie-elec-5',   subjectCode: 'IE-ELEC 5',    subjectName: 'IE Elective 5',                                      units: 3, yearLevel: '4th', term: '2nd Semester', description: 'Advanced elective course for Industrial Engineering specialization.' },
];

export function buildStaticSubjects() {
  return SUBJECTS_DATA.map(s => {
    const fileId = PDF_MAP[s.id] ?? null;
    const syllabusURL = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null;
    return {
      ...s,
      syllabusURL,
      isAvailable: syllabusURL !== null,
      uploadedAt: null,
    };
  });
}
