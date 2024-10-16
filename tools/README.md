# NX Plugin to generate CODEOWNERS file for GITHUB

## __@swapniltech0390/nx-codeowners:codeowners__

This library can be used to generate CODEOWNERS file for NX projects on GITHUB.

## Executor

### 1 Install pacakge

```sh
npm i @swapniltech0390/nx-codeowners
```

## How to setup and nx sync

### Update nx.json

First enable the plugin for sync in the nx.json

```json
"sync": {
    "globalGenerators": ["@swapniltech0390/nx-codeowners:sync"]
}
```

### configuraton options

## Options for `nx,json` and `project.json`

| Type                | Property       | Description                                                  |
|---------------------|----------------|--------------------------------------------------------------|
| `nx.json`           | `rules`        | An array of `Rules`, which can include `PathRules`, `TagRule`, or `ProjectRule`. |
| `project.json`      | `rules`        | An array of `PathRules` specifically for project-level reviewers. |

### Wildcard and Regex Support

- Wildcards (`*`) can be used in the `paths`, `projectNames`, and `tags` properties to match anything before or after.
- Standard regex is also supported for more complex matching of project names and tags.

### Examples

#### Example of `nx.json`

```json
{
    "reviewers": {
        "rules": [
            {
                "comment": "General rules for all projects",
                "reviewers": ["@user1", "@user2"],
                "paths": ["src/**"]
            },
            {
                "comment": "Rules for tagging",
                "reviewers": ["@tagReviewer"],
                "tags": ["feature.*", "bug"]
            },
            {
                "comment": "Project specific rules",
                "reviewers": ["@projectReviewer"],
                "projectNames": ["projectA", "projectB.*"]
            },
            {
                "comment": "Regex matching for specific projects",
                "reviewers": ["@regexReviewer"],
                "projectNames": ["/^project[12]$/"]
            }
        ]
    }
}
```

#### Example of `project.json`

```json
{
    "reviewers": {
        "rules": [
            {
                "comment": "Specific rules for Project A",
                "reviewers": ["@projectAReviewer"],
                "paths": ["apps/projectA/src/**"]  // Matches all files in the projectA source directory
            },
            {
                "comment": "Specific rules for Project B",
                "reviewers": ["@projectBReviewer"],
                "paths": ["apps/projectB/src/**", "apps/projectB/tests/**"]  // Matches both source and test files in projectB
            }
        ]
    }
};
```

## How to run as the excutor

### 2 Add in root project.json

#### <span style="color:green"> Properties to be added in executor</span>

1. __coreReviewers__ : Default set of core reviewers if reviewer missing in project json.
2. __sources__ : List of path to iterate through and find all application and libraries inside these folder to set reviewe in CODEOWNERS.

```javascript
"codeowners": {
    "executor": "@swapniltech0390/nx-codeowners:codeowners",
    "options": {
        "coreReviewers": [
        "@github_id","@github_id" // List of Github ID for review of application or library
        ],
        "sources": ["apps","libs"] // List of path where application / Libraries are placed from root
    }
}
```

# 3 Add reviewers in project.json for Application or Libraries

### <span style="color:red">__NOTE__</span> reviewers should be valid github user ID or Group Name

```javascript
{
"name": "appName",
 // ...
"tags": [],
"reviewers": [
"@github_id","@github_id" // List of Github ID for review of application / library
]
}

```

# 4 Run the executor from root to generate CODEOWNERS

```sh
nx run <ProjectName>:codeowners
```

## Output

New CODEOWNERS file generated at root with reviewers mapping for respective applications & libraries
