# NX Plugin to generate CODEOWNERS file for GITHUB

## __@swapniltech0390/nx-codeowners:codeowners__
This library can be used to generate CODEOWNERS file for NX projects on GITHUB.

## Executor

# 1 Install pacakge 
```sh
npm i @swapniltech0390/nx-codeowners
```

# 2 Add in root project.json
#### <span style="color:green"> Properties to be added in executor</span>

1. **coreReviewers** : Default set of core reviewers if reviewer missing in project json.
2. **sources** : List of path to iterate through and find all application and libraries inside these folder to set reviewe in CODEOWNERS.

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
 


## Output : 
New CODEOWNERS file generated at root with reviewers mapping for respective applications & libraries 
