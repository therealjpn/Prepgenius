import type { Metadata } from 'next';
import { SubjectsClient } from './SubjectsClient';

export const metadata: Metadata = {
  title: 'WAEC & NECO Subjects — Practice Past Questions',
  description: 'Choose from 8+ WAEC and NECO SSCE subjects: Mathematics, English Language, Biology, Chemistry, Physics, Economics, Government. Over 20,000 past questions available.',
  keywords: ['WAEC subjects', 'NECO subjects', 'SSCE subjects', 'WAEC Mathematics', 'WAEC English', 'WAEC Biology', 'WAEC Chemistry', 'WAEC Physics'],
};

export default function SubjectsPage() {
  return <SubjectsClient />;
}
