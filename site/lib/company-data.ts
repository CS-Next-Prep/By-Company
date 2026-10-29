/**
 * Client-side loader for the full companies.json dataset.
 * The file is large, so it is fetched lazily and cached for the session. A failed
 * request is not cached: the next call retries instead of replaying the rejection.
 */

export interface CompanyDataQuestion {
  id: number;
  title: string;
  difficulty: string;
  frequency: number;
  leetcode_url: string;
}

export interface CompanyDataEntry {
  slug: string;
  displayName: string;
  logo: string | null;
  questionCount: number;
  questions: CompanyDataQuestion[];
}

export interface CompaniesDataResponse {
  companies: CompanyDataEntry[];
}

export type CompanyDataFetch = (url: string) => Promise<{
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}>;

const DATA_URL = '/data/companies.json';

/** Return a loader that fetches companies.json at most once per successful session. */
export function createCompanyDataLoader(fetchImpl: CompanyDataFetch) {
  let dataCache: Promise<CompaniesDataResponse> | null = null;

  return function loadCompanyData(): Promise<CompaniesDataResponse> {
    if (!dataCache) {
      dataCache = fetchImpl(DATA_URL)
        .then(response => {
          if (!response.ok) throw new Error(`Company data request failed: ${response.status}`);
          return response.json() as Promise<CompaniesDataResponse>;
        })
        .catch(error => {
          dataCache = null;
          throw error;
        });
    }
    return dataCache;
  };
}
