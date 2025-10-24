import { apiCall, API_ENDPOINTS } from '../utils/api/config';

class LookupService {
  // Fetch all departments
  async getDepartments() {
    try {
      const response = await apiCall(API_ENDPOINTS.DEPARTMENTS);
      console.log('Departments API response:', response);
      return response.data || response;
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw new Error('Failed to fetch departments');
    }
  }

  // Fetch all companies
  async getCompanies() {
    try {
      const response = await apiCall(API_ENDPOINTS.COMPANIES);
      return response.data || response;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw new Error('Failed to fetch companies');
    }
  }

  // Fetch all categories
  async getCategories() {
    try {
      const response = await apiCall(API_ENDPOINTS.CATEGORIES);
      return response.data || response;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  // Fetch all request types
  async getRequestTypes() {
    try {
      const response = await apiCall(API_ENDPOINTS.REQUEST_TYPES);
      return response.data || response;
    } catch (error) {
      console.error('Error fetching request types:', error);
      throw new Error('Failed to fetch request types');
    }
  }

  // Fetch all issue types
  async getIssueTypes() {
    try {
      const response = await apiCall(API_ENDPOINTS.ISSUE_TYPES);
      return response.data || response;
    } catch (error) {
      console.error('Error fetching issue types:', error);
      throw new Error('Failed to fetch issue types');
    }
  }

  // Fetch users by category ID
  async getUsersByCategory(categoryId) {
    try {
      if (!categoryId) {
        return [];
      }
      const response = await apiCall(`${API_ENDPOINTS.USERS_BY_CATEGORY}/${categoryId}/users`);
      console.log('Users API response for category', categoryId, ':', response);
      return response.data || response;
    } catch (error) {
      console.error('Error fetching users by category:', error);
      throw new Error('Failed to fetch users for selected category');
    }
  }

  // Fetch all lookup data at once
  async getAllLookupData() {
    try {
      const [departments, companies, categories, requestTypes, issueTypes] = await Promise.all([
        this.getDepartments(),
        this.getCompanies(),
        this.getCategories(),
        this.getRequestTypes(),
        this.getIssueTypes()
      ]);

      const result = {
        departments: Array.isArray(departments) ? departments : [],
        companies: Array.isArray(companies) ? companies : [],
        categories: Array.isArray(categories) ? categories : [],
        requestTypes: Array.isArray(requestTypes) ? requestTypes : [],
        issueTypes: Array.isArray(issueTypes) ? issueTypes : []
      };

      console.log('Final lookup data structure:', result);
      return result;
    } catch (error) {
      console.error('Error fetching lookup data:', error);
      throw new Error('Failed to fetch lookup data');
    }
  }
}

const lookupService = new LookupService();
export default lookupService;