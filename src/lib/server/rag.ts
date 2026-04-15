import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';

export interface FileInfo {
  path: string;
  name: string;
  size: number;
  type: 'file' | 'dir';
}

export interface ProjectIndex {
  projectId: string;
  files: FileInfo[];
  lastIndexed: string;
  totalSize: number;
  fileCount: number;
}

const projectIndexes = new Map<string, ProjectIndex>();

export async function indexProjectFolder(projectId: string, folderPath: string): Promise<ProjectIndex> {
  const files: FileInfo[] = [];
  let totalSize = 0;
  
  async function scanDir(dir: string) {
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === '__pycache__') continue;
        
        if (entry.isDirectory()) {
          await scanDir(fullPath);
        } else if (entry.isFile()) {
          const stats = await stat(fullPath);
          if (stats.size < 1024 * 1024) {
            files.push({
              path: fullPath,
              name: entry.name,
              size: stats.size,
              type: 'file'
            });
            totalSize += stats.size;
          }
        }
      }
    } catch {
    }
  }
  
  await scanDir(folderPath);
  
  const index: ProjectIndex = {
    projectId,
    files,
    lastIndexed: new Date().toISOString(),
    totalSize,
    fileCount: files.length
  };
  
  projectIndexes.set(projectId, index);
  return index;
}

export async function getProjectIndex(projectId: string): Promise<ProjectIndex | null> {
  return projectIndexes.get(projectId) || null;
}

export async function searchFiles(projectId: string, query: string): Promise<string[]> {
  const index = projectIndexes.get(projectId);
  if (!index) return [];
  
  const results: string[] = [];
  const queryLower = query.toLowerCase();
  
  for (const file of index.files) {
    if (file.name.toLowerCase().includes(queryLower)) {
      results.push(file.path);
    }
  }
  
  return results.slice(0, 10);
}

export async function readProjectFile(filePath: string, maxChars: number = 5000): Promise<string> {
  try {
    const content = await readFile(filePath, 'utf-8');
    return content.slice(0, maxChars);
  } catch {
    return '';
  }
}

export function getSupportedExtensions(): string[] {
  return [
    '.js', '.ts', '.svelte', '.vue', '.jsx', '.tsx',
    '.py', '.rb', '.go', '.rs', '.java', '.cpp', '.c', '.h',
    '.html', '.css', '.scss', '.less',
    '.json', '.yaml', '.yml', '.toml', '.md',
    '.sh', '.bash', '.zsh',
    '.sql', '.graphql'
  ];
}