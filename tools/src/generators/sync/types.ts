export type NxReviewers = {
  rules: Rules[]
}

export type NxProjectReviewers = {
  rules: PathRules[]
}

export type Rules = PathRules | TagRule | ProjectRule

type BaseRule = {
  comment?: string,
  reviewers: string[]
}
export type PathRules = BaseRule & {
  paths: string[]
}

export type TagRule = BaseRule & {
  tags: string[]
}

export type ProjectRule = BaseRule & {
  projectNames: string[]
}

