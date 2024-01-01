import path = require('path');
import { CodeownersExecutorSchema } from './schema';
import {
  PathLike,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync
} from 'fs';


export default async function runExecutor(options: CodeownersExecutorSchema) {
  console.log('Executor ran for Codeowners');
const pathSources = options.sources;
const coreReviewers = options.coreReviewers;
let codeOwnersObject = '';
let codeOwnersJSON = {};

try {
  // Setting default rules for codeowners file access at all level
  codeOwnersJSON['*'] = coreReviewers;
  // Iterate through all path sources
  // Fetch reviewers list from each project json
  pathSources.forEach((pathSource) => {
    const codeOwnersSetForApplications = addCodeOwners(
      `./${pathSource}`,
      coreReviewers
    );
    codeOwnersJSON = { ...codeOwnersJSON, ...codeOwnersSetForApplications };
  });

  // Iterating through set of application and reiewers
  // And building object for codeowners files
  for (const key in codeOwnersJSON) {
    const val = codeOwnersJSON[key];
    codeOwnersObject += `${key} ${val.join(' ')}\n`;
  }
  // Writing CODEOWNERS file with all details present in project.jsons
  writeFileSync(`CODEOWNERS`, codeOwnersObject);
} catch (e) {
  console.error(e);
}

  return {
    success: true,
  };
}

/**
 *
 * @param folderPath - Path where applications are placed to get the reviewer list
 * @param coreReviewers - List of core Reviewers set as default reviewer if reviewers missing in project json
 * @returns - Return list of application and reviewers fetched from project json
 */
const addCodeOwners = (pathSource: PathLike, coreReviewers: string[] = []) => {
  const fileList = getFileNames(pathSource);
  const applicationCodeOwners = {};
  // Fetching reviewers from the project json of respective applications or libraries
  const listOfProjectJSON = fileList.filter((filePath) =>
    filePath.includes('project.json')
  );

  listOfProjectJSON.forEach((filePath) => {
    const fileLocation = filePath.replace(/\\/g, '/');
    if (fileLocation.includes('src/assets')) {
      console.log(
        `Skipping "${filePath}" since it is inside a src/asset folder`
      );
    }
    const content = readFileSync(fileLocation, { encoding: 'utf8', flag: 'r' });
    const applicationReviewers = JSON.parse(content)['reviewers'];
    applicationCodeOwners[fileLocation.split('/project.json')[0]] =
      Array.isArray(applicationReviewers) && applicationReviewers.length > 0
        ? applicationReviewers
        : coreReviewers;
  });
  return applicationCodeOwners;
};

/**
 *
 * @param directory - Path inside the application object to fetch project json files
 * @param fileNames - Array of absolute path of filenames
 * @returns - Return name of filePaths
 */
const getFileNames = (pathSource: PathLike, fileNames: string[] = []) => {
  const files = readdirSync(pathSource);
  files
    .filter((file) => !file.includes('node_modules'))
    .forEach((file) => {
      const filePath = path.join(pathSource.toString(), file);
      const stat = statSync(filePath);
      if (stat.isDirectory() && !file.includes('node_modules')) {
        getFileNames(filePath, fileNames);
      } else {
        fileNames.push(filePath);
      }
    });
  return fileNames;
};

