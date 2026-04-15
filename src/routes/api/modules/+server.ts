import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface Module {
  name: string;
  description: string;
  category: string;
  stars: number;
  opensource: boolean;
}

const modules: Module[] = [
  { name: 'wondelai/skills', description: 'Cross-platform agent skills', category: 'Skills', stars: 380, opensource: true },
  { name: 'hermes-workspace', description: 'Web UI for Hermes', category: 'Tools', stars: 500, opensource: true },
  { name: 'mission-control', description: 'Agent fleet management', category: 'Tools', stars: 3700, opensource: true },
  { name: 'hindsight', description: 'Long-term memory layer', category: 'Memory', stars: 1200, opensource: true },
  { name: 'hermes-docker', description: 'Docker image', category: 'Deployment', stars: 250, opensource: true },
  { name: 'litprog-skill', description: 'Literate programming skill', category: 'Skills', stars: 75, opensource: true },
  { name: 'cybersecurity-skills', description: 'MITRE ATT&CK skills', category: 'Skills', stars: 4000, opensource: true },
  { name: 'pydantic-ai-skills', description: 'Type-safe schema validation', category: 'Skills', stars: 320, opensource: true },
  { name: 'Anthropic-Cybersecurity-Skills', description: '753+ security skills', category: 'Skills', stars: 4000, opensource: true },
  { name: 'chainlink-agent-skills', description: 'Oracle network integration', category: 'Skills', stars: 850, opensource: true },
  { name: 'hermes-dojo', description: 'Self-improvement system', category: 'Skills', stars: 180, opensource: true },
  { name: 'hermes-incident-commander', description: 'Autonomous SRE agent', category: 'Skills', stars: 220, opensource: true },
];

export const GET: RequestHandler = async ({ url }) => {
  const filter = url.searchParams.get('filter') || 'all';
  const category = url.searchParams.get('category');
  
  let filtered = modules;
  
  if (filter === 'opensource') {
    filtered = filtered.filter(m => m.opensource);
  }
  
  if (category) {
    filtered = filtered.filter(m => m.category === category);
  }
  
  return json({
    modules: filtered,
    categories: [...new Set(modules.map(m => m.category))]
  });
};