export interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  blog: string | null;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  html_url: string;
  social_preview_image_url: string | null;
  stargazers_count: number;
  fork: boolean;
  updated_at: string;
  owner_login: string;
}

export class GitHubApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'GitHubApiError';
    this.status = status;
  }
}

const GITHUB_API_HEADERS = (pat: string): HeadersInit => ({
  Authorization: `Bearer ${pat}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
});

interface GitHubApiUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  blog: string | null;
}

interface GitHubApiRepo {
  name: string;
  description: string | null;
  language: string | null;
  html_url: string;
  stargazers_count: number;
  fork: boolean;
  updated_at: string;
}

// Internal type for raw GraphQL repository nodes
interface GraphQLRepoNode {
  name: string;
  description: string | null;
  primaryLanguage: { name: string } | null;
  url: string;
  openGraphImageUrl: string;
  stargazerCount: number;
  isFork: boolean;
  updatedAt: string;
  owner: { login: string };
}

export async function fetchUserProfile(
  username: string,
  pat: string,
): Promise<GitHubUser> {
  const response = await fetch(`https://api.github.com/users/${username}`, {
    headers: GITHUB_API_HEADERS(pat),
  });

  if (!response.ok) {
    throw new GitHubApiError(
      `GitHub API error fetching user profile: HTTP ${response.status}`,
      response.status,
    );
  }

  const data = (await response.json()) as GitHubApiUser;

  return {
    login: data.login,
    name: data.name,
    bio: data.bio,
    avatar_url: data.avatar_url,
    html_url: data.html_url,
    blog: data.blog,
  };
}

export async function fetchUserRepos(
  username: string,
  pat: string,
  limit: number = 12,
): Promise<GitHubRepo[]> {
  const response = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=100&type=public`,
    {
      headers: GITHUB_API_HEADERS(pat),
    },
  );

  if (!response.ok) {
    throw new GitHubApiError(
      `GitHub API error fetching repositories: HTTP ${response.status}`,
      response.status,
    );
  }

  const data = (await response.json()) as GitHubApiRepo[];

  const portfolioRepoName = `${username}.github.io`;

  return data
    .filter((repo) => !repo.fork && repo.name !== portfolioRepoName)
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    )
    .slice(0, limit)
    .map((repo) => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      html_url: repo.html_url,
      social_preview_image_url: null,
      stargazers_count: repo.stargazers_count,
      fork: repo.fork,
      updated_at: repo.updated_at,
      owner_login: username,
    }));
}

export async function fetchUserReposGraphQL(
  username: string,
  pat: string,
  limit: number = 12,
): Promise<GitHubRepo[]> {
  const query = `
    query GetUserRepos($login: String!, $first: Int!) {
      user(login: $login) {
        repositories(first: $first, orderBy: {field: UPDATED_AT, direction: DESC}, privacy: PUBLIC) {
          nodes {
            name
            description
            primaryLanguage { name }
            url
            openGraphImageUrl
            stargazerCount
            isFork
            updatedAt
            owner { login }
          }
        }
      }
    }
  `;

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${pat}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables: { login: username, first: 100 } }),
  });

  if (!response.ok) {
    throw new GitHubApiError(
      `GitHub GraphQL API error fetching repositories: HTTP ${response.status}`,
      response.status,
    );
  }

  const json = (await response.json()) as {
    data?: { user: { repositories: { nodes: GraphQLRepoNode[] } } };
    errors?: { message: string }[];
  };

  if (json.errors?.length) {
    throw new GitHubApiError(
      `GitHub GraphQL error: ${json.errors[0].message}`,
      200,
    );
  }

  const portfolioRepoName = `${username}.github.io`;
  const nodes = json.data!.user.repositories.nodes;

  // Exclude forks and the portfolio site itself; keep both owned and collaborator
  // repos so the caller can split them by owner_login.
  return nodes
    .filter((node) => !node.isFork && node.name !== portfolioRepoName)
    .map((node) => ({
      name: node.name,
      description: node.description,
      language: node.primaryLanguage?.name ?? null,
      html_url: node.url,
      social_preview_image_url: node.openGraphImageUrl || null,
      stargazers_count: node.stargazerCount,
      fork: node.isFork,
      updated_at: node.updatedAt,
      owner_login: node.owner.login,
    }));
}
