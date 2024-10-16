import {
  createProjectGraphAsync,
  readNxJson,
  Tree,
} from '@nx/devkit';
import * as path from 'path';
import type { NxProjectReviewers, NxReviewers, PathRules, ProjectRule, Rules, TagRule } from './types';

export function isProjectRule(rule: Rules): rule is ProjectRule {
  return (rule as ProjectRule).projectNames !== undefined;
}

export function isTagsRule(rule: Rules): rule is TagRule {
  return (rule as TagRule).tags !== undefined;
}

export function isPathRule(rule: Rules): rule is PathRules {
  return (rule as PathRules).paths !== undefined;
}

function formatCodeOwners(rules: PathRules[]): string {
  // Extract the comment if available
  const comment = rules[0]?.comment ? `# ${rules[0].comment}\n` : '';

  // Map each rule to the appropriate string format
  const formattedRules = rules.map(rule => {
    const paths = rule.paths.join(' ');
    const reviewers = rule.reviewers.join(', ');
    return `${paths} ${reviewers}`;
  }).join('\n');

  return comment + formattedRules;
}

// Function to convert a string with `*` into a regular expression
function wildcardToRegex(pattern: string): RegExp {
  const escapedPattern = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&'); 
  const regexPattern = escapedPattern.replace(/\*/g, '.*');
  return new RegExp(`^${regexPattern}$`);
}

type SplitRule = { pathRules: PathRules[], otherRles: Array<TagRule | ProjectRule> }

export async function syncGenerator(tree: Tree) {
  const codeOwnerRules: PathRules[] = [];
  const nxJson = readNxJson(tree)

  // First, read the NX Json for the reviewers.
  const reviewers: NxReviewers = nxJson['reviewers']

  // Split rules into path rules and others (tag and project rules)
  const { pathRules, otherRles } = reviewers.rules.reduce((prev: SplitRule, rule) => {
    if (isPathRule(rule)) {
      prev.pathRules.push(rule)
    } else {
      prev.otherRles.push(rule)
    }
    return prev
  }, { pathRules: [], otherRles: [] } as SplitRule)

  // Add paths to our codeOwnerRules
  codeOwnerRules.push(...pathRules)

  // Create the project graph
  const projectGraph = await createProjectGraphAsync();

  // Convert project and tag rules into path-based rules
  const projects = Object.values(projectGraph.nodes).map((node) => node.data);

  // Map rule index to PathRules
  const mappedRules = new Map<number, PathRules>();

  projects.forEach(project => {
    // Check for project-specific reviewers
    const projectRule: NxProjectReviewers | undefined = project['reviewers'];
    if (projectRule) {
      codeOwnerRules.push(...projectRule.rules.map(rule => ({
        comment: rule.comment,
        reviewers: rule.reviewers,
        paths: rule.paths.map(rPath => path.join(project.root, rPath))
      }) as PathRules));
    }

    // Loop through the other rules and add to the map
    otherRles.forEach((rule, index) => {
      // Get the existing PathRules from the map or create a new one
      const existingRule = mappedRules.get(index) || { paths: [], reviewers: rule.reviewers, comment: rule.comment };

      if (isProjectRule(rule)) {
        // Convert project names to regular expressions and check if project matches
        const matches = rule.projectNames.some(projectName => {
          const regex = wildcardToRegex(projectName);
          return regex.test(project.name);
        });

        if (matches) {
          // Add the project's root path to the existing PathRules
          existingRule.paths.push(project.root);
          mappedRules.set(index, existingRule);
        }
      } else if (isTagsRule(rule)) {
        // Check tags using the same regex logic
        if (project.tags) {
          const matches = rule.tags.some(tag => {
            const regex = wildcardToRegex(tag);
            return project.tags.some(projectTag => regex.test(projectTag));
          });

          if (matches) {
            // Add the project's root path to the existing PathRules
            existingRule.paths.push(project.root);
            mappedRules.set(index, existingRule);
          }
        }
      }
    });
  });

  // Add the mapped rules to the codeOwnerRules
  codeOwnerRules.push(...Array.from(mappedRules.values()));

  // now lets map this to codeowner file
  tree.write('./CODEOWNERS', formatCodeOwners(codeOwnerRules))
}

export default syncGenerator;
