'use client';

import { useState } from 'react';
import { SOPStepContent, SOPStepActions } from './SOPStep';

export interface ProjectConfig {
  projectName: string;
}

export interface ProjectSetupFormProps {
  onComplete: (config: ProjectConfig) => void;
  initialConfig?: ProjectConfig;
  isLoading?: boolean;
}

export function ProjectSetupForm({
  onComplete,
  initialConfig,
  isLoading = false,
}: ProjectSetupFormProps) {
  const [projectName, setProjectName] = useState(
    initialConfig?.projectName || ''
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    } else if (projectName.trim().length < 3) {
      newErrors.projectName = 'Project name must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(projectName.trim())) {
      newErrors.projectName = 'Project name can only contain letters, numbers, hyphens, and underscores';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const config: ProjectConfig = {
      projectName: projectName.trim(),
    };

    onComplete(config);
  };

  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProjectName(value);

    // Clear error when user starts typing
    if (errors.projectName && value.trim()) {
      setErrors(prev => ({ ...prev, projectName: '' }));
    }
  };

  return (
    <SOPStepContent>
      <div className="space-y-6">
        <div>
          <p className="text-gray-700 mb-4">
            First, give your content audit project a name. This will create a dedicated workspace
            for your analysis files and results.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Project Structure</h4>
            <p className="text-sm text-blue-700">
              Your project will create the following structure:
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• <code className="bg-blue-100 px-1 rounded">projects/{projectName || 'your-project'}/</code> - Project folder</li>
              <li>• <code className="bg-blue-100 px-1 rounded">pages.csv</code> - Your Ahrefs export</li>
              <li>• <code className="bg-blue-100 px-1 rounded">__cache/</code> - Published date cache</li>
              <li>• <code className="bg-blue-100 px-1 rounded">out/</code> - Analysis results</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="projectName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Project Name
            </label>
            <input
              type="text"
              id="projectName"
              value={projectName}
              onChange={handleProjectNameChange}
              placeholder="e.g., competitor_analysis, site_audit_2024"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.projectName
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.projectName && (
              <p className="mt-1 text-sm text-red-600">{errors.projectName}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Use letters, numbers, hyphens, and underscores only
            </p>
          </div>

          <SOPStepActions>
            <button
              type="submit"
              disabled={isLoading || !projectName.trim()}
              className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isLoading || !projectName.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              {isLoading ? 'Creating Project...' : 'Create Project'}
            </button>
          </SOPStepActions>
        </form>

        {projectName.trim() && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Preview:</strong> Your project folder will be created at{' '}
              <code className="bg-gray-200 px-1 rounded">
                projects/{projectName.trim()}/
              </code>
            </p>
          </div>
        )}
      </div>
    </SOPStepContent>
  );
}
