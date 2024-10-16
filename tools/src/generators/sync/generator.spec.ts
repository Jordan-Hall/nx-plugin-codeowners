import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { ProjectGraph, Tree, writeJson } from '@nx/devkit';

import { syncGenerator } from './generator';

let projectGraph: ProjectGraph;

jest.mock('@nx/devkit', () => ({
  ...jest.requireActual('@nx/devkit'),
  createProjectGraphAsync: jest.fn(() => Promise.resolve(projectGraph)),
}));

describe('codeowner-sync generator', () => {
  let tree: Tree;

  function addProject(
    name: string,
    dependencies: string[] = [],
    tags: string[] = [],
    root: string = `packages/${name}`
  ) {
    projectGraph.nodes[name] = {
      name,
      type: 'lib',
      data: { root, tags },
    };
    projectGraph.dependencies[name] = dependencies.map(dep => ({
      type: 'static',
      source: name,
      target: dep,
    }));

    writeJson(tree, `${root}/package.json`, {
      name,
      version: '0.0.0',
      dependencies: dependencies.reduce((acc, dep) => ({ ...acc, [dep]: '0.0.0' }), {}),
    });
  }

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
    projectGraph = {
      nodes: {},
      dependencies: {},
    };

    // Initialize the Nx configuration
    writeJson(tree, 'nx.json', {
      reviewers: {
        rules: []
      }
    });

    // Create default TypeScript configuration
    writeJson(tree, 'tsconfig.json', {
      compilerOptions: {
        composite: true,
      },
    });

    // Add projects to the graph
    addProject('a', [], ['frontend']);
    addProject('b', ['a'], ['backend']);
  });

  it('should successfully sync CODEOWNERS file', async () => {
    // Define mock rules for reviewers
    const reviewers = {
      rules: [
        {
          projectNames: ['a'],
          reviewers: ['@userA'],
          comment: 'Project A rules',
          paths: ['src/a/**'],
        },
        {
          projectNames: ['b'],
          reviewers: ['@userB'],
          comment: 'Project B rules',
          paths: ['src/b/**'],
        },
      ],
    };

    // Write the mock reviewers to nx.json
    writeJson(tree, 'nx.json', {
      reviewers,
    });

    // Run the generator
    await syncGenerator(tree);

    // Verify the CODEOWNERS file output
    const codeOwnersContent = tree.read('./CODEOWNERS', 'utf-8');
    expect(codeOwnersContent).toContain('# Project A rules\n');
    expect(codeOwnersContent).toContain('src/a/** @userA');
    expect(codeOwnersContent).toContain('# Project B rules\n');
    expect(codeOwnersContent).toContain('src/b/** @userB');
  });

  it('should handle multiple path rules for a project', async () => {
    // Define mock rules for reviewers
    const reviewers = {
      rules: [
        {
          projectNames: ['a'],
          reviewers: ['@userA'],
          comment: 'Project A rules',
          paths: ['src/a/**', 'docs/**'],
        },
      ],
    };

    // Write the mock reviewers to nx.json
    writeJson(tree, 'nx.json', {
      reviewers,
    });

    // Run the generator
    await syncGenerator(tree);

    // Verify the CODEOWNERS file output
    const codeOwnersContent = tree.read('./CODEOWNERS', 'utf-8');
    expect(codeOwnersContent).toContain('# Project A rules\n');
    expect(codeOwnersContent).toContain('src/a/** @userA');
    expect(codeOwnersContent).toContain('docs/** @userA');
  });

  it('should correctly map project rules to path rules', async () => {
    // Add a project with a specific rule
    const reviewers = {
      rules: [
        {
          projectNames: ['*'],
          reviewers: ['@globalUser'],
          comment: 'Global rules',
          paths: ['**'],
        },
      ],
    };

    // Write the mock reviewers to nx.json
    writeJson(tree, 'nx.json', {
      reviewers,
    });

    // Run the generator
    await syncGenerator(tree);

    // Verify the CODEOWNERS file output
    const codeOwnersContent = tree.read('./CODEOWNERS', 'utf-8');
    expect(codeOwnersContent).toContain('# Global rules\n');
    expect(codeOwnersContent).toContain('** @globalUser');
  });
});
