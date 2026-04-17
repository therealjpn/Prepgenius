import type { Metadata } from 'next';
import { LeaderboardClient } from './LeaderboardClient';

export const metadata: Metadata = {
  title: 'Weekly Leaderboard — Top WAEC & NECO Students',
  description: 'See the top-performing students this week on PrepGenius. Top 3 win airtime rewards! Compete with thousands of Nigerian students preparing for WAEC and NECO exams.',
  keywords: ['PrepGenius leaderboard', 'WAEC exam rankings', 'Nigerian student leaderboard', 'exam prep competition'],
};

export default function LeaderboardPage() {
  return <LeaderboardClient />;
}
