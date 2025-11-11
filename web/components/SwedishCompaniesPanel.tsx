'use client';

import { useState } from 'react';
import { SWEDISH_LEVER_COMPANIES } from '@/lib/config/companies';

export default function SwedishCompaniesPanel() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [filters, setFilters] = useState({
    aiOnly: true,
    stockholmOnly: true
  });

  const handleScrape = async (companyId?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(companyId && { company: companyId }),
        aiOnly: filters.aiOnly.toString(),
        stockholmOnly: filters.stockholmOnly.toString()
      });

      const response = await fetch(`/api/scrape/swedish-companies?${params}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Scraping failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Swedish AI/ML Companies</h2>
      
      <div className="flex gap-4 items-center">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.aiOnly}
            onChange={(e) => setFilters(prev => ({ ...prev, aiOnly: e.target.checked }))}
          />
          AI/ML Only
        </label>
        
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.stockholmOnly}
            onChange={(e) => setFilters(prev => ({ ...prev, stockholmOnly: e.target.checked }))}
          />
          Stockholm Only
        </label>

        <button
          onClick={() => handleScrape()}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? 'Scraping...' : 'Scrape All Companies'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SWEDISH_LEVER_COMPANIES.map(company => (
          <div key={company.id} className="border rounded-lg p-4 space-y-2">
            <h3 className="font-bold text-lg">{company.name}</h3>
            <p className="text-sm text-gray-600">{company.description}</p>
            <div className="flex flex-wrap gap-2">
              {company.focus.map(focus => (
                <span key={focus} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                  {focus}
                </span>
              ))}
            </div>
            <button
              onClick={() => handleScrape(company.id)}
              disabled={loading}
              className="w-full px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
            >
              Scrape {company.name}
            </button>
          </div>
        ))}
      </div>

      {results && (
        <div className="mt-6 border rounded-lg p-4 bg-gray-50">
          <h3 className="font-bold mb-2">Results</h3>
          <p>Total Jobs Found: {results.totalJobs}</p>
          <p>Successful: {results.successfulScrapes}/{results.totalCompanies}</p>
          
          <div className="mt-4 space-y-2">
            {results.results?.map((result: any) => (
              <div key={result.companyId} className="p-2 bg-white rounded">
                <strong>{result.company}:</strong> {result.jobCount} jobs
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

